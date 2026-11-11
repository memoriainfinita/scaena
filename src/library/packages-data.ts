// Helpers the example packages use for everything that is not on the plan: contacts, day schedule, set list,
// hospitality, contract, venue facts, electrical and work notes. Venues and everything else are made up, never real:
// contacts are placeholders (generic name, 000 number, an address on example.com).
import { nextId } from '../model/ids.ts';
import { addSong, addSlot } from '../model/production.ts';
import { addWorkNote, setCircuitPhase, setDimmerMax, setPhaseBreaker } from '../model/lights.ts';
import type { Show } from '../model/schema.ts';
import type { Bilingual, PackageChannel, PackageElement, PackageLink, PackageMount } from './types.ts';

export type Tx = (b: Bilingual) => string;
export const bi = (es: string, en: string): Bilingual => ({ es, en });

/** [role, name, phone, email]: the examples carry placeholders, not people: nobody's name, number or address. */
export type PersonRow = [Bilingual, Bilingual | string, string, string];
export const PERSON: [Bilingual, string, string] = [bi('Nombre y apellidos', 'Full name'), '000 000 000', 'correo@ejemplo.com'];

export function addContacts(show: Show, tx: Tx, rows: PersonRow[]): Show {
  for (const [role, name, phone, email] of rows) {
    const [id, s] = nextId(show, 'ct');
    const c: Show['contacts'][number] = { id, role: tx(role), name: typeof name === 'string' ? name : tx(name), phone, email, hidden: [] };
    show = { ...s, contacts: [...s.contacts, c] };
  }
  return show;
}

/** [kind, time, what]: `build` rows are the load-in plan, `day` rows the day of the show. */
export type SlotRow = ['day' | 'build', string, Bilingual];

export function addSchedule(show: Show, tx: Tx, rows: SlotRow[]): Show {
  for (const [kind, time, what] of rows) [show] = addSlot(show, kind, tx(what), time);
  return show;
}

/** [title, seconds, comment] */
export type SongRow = [Bilingual | string, number, (Bilingual | string)?];
const text = (tx: Tx, b: Bilingual | string): string => (typeof b === 'string' ? b : tx(b));

export function addSetlist(show: Show, tx: Tx, rows: SongRow[]): Show {
  for (const [title, seconds, comment] of rows) {
    [show] = addSong(show, text(tx, title));
    const id = show.setlist.at(-1)!.id;
    show = { ...show, setlist: show.setlist.map((x) => (x.id === id ? { ...x, seconds, comment: comment ? text(tx, comment) : '' } : x)) };
  }
  return show;
}

export interface Electrical {
  /** Breaker in amps per phase: L1, L2, L3. */
  breakers: number[];
  /** Circuit number to phase number. */
  circuits: [number, number][];
  /** Dimmer number to its maximum load in watts. */
  dimmers?: [number, number][];
}

export function setElectrical(show: Show, e: Electrical): Show {
  e.breakers.forEach((a, i) => (show = setPhaseBreaker(show, i + 1, a)));
  for (const [c, p] of e.circuits) show = setCircuitPhase(show, c, p);
  for (const [d, w] of e.dimmers ?? []) show = setDimmerMax(show, d, w);
  return show;
}

/** Work notes, each tied to an element of the package by its index (or to nothing). */
export function addNotes(show: Show, placed: { id: string }[], tx: Tx, rows: [Bilingual, number?][]): Show {
  for (const [text, at] of rows) [show] = addWorkNote(show, tx(text), at === undefined ? null : placed[at]!.id);
  return show;
}

type Extra = Partial<PackageElement>;

/** A package under construction: `el` and friends return the index the others refer to. */
export function build() {
  const elements: PackageElement[] = [];
  const channels: PackageChannel[] = [];
  const links: PackageLink[] = [];
  const el = (type: string, x: number, y: number, label = '', extra: Extra = {}): number => elements.push({ type, x, y, label, ...extra }) - 1;
  const ch = (name: string, mic: string, stand: string, phantom: boolean, element?: number, patch?: string): void => {
    channels.push({ name, mic, stand, phantom, ...(element === undefined ? {} : { element }), ...(patch === undefined ? {} : { patch }) });
  };
  const link = (from: number, to: number, signal: PackageLink['signal'] = 'audio', connector?: string, toPort?: number, lines?: number): void => {
    links.push({ from, to, signal, ...(connector === undefined ? {} : { connector }), ...(toPort === undefined ? {} : { toPort }), ...(lines === undefined ? {} : { lines }) });
  };
  /** A radio link between two elements, such as a bodypack to its receiver: not a cable. */
  const radio = (from: number, to: number, connector?: string): void => {
    links.push({ from, to, signal: 'audio', wireless: true, ...(connector === undefined ? {} : { connector }) });
  };
  return { elements, channels, links, el, ch, link, radio };
}

export const BAND: Extra = { suppliedBy: 'band' };
export const VENUE: Extra = { suppliedBy: 'venue' };
export const mount = (kind: PackageMount['kind'], es: string, en: string, from: [number, number], to: [number, number], heightMm: number, maxLoadKg?: number): PackageMount => ({
  kind, name: bi(es, en), from: { x: from[0], y: from[1] }, to: { x: to[0], y: to[1] }, heightMm, ...(maxLoadKg === undefined ? {} : { maxLoadKg }),
});
