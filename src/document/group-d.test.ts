import { beforeEach, describe, expect, test } from 'vitest';
import { applyDocTemplate, deleteDocTemplate, docTemplates, MAX_TEMPLATES, saveDocTemplate, templateOf, withTemplate } from '../app/doc-templates.ts';
import { removeLogo, setLogo } from '../app/document-data-actions.ts';
import { session, setLibrary, startEmpty, startFromPackage } from '../app/state.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { addChannel } from '../model/audio.ts';
import { newShow } from '../model/new.ts';
import type { Show } from '../model/schema.ts';
import { sniffLogo } from './logo.ts';
import { autoBlocks, buildDocument, cellLines, colWidths, type Col, listRoomMm } from './typst-source.ts';

const FULL: Col[] = [{ mm: 11 }, { fr: 1 }, { fr: 1.3 }, { fr: 1 }, { mm: 16 }, { mm: 11 }, { mm: 10 }, { fr: 1.1 }, { mm: 12 }];
const WITH_CABLES: Col[] = [...FULL, { fr: 1.5 }];
const plainRows = (n: number) => Array.from({ length: n }, (_, i) => [String(i + 1), `c${i + 1}`, 'SM57', 'Pinza', `P${i + 1}`, 'No', '', 'Caja', 'US']);
const compactOf = (rows: string[][]) => rows.map((r) => [r[0]!, r[1]!, r[2]!, r[4]!, r[5]!]);

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

const inputsOnly = (show: Show, inputs: Show['document']['inputs'] = { landscape: false, blocks: 'auto' }): Show => ({ ...show, document: { ...show.document, template: 'custom', sections: ['inputs'], inputs } });
const withChannels = (n: number): Show => {
  let show: Show = newShow('t', ['audio', 'document']);
  for (let i = 0; i < n; i++) show = addChannel(show, { shortName: `c${i + 1}`, mic: 'SM57', patch: `P${i + 1}` })[0];
  return show;
};

describe('channel list layout', () => {
  test('a cell wraps at spaces by the width of its column, as measured on the PDF', () => {
    const w = colWidths(WITH_CABLES, 180);
    expect(cellLines('Sennheiser e 604', w[2]!)).toBe(2);
    expect(cellLines('AKG C414 XLII', w[2]!)).toBe(1);
    expect(cellLines('XLR 7.5 m → Stagebox', w[9]!)).toBe(2);
    expect(cellLines('', w[9]!)).toBe(1);
  });
  test('automatic blocks are the fewest that fit one page, counting how rows wrap', () => {
    const auto = (n: number, landscape: boolean) => autoBlocks(plainRows(n), FULL, compactOf(plainRows(n)), landscape ? 267 : 180, listRoomMm(landscape ? 210 : 297));
    // One-line rows on A4: 43 fit upright and 28 turned.
    expect([0, 1, 43, 44, 86, 87, 300].map((n) => auto(n, false))).toEqual([1, 1, 1, 2, 2, 3, 4]);
    expect([28, 29, 56, 57].map((n) => auto(n, true))).toEqual([1, 2, 2, 3]);
    // Rows whose cables wrap over several lines leave room for fewer: 32 of them no longer fit in one table.
    const cabled = plainRows(32).map((r) => [...r, 'XLR 7.5 m → Stagebox; Jack 3 m → DI bajo']);
    expect(autoBlocks(cabled, WITH_CABLES, compactOf(cabled), 180, listRoomMm(297))).toBe(2);
  });
  test('one block is the full table with its position legend, vertical by default', () => {
    const doc = buildDocument(inputsOnly(withChannels(17)));
    expect(doc.source).not.toContain('#grid(columns');
    expect(doc.source).not.toContain('flipped: true');
    expect(doc.source).toContain('*#"Pie"*');
    expect(doc.source).toContain('US fondo');
  });
  test('horizontal puts the list on a turned page', () => {
    const doc = buildDocument(inputsOnly(withChannels(17), { landscape: true, blocks: 1 }));
    expect(doc.source).toContain('#page(flipped: true)[');
  });
  test('several blocks are side by side with the compact table and consecutive channels', () => {
    const doc = buildDocument(inputsOnly(withChannels(10), { landscape: false, blocks: 2 }));
    expect(doc.source).toContain('#grid(columns: (1fr, 1fr)');
    expect(doc.source).not.toContain('*#"Pie"*');
    expect(doc.source).toContain('48 V');
    // The first block ends at channel 5 and the second starts at 6.
    const grid = doc.source.slice(doc.source.indexOf('#grid(columns'));
    const second = grid.indexOf('table.header', grid.indexOf('table.header') + 1);
    expect(grid.slice(0, second)).toContain('"P5"');
    expect(grid.slice(0, second)).not.toContain('"P6"');
    expect(grid.slice(second)).toContain('"P6"');
  });
  test('a long list picks its blocks by itself, and a short list asked for four blocks does not print empty ones', () => {
    expect(buildDocument(inputsOnly(withChannels(50))).source).toContain('#grid(columns: (1fr, 1fr)');
    expect(buildDocument(inputsOnly(withChannels(3), { landscape: false, blocks: 4 })).source).toContain('#grid(columns: (1fr, 1fr, 1fr)');
  });
  test('an old file without the setting reads as vertical and automatic', () => {
    expect(showFromPackage(packageById('rock')!, 'r', 'es').document.inputs).toEqual({ landscape: false, blocks: 'auto' });
  });
});

