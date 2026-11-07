import { beforeEach, describe, expect, test } from 'vitest';
import { createCustomItem, deleteCustomItem, readDrawing } from '../app/custom-item-actions.ts';
import { createLayer, moveCustomLayer, moveToLayer, removeCustomLayer, renameCustomLayer } from '../app/plan-actions.ts';
import { addFromLibrary, session, setLibrary, startEmpty } from '../app/state.ts';
import { buildDocument } from '../document/typst-source.ts';
import { planSvg } from '../document/plan-svg.ts';
import { addCustomItem, customItemUses, removeCustomItem, type CustomDraft } from '../model/custom-items.ts';
import { addElement } from '../model/ops.ts';
import { addLayer, moveLayer, removeLayer, renameLayer, setElementsLayer, MAX_CUSTOM_LAYERS } from '../model/layers.ts';
import { packShow, unpackShow } from '../model/archive.ts';
import { loadShow } from '../model/migrate.ts';
import { newShow } from '../model/new.ts';
import { itemById, searchItems } from './items.ts';
import { FIXTURES, OFL_FIXTURES, fixtureById } from './models.ts';
import { cleanSvg } from './svg-clean.ts';
import { symbolBody } from './symbols.ts';
import { withCustomItems } from './custom.ts';

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect x="0" y="0" width="200" height="100" fill="#fff" stroke="#000"/><circle cx="100" cy="50" r="30"/></svg>';
const clean = () => {
  const r = cleanSvg(SVG);
  if (!r.ok) throw new Error('fixture refused');
  return r.svg;
};
const draft = (over: Partial<CustomDraft> = {}): CustomDraft => ({ name: 'Mesa de regiduría', svg: clean(), w: 2000, d: 1000, h: 750, weightKg: 30, powerW: null, layer: 'stage', ...over });

describe('own layers', () => {
  const base = () => newShow('t');
  test('add, rename, move and remove; only custom layers change', () => {
    let [show, layer] = addLayer(base(), '  Vestuario  ');
    expect(layer).toMatchObject({ name: 'Vestuario', subject: 'custom', visible: true, locked: false });
    expect(show.layers.at(-1)).toBe(layer);
    show = renameLayer(show, layer!.id, 'Vestuario y atrezo');
    expect(show.layers.at(-1)!.name).toBe('Vestuario y atrezo');
    expect(renameLayer(show, 'l-stage', 'Otra')).toBe(show);
    expect(renameLayer(show, layer!.id, '   ')).toBe(show);
    const before = show.layers.map((l) => l.id);
    show = moveLayer(show, layer!.id, -1);
    expect(show.layers.map((l) => l.id)).not.toEqual(before);
    expect(show.layers.at(-2)!.id).toBe(layer!.id);
    expect(moveLayer(show, 'l-stage', 1)).toBe(show);
    expect(moveLayer(addLayer(base(), 'x')[0], 'ly1', 1).layers.at(-1)!.id).toBe('ly1'); // already last: unchanged
    expect(removeLayer(show, 'l-audio')).toBe(show);
  });
  test('empty names and too many layers are refused, and ids stay sequential', () => {
    expect(addLayer(base(), '   ')[1]).toBeNull();
    let show = base();
    for (let i = 0; i < MAX_CUSTOM_LAYERS; i++) show = addLayer(show, `c${i}`)[0];
    expect(addLayer(show, 'one more')[1]).toBeNull();
    expect(show.layers.filter((l) => l.subject === 'custom').map((l) => l.id).slice(0, 3)).toEqual(['ly1', 'ly2', 'ly3']);
  });
  test('removing a layer sends its elements back to the layer of their kind', () => {
    let [show, layer] = addLayer(base(), 'Mía');
    let el;
    [show, el] = addElement(show, { type: { id: 'power.outlet', version: 1 }, x: 0, y: 0, layerId: layer!.id });
    show = removeLayer(show, layer!.id);
    expect(show.layers.some((l) => l.id === layer!.id)).toBe(false);
    const home = show.layers.find((l) => l.id === show.elements[el.id]!.layerId)!;
    expect(home.subject).toBe(itemById('power.outlet')!.layer);
  });
  test('elements can be moved to any layer, but not to one that does not exist', () => {
    let [show, layer] = addLayer(base(), 'Mía');
    let el;
    [show, el] = addElement(show, { type: { id: 'power.outlet', version: 1 }, x: 0, y: 0, layerId: 'l-stage' });
    expect(setElementsLayer(show, [el.id], layer!.id).elements[el.id]!.layerId).toBe(layer!.id);
    expect(setElementsLayer(show, [el.id], 'nope')).toBe(show);
  });
});

