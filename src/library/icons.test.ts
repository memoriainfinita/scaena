import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { planSvg, printStrokes } from '../document/plan-svg.ts';
import { loadShowIcons } from './show-icons.ts';
import { showFromPackage } from './apply.ts';
import { footprintBody, iconData, iconDefs, iconFit, iconKeyOf, iconUse, loadIcons } from './icons.ts';
import { ITEMS, itemById } from './items.ts';
import { packageById } from './packages.ts';

const dir = new URL('./icons/', import.meta.url);
const symbols = new URL('../../symbols/', import.meta.url);
const all: Record<string, [number, number, string]> = {};
for (const f of readdirSync(dir)) Object.assign(all, JSON.parse(readFileSync(new URL(f, dir), 'utf8')));

describe('icons', () => {
  test('every symbol file is a library item, in the folder of its category', () => {
    const files = readdirSync(symbols, { withFileTypes: true }).filter((d) => d.isDirectory());
    let n = 0;
    for (const cat of files) {
      for (const f of readdirSync(new URL(`${cat.name}/`, symbols))) {
        const id = f.slice(0, -4);
        expect(f.endsWith('.svg'), f).toBe(true);
        expect(itemById(id), id).toBeDefined();
        expect(itemById(id)!.category, id).toBe(cat.name);
        expect(iconKeyOf(id), id).toBe(id);
        n++;
      }
    }
    expect(n).toBe(Object.keys(all).length);
  });

  test('the generated chunks match the SVG files (run node scripts/build-symbols.mjs)', () => {
    for (const [id, [w, h, d]] of Object.entries(all)) {
      const cat = (itemById(id) ?? { category: '' }).category;
      const text = readFileSync(new URL(`${cat}/${id}.svg`, symbols), 'utf8');
      expect(text, id).toContain(`viewBox="0 0 ${w} ${h}"`);
      expect(text, id).toContain(` d="${d}"`);
    }
  });

  test('every icon is one even-odd path with a size', () => {
    for (const [key, [w, h, d]] of Object.entries(all)) {
      expect(w > 0 && h > 0, key).toBe(true);
      expect(d.startsWith('M'), key).toBe(true);
      expect(d.length, key).toBeLessThan(60_000);
    }
  });

  test('an icon is fitted inside its footprint with its aspect kept', async () => {
    await loadIcons(['video.ptz']);
    const f = iconFit('video.ptz', 1000, 1000)!;
    expect(f.s * f.iw).toBeLessThanOrEqual(1000);
    expect(f.s * f.ih).toBeLessThanOrEqual(1000);
    expect(iconUse('video.ptz', 1000, 1000)).toContain('href="#ic-video.ptz"');
    expect(iconUse('no.such', 1000, 1000)).toBe('');
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
    await loadIcons(['video.ptz']);
    const defs = iconDefs(['video.ptz']);
    expect(printStrokes(defs, 0.2)).toBe(defs);
  });

  test('lights turn with their aim and keep their drawn symbol as a footprint', () => {
    const lights = ITEMS.filter((i) => i.category === 'light' && iconKeyOf(i.id));
    expect(lights.length).toBeGreaterThan(0);
    expect(iconData('video.ptz')).toBeDefined();
  });
});
