import { describe, expect, test } from 'vitest';
import { addConnection, updateConnection } from './connections.ts';
import { newShow } from './new.ts';
import { addElement } from './ops.ts';
import { addPort, portsOf, removePort, updatePort } from './ports.ts';

describe('ports', () => {
  test('a port is added, edited and removed; the connections that named it keep existing', () => {
    let show = newShow('P');
    let a, b;
    [show, a] = addElement(show, { type: { id: 'x.a', version: 1 }, x: 0, y: 0, layerId: 'l-audio' });
    [show, b] = addElement(show, { type: { id: 'x.b', version: 1 }, x: 9, y: 0, layerId: 'l-audio' });
    let out1, out2, in1;
    [show, out1] = addPort(show, a.id);
    [show, out2] = addPort(show, a.id, { channels: 4 });
    [show, in1] = addPort(show, b.id, { dir: 'in', channels: 8 });
    expect([out1!.name, out2!.name, in1!.name]).toEqual(['Salida 1', 'Salida 2', 'Entrada 1']);
    expect(addPort({ ...show, lang: 'en' }, a.id, { dir: 'in' })[1]!.name).toBe('In 1');
    expect(portsOf(show, a.id).map((p) => p.id)).toEqual([out1!.id, out2!.id]);
    show = updatePort(show, a.id, out2!.id, { name: 'Quad', format: 'ADAT' });
    expect(portsOf(show, a.id)[1]).toMatchObject({ name: 'Quad', format: 'ADAT', channels: 4 });
    let c;
    [show, c] = addConnection(show, a.id, b.id, 'audio');
    show = updateConnection(show, c!.id, { fromPortId: out2!.id, toPortId: in1!.id });
    show = removePort(show, a.id, out2!.id);
    expect(portsOf(show, a.id)).toHaveLength(1);
    expect(show.connections[c!.id]).toMatchObject({ fromPortId: null, toPortId: in1!.id });
    expect(addPort(show, 'nope')[1]).toBeNull();
  });
});
