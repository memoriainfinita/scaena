// DXF background: parsed with dxf-parser and drawn on a canvas as lines. Text is placed but not set in the original font.
import DxfParser from 'dxf-parser';
import { canvasToPng } from './png.ts';

type Pt = { x: number; y: number };
export type Prim =
  | { k: 'poly'; pts: Pt[]; closed: boolean }
  | { k: 'arc'; c: Pt; r: number; a0: number; a1: number }
  | { k: 'text'; at: Pt; text: string; h: number; rot: number; align: CanvasTextAlign; base: CanvasTextBaseline };

export interface ParsedDxf {
  prims: Prim[];
  /** Millimetres per drawing unit, from the header; 1 when it says nothing. */
  unitMm: number;
  bounds: { x0: number; y0: number; x1: number; y1: number };
}

export const MAX_PRIMS = 300_000;
const MAX_DEPTH = 8;
const CURVE_STEP = Math.PI / 18;
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
  layer?: string;
  visible?: boolean;
  inPaperSpace?: boolean;
  vertices?: (Pt & { bulge?: number })[];
  points?: Pt[];
  shape?: boolean;
  center?: Pt;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  majorAxisEndPoint?: Pt;
  axisRatio?: number;
  controlPoints?: Pt[];
  fitPoints?: Pt[];
  knotValues?: number[];
  degreeOfSplineCurve?: number;
  closed?: boolean;
  startPoint?: Pt;
  endPoint?: Pt;
  halign?: number;
  valign?: number;
  position?: Pt;
  attachmentPoint?: number;
  directionVector?: Pt;
  text?: string;
  textHeight?: number;
  height?: number;
  name?: string;
  block?: string;
  xScale?: number;
  yScale?: number;
  rotation?: number;
  columnCount?: number;
  rowCount?: number;
  columnSpacing?: number;
  rowSpacing?: number;
  extrusionDirection?: { z: number };
  extrusionDirectionZ?: number;
}

/** x' = a x + c y + e, y' = b x + d y + f */
type M = readonly [number, number, number, number, number, number];
const IDENTITY: M = [1, 0, 0, 1, 0, 0];
const at = (m: M, p: Pt): Pt => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] });
const mul = (m: M, n: M): M => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const translate = (x: number, y: number): M => [1, 0, 0, 1, x, y];
const det = (m: M) => m[0] * m[3] - m[1] * m[2];
const MIRROR_X: M = [-1, 0, 0, 1, 0, 0];
/** Entities drawn from the back of their plane (arcs, polylines, inserts) come mirrored in x. */
const facing = (m: M, e: Ent): M => ((e.extrusionDirection?.z ?? e.extrusionDirectionZ ?? 1) < 0 ? mul(m, MIRROR_X) : m);

/** A rotation and a uniform positive scale keep a circular arc circular. */
function similar(m: M): boolean {
  const s = Math.hypot(m[0], m[1]);
  return det(m) > 0 && Math.abs(m[0] - m[3]) < s * 1e-6 && Math.abs(m[1] + m[2]) < s * 1e-6;
}

const stepsFor = (sweep: number) => Math.max(2, Math.ceil(Math.abs(sweep) / CURVE_STEP));
const sweepOf = (a0: number, a1: number) => {
  let s = a1 - a0;
  while (s <= 1e-9) s += Math.PI * 2;
  return s;
};

function ellipsePoints(e: Ent): { pts: Pt[]; closed: boolean } {
  const c = e.center!;
  const major = e.majorAxisEndPoint!;
  const ratio = e.axisRatio ?? 1;
  const a0 = e.startAngle ?? 0;
  const sweep = sweepOf(a0, e.endAngle ?? Math.PI * 2);
  const closed = sweep > Math.PI * 2 - 1e-6;
  const n = stepsFor(sweep);
  const pts: Pt[] = [];
  for (let i = 0; i <= (closed ? n - 1 : n); i++) {
    const t = a0 + (sweep * i) / n;
    pts.push({ x: c.x + major.x * Math.cos(t) - major.y * ratio * Math.sin(t), y: c.y + major.y * Math.cos(t) + major.x * ratio * Math.sin(t) });
  }
  return { pts, closed };
}

/** Samples a B-spline with de Boor, ignoring weights; the fit points when it has no usable control points. */
function splinePoints(e: Ent): Pt[] {
  const ctrl = e.controlPoints ?? [];
  const knots = e.knotValues ?? [];
  const p = e.degreeOfSplineCurve ?? 3;
  if (ctrl.length <= p || knots.length < ctrl.length + p + 1) return e.fitPoints ?? ctrl;
  const lo = knots[p]!;
  const hi = knots[ctrl.length]!;
  const n = Math.min(400, (ctrl.length - p) * 12);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = lo + ((hi - lo) * i) / n;
    let k = p;
    while (k < ctrl.length - 1 && u >= knots[k + 1]!) k++;
    const d = ctrl.slice(k - p, k + 1).map((q) => ({ x: q.x, y: q.y }));
    for (let r = 1; r <= p; r++) {
      for (let j = p; j >= r; j--) {
        const left = knots[j + k - p]!;
        const span = knots[j + 1 + k - r]! - left;
        const w = span > 0 ? (u - left) / span : 0;
        d[j] = { x: (1 - w) * d[j - 1]!.x + w * d[j]!.x, y: (1 - w) * d[j - 1]!.y + w * d[j]!.y };
      }
    }
    pts.push(d[p]!);
  }
  return pts;
}

