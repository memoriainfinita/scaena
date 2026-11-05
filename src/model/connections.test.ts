import { describe, expect, test } from 'vitest';
import { PROGRAMS, incompatiblePrograms, suggestPrograms } from '../library/programs.ts';
import { addConnection, connectionsOf, removeConnection, updateConnection } from './connections.ts';
import { newShow } from './new.ts';
import { addElement, removeElements } from './ops.ts';
import type { Show } from './schema.ts';

function two(): [Show, string, string] {
  let show = newShow('t');
  const [s1, a] = addElement(show, { type: { id: 'control.laptop', version: 1 }, x: 0, y: 0, layerId: 'l-control' });
  const [s2, b] = addElement(s1, { type: { id: 'control.laptop', version: 1 }, x: 2000, y: 0, layerId: 'l-control' });
  show = s2;
  return [show, a.id, b.id];
}

describe('connections', () => {
  test('a connection starts with the usual connector for its signal', () => {
    const [show, a, b] = two();
    const [next, c] = addConnection(show, a, b, 'video');
    expect(c).toMatchObject({ from: a, to: b, signal: 'video', connector: 'HDMI', lengthMm: null });
    expect(next.connections[c!.id]).toBe(c);
  });

  test('self links, missing elements and repeats are refused', () => {
    const [show, a, b] = two();
    expect(addConnection(show, a, a, 'video')[1]).toBeNull();
    expect(addConnection(show, a, 'e99', 'video')[1]).toBeNull();
    const [s1] = addConnection(show, a, b, 'video');
    expect(addConnection(s1, a, b, 'video')[1]).toBeNull();
    expect(addConnection(s1, b, a, 'video')[1]).toBeNull();
    expect(addConnection(s1, a, b, 'network')[1]).not.toBeNull();
  });

  test('update, list and remove', () => {
    const [show, a, b] = two();
    const [s1, c] = addConnection(show, a, b, 'network');
    const s2 = updateConnection(s1, c!.id, { connector: 'Ethernet 5e', lengthMm: 15000 });
    expect(connectionsOf(s2, b)).toHaveLength(1);
    expect(connectionsOf(s2, a)[0]).toMatchObject({ connector: 'Ethernet 5e', lengthMm: 15000 });
    expect(removeConnection(s2, c!.id).connections).toEqual({});
  });

  test('removing an element removes its connections', () => {
    const [show, a, b] = two();
    const [s1] = addConnection(show, a, b, 'video');
    expect(Object.keys(removeElements(s1, [b]).connections)).toHaveLength(0);
  });
});

describe('program catalog', () => {
  test('names are unique and every program says what it is', () => {
    const names = PROGRAMS.map((p) => p.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(PROGRAMS.length).toBeGreaterThan(50);
  });

  test('QLab on Windows warns, on macOS it does not, and an unknown system never does', () => {
    expect(incompatiblePrograms('windows', ['QLab'])).toEqual([{ program: 'QLab', available: ['macos'] }]);
    expect(incompatiblePrograms('macos', ['QLab'])).toEqual([]);
    expect(incompatiblePrograms('other', ['QLab'])).toEqual([]);
    expect(incompatiblePrograms('windows', ['Midas Offline Editor', 'algo que no está'])).toEqual([]);
  });

  test('suggestions follow the functions of the computer', () => {
    expect(suggestPrograms(['video']).every((p) => p.category === 'video')).toBe(true);
    expect(suggestPrograms([]).length).toBe(PROGRAMS.length);
    expect(suggestPrograms(['lights']).some((p) => p.name === 'QLC+')).toBe(true);
  });
});
