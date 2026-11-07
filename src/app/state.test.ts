import { beforeEach, describe, expect, test } from 'vitest';
import { packShow } from '../model/archive.ts';
import { newShow } from '../model/new.ts';
import { addDimension } from './plan-actions.ts';
import { addFromLibrary, applyShowSettings, openFileBytes, renameShow, selection, session, setElementField, setElementType, setLayerFlag, setLibrary, startEmpty, startError, startFromPackage } from './state.ts';

beforeEach(() => {
  setLibrary(null);
  session.value = null;
  startError.value = null;
});

describe('starting a show', () => {
  test('from a package, with its channels and the first view', () => {
    startFromPackage('rock', 'Mi banda');
    const s = session.value!;
    expect(s.show.value.name).toBe('Mi banda');
    expect(Object.keys(s.show.value.channels)).toHaveLength(17);
    expect(s.canUndo.value).toBe(false);
  });

  test('an empty show has the default layers and no elements', () => {
    startEmpty('Vacío');
    expect(session.value!.show.value.layers).toHaveLength(7);
    expect(Object.keys(session.value!.show.value.elements)).toHaveLength(0);
  });

  test('an unknown package is an error, not a silent empty show', () => {
    expect(() => startFromPackage('nope', 'x')).toThrow();
  });
});

describe('editing', () => {
  test('adding from the library selects the new element and undo removes it', () => {
    startEmpty('x');
    const id = addFromLibrary('kit.drums5');
    const s = session.value!;
    expect(id).toBe('e1');
    expect(selection.value).toEqual(['e1']);
    expect(s.show.value.elements.e1!.layerId).toBe('l-audio');
    expect(s.canUndo.value).toBe(true);
    s.undo();
    expect(Object.keys(s.show.value.elements)).toHaveLength(0);
    expect(s.canRedo.value).toBe(true);
    s.redo();
    expect(s.show.value.elements.e1).toBeDefined();
  });

  test('element fields and layer flags are undoable steps', () => {
    startEmpty('x');
    const id = addFromLibrary('amp.guitar')!;
    setElementField(id, { label: 'Guitarra 1', suppliedBy: 'band' });
    setLayerFlag('l-audio', 'visible', false);
    const s = session.value!;
    expect(s.show.value.elements[id]).toMatchObject({ label: 'Guitarra 1', suppliedBy: 'band' });
    expect(s.show.value.layers.find((l) => l.id === 'l-audio')!.visible).toBe(false);
    s.undo();
    expect(s.show.value.layers.find((l) => l.id === 'l-audio')!.visible).toBe(true);
  });

  test('renaming trims to the model limit', () => {
    startEmpty('x');
    renameShow('a'.repeat(300));
    expect(session.value!.show.value.name).toHaveLength(120);
  });

  test('show settings change modules, paper, region and stage size together', () => {
    startEmpty('x');
    applyShowSettings({ modules: ['audio', 'lights'], regionCode: 'US', voltage: 120, paper: 'Letter', units: 'imperial', lang: 'en', stageWidthM: 10, stageDepthM: 6 });
    const show = session.value!.show.value;
    expect(show.modules).toEqual(['audio', 'lights']);
    expect(show.paper).toBe('Letter');
    expect(show.region).toMatchObject({ code: 'US', voltage: 120 });
    expect(show.stage.shape).toMatchObject({ kind: 'rect', width: 10000, depth: 6000 });
    session.value!.undo();
    expect(session.value!.show.value.paper).toBe('A4');
  });

  test('the stage deck height is set in metres and kept when the settings leave it out', () => {
    startEmpty('x');
    const base = { modules: ['audio' as const], regionCode: 'ES', voltage: 230, paper: 'A4' as const, units: 'metric' as const, lang: 'es' as const, stageWidthM: 8, stageDepthM: 5 };
    applyShowSettings({ ...base, stageHeightM: 1.2 });
    expect(session.value!.show.value.stage.height).toBe(1200);
    applyShowSettings(base);
    expect(session.value!.show.value.stage.height).toBe(1200);
    applyShowSettings({ ...base, stageHeightM: -3 });
    expect(session.value!.show.value.stage.height).toBe(0);
  });

  test('the stage can become a free-form polygon, get a proscenium opening and hide reference lines', () => {
    startEmpty('x');
    const base = { modules: ['audio' as const], regionCode: 'ES', voltage: 230, paper: 'A4' as const, units: 'metric' as const, lang: 'es' as const, stageWidthM: 8, stageDepthM: 5 };
    applyShowSettings({ ...base, prosceniumM: 5, referenceLines: { center: false, plaster: true, proscenium: true } });
    let show = session.value!.show.value;
    expect(show.stage.shape).toMatchObject({ kind: 'rect', prosceniumWidth: 5000 });
    expect(show.stage.referenceLines.center).toBe(false);
    applyShowSettings({ ...base, stagePolygonM: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }] });
    show = session.value!.show.value;
    expect(show.stage.shape).toEqual({ kind: 'polygon', points: [{ x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 6000, y: 4000 }], prosceniumWidth: 5000 }); // the opening carries over to the free-form plan
    applyShowSettings({ ...base, stagePolygonM: [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 4 }] });
    expect(session.value!.show.value.stage.shape).toMatchObject({ prosceniumWidth: 3000 }); // and is trimmed to the width of the plan
    applyShowSettings({ ...base, stagePolygonM: null });
    expect(session.value!.show.value.stage.shape.kind).toBe('rect');
  });
});

