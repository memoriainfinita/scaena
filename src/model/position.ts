// Where an element sits on the stage, in the usual stage-direction codes: US (upstage, the back), DS (downstage, the
// front), C (centre) and SL / SR (stage left and right as the performer sees them). The plan is always seen from the
// audience, so stage left is on the audience's right.
import type { PlanElement, Show } from './schema.ts';

export interface StageSize {
  width: number;
  depth: number;
}

export function stageSize(show: Show): StageSize {
  const sh = show.stage.shape;
  if (sh.kind === 'rect') return { width: sh.width, depth: sh.depth };
  return { width: Math.max(...sh.points.map((p) => p.x)), depth: Math.max(...sh.points.map((p) => p.y)) };
}

/** `USC`, `DSL`, `CS`... in thirds of the stage; beyond the stage edges the nearest third applies. */
export function stagePosition(show: Show, el: Pick<PlanElement, 'x' | 'y'>): string {
  const { width, depth } = stageSize(show);
  const row = el.y < depth / 3 ? 'US' : el.y > (depth * 2) / 3 ? 'DS' : 'C';
  const col = el.x < width / 3 ? 'SR' : el.x > (width * 2) / 3 ? 'SL' : 'C';
  if (row === 'C' && col === 'C') return 'CS';
  if (row === 'C') return col;
  return col === 'C' ? row : `${row}${col === 'SL' ? 'L' : 'R'}`;
}
