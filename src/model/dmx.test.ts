import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { fixtureById, OFL_FIXTURES } from '../library/models.ts';
import { packageById } from '../library/packages.ts';
import { buildReport } from '../reports/reports.ts';
import { RULES } from '../validate/rules.ts';
import { autoAddress, modeLabel, setUniverseInfo, slotsOf, universeInfo, universesInUse } from './dmx.ts';
import { emptyLuminaire, setFixtureModel, updateLuminaire } from './lights.ts';
import { newShow } from './new.ts';
import { addElement, updateElement } from './ops.ts';
import type { Show } from './schema.ts';

const base = (): Show => newShow('t', ['lights', 'document']);
const put = (show: Show, x: number, patch: Partial<ReturnType<typeof emptyLuminaire>> = {}): [Show, string] => {
  const layer = show.layers.find((l) => l.subject === 'lights')!.id;
  const [s, e] = addElement(show, { type: { id: 'light.led-par', version: 1 }, x, y: 0, layerId: layer });
  return [updateElement(s, e.id, { luminaire: { ...emptyLuminaire(), ...patch } }), e.id];
};
const SPOT = 'ofl.chauvet-dj.intimidator-spot-160';

describe('channels of a luminaire', () => {
  test('every imported fixture has modes with a positive channel count', () => {
    expect(OFL_FIXTURES.length).toBeGreaterThan(600);
    for (const f of OFL_FIXTURES) for (const [, n] of f.modes ?? []) expect(n).toBeGreaterThan(0);
  });
  test('choosing a model picks its first mode, and a typed count wins', () => {
    let [s, a] = put(base(), 0);
    s = setFixtureModel(s, a, fixtureById(SPOT)!);
    const l = s.elements[a]!.luminaire!;
    expect(l.dmxMode).toBe('11ch');
    expect(slotsOf(l)).toBe(11);
    expect(modeLabel(l)).toBe('11ch (11)');
    expect(slotsOf({ ...l, dmxMode: '5ch' })).toBe(5);
    expect(slotsOf({ ...l, dmxSlots: 20 })).toBe(20);
    expect(slotsOf(emptyLuminaire())).toBeNull();
  });
});

describe('rules with channel ranges', () => {
  test('a fixture inside the range of another overlaps, the next free address does not', () => {
    let [s, a] = put(base(), 0, { universe: 1, address: 1, dmxSlots: 11 });
    let b: string;
    [s, b] = put(s, 500, { universe: 1, address: 11, dmxSlots: 5 });
    expect(RULES.dmxOverlap(s)[0]).toMatchObject({ severity: 'error', ref: { id: b }, vars: { universe: 1, address: 11 } });
    expect(RULES.dmxOverlap(updateLuminaire(s, b, { address: 12 }))).toEqual([]);
    expect(RULES.dmxOverlap(updateLuminaire(s, b, { universe: 2 }))).toEqual([]);
    expect(a).toBeTruthy();
  });
  test('without a known count the fixture takes one channel', () => {
    let [s] = put(base(), 0, { universe: 1, address: 5 });
    [s] = put(s, 500, { universe: 1, address: 6 });
    expect(RULES.dmxOverlap(s)).toEqual([]);
  });
  test('running past 512 is flagged', () => {
    const [s] = put(base(), 0, { universe: 1, address: 510, dmxSlots: 11 });
    expect(RULES.dmxBeyond(s)[0]).toMatchObject({ severity: 'warning', vars: { address: 510, slots: 11 } });
  });
});

describe('universes', () => {
  const two = () => {
    let [s] = put(base(), 0, { universe: 2, address: 1 });
    [s] = put(s, 500, { universe: 1, address: 1 });
    return s;
  };
  test('the ones in use, in order, plain DMX until something is said', () => {
    const s = two();
    expect(universesInUse(s)).toEqual([1, 2]);
    expect(universeInfo(s, 1)).toEqual({ protocol: 'dmx', net: '', output: '' });
  });
  test('going back to plain DMX with nothing said takes no room in the file', () => {
    let s = setUniverseInfo(two(), 1, { protocol: 'sacn', net: '101' });
    expect(universeInfo(s, 1).net).toBe('101');
    s = setUniverseInfo(s, 1, { protocol: 'dmx', net: '' });
    expect(s.universes).toEqual({});
  });
  test('the same number twice on one protocol is an error, on two protocols it is not', () => {
    let s = setUniverseInfo(setUniverseInfo(two(), 1, { protocol: 'sacn', net: '5' }), 2, { protocol: 'sacn', net: '5' });
    expect(RULES.universeRepeated(s)[0]).toMatchObject({ severity: 'error', vars: { universe: 2, other: 1, net: '5' } });
    s = setUniverseInfo(s, 2, { protocol: 'artnet' });
    expect(RULES.universeRepeated(s)).toEqual([]);
  });
  test('the report lists every universe in use', () => {
    const s = setUniverseInfo(two(), 2, { protocol: 'artnet', net: '0:0:1', output: 'Nodo truss' });
    expect(buildReport(s, 'universes').rows).toEqual([['1', 'DMX', '', ''], ['2', 'Art-Net', '0:0:1', 'Nodo truss']]);
  });
});

describe('addressing', () => {
  test('consecutive addresses, the next universe when one does not fit, and unknown counts left alone', () => {
    let [s, a] = put(base(), 0, { dmxSlots: 500 });
    let b: string, c: string, d: string;
    [s, b] = put(s, 100, { dmxSlots: 12 });
    [s, c] = put(s, 200, { dmxSlots: 1 });
    [s, d] = put(s, 300);
    s = autoAddress(s);
    const at = (id: string) => [s.elements[id]!.luminaire!.universe, s.elements[id]!.luminaire!.address];
    expect(at(a)).toEqual([1, 1]);
    expect(at(b)).toEqual([1, 501]);
    expect(at(c)).toEqual([2, 1]);
    expect(at(d)).toEqual([null, null]);
    expect(RULES.dmxOverlap(s)).toEqual([]);
  });
});

describe('reports', () => {
  test('DMX addresses go by universe and address with the end channel', () => {
    let [s] = put(base(), 0, { universe: 2, address: 1, dmxSlots: 4 });
    [s] = put(s, 100, { universe: 1, address: 10, dmxSlots: 6 });
    const { rows } = buildReport(s, 'dmx');
    expect(rows.map((r) => r.slice(0, 3))).toEqual([['1', '10', '15'], ['2', '1', '4']]);
  });
  test('the IP list has only the elements with one, in numeric order', () => {
    let [s, a] = put(base(), 0);
    let b: string;
    [s, b] = put(s, 100);
    [s] = put(s, 200);
    s = updateElement(updateElement(s, a, { ip: '10.0.0.20' }), b, { ip: '10.0.0.3' });
    expect(buildReport(s, 'network').rows.map((r) => r[2])).toEqual(['10.0.0.3', '10.0.0.20']);
  });
  test('the examples stay free of DMX warnings', () => {
    for (const id of ['rock', 'theatre', 'dj', 'av']) {
      const p = packageById(id);
      if (!p) continue;
      const show = showFromPackage(p, id, 'es');
      expect(RULES.dmxOverlap(show)).toEqual([]);
      expect(RULES.dmxBeyond(show)).toEqual([]);
    }
  });
});
