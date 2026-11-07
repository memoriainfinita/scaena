// Plan geometry: sizes, boxes, snapping and fitting. Everything in millimetres, y growing towards the audience.
import { itemById } from '../library/items.ts';
import type { PlanElement, Show } from '../model/schema.ts';

export interface Size {
  w: number;
  d: number;
}
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface Camera {
  x: number;
  y: number;
  /** Pixels per millimetre. */
  k: number;
}

export const MIN_K = 0.004;
export const MAX_K = 2;

/** The drawn size of an element: its own override, else the library item's, else 500 mm. */
export function elementSize(e: PlanElement): Size {
  const it = itemById(e.type.id);
  return { w: e.width ?? it?.size.w ?? 500, d: e.depth ?? it?.size.d ?? 500 };
}

/** The axis-aligned box that contains an element after its rotation. */
export function elementBox(e: PlanElement, size: Size = elementSize(e)): Box {
  const a = (e.rotation * Math.PI) / 180;
  const c = Math.abs(Math.cos(a));
  const s = Math.abs(Math.sin(a));
  const hw = (size.w * c + size.d * s) / 2;
  const hd = (size.w * s + size.d * c) / 2;
  return { x0: e.x - hw, y0: e.y - hd, x1: e.x + hw, y1: e.y + hd };
}

export function unionBox(boxes: Box[]): Box | null {
  if (boxes.length === 0) return null;
  return boxes.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }));
}

/** The area worth showing: the stage and every element, with a margin. */
export function planBox(show: Show, margin = 900): Box {
  const sh = show.stage.shape;
  const stage: Box = sh.kind === 'rect' ? { x0: 0, y0: 0, x1: sh.width, y1: sh.depth } : { x0: Math.min(...sh.points.map((p) => p.x)), y0: Math.min(...sh.points.map((p) => p.y)), x1: Math.max(...sh.points.map((p) => p.x)), y1: Math.max(...sh.points.map((p) => p.y)) };
  const all = unionBox([stage, ...Object.values(show.elements).map((e) => elementBox(e))])!;
  return { x0: all.x0 - margin, y0: all.y0 - margin, x1: all.x1 + margin, y1: all.y1 + margin + 300 };
}

export const boxesIntersect = (a: Box, b: Box): boolean => a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
export const boxContains = (outer: Box, inner: Box): boolean => outer.x0 <= inner.x0 && outer.y0 <= inner.y0 && outer.x1 >= inner.x1 && outer.y1 >= inner.y1;

export const snap = (v: number, step: number): number => (step > 0 ? Math.round(v / step) * step : v);

export const clampK = (k: number): number => Math.min(MAX_K, Math.max(MIN_K, k));

/** A camera that shows `box` centred inside a viewport of `width` by `height` pixels, with a margin. */
export function fitCamera(box: Box, width: number, height: number, margin = 32, inset: Inset = NO_INSET): Camera {
  const bw = Math.max(1, box.x1 - box.x0);
  const bh = Math.max(1, box.y1 - box.y0);
  // The plan is fitted in the part of the area that floating controls leave free.
  const fw = Math.max(1, width - inset.left - inset.right);
  const fh = Math.max(1, height - inset.top - inset.bottom);
  const k = clampK(Math.min(Math.max(1, fw - 2 * margin) / bw, Math.max(1, fh - 2 * margin) / bh));
  return { k, x: inset.left + (fw - bw * k) / 2 - box.x0 * k, y: inset.top + (fh - bh * k) / 2 - box.y0 * k };
}

/** Space at each edge of the drawing area taken by floating controls, in pixels. */
export interface Inset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export const NO_INSET: Inset = { top: 0, right: 0, bottom: 0, left: 0 };

/** Zoom by `factor` keeping the world point under the screen point (sx, sy) fixed. */
export function zoomAt(c: Camera, sx: number, sy: number, factor: number): Camera {
  const k = clampK(c.k * factor);
  const f = k / c.k;
  return { k, x: sx - (sx - c.x) * f, y: sy - (sy - c.y) * f };
}

export const toWorld = (c: Camera, sx: number, sy: number): { x: number; y: number } => ({ x: (sx - c.x) / c.k, y: (sy - c.y) / c.k });

/** Distance in a readable unit: metres, or feet and inches for imperial shows. */
export function formatLength(mm: number, units: 'metric' | 'imperial', locale: string): string {
  if (units === 'imperial') {
    const inches = mm / 25.4;
    const ft = Math.floor(inches / 12);
    const inch = Math.round(inches - ft * 12);
    return inch === 12 ? `${ft + 1}′ 0″` : `${ft}′ ${inch}″`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(mm / 1000)} m`;
}

/** The wall segments of the proscenium line: the whole width when there is no opening, else the two sides of it. */
export function prosceniumWalls(width: number, opening: number | null): [number, number][] {
  if (opening === null || opening >= width) return [[-300, width + 300]];
  const side = (width - opening) / 2;
  return [[-300, side], [width - side, width + 300]];
}

/** Reads "x; y" lines in metres; null when there are fewer than three valid points. */
export function parsePolygon(text: string): { x: number; y: number }[] | null {
  const pts: { x: number; y: number }[] = [];
  for (const line of text.split('\n')) {
    if (line.trim() === '') continue;
    const m = line.trim().replace(/,/g, '.').split(/[;\s]+/);
    const x = Number(m[0]);
    const y = Number(m[1]);
    if (m.length !== 2 || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    pts.push({ x, y });
  }
  return pts.length >= 3 ? pts : null;
}
