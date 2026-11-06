// Saving, comparing and restoring revisions of the open show. A revision is a compressed copy kept in this browser.
import { lang } from '../i18n/index.ts';
import { diffShows } from '../model/diff.ts';
import { restore, saveRevision } from '../model/revisions.ts';
import type { RevisionMeta, Show } from '../model/schema.ts';
import { session } from './state.ts';

const today = () => new Date().toISOString().slice(0, 10);

/** Saves the current state as the next revision. The changes are the difference from the previous revision, when there is one. */
export async function saveCurrentRevision(note: string): Promise<RevisionMeta> {
  const s = session.value;
  if (!s) throw new Error('no show open');
  if (!s.canKeepRevisions) throw new Error('no local library');
  const cur = s.show.value;
  const last = cur.revisions.reduce<RevisionMeta | null>((m, r) => (!m || r.number > m.number ? r : m), null);
  const prevData = last ? await s.loadRevision(last.number) : undefined;
  const changes = prevData ? diffShows(restore(prevData), cur, cur.lang) : [];
  const { show, data } = saveRevision(cur, today(), note.trim().slice(0, 500), changes);
  const meta = show.revisions[show.revisions.length - 1]!;
  await s.storeRevision(meta.number, data);
  s.commit(() => show);
  return meta;
}

/** What differs between a stored revision and the show as it is now. */
export async function compareWithCurrent(n: number): Promise<string[] | null> {
  const s = session.value;
  const data = await s?.loadRevision(n);
  return s && data ? diffShows(restore(data), s.show.value, lang.value) : null;
}

/** What changed from one stored revision to another, or to the show as it is now when `to` is null; null when one is missing. */
export async function compareRevisions(from: number, to: number | null): Promise<string[] | null> {
  const s = session.value;
  if (!s) return null;
  const a = await s.loadRevision(from);
  const b = to === null ? undefined : await s.loadRevision(to);
  if (!a || (to !== null && !b)) return null;
  return diffShows(restore(a), b ? restore(b) : s.show.value, lang.value);
}

/** Brings a revision's content back as one undoable step. The list of revisions and the revision number are kept. */
export async function restoreRevision(n: number): Promise<boolean> {
  const s = session.value;
  const data = await s?.loadRevision(n);
  if (!s || !data) return false;
  const old = restore(data);
  s.commit((cur: Show) => ({ ...old, revisions: cur.revisions, revision: cur.revision, date: cur.date }));
  return true;
}
