// Cables as orthogonal paths that go around the elements instead of through them (docs/design/grupo-2-legibilidad-2026-11-11.md).
// A* over a grid of square cells: the elements are blocked, a turn costs more than a step, and a cell another cable already uses costs a little more,
// so cables that share a corridor drift into neighbouring lanes. Pure, with no DOM; the editor and the PDF get the same routes.
import type { Box } from './geometry.ts';

export interface Pt {
  x: number;
  y: number;
}
export interface RouteRequest {
  id: string;
  /** Ids of the two elements, so they do not block their own cable. */
  fromId: string;
  toId: string;
  from: Pt;
  to: Pt;
}
export interface RouteObstacle {
  id: string;
  box: Box;
}
export interface RouteOptions {
  /** The area the cables may use; the grid reaches a few cells beyond it. */
  bounds: Box;
  /** Side of a grid cell in millimetres; chosen from the size of the plan when absent. */
  step?: number;
  /** A route that needs more expansions than this is left straight. */
  maxExpansions?: number;
}

/** Cells of clearance kept around an element. */
const PAD_CELLS = 1;
/** What a turn costs, in steps. */
const TURN = 4;
/** What each cable already using a cell adds to the cost of using it, in steps. */
const SHARED = 1.5;
const MARGIN_CELLS = 3;
const MAX_CELLS = 250_000;
const DEFAULT_EXPANSIONS = 40_000;

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

const inside = (b: Box, p: Pt): boolean => p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1;

/** A binary heap of states by cost; equal costs leave in the order they came in, so the result does not depend on the engine. */
class Heap {
  private keys: number[] = [];
  private seqs: number[] = [];
  private vals: number[] = [];
  private seq = 0;
  get size(): number {
    return this.keys.length;
  }
  push(key: number, val: number): void {
    let i = this.keys.length;
    this.keys.push(key);
    this.seqs.push(this.seq++);
    this.vals.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(i, p)) break;
      this.swap(i, p);
      i = p;
    }
  }
  pop(): number {
    const top = this.vals[0]!;
    const last = this.keys.length - 1;
    this.swap(0, last);
    this.keys.pop();
    this.seqs.pop();
    this.vals.pop();
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < last && this.less(l, m)) m = l;
      if (r < last && this.less(r, m)) m = r;
      if (m === i) break;
      this.swap(i, m);
      i = m;
    }
    return top;
  }
  private less(a: number, b: number): boolean {
    return this.keys[a]! < this.keys[b]! || (this.keys[a]! === this.keys[b]! && this.seqs[a]! < this.seqs[b]!);
  }
  private swap(a: number, b: number): void {
    [this.keys[a], this.keys[b]] = [this.keys[b]!, this.keys[a]!];
    [this.seqs[a], this.seqs[b]] = [this.seqs[b]!, this.seqs[a]!];
    [this.vals[a], this.vals[b]] = [this.vals[b]!, this.vals[a]!];
  }
}

