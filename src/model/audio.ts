// Input channels and outputs: pure operations that keep the numbers 1..n without gaps.
import { nextId } from './ids.ts';
import type { InputChannel, Output, PlanElement, Show } from './schema.ts';

const byNumber = <T extends { number: number }>(rec: Record<string, T>): T[] => Object.values(rec).sort((a, b) => a.number - b.number);

function renumber<T extends { id: string; number: number }>(list: T[]): Record<string, T> {
  return Object.fromEntries(list.map((x, i) => [x.id, { ...x, number: i + 1 }]));
}

export const channelList = (show: Show): InputChannel[] => byNumber(show.channels);
export const outputList = (show: Show): Output[] => byNumber(show.outputs);

export interface DrawnWedge {
  o: Output;
  e: PlanElement;
}

/** Wedge outputs whose wedge is drawn on the plan. */
export const drawnWedges = (show: Show): DrawnWedge[] =>
  outputList(show)
    .filter((o) => o.kind === 'wedge' && o.sourceElementId && show.elements[o.sourceElementId])
    .map((o) => ({ o, e: show.elements[o.sourceElementId!]! }));

/** Left to right and, at the same x, front (large y) first: the order wedges are numbered in. */
export const wedgeOrder = (a: DrawnWedge, b: DrawnWedge): number => a.e.x - b.e.x || b.e.y - a.e.y;

/** True when the drawn wedges already carry their numbers in that order. */
export function wedgesInOrder(show: Show): boolean {
  const w = drawnWedges(show); // already by number
  return [...w].sort(wedgeOrder).every((x, i) => x === w[i]);
}

/** Shares the numbers the drawn wedges already hold out again in order; other outputs keep theirs. */
export function numberWedges(show: Show): Show {
  const wedges = drawnWedges(show);
  if (wedges.length < 2 || wedgesInOrder(show)) return show;
  const numbers = wedges.map((w) => w.o.number).sort((a, b) => a - b);
  const outputs = { ...show.outputs };
  [...wedges].sort(wedgeOrder).forEach((w, i) => {
    outputs[w.o.id] = { ...w.o, number: numbers[i]! };
  });
  return { ...show, outputs };
}

export function addChannel(show: Show, init: Partial<Omit<InputChannel, 'id' | 'number'>> = {}): [Show, InputChannel] {
  const [id, s] = nextId(show, 'ch');
  const ch: InputChannel = { shortName: '', mic: '', stand: '', phantom: false, insert: '', patch: '', stereoPairWith: null, sourceElementId: null, notes: '', ...init, id, number: Object.keys(show.channels).length + 1 };
  return [{ ...s, channels: { ...s.channels, [id]: ch } }, ch];
}

export function updateChannel(show: Show, id: string, patch: Partial<Omit<InputChannel, 'id' | 'number'>>): Show {
  const ch = show.channels[id];
  if (!ch) throw new Error(`unknown channel ${id}`);
  return { ...show, channels: { ...show.channels, [id]: { ...ch, ...patch } } };
}

export function removeChannel(show: Show, id: string): Show {
  if (!show.channels[id]) return show;
  const rest = channelList(show)
    .filter((c) => c.id !== id)
    .map((c) => (c.stereoPairWith === id ? { ...c, stereoPairWith: null } : c));
  return { ...show, channels: renumber(rest) };
}

/** Swaps the channel with its neighbour (`delta` -1 up, +1 down). */
export function moveChannel(show: Show, id: string, delta: -1 | 1): Show {
  const list = channelList(show);
  const i = list.findIndex((c) => c.id === id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= list.length) return show;
  [list[i], list[j]] = [list[j]!, list[i]!];
  return { ...show, channels: renumber(list) };
}

/** Pairs two channels both ways, or frees `a` (and its partner) when `b` is null. Previous partners are freed. */
export function setStereoPair(show: Show, a: string, b: string | null): Show {
  if (!show.channels[a] || (b !== null && (!show.channels[b] || b === a))) return show;
  const channels = { ...show.channels };
  const free = (id: string | null | undefined) => {
    const c = id ? channels[id] : undefined;
    if (c) channels[c.id] = { ...c, stereoPairWith: null };
  };
  free(channels[a]!.stereoPairWith);
  if (b !== null) free(channels[b]!.stereoPairWith);
  free(a);
  if (b !== null) {
    channels[a] = { ...channels[a]!, stereoPairWith: b };
    channels[b] = { ...channels[b]!, stereoPairWith: a };
  }
  return { ...show, channels };
}

/** Reorders the channels by a rank (lower first); equal ranks keep their current order. */
export function sortChannels(show: Show, rank: (c: InputChannel) => number): Show {
  const list = channelList(show)
    .map((c, i) => ({ c, i }))
    .sort((x, y) => rank(x.c) - rank(y.c) || x.i - y.i)
    .map((x) => x.c);
  return { ...show, channels: renumber(list) };
}

export function addOutput(show: Show, init: Partial<Omit<Output, 'id' | 'number'>> = {}): [Show, Output] {
  const [id, s] = nextId(show, 'out');
  const out: Output = { kind: 'wedge', stereo: false, aux: '', sourceElementId: null, notes: '', ...init, id, number: Object.keys(show.outputs).length + 1 };
  return [{ ...s, outputs: { ...s.outputs, [id]: out } }, out];
}

export function updateOutput(show: Show, id: string, patch: Partial<Omit<Output, 'id' | 'number'>>): Show {
  const o = show.outputs[id];
  if (!o) throw new Error(`unknown output ${id}`);
  return { ...show, outputs: { ...show.outputs, [id]: { ...o, ...patch } } };
}

export function removeOutput(show: Show, id: string): Show {
  if (!show.outputs[id]) return show;
  return { ...show, outputs: renumber(outputList(show).filter((o) => o.id !== id)) };
}

export function moveOutput(show: Show, id: string, delta: -1 | 1): Show {
  const list = outputList(show);
  const i = list.findIndex((o) => o.id === id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= list.length) return show;
  [list[i], list[j]] = [list[j]!, list[i]!];
  return { ...show, outputs: renumber(list) };
}
