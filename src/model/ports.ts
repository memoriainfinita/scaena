// Ports of an element: what it takes in and puts out. A connection can name the port at each end.
// See docs/design/ports-desks-2026-11-15.md.
import { nextId } from './ids.ts';
import type { Port, Show, SignalType } from './schema.ts';

/** Formats offered for a port of each signal; the field still takes anything. */
export const PORT_FORMATS: Record<SignalType, string[]> = {
  audio: ['Analogue', 'AES/EBU', 'Dante', 'AES50', 'MADI', 'AVB', 'ADAT'],
  video: ['HDMI', 'SDI', 'DisplayPort', 'NDI', 'SDI 12G'],
  lightControl: ['DMX', 'sACN', 'Art-Net'],
  network: ['Ethernet', 'Fibre'],
  usb: ['USB audio', 'USB MIDI', 'USB data'],
};

/** The name a new port starts with, in the language of the show: "Entrada 1", "Out 2". */
const PORT_WORDS = { es: { in: 'Entrada', out: 'Salida', io: 'E/S' }, en: { in: 'In', out: 'Out', io: 'I/O' } } as const;

export const portsOf = (show: Show, elementId: string): Port[] => show.elements[elementId]?.ports ?? [];

/** Adds a port at the end of an element's list, numbering its name after the ones it has. */
export function addPort(show: Show, elementId: string, init: Partial<Omit<Port, 'id'>> = {}): [Show, Port | null] {
  const el = show.elements[elementId];
  if (!el) return [show, null];
  const [id, s] = nextId(show, 'pt');
  const dir = init.dir ?? 'out';
  const port: Port = { name: `${PORT_WORDS[show.lang][dir]} ${el.ports.filter((p) => p.dir === dir).length + 1}`, signal: 'audio', format: '', channels: 1, note: '', ...init, dir, id };
  return [{ ...s, elements: { ...s.elements, [elementId]: { ...el, ports: [...el.ports, port] } } }, port];
}

export function updatePort(show: Show, elementId: string, portId: string, patch: Partial<Omit<Port, 'id'>>): Show {
  const el = show.elements[elementId];
  if (!el || !el.ports.some((p) => p.id === portId)) return show;
  return { ...show, elements: { ...show.elements, [elementId]: { ...el, ports: el.ports.map((p) => (p.id === portId ? { ...p, ...patch } : p)) } } };
}

/** Removes a port; the connections that named it keep existing, without a port. */
export function removePort(show: Show, elementId: string, portId: string): Show {
  const el = show.elements[elementId];
  if (!el || !el.ports.some((p) => p.id === portId)) return show;
  const connections = Object.fromEntries(
    Object.values(show.connections).map((c) => [c.id, { ...c, ...(c.from === elementId && c.fromPortId === portId ? { fromPortId: null } : {}), ...(c.to === elementId && c.toPortId === portId ? { toPortId: null } : {}) }]),
  );
  return { ...show, connections, elements: { ...show.elements, [elementId]: { ...el, ports: el.ports.filter((p) => p.id !== portId) } } };
}
