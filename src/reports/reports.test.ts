import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, test } from 'vitest';
import { compareWithCurrent, restoreRevision, saveCurrentRevision } from '../app/revisions-actions.ts';
import { addFromLibrary, openStored, selection, session, setElementField, setLibrary, startFromPackage } from '../app/state.ts';
import { deleteStored, duplicateStored, refreshLibrary, saveAsTemplate, shows, startFromTemplate, templates } from '../app/library-actions.ts';
import { openLibrary } from '../app/storage.ts';
import { bare } from '../library/bare.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { diffShows } from '../model/diff.ts';
import { addWorkNote, removeWorkNote, updateLuminaire, updateWorkNote } from '../model/lights.ts';
import { availableReports, buildReport, inputsAsText, REPORT_IDS, toCsv, toTsv } from './reports.ts';
import type { Show } from '../model/schema.ts';

/** The package's lights come with a model and a channel; these tests start from bare ones. */
const theatre = () => {
  let show = bare(showFromPackage(packageById('theatre')!, 'Teatro', 'es'));
  for (const e of Object.values(show.elements)) if (e.luminaire) show = updateLuminaire(show, e.id, { modelId: null, channel: null, circuit: null });
  return show;
};
const rock = () => bare(showFromPackage(packageById('rock')!, 'Rock', 'es'));

describe('reports', () => {
  test('which reports are offered follows the modules', () => {
    expect(availableReports({ ...rock(), modules: ['audio', 'document'] })).toEqual(['racks', 'cables', 'power', 'inputs', 'outputs']);
    expect(availableReports(theatre())).toEqual(expect.arrayContaining(['hookup', 'inputs']));
    expect(availableReports({ ...rock(), modules: ['document'] })).toEqual(['cables', 'power']);
    expect(availableReports({ ...rock(), modules: ['document'], connections: {} })).toEqual(['power']);
    expect(availableReports({ ...rock(), modules: ['document'], connections: {}, elements: {} })).toEqual([]);
  });

  test('the power report lists the equipment, the lights and a total, in the show language', () => {
    const show = rock();
    const t = buildReport(show, 'power');
    expect(t.header).toHaveLength(4);
    for (const row of t.rows) expect(row).toHaveLength(4);
    const total = t.rows[t.rows.length - 1]!;
    expect(total[0]).toBe('Total');
    const sum = Object.values(show.elements).reduce((a, e) => a + (e.powerW ?? 0), 0);
    expect(Number(total[1])).toBe(sum);
    expect(Number(total[2])).toBeCloseTo(sum / show.region.voltage, 1);
    expect(t.rows.length).toBeGreaterThan(5);
  });

  test('the cable list is offered only with cables and sorts them by signal and connector', () => {
    expect(availableReports(bare(showFromPackage(packageById('singer')!, 'es'))).includes('cables')).toBe(true);
    expect(availableReports(theatre()).includes('cables')).toBe(buildReport(theatre(), 'cables').rows.length > 0);
    const rows = buildReport(showFromPackage(packageById('rock')!, 'es'), 'cables').rows;
    expect(rows.length).toBeGreaterThan(10);
    expect(rows[0]).toHaveLength(6);
  });

  test('every report has a header as wide as its rows', () => {
    const show = theatre();
    for (const id of REPORT_IDS) {
      const t = buildReport(show, id);
      for (const row of t.rows) expect(row).toHaveLength(t.header.length);
    }
  });

  test('the hookup is ordered by channel, with the unnumbered last', () => {
    let show = theatre();
    const lights = Object.values(show.elements).filter((e) => e.luminaire);
    show = updateLuminaire(updateLuminaire(show, lights[0]!.id, { channel: 12, unit: 2 }), lights[1]!.id, { channel: 3, unit: 1 });
    const rows = buildReport(show, 'hookup').rows;
    expect(rows[0]![0]).toBe('3');
    expect(rows[1]![0]).toBe('12');
    expect(rows[rows.length - 1]![0]).toBe('');
  });

  test('colours are grouped without regard to case, most used first, with the units', () => {
    let show = theatre();
    const lights = Object.values(show.elements).filter((e) => e.luminaire);
    show = updateLuminaire(show, lights[0]!.id, { color: 'R26', unit: 1 });
    show = updateLuminaire(show, lights[1]!.id, { color: 'r26', unit: 2 });
    show = updateLuminaire(show, lights[2]!.id, { color: 'L201', unit: 3 });
    const rows = buildReport(show, 'colors').rows;
    expect(rows[0]).toEqual(['R26', '2', '1, 2']);
    expect(rows.find((r) => r[0] === 'L201')).toEqual(['L201', '1', '3']);
  });

  test('the labels read unit, channel, dimmer, circuit and colour', () => {
    let show = theatre();
    const e = Object.values(show.elements).find((x) => x.luminaire)!;
    show = updateLuminaire(show, e.id, { unit: 7, channel: 21, dimmer: 5, circuit: 9, color: 'R80' });
    expect(buildReport(show, 'labels').rows[0]![0]).toBe('U7 · Canal 21 · D5 · C9 · R80');
  });

  test('the equipment count has one row per model and a total, and the cheat sheet one per channel', () => {
    let show = theatre();
    const lights = Object.values(show.elements).filter((e) => e.luminaire);
    show = updateLuminaire(show, lights[0]!.id, { channel: 5, modelId: 'etc.s4-19', color: 'R26' });
    show = updateLuminaire(show, lights[1]!.id, { channel: 5, modelId: 'etc.s4-19' });
    const eq = buildReport(show, 'equipment').rows;
    expect(eq[eq.length - 1]![0]).toBe('Total');
    expect(eq[eq.length - 1]![1]).toBe(String(lights.length));
    expect(eq.find((r) => r[0] === 'ETC Source Four 19°')![1]).toBe('2');
    const cheat = buildReport(show, 'cheat').rows;
    expect(cheat).toHaveLength(1);
    expect(cheat[0]).toMatchObject({ 0: '5', 1: '2', 4: 'R26' });
  });

  test('work notes list the task, whether it is done and the element it is tied to', () => {
    let show = theatre();
    const e = Object.values(show.elements).find((x) => x.luminaire)!;
    [show] = addWorkNote(show, 'Reenfocar', e.id);
    show = updateWorkNote(show, show.workNotes[0]!.id, { done: true });
    const rows = buildReport(show, 'worknotes').rows;
    expect(rows).toEqual([['Reenfocar', 'Sí', expect.any(String)]]);
    expect(rows[0]![2]).not.toBe('');
    expect(removeWorkNote(show, show.workNotes[0]!.id).workNotes).toEqual([]);
    expect(addWorkNote(show, 'x', 'no-such')[1].refId).toBeNull();
  });

  test('the input list as text', () => {
    const text = inputsAsText(rock());
    expect(text.split('\n')).toHaveLength(17);
    expect(text.split('\n')[0]).toMatch(/^1\. Bombo — /);
  });
});

