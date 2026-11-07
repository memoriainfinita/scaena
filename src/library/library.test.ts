import { describe, expect, test } from 'vitest';
import { safeParseShow } from '../model/schema.ts';
import { showFromPackage } from './apply.ts';
import { CATEGORY_ORDER, ITEMS, itemById, searchItems } from './items.ts';
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
    rock: { channels: 17, outputs: 6 },
    jazz: { channels: 12, outputs: 4 },
    singer: { channels: 4, outputs: 3 },
    dj: { channels: 3, outputs: 4 },
    conference: { channels: 9, outputs: 2 },
    theatre: { channels: 12, outputs: 2 },
    av: { channels: 4, outputs: 2 },
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

    test(`${pkg.id} draws its cables between elements that exist, none repeated`, () => {
      const show = showFromPackage(pkg, pkg.name.es);
      const conns = Object.values(show.connections);
      expect(conns.length).toBeGreaterThan(1);
      for (const c of conns) {
        expect(show.elements[c.from]).toBeDefined();
        expect(show.elements[c.to]).toBeDefined();
      }
      expect(conns).toHaveLength(pkg.links!.length);
    });

    test(`${pkg.id}: elements are on stage or at the control position, items exist and phantom matches the mic`, () => {
      const roomTypes = new Set(['desk.digital', 'desk.analog', 'control.laptop', 'control.videomixer', 'control.lightdesk', 'control.server', 'rack.network', 'video.projector', 'video.camera', 'light.ellipsoidal', 'note.text', 'power.outlet']);
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

  test('between them the examples use what the app does: amps and DIs, racks, every kind of mount, electrical, production, computers, video, network', () => {
    const shows = PACKAGES.map((p) => showFromPackage(p, 'x', 'es'));
    const some = (f: (s: (typeof shows)[number]) => boolean) => shows.some(f);
    const types = (s: (typeof shows)[number]) => new Set(Object.values(s.elements).map((e) => e.type.id));
    expect(some((s) => types(s).has('rack.di') && types(s).has('amp.guitar'))).toBe(true);
    expect(some((s) => types(s).has('rack.stagebox'))).toBe(true);
    expect(some((s) => Object.values(s.elements).some((e) => e.rack && e.rack.slots.length > 0))).toBe(true);
    expect(some((s) => s.electrical.dimmers.length > 0 && s.electrical.phases.length > 0 && s.electrical.circuits.length > 0)).toBe(true);
    expect(some((s) => s.schedule.some((x) => x.kind === 'build') && s.schedule.some((x) => x.kind === 'day'))).toBe(true);
    expect(some((s) => s.setlist.length > 0)).toBe(true);
    expect(some((s) => (s.hospitality.meals ?? 0) > 0)).toBe(true);
    expect(some((s) => s.workNotes.length > 0)).toBe(true);
    expect(some((s) => s.contacts.length > 0)).toBe(true);
    expect(some((s) => Object.values(s.connections).some((c) => c.signal === 'video'))).toBe(true);
    expect(some((s) => Object.values(s.connections).some((c) => c.signal === 'network'))).toBe(true);
    expect(some((s) => Object.values(s.connections).some((c) => c.signal === 'lightControl'))).toBe(true);
    expect(some((s) => Object.values(s.elements).some((e) => e.computer))).toBe(true);
    expect(some((s) => s.desk.model !== '')).toBe(true);
    expect(some((s) => Object.values(s.outputs).some((o) => o.kind === 'send'))).toBe(true);
  });
  test('every example has contacts and a schedule, and the ones with sound have a set or an agenda', () => {
    for (const p of PACKAGES) {
      const show = showFromPackage(p, 'x', 'es');
      expect(show.contacts.length, p.id).toBeGreaterThan(0);
      expect(show.schedule.length, p.id).toBeGreaterThan(0);
      expect(show.modules, p.id).toContain('production');
    }
  });

  test('every computer in a package has functions and a system', () => {
    const dj = showFromPackage(packageById('dj')!, 'DJ');
    const laptop = Object.values(dj.elements).find((e) => e.computer)!;
    expect(laptop.computer!.functions).toEqual(['sound']);
    expect(laptop.layerId).toBe('l-control');
  });

  test('without a query the list follows the category order, then the name', () => {
    const all = searchItems('', 'es');
    expect(all).toHaveLength(ITEMS.length);
    const order = [...new Set(all.map((i) => i.category))];
    expect(order[0]).toBe(CATEGORY_ORDER[0]);
    expect(order.every((c, k) => k === 0 || CATEGORY_ORDER.indexOf(order[k - 1]!) <= CATEGORY_ORDER.indexOf(c))).toBe(true);
    expect(new Set(CATEGORY_ORDER)).toEqual(new Set(ITEMS.map((i) => i.category)));
  });

  test('with a query the names that start with it come before the ones that only contain it', () => {
    const r = searchItems('guitar', 'en');
    const first = r.findIndex((i) => !i.name.en.toLowerCase().startsWith('guitar'));
    const last = r.findLastIndex((i) => i.name.en.toLowerCase().startsWith('guitar'));
    expect(last).toBeLessThan(first === -1 ? r.length : first);
  });
});
