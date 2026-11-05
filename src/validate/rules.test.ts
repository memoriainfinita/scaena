import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { addChannel, addOutput, setStereoPair, updateChannel } from '../model/audio.ts';
import { addMount, emptyLuminaire, setCircuitPhase, setDimmerMax, updateLuminaire, updateMount } from '../model/lights.ts';
import { newShow } from '../model/new.ts';
import { addElement, updateElement } from '../model/ops.ts';
import type { Show } from '../model/schema.ts';
import { RULES, SEVERITY_OF, validate, type RuleId } from './rules.ts';

const base = (): Show => ({ ...newShow('t', ['audio', 'lights', 'document']), date: '2026-11-05', contacts: [{ id: 'c1', role: 'Técnico', name: 'Ana', phone: '600', email: 'a@b.c', hidden: [] }] });
const only = (show: Show, rule: RuleId) => RULES[rule](show);
const el = (show: Show, type: string, x: number, y: number, extra = {}): [Show, string] => {
  const [s, e] = addElement(show, { type: { id: type, version: 1 }, x, y, layerId: type.startsWith('light') ? 'l-lights' : type.startsWith('power') ? 'l-electrical' : 'l-audio', ...extra });
  return [s, e.id];
};

describe('audio rules', () => {
  test('a stereo pair that starts on an even channel', () => {
    let show = base();
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const [s, c] = addChannel(show, { shortName: `c${i}`, mic: 'x' });
      show = s;
      ids.push(c.id);
    }
    expect(only(setStereoPair(show, ids[0]!, ids[1]!), 'stereoPairOdd')).toEqual([]);
    const bad = only(setStereoPair(show, ids[1]!, ids[2]!), 'stereoPairOdd');
    expect(bad).toHaveLength(1);
    expect(bad[0]).toMatchObject({ severity: 'warning', ref: { kind: 'channel', id: ids[1] }, vars: { a: 2, b: 3 } });
  });

  test('a channel without short name or microphone says which', () => {
    const [show] = addChannel(base(), { shortName: 'Bombo' });
    const r = only(show, 'channelUnnamed');
    expect(r).toHaveLength(1);
    expect(r[0]!.list).toEqual(['mic']);
  });

  test('gaps in the numbering, only when a file has them', () => {
    let [show] = addChannel(base());
    expect(only(show, 'channelGaps')).toEqual([]);
    const id = Object.keys(show.channels)[0]!;
    show = { ...show, channels: { [id]: { ...show.channels[id]!, number: 3 } } };
    expect(only(show, 'channelGaps')[0]).toMatchObject({ severity: 'tip', vars: { n: 1 } });
  });

  test('a channel that points at an element that is not there is an error', () => {
    const [show] = addChannel(base(), { shortName: 'a', mic: 'b', sourceElementId: 'e99' });
    expect(only(show, 'danglingSource')[0]).toMatchObject({ severity: 'error', ref: { kind: 'channel' } });
  });

  test('an element that suggests channels and has none', () => {
    const [show, id] = el(base(), 'amp.guitar', 1000, 1000);
    expect(only(show, 'sourceWithoutChannel')[0]).toMatchObject({ ref: { kind: 'element', id } });
    const [withCh] = addChannel(show, { shortName: 'g', mic: 'm', sourceElementId: id });
    expect(only(withCh, 'sourceWithoutChannel')).toEqual([]);
  });

  test('monitors numbered against left to right', () => {
    let show = base();
    let a: string;
    let b: string;
    [show, a] = el(show, 'monitor.wedge', 1000, 4000);
    [show, b] = el(show, 'monitor.wedge', 3000, 4000);
    const [s1, o1] = addOutput(show, { kind: 'wedge', sourceElementId: b });
    const [s2] = addOutput(s1, { kind: 'wedge', sourceElementId: a });
    expect(only(s2, 'monitorOrder')[0]).toMatchObject({ severity: 'tip', ref: { kind: 'output', id: o1.id } });
    const [t1] = addOutput(show, { kind: 'wedge', sourceElementId: a });
    const [t2] = addOutput(t1, { kind: 'wedge', sourceElementId: b });
    expect(only(t2, 'monitorOrder')).toEqual([]);
  });

  test('a wedge asked for and not drawn, and one drawn and not asked for', () => {
    const [show, id] = el(base(), 'monitor.wedge', 1000, 4000);
    const [withAsk] = addOutput(show, { kind: 'wedge' });
    const r = only(withAsk, 'wedgeMismatch');
    expect(r.map((i) => i.vars.side).sort()).toEqual(['asked', 'drawn']);
    expect(r.find((i) => i.vars.side === 'drawn')!.ref.id).toBe(id);
  });

  test('an element of a non-standard kind with no supplier is a tip, a mic stand is not', () => {
    const [show] = el(base(), 'amp.guitar', 0, 0);
    expect(only(show, 'unmarkedSupplier')).toHaveLength(1);
    const [stand] = el(base(), 'vocals.mic-stand', 0, 0);
    expect(only(stand, 'unmarkedSupplier')).toEqual([]);
    const [marked, id] = el(base(), 'amp.guitar', 0, 0);
    expect(only(updateElement(marked, id, { suppliedBy: 'band' }), 'unmarkedSupplier')).toEqual([]);
  });
});