describe('own elements', () => {
  test('an element carries its drawing, size and layer, and is found like a library item', () => {
    const [show, item] = addCustomItem(newShow('t'), draft());
    expect(item).toMatchObject({ id: 'cu1', name: 'Mesa de regiduría', w: 2000, d: 1000, h: 750, weightKg: 30, layer: 'stage' });
    withCustomItems(show.customItems, () => {
      const it = itemById('custom.cu1')!;
      expect(it.name.es).toBe('Mesa de regiduría');
      expect(it.size).toEqual({ w: 2000, d: 1000, h: 750 });
      expect(searchItems('regiduria').map((i) => i.id)).toContain('custom.cu1');
      const body = symbolBody(it.symbol, 2000, 1000);
      expect(body).toContain('scale(10 10)');
      expect(body).toContain('<circle');
    });
    expect(itemById('custom.cu1')).toBeUndefined(); // another show does not see it
  });
  test('a bad name or size is refused', () => {
    const show = newShow('t');
    expect(addCustomItem(show, draft({ name: '  ' }))[1]).toBeNull();
    expect(addCustomItem(show, draft({ w: 0 }))[1]).toBeNull();
    expect(addCustomItem(show, draft({ d: Number.NaN }))[1]).toBeNull();
    expect(addCustomItem(show, draft({ h: -5 }))[1]).toBeNull();
  });
  test('it cannot be removed while it is on the plan', () => {
    let [show] = addCustomItem(newShow('t'), draft());
    [show] = addElement(show, { type: { id: 'custom.cu1', version: 1 }, x: 0, y: 0, layerId: 'l-stage' });
    expect(customItemUses(show, 'cu1')).toBe(1);
    expect(removeCustomItem(show, 'cu1')).toBe(show);
    const free = removeCustomItem(addCustomItem(newShow('t'), draft())[0], 'cu1');
    expect(free.customItems).toEqual({});
  });
  test('the file keeps the drawing, and a file with a doctored drawing is refused on opening', () => {
    const [show] = addCustomItem(newShow('t'), draft());
    const back = unpackShow(packShow(show)).show;
    expect(back.customItems.cu1!.markup).toBe(show.customItems.cu1!.markup);
    const evil = (markup: string) => JSON.parse(JSON.stringify({ ...show, customItems: { cu1: { ...show.customItems.cu1, markup } } }));
    expect(() => loadShow(evil('<script>alert(1)</script>'))).toThrow();
    expect(() => loadShow(evil('<rect width="5" height="5" onclick="x()"/>'))).toThrow();
    expect(() => loadShow(evil('<image href="http://evil/x.png"/>'))).toThrow();
    expect(() => loadShow(evil('<rect width="5" height="5"/>'))).toThrow(); // not exactly what the cleaner makes
    expect(() => loadShow(JSON.parse(JSON.stringify(show)))).not.toThrow();
  });
  test('it is drawn in the PDF plan and named in the document, from the show itself', () => {
    let [show] = addCustomItem(newShow('t', ['document']), draft());
    [show] = addElement(show, { type: { id: 'custom.cu1', version: 1 }, x: 3000, y: 2000, layerId: 'l-stage' });
    const svg = planSvg(show, {}, { availWidthMm: 180, availHeightMm: 250, planScale: null, lang: 'es' }).svg;
    expect(svg).toContain('<circle');
    expect(svg).toContain('Mesa de regiduría');
    expect(buildDocument({ ...show, document: { ...show.document, template: 'custom', sections: ['plan'] } }).source).toBeTruthy();
  });
});

describe('own layers and elements on an open show', () => {
  beforeEach(() => {
    setLibrary(null);
    session.value = null;
    startEmpty('x');
  });
  test('create, rename, move and delete a layer as separate undo steps', () => {
    expect(createLayer('  ')).toBe(false);
    expect(createLayer('Vestuario')).toBe(true);
    const s = session.value!;
    expect(s.show.value.layers.at(-1)!.name).toBe('Vestuario');
    renameCustomLayer('ly1', 'Atrezo');
    moveCustomLayer('ly1', -1);
    expect(s.show.value.layers.at(-2)!.name).toBe('Atrezo');
    removeCustomLayer('ly1');
    expect(s.show.value.layers.some((l) => l.id === 'ly1')).toBe(false);
    s.undo();
    expect(s.show.value.layers.some((l) => l.id === 'ly1')).toBe(true);
  });
  test('an own element is saved, placed from the library on its layer, and deleted only when free', () => {
    const drawing = readDrawing(new TextEncoder().encode(SVG));
    expect(drawing.ok).toBe(true);
    const typeId = createCustomItem(draft({ layer: 'lights' }));
    expect(typeId).toBe('custom.cu1');
    const id = addFromLibrary('custom.cu1')!;
    const s = session.value!;
    const layer = s.show.value.layers.find((l) => l.id === s.show.value.elements[id]!.layerId)!;
    expect(layer.subject).toBe('lights');
    deleteCustomItem('cu1');
    expect(s.show.value.customItems.cu1).toBeDefined();
    moveToLayer([id], 'l-stage');
    expect(s.show.value.elements[id]!.layerId).toBe('l-stage');
    s.commit((show) => ({ ...show, elements: {}, channels: {} }));
    deleteCustomItem('cu1');
    expect(s.show.value.customItems.cu1).toBeUndefined();
  });
  test('files that are not drawings are refused with the reason', () => {
    expect(readDrawing(new TextEncoder().encode('<html></html>'))).toEqual({ ok: false, error: 'notSvg' });
    expect(readDrawing(new Uint8Array(200_001))).toEqual({ ok: false, error: 'tooBig' });
  });
});

describe('Open Fixture Library fixtures', () => {
  test('they are there, with their source page, and do not repeat the theatre list', () => {
    expect(OFL_FIXTURES.length).toBeGreaterThan(600);
    const ids = new Set([...FIXTURES, ...OFL_FIXTURES].map((f) => f.id));
    expect(ids.size).toBe(FIXTURES.length + OFL_FIXTURES.length);
    for (const f of OFL_FIXTURES) {
      expect(f.id.startsWith('ofl.')).toBe(true);
      expect(f.source).toBe(`https://open-fixture-library.org/${f.id.split('.')[1]}/${f.id.split('.').slice(2).join('.')}`);
      expect(f.community).toBe(true);
      expect(f.estimate).toBeUndefined();
    }
  });
  test('they are found by id, with their weight and power, and the theatre list still is', () => {
    const f = fixtureById('ofl.etc.colorsource-par')!;
    expect(f).toMatchObject({ brand: 'ETC', model: 'ColorSource PAR', weightKg: 3.77, powerW: 90, kind: 'led' });
    expect(fixtureById('etc.s4-26')!.brand).toBe('ETC');
    expect(fixtureById('ofl.nope.nothing')).toBeUndefined();
  });
});
