import 'fake-indexeddb/auto';
import { beforeEach, expect, test, vi } from 'vitest';
import { newShow } from '../model/new.ts';
import { autosave, deleteShow, getLastShow, listShows, openLibrary, readRevisionData, readShow, saveRevisionData, saveShow, setLastShow } from './storage.ts';

let db: IDBDatabase;
beforeEach(async () => {
  db?.close();
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase('scaena');
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  db = await openLibrary();
});

test('saves, lists and reads a show', async () => {
  const s = newShow('Uno');
  await saveShow(db, 'a', s, { 'f.png': new Uint8Array([7]) });
  const list = await listShows(db);
  expect(list.map((x) => x.name)).toEqual(['Uno']);
  const r = await readShow(db, 'a');
  expect(r).toMatchObject({ ok: true });
  if (r?.ok) expect([...r.images['f.png']!]).toEqual([7]);
  expect(await readShow(db, 'nope')).toBeNull();
});

test('a show from a newer format is reported, not thrown, and stays on disk', async () => {
  const future = { ...newShow('Futuro'), formatVersion: 99 };
  await saveShow(db, 'f', future as never);
  const r = await readShow(db, 'f');
  expect(r).toMatchObject({ ok: false });
  const again = await readShow(db, 'f');
  expect(again).toMatchObject({ ok: false });
});

test('remembers the last show and its revisions, and deleting clears them', async () => {
  await saveShow(db, 'a', newShow('Uno'));
  await setLastShow(db, 'a');
  await saveRevisionData(db, 'a', 1, new Uint8Array([1, 2]));
  expect(await getLastShow(db)).toBe('a');
  expect([...(await readRevisionData(db, 'a', 1))!]).toEqual([1, 2]);
  await deleteShow(db, 'a');
  expect(await listShows(db)).toEqual([]);
  expect(await readRevisionData(db, 'a', 1)).toBeUndefined();
});

test('autosave debounces and never writes while blocked', async () => {
  vi.useFakeTimers();
  const save = vi.fn(async () => undefined);
  let blocked = false;
  const a = autosave(save, () => blocked, 100);
  a.schedule();
  a.schedule();
  a.schedule();
  await vi.advanceTimersByTimeAsync(150);
  expect(save).toHaveBeenCalledTimes(1);
  blocked = true;
  a.schedule();
  await vi.advanceTimersByTimeAsync(500);
  await a.flush();
  expect(save).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
