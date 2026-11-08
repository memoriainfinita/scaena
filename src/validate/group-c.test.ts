import { describe, expect, test } from 'vitest';
import { buildDocument } from '../document/typst-source.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { addChannel, addOutput, drawnWedges, numberWedges, outputList, updateChannel, updateOutput, wedgesInOrder } from '../model/audio.ts';
import { addConnection, updateConnection } from '../model/connections.ts';
import { newShow } from '../model/new.ts';
import { addElement, updateElement } from '../model/ops.ts';
import { stagePosition } from '../model/position.ts';
import type { Show } from '../model/schema.ts';
import { buildReport } from '../reports/reports.ts';
import { RULES, validate } from './rules.ts';

const base = (): Show => ({ ...newShow('t', ['audio', 'lights', 'document', 'computers']), date: '2026-11-05', contacts: [{ id: 'c1', role: 'Técnico', name: 'Ana', phone: '600', email: 'a@b.c', hidden: [] }] });
const put = (show: Show, type: string, x: number, y: number): [Show, string] => {
  const layer = show.layers.find((l) => l.subject === 'audio')!.id;
  const [s, e] = addElement(show, { type: { id: type, version: 1 }, x, y, layerId: layer });
  return [s, e.id];
};

describe('patch', () => {
  test('the same patch on two channels is flagged once, on the later one, ignoring case and spaces', () => {
    let show = base();
    const ids: string[] = [];
    for (const p of ['SB A 1', 'sb a 1 ', 'SB A 2', '']) {
      const [s, c] = addChannel(show, { shortName: 'x', mic: 'y', patch: p });
      show = s;
      ids.push(c.id);
    }
    const found = RULES.duplicatePatch(show);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ severity: 'warning', ref: { kind: 'channel', id: ids[1] }, vars: { other: 1, n: 2 } });
  });
  test('an empty patch is never a duplicate', () => {
    let show = base();
    for (let i = 0; i < 3; i++) show = addChannel(show, { shortName: 'x', mic: 'y' })[0];
    expect(RULES.duplicatePatch(show)).toEqual([]);
  });
});

describe('connections and addresses', () => {
  const pair = (typeA: string, typeB: string, signal: 'audio' | 'video' | 'lightControl' | 'network') => {
    let show = base();
    let a: string;
    let b: string;
    [show, a] = put(show, typeA, 1000, 1000);
    [show, b] = put(show, typeB, 3000, 1000);
    const [next, c] = addConnection(show, a, b, signal);
    return { show: next, a, b, c: c! };
  };
  test('a video cable on an element that is not video is flagged on that element', () => {
    const { show, b } = pair('control.videomixer', 'kit.drums5', 'video');
    const found = RULES.connectionMismatch(show);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ ref: { kind: 'element', id: b }, vars: { signal: 'video' } });
  });
  test('a network cable is never judged, and a matching pair is quiet', () => {
    expect(RULES.connectionMismatch(pair('kit.drums5', 'amp.guitar', 'network').show)).toEqual([]);
    expect(RULES.connectionMismatch(pair('control.videomixer', 'control.tablet', 'video').show)).toEqual([]);
  });
  test('a cable longer than its connector usually allows is flagged, a short or unmeasured one is not', () => {
    const { show, a, c } = pair('control.videomixer', 'control.tablet', 'video');
    expect(RULES.cableTooLong(show)).toEqual([]);
    const long = updateConnection(show, c.id, { connector: 'HDMI', lengthMm: 20000 });
    expect(RULES.cableTooLong(long)).toHaveLength(1);
    expect(RULES.cableTooLong(long)[0]).toMatchObject({ ref: { kind: 'element', id: a }, vars: { connector: 'HDMI', m: 20, max: 15 } });
    expect(RULES.cableTooLong(updateConnection(show, c.id, { connector: 'HDMI', lengthMm: 10000 }))).toEqual([]);
    expect(RULES.cableTooLong(updateConnection(show, c.id, { connector: 'cosa rara', lengthMm: 99999 }))).toEqual([]);
  });
  test('the same IP on two elements is an error on the second, ignoring case and spaces', () => {
    let show = base();
    let a: string;
    let b: string;
    [show, a] = put(show, 'control.tablet', 500, 500);
    [show, b] = put(show, 'control.videomixer', 900, 500);
    show = updateElement(updateElement(show, a, { ip: '192.168.1.10' }), b, { ip: ' 192.168.1.10 ' });
    const found = RULES.ipDuplicate(show);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ severity: 'error', ref: { kind: 'element', id: b } });
    expect(RULES.ipDuplicate(updateElement(show, b, { ip: '' }))).toEqual([]);
  });
});