/** The path of every request that found one. A request that is missing stays a straight line between its ends. */
export function routeLinks(requests: RouteRequest[], obstacles: RouteObstacle[], opts: RouteOptions): Map<string, Pt[]> {
  const out = new Map<string, Pt[]>();
  if (requests.length === 0) return out;
  const { bounds } = opts;
  const extent = Math.max(bounds.x1 - bounds.x0, bounds.y1 - bounds.y0);
  const step = opts.step ?? Math.max(100, Math.ceil(extent / 400 / 10) * 10);
  const ox = bounds.x0 - MARGIN_CELLS * step;
  const oy = bounds.y0 - MARGIN_CELLS * step;
  const W = Math.ceil((bounds.x1 - bounds.x0) / step) + 2 * MARGIN_CELLS + 1;
  const H = Math.ceil((bounds.y1 - bounds.y0) / step) + 2 * MARGIN_CELLS + 1;
  if (W * H > MAX_CELLS) return out;
  const cx = (ix: number) => ox + (ix + 0.5) * step;
  const cy = (iy: number) => oy + (iy + 0.5) * step;
  const cellX = (x: number) => Math.min(W - 1, Math.max(0, Math.floor((x - ox) / step)));
  const cellY = (y: number) => Math.min(H - 1, Math.max(0, Math.floor((y - oy) / step)));

  const blocked = new Uint16Array(W * H);
  const used = new Uint8Array(W * H);
  const mark = (box: Box, delta: 1 | -1): void => {
    const x0 = cellX(box.x0 - PAD_CELLS * step);
    const x1 = cellX(box.x1 + PAD_CELLS * step);
    const y0 = cellY(box.y0 - PAD_CELLS * step);
    const y1 = cellY(box.y1 + PAD_CELLS * step);
    for (let iy = y0; iy <= y1; iy++) for (let ix = x0; ix <= x1; ix++) blocked[iy * W + ix]! += delta;
  };
  for (const o of obstacles) mark(o.box, 1);

  const states = W * H * 4;
  const g = new Float32Array(states);
  const stamp = new Uint32Array(states);
  const came = new Int32Array(states);
  let run = 0;
  const budget = opts.maxExpansions ?? DEFAULT_EXPANSIONS;

  for (const req of [...requests].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const skip = obstacles.filter((o) => o.id === req.fromId || o.id === req.toId || inside(o.box, req.from) || inside(o.box, req.to));
    const fromBox = obstacles.find((o) => o.id === req.fromId)?.box;
    const toBox = obstacles.find((o) => o.id === req.toId)?.box;
    const ends = [fromBox, toBox].filter((b): b is Box => !!b);
    for (const o of skip) mark(o.box, -1);
    const path = search(req, ends);
    for (const o of skip) mark(o.box, 1);
    if (!path) continue;
    const points = trim(path, fromBox, toBox);
    if (points) out.set(req.id, points);
  }
  return out;

  function search(req: RouteRequest, ends: Box[]): Pt[] | null {
    const sx = cellX(req.from.x);
    const sy = cellY(req.from.y);
    const tx = cellX(req.to.x);
    const ty = cellY(req.to.y);
    if (sx === tx && sy === ty) return null;
    const free = (ix: number, iy: number): boolean => blocked[iy * W + ix] === 0 || ends.some((b) => inside(b, { x: cx(ix), y: cy(iy) })) || (ix === sx && iy === sy) || (ix === tx && iy === ty);
    const stampNow = ++run;
    const heap = new Heap();
    const h = (ix: number, iy: number) => Math.abs(ix - tx) + Math.abs(iy - ty);
    for (let d = 0; d < 4; d++) {
      const s = (sy * W + sx) * 4 + d;
      stamp[s] = stampNow;
      g[s] = 0;
      came[s] = -1;
      heap.push(h(sx, sy), s);
    }
    let expansions = 0;
    let goal = -1;
    while (heap.size > 0) {
      const s = heap.pop();
      const cell = s >> 2;
      const d = s & 3;
      const ix = cell % W;
      const iy = (cell - ix) / W;
      if (ix === tx && iy === ty) {
        goal = s;
        break;
      }
      if (++expansions > budget) return null;
      const gs = g[s]!;
      for (let nd = 0; nd < 4; nd++) {
        if (nd === ((d + 2) & 3)) continue;
        const nx = ix + DX[nd]!;
        const ny = iy + DY[nd]!;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || !free(nx, ny)) continue;
        const ncell = ny * W + nx;
        const ns = ncell * 4 + nd;
        const cost = gs + 1 + (nd === d ? 0 : TURN) + used[ncell]! * SHARED;
        if (stamp[ns] === stampNow && g[ns]! <= cost) continue;
        stamp[ns] = stampNow;
        g[ns] = cost;
        came[ns] = s;
        heap.push(cost + h(nx, ny), ns);
      }
    }
    if (goal < 0) return null;

    // The cells from the end back to the start, as runs of one direction.
    const cells: number[] = [];
    const dirs: number[] = [];
    for (let s = goal; s >= 0; s = came[s]!) {
      cells.push(s >> 2);
      dirs.push(s & 3);
    }
    cells.reverse();
    dirs.reverse();
    for (const c of cells) if (used[c]! < 255) used[c]!++;
    // dirs[i] is the direction the path arrived at cells[i] with (the first cell has none). A run is a stretch of cells in one direction and keeps to one lane.
    const runs: { dir: number; horizontal: boolean; lane: number }[] = [];
    for (let i = 1; i < cells.length; i++) {
      const d = dirs[i]!;
      if (runs[runs.length - 1]?.dir === d) continue;
      const horizontal = (d & 1) === 0;
      const c = cells[i]!;
      runs.push({ dir: d, horizontal, lane: horizontal ? cy(Math.floor(c / W)) : cx(c % W) });
    }
    if (runs.length < 2) return null;
    // The first and the last run leave from, and arrive at, the real ends; the others keep to the lane of their cells.
    const first = runs[0]!;
    const last = runs[runs.length - 1]!;
    first.lane = first.horizontal ? req.from.y : req.from.x;
    last.lane = last.horizontal ? req.to.y : req.to.x;
    const pts: Pt[] = [{ ...req.from }];
    for (let i = 0; i + 1 < runs.length; i++) {
      const a = runs[i]!;
      const b = runs[i + 1]!;
      pts.push(a.horizontal ? { x: b.lane, y: a.lane } : { x: a.lane, y: b.lane });
    }
    pts.push({ ...req.to });
    return pts;
  }
}

