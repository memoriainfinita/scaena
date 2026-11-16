import { describe, expect, test } from 'vitest';
import { packShow, unpackShow } from './archive.ts';
import { LIMITS } from './limits.ts';
import { loadShow, openShow } from './migrate.ts';
import { newShow } from './new.ts';
import { addElement, updateElement } from './ops.ts';
import { parseDuration } from './production.ts';
import { repairShow } from './repair.ts';
import type { Show } from './schema.ts';

const base = () => newShow('Reparar', ['audio', 'document', 'production']);
const asSaved = (show: unknown): unknown => JSON.parse(JSON.stringify(show));

function withNote(label: string): [Show, string] {
  const show = base();
  const notes = show.layers.find((l) => l.subject === 'notes')!;
  const [s, el] = addElement(show, { type: { id: 'note.text', version: 1 }, x: 0, y: 0, layerId: notes.id });
  return [updateElement(s, el.id, { label }), el.id];
}

describe('limits of the file format', () => {
  test('a note on the plan holds 500 characters', () => {
    const [show] = withNote('n'.repeat(500));
    expect(() => loadShow(asSaved(show))).not.toThrow();
  });

  test('a list item cannot be typed longer than a day', () => {
    expect(parseDuration('1440')).toBe(LIMITS.listSeconds);
    expect(parseDuration('1441')).toBeNull();
    expect(parseDuration('999:59')).toBe(59999);
  });
});

describe('repairing a show that breaks a limit', () => {
  test('a valid show comes back as it is, with nothing mended', () => {
    const show = base();
    expect(repairShow(asSaved(show))).toEqual({ show, fixed: [] });
  });

  test('a label that is too long is cut to the limit and the rest of the show is untouched', () => {
    const [show, id] = withNote('x'.repeat(LIMITS.label + 80));
    const r = repairShow(asSaved(show))!;
    expect(r.fixed).toEqual([`elements.${id}.label`]);
    expect(r.show.elements[id]!.label).toBe('x'.repeat(LIMITS.label));
    expect(r.show).toEqual({ ...show, elements: { [id]: { ...show.elements[id]!, label: 'x'.repeat(LIMITS.label) } } });
  });

  test('numbers out of range go to the nearest end of it', () => {
    const show = { ...base(), region: { code: 'ES', voltage: 5000, plug: '' }, hospitality: { ...base().hospitality, meals: 1000, dressingRooms: 150 }, contract: { ...base().contract, setLengthMin: 9000 }, setlist: [{ id: 'so1', title: 'x', comment: '', seconds: 90000 }] };
    const r = repairShow(asSaved(show))!;
    expect([...r.fixed].sort()).toEqual(['contract.setLengthMin', 'hospitality.dressingRooms', 'hospitality.meals', 'region.voltage', 'setlist.0.seconds']);
    expect([r.show.region.voltage, r.show.hospitality.meals, r.show.hospitality.dressingRooms, r.show.contract.setLengthMin, r.show.setlist[0]!.seconds]).toEqual([1000, 999, 99, 1440, 86400]);
  });

  test('several faults at once are all mended', () => {
    const [show, id] = withNote('x'.repeat(900));
    const both = updateElement({ ...show, name: 'n'.repeat(300) }, id, { notes: 'y'.repeat(2500) });
    const r = repairShow(asSaved(both))!;
    expect([...r.fixed].sort()).toEqual([`elements.${id}.label`, `elements.${id}.notes`, 'name']);
    expect([r.show.name.length, r.show.elements[id]!.label.length, r.show.elements[id]!.notes.length]).toEqual([LIMITS.showName, LIMITS.label, LIMITS.notes]);
  });

  test('any other fault is not guessed at: no repair', () => {
    const show = asSaved(base()) as Record<string, unknown>;
    expect(repairShow({ ...show, paper: 'A7' })).toBeNull();
    expect(repairShow({ ...show, layers: 'none' })).toBeNull();
    const [long] = withNote('x'.repeat(900));
    expect(repairShow({ ...(asSaved(long) as object), paper: 'A7' })).toBeNull();
  });

  test('the show given is not changed', () => {
    const [show, id] = withNote('x'.repeat(900));
    const raw = asSaved(show) as Show;
    repairShow(raw);
    expect(raw.elements[id]!.label).toHaveLength(900);
  });
});

describe('opening a show', () => {
  test('one that breaks a limit opens mended and says how much was cut; reading it strictly still refuses it', () => {
    const [show, id] = withNote('x'.repeat(900));
    expect(() => loadShow(asSaved(show))).toThrow();
    const opened = openShow(asSaved(show));
    expect(opened.repaired).toBe(1);
    expect(opened.show.elements[id]!.label).toHaveLength(LIMITS.label);
  });

  test('a valid show opens with nothing mended', () => {
    expect(openShow(asSaved(base())).repaired).toBe(0);
  });

  test('a .scaena file written before the limits were enforced opens mended', () => {
    const [show, id] = withNote('x'.repeat(900));
    const back = unpackShow(packShow(show));
    expect(back.repaired).toBe(1);
    expect(back.show.elements[id]!.label).toHaveLength(LIMITS.label);
  });

  test('a damaged show is still refused', () => {
    expect(() => openShow({ ...(asSaved(base()) as object), paper: 'A7' })).toThrow();
  });
});
