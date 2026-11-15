import { describe, expect, test } from 'vitest';
import { addChannel, addOutput } from './audio.ts';
import { addDesk, channelOn, channelsOnDesk, deskById, desksOf, mainDeskId, nextFreeNumber, outputsOnDesk, removeDesk, sendToDesk, setDeskPatch, setOutputDesk, updateDesk } from './desks.ts';
import { newShow } from './new.ts';
import type { Show } from './schema.ts';

function twoChannels(): { show: Show; a: string; b: string } {
  let show = newShow('Mesas');
  let a, b;
  [show, a] = addChannel(show, { shortName: 'Voz', patch: 'SB A 7' });
  [show, b] = addChannel(show, { shortName: 'Bombo', patch: 'SB A 1' });
  return { show, a: a.id, b: b.id };
}

describe('desks', () => {
  test('a show with no list has one implicit main desk built from the old fields', () => {
    const show = { ...newShow('x'), desk: { model: 'X32', showFile: 'gira.scn' } };
    const [d, ...rest] = desksOf(show);
    expect(rest).toHaveLength(0);
    expect(d).toMatchObject({ id: 'main', model: 'X32', showFile: 'gira.scn' });
    expect(mainDeskId(show)).toBe('main');
  });

  test('on the main desk a source keeps its row number and patch', () => {
    const { show, a } = twoChannels();
    expect(channelOn(show, show.channels[a]!, mainDeskId(show))).toEqual({ number: 1, patch: 'SB A 7' });
  });

  test('adding the second desk makes the main one real and mirrors it in show.desk', () => {
    let { show } = twoChannels();
    show = { ...show, desk: { model: 'SQ-5', showFile: '' } };
    let mon;
    [show, mon] = addDesk(show);
    expect(show.desks.map((d) => d.id)).toEqual(['dk1', 'dk2']);
    expect(show.desks[0]).toMatchObject({ model: 'SQ-5' });
    expect(mon.role).toBe('monitors');
    show = updateDesk(show, 'dk1', { model: 'Avantis' });
    expect(show.desk.model).toBe('Avantis');
    expect(deskById(show, 'nope').id).toBe('dk1');
  });

  test('a source has its own number and patch on each desk and is absent where it is not sent', () => {
    let { show, a, b } = twoChannels();
    let mon;
    [show, mon] = addDesk(show);
    expect(channelsOnDesk(show, mon.id)).toEqual([]);
    show = sendToDesk(show, a, mon.id);
    show = setDeskPatch(show, a, mon.id, 'SB B 3');
    expect(channelOn(show, show.channels[a]!, mon.id)).toEqual({ number: 1, patch: 'SB B 3' });
    expect(channelOn(show, show.channels[a]!, mainDeskId(show))).toEqual({ number: 1, patch: 'SB A 7' });
    expect(channelOn(show, show.channels[b]!, mon.id)).toBeNull();
    show = sendToDesk(show, b, mon.id);
    expect(channelsOnDesk(show, mon.id).map((x) => x.ch.shortName)).toEqual(['Voz', 'Bombo']);
    show = sendToDesk(show, a, mon.id, 7);
    expect(channelsOnDesk(show, mon.id).map((x) => x.number)).toEqual([2, 7]);
    expect(nextFreeNumber(show, mon.id)).toBe(1);
    show = sendToDesk(show, a, mon.id, null);
    expect(channelsOnDesk(show, mon.id).map((x) => x.ch.shortName)).toEqual(['Bombo']);
  });

  test('a source can be left off the main desk and keep the patch of the row', () => {
    let { show, a } = twoChannels();
    [show] = addDesk(show);
    show = sendToDesk(show, a, 'dk1', null);
    expect(channelOn(show, show.channels[a]!, 'dk1')).toBeNull();
    show = sendToDesk(show, a, 'dk1', 5);
    expect(channelOn(show, show.channels[a]!, 'dk1')).toEqual({ number: 5, patch: 'SB A 7' });
  });

  test('outputs belong to the desk they come out of and fall back to the main one', () => {
    let { show } = twoChannels();
    let mon, o1, o2;
    [show, mon] = addDesk(show);
    [show, o1] = addOutput(show);
    [show, o2] = addOutput(show);
    show = setOutputDesk(show, o2.id, mon.id);
    expect(outputsOnDesk(show, 'dk1').map((o) => o.id)).toEqual([o1.id]);
    expect(outputsOnDesk(show, mon.id).map((o) => o.id)).toEqual([o2.id]);
    show = setOutputDesk(show, o2.id, 'dk1');
    expect(show.outputs[o2.id]!.deskId).toBeNull();
  });

  test('removing a desk sends its outputs back to the main desk and drops its assignments; the main desk stays', () => {
    let { show, a } = twoChannels();
    let mon, o;
    [show, mon] = addDesk(show);
    [show, o] = addOutput(show);
    show = setOutputDesk(show, o.id, mon.id);
    show = sendToDesk(show, a, mon.id);
    expect(removeDesk(show, 'dk1')).toBe(show);
    show = removeDesk(show, mon.id);
    expect(show.desks.map((d) => d.id)).toEqual(['dk1']);
    expect(show.channels[a]!.assign).toEqual({});
    expect(outputsOnDesk(show, 'dk1').map((x) => x.id)).toEqual([o.id]);
  });
});