describe('the cover logo', () => {
  const withLogo = (name: string): Show => ({ ...inputsOnly(withChannels(1)), document: { template: 'custom', sections: ['cover'], planScale: null, inputs: { landscape: false, blocks: 'auto' } }, titleBlock: { production: '', author: '', venue: '', logo: name } });
  test('a stored logo is placed above the title with alternative text', () => {
    const doc = buildDocument(withLogo('logo-x.png'), { 'logo-x.png': PNG });
    expect(doc.files['/logo.png']).toBe(PNG);
    expect(doc.source).toContain('#image("/logo.png"');
    expect(doc.source).toContain('alt: "Logotipo"');
  });
  test('no file, or a name of another kind, prints no logo', () => {
    expect(buildDocument(withLogo('logo-x.png')).source).not.toContain('#image(');
    expect(Object.keys(buildDocument(withLogo('logo-x.exe'), { 'logo-x.exe': PNG }).files)).toEqual([]);
  });
  test('only PNG, JPEG and SVG up to 2 MB are taken, by their first bytes', () => {
    expect(sniffLogo(PNG)).toBe('png');
    expect(sniffLogo(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0]))).toBe('jpg');
    expect(sniffLogo(new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe('svg');
    expect(sniffLogo(new TextEncoder().encode('MZ this is not an image at all'))).toBeNull();
    expect(sniffLogo(new Uint8Array(3))).toBeNull();
    const big = new Uint8Array(2 * 1024 * 1024 + 1);
    big.set(PNG);
    expect(sniffLogo(big)).toBeNull();
  });
});

describe('logo and templates on an open show', () => {
  beforeEach(() => {
    setLibrary(null);
    session.value = null;
    docTemplates.value = [];
    startEmpty('x');
  });
  test('setting a logo stores the image and names it in the title block; removing it clears the name', () => {
    expect(setLogo(PNG)).toBe(true);
    const name = session.value!.show.value.titleBlock.logo!;
    expect(name).toMatch(/^logo-.*\.png$/);
    expect(session.value!.allImages()[name]).toBeDefined();
    removeLogo();
    expect(session.value!.show.value.titleBlock.logo).toBeNull();
    expect(setLogo(new TextEncoder().encode('not an image, really'))).toBe(false);
    expect(session.value!.show.value.titleBlock.logo).toBeNull();
  });
  test('a template keeps the layout under a name, replaces one with the same name and applies as one undo step', () => {
    startFromPackage('rock', 'r');
    const s = session.value!;
    s.commit((show) => ({ ...show, paper: 'A3', document: { ...show.document, planScale: 50, inputs: { landscape: true, blocks: 2 } } }));
    expect(saveDocTemplate('  Mi gira ')).toBe(true);
    expect(docTemplates.value).toHaveLength(1);
    expect(docTemplates.value[0]!.name).toBe('Mi gira');
    s.commit((show) => ({ ...show, paper: 'A4', document: { ...show.document, planScale: null, inputs: { landscape: false, blocks: 'auto' } } }));
    expect(saveDocTemplate('mi GIRA')).toBe(true);
    expect(docTemplates.value).toHaveLength(1);
    expect(docTemplates.value[0]!.paper).toBe('A4');
    s.commit((show) => ({ ...show, paper: 'A3', document: { ...show.document, planScale: 50, inputs: { landscape: true, blocks: 2 } } }));
    expect(saveDocTemplate('Mi gira')).toBe(true);
    s.commit((show) => ({ ...show, paper: 'A4', document: { ...show.document, template: 'concert', planScale: null, inputs: { landscape: false, blocks: 'auto' } } }));
    expect(applyDocTemplate(docTemplates.value[0]!.id)).toBe(true);
    const applied = s.show.value;
    expect(applied.paper).toBe('A3');
    expect(applied.document).toMatchObject({ template: 'custom', planScale: 50, inputs: { landscape: true, blocks: 2 } });
    s.undo();
    expect(s.show.value.paper).toBe('A4');
  });
  test('empty names are refused, the list is capped, and a template can be deleted', () => {
    expect(saveDocTemplate('   ')).toBe(false);
    for (let i = 0; i < MAX_TEMPLATES; i++) expect(saveDocTemplate(`t${i}`)).toBe(true);
    expect(saveDocTemplate('one too many')).toBe(false);
    expect(saveDocTemplate('t3')).toBe(true); // replacing one is always allowed
    deleteDocTemplate(docTemplates.value[0]!.id);
    expect(docTemplates.value).toHaveLength(MAX_TEMPLATES - 1);
    expect(saveDocTemplate('one too many')).toBe(true);
  });
});

describe('applying a template to another show', () => {
  test('sections that need a module the show does not have are left out', () => {
    const rock = showFromPackage(packageById('rock')!, 'r', 'es');
    const tpl = templateOf({ ...rock, modules: ['audio', 'lights', 'document'], document: { ...rock.document, template: 'custom', sections: ['cover', 'inputs', 'outputs', 'lights', 'rigging', 'magic', 'electrical', 'notes'] } }, 'T', 't1');
    const speech = newShow('s', ['document']);
    expect(withTemplate(speech, tpl).document.sections).toEqual(['cover', 'notes']);
    const audioOnly = newShow('a', ['audio', 'document']);
    expect(withTemplate(audioOnly, tpl).document.sections).toEqual(['cover', 'inputs', 'outputs', 'notes']);
  });
});
