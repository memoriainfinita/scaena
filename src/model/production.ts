// The one-event production data: setlist, day schedule and build calls. Pure operations like the rest of the model.
import { nextId } from './ids.ts';
import type { SetlistItem, Show } from './schema.ts';

type Slot = Show['schedule'][number];

// ---- durations ----

/** "4:30" or "4.5" (minutes) or "270s" to seconds; null when it is none of those. */
export function parseDuration(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (t === '') return 0;
  const clock = /^(\d{1,3}):([0-5]?\d)$/.exec(t);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const secs = /^(\d+(?:\.\d+)?)\s*s$/i.exec(t);
  if (secs) return Math.round(Number(secs[1]));
  const mins = /^\d+(?:\.\d+)?$/.exec(t);
  if (mins) return Math.round(Number(t) * 60);
  return null;
}

/** Seconds as m:ss, or h:mm:ss from an hour on. */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

export const setlistTotal = (show: Show): number => show.setlist.reduce((a, x) => a + x.seconds, 0);

// ---- setlist ----

export function addSong(show: Show, title = ''): [Show, SetlistItem] {
  const [id, s] = nextId(show, 'so');
  const item: SetlistItem = { id, title, comment: '', seconds: 0 };
  return [{ ...s, setlist: [...s.setlist, item] }, item];
}
export const updateSong = (show: Show, id: string, patch: Partial<Omit<SetlistItem, 'id'>>): Show => ({ ...show, setlist: show.setlist.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
export const removeSong = (show: Show, id: string): Show => ({ ...show, setlist: show.setlist.filter((x) => x.id !== id) });
export function moveSong(show: Show, id: string, delta: -1 | 1): Show {
  const i = show.setlist.findIndex((x) => x.id === id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= show.setlist.length) return show;
  const list = [...show.setlist];
  [list[i], list[j]] = [list[j]!, list[i]!];
  return { ...show, setlist: list };
}

// ---- schedule ----

/** The milestones a day sheet usually has, in the usual order (docs/investigacion.md, day sheet). */
export const MILESTONES = ['loadIn', 'soundcheck', 'meal', 'doors', 'opener', 'changeover', 'show', 'loadOut', 'curfew', 'dressingEnd'] as const;
export type Milestone = (typeof MILESTONES)[number];

export function addSlot(show: Show, kind: Slot['kind'], what = '', time = ''): [Show, Slot] {
  const [id, s] = nextId(show, 'sl');
  const slot: Slot = { id, time, what, kind };
  return [{ ...s, schedule: [...s.schedule, slot] }, slot];
}
export const updateSlot = (show: Show, id: string, patch: Partial<Omit<Slot, 'id'>>): Show => ({ ...show, schedule: show.schedule.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
export const removeSlot = (show: Show, id: string): Show => ({ ...show, schedule: show.schedule.filter((x) => x.id !== id) });

/** A valid clock time: 7:30 or 19:30. */
export const isClock = (t: string): boolean => /^([01]?\d|2[0-3]):[0-5]\d$/.test(t.trim());

/** Minutes since midnight, or null. */
export const toMinutes = (t: string): number | null => {
  if (!isClock(t)) return null;
  const [h, m] = t.trim().split(':').map(Number);
  return h! * 60 + m!;
};

/** The slots of a kind in time order; the ones with no valid time keep their place at the end. */
export function sortedSlots(show: Show, kind: Slot['kind']): Slot[] {
  return show.schedule
    .filter((x) => x.kind === kind)
    .map((x, i) => ({ x, i, m: toMinutes(x.time) }))
    .sort((a, b) => (a.m ?? Infinity) - (b.m ?? Infinity) || a.i - b.i)
    .map((r) => r.x);
}

// ---- backward calendar ----

export interface BackwardInput {
  /** The hour the venue must be empty by, as a clock time. */
  curfew: string;
  /** Minutes the show lasts. */
  showMin: number;
  /** Minutes the load-out takes before padding. */
  loadOutMin: number;
  /** Minutes of the changeover between the opener and the show; 0 leaves it out. */
  changeoverMin: number;
  /** Minutes from doors to the start of the show. */
  doorsLeadMin: number;
  /** Minutes of soundcheck, which ends when the doors open. */
  soundcheckMin: number;
  /** Minutes the load-in takes before padding. */
  loadInMin: number;
  /** Extra time added to the load-in and the load-out, in percent. */
  extraPct: number;
}

export interface BackwardRow {
  milestone: Milestone;
  /** Minutes since midnight. */
  minutes: number;
}

export const DEFAULT_BACKWARD: Omit<BackwardInput, 'curfew'> = { showMin: 90, loadOutMin: 60, changeoverMin: 0, doorsLeadMin: 30, soundcheckMin: 60, loadInMin: 120, extraPct: 50 };

export const clock = (minutes: number): string => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Works from the curfew back to the first call: the load-out (padded) ends at the curfew, the show ends when it starts,
 * the doors open a little before the show, the soundcheck ends when they open and the load-in (padded) ends when it starts.
 * Null when the curfew is not a clock time, a duration is not a whole number of minutes, or the first call would be before midnight.
 */
export function planBackwards(input: BackwardInput): BackwardRow[] | null {
  const end = toMinutes(input.curfew);
  if (end === null) return null;
  const durations = [input.showMin, input.loadOutMin, input.changeoverMin, input.doorsLeadMin, input.soundcheckMin, input.loadInMin];
  if (durations.some((d) => !Number.isInteger(d) || d < 0) || !Number.isFinite(input.extraPct) || input.extraPct < 0) return null;
  const pad = (m: number) => Math.round(m * (1 + input.extraPct / 100));
  const rows: BackwardRow[] = [{ milestone: 'curfew', minutes: end }];
  let t = end - pad(input.loadOutMin);
  rows.push({ milestone: 'loadOut', minutes: t });
  t -= input.showMin;
  rows.push({ milestone: 'show', minutes: t });
  if (input.changeoverMin > 0) {
    t -= input.changeoverMin;
    rows.push({ milestone: 'changeover', minutes: t });
    t += input.changeoverMin;
  }
  t -= input.doorsLeadMin;
  rows.push({ milestone: 'doors', minutes: t });
  t -= input.soundcheckMin;
  rows.push({ milestone: 'soundcheck', minutes: t });
  t -= pad(input.loadInMin);
  rows.push({ milestone: 'loadIn', minutes: t });
  if (t < 0) return null;
  return rows.sort((a, b) => a.minutes - b.minutes);
}

/** Puts the calculated times in the day schedule: a slot already named like the milestone gets the new time, the others are added. */
export function applyBackwards(show: Show, rows: BackwardRow[], names: Record<Milestone, string>): Show {
  let out = show;
  for (const r of rows) {
    const same = out.schedule.find((x) => x.kind === 'day' && x.what.trim().toLowerCase() === names[r.milestone].toLowerCase());
    if (same) out = updateSlot(out, same.id, { time: clock(r.minutes) });
    else out = addSlot(out, 'day', names[r.milestone], clock(r.minutes))[0];
  }
  return out;
}
