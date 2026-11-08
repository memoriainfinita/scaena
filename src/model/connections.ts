// Connections between elements: video, light control, network and audio cables drawn on the plan.
import { nextId } from './ids.ts';
import type { Connection, Show } from './schema.ts';

export type SignalType = Connection['signal'];
export const SIGNALS: readonly SignalType[] = ['audio', 'video', 'lightControl', 'network'];

/** The connector a new connection of each type starts with; the user edits it. */
export const DEFAULT_CONNECTOR: Record<SignalType, string> = { audio: 'XLR', video: 'HDMI', lightControl: 'DMX', network: 'Ethernet' };

/** Adds a connection; null when it would link an element to itself, point at a missing one, or repeat an existing pair and signal. */
export function addConnection(show: Show, from: string, to: string, signal: SignalType, connector = DEFAULT_CONNECTOR[signal]): [Show, Connection | null] {
  if (from === to || !show.elements[from] || !show.elements[to]) return [show, null];
  const same = Object.values(show.connections).some((c) => c.signal === signal && ((c.from === from && c.to === to) || (c.from === to && c.to === from)));
  if (same) return [show, null];
  const [id, s] = nextId(show, 'cn');
  const c: Connection = { id, from, to, signal, connector, lengthMm: null, label: '' };
  return [{ ...s, connections: { ...s.connections, [id]: c } }, c];
}

export function updateConnection(show: Show, id: string, patch: Partial<Omit<Connection, 'id' | 'from' | 'to'>>): Show {
  const c = show.connections[id];
  if (!c) return show;
  // A second cable of the same kind between the same two elements is refused, as when adding one.
  if (patch.signal && patch.signal !== c.signal && Object.values(show.connections).some((o) => o.id !== id && o.signal === patch.signal && ((o.from === c.from && o.to === c.to) || (o.from === c.to && o.to === c.from)))) return show;
  return { ...show, connections: { ...show.connections, [id]: { ...c, ...patch } } };
}

export function removeConnection(show: Show, id: string): Show {
  if (!show.connections[id]) return show;
  return { ...show, connections: Object.fromEntries(Object.entries(show.connections).filter(([k]) => k !== id)) };
}

/** Cable lengths that are sold, in metres; an estimate is rounded up to the next one. */
const STOCK_M = [1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
/** Slack for the connectors at both ends and for the cable not running in a straight line. */
const SLACK_MM = 1500;
const ROUTE_FACTOR = 1.1;

/** A rough length for a cable laid between two elements: along the floor (not as the crow flies), up or down, plus slack, in a stock size. */
export function estimateCableMm(show: Show, c: Pick<Connection, 'from' | 'to'>): number | null {
  const a = show.elements[c.from];
  const b = show.elements[c.to];
  if (!a || !b) return null;
  const run = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs((a.z ?? 0) - (b.z ?? 0));
  const m = (run * ROUTE_FACTOR + SLACK_MM) / 1000;
  const stock = STOCK_M.find((s) => s >= m) ?? Math.ceil(m / 10) * 10;
  return stock * 1000;
}

/** The length to use: the one the user typed, or the estimate when there is none. */
export function cableLength(show: Show, c: Connection): { mm: number; estimated: boolean } | null {
  if (c.lengthMm !== null) return { mm: c.lengthMm, estimated: false };
  const mm = estimateCableMm(show, c);
  return mm === null ? null : { mm, estimated: true };
}

/** The connections that touch an element, in a stable order. */
export const connectionsOf = (show: Show, elementId: string): Connection[] =>
  Object.values(show.connections)
    .filter((c) => c.from === elementId || c.to === elementId)
    .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
