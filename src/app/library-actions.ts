// The local library: every show kept in this browser, and the user's own templates.
import { signal } from '@preact/signals';
import type { Show } from '../model/schema.ts';
import { deleteShow, listShows, readShow, saveShow, type Kind } from './storage.ts';
import { library, session, openStored, refreshRecents } from './state.ts';

export interface Entry {
  id: string;
  name: string;
  updated: number;
}
export const shows = signal<Entry[]>([]);
export const templates = signal<Entry[]>([]);

const newId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export async function refreshLibrary(): Promise<void> {
  const db = library();
  if (!db) return;
  try {
    const d = await db;
    shows.value = await listShows(d, 'show');
    templates.value = await listShows(d, 'template');
  } catch {
    shows.value = [];
    templates.value = [];
  }
}

async function copyStored(id: string, kind: Kind, name: (old: string) => string): Promise<string | null> {
  const db = library();
  if (!db) return null;
  const d = await db;
  const r = await readShow(d, id);
  if (!r?.ok) return null;
  const copy: Show = { ...r.show, name: name(r.show.name).slice(0, 120), revisions: kind === 'template' ? [] : r.show.revisions };
  const nid = newId();
  await saveShow(d, nid, copy, r.images, kind);
  return nid;
}

export async function duplicateStored(id: string, suffix: string): Promise<void> {
  await copyStored(id, 'show', (n) => `${n} ${suffix}`);
  await refreshLibrary();
  await refreshRecents();
}

export async function deleteStored(id: string): Promise<void> {
  const db = library();
  if (!db) return;
  await deleteShow(await db, id);
  await refreshLibrary();
  await refreshRecents();
}

/** Keeps a copy of the open show as a template (without its revisions). */
export async function saveAsTemplate(): Promise<boolean> {
  const s = session.value;
  const db = library();
  if (!s || !db) return false;
  const show = s.show.value;
  await s.flush().catch(() => undefined);
  await saveShow(await db, newId(), { ...show, revisions: [], revision: 1 }, s.allImages(), 'template');
  await refreshLibrary();
  return true;
}

/** Opens a new show made from a template. The template stays as it was. */
export async function startFromTemplate(id: string): Promise<void> {
  const nid = await copyStored(id, 'show', (n) => n);
  if (nid) await openStored(nid);
}
