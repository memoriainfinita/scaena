import { describe, expect, test } from 'vitest';
import { planSvg } from '../document/plan-svg.ts';
import { newShow } from './new.ts';
import { loadShow } from './migrate.ts';
import { safeParseShow } from './schema.ts';
import { insertStagePoint, moveStagePoint, removeStagePoint, setStagePoints, stageFrame, stagePoints, toFreeForm } from './stage.ts';

const opts = { availWidthMm: 267, availHeightMm: 170, planScale: null, lang: 'en' as const };
const L = [{ x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 6000, y: 3000 }, { x: 9000, y: 3000 }, { x: 9000, y: 6000 }, { x: 0, y: 6000 }];

describe('free-form stage points', () => {
  test('a rectangle becomes a polygon with its four corners and keeps its proscenium opening', () => {
    let show = newShow('t');
    if (show.stage.shape.kind !== 'rect') throw new Error('rect expected');
    show = { ...show, stage: { ...show.stage, shape: { ...show.stage.shape, prosceniumWidth: 4000 } } };
    const out = toFreeForm(show);
    expect(out.stage.shape).toMatchObject({ kind: 'polygon', prosceniumWidth: 4000 });
    expect(stagePoints(out)).toEqual([{ x: 0, y: 0 }, { x: 8000, y: 0 }, { x: 8000, y: 5000 }, { x: 0, y: 5000 }]);
    expect(toFreeForm(out)).toBe(out); // already free-form: nothing changes
  });

  test('a point moves, a point is added in the middle of a side, and one is taken away', () => {
    const show = setStagePoints(newShow('t'), L);
    const moved = moveStagePoint(show, 2, 6500, 3500);
    expect(stagePoints(moved)[2]).toEqual({ x: 6500, y: 3500 });
    expect(moveStagePoint(show, 2, 6000, 3000)).toBe(show); // not moved: same show, so no undo step
    const more = insertStagePoint(show, 5); // the closing side, from the last point back to the first
    expect(stagePoints(more)).toHaveLength(7);
    expect(stagePoints(more)[6]).toEqual({ x: 0, y: 3000 });
    const fewer = removeStagePoint(show, 3);
    expect(stagePoints(fewer)).toHaveLength(5);
    expect(stagePoints(fewer)).not.toContainEqual({ x: 9000, y: 3000 });
  });

  test('a plan keeps at least three points and at most sixty, and refuses what is not a number', () => {
    let tri = setStagePoints(newShow('t'), [{ x: 0, y: 0 }, { x: 4000, y: 0 }, { x: 0, y: 3000 }]);
    expect(removeStagePoint(tri, 0)).toBe(tri);
    const base = newShow('t');
    expect(setStagePoints(base, [{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(base);
    expect(setStagePoints(base, [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: Number.NaN, y: 2 }])).toBe(base);
    const many = Array.from({ length: 61 }, (_, i) => ({ x: i * 10, y: (i % 2) * 100 }));
    expect(setStagePoints(base, many)).toBe(base);
    tri = setStagePoints(base, many.slice(0, 60));
    expect(stagePoints(tri)).toHaveLength(60);
    expect(insertStagePoint(tri, 0)).toBe(tri); // a 61st point is refused
  });

  test('a rectangle is not edited point by point', () => {
    const show = newShow('t');
    expect(moveStagePoint(show, 0, 100, 100)).toBe(show);
    expect(insertStagePoint(show, 0)).toBe(show);
    expect(removeStagePoint(show, 0)).toBe(show);
  });

  test('the proscenium opening is trimmed when the plan gets narrower than it', () => {
    let show = setStagePoints(newShow('t'), L);
    show = { ...show, stage: { ...show.stage, shape: { ...show.stage.shape, prosceniumWidth: 8000 } as typeof show.stage.shape } };
    const narrow = setStagePoints(show, [{ x: 0, y: 0 }, { x: 3000, y: 0 }, { x: 3000, y: 2000 }]);
    expect(narrow.stage.shape).toMatchObject({ prosceniumWidth: 3000 });
  });

  test('points are whole millimetres', () => {
    const show = setStagePoints(newShow('t'), [{ x: 0.4, y: 0.6 }, { x: 1000.5, y: 0 }, { x: 0, y: 2000.2 }]);
    expect(stagePoints(show)[0]).toEqual({ x: 0, y: 1 });
  });
});

describe('the frame of the stage', () => {
  test('a rectangle: downstage is its depth and the centre line its middle', () => {
    expect(stageFrame(newShow('t'))).toEqual({ x0: 0, x1: 8000, upstage: 0, downstage: 5000, width: 8000, centre: 4000, opening: 6000 });
  });
  test('a free-form plan: the lowest side and the middle of its width', () => {
    const f = stageFrame(setStagePoints(newShow('t'), L));
    expect(f).toMatchObject({ x0: 0, x1: 9000, upstage: 0, downstage: 6000, centre: 4500 });
  });
  test('a plan that does not start at zero is measured from where it starts', () => {
    const f = stageFrame(setStagePoints(newShow('t'), [{ x: 2000, y: 1000 }, { x: 8000, y: 1000 }, { x: 8000, y: 4000 }]));
    expect(f).toMatchObject({ x0: 2000, x1: 8000, upstage: 1000, downstage: 4000, width: 6000, centre: 5000 });
  });
});

describe('reference lines on a free-form stage', () => {
  test('the PDF drawing has the plaster line at the downstage edge and the centre line in the middle', () => {
    const show = setStagePoints(newShow('t'), L);
    const svg = planSvg(show, {}, opts).svg;
    expect(svg).toContain('x1="-300" y1="6000" x2="9300" y2="6000"'); // plaster line, 300 mm past each side
    expect(svg).toContain('x1="4500" y1="0" x2="4500" y2="6300"'); // centre line
  });
  test('a proscenium opening makes two walls around the middle of the width', () => {
    let show = setStagePoints(newShow('t'), L);
    show = { ...show, stage: { ...show.stage, shape: { ...show.stage.shape, prosceniumWidth: 5000 } as typeof show.stage.shape } };
    const svg = planSvg(show, {}, opts).svg;
    expect(svg).toContain('x1="-300" y1="6000" x2="2000" y2="6000"'); // left wall to the opening: (9000 - 5000) / 2
    expect(svg).toContain('x1="7000" y1="6000" x2="9300" y2="6000"');
  });
  test('a line switched off is not drawn', () => {
    let show = setStagePoints(newShow('t'), L);
    show = { ...show, stage: { ...show.stage, referenceLines: { center: false, plaster: false, proscenium: false } } };
    const svg = planSvg(show, {}, opts).svg;
    expect(svg).not.toContain('y1="6000" x2="9300"');
    expect(svg).not.toContain('x1="4500" y1="0"');
  });
});

describe('opening height and old files', () => {
  test('a file saved before these fields still opens, with no opening width or height', () => {
    const show = newShow('t');
    const raw = JSON.parse(JSON.stringify(setStagePoints(show, L))) as { stage: { shape: Record<string, unknown>; prosceniumHeight?: unknown } };
    delete raw.stage.shape.prosceniumWidth;
    delete raw.stage.prosceniumHeight;
    const out = loadShow(raw);
    expect(out.stage.prosceniumHeight).toBeNull();
    expect(out.stage.shape).toMatchObject({ kind: 'polygon', prosceniumWidth: null });
  });
  test('a negative opening height is refused', () => {
    const show = newShow('t');
    expect(safeParseShow({ ...show, stage: { ...show.stage, prosceniumHeight: -1 } }).success).toBe(false);
    expect(safeParseShow({ ...show, stage: { ...show.stage, prosceniumHeight: 6000 } }).success).toBe(true);
  });
});
