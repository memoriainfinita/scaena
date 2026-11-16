import { describe, expect, test } from 'vitest';
import { showFromPackage } from '../library/apply.ts';
import { itemById } from '../library/items.ts';
import { packageById } from '../library/packages.ts';
import { showcase } from '../library/package-showcase.ts';
import { connectionRows, equipmentRows, NO_EQUIPMENT_FILTER, videoRows, type ElementText } from './equipment.ts';
import type { PlanElement } from './schema.ts';

const nameOf = (el: PlanElement | undefined): string => (el ? el.label || itemById(el.type.id)?.name.es || el.type.id : '');
const text = (el: PlanElement): ElementText => ({ name: nameOf(el), type: itemById(el.type.id)?.name.es ?? el.type.id, category: itemById(el.type.id)?.category ?? '' });
const rock = () => showFromPackage(packageById('rock')!, 'Mi banda', 'es');

describe('equipment rows', () => {
  test('with no filter every element is a row, in name order', () => {
    const show = rock();
    const rows = equipmentRows(show, NO_EQUIPMENT_FILTER, text, 'es');
    expect(rows).toHaveLength(Object.keys(show.elements).length);
    const names = rows.map((r) => text(r).name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })));
  });

  test('the search ignores accents and case, and looks at the notes and the address too', () => {
    let show = rock();
    const id = Object.keys(show.elements)[0]!;
    show = { ...show, elements: { ...show.elements, [id]: { ...show.elements[id]!, notes: 'Cuidado con la ÚLTIMA fila', ip: '10.0.0.77' } } };
    expect(equipmentRows(show, { ...NO_EQUIPMENT_FILTER, query: 'ultima' }, text, 'es').map((e) => e.id)).toContain(id);
    expect(equipmentRows(show, { ...NO_EQUIPMENT_FILTER, query: '10.0.0.77' }, text, 'es').map((e) => e.id)).toEqual([id]);
    expect(equipmentRows(show, { ...NO_EQUIPMENT_FILTER, query: 'zzzz' }, text, 'es')).toEqual([]);
  });

  test('layer, category and supplier narrow the list, and empty numbers sort last', () => {
    let show = rock();
    const [a, b] = Object.keys(show.elements) as [string, string];
    const bare = Object.fromEntries(Object.entries(show.elements).map(([k, e]) => [k, { ...e, suppliedBy: 'unset' as const, powerW: null }]));
    show = { ...show, elements: { ...bare, [a]: { ...bare[a]!, suppliedBy: 'rental', powerW: 500 }, [b]: { ...bare[b]!, suppliedBy: 'rental', powerW: 100 } } };
    expect(equipmentRows(show, { ...NO_EQUIPMENT_FILTER, suppliedBy: 'rental', sort: 'power' }, text, 'es').map((e) => e.id)).toEqual([b, a]);
    const all = equipmentRows(show, { ...NO_EQUIPMENT_FILTER, sort: 'power' }, text, 'es');
    expect(all.slice(0, 2).map((e) => e.id)).toEqual([b, a]);
    expect(all.at(-1)!.powerW).toBeNull();
    const layer = show.elements[a]!.layerId;
    expect(equipmentRows(show, { ...NO_EQUIPMENT_FILTER, layerId: layer }, text, 'es').every((e) => e.layerId === layer)).toBe(true);
    const cat = text(show.elements[a]!).category;
    expect(equipmentRows(show, { ...NO_EQUIPMENT_FILTER, category: cat }, text, 'es').every((e) => text(e).category === cat)).toBe(true);
  });
});

describe('connection and video rows', () => {
  const show = showFromPackage(showcase(), 'Muestra', 'es');

  test('the signal filter keeps one kind and the search looks at both ends', () => {
    const all = connectionRows(show, { query: '', signal: '' }, nameOf, 'es');
    expect(all).toHaveLength(Object.keys(show.connections).length);
    const video = connectionRows(show, { query: '', signal: 'video' }, nameOf, 'es');
    expect(video.length).toBeGreaterThan(0);
    expect(video.every((c) => c.signal === 'video')).toBe(true);
    const one = video[0]!;
    expect(connectionRows(show, { query: nameOf(show.elements[one.to]), signal: '' }, nameOf, 'es').map((c) => c.id)).toContain(one.id);
  });

  test('the video rows hold the video links and the video outputs of the computers', () => {
    const { links, outputs } = videoRows(show, nameOf, 'es');
    expect(links.every((c) => c.signal === 'video')).toBe(true);
    expect(outputs.every((o) => o.output.signal === 'video' && o.element.computer?.outputs[o.index] === o.output)).toBe(true);
  });

  test('a connection carries a resolution that is empty until it is typed', () => {
    const c = Object.values(show.connections)[0]!;
    expect(typeof c.format).toBe('string');
  });
});
