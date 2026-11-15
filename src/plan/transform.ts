// Resizing and turning an element with the mouse: pure geometry over the element's centre, size and rotation.
// The element is drawn at (x, y) as its centre, turned by `rotation` degrees; sizes are millimetres.
import type { PlanElement } from '../model/schema.ts';
import { elementSize, type Size } from './geometry.ts';

export interface Pt {
  x: number;
  y: number;
}

/** A handle on the box of an element: which sides it moves, as -1 (left or top), 0 (none) or 1 (right or bottom) in the element's own axes. */
export interface Handle {
  id: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  sx: -1 | 0 | 1;
  sy: -1 | 0 | 1;
}

export const HANDLES: readonly Handle[] = [
  { id: 'nw', sx: -1, sy: -1 },
  { id: 'n', sx: 0, sy: -1 },
  { id: 'ne', sx: 1, sy: -1 },
  { id: 'e', sx: 1, sy: 0 },
  { id: 'se', sx: 1, sy: 1 },
  { id: 's', sx: 0, sy: 1 },
  { id: 'sw', sx: -1, sy: 1 },
  { id: 'w', sx: -1, sy: 0 },
];

/** The smallest size a drag can leave an element at. */
export const MIN_SIZE_MM = 20;

const rad = (deg: number): number => (deg * Math.PI) / 180;
const axes = (rotation: number): { ux: Pt; uy: Pt } => ({ ux: { x: Math.cos(rad(rotation)), y: Math.sin(rad(rotation)) }, uy: { x: -Math.sin(rad(rotation)), y: Math.cos(rad(rotation)) } });

/** Where a point given in the element's own axes (from its centre) lies on the plan. */
export function toPlan(e: Pick<PlanElement, 'x' | 'y' | 'rotation'>, local: Pt): Pt {
  const { ux, uy } = axes(e.rotation);
  return { x: e.x + ux.x * local.x + uy.x * local.y, y: e.y + ux.y * local.x + uy.y * local.y };
}

/** Where a handle sits on the plan. */
export const handlePoint = (e: PlanElement, h: Handle, size: Size = elementSize(e)): Pt => toPlan(e, { x: (h.sx * size.w) / 2, y: (h.sy * size.d) / 2 });

/** The turning handle in the element's own axes: out past the top-right corner, so it stays clear of the label that usually sits over the middle. */
export const turnKnob = (size: Size, gap: number): Pt => ({ x: size.w / 2 + gap * 0.7, y: -size.d / 2 - gap * 0.7 });

/** Where the turning handle sits on the plan, `gap` millimetres out from the corner. */
export const turnPoint = (e: PlanElement, gap: number, size: Size = elementSize(e)): Pt => toPlan(e, turnKnob(size, gap));

export interface ResizeOptions {
  /** Ctrl: grow from the centre, both sides together. */
  fromCentre?: boolean;
  /** Shift on a corner: keep the proportions. */
  keepRatio?: boolean;
  /** Snap the size to this step; 0 or less leaves it free. */
  step?: number;
}

export interface Resized {
  x: number;
  y: number;
  width: number;
  depth: number;
}

const snapSize = (v: number, step: number): number => Math.max(MIN_SIZE_MM, step > 0 ? Math.max(step, Math.round(v / step) * step) : Math.round(v));

/** The element after dragging `handle` to `pointer`: the opposite side stays where it is, unless it grows from the centre. */
export function resizeTo(e: PlanElement, handle: Handle, pointer: Pt, opts: ResizeOptions = {}): Resized {
  const { w, d } = elementSize(e);
  const { ux, uy } = axes(e.rotation);
  const px = pointer.x - e.x;
  const py = pointer.y - e.y;
  const lx = px * ux.x + py * ux.y;
  const ly = px * uy.x + py * uy.y;
  const centre = !!opts.fromCentre;
  let nw = handle.sx === 0 ? w : centre ? 2 * handle.sx * lx : handle.sx * lx + w / 2;
  let nd = handle.sy === 0 ? d : centre ? 2 * handle.sy * ly : handle.sy * ly + d / 2;
  if (opts.keepRatio && handle.sx !== 0 && handle.sy !== 0) {
    const k = Math.max(nw / w, nd / d);
    nw = w * k;
    nd = d * k;
  }
  const step = opts.step ?? 0;
  nw = handle.sx === 0 ? w : snapSize(nw, step);
  nd = handle.sy === 0 ? d : snapSize(nd, step);
  const shift = centre ? { x: 0, y: 0 } : { x: (handle.sx * (nw - w)) / 2, y: (handle.sy * (nd - d)) / 2 };
  const at = toPlan(e, shift);
  return { x: Math.round(at.x), y: Math.round(at.y), width: Math.round(nw), depth: Math.round(nd) };
}

/** The rotation (0 to 360) that puts the turning handle under the pointer; `knob` is where that handle sits at rotation 0, in the element's own axes. `step` degrees snaps it, 0 leaves it to the whole degree. */
export function rotationAt(e: Pick<PlanElement, 'x' | 'y'>, pointer: Pt, step = 0, knob: Pt = { x: 0, y: -1 }): number {
  const a = ((Math.atan2(pointer.y - e.y, pointer.x - e.x) - Math.atan2(knob.y, knob.x)) * 180) / Math.PI;
  const snapped = step > 0 ? Math.round(a / step) * step : Math.round(a);
  return ((snapped % 360) + 360) % 360;
}
