import { describe, expect, test } from 'vitest';
import { planSvg } from '../document/plan-svg.ts';
import { showFromPackage } from '../library/apply.ts';
import { PACKAGES } from '../library/packages.ts';
import type { Show } from '../model/schema.ts';
import { boxContains, elementBox, planBox, type Box } from './geometry.ts';
import { AIR_X, elementSlots, linkKey, mountKey, paperText, placeTexts, plotInput, plotTexts, SCREEN_TEXT, textWidth, type PlotTextOptions, type Solid, type TextRequest } from './labels.ts';

const FS = 170;
const box = (x0: number, y0: number, x1: number, y1: number): Box => ({ x0, y0, x1, y1 });
const overlaps = (a: Box, b: Box) => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);

function request(id: string, b: Box, width = 600): TextRequest {
  return { id, group: 1, width, fontSize: FS, owner: id, ownerBox: b, slots: elementSlots(b, width, FS, 60) };
}

describe('placing texts', () => {
  const a = box(0, 0, 500, 500);

  test('a text alone goes below its element, and leaves the slot centred on it', () => {
    const p = placeTexts([{ id: 'a', box: a }], [request('a', a)]).get('a')!;
    expect(p.x).toBe(250);
    expect(p.box.y0).toBeGreaterThan(a.y1);
  });

  test('it goes above when another element is below, then right, then left', () => {
    const under = box(-300, 500, 800, 1100);
    const over = box(-300, -600, 800, 0);
    const right = box(500, -300, 1700, 800);
    const below = placeTexts([{ id: 'a', box: a }, { id: 'u', box: under }], [request('a', a)]).get('a')!;
    expect(below.box.y1).toBeLessThanOrEqual(a.y0);
    const aside = placeTexts([{ id: 'a', box: a }, { id: 'u', box: under }, { id: 'o', box: over }], [request('a', a)]).get('a')!;
    expect(aside.box.x0).toBeGreaterThanOrEqual(a.x1);
    const left = placeTexts([{ id: 'a', box: a }, { id: 'u', box: under }, { id: 'o', box: over }, { id: 'r', box: right }], [request('a', a)]).get('a')!;
    expect(left.box.x1).toBeLessThanOrEqual(a.x0);
  });

  test('two neighbours whose natural slots touch end up apart', () => {
    const b = box(420, 0, 920, 500);
    const placed = placeTexts([{ id: 'a', box: a }, { id: 'b', box: b }], [request('a', a, 900), request('b', b, 900)]);
    expect(overlaps(placed.get('a')!.box, placed.get('b')!.box)).toBe(false);
  });

  test('two labels side by side keep more than a word space between them', () => {
    const b = box(1050, 0, 1550, 500);
    const placed = placeTexts([{ id: 'a', box: a }, { id: 'b', box: b }], [request('a', a, 900), request('b', b, 900)]);
    const [left, right] = [placed.get('a')!.box, placed.get('b')!.box].sort((p, q) => p.x0 - q.x0) as [Box, Box];
    if (left.y0 === right.y0) expect(right.x0 - left.x1).toBeGreaterThanOrEqual(AIR_X * FS);
  });

  test('a text can stand on what its element stands on', () => {
    const riser = box(-2000, -2000, 3000, 3000);
    const p = placeTexts([{ id: 'r', box: riser }, { id: 'a', box: a }], [request('a', a)]).get('a')!;
    expect(p.x).toBe(250);
    expect(p.box.y0).toBeGreaterThan(a.y1);
  });

  test('a slot that leaves the drawn area counts as taken', () => {
    const p = placeTexts([{ id: 'a', box: a }], [request('a', a)], box(-1000, -1000, 1500, 600)).get('a')!;
    expect(p.box.y1).toBeLessThanOrEqual(a.y0);
  });

  test('with no free slot the text is still placed, on the slot that covers least', () => {
    const everything = box(-20000, -20000, 20000, 20000);
    const req = { ...request('a', a), ownerBox: undefined };
    expect(placeTexts([{ id: 'a', box: a }, { id: 'x', box: everything }], [req]).has('a')).toBe(true);
  });

  test('the order of the input does not change the result', () => {
    const solids: Solid[] = [];
    const texts: TextRequest[] = [];
    for (let i = 0; i < 40; i++) {
      const b = box(i * 300, (i % 5) * 300, i * 300 + 250, (i % 5) * 300 + 250);
      solids.push({ id: `e${i}`, box: b });
      texts.push(request(`e${i}`, b, 800));
    }
    const forward = placeTexts(solids, texts);
    const backward = placeTexts([...solids].reverse(), [...texts].reverse());
    expect([...backward.entries()].sort()).toEqual([...forward.entries()].sort());
  });

  test('a thousand elements are placed quickly', () => {
    const solids: Solid[] = [];
    const texts: TextRequest[] = [];
    for (let i = 0; i < 1000; i++) {
      const b = box((i % 40) * 700, Math.floor(i / 40) * 700, (i % 40) * 700 + 400, Math.floor(i / 40) * 700 + 400);
      solids.push({ id: `e${i}`, box: b });
      texts.push(request(`e${i}`, b, 900));
    }
    const t0 = performance.now();
    const placed = placeTexts(solids, texts);
    const ms = performance.now() - t0;
    expect(placed.size).toBe(1000);
    expect(ms).toBeLessThan(1000);
  });

  test('wide letters take more room than narrow ones', () => {
    expect(textWidth('WWW', FS)).toBeGreaterThan(textWidth('iii', FS));
    expect(textWidth('', FS)).toBe(0);
  });
});