describe('plan rule', () => {
  test('an outlet with no label', () => {
    const [show, id] = el(base(), 'power.outlet', 0, 0);
    expect(only(show, 'outletUnmarked')).toHaveLength(1);
    expect(only(updateElement(show, id, { label: '16 A' }), 'outletUnmarked')).toEqual([]);
  });
});

describe('lights and electrical rules', () => {
  const light = (show: Show, x: number, extra = {}): [Show, string] => el(show, 'light.ellipsoidal', x, 1000, { luminaire: emptyLuminaire(), powerW: 750, ...extra });

  test('two instruments at the same universe and address', () => {
    let [show, a] = light(base(), 1000);
    let b: string;
    [show, b] = light(show, 2000);
    show = updateLuminaire(updateLuminaire(show, a, { universe: 1, address: 10 }), b, { universe: 1, address: 10 });
    expect(only(show, 'dmxOverlap')[0]).toMatchObject({ severity: 'error', vars: { universe: 1, address: 10 } });
    expect(only(updateLuminaire(show, b, { address: 11 }), 'dmxOverlap')).toEqual([]);
  });

  test('a dimmer over its maximum', () => {
    let [show, a] = light(base(), 1000);
    let b: string;
    [show, b] = light(show, 2000);
    show = updateLuminaire(updateLuminaire(show, a, { dimmer: 1 }), b, { dimmer: 1 });
    expect(only(show, 'dimmerOverload')).toEqual([]);
    expect(only(setDimmerMax(show, 1, 1000), 'dimmerOverload')[0]).toMatchObject({ severity: 'error', vars: { dimmer: 1, w: 1500, max: 1000 } });
  });

  test('repeated unit numbers', () => {
    let [show, a] = light(base(), 1000);
    let b: string;
    [show, b] = light(show, 2000);
    show = updateLuminaire(updateLuminaire(show, a, { unit: 4 }), b, { unit: 4 });
    expect(only(show, 'unitsDuplicated')).toHaveLength(1);
  });

  test('a phase over its breaker', () => {
    let [show, a] = light(base(), 1000, { powerW: 2300 });
    show = { ...show, region: { ...show.region, voltage: 230 }, electrical: { ...show.electrical, phases: [{ id: 'p1', name: 'L1', breakerA: 8 }] } };
    show = setCircuitPhase(updateLuminaire(show, a, { circuit: 1 }), 1, 1);
    expect(only(show, 'phaseBreaker')[0]).toMatchObject({ severity: 'error', vars: { phase: 1, amps: 10, max: 8 } });
    show = { ...show, electrical: { ...show.electrical, phases: [{ id: 'p1', name: 'L1', breakerA: 16 }] } };
    expect(only(show, 'phaseBreaker')).toEqual([]);
  });

  test('a bar over its maximum load', () => {
    let [show, a] = light(base(), 1000, { weightKg: 20 });
    let m;
    [show, m] = addMount(show, { kind: 'bar', name: 'Vara 1', from: { x: 0, y: 0 }, to: { x: 1, y: 0 } });
    show = updateLuminaire(show, a, { mountId: m.id });
    expect(only(show, 'mountOverload')).toEqual([]);
    expect(only(updateMount(show, m.id, { maxLoadKg: 10 }), 'mountOverload')[0]).toMatchObject({ severity: 'error', vars: { name: 'Vara 1', kg: 20, max: 10 } });
  });

  test('an instrument says what it lacks', () => {
    const [show] = light(base(), 1000);
    expect(only(show, 'luminaireMissing')[0]!.list).toEqual(['model', 'mount', 'channel']);
  });
});

describe('document rules', () => {
  test('no contact with name, phone and email', () => {
    const show = { ...base(), contacts: [{ id: 'c1', role: '', name: 'Ana', phone: '', email: '', hidden: [] }] };
    expect(only(show, 'noContact')).toHaveLength(1);
    expect(only(base(), 'noContact')).toEqual([]);
  });
  test('no version date', () => {
    expect(only({ ...base(), date: '' }, 'noDate')).toHaveLength(1);
    expect(only(base(), 'noDate')).toEqual([]);
  });
  test('document rules stay quiet when the document module is off', () => {
    const show = { ...base(), modules: ['audio' as const], date: '', contacts: [] };
    expect(only(show, 'noDate')).toEqual([]);
    expect(only(show, 'noContact')).toEqual([]);
  });
  test('a program that does not exist for the computer system', () => {
    let [show, id] = el(base(), 'control.laptop', 0, 0);
    show = updateElement(show, id, { computer: { functions: ['sound'], os: 'windows', programs: [{ name: 'QLab', version: '', use: '' }], license: '', dongle: false, outputs: [] } });
    expect(only(show, 'programOs')[0]).toMatchObject({ severity: 'warning', vars: { program: 'QLab' }, list: ['macos'] });
  });
});

describe('the whole set', () => {
  test('every rule has a severity and the list comes out errors first with unique keys', () => {
    expect(Object.keys(RULES).sort()).toEqual(Object.keys(SEVERITY_OF).sort());
    let show = base();
    const [s1, c] = addChannel(show, { sourceElementId: 'e99' });
    show = updateChannel(s1, c.id, { shortName: '' });
    const found = validate(show);
    expect(found[0]!.severity).toBe('error');
    expect(new Set(found.map((i) => i.key)).size).toBe(found.length);
  });

  test('a freshly built rock package has no errors', () => {
    const show = showFromPackage(packageById('rock')!, 'r', 'es');
    expect(validate(show).filter((i) => i.severity === 'error')).toEqual([]);
  });
});
