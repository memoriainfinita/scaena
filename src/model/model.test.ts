import { describe, expect, test } from 'vitest';
import { unpackShow, packShow } from './archive.ts';
import { addChannel, addOutput, channelList, outputList, setMixLevel, setStereoPair } from './audio.ts';
import { History } from './history.ts';
import { nextId } from './ids.ts';
import { loadShow, UnsupportedFormat } from './migrate.ts';
import { newShow } from './new.ts';
import { addElement, moveElements, removeElements, updateElement } from './ops.ts';
import { restore, saveRevision } from './revisions.ts';
import { safeParseShow } from './schema.ts';

const drum = { id: 'kit.drums', version: 1 };

describe('show', () => {
  test('a new show is valid and has the default layers', () => {
    const s = newShow('Cuarteto');
    expect(safeParseShow(s).success).toBe(true);
    expect(s.layers.map((l) => l.subject)).toContain('control');
    expect(s.stage.shape.kind).toBe('rect');
  });

  test('ids are sequential per prefix and live in the show', () => {
    const [a, s] = nextId(newShow('x'), 'e');
    const [b, s2] = nextId(s, 'e');
    const [c] = nextId(s2, 'ch');
    expect([a, b, c]).toEqual(['e1', 'e2', 'ch1']);
    expect(s2.counters).toEqual({ e: 2 });
  });

  test('rejects data that does not fit the model', () => {
    const s = newShow('x');
    expect(safeParseShow({ ...s, paper: 'B5' }).success).toBe(false);
    expect(safeParseShow({ ...s, stage: { shape: { kind: 'polygon', points: [] } } }).success).toBe(false);
    expect(safeParseShow({ ...s, elements: { e1: { id: 'e1' } } }).success).toBe(false);
  });

  test('a computer carries functions, programs and typed outputs', () => {
    let s = newShow('x');
    [s] = addElement(s, {
      type: { id: 'computer.laptop', version: 1 }, x: 0, y: 0, layerId: 'l-control',
      computer: { functions: ['video', 'lights'], os: 'macos', programs: [{ name: 'QLab', version: '5', use: 'cues' }], license: '', dongle: false, outputs: [{ signal: 'video', connector: 'hdmi', note: '' }] },
    });
    expect(safeParseShow(s).success).toBe(true);
  });
});

describe('operations', () => {
  test('add, move, update and remove never mutate the old show', () => {
    const s0 = newShow('x');
    const [s1, el] = addElement(s0, { type: drum, x: 100, y: 200, layerId: 'l-audio' });
    const s2 = moveElements(s1, [el.id], 50, -20);
    const s3 = updateElement(s2, el.id, { label: 'Batería', suppliedBy: 'band' });
    expect(Object.keys(s0.elements)).toHaveLength(0);
    expect(s1.elements[el.id]!.x).toBe(100);
    expect(s3.elements[el.id]).toMatchObject({ x: 150, y: 180, label: 'Batería', suppliedBy: 'band' });
    expect(safeParseShow(s3).success).toBe(true);
  });

  test('an element needs an existing layer', () => {
    expect(() => addElement(newShow('x'), { type: drum, x: 0, y: 0, layerId: 'nope' })).toThrow();
  });

  test('removing an element removes what points at it', () => {
    let s = newShow('x');
    const [s1, a] = addElement(s, { type: drum, x: 0, y: 0, layerId: 'l-audio' });
    const [s2, b] = addElement(s1, { type: drum, x: 10, y: 0, layerId: 'l-audio' });
    s = s2;
    s = {
      ...s,
      channels: { c1: { id: 'c1', number: 1, shortName: '', mic: '', kind: null, stand: '', phantom: false, insert: '', patch: '', assign: {}, stereoPairWith: null, sourceElementId: a.id, notes: '' } },
      connections: { n1: { id: 'n1', from: a.id, to: b.id, signal: 'audio', connector: '', lengthMm: null, label: '', format: '', toPort: null, fromPortId: null, toPortId: null, channels: null, stereo: false, lines: 1 } },
    };
    const out = removeElements(s, [a.id]);
    expect(Object.keys(out.elements)).toEqual([b.id]);
    expect(out.channels).toEqual({});
    expect(out.connections).toEqual({});
  });
});