describe('silencing a warning', () => {
  const withIssue = () => addChannel(base(), { shortName: '' })[0];
  test('a silenced finding stays in the list marked as muted, others are untouched', () => {
    const show = withIssue();
    const found = validate(show);
    expect(found.some((i) => i.muted)).toBe(false);
    const key = found.find((i) => i.rule === 'channelUnnamed')!.key;
    const muted = validate({ ...show, muted: [key] });
    expect(muted.find((i) => i.key === key)!.muted).toBe(true);
    expect(muted.filter((i) => !i.muted)).toHaveLength(found.length - 1);
  });
  test('the key is stable across edits that do not touch the finding', () => {
    const show = withIssue();
    const key = validate(show).find((i) => i.rule === 'channelUnnamed')!.key;
    const edited = { ...show, name: 'otro nombre' };
    expect(validate(edited).find((i) => i.rule === 'channelUnnamed')!.key).toBe(key);
  });
});

describe('numbering the wedges', () => {
  const stage = (): { show: Show; ids: string[] } => {
    let show = base();
    const ids: string[] = [];
    // Three wedges; the numbers are given in the wrong order on purpose: right, left, centre.
    for (const x of [6000, 1000, 3500]) {
      let id: string;
      [show, id] = put(show, 'monitor.wedge', x, 4000);
      const [s, o] = addOutput(show, { kind: 'wedge', sourceElementId: id });
      show = s;
      ids.push(o.id);
    }
    return { show, ids };
  };
  test('the numbers the wedges hold are shared out left to right', () => {
    const { show, ids } = stage();
    expect(wedgesInOrder(show)).toBe(false);
    const fixed = numberWedges(show);
    expect(wedgesInOrder(fixed)).toBe(true);
    expect(fixed.outputs[ids[1]!]!.number).toBe(1); // the left one
    expect(fixed.outputs[ids[2]!]!.number).toBe(2);
    expect(fixed.outputs[ids[0]!]!.number).toBe(3);
    expect(outputList(fixed).map((o) => o.number)).toEqual([1, 2, 3]);
    expect(RULES.monitorOrder(fixed)).toEqual([]);
  });
  test('at the same x the one in front (larger y) comes first', () => {
    let show = base();
    let a: string;
    let b: string;
    [show, a] = put(show, 'monitor.wedge', 2000, 1000);
    [show, b] = put(show, 'monitor.wedge', 2000, 4000);
    const [s1, oa] = addOutput(show, { kind: 'wedge', sourceElementId: a });
    const [s2, ob] = addOutput(s1, { kind: 'wedge', sourceElementId: b });
    const fixed = numberWedges(s2);
    expect(fixed.outputs[ob.id]!.number).toBe(1);
    expect(fixed.outputs[oa.id]!.number).toBe(2);
  });
  test('other outputs keep their numbers, and an ordered set is returned untouched', () => {
    const { show } = stage();
    const [withMain, main] = addOutput(show, { kind: 'main' });
    const before = main.number;
    const fixed = numberWedges(withMain);
    expect(fixed.outputs[main.id]!.number).toBe(before);
    expect(numberWedges(fixed)).toBe(fixed);
    expect(drawnWedges(fixed)).toHaveLength(3);
    expect(updateOutput(fixed, main.id, {}).outputs[main.id]!.number).toBe(before);
  });
});

describe('position on the inputs list', () => {
  test('stage position codes follow the thirds of the stage', () => {
    const show = base();
    const { width, depth } = { width: 8000, depth: 5000 };
    expect(show.stage.shape).toMatchObject({ width, depth });
    expect(stagePosition(show, { x: 4000, y: 2500 })).toBe('CS');
    expect(stagePosition(show, { x: 500, y: 500 })).toBe('USR'); // the plan is seen from the audience: small x is stage right
    expect(stagePosition(show, { x: 7500, y: 4800 })).toBe('DSL');
    expect(stagePosition(show, { x: 4000, y: 500 })).toBe('US');
    expect(stagePosition(show, { x: 7500, y: 2500 })).toBe('SL');
  });
  test('the inputs report and the PDF carry patch and position, with a legend', () => {
    let show = showFromPackage(packageById('rock')!, 'r', 'es');
    const first = Object.values(show.channels).find((c) => c.sourceElementId)!;
    show = updateChannel(show, first.id, { patch: 'SB A 12' });
    const r = buildReport(show, 'inputs')!;
    expect(r.header).toEqual(expect.arrayContaining(['Patch', 'Pos.']));
    expect(r.rows.every((x) => x.length === r.header.length)).toBe(true);
    const row = r.rows.find((x) => x[4] === 'SB A 12')!;
    expect(row[r.header.indexOf('Pos.')]).not.toBe('');
    const doc = buildDocument(show);
    expect(doc.source).toContain('SB A 12');
    expect(doc.source).toContain('US fondo');
    expect(buildDocument({ ...show, lang: 'en' }).source).toContain('US upstage');
  });
});