describe('the example shows', () => {
  const fitK = (show: Show, availWidthMm: number, availHeightMm: number) => 1 / planSvg(show, {}, { availWidthMm, availHeightMm, planScale: null, lang: 'es' }).scaleN;

  function collisions(show: Show, options: PlotTextOptions, onlyTexts = false): string[] {
    const placed = plotTexts(show, options);
    const { solids, texts } = plotInput(show, options);
    const list = [...placed.entries()];
    const found: string[] = [];
    list.forEach(([id, p], i) => {
      if (!boxContains(options.bounds, p.box)) found.push(`${id} leaves the plan`);
      for (const [other, q] of list.slice(i + 1)) {
        if (overlaps(p.box, q.box)) found.push(`${id} × ${other}`);
      }
    });
    if (onlyTexts) return found;
    for (const t of texts) {
      const p = placed.get(t.id)!;
      for (const s of solids) {
        const stands = t.ownerBox && boxContains(s.box, t.ownerBox);
        if (s.id !== t.owner && !stands && overlaps(p.box, s.box)) found.push(`${t.id} × ${s.id}`);
      }
    }
    return found;
  }

  for (const pkg of PACKAGES) {
    test(`${pkg.id}: no text covers another or an element, on screen`, () => {
      const show = showFromPackage(pkg, pkg.id, 'es');
      expect(collisions(show, { sizes: SCREEN_TEXT, bounds: planBox(show), lang: 'es', mounts: true })).toEqual([]);
    });
    test(`${pkg.id}: no text covers another or an element, on a whole portrait page`, () => {
      const show = showFromPackage(pkg, pkg.id, 'es');
      expect(collisions(show, { sizes: paperText(fitK(show, 180, 250)), bounds: planBox(show, 700), lang: 'es', mounts: true })).toEqual([]);
    });
    // The landscape A4 of the stage plot section: at about 1:110 there is no room left to keep texts off the elements of a full stage, so the PDF writes them on top.
    test(`${pkg.id}: no text covers another, on the landscape A4 of the plot section`, () => {
      const show = showFromPackage(pkg, pkg.id, 'es');
      expect(collisions(show, { sizes: paperText(fitK(show, 267, 156)), bounds: planBox(show, 700), lang: 'es', mounts: true }, true)).toEqual([]);
    });
  }

  test('the theatre example places mount names and connectors too', () => {
    const show = showFromPackage(PACKAGES.find((p) => p.id === 'theatre')!, 'theatre', 'es');
    const placed = plotTexts(show, { sizes: SCREEN_TEXT, bounds: planBox(show), lang: 'es', mounts: true });
    for (const m of Object.values(show.mounts)) expect(placed.has(mountKey(m.id))).toBe(true);
    for (const c of Object.values(show.connections)) if (c.connector && show.view.links) expect(placed.has(linkKey(c.id))).toBe(true);
    expect(Object.values(show.elements).some((e) => elementBox(e))).toBe(true);
  });

  test('an editor that does not write mount names leaves their room free', () => {
    const show = showFromPackage(PACKAGES.find((p) => p.id === 'theatre')!, 'theatre', 'es');
    const placed = plotTexts(show, { sizes: SCREEN_TEXT, bounds: planBox(show), lang: 'es', mounts: false });
    for (const m of Object.values(show.mounts)) expect(placed.has(mountKey(m.id))).toBe(false);
  });
});