/** Takes the part of the path that lies inside the boxes of its two ends away, so the cable starts at the edge of the element. */
function trim(path: Pt[], from: Box | undefined, to: Box | undefined): Pt[] | null {
  let pts = path.filter((p, i) => i === 0 || p.x !== path[i - 1]!.x || p.y !== path[i - 1]!.y);
  const cut = (box: Box | undefined, reversed: boolean): boolean => {
    if (!box) return true;
    const at = (i: number) => (reversed ? pts.length - 1 - i : i);
    while (pts.length > 2 && inside(box, pts[at(1)]!)) pts = reversed ? pts.slice(0, -1) : pts.slice(1);
    const p = pts[at(0)]!;
    const q = pts[at(1)]!;
    if (!inside(box, p)) return true;
    if (inside(box, q)) return false;
    const edge: Pt = p.y === q.y ? { x: q.x > p.x ? box.x1 : box.x0, y: p.y } : { x: p.x, y: q.y > p.y ? box.y1 : box.y0 };
    pts[at(0)] = edge;
    return true;
  };
  if (!cut(from, false) || !cut(to, true) || pts.length < 2) return null;
  return pts;
}

/** The path as thin boxes, for what must keep clear of it; `thickness` is the width given to a line. */
export function segmentBoxes(points: Pt[], thickness: number, maxLength = Infinity): Box[] {
  const boxes: Box[] = [];
  const h = thickness / 2;
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const parts = Number.isFinite(maxLength) ? Math.max(1, Math.ceil(length / maxLength)) : 1;
    for (let j = 0; j < parts; j++) {
      const p = { x: a.x + ((b.x - a.x) * j) / parts, y: a.y + ((b.y - a.y) * j) / parts };
      const q = { x: a.x + ((b.x - a.x) * (j + 1)) / parts, y: a.y + ((b.y - a.y) * (j + 1)) / parts };
      boxes.push({ x0: Math.min(p.x, q.x) - h, y0: Math.min(p.y, q.y) - h, x1: Math.max(p.x, q.x) + h, y1: Math.max(p.y, q.y) + h });
    }
  }
  return boxes;
}

/** The point at a share of the length of a path, from its start. */
export function pointAlong(points: Pt[], t: number): Pt {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i]!.x, p.y - points[i]!.y));
  let rest = lengths.reduce((a, b) => a + b, 0) * t;
  for (let i = 0; i < lengths.length; i++) {
    if (rest <= lengths[i]! || i === lengths.length - 1) {
      const u = lengths[i]! === 0 ? 0 : Math.min(1, rest / lengths[i]!);
      return { x: points[i]!.x + (points[i + 1]!.x - points[i]!.x) * u, y: points[i]!.y + (points[i + 1]!.y - points[i]!.y) * u };
    }
    rest -= lengths[i]!;
  }
  return points[0]!;
}
