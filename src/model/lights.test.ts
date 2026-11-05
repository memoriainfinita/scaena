import { describe, expect, test } from 'vitest';
import { packageById } from '../library/packages.ts';
import { showFromPackage } from '../library/apply.ts';
import { addMount, autoNumber, circuitLoads, dimmerLoads, emptyLuminaire, luminaires, mountStats, phaseLoads, removeMount, setCircuitPhase, setDimmerMax, setFixtureModel, updateLuminaire, updateMount } from './lights.ts';
import { newShow } from './new.ts';
import { addElement } from './ops.ts';
import type { Show } from './schema.ts';

function plot(): [Show, string[]] {
  let show = newShow('t');
  const ids: string[] = [];
  for (const [x, y] of [[3000, 1000], [1000, 1000], [2000, 3000]] as const) {
    const [s, e] = addElement(show, { type: { id: 'light.ellipsoidal', version: 1 }, x, y, layerId: 'l-lights', luminaire: emptyLuminaire(), powerW: 750, weightKg: 6.8 });
    show = s;
    ids.push(e.id);
  }
  return [show, ids];
}

describe('mounts', () => {
  test('add, edit and remove; removing leaves the luminaires on the plan, unmounted', () => {
    const [start, ids] = plot();
    let show = start;
    const [s_m, m] = addMount(show, { kind: 'bar', name: 'Vara 1', from: { x: 0, y: 1000 }, to: { x: 4000, y: 1000 }, heightMm: 5000 });
    show = s_m;
    show = updateMount(show, m.id, { maxLoadKg: 100 });
    show = updateLuminaire(show, ids[0]!, { mountId: m.id });
    expect(show.mounts[m.id]).toMatchObject({ name: 'Vara 1', maxLoadKg: 100, heightMm: 5000 });
    show = removeMount(show, m.id);
    expect(show.mounts).toEqual({});
    expect(show.elements[ids[0]!]!.luminaire!.mountId).toBeNull();
    expect(show.elements[ids[0]!]).toBeDefined();
  });
});

describe('numbering', () => {
  test('units follow the mounts and then left to right', () => {
    const [start, ids] = plot();
    let show = start;
    const [s1, a] = addMount(show, { kind: 'bar', name: 'Vara 1', from: { x: 0, y: 1000 }, to: { x: 4000, y: 1000 } });
    const [s2, b] = addMount(s1, { kind: 'floor', name: 'Suelo', from: { x: 0, y: 3000 }, to: { x: 4000, y: 3000 } });
    show = s2;
    show = updateLuminaire(show, ids[0]!, { mountId: a.id });
    show = updateLuminaire(show, ids[1]!, { mountId: a.id });
    show = updateLuminaire(show, ids[2]!, { mountId: b.id });
    show = autoNumber(show);
    expect(show.elements[ids[1]!]!.luminaire!.unit).toBe(1); // x 1000
    expect(show.elements[ids[0]!]!.luminaire!.unit).toBe(2); // x 3000
    expect(show.elements[ids[2]!]!.luminaire!.unit).toBe(3); // other mount
  });

  test('unmounted luminaires go last', () => {
    const [start, ids] = plot();
    let show = start;
    const [s_a, a] = addMount(show, { kind: 'bar', name: 'Vara 1', from: { x: 0, y: 0 }, to: { x: 1, y: 0 } });
    show = s_a;
    show = updateLuminaire(show, ids[2]!, { mountId: a.id });
    show = autoNumber(show);
    expect(show.elements[ids[2]!]!.luminaire!.unit).toBe(1);
  });
});

describe('fixture models', () => {
  test('a model sets weight and power; a model without them leaves the user values', () => {
    const [show, ids] = plot();
    const s1 = setFixtureModel(show, ids[0]!, { id: 'etc.s4-19', weightKg: 6.3, powerW: 575 });
    expect(s1.elements[ids[0]!]).toMatchObject({ weightKg: 6.3, powerW: 575 });
    expect(s1.elements[ids[0]!]!.luminaire!.modelId).toBe('etc.s4-19');
    const s2 = setFixtureModel(s1, ids[0]!, { id: 'generic.pc-1k', weightKg: null, powerW: 1000 });
    expect(s2.elements[ids[0]!]).toMatchObject({ weightKg: 6.3, powerW: 1000 });
    expect(setFixtureModel(s2, ids[0]!, null).elements[ids[0]!]!.luminaire!.modelId).toBeNull();
  });
});

