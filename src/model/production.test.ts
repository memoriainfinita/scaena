import { describe, expect, test } from 'vitest';
import { buildDaySheet } from '../document/daysheet.ts';
import { effectiveSections } from '../document/sections.ts';
import { buildDocument, contractRows, hospitalityRows } from '../document/typst-source.ts';
import { prodStrings } from '../document/strings.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { RULES } from '../validate/rules.ts';
import { addSlot, addSong, formatDuration, isClock, moveSong, parseDuration, removeSlot, removeSong, setlistTotal, sortedSlots, toMinutes, updateSlot, updateSong } from './production.ts';
import type { Show } from './schema.ts';

const rock = (): Show => showFromPackage(packageById('rock')!, 'Mi banda', 'es');

describe('durations', () => {
  test('clock, minutes and seconds all read as seconds, and nonsense is null', () => {
    expect(parseDuration('4:30')).toBe(270);
    expect(parseDuration('04:05')).toBe(245);
    expect(parseDuration('4.5')).toBe(270);
    expect(parseDuration('4,5')).toBe(270);
    expect(parseDuration('270 s')).toBe(270);
    expect(parseDuration('270s')).toBe(270);
    expect(parseDuration('')).toBe(0);
    expect(parseDuration('4:75')).toBeNull();
    expect(parseDuration('mucho')).toBeNull();
    expect(parseDuration('-3')).toBeNull();
  });

  test('formatting is m:ss and h:mm:ss', () => {
    expect(formatDuration(270)).toBe('4:30');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3725)).toBe('1:02:05');
    expect(formatDuration(0)).toBe('0:00');
  });
});

describe('setlist', () => {
  test('add, edit, move, remove and total', () => {
    let [show, a] = addSong(rock(), 'Uno');
    let b;
    [show, b] = addSong(show, 'Dos');
    show = updateSong(updateSong(show, a.id, { seconds: 200 }), b.id, { seconds: 100, comment: 'acústica' });
    expect(setlistTotal(show)).toBe(300);
    show = moveSong(show, b.id, -1);
    expect(show.setlist.map((x) => x.title)).toEqual(['Dos', 'Uno']);
    expect(moveSong(show, b.id, -1)).toBe(show);
    show = removeSong(show, a.id);
    expect(show.setlist).toHaveLength(1);
    expect(show.setlist[0]).toMatchObject({ title: 'Dos', comment: 'acústica' });
  });
});

describe('schedule', () => {
  test('clock times', () => {
    expect(isClock('8:30')).toBe(true);
    expect(isClock('20:30')).toBe(true);
    expect(isClock('24:00')).toBe(false);
    expect(isClock('8h30')).toBe(false);
    expect(toMinutes('20:30')).toBe(1230);
    expect(toMinutes('x')).toBeNull();
  });

  test('slots are kept apart by kind and read in time order, with the unclear ones last', () => {
    let show = rock();
    let s;
    [show, s] = addSlot(show, 'day', 'Show', '21:00');
    [show] = addSlot(show, 'day', 'Puertas', '20:00');
    [show] = addSlot(show, 'day', 'Sin hora', '');
    [show] = addSlot(show, 'build', 'Focus', '14:00');
    expect(sortedSlots(show, 'day').map((x) => x.what)).toEqual(['Puertas', 'Show', 'Sin hora']);
    expect(sortedSlots(show, 'build').map((x) => x.what)).toEqual(['Focus']);
    show = updateSlot(show, s.id, { time: '19:00' });
    expect(sortedSlots(show, 'day')[0]!.what).toBe('Show');
    expect(removeSlot(show, s.id).schedule).toHaveLength(3);
  });

  test('the time-format rule names the slot', () => {
    let [show] = addSlot(rock(), 'day', 'Puertas', '8h');
    expect(RULES.timeFormat(show)[0]).toMatchObject({ severity: 'warning', vars: { time: '8h', what: 'Puertas' } });
    [show] = addSlot(show, 'day', 'Show', '21:00');
    expect(RULES.timeFormat(show)).toHaveLength(1);
  });
});

describe('document sections for the event', () => {
  const P = prodStrings('es');

  test('the concert template carries setlist, hospitality and contract, and empty ones are not printed', () => {
    expect(effectiveSections(rock())).toEqual(expect.arrayContaining(['setlist', 'hospitality', 'contract']));
    const b = buildDocument(rock());
    for (const s of ['setlist', 'hospitality', 'contract', 'build']) expect(b.sections).not.toContain(s);
  });

  test('the setlist prints with its numbers, lengths and total', () => {
    let [show] = addSong(rock(), 'Primera canción');
    [show] = addSong(show, 'Segunda');
    show = updateSong(updateSong(show, show.setlist[0]!.id, { seconds: 200, comment: 'intro larga' }), show.setlist[1]!.id, { seconds: 100 });
    const b = buildDocument(show);
    expect(b.sections).toContain('setlist');
    expect(b.source).toContain('"Primera canción"');
    expect(b.source).toContain('"3:20"');
    expect(b.source).toContain('"5:00"');
    expect(b.source).toContain(`"${P.total}"`);
  });

  test('hospitality and contract print only what was filled in', () => {
    const show: Show = { ...rock(), hospitality: { ...rock().hospitality, dressingRooms: 2, meals: 4, busStock: true, cashInstead: true, cashAmount: '300 USD' }, contract: { ...rock().contract, fee: '1.500 €', setLengthMin: 90 } };
    const h = hospitalityRows(show, P);
    expect(h.map(([k]) => k)).toEqual([P.dressingRooms, P.meals, P.busStock, P.cashInstead]);
    expect(h[3]![1]).toBe('Sí — 300 USD');
    expect(contractRows(show, P)).toEqual([[P.fee, '1.500 €'], [P.setLength, '90 min']]);
    expect(buildDocument(show).sections).toEqual(expect.arrayContaining(['hospitality', 'contract']));
  });

  test('the day and build schedules print apart and in time order', () => {
    let show = rock();
    [show] = addSlot(show, 'day', 'Show', '21:00');
    [show] = addSlot(show, 'day', 'Puertas', '20:00');
    [show] = addSlot(show, 'build', 'Focus', '14:00');
    show = { ...show, document: { template: 'custom', sections: ['schedule', 'build'], planScale: null, inputs: { landscape: false, blocks: 'auto' as const } } };
    const b = buildDocument(show);
    expect(b.source.indexOf('"Puertas"')).toBeLessThan(b.source.indexOf('"Show"'));
    expect(b.source).toContain(`"${P.build}"`);
    expect(b.source.indexOf('"Focus"')).toBeGreaterThan(b.source.indexOf('"Show"'));
  });
});

describe('day sheet', () => {
  test('it has the schedules, the contacts without what they hid, and the event facts', () => {
    let show: Show = { ...rock(), contacts: [{ id: 'c1', role: 'Producción', name: 'Ana', phone: '600111222', email: 'a@x.org', hidden: ['phone'] }], event: { venueAddress: 'Calle Mayor 1', parking: 'Detrás del teatro', notes: '' } };
    [show] = addSlot(show, 'day', 'Puertas', '20:00');
    const sheet = buildDaySheet(show);
    expect(sheet.empty).toBe(false);
    expect(sheet.source).toContain('"Puertas"');
    expect(sheet.source).toContain('"Ana"');
    expect(sheet.source).not.toContain('600111222');
    expect(sheet.source).toContain('"Calle Mayor 1"');
    expect(sheet.source).toContain('Hoja de ruta');
  });

  test('a show with nothing to say is reported empty', () => {
    expect(buildDaySheet(rock()).empty).toBe(true);
  });
});
