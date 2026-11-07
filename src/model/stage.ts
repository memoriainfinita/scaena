// The shape of the stage: edits of a free-form floor plan one point at a time, and the frame every reference line is drawn from.
import type { Show } from './schema.ts';

type Pt = { x: number; y: number };

export const MAX_STAGE_POINTS = 60;
export const MIN_STAGE_POINTS = 3;

/** The corners of the stage, going round: those of the rectangle, or the points of the free-form plan. */
export function stagePoints(show: Show): Pt[] {
  const sh = show.stage.shape;
  if (sh.kind === 'polygon') return sh.points.map((p) => ({ ...p }));
  return [{ x: 0, y: 0 }, { x: sh.width, y: 0 }, { x: sh.width, y: sh.depth }, { x: 0, y: sh.depth }];
}

const bounds = (pts: Pt[]) => ({
  x0: Math.min(...pts.map((p) => p.x)),
  x1: Math.max(...pts.map((p) => p.x)),
  y0: Math.min(...pts.map((p) => p.y)),
  y1: Math.max(...pts.map((p) => p.y)),
});

/** Turns the stage into a free-form plan with the points given (kept as it is when there are fewer than three). The proscenium opening carries over, trimmed to the new width. */
export function setStagePoints(show: Show, points: Pt[]): Show {
  if (points.length < MIN_STAGE_POINTS || points.length > MAX_STAGE_POINTS || points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return show;
  const b = bounds(points);
  const sh = show.stage.shape;
  const opening = sh.prosceniumWidth;
  const width = b.x1 - b.x0;
  const prosceniumWidth = opening === null ? null : Math.min(opening, width);
  return { ...show, stage: { ...show.stage, shape: { kind: 'polygon', points: points.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) })), prosceniumWidth } } };
}

/** Starts a free-form plan from the rectangle: its four corners. A plan that is already free-form is left as it is. */
export function toFreeForm(show: Show): Show {
  return show.stage.shape.kind === 'polygon' ? show : setStagePoints(show, stagePoints(show));
}

export function moveStagePoint(show: Show, index: number, x: number, y: number): Show {
  const pts = stagePoints(show);
  if (show.stage.shape.kind !== 'polygon' || !pts[index]) return show;
  if (pts[index]!.x === Math.round(x) && pts[index]!.y === Math.round(y)) return show;
  pts[index] = { x, y };
  return setStagePoints(show, pts);
}

/** Adds a point in the middle of the side that starts at `index`. */
export function insertStagePoint(show: Show, index: number): Show {
  const pts = stagePoints(show);
  const a = pts[index];
  const b = pts[(index + 1) % pts.length];
  if (show.stage.shape.kind !== 'polygon' || !a || !b) return show;
  pts.splice(index + 1, 0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  return setStagePoints(show, pts);
}

/** Takes a point away; a plan keeps at least three. */
export function removeStagePoint(show: Show, index: number): Show {
  const pts = stagePoints(show);
  if (show.stage.shape.kind !== 'polygon' || pts.length <= MIN_STAGE_POINTS || !pts[index]) return show;
  pts.splice(index, 1);
  return setStagePoints(show, pts);
}

/** Where the lines of the stage go, whatever its shape: the downstage edge is the lowest side of the plan, the centre line the middle of its width. */
export interface StageFrame {
  x0: number;
  x1: number;
  upstage: number;
  downstage: number;
  width: number;
  centre: number;
  /** Width of the proscenium opening, or null when the line is a solid wall. */
  opening: number | null;
}

export function stageFrame(show: Show): StageFrame {
  const sh = show.stage.shape;
  const b = bounds(stagePoints(show));
  return { x0: b.x0, x1: b.x1, upstage: b.y0, downstage: b.y1, width: b.x1 - b.x0, centre: (b.x0 + b.x1) / 2, opening: sh.prosceniumWidth };
}