describe('load', () => {
  test('mount stats count, add weight and power, and flag an overloaded bar', () => {
    const [start, ids] = plot();
    let show = start;
    const [s_m, m] = addMount(show, { kind: 'bar', name: 'Vara 1', from: { x: 0, y: 0 }, to: { x: 1, y: 0 }, maxLoadKg: 10 });
    show = s_m;
    show = updateLuminaire(show, ids[0]!, { mountId: m.id });
    show = updateLuminaire(show, ids[1]!, { mountId: m.id });
    const stats = mountStats(show);
    expect(stats).toHaveLength(2); // the bar and the one left unmounted
    expect(stats[0]).toMatchObject({ mountId: m.id, count: 2, weightKg: 13.6, powerW: 1500, overloaded: true });
    expect(stats[1]).toMatchObject({ mountId: null, count: 1 });
  });

  test('circuits give power and amps at the show voltage, and phases add them up', () => {
    const [start, ids] = plot();
    let show = start;
    show = { ...show, region: { ...show.region, voltage: 230 } };
    show = updateLuminaire(show, ids[0]!, { circuit: 1 });
    show = updateLuminaire(show, ids[1]!, { circuit: 1 });
    show = updateLuminaire(show, ids[2]!, { circuit: 2 });
    show = setCircuitPhase(show, 1, 1);
    expect(circuitLoads(show)).toEqual([
      { circuit: 1, count: 2, powerW: 1500, amps: 6.52, phase: 1 },
      { circuit: 2, count: 1, powerW: 750, amps: 3.26, phase: null },
    ]);
    expect(phaseLoads(show)).toEqual([
      { phase: 1, powerW: 1500, amps: 6.52 },
      { phase: null, powerW: 750, amps: 3.26 },
    ]);
    show = setCircuitPhase(show, 1, 2);
    expect(show.electrical.circuits).toHaveLength(1);
  });

  test('a dimmer over its maximum is flagged', () => {
    const [start, ids] = plot();
    let show = start;
    show = updateLuminaire(show, ids[0]!, { dimmer: 5 });
    show = updateLuminaire(show, ids[1]!, { dimmer: 5 });
    show = setDimmerMax(show, 5, 1200);
    expect(dimmerLoads(show)).toEqual([{ dimmer: 5, count: 2, powerW: 1500, maxW: 1200, overloaded: true }]);
    show = setDimmerMax(show, 5, 2400);
    expect(dimmerLoads(show)[0]!.overloaded).toBe(false);
  });
});

describe('packages with lights', () => {
  test('the theatre package hangs its lights from one bar', () => {
    const show = showFromPackage(packageById('theatre')!, 't', 'es');
    const lit = luminaires(show);
    expect(lit.length).toBeGreaterThan(0);
    const bars = Object.values(show.mounts);
    expect(bars).toHaveLength(1);
    expect(lit.every((e) => e.luminaire!.mountId === bars[0]!.id)).toBe(true);
    expect(bars[0]!.name).toBe('Vara 1');
  });
  test('a package without lights has no mounts', () => {
    expect(showFromPackage(packageById('rock')!, 't', 'es').mounts).toEqual({});
  });
});

describe('breakers', () => {
  test('a breaker is set per phase by name and updated in place', async () => {
    const { setPhaseBreaker } = await import('./lights.ts');
    const show = newShow('t');
    const s1 = setPhaseBreaker(show, 2, 16);
    expect(s1.electrical.phases).toEqual([expect.objectContaining({ name: 'L2', breakerA: 16 })]);
    const s2 = setPhaseBreaker(s1, 2, 25);
    expect(s2.electrical.phases).toHaveLength(1);
    expect(s2.electrical.phases[0]!.breakerA).toBe(25);
    expect(setPhaseBreaker(s2, 2, null).electrical.phases[0]!.breakerA).toBeNull();
  });
});
