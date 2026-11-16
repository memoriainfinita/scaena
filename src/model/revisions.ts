// A revision is a compressed snapshot of the whole show, kept beside the file (decided 2026-11-02).
import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate';
import { openShow } from './migrate.ts';
import type { RevisionMeta, Show } from './schema.ts';

export function snapshot(show: Show): Uint8Array {
  return gzipSync(strToU8(JSON.stringify(show)), { level: 9 });
}

export function restore(data: Uint8Array): Show {
  // A snapshot taken before the limits were enforced may break one; it is read like any show that is opened.
  return openShow(JSON.parse(strFromU8(gunzipSync(data)))).show;
}

/** Saves a new revision: bumps the number and records it. Returns the new show and the snapshot to store. */
export function saveRevision(show: Show, date: string, note: string, changes: string[] = []): { show: Show; data: Uint8Array } {
  const number = show.revisions.reduce((m, r) => Math.max(m, r.number), 0) + 1;
  const meta: RevisionMeta = { number, date, note, changes };
  const next: Show = { ...show, revision: number, date, revisions: [...show.revisions, meta] };
  return { show: next, data: snapshot(next) };
}