describe('the new rules on a built package', () => {
  test('fire on nothing in a freshly built rock package', () => {
    const show = showFromPackage(packageById('rock')!, 'r', 'es');
    for (const r of ['duplicatePatch', 'connectionMismatch', 'cableTooLong', 'ipDuplicate'] as const) expect(RULES[r](show)).toEqual([]);
  });
});

describe('signal flow', () => {
  const cable = (show: Show, from: string, to: string, signal: 'audio' | 'network' | 'lightControl', connector?: string) => addConnection(show, from, to, signal, connector)[0];

  test('with audio cables drawn, a channel or output whose element has none is pointed out', () => {
    let [show, mic] = put(base(), 'vocals.mic-stand', 0, 0);
    let wedge: string, box: string, other: string;
    [show, wedge] = put(show, 'monitor.wedge', 1000, 0);
    [show, box] = put(show, 'rack.stagebox', 2000, 0);
    [show, other] = put(show, 'guitar.electric', 3000, 0);
    const [s1, c] = addChannel(show, { shortName: 'v', mic: 'x', sourceElementId: mic });
    const [s2, o] = addOutput(s1, { kind: 'wedge', sourceElementId: wedge });
    expect(RULES.channelNotCabled(s2)).toEqual([]);
    expect(RULES.outputNotCabled(s2)).toEqual([]);
    const wired = cable(s2, other, box, 'audio');
    expect(RULES.channelNotCabled(wired).map((i) => i.ref.id)).toEqual([c.id]);
    expect(RULES.outputNotCabled(wired).map((i) => i.ref.id)).toEqual([o.id]);
    expect(RULES.channelNotCabled(updateChannel(wired, c.id, { patch: 'SB 1' }))).toEqual([]);
    expect(RULES.channelNotCabled(cable(wired, mic, box, 'audio'))).toEqual([]);
  });

  test('a wireless source needs no cable', () => {
    const [show, mic] = put(base(), 'vocals.headset', 0, 0);
    const [s0, a] = put(show, 'guitar.electric', 1000, 0);
    const [s1, b] = put(s0, 'rack.stagebox', 2000, 0);
    const [s2] = addChannel(s1, { shortName: 'v', mic: 'x', sourceElementId: mic });
    expect(RULES.channelNotCabled(cable(s2, a, b, 'audio'))).toEqual([]);
  });

  const fixtures = (n: number): [Show, string[]] => {
    let show = base();
    const ids: string[] = [];
    for (let i = 0; i < n; i++) {
      let id: string;
      [show, id] = put(show, 'light.par', i * 300, 0);
      show = updateElement(show, id, { luminaire: { ...show.elements[id]!.luminaire!, universe: 1, address: i + 1 } });
      ids.push(id);
    }
    return [show, ids];
  };

  test('more than 32 fixtures on one DMX line without a splitter', () => {
    const [start, ids] = fixtures(33);
    let show = start;
    for (let i = 1; i < 32; i++) show = cable(show, ids[i - 1]!, ids[i]!, 'lightControl', 'DMX 5');
    expect(RULES.dmxChainLong(show)).toEqual([]);
    const long = cable(show, ids[31]!, ids[32]!, 'lightControl', 'DMX 5');
    expect(RULES.dmxChainLong(long)).toHaveLength(1);
    expect(RULES.dmxChainLong(long)[0]!.vars).toMatchObject({ n: 33, max: 32 });
    let split = show;
    let splitter: string;
    [split, splitter] = put(split, 'net.dmx-splitter', 0, 1000);
    split = cable(cable(split, ids[31]!, splitter, 'lightControl', 'DMX 5'), splitter, ids[32]!, 'lightControl', 'DMX 5');
    expect(RULES.dmxChainLong(split)).toEqual([]);
  });

  test('a ring of network cables is a loop; a tree is not', () => {
    let [show, a] = put(base(), 'rack.network', 0, 0);
    let b: string, c: string;
    [show, b] = put(show, 'rack.network', 1000, 0);
    [show, c] = put(show, 'control.laptop', 2000, 0);
    const tree = cable(cable(show, a, b, 'network'), b, c, 'network');
    expect(RULES.networkLoop(tree)).toEqual([]);
    expect(RULES.networkLoop(cable(tree, c, a, 'network'))).toHaveLength(1);
  });
});

describe('racks in the document', () => {
  test('every rack is under its own name', () => {
    const [show, id] = put(base(), 'rack.amps', 0, 0);
    const named = updateElement(show, id, { label: 'Rack de ampliS', rack: { units: 4, slots: [{ id: 's1', name: 'Ampli A', u: 2 }] } });
    const doc = buildDocument({ ...named, document: { ...named.document, sections: [...named.document.sections, 'racks'] } });
    expect(doc.source).toContain('== #"Rack de ampliS"');
  });
});