describe('removing an element that owns channels and outputs', () => {
  const withThree = () => {
    let show = newShow('x');
    const made: string[] = [];
    for (let i = 0; i < 3; i++) {
      const [s, el] = addElement(show, { type: drum, x: 1000 * (i + 1), y: 0, layerId: 'l-audio' });
      const [s2] = addChannel(s, { shortName: `c${i + 1}`, sourceElementId: el.id });
      show = s2;
      made.push(el.id);
    }
    return { show, made };
  };

  test('leaves the channel numbers 1..n without gaps, and the next one added is new', () => {
    const { show, made } = withThree();
    const after = removeElements(show, [made[1]!]);
    expect(channelList(after).map((c) => [c.shortName, c.number])).toEqual([['c1', 1], ['c3', 2]]);
    const [next] = addChannel(after);
    const nums = channelList(next).map((c) => c.number);
    expect(new Set(nums).size).toBe(nums.length);
  });

  test('frees the stereo partner and removes the channel from the monitor mixes', () => {
    const { show, made } = withThree();
    const [a, b] = channelList(show);
    let s = setStereoPair(show, a!.id, b!.id);
    const [s2, out] = addOutput(s);
    s = setMixLevel(s2, out.id, b!.id, 'normal');
    const after = removeElements(s, [made[1]!]);
    expect(after.channels[a!.id]!.stereoPairWith).toBeNull();
    expect(Object.keys(after.outputs[out.id]!.mix)).toEqual([a!.id]); // the pair was in the mix; only the removed side leaves it
  });

  test('several elements at once, and both channels of a stereo pair', () => {
    const { show, made } = withThree();
    const [a, b] = channelList(show);
    const after = removeElements(setStereoPair(show, a!.id, b!.id), [made[0]!, made[1]!]);
    expect(channelList(after).map((c) => [c.shortName, c.number, c.stereoPairWith])).toEqual([['c3', 1, null]]);
  });

  test('the outputs an element owns go and the others are renumbered', () => {
    const { show, made } = withThree();
    let s = show;
    const ids: string[] = [];
    for (const owner of [made[0]!, made[1]!, null]) {
      const [n, o] = addOutput(s, { sourceElementId: owner });
      s = n;
      ids.push(o.id);
    }
    const after = removeElements(s, [made[0]!]);
    expect(outputList(after).map((o) => [o.id, o.number])).toEqual([[ids[1], 1], [ids[2], 2]]);
  });
});

describe('history gestures', () => {
  test('hold makes every set until its release one step, and releasing twice does nothing', () => {
    const h = new History(0);
    const release = h.hold();
    h.set(1);
    h.set(2);
    h.set(3);
    expect(h.canUndo).toBe(false);
    release();
    release();
    expect(h.canUndo).toBe(true);
    expect(h.undo()).toBe(true);
    expect(h.state).toBe(0);
    expect(h.undo()).toBe(false);
  });
});

describe('history', () => {
  test('undo and redo, and a new change clears redo', () => {
    const h = new History(0);
    h.set(1);
    h.set(2);
    expect(h.undo()).toBe(true);
    expect(h.state).toBe(1);
    expect(h.redo()).toBe(true);
    expect(h.state).toBe(2);
    h.undo();
    h.set(9);
    expect(h.canRedo).toBe(false);
  });

  test('a group is one step', () => {
    const h = new History(0);
    h.group(() => {
      h.set(1);
      h.set(2);
      h.set(3);
    });
    expect(h.state).toBe(3);
    h.undo();
    expect(h.state).toBe(0);
    expect(h.canUndo).toBe(false);
  });

  test('keeps at most 200 steps', () => {
    const h = new History(0);
    for (let i = 1; i <= 250; i++) h.set(i);
    let n = 0;
    while (h.undo()) n++;
    expect(n).toBe(200);
    expect(h.state).toBe(50);
  });

  test('reset starts a clean history', () => {
    const h = new History(0);
    h.set(1);
    h.reset(5);
    expect(h.canUndo).toBe(false);
    expect(h.state).toBe(5);
  });
});

