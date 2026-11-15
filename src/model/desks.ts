// Mixing desks: a show has one or more, the first being the main one. A source is one row (`InputChannel`) and
// carries a channel number and a patch per desk; an output belongs to the desk it comes out of.
// See docs/design/ports-desks-2026-11-15.md.
import { nextId } from './ids.ts';
import type { Desk, InputChannel, Output, Show } from './schema.ts';

/** The id of the desk that exists only while `Show.desks` is empty and stands for the single desk of older shows. */
export const IMPLICIT_DESK_ID = 'main';

/** The desks of the show, never empty: with no list the main desk is built from `show.desk`. */
export function desksOf(show: Show): Desk[] {
  if (show.desks.length > 0) return show.desks;
  return [{ id: IMPLICIT_DESK_ID, name: '', role: 'foh', model: show.desk.model ?? '', showFile: show.desk.showFile ?? '', elementId: null }];
}

export const mainDeskId = (show: Show): string => desksOf(show)[0]!.id;

/** The desk an id names, or the main desk when it names none (a removed desk, or an output with no desk). */
export const deskById = (show: Show, id: string | null | undefined): Desk => desksOf(show).find((d) => d.id === id) ?? desksOf(show)[0]!;

/** Where a source sits on a desk: its channel number and patch there, or null when it is not sent to it. */
export function channelOn(show: Show, ch: InputChannel, deskId: string): { number: number; patch: string } | null {
  const main = mainDeskId(show);
  const a = ch.assign[deskId];
  if (deskId === main) {
    if (!a) return { number: ch.number, patch: ch.patch };
    return a.number === null ? null : { number: a.number, patch: a.patch || ch.patch };
  }
  return a && a.number !== null ? { number: a.number, patch: a.patch } : null;
}

/** The sources sent to a desk, by their number on it. */
export function channelsOnDesk(show: Show, deskId: string): { ch: InputChannel; number: number; patch: string }[] {
  return Object.values(show.channels)
    .flatMap((ch) => {
      const at = channelOn(show, ch, deskId);
      return at ? [{ ch, ...at }] : [];
    })
    .sort((a, b) => a.number - b.number || a.ch.number - b.ch.number);
}

/** The outputs that come out of a desk, by number. */
export function outputsOnDesk(show: Show, deskId: string): Output[] {
  const main = mainDeskId(show);
  const known = new Set(desksOf(show).map((d) => d.id));
  return Object.values(show.outputs)
    .filter((o) => (o.deskId && known.has(o.deskId) ? o.deskId : main) === deskId)
    .sort((a, b) => a.number - b.number);
}

/** The first number on a desk that no source uses yet. */
export function nextFreeNumber(show: Show, deskId: string): number {
  const used = new Set(channelsOnDesk(show, deskId).map((x) => x.number));
  let n = 1;
  while (used.has(n)) n++;
  return n;
}

/** Writes the list into `show.desks`, keeping `show.desk` as a mirror of the main one. */
function withDesks(show: Show, desks: Desk[]): Show {
  const main = desks[0];
  return { ...show, desks, desk: main ? { model: main.model, showFile: main.showFile } : show.desk };
}

/** The show with its desk list written out: an older show with one implicit desk gets a real main desk. */
function materialised(show: Show): Show {
  if (show.desks.length > 0) return show;
  const [id, s] = nextId(show, 'dk');
  return withDesks(s, [{ ...desksOf(show)[0]!, id }]);
}

/** Adds a desk after the others; the first time it also turns the implicit desk into a real one. */
export function addDesk(show: Show, init: Partial<Omit<Desk, 'id'>> = {}): [Show, Desk] {
  const base = materialised(show);
  const [id, s] = nextId(base, 'dk');
  const role = init.role ?? (base.desks.some((d) => d.role === 'monitors') ? 'other' : 'monitors');
  const desk: Desk = { name: '', model: '', showFile: '', elementId: null, ...init, role, id };
  return [withDesks(s, [...s.desks, desk]), desk];
}

export function updateDesk(show: Show, id: string, patch: Partial<Omit<Desk, 'id'>>): Show {
  const base = materialised(show);
  if (!base.desks.some((d) => d.id === id) && id !== IMPLICIT_DESK_ID) return show;
  const target = id === IMPLICIT_DESK_ID ? base.desks[0]!.id : id;
  return withDesks(base, base.desks.map((d) => (d.id === target ? { ...d, ...patch } : d)));
}

/** Removes a desk other than the main one: its outputs go to the main desk and its channel assignments are dropped. */
export function removeDesk(show: Show, id: string): Show {
  if (show.desks.length < 2 || show.desks[0]!.id === id || !show.desks.some((d) => d.id === id)) return show;
  const channels = Object.fromEntries(
    Object.values(show.channels).map((c) => {
      const { [id]: _gone, ...assign } = c.assign;
      return [c.id, { ...c, assign }];
    }),
  );
  const outputs = Object.fromEntries(Object.values(show.outputs).map((o) => [o.id, o.deskId === id ? { ...o, deskId: null } : o]));
  return { ...withDesks(show, show.desks.filter((d) => d.id !== id)), channels, outputs };
}

/** Sends a source to a desk (with the next free number there) or, with `null`, stops sending it. */
export function sendToDesk(show: Show, channelId: string, deskId: string, number: number | null = nextFreeNumber(show, deskId)): Show {
  const ch = show.channels[channelId];
  if (!ch || !desksOf(show).some((d) => d.id === deskId)) return show;
  const prev = ch.assign[deskId];
  const assign = { ...ch.assign, [deskId]: { number, patch: prev?.patch ?? (deskId === mainDeskId(show) ? ch.patch : '') } };
  return { ...show, channels: { ...show.channels, [channelId]: { ...ch, assign } } };
}

/** Sets the patch of a source on a desk. The main desk's patch is the row's own. */
export function setDeskPatch(show: Show, channelId: string, deskId: string, patch: string): Show {
  const ch = show.channels[channelId];
  if (!ch) return show;
  if (deskId === mainDeskId(show) && !ch.assign[deskId]) return { ...show, channels: { ...show.channels, [channelId]: { ...ch, patch } } };
  const at = channelOn(show, ch, deskId);
  if (!at) return show;
  return { ...show, channels: { ...show.channels, [channelId]: { ...ch, assign: { ...ch.assign, [deskId]: { number: at.number, patch } } } } };
}

/** Moves an output to another desk. */
export function setOutputDesk(show: Show, outputId: string, deskId: string): Show {
  const o = show.outputs[outputId];
  if (!o || !desksOf(show).some((d) => d.id === deskId)) return show;
  return { ...show, outputs: { ...show.outputs, [outputId]: { ...o, deskId: deskId === mainDeskId(show) ? null : deskId } } };
}
