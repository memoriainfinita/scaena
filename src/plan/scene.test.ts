import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { itemById } from '../library/items.ts';
import { PACKAGES } from '../library/packages.ts';
import { addConnection } from '../model/connections.ts';
import { newShow } from '../model/new.ts';
import { addElement } from '../model/ops.ts';
import type { Show } from '../model/schema.ts';
import { boxContains, elementBox, planBox, type Box } from './geometry.ts';
import { paperText, SCREEN_TEXT } from './labels.ts';
import { buildScene, PARALLEL_GAP_MM, parallelRoutes } from './scene.ts';

const withStyle = (show: Show, linkStyle: 'routed' | 'straight'): Show => ({ ...show, view: { ...show.view, linkStyle } });
const hits = (a: Box, b: Box) => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);

/** Cable segments that cross an element that is neither of their ends nor a thing they start on (a riser). */
function crossings(show: Show): number {
  const scene = buildScene(show, { sizes: SCREEN_TEXT, bounds: planBox(show), lang: 'es' });
  const boxes = scene.elements.filter((x) => itemById(x.el.type.id)?.symbol !== 'dimension').map((x) => ({ id: x.el.id, box: elementBox(x.el) }));
  let n = 0;
  for (const { link, route } of scene.links) {
    const a = boxes.find((b) => b.id === link.from)?.box;
    const b = boxes.find((x) => x.id === link.to)?.box;
    for (const o of boxes) {
      if (o.id === link.from || o.id === link.to) continue;
      if ((a && boxContains(o.box, a)) || (b && boxContains(o.box, b))) continue;
      for (let i = 0; i + 1 < route.length; i++) {
        const p = route[i]!;
        const q = route[i + 1]!;
        if (hits({ x0: Math.min(p.x, q.x), y0: Math.min(p.y, q.y), x1: Math.max(p.x, q.x), y1: Math.max(p.y, q.y) }, o.box)) {
          n++;
          break;
        }
      }
    }
  }
  return n;
}

describe('the scene of the examples', () => {
  for (const pkg of PACKAGES) {
    test(`${pkg.id}: routed cables cross fewer elements than straight ones, and are right-angled`, () => {
      const show = showFromPackage(pkg, pkg.id, 'es');
      const straight = crossings(withStyle(show, 'straight'));
      const routed = crossings(withStyle(show, 'routed'));
      console.log(`${pkg.id}: cables ${Object.keys(show.connections).length}, crossings straight ${straight} routed ${routed}`);
      expect(routed).toBeLessThanOrEqual(straight);
      const scene = buildScene(withStyle(show, 'routed'), { sizes: SCREEN_TEXT, bounds: planBox(show), lang: 'es' });
      for (const l of scene.links) if (l.route.length > 2) expect(l.route.slice(1).every((p, i) => p.x === l.route[i]!.x || p.y === l.route[i]!.y)).toBe(true);
    });
  }

  test('straight cables are the line between the two ends, as before', () => {
    const show = withStyle(showFromPackage(PACKAGES.find((p) => p.id === 'rock')!, 'rock', 'es'), 'straight');
    const scene = buildScene(show, { sizes: paperText(1 / 65), bounds: planBox(show, 700), lang: 'es' });
    expect(scene.links.length).toBeGreaterThan(0);
    for (const l of scene.links) expect(l.route).toEqual([{ x: l.from.x, y: l.from.y }, { x: l.to.x, y: l.to.y }]);
  });
});

describe('cables between the same pair', () => {
  test('are drawn side by side, and a lone cable keeps its own line', () => {
    let show = newShow('t');
    const [s1, a] = addElement(show, { type: { id: 'control.laptop', version: 1 }, x: 0, y: 0, layerId: 'l-control' });
    const [s2, b] = addElement(s1, { type: { id: 'control.laptop', version: 1 }, x: 4000, y: 0, layerId: 'l-control' });
    const [s3, c1] = addConnection(s2, a.id, b.id, 'video');
    const lone = parallelRoutes(s3, Object.values(s3.connections), new Map());
    expect(lone.size).toBe(0);
    const [s4, c2] = addConnection(s3, b.id, a.id, 'video');
    show = s4;
    const routes = parallelRoutes(show, Object.values(show.connections), new Map());
    const r1 = routes.get(c1!.id)!;
    const r2 = routes.get(c2!.id)!;
    expect(Math.abs(r1[0]!.y - r2[1]!.y)).toBeCloseTo(PARALLEL_GAP_MM);
    expect(r1[0]!.x).toBe(0);
    expect(r2[0]!.x).toBe(4000);
    expect(routes.size).toBe(2);
  });
});