describe('format', () => {
  test('rejects a missing, newer or unreadable format', () => {
    expect(() => loadShow(null)).toThrow(UnsupportedFormat);
    expect(() => loadShow({ name: 'x' })).toThrow(UnsupportedFormat);
    expect(() => loadShow({ ...newShow('x'), formatVersion: 3 })).toThrow(/newer/);
  });

  test('a format 1 file loads as format 2 with the new fields at their defaults', () => {
    const old: Record<string, unknown> = { ...newShow('Antiguo'), formatVersion: 1 };
    delete old.desks;
    const show = loadShow(old);
    expect(show.formatVersion).toBe(2);
    expect(show.desks).toEqual([]);
    expect(show.name).toBe('Antiguo');
  });
});

describe('archive and revisions', () => {
  test('a .scaena file round-trips with its images', () => {
    let s = newShow('Con imagen');
    [s] = addElement(s, { type: drum, x: 1, y: 2, layerId: 'l-audio' });
    const bytes = packShow(s, { 'fondo.png': new Uint8Array([1, 2, 3]) });
    const back = unpackShow(bytes);
    expect(back.show).toEqual(s);
    expect([...back.images['fondo.png']!]).toEqual([1, 2, 3]);
  });

  test('the copies of the listed revisions travel in the file, and nothing else under revisions/', async () => {
    const { zipSync, strToU8 } = await import('fflate');
    const { saveRevision } = await import('./revisions.ts');
    const { show, data } = saveRevision(newShow('Con historial'), '2026-11-17', 'primera');
    const bytes = zipSync({
      'show.json': strToU8(JSON.stringify(show)),
      'revisions/1.gz': data,
      'revisions/2.gz': new Uint8Array([9]), // not listed by the show
      'revisions/x.gz': new Uint8Array([9]), // not a number
      'revisions/1/../3.gz': new Uint8Array([9]),
    });
    const back = unpackShow(bytes);
    expect(Object.keys(back.revisions)).toEqual(['1']);
    expect([...back.revisions[1]!]).toEqual([...data]);
    expect(Object.keys(unpackShow(packShow(show, {}, { 1: data })).revisions)).toEqual(['1']);
  });

  test('refuses an archive without show.json', async () => {
    const { zipSync } = await import('fflate');
    expect(() => unpackShow(zipSync({ 'otro.txt': new Uint8Array([1]) }))).toThrow(/show.json/);
  });

  test('ignores files outside show.json and images/', async () => {
    const { zipSync, strToU8 } = await import('fflate');
    const bytes = zipSync({ 'show.json': strToU8(JSON.stringify(newShow('x'))), 'evil/../x.js': strToU8('1'), 'images/../y': strToU8('2') });
    expect(Object.keys(unpackShow(bytes).images)).toEqual([]);
  });

  test('a revision is a snapshot that restores exactly', () => {
    let s = newShow('Rev');
    [s] = addElement(s, { type: drum, x: 5, y: 5, layerId: 'l-audio' });
    const r1 = saveRevision(s, '2026-11-05', 'primera');
    const r2 = saveRevision({ ...r1.show, name: 'Rev 2' }, '2026-11-06', 'segunda', ['cambió el nombre']);
    expect(r2.show.revision).toBe(2);
    expect(r2.show.revisions.map((r) => r.number)).toEqual([1, 2]);
    expect(restore(r1.data)).toEqual(r1.show);
    expect(r1.data.length).toBeLessThan(JSON.stringify(r1.show).length);
  });
});

describe('fields removed from the format', () => {
  test('a file that still carries them opens, and they are not kept', () => {
    const s = newShow('Viejo');
    const old = JSON.parse(JSON.stringify(s));
    old.view.greyscale = true;
    old.electrical.circuits = [{ id: 'c1', number: 1, dimmerId: 'd1', phase: 2 }];
    const back = loadShow(old);
    expect('greyscale' in back.view).toBe(false);
    expect(back.electrical.circuits).toEqual([{ id: 'c1', number: 1, phase: 2 }]);
  });
});
