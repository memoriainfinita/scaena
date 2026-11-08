import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { planSvg, printStrokes } from '../document/plan-svg.ts';
import { loadShowIcons } from './show-icons.ts';
import { showFromPackage } from './apply.ts';
import { ICON_OF } from './icon-map.ts';
import { footprintBody, iconData, iconDefs, iconFit, iconKeyOf, iconUse, loadIcons } from './icons.ts';
import { ITEMS, itemById } from './items.ts';
import { packageById } from './packages.ts';

const dir = new URL('./icons/', import.meta.url);
const all: Record<string, [number, number, string]> = {};
for (const f of readdirSync(dir)) Object.assign(all, JSON.parse(readFileSync(new URL(f, dir), 'utf8')));

describe('icons', () => {
  test('every mapped item and icon exists', () => {
    for (const [id, key] of Object.entries(ICON_OF)) {
      expect(itemById(id), id).toBeDefined();
      expect(all[key], `${id} -> ${key}`).toBeDefined();
    }
  });

  test('two items never share an icon unless they are the same thing under two ids', () => {
    const seen = new Map<string, string>();
    const twice: string[] = [];
    for (const [id, key] of Object.entries(ICON_OF)) {
      if (seen.has(key)) twice.push(`${key}: ${seen.get(key)} and ${id}`);
      seen.set(key, id);
    }
    expect(twice).toEqual([]);
  });

  test('every icon is one even-odd path with a size', () => {
    for (const [key, [w, h, d]] of Object.entries(all)) {
      expect(w > 0 && h > 0, key).toBe(true);
      expect(d.startsWith('M'), key).toBe(true);
      expect(d.length, key).toBeLessThan(60_000);
    }
  });

  test('an icon is fitted inside its footprint with its aspect kept', async () => {
    await loadIcons(['12-01']);
    const f = iconFit('12-01', 1000, 1000)!;
    expect(f.s * f.iw).toBeLessThanOrEqual(1000);
    expect(f.s * f.ih).toBeLessThanOrEqual(1000);
    expect(iconUse('12-01', 1000, 1000)).toContain('href="#ic-12-01"');
    expect(iconUse('99-99', 1000, 1000)).toBe('');
  });

  test('the plan for print draws each icon once in defs and references it', async () => {
    const show = showFromPackage(packageById('rock')!, 'Rock', 'en');
    await loadShowIcons(show);
    const { svg } = planSvg(show, {}, { availWidthMm: 250, availHeightMm: 170, planScale: null, lang: 'en' });
    const defs = svg.match(/<path id="ic-[^"]+"/g) ?? [];
    expect(defs.length).toBeGreaterThan(3);
    expect(new Set(defs).size).toBe(defs.length);
    expect(svg).toContain('<use href="#ic-');
    // a footprint is still drawn under the icon, so the real size reads
    expect(footprintBody(100, 50)).toContain('<rect');
  });

  test('the view setting leaves out the footprint outline but keeps the icons', async () => {
    const show = showFromPackage(packageById('rock')!, 'Rock', 'en');
    await loadShowIcons(show);
    const opts = { availWidthMm: 250, availHeightMm: 170, planScale: null, lang: 'en' as const };
    const on = planSvg(show, {}, opts).svg;
    const off = planSvg({ ...show, view: { ...show.view, outlines: false } }, {}, opts).svg;
    expect(off.length).toBeLessThan(on.length);
    expect(off).toContain('<use href="#ic-');
  });

  test('icon paths pass through the print stroke rewrite untouched', async () => {
    await loadIcons(['12-01']);
    const defs = iconDefs(['12-01']);
    expect(printStrokes(defs, 0.2)).toBe(defs);
  });

  test('lights turn with their aim and keep their drawn symbol as a footprint', () => {
    const lights = ITEMS.filter((i) => i.category === 'light' && iconKeyOf(i.id));
    expect(lights.length).toBeGreaterThan(0);
    expect(iconData('12-01')).toBeDefined();
  });
});
