// DXF background: parsed with dxf-parser and drawn on a canvas as lines. Text is placed but not set in the original font.
import DxfParser from 'dxf-parser';
import { canvasToPng } from './png.ts';

type Pt = { x: number; y: number };
export type Prim = { k: 'poly'; pts: Pt[]; closed: boolean } | { k: 'arc'; c: Pt; r: number; a0: number; a1: number } | { k: 'text'; at: Pt; text: string; h: number };

export interface ParsedDxf {
  prims: Prim[];
  /** Millimetres per drawing unit, from the header; 1 when it says nothing. */
  unitMm: number;
  bounds: { x0: number; y0: number; x1: number; y1: number };
}

export const MAX_PRIMS = 300_000;
const UNITS_MM: Record<number, number> = { 1: 25.4, 2: 304.8, 3: 1609344, 4: 1, 5: 10, 6: 1000, 7: 1_000_000, 8: 0.0000254, 9: 0.0254, 10: 914.4, 11: 1e-7, 12: 1e-6, 13: 0.001, 14: 100, 15: 10_000, 16: 100_000, 17: 1e12 };

export class DxfError extends Error {
  constructor(
    readonly code: 'empty' | 'tooMany' | 'parse',
    message: string,
  ) {
    super(message);
  }
}

// dxf-parser has loose typing for entities; this is the part of it that is used.
interface Ent {
  type: string;
  vertices?: Pt[];
  shape?: boolean;
  center?: Pt;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  startPoint?: Pt;
  position?: Pt;
  text?: string;
  textHeight?: number;
  height?: number;
  name?: string;
  xScale?: number;
  yScale?: number;
  rotation?: number;
}

const rotate = (p: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
};

export function parseDxf(text: string): ParsedDxf {
  let dxf;
  try {
    dxf = new DxfParser().parseSync(text);
  } catch (e) {
    throw new DxfError('parse', e instanceof Error ? e.message : String(e));
  }
  if (!dxf) throw new DxfError('parse', 'no data');
  const prims: Prim[] = [];
  const blocks = (dxf.blocks ?? {}) as Record<string, { entities?: Ent[] }>;
  const walk = (ents: Ent[], tf: (p: Pt) => Pt, depth: number) => {
    for (const e of ents) {
      if (prims.length > MAX_PRIMS) throw new DxfError('tooMany', String(prims.length));
      if ((e.type === 'LINE' || e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && e.vertices && e.vertices.length > 1) {
        prims.push({ k: 'poly', pts: e.vertices.map((v) => tf({ x: v.x, y: v.y })), closed: !!e.shape });
      } else if (e.type === 'CIRCLE' && e.center && e.radius) {
        prims.push({ k: 'arc', c: tf(e.center), r: e.radius, a0: 0, a1: Math.PI * 2 });
      } else if (e.type === 'ARC' && e.center && e.radius) {
        prims.push({ k: 'arc', c: tf(e.center), r: e.radius, a0: e.startAngle ?? 0, a1: e.endAngle ?? 0 });
      } else if ((e.type === 'TEXT' || e.type === 'MTEXT') && (e.startPoint || e.position) && e.text) {
        prims.push({ k: 'text', at: tf((e.startPoint ?? e.position)!), text: e.text.replace(/\\P/g, ' ').replace(/\{|\}|\\[A-Za-z][^;]*;/g, ''), h: e.textHeight ?? e.height ?? 1 });
      } else if (e.type === 'INSERT' && e.name && depth < 3) {
        const block = blocks[e.name]?.entities;
        const at = e.position ?? { x: 0, y: 0 };
        const sx = e.xScale ?? 1;
        const sy = e.yScale ?? 1;
        const rot = e.rotation ?? 0;
        if (block) walk(block, (p) => tf({ x: rotate({ x: p.x * sx, y: p.y * sy }, rot).x + at.x, y: rotate({ x: p.x * sx, y: p.y * sy }, rot).y + at.y }), depth + 1);
      }
    }
  };
  walk((dxf.entities ?? []) as Ent[], (p) => p, 0);
  if (prims.length === 0) throw new DxfError('empty', 'nothing to draw');
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const grow = (x: number, y: number) => {
    b.x0 = Math.min(b.x0, x);
    b.y0 = Math.min(b.y0, y);
    b.x1 = Math.max(b.x1, x);
    b.y1 = Math.max(b.y1, y);
  };
  for (const p of prims) {
    if (p.k === 'poly') p.pts.forEach((q) => grow(q.x, q.y));
    else if (p.k === 'arc') {
      grow(p.c.x - p.r, p.c.y - p.r);
      grow(p.c.x + p.r, p.c.y + p.r);
    } else grow(p.at.x, p.at.y);
  }
  const units = Number((dxf.header as Record<string, unknown> | undefined)?.['$INSUNITS']);
  return { prims, unitMm: UNITS_MM[units] ?? 1, bounds: b };
}

/** Draws the drawing on a transparent canvas, dark lines, y flipped (DXF grows upwards). */
export async function renderDxf(d: ParsedDxf, maxPx = 3200): Promise<{ png: Uint8Array; widthMm: number; heightMm: number }> {
  const w = Math.max(1e-9, d.bounds.x1 - d.bounds.x0);
  const h = Math.max(1e-9, d.bounds.y1 - d.bounds.y0);
  const k = maxPx / Math.max(w, h);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(w * k));
  canvas.height = Math.max(1, Math.ceil(h * k));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d canvas');
  const X = (x: number) => (x - d.bounds.x0) * k;
  const Y = (y: number) => (d.bounds.y1 - y) * k;
  ctx.strokeStyle = '#222';
  ctx.fillStyle = '#222';
  ctx.lineWidth = Math.max(1, maxPx / 1600);
  for (const p of d.prims) {
    ctx.beginPath();
    if (p.k === 'poly') {
      p.pts.forEach((q, i) => (i === 0 ? ctx.moveTo(X(q.x), Y(q.y)) : ctx.lineTo(X(q.x), Y(q.y))));
      if (p.closed) ctx.closePath();
      ctx.stroke();
    } else if (p.k === 'arc') {
      // The y flip turns the angles around: a counter-clockwise arc becomes a clockwise one on the canvas.
      ctx.arc(X(p.c.x), Y(p.c.y), p.r * k, -p.a0, -p.a1, true);
      ctx.stroke();
    } else {
      ctx.font = `${Math.max(6, p.h * k)}px sans-serif`;
      ctx.fillText(p.text, X(p.at.x), Y(p.at.y));
    }
  }
  return { png: await canvasToPng(canvas), widthMm: w * d.unitMm, heightMm: h * d.unitMm };
}
