import { describe, expect, test } from 'vitest';
import { newShow } from '../model/new.ts';
import { addElement, alignElements, freeSpot, distributeElements, duplicateElements, expandGroups, flipElements, groupElements, rotateElements, ungroupElements } from '../model/ops.ts';
import type { Show } from '../model/schema.ts';
import { boxesIntersect, elementBox, elementSize, fitCamera, formatLength, parsePolygon, prosceniumWalls, snap, toWorld, unionBox, zoomAt } from './geometry.ts';

function withElements(...pos: [number, number][]): [Show, string[]] {
  let show = newShow('t');
  const ids: string[] = [];
  for (const [x, y] of pos) {
    const [s, el] = addElement(show, { type: { id: 'kit.drums5', version: 1 }, x, y, layerId: 'l-audio', width: 1000, depth: 1000 });
    show = s;
    ids.push(el.id);
  }
  return [show, ids];
}
const boxOf = (e: Parameters<typeof elementBox>[0]) => elementBox(e, { w: 1000, d: 1000 });

describe('geometry', () => {
  test('a rotated box grows to contain the element', () => {
    const [show, [id]] = withElements([0, 0]);
    const b = elementBox({ ...show.elements[id!]!, rotation: 45 }, { w: 1000, d: 1000 });
    expect(b.x1).toBeCloseTo(707.1, 0);
    expect(b.x0).toBeCloseTo(-707.1, 0);
  });

  test('an element without an override takes the library size', () => {
    const [show, [id]] = withElements([0, 0]);
    const e = { ...show.elements[id!]!, width: null, depth: null };
    expect(elementSize(e).w).toBeGreaterThan(0);
  });

  test('snap rounds to the grid and does nothing without one', () => {
    expect(snap(740, 500)).toBe(500);
    expect(snap(760, 500)).toBe(1000);
    expect(snap(123, 0)).toBe(123);
  });

  test('boxes intersect on touching edges and not when apart', () => {
    expect(boxesIntersect({ x0: 0, y0: 0, x1: 1, y1: 1 }, { x0: 1, y0: 1, x1: 2, y1: 2 })).toBe(true);
    expect(boxesIntersect({ x0: 0, y0: 0, x1: 1, y1: 1 }, { x0: 2, y0: 0, x1: 3, y1: 1 })).toBe(false);
    expect(unionBox([])).toBeNull();
  });

  test('zoom keeps the point under the cursor still', () => {
    const c = { x: 40, y: 20, k: 0.1 };
    const before = toWorld(c, 300, 200);
    const z = zoomAt(c, 300, 200, 2);
    const after = toWorld(z, 300, 200);
    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
    expect(z.k).toBeCloseTo(0.2, 6);
  });

  test('fit centres the box in the viewport', () => {
    const c = fitCamera({ x0: 0, y0: 0, x1: 10000, y1: 5000 }, 1000, 600, 0);
    expect(c.k).toBeCloseTo(0.1, 6);
    expect(c.y).toBeCloseTo((600 - 500) / 2, 6);
  });

  test('fit keeps the box clear of the room that controls take', () => {
    const c = fitCamera({ x0: 0, y0: 0, x1: 10000, y1: 5000 }, 1000, 600, 0, { top: 0, right: 0, bottom: 200, left: 0 });
    expect(c.k).toBeCloseTo(0.08, 6); // 400 px of free height for 5000 mm
    expect(c.y + 5000 * c.k).toBeLessThanOrEqual(400 + 1e-6); // the bottom of the box stays above the controls
    expect(c.x + 10000 * c.k / 2).toBeCloseTo(500, 6);
  });

  test('lengths read in metres or feet', () => {
    expect(formatLength(2500, 'metric', 'en')).toBe('2.50 m');
    expect(formatLength(3048, 'imperial', 'en')).toBe('10′ 0″');
  });
});

