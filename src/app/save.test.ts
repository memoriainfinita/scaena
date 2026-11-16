// The open show and the local library: what the top bar says about the save, and what is written.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, test } from 'vitest';
import { unpackShow } from '../model/archive.ts';
import { LIMITS } from '../model/limits.ts';
import { openFileBytes, openStored, renameShow, reopenLast, session, setElementField, setLibrary, startEmpty, startError, addFromLibrary } from './state.ts';
import { openLibrary, readShow, saveShow } from './storage.ts';
import { newShow } from '../model/new.ts';

let db: IDBDatabase;
beforeEach(async () => {
  db?.close();
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase('scaena');
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  db = await openLibrary();
  setLibrary(Promise.resolve(db));
  session.value = null;
  startError.value = null;
});

describe('the state of the save', () => {
  test('a change reads as not saved until it is written', async () => {
    startEmpty('Uno');
    const s = session.value!;
    await s.flush();
    expect(s.saveState.value).toBe('saved');
    renameShow('Dos');
    expect(s.saveState.value).toBe('pending');
    await s.flush();
    expect(s.saveState.value).toBe('saved');
    const stored = await readShow(db, s.id);
    expect(stored?.ok && stored.show.name).toBe('Dos');
  });

  test('leaving the page starts the write of a waiting change before returning', async () => {
    startEmpty('Uno');
    const s = session.value!;
    await s.flush();
    renameShow('Dos');
    const puts: string[] = [];
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (this: IDBObjectStore, value: unknown, key?: IDBValidKey) {
      puts.push(this.name);
      return put.call(this, value, key);
    };
    try {
      s.leave();
      // Nothing was awaited: both writes (the show, and which show is the last) are already under way.
      expect(puts).toEqual(['shows', 'meta']);
    } finally {
      IDBObjectStore.prototype.put = put;
    }
    await s.flush();
    const stored = await readShow(db, s.id);
    expect(stored?.ok && stored.show.name).toBe('Dos');
  });

  test('a browser with no local library says so instead of "saved"', () => {
    setLibrary(null);
    // No IndexedDB in this run of the function: `library()` gives none.
    const idb = globalThis.indexedDB;
    // @ts-expect-error the global is removed for this test only
    delete globalThis.indexedDB;
    try {
      startEmpty('Sin biblioteca');
      expect(session.value!.saveState.value).toBe('off');
      renameShow('Otro');
      expect(session.value!.saveState.value).toBe('off');
    } finally {
      globalThis.indexedDB = idb;
    }
  });

  test('a save that fails is reported with its reason, and trying again clears it', async () => {
    startEmpty('Uno');
    const s = session.value!;
    await s.flush();
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = () => {
      throw new Error('QuotaExceededError');
    };
    try {
      renameShow('Dos');
      await expect(s.flush()).rejects.toThrow('QuotaExceededError');
      expect(s.saveState.value).toBe('error');
      expect(s.saveError.value).toBe('QuotaExceededError');
    } finally {
      IDBObjectStore.prototype.put = put;
    }
    await s.retrySave();
    expect(s.saveState.value).toBe('saved');
    expect(s.saveError.value).toBeNull();
    const stored = await readShow(db, s.id);
    expect(stored?.ok && stored.show.name).toBe('Dos');
  });
});

describe('nothing is written that could not be read back', () => {
  test('a value over a limit is cut before the save, in the open show too, and counted', async () => {
    startEmpty('Uno');
    const s = session.value!;
    const id = addFromLibrary('mic.boom-tall')!;
    setElementField(id, { label: 'x'.repeat(LIMITS.label + 40) });
    await s.flush();
    expect(s.trimmed.value).toBe(1);
    expect(s.show.value.elements[id]!.label).toHaveLength(LIMITS.label);
    expect(s.saveState.value).toBe('saved');
    const stored = await readShow(db, s.id);
    expect(stored).toMatchObject({ ok: true, repaired: 0 });
    // Undo brings the long text back, and the next save cuts it again: the library never holds it.
    s.undo();
    expect(s.show.value.elements[id]!.label).toHaveLength(LIMITS.label + 40);
    await s.flush();
    expect(s.show.value.elements[id]!.label).toHaveLength(LIMITS.label);
  });

  test('the .scaena file of such a show opens', () => {
    startEmpty('Uno');
    const id = addFromLibrary('mic.boom-tall')!;
    setElementField(id, { notes: 'n'.repeat(LIMITS.notes + 1) });
    const back = unpackShow(session.value!.toFile());
    expect(back.repaired).toBe(0);
    expect(back.show.elements[id]!.notes).toHaveLength(LIMITS.notes);
  });

  test('a show with a fault that is not a limit is not written over the good copy', async () => {
    startEmpty('Uno');
    const s = session.value!;
    await s.flush();
    s.commit((show) => ({ ...show, name: 'Dos', paper: 'A7' as never }));
    await expect(s.flush()).rejects.toThrow(/paper/);
    expect(s.saveState.value).toBe('error');
    const stored = await readShow(db, s.id);
    expect(stored?.ok && stored.show.name).toBe('Uno');
    expect(() => s.toFile()).toThrow(/paper/);
  });
});

describe('opening a stored show', () => {
  test('one that breaks a limit opens mended and the editor is told', async () => {
    await saveShow(db, 'long', { ...newShow('x'), name: 'n'.repeat(300) });
    await openStored('long');
    expect(session.value!.trimmed.value).toBe(1);
    expect(session.value!.show.value.name).toHaveLength(LIMITS.showName);
    expect(startError.value).toBeNull();
  });

  test('a damaged one is refused as damaged, with the reason, and a newer one as newer', async () => {
    await saveShow(db, 'bad', { ...newShow('Roto'), paper: 'A7' } as never);
    await saveShow(db, 'future', { ...newShow('Futuro'), formatVersion: 99 } as never);
    await openStored('bad');
    expect(session.value).toBeNull();
    expect(startError.value).toMatchObject({ stored: true });
    expect((startError.value as { reason: string }).reason).toMatch(/A7/);
    await openStored('future');
    expect(startError.value).toBe('newer');
  });

  test('when the last show cannot be reopened the start screen says why', async () => {
    await saveShow(db, 'bad', { ...newShow('Roto'), paper: 'A7' } as never);
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put('bad', 'last');
    await new Promise((r) => (tx.oncomplete = r));
    expect(await reopenLast()).toBe(false);
    expect(startError.value).toMatchObject({ stored: true });
  });

  test('a file that is not a show is an error of the file, not "newer"', () => {
    openFileBytes(new Uint8Array([1, 2, 3, 4]));
    expect(startError.value).toMatchObject({ stored: false });
  });
});
