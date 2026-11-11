import { describe, expect, test } from 'vitest';
import { bare } from '../library/bare.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { autoNumber } from '../model/lights.ts';
import { textWidth } from '../plan/labels.ts';
import { mountsShown } from '../plan/style.ts';
import { magicSheet } from './magic-svg.ts';
import { planSvg } from './plan-svg.ts';

const theatre = () => autoNumber(bare(showFromPackage(packageById('theatre')!, 'Teatro', 'es')));
const opts = { availWidthMm: 267, availHeightMm: 150, planScale: null, lang: 'es' as const };

describe('what the plan and the PDF both draw', () => {
  test('the mounts and their names follow the lights layer', () => {
    const show = theatre();
    const name = Object.values(show.mounts)[0]!.name;
    const lights = show.layers.find((l) => l.subject === 'lights')!;
    expect(mountsShown(show, (id) => id === lights.id)).toBe(true);
    expect(mountsShown(show, () => false)).toBe(false);
    expect(mountsShown({ ...show, layers: show.layers.filter((l) => l.subject !== 'lights') }, () => false)).toBe(true);
    const on = planSvg(show, {}, { ...opts, layerIds: new Set(show.layers.map((l) => l.id)) }).svg;
    const off = planSvg(show, {}, { ...opts, layerIds: new Set(show.layers.filter((l) => l.subject !== 'lights').map((l) => l.id)) }).svg;
    expect(on).toContain(`>${name}</text>`);
    expect(off).not.toContain(`>${name}</text>`);
  });

  test('texts on the PDF plan have a white edge, so a bar behind them does not strike them through', () => {
    const svg = planSvg(theatre(), {}, opts).svg;
    const texts = svg.match(/<text [^>]*font-family="Inter"[^>]*>[^<]*<\/text>/g) ?? [];
    const edged = texts.filter((t) => t.includes('paint-order="stroke"'));
    expect(edged.length).toBeGreaterThan(5);
  });

  test('the magic sheet keeps the names of its mounts inside its edge', () => {
    const show = theatre();
    const sheet = magicSheet(show, 'es')!;
    const [x0] = /viewBox="([-\d.]+)/.exec(sheet.svg)!.slice(1).map(Number);
    const u = Number(/font-size="([\d.]+)"[^>]*fill="#444"/.exec(sheet.svg)![1]) / 1.5;
    for (const m of Object.values(show.mounts)) expect(x0!).toBeLessThanOrEqual(Math.min(m.from.x, m.to.x) - u * 0.8 - textWidth(m.name, u * 1.5) + 1);
  });
});
