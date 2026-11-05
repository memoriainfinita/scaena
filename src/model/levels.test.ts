import { describe, expect, test } from 'vitest';
import { newShow } from './new.ts';
import { levelHeight, levels } from './levels.ts';
import { addElement, updateElement } from './ops.ts';
import { safeParseShow } from './schema.ts';

const base = () => newShow('t');
const layer = (s: ReturnType<typeof base>) => s.layers.find((l) => l.subject === 'stage')!.id;

describe('raised areas of the stage', () => {
  test('a riser takes the height of the library until it is given its own', () => {
    let [show, el] = addElement(base(), { type: { id: 'furniture.riser', version: 1 }, x: 2000, y: 1000, layerId: layer(base()) });
    expect(levelHeight(el)).toBe(400);
    show = updateElement(show, el.id, { height: 1200 });
    expect(levelHeight(show.elements[el.id]!)).toBe(1200);
    expect(safeParseShow(JSON.parse(JSON.stringify(show))).success).toBe(true);
  });
  test('only risers and platforms count, listed back to front', () => {
    let show = base();
    const l = layer(show);
    for (const [type, y] of [['furniture.riser', 3000], ['scenery.platform', 1000], ['kit.drums5', 500]] as const) show = addElement(show, { type: { id: type, version: 1 }, x: 1000, y, layerId: l })[0];
    const found = levels(show);
    expect(found).toHaveLength(2);
    expect(found[0]!.from).toBeLessThan(found[1]!.from);
    expect(found[0]!.to).toBeGreaterThan(found[0]!.from);
  });
  test('the deck height is kept in the stage and is not negative', () => {
    expect(base().stage.height).toBeGreaterThanOrEqual(0);
    expect(safeParseShow({ ...base(), stage: { ...base().stage, height: 1200 } }).success).toBe(true);
  });
});
