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
  return { ...show, connections: { ...show.connections, [id]: { ...c, ...patch } } };
}

export function removeConnection(show: Show, id: string): Show {
  if (!show.connections[id]) return show;
  return { ...show, connections: Object.fromEntries(Object.entries(show.connections).filter(([k]) => k !== id)) };
}

/** The connections that touch an element, in a stable order. */
export const connectionsOf = (show: Show, elementId: string): Connection[] =>
  Object.values(show.connections)
    .filter((c) => c.from === elementId || c.to === elementId)
    .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
