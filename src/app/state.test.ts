import { beforeEach, describe, expect, test } from 'vitest';
import { packShow } from '../model/archive.ts';
import { newShow } from '../model/new.ts';
import { addFromLibrary, applyShowSettings, openFileBytes, renameShow, selection, session, setElementField, setLayerFlag, setLibrary, startEmpty, startError, startFromPackage } from './state.ts';

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