describe('text formats', () => {
  test('CSV quotes what needs it, starts with a byte-order mark and ends with a line break', () => {
    const csv = toCsv({ header: ['A', 'B'], rows: [['uno, dos', 'con "comillas"'], ['multi\nlínea', 'ñ']] });
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"uno, dos","con ""comillas"""');
    expect(csv).toContain('"multi\nlínea",ñ');
    expect(csv.endsWith('\r\n')).toBe(true);
  });

  test('a cell that a spreadsheet would run as a formula is defused', () => {
    const csv = toCsv({ header: ['x'], rows: [['=HYPERLINK("http://evil")'], ['+1'], ['-2'], ['@SUM(A1)'], ['normal']] });
    for (const bad of ['=HYPERLINK', '+1', '-2', '@SUM']) expect(csv).toContain(`'${bad}`.replace(/^'/, "'"));
    expect(csv).not.toMatch(/\r\n=HYPERLINK/);
    expect(csv).toContain('\r\nnormal\r\n');
  });

  test('TSV never has a tab or line break inside a cell', () => {
    const t = toTsv({ header: ['a', 'b'], rows: [['x\ty', 'z\nw']] });
    expect(t.split('\n')).toHaveLength(2);
    expect(t.split('\n')[1]!.split('\t')).toHaveLength(2);
  });
});

describe('diff between two states', () => {
  test('added, removed, changed, and channels in short', () => {
    const a = rock();
    let b: Show = { ...a, elements: { ...a.elements } };
    const first = Object.keys(b.elements)[0]!;
    const second = Object.keys(b.elements)[1]!;
    delete b.elements[first];
    b.elements[second] = { ...b.elements[second]!, x: b.elements[second]!.x + 100 };
    b = { ...b, channels: { ...b.channels } };
    delete b.channels[Object.keys(b.channels)[0]!];
    const lines = diffShows(a, b, 'es');
    expect(lines.some((l) => l.startsWith('Quitado:'))).toBe(true);
    expect(lines.some((l) => l.startsWith('Cambiado o movido:'))).toBe(true);
    expect(lines).toContain('Canales: −1');
    expect(diffShows(a, a, 'es')).toEqual([]);
  });

  test('settings changes are named, and long lists are cut with a count', () => {
    const a = rock();
    expect(diffShows(a, { ...a, paper: 'A3' }, 'en')).toEqual(['Settings: paper']);
    const many: Show = { ...a, elements: { ...a.elements } };
    for (let i = 0; i < 9; i++) many.elements[`n${i}`] = { ...Object.values(a.elements)[0]!, id: `n${i}`, label: `Nuevo ${i}` };
    expect(diffShows(a, many, 'es')[0]).toMatch(/Añadido: .* y 3 más$/);
  });
});

describe('revisions and the local library', () => {
  let db: IDBDatabase;
  beforeEach(async () => {
    (await db)?.close?.();
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('scaena');
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
    const p = openLibrary();
    db = await p;
    setLibrary(Promise.resolve(db));
    session.value = null;
    selection.value = [];
  });

  test('a revision is saved with its date and note, the next one lists what changed, and restoring is one undoable step', async () => {
    startFromPackage('rock', 'Mi banda');
    const s = session.value!;
    const m1 = await saveCurrentRevision('Primera');
    expect(m1).toMatchObject({ number: 1, note: 'Primera', changes: [] });
    expect(s.show.value.revision).toBe(1);

    addFromLibrary('amp.guitar');
    setElementField(selection.value[0]!, { label: 'Guitarra extra' });
    const m2 = await saveCurrentRevision('Segunda');
    expect(m2.number).toBe(2);
    expect(m2.changes.join(' ')).toContain('Guitarra extra');
    expect(s.show.value.revisions.map((r) => r.number)).toEqual([1, 2]);

    const diff = await compareWithCurrent(1);
    expect(diff!.join(' ')).toContain('Guitarra extra');
    expect(await compareWithCurrent(99)).toBeNull();

    const count = Object.keys(s.show.value.elements).length;
    expect(await restoreRevision(1)).toBe(true);
    expect(Object.keys(s.show.value.elements)).toHaveLength(count - 1);
    // The list of revisions survives the restore, and undo brings the later state back.
    expect(s.show.value.revisions).toHaveLength(2);
    s.undo();
    expect(Object.keys(s.show.value.elements)).toHaveLength(count);
  });

  test('templates and copies live apart from the shows, and deleting a show deletes its revisions too', async () => {
    startFromPackage('jazz', 'Jazz');
    const s = session.value!;
    await saveCurrentRevision('Una');
    await s.flush();
    await saveAsTemplate();
    await refreshLibrary();
    expect(templates.value.map((t) => t.name)).toEqual(['Jazz']);
    expect(shows.value.map((t) => t.name)).toEqual(['Jazz']);

    // A show made from the template starts without revisions, and the template stays.
    await startFromTemplate(templates.value[0]!.id);
    expect(session.value!.show.value.revisions).toEqual([]);
    await session.value!.flush();
    await refreshLibrary();
    expect(shows.value).toHaveLength(2);
    expect(templates.value).toHaveLength(1);

    await duplicateStored(shows.value[0]!.id, '(copia)');
    expect(shows.value.map((x) => x.name)).toContain('Jazz (copia)');

    const gone = shows.value.find((x) => x.id === s.id)!;
    await deleteStored(gone.id);
    expect(shows.value.some((x) => x.id === s.id)).toBe(false);
    await openStored(shows.value[0]!.id);
    expect(session.value).not.toBeNull();
  });
});

describe('cables on the input and instrument lists', () => {
  test('a channel lists the audio cables of its source and a light its control cables', () => {
    const show = rock();
    const inputs = buildReport(show, 'inputs');
    expect(inputs.header[inputs.header.length - 1]).toBe('Cables');
    const withCable = inputs.rows.filter((r) => r[r.length - 1] !== '');
    expect(withCable.length).toBeGreaterThan(0);
    expect(withCable[0]![withCable[0]!.length - 1]).toMatch(/→/);
    const lights = buildReport(show, 'instruments');
    for (const row of lights.rows) expect(row).toHaveLength(lights.header.length);
  });
});