/** The vertices of a polyline with its bulges turned into short segments. */
function polylinePoints(vs: (Pt & { bulge?: number })[], closed: boolean): Pt[] {
  const out: Pt[] = [];
  const segments = closed ? vs.length : vs.length - 1;
  for (let i = 0; i < segments; i++) {
    const p = vs[i]!;
    const q = vs[(i + 1) % vs.length]!;
    out.push({ x: p.x, y: p.y });
    const b = p.bulge ?? 0;
    if (!b) continue;
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const off = (1 - b * b) / (4 * b);
    const c = { x: (p.x + q.x) / 2 - dy * off, y: (p.y + q.y) / 2 + dx * off };
    const r = Math.hypot(p.x - c.x, p.y - c.y);
    const a0 = Math.atan2(p.y - c.y, p.x - c.x);
    const sweep = 4 * Math.atan(b);
    const n = stepsFor(sweep);
    for (let j = 1; j < n; j++) {
      const a = a0 + (sweep * j) / n;
      out.push({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
    }
  }
  if (!closed && vs.length > 0) out.push({ x: vs[vs.length - 1]!.x, y: vs[vs.length - 1]!.y });
  return out;
}

const cleanText = (raw: string) =>
  raw
    .replace(/\\U\+([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\P/g, ' ')
    .replace(/\\~/g, ' ')
    .replace(/\\[LlOoKk]/g, '')
    .replace(/\\[ACcFfHhQqTtWwpS][^;]*;/g, '')
    .replace(/[{}]/g, '')
    .replace(/%%[cC]/g, 'ø')
    .replace(/%%[dD]/g, '°')
    .replace(/%%[pP]/g, '±')
    .replace(/%%[uUoOkK]/g, '')
    .trim();

function textPlacement(e: Ent): { anchor: Pt; rot: number; align: CanvasTextAlign; base: CanvasTextBaseline } {
  if (e.type === 'MTEXT') {
    const p = Math.max(1, e.attachmentPoint ?? 1) - 1;
    const rot = e.directionVector ? Math.atan2(e.directionVector.y, e.directionVector.x) : (e.rotation ?? 0);
    return { anchor: e.position!, rot, align: (['left', 'center', 'right'] as const)[p % 3]!, base: (['top', 'middle', 'alphabetic'] as const)[Math.floor(p / 3) % 3]! };
  }
  const h = e.halign ?? 0;
  const v = e.valign ?? 0;
  const aligned = (h === 1 || h === 2 || h === 4 || v > 0) && e.endPoint;
  const rot = ((e.rotation ?? 0) * Math.PI) / 180;
  if (!aligned) return { anchor: e.startPoint ?? e.position!, rot, align: 'left', base: 'alphabetic' };
  return { anchor: e.endPoint!, rot, align: h === 2 ? 'right' : h === 1 || h === 4 ? 'center' : 'left', base: h === 4 || v === 2 ? 'middle' : v === 3 ? 'top' : 'alphabetic' };
}

/** DXF before AutoCAD 2007 is in the code page of its header, later ones are UTF-8. */
export function decodeDxf(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    const page = /\$DWGCODEPAGE\s+3\s+ANSI_(\d+)/.exec(new TextDecoder('latin1').decode(bytes.subarray(0, 4096)))?.[1];
    try {
      return new TextDecoder(`windows-${page ?? 1252}`).decode(bytes);
    } catch {
      return new TextDecoder('windows-1252').decode(bytes);
    }
  }
}

export function parseDxf(text: string): ParsedDxf {
  let dxf;
  try {
    dxf = new DxfParser().parseSync(text);
  } catch (e) {
    throw new DxfError('parse', e instanceof Error ? e.message : String(e));
  }
  if (!dxf) throw new DxfError('parse', 'no data');
  const prims: Prim[] = [];
  const blocks = (dxf.blocks ?? {}) as Record<string, { entities?: Ent[]; position?: Pt }>;
  const layers = (dxf.tables as unknown as { layer?: { layers?: Record<string, { name: string; visible?: boolean; frozen?: boolean }> } } | undefined)?.layer?.layers ?? {};
  const hidden = new Set(
    Object.values(layers)
      .filter((l) => l.visible === false || l.frozen || l.name.toLowerCase() === 'defpoints')
      .map((l) => l.name),
  );
  const poly = (m: M, pts: Pt[], closed: boolean) => {
    // dxf-parser leaves an empty last vertex on some 3D faces.
    const good = pts.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (good.length > 1) prims.push({ k: 'poly', pts: good.map((p) => at(m, p)), closed });
  };
  const arc = (m: M, c: Pt, r: number, a0: number, a1: number) => {
    if (similar(m)) {
      const rot = Math.atan2(m[1], m[0]);
      prims.push({ k: 'arc', c: at(m, c), r: r * Math.hypot(m[0], m[1]), a0: a0 + rot, a1: a1 + rot });
      return;
    }
    const sweep = sweepOf(a0, a1);
    const n = stepsFor(sweep);
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) pts.push({ x: c.x + r * Math.cos(a0 + (sweep * i) / n), y: c.y + r * Math.sin(a0 + (sweep * i) / n) });
    poly(m, pts, false);
  };
  const insert = (e: Ent, m: M, name: string, active: Set<string>, depth: number) => {
    const block = blocks[name];
    if (!block?.entities || active.has(name) || depth >= MAX_DEPTH) return;
    const base = block.position ?? { x: 0, y: 0 };
    const rad = ((e.rotation ?? 0) * Math.PI) / 180;
    const place = mul(facing(m, e), mul(translate(e.position?.x ?? 0, e.position?.y ?? 0), [Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), 0, 0]));
    const body = mul([e.xScale ?? 1, 0, 0, e.yScale ?? 1, 0, 0], translate(-base.x, -base.y));
    const inner = new Set(active).add(name);
    for (let row = 0; row < Math.max(1, e.rowCount ?? 1); row++) {
      for (let col = 0; col < Math.max(1, e.columnCount ?? 1); col++) {
        walk(block.entities, mul(place, mul(translate(col * (e.columnSpacing ?? 0), row * (e.rowSpacing ?? 0)), body)), inner, depth + 1);
      }
    }
  };
  const walk = (ents: Ent[], m: M, active: Set<string>, depth: number) => {
    for (const e of ents) {
      if (prims.length > MAX_PRIMS) throw new DxfError('tooMany', String(prims.length));
      if (e.visible === false) continue;
      // What is on layer 0 inside a block takes the layer of the block, which has already been checked.
      if (e.layer && hidden.has(e.layer) && !(depth > 0 && e.layer === '0')) continue;
      if (e.type === 'LINE' && e.vertices) poly(m, e.vertices, false);
      else if ((e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && e.vertices) poly(facing(m, e), polylinePoints(e.vertices, !!e.shape), !!e.shape);
      else if (e.type === '3DFACE' && e.vertices) poly(m, e.vertices, true);
      else if (e.type === 'SOLID' && e.points?.length === 4) poly(facing(m, e), [e.points[0]!, e.points[1]!, e.points[3]!, e.points[2]!], true);
      else if (e.type === 'CIRCLE' && e.center && e.radius) arc(facing(m, e), e.center, e.radius, 0, Math.PI * 2);
      else if (e.type === 'ARC' && e.center && e.radius) arc(facing(m, e), e.center, e.radius, e.startAngle ?? 0, e.endAngle ?? 0);
      else if (e.type === 'ELLIPSE' && e.center && e.majorAxisEndPoint) {
        const { pts, closed } = ellipsePoints(e);
        poly(m, pts, closed);
      } else if (e.type === 'SPLINE') poly(m, splinePoints(e), !!e.closed);
      else if ((e.type === 'TEXT' || e.type === 'MTEXT') && (e.startPoint || e.position) && e.text) {
        const t = textPlacement(e);
        const f = facing(m, e);
        const dir = { x: f[0] * Math.cos(t.rot) + f[2] * Math.sin(t.rot), y: f[1] * Math.cos(t.rot) + f[3] * Math.sin(t.rot) };
        // A mirrored block would print its texts upside down; a plan has to be read.
        const upright = det(f) < 0 && dir.x < 0;
        const align = upright && t.align !== 'center' ? (t.align === 'left' ? 'right' : 'left') : t.align;
        const content = cleanText(e.text);
        if (content) prims.push({ k: 'text', at: at(f, t.anchor), text: content, h: (e.textHeight ?? e.height ?? 1) * Math.sqrt(Math.abs(det(f))), rot: Math.atan2(dir.y, dir.x) + (upright ? Math.PI : 0), align, base: t.base });
      } else if (e.type === 'INSERT' && e.name) insert(e, m, e.name, active, depth);
      else if (e.type === 'DIMENSION' && e.block && blocks[e.block]?.entities && !active.has(e.block) && depth < MAX_DEPTH) walk(blocks[e.block]!.entities!, m, new Set(active).add(e.block), depth + 1);
    }
  };
  const top = (dxf.entities ?? []) as Ent[];
  // The title block of a layout has its own coordinates; a drawing that only lives there is still drawn.
  const model = top.filter((e) => !e.inPaperSpace);
  walk(model.length > 0 ? model : top, IDENTITY, new Set(), 0);
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
      ctx.save();
      ctx.translate(X(p.at.x), Y(p.at.y));
      ctx.rotate(-p.rot);
      ctx.font = `${Math.max(6, p.h * k)}px sans-serif`;
      ctx.textAlign = p.align;
      ctx.textBaseline = p.base;
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
  }
  return { png: await canvasToPng(canvas), widthMm: w * d.unitMm, heightMm: h * d.unitMm };
}