describe('placing from the library', () => {
  test('an item with suggested channels adds them to the input list in the same undo step', () => {
    startEmpty('x');
    const before = Object.keys(session.value!.show.value.channels).length;
    const id = addFromLibrary('kit.drums5');
    const show = session.value!.show.value;
    const added = Object.values(show.channels).filter((c) => c.sourceElementId === id);
    expect(added.length).toBeGreaterThan(3);
    expect(Object.keys(show.channels)).toHaveLength(before + added.length);
    session.value!.undo();
    expect(session.value!.show.value.elements[id!]).toBeUndefined();
    expect(Object.keys(session.value!.show.value.channels)).toHaveLength(before);
  });
  test('without the Audio module no channels are created', () => {
    startEmpty('x');
    session.value!.commit((s) => ({ ...s, modules: ['lights'] }));
    addFromLibrary('kit.drums5');
    expect(Object.keys(session.value!.show.value.channels)).toHaveLength(0);
  });
  test('an item dropped on the plan lands where it was dropped, on the grid', () => {
    startEmpty('x');
    const id = addFromLibrary('furniture.table', { x: 2130, y: 3860 });
    const el = session.value!.show.value.elements[id!]!;
    expect({ x: el.x, y: el.y }).toEqual({ x: 2000, y: 4000 });
  });
});

describe('dimensions', () => {
  test('a measured distance becomes a dimension on the notes layer, readable and undoable', () => {
    startEmpty('x');
    const id = addDimension({ x: 1000, y: 1000 }, { x: 1000, y: -2000 });
    const show = session.value!.show.value;
    const el = show.elements[id!]!;
    expect(el.type.id).toBe('note.dimension');
    expect(el.width).toBe(3000);
    expect(el.x).toBe(1000);
    expect(el.y).toBe(-500);
    expect(Math.abs(el.rotation)).toBe(90);
    expect(show.layers.find((l) => l.id === el.layerId)?.subject).toBe('notes');
    expect(addDimension({ x: 5, y: 5 }, { x: 5, y: 5 })).toBeNull();
    session.value!.undo();
    expect(session.value!.show.value.elements[id!]).toBeUndefined();
  });
});

describe('files', () => {
  test('a saved .scaena opens again with the same show', () => {
    startFromPackage('jazz', 'Jazz');
    const bytes = session.value!.toFile();
    session.value = null;
    openFileBytes(bytes);
    expect(session.value!.show.value.name).toBe('Jazz');
    expect(Object.keys(session.value!.show.value.channels)).toHaveLength(12);
  });

  test('a file that is not a show gives an error and opens nothing', () => {
    openFileBytes(new Uint8Array([1, 2, 3, 4]));
    expect(session.value).toBeNull();
    expect(startError.value).toBeTruthy();
  });

  test('a show from a newer format is refused with the newer message', () => {
    const future = { ...newShow('Futuro'), formatVersion: 99 };
    openFileBytes(packShow(future as never));
    expect(session.value).toBeNull();
    expect(startError.value).toBe('newer');
  });
});

describe('swapping the kind of an element', () => {
  test('keeps what was set up on it and refuses another category', () => {
    startEmpty('x');
    const a = addFromLibrary('mic.boom-tall')!;
    setElementField(a, { label: 'Voz solista', notes: 'con cable largo' });
    setElementType([a], 'mic.boom-short');
    const el = session.value!.show.value.elements[a]!;
    expect(el.type.id).toBe('mic.boom-short');
    expect([el.label, el.notes]).toEqual(['Voz solista', 'con cable largo']);
    setElementType([a], 'furniture.chair');
    expect(session.value!.show.value.elements[a]!.type.id).toBe('mic.boom-short');
  });
});
