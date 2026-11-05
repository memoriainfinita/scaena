import { describe, expect, test } from 'vitest';
import { safeParseShow } from '../model/schema.ts';
import { showFromPackage } from './apply.ts';
import { ITEMS, itemById, searchItems } from './items.ts';
import { AUDIO, FIXTURES, needsPhantom } from './models.ts';
import { PACKAGES, packageById } from './packages.ts';
import { CONNECTORS, REGIONS, regionByCode } from './regions.ts';
import { symbolBody, symbolKeys, symbolSvg } from './symbols.ts';

describe('items and symbols', () => {
  test('ids are unique and every symbol exists', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    const keys = new Set(symbolKeys());
    for (const i of ITEMS) expect(keys.has(i.symbol), `${i.id} -> ${i.symbol}`).toBe(true);
  });

  test('each symbol draws at the real size without NaN and has a front line', () => {
    for (const i of ITEMS) {
      const body = symbolBody(i.symbol, i.size.w, i.size.d);
      expect(body, i.id).not.toMatch(/NaN|undefined/);
      expect(body.length, i.id).toBeGreaterThan(20);
      const svg = symbolSvg(i.symbol, i.size.w, i.size.d, i.name.es);
      expect(svg).toContain('<title>');
    }
  });

  test('sizes are positive and names exist in both languages', () => {
    for (const i of ITEMS) {
      expect(i.size.w).toBeGreaterThan(0);
      expect(i.size.d).toBeGreaterThan(0);
      expect(i.name.es && i.name.en).toBeTruthy();
    }
  });

  test('search ignores accents and case and reads tags in both languages', () => {
    expect(searchItems('BATERIA').map((i) => i.id)).toContain('kit.drums5');
    expect(searchItems('wedge').map((i) => i.id)).toContain('monitor.wedge');
    expect(searchItems('source four').map((i) => i.id)).toContain('light.ellipsoidal');
    expect(searchItems('zzzz')).toEqual([]);
    expect(searchItems('')).toHaveLength(ITEMS.length);
  });
});

describe('models', () => {
  test('every fixture has a datasheet source or is marked as an estimate', () => {
    for (const f of FIXTURES) expect(Boolean(f.source) || f.estimate === true, f.id).toBe(true);
    expect(new Set(FIXTURES.map((f) => f.id)).size).toBe(FIXTURES.length);
  });

  test('the Source Four Fresnel weight stays empty: no datasheet value was read', () => {
    expect(FIXTURES.find((f) => f.id === 'etc.s4-fresnel')!.weightKg).toBeNull();
  });

  test('every microphone has a type and every audio model a source', () => {
    for (const a of AUDIO) {
      if (a.kind === 'mic') expect(a.micType, a.id).toBeDefined();
      expect(a.source, a.id).toBeTruthy();
    }
    expect(new Set(AUDIO.map((a) => a.id)).size).toBe(AUDIO.length);
  });

  test('phantom power follows the microphone type', () => {
    expect(needsPhantom('shure.sm58')).toBe(false);
    expect(needsPhantom('akg.c414xlii')).toBe(true);
    expect(needsPhantom('shure.sm81')).toBe(true);
    expect(needsPhantom('radial.jdi')).toBe(false);
    expect(needsPhantom('Micro de mesa')).toBeNull();
  });
});

describe('regions and connectors', () => {
  test('15 countries plus other, with a default voltage each', () => {
    expect(REGIONS).toHaveLength(16);
    expect(regionByCode('ES')).toMatchObject({ voltage: 230 });
    for (const code of ['MX', 'CO', 'BR', 'US', 'CA']) expect(regionByCode(code)!.toConfirm).toBe(true);
    expect(regionByCode('ES')!.toConfirm).toBeUndefined();
    expect(new Set(REGIONS.map((r) => r.code)).size).toBe(16);
  });

  test('the short connector list has the seven accepted types', () => {
    expect(CONNECTORS.map((c) => c.id)).toEqual(['schuko', 'cee16', 'cee32', 'powercon', 'socapex', 'twistlock', 'edison']);
    expect(CONNECTORS.find((c) => c.id === 'socapex')!.amps).toBeNull();
  });
});

describe('packages', () => {
  const expected: Record<string, { channels: number; outputs: number }> = {
    rock: { channels: 17, outputs: 4 },
    jazz: { channels: 12, outputs: 2 },
    singer: { channels: 4, outputs: 1 },
    dj: { channels: 3, outputs: 1 },
    conference: { channels: 9, outputs: 1 },
    theatre: { channels: 12, outputs: 1 },
    av: { channels: 4, outputs: 1 },
  };

  test('the seven packages exist', () => {
    expect(PACKAGES.map((p) => p.id)).toEqual(Object.keys(expected));
    expect(packageById('rock')).toBeDefined();
  });

  for (const pkg of PACKAGES) {
    test(`${pkg.id} builds a valid show with its channels and outputs`, () => {
      const show = showFromPackage(pkg, pkg.name.es);
      expect(safeParseShow(show).success).toBe(true);
      expect(Object.keys(show.channels)).toHaveLength(expected[pkg.id]!.channels);
      expect(Object.keys(show.outputs)).toHaveLength(expected[pkg.id]!.outputs);
      expect(Object.keys(show.elements)).toHaveLength(pkg.elements.length);
    });

    test(`${pkg.id}: elements are on stage or at the control position, items exist and phantom matches the mic`, () => {
      const roomTypes = new Set(['desk.digital', 'control.laptop', 'control.videomixer', 'video.projector']);
      for (const e of pkg.elements) {
        expect(itemById(e.type), e.type).toBeDefined();
        expect(e.x).toBeGreaterThanOrEqual(0);
        expect(e.x).toBeLessThanOrEqual(8000);
        expect(e.y).toBeGreaterThanOrEqual(0);
        // The stage is 5000 deep; beyond that only control-position equipment may sit.
        if (e.y > 5000) expect(roomTypes.has(e.type), `${e.type} at y=${e.y}`).toBe(true);
      }
      for (const c of pkg.channels) {
        const need = needsPhantom(c.mic);
        if (need !== null) expect(c.phantom, `${c.name} (${c.mic})`).toBe(need);
      }
    });
  }

  test('only theatre carries lights, and no package fixes a console model', () => {
    for (const p of PACKAGES) {
      const hasLights = p.elements.some((e) => itemById(e.type)!.layer === 'lights');
      expect(hasLights, p.id).toBe(p.id === 'theatre');
      const show = showFromPackage(p, 'x');
      expect(show.desk.model ?? '').toBe('');
    }
  });

  test('every computer in a package has functions and a system', () => {
    const dj = showFromPackage(packageById('dj')!, 'DJ');
    const laptop = Object.values(dj.elements).find((e) => e.computer)!;
    expect(laptop.computer!.functions).toEqual(['sound']);
    expect(laptop.layerId).toBe('l-control');
  });
});
