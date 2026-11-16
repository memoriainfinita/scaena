import { describe, expect, test } from 'vitest';
import { bare } from './bare.ts';
import { showFromPackage } from './apply.ts';
import { addElement } from '../model/ops.ts';
import { itemById } from './items.ts';
import { packageById } from './packages.ts';
import { fillPortsFromLibrary, hasLibraryPorts, libraryPorts, LIBRARY_PORT_IDS } from './ports-data.ts';
import type { Show } from '../model/schema.ts';

const base = (): Show => bare(showFromPackage(packageById('rock')!, 'x', 'es'));
const place = (show: Show, itemId: string): [Show, string] => {
  const layerId = show.layers[0]!.id;
  const [s, el] = addElement(show, { type: { id: itemId, version: 1 }, x: 0, y: 0, layerId });
  return [s, el.id];
};

describe('ports from the library', () => {
  test('every id in the table is a library item', () => {
    for (const id of LIBRARY_PORT_IDS()) expect(itemById(id), id).toBeDefined();
  });

  test('a desk gets its inputs and outputs, each saying they are typical, in the language of the show', () => {
    const [show, id] = place(base(), 'desk.digital');
    const ports = fillPortsFromLibrary(show, id).elements[id]!.ports;
    expect(ports.map((p) => [p.name, p.dir, p.channels, p.format])).toEqual([['Entradas', 'in', 32, 'Analogue'], ['Salidas', 'out', 16, 'Analogue']]);
    expect(ports.every((p) => p.note.startsWith('Valor típico'))).toBe(true);
    expect(new Set(ports.map((p) => p.id)).size).toBe(2);
    expect(libraryPorts('desk.digital', 'en').map((p) => p.name)).toEqual(['Inputs', 'Outputs']);
  });

  test('an element that has ports, or an item without entry, is left as it is', () => {
    const [show, id] = place(base(), 'rack.stagebox-16');
    const once = fillPortsFromLibrary(show, id);
    expect(fillPortsFromLibrary(once, id)).toBe(once);
    const [other, oid] = place(base(), 'person.standing');
    expect(fillPortsFromLibrary(other, oid)).toBe(other);
    expect(hasLibraryPorts('person.standing')).toBe(false);
    expect(hasLibraryPorts('rack.stagebox-48')).toBe(true);
  });
  test('other equipment gets the connectors of its kind: video in on a projector, network on a switch', () => {
    const [show, id] = place(base(), 'video.projector');
    expect(fillPortsFromLibrary(show, id).elements[id]!.ports.map((p) => [p.dir, p.signal, p.format])).toEqual([['in', 'video', 'HDMI']]);
    const [sw, sid] = place(base(), 'rack.network');
    const ports = fillPortsFromLibrary(sw, sid).elements[sid]!.ports;
    expect(ports.map((p) => [p.name, p.signal, p.channels])).toEqual([['Red', 'network', 8]]);
    expect(libraryPorts('video.camera', 'en')[0]!.name).toBe('Video output');
  });
});
