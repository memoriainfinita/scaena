// Calibration of a background by two points: the user clicks two places on the plan that are a known distance apart.
import type { Show } from '../model/schema.ts';

export type Background = NonNullable<Show['stage']['background']>;
type Pt = { x: number; y: number };

/**
 * Rescales the background so the distance between `a` and `b` (as drawn now, in millimetres) becomes `realMm`.
 * The background grows or shrinks about `a`, so what is under the first point stays put. Null for a degenerate input.
 */
export function calibrate(bg: Background, a: Pt, b: Pt, realMm: number): Background | null {
  const measured = Math.hypot(b.x - a.x, b.y - a.y);
  if (!(measured > 0) || !(realMm > 0) || !Number.isFinite(realMm)) return null;
  const f = realMm / measured;
  return { ...bg, scale: bg.scale * f, x: a.x - (a.x - bg.x) * f, y: a.y - (a.y - bg.y) * f };
}

/** Where a background of the given size starts so it is centred on the stage. */
export function centredOn(stage: Show['stage'], widthMm: number, heightMm: number): Pt {
  const sh = stage.shape;
  const cx = sh.kind === 'rect' ? sh.width / 2 : sh.points.reduce((s, p) => s + p.x, 0) / sh.points.length;
  const cy = sh.kind === 'rect' ? sh.depth / 2 : sh.points.reduce((s, p) => s + p.y, 0) / sh.points.length;
  return { x: Math.round(cx - widthMm / 2), y: Math.round(cy - heightMm / 2) };
}
