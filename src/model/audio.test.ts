import { beforeEach, describe, expect, test } from 'vitest';
import { setChannel, setChannelMic, sortByInstrument } from '../app/audio-actions.ts';
import { selection, session, setLibrary, startEmpty, startFromPackage } from '../app/state.ts';
import { itemById } from '../library/items.ts';
import { audioFromLabel, audioLabel } from '../library/models.ts';
import { addChannel, addOutput, channelList, moveChannel, moveOutput, outputList, removeChannel, removeOutput, setStereoPair, sortChannels } from './audio.ts';
import { newShow } from './new.ts';
import type { Show } from './schema.ts';

function withChannels(n: number): [Show, string[]] {
  let show = newShow('t');
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const [s, c] = addChannel(show, { shortName: `c${i + 1}` });
    show = s;
    ids.push(c.id);
  }
  return [show, ids];
}
const names = (s: Show) => channelList(s).map((c) => c.shortName);

describe('channels', () => {
  test('new channels take the next number', () => {
    const [show] = withChannels(3);
    expect(channelList(show).map((c) => c.number)).toEqual([1, 2, 3]);
  });

  test('removing renumbers without gaps and frees the stereo partner', () => {
    const [first, ids] = withChannels(4);
    let show = first;
    show = setStereoPair(show, ids[1]!, ids[2]!);
    show = removeChannel(show, ids[1]!);
    expect(channelList(show).map((c) => [c.shortName, c.number])).toEqual([['c1', 1], ['c3', 2], ['c4', 3]]);
    expect(show.channels[ids[2]!]!.stereoPairWith).toBeNull();
  });

  test('moving swaps neighbours and stops at the ends', () => {
    const [first, ids] = withChannels(3);
    let show = first;
    show = moveChannel(show, ids[2]!, -1);
    expect(names(show)).toEqual(['c1', 'c3', 'c2']);
    expect(moveChannel(show, ids[0]!, -1)).toBe(show);
    expect(moveChannel(show, ids[1]!, 1)).toBe(show);
  });

  test('a stereo pair is symmetric and a new partner frees the old one', () => {
    const [first, ids] = withChannels(4);
    let show = first;
    show = setStereoPair(show, ids[0]!, ids[1]!);
    expect(show.channels[ids[1]!]!.stereoPairWith).toBe(ids[0]);
    show = setStereoPair(show, ids[0]!, ids[2]!);
    expect(show.channels[ids[1]!]!.stereoPairWith).toBeNull();
    expect(show.channels[ids[2]!]!.stereoPairWith).toBe(ids[0]);
    show = setStereoPair(show, ids[0]!, null);
    expect(show.channels[ids[0]!]!.stereoPairWith).toBeNull();
    expect(show.channels[ids[2]!]!.stereoPairWith).toBeNull();
    expect(setStereoPair(show, ids[0]!, ids[0]!)).toBe(show);
  });

  test('sorting by rank is stable', () => {
    const [show] = withChannels(4);
    const rank = (c: { shortName: string }) => (c.shortName === 'c2' || c.shortName === 'c4' ? 0 : 1);
    expect(names(sortChannels(show, rank))).toEqual(['c2', 'c4', 'c1', 'c3']);
  });
});

describe('outputs', () => {
  test('add, move and remove keep the numbers whole', () => {
    let show = newShow('t');
    [show] = addOutput(show);
    [show] = addOutput(show, { kind: 'iem' });
    [show] = addOutput(show, { kind: 'main' });
    const [a, b] = outputList(show).map((o) => o.id) as [string, string];
    show = moveOutput(show, b, -1);
    expect(outputList(show).map((o) => o.kind)).toEqual(['iem', 'wedge', 'main']);
    show = removeOutput(show, a);
    expect(outputList(show).map((o) => [o.kind, o.number])).toEqual([['iem', 1], ['main', 2]]);
  });
});

describe('microphones in the list', () => {
  test('a known model reads as brand and model and maps back to its id', () => {
    expect(audioLabel('shure.sm57')).toBe('Shure SM57');
    expect(audioFromLabel('shure sm57')).toBe('shure.sm57');
    expect(audioFromLabel('  Shure SM57 ')).toBe('shure.sm57');
  });
  test('free text stays as typed', () => {
    expect(audioLabel('micro de solapa')).toBe('micro de solapa');
    expect(audioFromLabel('micro de solapa')).toBe('micro de solapa');
  });
});

describe('actions on the open show', () => {
  beforeEach(() => {
    setLibrary(null);
    session.value = null;
    selection.value = [];
  });

  test('picking a condenser sets phantom and picking a dynamic clears it, both undoable', () => {
    startEmpty('x');
    const s = session.value!;
    s.commit((show) => addChannel(show, { shortName: 'OH' })[0]);
    const id = channelList(s.show.value)[0]!.id;
    setChannelMic(id, 'AKG C414 XLII');
    expect(s.show.value.channels[id]).toMatchObject({ mic: 'akg.c414xlii', phantom: true });
    setChannelMic(id, 'shure.sm57');
    expect(s.show.value.channels[id]!.phantom).toBe(false);
    setChannelMic(id, 'mi micro raro');
    expect(s.show.value.channels[id]).toMatchObject({ mic: 'mi micro raro', phantom: false });
    s.undo();
    expect(s.show.value.channels[id]!.mic).toBe('shure.sm57');
    setChannel(id, { notes: 'x' });
    expect(s.show.value.channels[id]!.notes).toBe('x');
  });

  test('sort by instrument puts the drums first and keeps the numbers whole', () => {
    startFromPackage('rock', 'r');
    const s = session.value!;
    const first = channelList(s.show.value)[0]!;
    s.commit((show) => moveChannel(moveChannel(show, first.id, 1), first.id, 1));
    sortByInstrument();
    const after = channelList(s.show.value);
    const category = (c: (typeof after)[number]) => itemById(s.show.value.elements[c.sourceElementId ?? '']?.type.id ?? '')?.category;
    expect(category(after[0]!)).toBe('drums');
    expect(after.map((c) => c.number)).toEqual(after.map((_, i) => i + 1));
    const drums = after.filter((c) => category(c) === 'drums').length;
    expect(after.slice(0, drums).every((c) => category(c) === 'drums')).toBe(true);
  });
});
