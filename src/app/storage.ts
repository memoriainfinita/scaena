// Local library in IndexedDB: shows, their images and their revision snapshots. Nothing leaves the browser.
import { loadShow } from '../model/migrate.ts';
import type { Show } from '../model/schema.ts';

const DB_NAME = 'scaena';
const DB_VERSION = 1;

export interface StoredShow {
  id: string;
  name: string;
  updated: number;
  /** The show as saved; read through `loadShow` before use, since it may come from an older format. */
  data: unknown;
  images: Record<string, Uint8Array>;
}

export type Loaded = { ok: true; show: Show; images: Record<string, Uint8Array> } | { ok: false; error: string };

const wrap = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

export function openLibrary(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore('shows', { keyPath: 'id' });
      db.createObjectStore('revisions');
      db.createObjectStore('meta');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveShow(db: IDBDatabase, id: string, show: Show, images: Record<string, Uint8Array> = {}): Promise<void> {
  const record: StoredShow = { id, name: show.name, updated: Date.now(), data: show, images };
  await wrap(db.transaction('shows', 'readwrite').objectStore('shows').put(record));
}

export async function listShows(db: IDBDatabase): Promise<{ id: string; name: string; updated: number }[]> {
  const all = (await wrap(db.transaction('shows').objectStore('shows').getAll())) as StoredShow[];
  return all.map(({ id, name, updated }) => ({ id, name, updated })).sort((a, b) => b.updated - a.updated);
}

/** Reads a show. A show this version cannot read comes back as an error and must never be overwritten. */
export async function readShow(db: IDBDatabase, id: string): Promise<Loaded | null> {
  const rec = (await wrap(db.transaction('shows').objectStore('shows').get(id))) as StoredShow | undefined;
  if (!rec) return null;
  try {
    return { ok: true, show: loadShow(rec.data), images: rec.images };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteShow(db: IDBDatabase, id: string): Promise<void> {
  const tx = db.transaction(['shows', 'revisions'], 'readwrite');
  tx.objectStore('shows').delete(id);
  const keys = (await wrap(tx.objectStore('revisions').getAllKeys())) as string[];
  for (const k of keys) if (k.startsWith(`${id}:`)) tx.objectStore('revisions').delete(k);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const saveRevisionData = (db: IDBDatabase, showId: string, n: number, data: Uint8Array) => wrap(db.transaction('revisions', 'readwrite').objectStore('revisions').put(data, `${showId}:${n}`));
export const readRevisionData = (db: IDBDatabase, showId: string, n: number) => wrap(db.transaction('revisions').objectStore('revisions').get(`${showId}:${n}`)) as Promise<Uint8Array | undefined>;

/** The id of the show to reopen on start. */
export const setLastShow = (db: IDBDatabase, id: string) => wrap(db.transaction('meta', 'readwrite').objectStore('meta').put(id, 'last'));
export const getLastShow = (db: IDBDatabase) => wrap(db.transaction('meta').objectStore('meta').get('last')) as Promise<string | undefined>;

/**
 * Debounced autosave. It refuses to write while `blocked()` is true: a show that could not be read
 * must stay exactly as it is on disk.
 */
export function autosave(save: () => Promise<void>, blocked: () => boolean, delayMs = 800) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> = Promise.resolve();
  return {
    schedule() {
      if (blocked()) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        running = running.then(() => (blocked() ? undefined : save())).catch(() => undefined);
      }, delayMs);
    },
    async flush() {
      clearTimeout(timer);
      if (!blocked()) running = running.then(save);
      await running;
    },
  };
}
