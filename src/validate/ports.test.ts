import { describe, expect, test } from 'vitest';
import { addConnection, updateConnection } from '../model/connections.ts';
import { addDesk, sendToDesk } from '../model/desks.ts';
import { addChannel } from '../model/audio.ts';
import { newShow } from '../model/new.ts';
import { addElement, updateElement } from '../model/ops.ts';
import type { Port, Show } from '../model/schema.ts';
import { RULES } from './rules.ts';

const port = (id: string, over: Partial<Port> = {}): Port => ({ id, name: id, dir: 'out', signal: 'audio', format: '', channels: 2, note: '', ...over });

/** A pedalboard with an output port and a desk with an input port, joined by one cable. */
function linked(): { show: Show; pedal: string; desk: string; cable: string } {
  let show = newShow('Puertos');
  let a, b;
  [show, a] = addElement(show, { type: { id: 'x.pedal', version: 1 }, x: 0, y: 0, layerId: 'l-audio' });
  [show, b] = addElement(show, { type: { id: 'x.desk', version: 1 }, x: 1000, y: 0, layerId: 'l-audio' });
  show = updateElement(show, a.id, { ports: [port('out1', { channels: 2 }), port('out2', { channels: 2 })] });
  show = updateElement(show, b.id, { ports: [port('in1', { dir: 'in', channels: 8 })] });
  let c;
  [show, c] = addConnection(show, a.id, b.id, 'audio');
  show = updateConnection(show, c!.id, { fromPortId: 'out1', toPortId: 'in1', channels: 2, stereo: true });
  return { show, pedal: a.id, desk: b.id, cable: c!.id };
}

describe('port rules', () => {
  test('a well-formed link says nothing', () => {
    const { show } = linked();
    for (const r of ['portChannels', 'portShared', 'portSignal', 'portDirection', 'stereoChannelsOdd'] as const) expect(RULES[r](show)).toEqual([]);
  });

  test('more channels than the port has', () => {
    const { show, cable } = linked();
    const issues = RULES.portChannels(updateConnection(show, cable, { channels: 4 }));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ vars: { port: 'out1', channels: 4, max: 2 } });
  });

  test('a port used by two connections', () => {
    const { show, pedal, desk } = linked();
    const [next, other] = addConnection(show, pedal, desk, 'usb');
    expect(other).not.toBeNull();
    const shared = updateConnection(next, other!.id, { fromPortId: 'out1' });
    expect(RULES.portShared(shared)).toHaveLength(1);
  });

  test('a port that does not carry the signal, or points the wrong way', () => {
    const { show, pedal, desk, cable } = linked();
    expect(RULES.portSignal(updateConnection(show, cable, { signal: 'video' }))).toHaveLength(2);
    const wrongWay = updateElement(show, desk, { ports: [port('in1', { dir: 'out', channels: 8 })] });
    expect(RULES.portDirection(wrongWay).map((i) => i.ref.id)).toEqual([desk]);
    const reversed = updateElement(show, pedal, { ports: [port('out1', { dir: 'in' }), port('out2')] });
    expect(RULES.portDirection(reversed).map((i) => i.ref.id)).toEqual([pedal]);
  });

  test('a stereo link needs an even number of channels', () => {
    const { show, cable } = linked();
    expect(RULES.stereoChannelsOdd(updateConnection(show, cable, { channels: 3 }))).toHaveLength(1);
  });

  test('two sources on the same number of a desk', () => {
    let show = newShow('Mesas');
    let a, b, mon;
    [show, a] = addChannel(show, { shortName: 'A' });
    [show, b] = addChannel(show, { shortName: 'B' });
    expect(RULES.deskNumberRepeated(show)).toEqual([]);
    [show, mon] = addDesk(show);
    show = sendToDesk(show, a.id, mon.id, 4);
    show = sendToDesk(show, b.id, mon.id, 4);
    const issues = RULES.deskNumberRepeated(show);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ severity: 'error', vars: { n: 4 } });
  });
});
