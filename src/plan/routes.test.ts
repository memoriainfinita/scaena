import { describe, expect, test } from 'vitest';
import type { Box } from './geometry.ts';
import { pointAlong, routeLinks, segmentBoxes, type Pt } from './routes.ts';

const bounds: Box = { x0: 0, y0: 0, x1: 10000, y1: 8000 };
const box = (x: number, y: number, w = 600, d = 600): Box => ({ x0: x - w / 2, y0: y - d / 2, x1: x + w / 2, y1: y + d / 2 });
const req = (id: string, from: Pt, to: Pt) => ({ id, fromId: `${id}-a`, toId: `${id}-b`, from, to });
const obstacle = (id: string, b: Box) => ({ id, box: b });
const crosses = (points: Pt[], b: Box): boolean => {
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]!;
    const c = points[i + 1]!;
    if (Math.max(a.x, c.x) > b.x0 && Math.min(a.x, c.x) < b.x1 && Math.max(a.y, c.y) > b.y0 && Math.min(a.y, c.y) < b.y1) return true;
  }
  return false;
};
const orthogonal = (points: Pt[]) => points.slice(1).every((p, i) => p.x === points[i]!.x || p.y === points[i]!.y);

describe('routeLinks', () => {
  test('a cable goes around what stands between its ends, in right angles', () => {
    const wall = box(5000, 4000, 1000, 3000);
    const from = { x: 2000, y: 4000 };
    const to = { x: 8000, y: 4000 };
    const routes = routeLinks([req('c', from, to)], [obstacle('c-a', box(2000, 4000)), obstacle('c-b', box(8000, 4000)), obstacle('wall', wall)], { bounds });
    const path = routes.get('c')!;
    expect(path).toBeTruthy();
    expect(orthogonal(path)).toBe(true);
    expect(crosses(path, wall)).toBe(false);
    expect(path.length).toBeGreaterThanOrEqual(4);
  });

  test('it starts and ends at the edge of its elements, not at their centres', () => {
    const a = box(2000, 2000);
    const b = box(7000, 6000);
    const path = routeLinks([req('c', { x: 2000, y: 2000 }, { x: 7000, y: 6000 })], [obstacle('c-a', a), obstacle('c-b', b)], { bounds }).get('c')!;
    const first = path[0]!;
    const last = path[path.length - 1]!;
    const onEdge = (p: Pt, bx: Box) => p.x === bx.x0 || p.x === bx.x1 || p.y === bx.y0 || p.y === bx.y1;
    expect(onEdge(first, a)).toBe(true);
    expect(onEdge(last, b)).toBe(true);
  });

  test('an element the cable stands on (a riser) does not block it', () => {
    const riser = box(3000, 3000, 4000, 4000);
    const path = routeLinks([req('c', { x: 2000, y: 2000 }, { x: 4000, y: 4000 })], [obstacle('c-a', box(2000, 2000)), obstacle('c-b', box(4000, 4000)), obstacle('riser', riser)], { bounds }).get('c');
    expect(path).toBeTruthy();
  });

  test('a cable that cannot get out is left to the caller as a straight line', () => {
    const cage = [box(5000, 3000, 3000, 400), box(5000, 5000, 3000, 400), box(3500, 4000, 400, 2000), box(6500, 4000, 400, 2000)];
    const routes = routeLinks([req('c', { x: 5000, y: 4000 }, { x: 9000, y: 7000 })], [obstacle('c-a', box(5000, 4000, 300, 300)), obstacle('c-b', box(9000, 7000)), ...cage.map((b, i) => obstacle(`w${i}`, b))], { bounds });
    expect(routes.has('c')).toBe(false);
  });

  test('cables that share a corridor do not lie on top of each other', () => {
    const wall = box(5000, 4000, 1000, 5000);
    const items = [obstacle('a-a', box(2000, 3500)), obstacle('a-b', box(8000, 3500)), obstacle('b-a', box(2000, 4500)), obstacle('b-b', box(8000, 4500)), obstacle('wall', wall)];
    const routes = routeLinks([req('a', { x: 2000, y: 3500 }, { x: 8000, y: 3500 }), req('b', { x: 2000, y: 4500 }, { x: 8000, y: 4500 })], items, { bounds });
    const a = routes.get('a')!;
    const b = routes.get('b')!;
    const lane = (path: Pt[]) => path.filter((p) => p.y < 1500 || p.y > 6500).map((p) => p.y);
    expect(lane(a).length).toBeGreaterThan(0);
    expect(lane(a)).not.toEqual(lane(b));
  });

  test('the same input always gives the same routes', () => {
    const items = [obstacle('c-a', box(2000, 2000)), obstacle('c-b', box(8000, 6000)), obstacle('x', box(5000, 4000, 2000, 2000))];
    const r = [req('c', { x: 2000, y: 2000 }, { x: 8000, y: 6000 })];
    expect(routeLinks(r, items, { bounds }).get('c')).toEqual(routeLinks(r, [...items].reverse(), { bounds }).get('c'));
  });

  test('sixty cables among three hundred elements take well under a second', () => {
    const items = Array.from({ length: 300 }, (_, i) => obstacle(`e${i}`, box(500 + (i % 20) * 480, 500 + Math.floor(i / 20) * 480, 300, 300)));
    const requests = Array.from({ length: 60 }, (_, i) => ({ id: `c${i}`, fromId: `e${i}`, toId: `e${299 - i}`, from: items[i]!.box ? { x: (items[i]!.box.x0 + items[i]!.box.x1) / 2, y: (items[i]!.box.y0 + items[i]!.box.y1) / 2 } : { x: 0, y: 0 }, to: { x: (items[299 - i]!.box.x0 + items[299 - i]!.box.x1) / 2, y: (items[299 - i]!.box.y0 + items[299 - i]!.box.y1) / 2 } }));
    const t0 = performance.now();
    routeLinks(requests, items, { bounds: { x0: 0, y0: 0, x1: 10000, y1: 8000 } });
    expect(performance.now() - t0).toBeLessThan(1000);
  });
});

describe('segments and points along a path', () => {
  test('a path becomes thin boxes, cut into pieces when a length is given', () => {
    const path = [{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 500 }];
    expect(segmentBoxes(path, 20)).toHaveLength(2);
    expect(segmentBoxes(path, 20, 250)).toHaveLength(6);
    expect(segmentBoxes(path, 20)[0]).toEqual({ x0: -10, y0: -10, x1: 1010, y1: 10 });
  });

  test('a point along a path follows its corners', () => {
    const path = [{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 1000 }];
    expect(pointAlong(path, 0.5)).toEqual({ x: 1000, y: 0 });
    expect(pointAlong(path, 0.75)).toEqual({ x: 1000, y: 500 });
    expect(pointAlong(path, 0)).toEqual({ x: 0, y: 0 });
  });
});
