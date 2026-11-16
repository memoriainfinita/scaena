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

test('a damaged show is told apart from a newer one, and one that only breaks a limit is read mended', async () => {
  await saveShow(db, 'future', { ...newShow('Futuro'), formatVersion: 99 } as never);
  await saveShow(db, 'bad', { ...newShow('Roto'), paper: 'A7' } as never);
  await saveShow(db, 'long', { ...newShow('Largo'), name: 'n'.repeat(300) });
  expect(await readShow(db, 'future')).toMatchObject({ ok: false, newer: true });
  expect(await readShow(db, 'bad')).toMatchObject({ ok: false, newer: false });
  const long = await readShow(db, 'long');
  expect(long).toMatchObject({ ok: true, repaired: 1 });
  if (long?.ok) expect(long.show.name).toHaveLength(120);
  expect(await readShow(db, 'a')).toBeNull();
});

test('flush writes what is waiting at once, and nothing when nothing is', async () => {
  vi.useFakeTimers();
  const save = vi.fn(async () => undefined);
  const a = autosave(save, () => false, 100);
  await a.flush();
  expect(save).toHaveBeenCalledTimes(0);
  a.schedule();
  await a.flush();
  expect(save).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(500);
  await a.flush();
  expect(save).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

test('a save that fails rejects the flush that asked for it and does not stop the next one', async () => {
  vi.useFakeTimers();
  let fail = true;
  const save = vi.fn(async () => {
    if (fail) throw new Error('quota');
  });
  const a = autosave(save, () => false, 100);
  a.schedule();
  await expect(a.flush()).rejects.toThrow('quota');
  // Nothing new to write: the failed change is not tried again by itself, only when asked.
  await a.flush();
  expect(save).toHaveBeenCalledTimes(1);
  fail = false;
  a.retry();
  await a.flush();
  expect(save).toHaveBeenCalledTimes(2);
  a.schedule();
  await vi.advanceTimersByTimeAsync(150);
  expect(save).toHaveBeenCalledTimes(3);
  vi.useRealTimers();
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
