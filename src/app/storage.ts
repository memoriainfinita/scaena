// Local library in IndexedDB: shows, their images and their revision snapshots. Nothing leaves the browser.
import { openShow, UnsupportedFormat } from '../model/migrate.ts';
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
  /** A template is a show kept to start others from; a record without the field is a show. */
  kind?: 'show' | 'template';
}

export type Kind = 'show' | 'template';
/** A show read from the library. `repaired` counts the values cut or clamped to fit the format; `newer` tells a show of a later scaena from a damaged one. */
export type Loaded = { ok: true; show: Show; images: Record<string, Uint8Array>; repaired: number } | { ok: false; error: string; newer: boolean };

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

export async function saveShow(db: IDBDatabase, id: string, show: Show, images: Record<string, Uint8Array> = {}, kind: Kind = 'show'): Promise<void> {
  const record: StoredShow = { id, name: show.name, updated: Date.now(), data: show, images, kind };
  await wrap(db.transaction('shows', 'readwrite').objectStore('shows').put(record));
}

/**
 * Starts writing a show, and that it is the last one open, before returning: for the moment the page is being left, when
 * nothing that waits for a promise is sure to run (see `saveOnLeave` for which moments keep the write).
 */
export function writeShowNow(db: IDBDatabase, id: string, show: Show, images: Record<string, Uint8Array> = {}): void {
  const tx = db.transaction(['shows', 'meta'], 'readwrite');
  const record: StoredShow = { id, name: show.name, updated: Date.now(), data: show, images, kind: 'show' };
  tx.objectStore('shows').put(record);
  tx.objectStore('meta').put(id, 'last');
}

export async function listShows(db: IDBDatabase, kind: Kind = 'show'): Promise<{ id: string; name: string; updated: number }[]> {
  const all = (await wrap(db.transaction('shows').objectStore('shows').getAll())) as StoredShow[];
  return all
    .filter((r) => (r.kind ?? 'show') === kind)
    .map(({ id, name, updated }) => ({ id, name, updated }))
    .sort((a, b) => b.updated - a.updated);
}

/** Reads a show. A show this version cannot read comes back as an error and must never be overwritten. */
export async function readShow(db: IDBDatabase, id: string): Promise<Loaded | null> {
  const rec = (await wrap(db.transaction('shows').objectStore('shows').get(id))) as StoredShow | undefined;
  if (!rec) return null;
  try {
    return { ok: true, ...openShow(rec.data), images: rec.images };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), newer: e instanceof UnsupportedFormat && e.newer };
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
 * must stay exactly as it is on disk. `flush` writes at once what is waiting, and nothing when nothing is.
 * A save that fails is the business of `save` to report; the next one is tried all the same.
 */
export function autosave(save: () => Promise<void>, blocked: () => boolean, delayMs = 800) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> = Promise.resolve();
  /** True from a change until the save that carries it starts. */
  let waiting = false;
  const start = (): Promise<void> => {
    const p = running.then(() => {
      if (blocked() || !waiting) return undefined;
      waiting = false;
      return save();
    });
    running = p.catch(() => undefined);
    return p;
  };
  return {
    schedule() {
      if (blocked()) return;
      waiting = true;
      clearTimeout(timer);
      timer = setTimeout(() => void start().catch(() => undefined), delayMs);
    },
    /** Asks for a save even with nothing new to write: to try again one that failed. */
    retry() {
      if (blocked()) return;
      waiting = true;
    },
    async flush() {
      clearTimeout(timer);
      await start();
    },
  };
}
