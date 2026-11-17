// The open show and the local library: what the top bar says about the save, and what is written.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, test } from 'vitest';
import { unpackShow } from '../model/archive.ts';
import { LIMITS } from '../model/limits.ts';
import { duplicateStored, shows } from './library-actions.ts';
import { openFileBytes, openStored, renameShow, reopenLast, session, setElementField, setLibrary, startEmpty, startError, startFromPackage, addFromLibrary } from './state.ts';
import { openLibrary, readRevisionData, readShow, saveShow } from './storage.ts';
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

describe('revisions travel with the show', () => {
  const stored = async (id: string) => (await readShow(db, id)) as Extract<Awaited<ReturnType<typeof readShow>>, { ok: true }>;

  test('a .scaena file carries the copy of each revision and opens with them', async () => {
    startFromPackage('showcase', 'Muestra');
    const s = session.value!;
    await s.flush();
    await new Promise((r) => setTimeout(r, 50)); // the package stores its copies without waiting
    const numbers = s.show.value.revisions.map((r) => r.number);
    expect(numbers.length).toBeGreaterThan(0);
    const bytes = await s.toFileWithRevisions();
    expect(Object.keys(unpackShow(bytes).revisions).map(Number).sort()).toEqual([...numbers].sort());

    // In a library that has none of them, they are there after opening the file.
    session.value = null;
    await new Promise<void>((resolve) => {
      db.close();
      const req = indexedDB.deleteDatabase('scaena');
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
    db = await openLibrary();
    setLibrary(Promise.resolve(db));
    openFileBytes(bytes);
    const opened = session.value!;
    await new Promise((r) => setTimeout(r, 50));
    for (const n of numbers) expect(await opened.loadRevision(n)).toBeInstanceOf(Uint8Array);
  });

  test('a duplicate keeps the copies of the revisions', async () => {
    startFromPackage('showcase', 'Muestra');
    const s = session.value!;
    await s.flush();
    await new Promise((r) => setTimeout(r, 50));
    const numbers = s.show.value.revisions.map((r) => r.number);
    await duplicateStored(s.id, '(copia)');
    const copy = shows.value.find((x) => x.name === 'Muestra (copia)')!;
    expect(copy).toBeTruthy();
    const open = await stored(copy.id);
    expect(open.show.revisions.map((r) => r.number)).toEqual(numbers);
    for (const n of numbers) expect(await readRevisionData(db, copy.id, n)).toBeInstanceOf(Uint8Array);
  });
});

describe('a drag that commits on every move', () => {
  test('is one undo step between beginGesture and endGesture', () => {
    startEmpty('Uno');
    const s = session.value!;
    const id = addFromLibrary('mic.boom-tall')!;
    const before = s.show.value.elements[id]!.x;
    s.beginGesture();
    for (let i = 1; i <= 5; i++) setElementField(id, { x: before + i * 10 });
    s.beginGesture(); // a second begin does not nest
    s.endGesture();
    expect(s.show.value.elements[id]!.x).toBe(before + 50);
    s.undo();
    expect(s.show.value.elements[id]!.x).toBe(before);
    s.endGesture(); // ending with no gesture open is harmless
  });
});

describe('two tabs with the same show', () => {
  test('the tab that saves second is told, and the first one is not overwritten', async () => {
    startEmpty('Uno');
    const a = session.value!;
    await a.flush();
    // The second tab opens the stored copy.
    await openStored(a.id);
    const b = session.value!;
    expect(b).not.toBe(a);
    renameShow('Desde B');
    await b.flush();
    // The first tab still has the old stamp.
    session.value = a;
    renameShow('Desde A');
    await expect(a.flush()).rejects.toThrow();
    expect(a.saveState.value).toBe('error');
    expect(a.saveError.value).toMatch(/otra pestaña|another tab/);
    const stored = await readShow(db, a.id);
    expect(stored?.ok && stored.show.name).toBe('Desde B');
  });

  test('one tab saving again and again is never in conflict with itself', async () => {
    startEmpty('Uno');
    const s = session.value!;
    for (const n of ['a', 'b', 'c']) {
      renameShow(n);
      await s.flush();
    }
    expect(s.saveState.value).toBe('saved');
    // Leaving the page writes at once and the ordinary save after it still goes through.
    renameShow('d');
    s.leave();
    renameShow('e');
    await s.flush();
    expect(s.saveState.value).toBe('saved');
    const stored = await readShow(db, s.id);
    expect(stored?.ok && stored.show.name).toBe('e');
  });
});

describe('images in the local library', () => {
  test('an image the show no longer uses is not kept, and one it uses is', async () => {
    startEmpty('Uno');
    const s = session.value!;
    s.addImage('viejo.png', new Uint8Array([1]));
    s.addImage('logo.png', new Uint8Array([2]));
    s.commit((show) => ({ ...show, titleBlock: { ...show.titleBlock, logo: 'logo.png' } }));
    await s.flush();
    const stored = await readShow(db, s.id);
    expect(stored?.ok && Object.keys(stored.images)).toEqual(['logo.png']);
    expect(Object.keys(s.allImages()).sort()).toEqual(['logo.png', 'viejo.png']); // the session keeps both, for undo
  });
});