describe('plan operations', () => {
  test('rotating a pair turns them about their centre', () => {
    const [show, ids] = withElements([0, 0], [2000, 0]);
    const r = rotateElements(show, ids, 90);
    expect(r.elements[ids[0]!]).toMatchObject({ x: 1000, y: -1000, rotation: 90 });
    expect(r.elements[ids[1]!]).toMatchObject({ x: 1000, y: 1000, rotation: 90 });
  });

  test('rotation stays within 0 and 360', () => {
    const [show, ids] = withElements([0, 0]);
    const r = rotateElements(rotateElements(show, ids, -15), ids, -15);
    expect(r.elements[ids[0]!]!.rotation).toBe(330);
  });

  test('flipping mirrors positions and the flag, and flipping twice restores', () => {
    const [show, ids] = withElements([0, 0], [2000, 500]);
    const f = flipElements(show, ids, 'x');
    expect(f.elements[ids[0]!]).toMatchObject({ x: 2000, flipX: true });
    expect(f.elements[ids[1]!]).toMatchObject({ x: 0, flipX: true });
    expect(flipElements(f, ids, 'x').elements).toEqual(show.elements);
  });

  test('duplicating offsets copies, gives new ids and copies groups as new groups', () => {
    const [show, ids] = withElements([0, 0], [1000, 0]);
    const [grouped, gid] = groupElements(show, ids);
    const [dup, created] = duplicateElements(grouped, ids, 500, 500);
    expect(created).toHaveLength(2);
    expect(dup.elements[created[0]!]).toMatchObject({ x: 500, y: 500 });
    const g2 = dup.elements[created[0]!]!.groupId;
    expect(g2).toBeTruthy();
    expect(g2).not.toBe(gid);
    expect(dup.elements[created[1]!]!.groupId).toBe(g2);
    expect(Object.keys(dup.elements)).toHaveLength(4);
  });

  test('grouping needs two elements; ungrouping frees the whole group', () => {
    const [show, ids] = withElements([0, 0], [1000, 0], [2000, 0]);
    expect(groupElements(show, [ids[0]!])[1]).toBeNull();
    const [g] = groupElements(show, [ids[0]!, ids[1]!]);
    expect(expandGroups(g, [ids[0]!]).sort()).toEqual([ids[0], ids[1]].sort());
    const u = ungroupElements(g, [ids[0]!]);
    expect(u.elements[ids[1]!]!.groupId).toBeNull();
  });

  test('aligning to the left edge uses the boxes, not the centres', () => {
    const [show, ids] = withElements([0, 0], [3000, 700]);
    const a = alignElements(show, ids, 'left', boxOf);
    expect(a.elements[ids[1]!]).toMatchObject({ x: 0, y: 700 });
    const m = alignElements(show, ids, 'middle', boxOf);
    expect(m.elements[ids[0]!]!.y).toBe(350);
    expect(m.elements[ids[1]!]!.y).toBe(350);
  });

  test('distributing leaves the outer two and equalises the gaps', () => {
    const [show, ids] = withElements([0, 0], [1200, 0], [6000, 0]);
    const d = distributeElements(show, ids, 'x', boxOf);
    expect(d.elements[ids[0]!]!.x).toBe(0);
    expect(d.elements[ids[2]!]!.x).toBe(6000);
    expect(d.elements[ids[1]!]!.x).toBe(3000);
  });

  test('distribute and align do nothing with too few elements', () => {
    const [show, ids] = withElements([0, 0], [500, 0]);
    expect(distributeElements(show, ids, 'x', boxOf)).toBe(show);
    expect(alignElements(show, [ids[0]!], 'left', boxOf)).toBe(show);
  });
});

describe('placing new elements', () => {
  test('a taken spot moves the next one aside, and a free one stays', () => {
    const [show] = withElements([4000, 2500]);
    expect(freeSpot(show, 9000, 9000)).toEqual({ x: 9000, y: 9000 });
    expect(freeSpot(show, 4000, 2500)).toEqual({ x: 4500, y: 2500 });
    const [two] = withElements([4000, 2500], [4500, 2500]);
    expect(freeSpot(two, 4000, 2500)).toEqual({ x: 5000, y: 2500 });
  });
});

describe('stage shape helpers', () => {
  test('the proscenium line is whole without an opening and two walls with one', () => {
    expect(prosceniumWalls(8000, null)).toEqual([[-300, 8300]]);
    expect(prosceniumWalls(8000, 6000)).toEqual([[-300, 1000], [7000, 8300]]);
    expect(prosceniumWalls(8000, 9000)).toEqual([[-300, 8300]]);
  });
  test('a free-form stage reads one point per line in metres, with comma or point decimals', () => {
    expect(parsePolygon(['0; 0', '6,5; 0', '6.5 4', ''].join('\n'))).toEqual([{ x: 0, y: 0 }, { x: 6.5, y: 0 }, { x: 6.5, y: 4 }]);
  });
  test('fewer than three points or a bad line is refused', () => {
    expect(parsePolygon(['0;0', '1;1'].join('\n'))).toBeNull();
    expect(parsePolygon(['0;0', '1;1', 'x;2'].join('\n'))).toBeNull();
    expect(parsePolygon(['0;0', '1;1', '2;2;3'].join('\n'))).toBeNull();
  });
});
