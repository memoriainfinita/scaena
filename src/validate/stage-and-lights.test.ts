import { describe, expect, test } from 'vitest';
import { planSvg } from '../document/plan-svg.ts';
import { showFromPackage } from '../library/apply.ts';
import { itemById } from '../library/items.ts';
import { drawnSymbolOf, iconKeyFor, rp2SymbolOf } from '../library/light-symbols.ts';
import { packageById } from '../library/packages.ts';
import { loadShowIcons } from '../library/show-icons.ts';
import { newShow } from '../model/new.ts';
import type { Show } from '../model/schema.ts';
import { RULES } from './rules.ts';

const withStage = (points: [number, number][]): Show => {
  const s = newShow('t', ['document']);
  return { ...s, stage: { ...s.stage, shape: { kind: 'polygon', points: points.map(([x, y]) => ({ x, y })), prosceniumWidth: null } } };
};

describe('stage outline crossing itself', () => {
  test('a bow-tie outline is flagged once, naming the two sides', () => {
    const found = RULES.stageCrossing(withStage([[0, 0], [4000, 3000], [4000, 0], [0, 3000]]));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ severity: 'warning', ref: { kind: 'show', id: 'stage' }, vars: { a: 1, b: 3 } });
  });
  test('convex and concave outlines, and the rectangle, pass', () => {
    expect(RULES.stageCrossing(withStage([[0, 0], [8000, 0], [8000, 5000], [0, 5000]]))).toEqual([]);
    expect(RULES.stageCrossing(withStage([[0, 0], [8000, 0], [8000, 5000], [4000, 2500], [0, 5000]]))).toEqual([]);
    expect(RULES.stageCrossing(newShow('t', ['document']))).toEqual([]);
  });
  test('a corner lying on another side counts as crossing', () => {
    expect(RULES.stageCrossing(withStage([[0, 0], [6000, 0], [6000, 4000], [3000, 0], [0, 4000]]))).toHaveLength(1);
  });
});

describe('luminaires in RP-2 outlines', () => {
  test('lights map to a hand-drawn outline; other items have none', () => {
    expect(rp2SymbolOf(itemById('light.ellipsoidal')!)).toBe('ellipsoidal');
    expect(rp2SymbolOf(itemById('light.par64')!)).toBe('par');
    expect(rp2SymbolOf(itemById('light.uv')!)).toBeUndefined();
    expect(rp2SymbolOf(itemById('guitar.electric')!)).toBeUndefined();
  });
  test('with RP-2 on, a light draws its outline and no icon; items without an outline keep their icon', () => {
    const ell = itemById('light.ellipsoidal')!;
    expect(iconKeyFor(ell, true)).toBeUndefined();
    expect(iconKeyFor(ell, false)).toBe('light.ellipsoidal');
    expect(drawnSymbolOf(itemById('light.par64')!, true)).toBe('par');
    expect(iconKeyFor(itemById('light.uv')!, true)).toBe('light.uv');
  });
  test('the theatre example comes with RP-2 lights and its PDF plan uses no light icons', async () => {
    const opts = { availWidthMm: 270, availHeightMm: 180, planScale: null, lang: 'es' as const };
    const show = showFromPackage(packageById('theatre')!, 'theatre', 'es');
    expect(show.view.rp2Lights).toBe(true);
    await loadShowIcons(show);
    expect(planSvg(show, {}, opts).svg).not.toMatch(/ic-light\./);
    expect(planSvg({ ...show, view: { ...show.view, rp2Lights: false } }, {}, opts).svg).toMatch(/ic-light\./);
    expect(showFromPackage(packageById('rock')!, 'rock', 'es').view.rp2Lights).toBe(false);
  });
});
