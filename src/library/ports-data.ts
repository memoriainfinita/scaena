// The ports a desk or a stagebox starts with when it comes from the library. They are the usual ones of the type, not a datasheet: each says so in its note, and the user corrects them to the real equipment. No network format is guessed.
import { nextId } from '../model/ids.ts';
import type { Port, Show } from '../model/schema.ts';

/** Analogue inputs and outputs of a library item: [inputs, outputs]. */
export const TYPICAL_PORTS: Record<string, [number, number]> = {
  'desk.digital': [32, 16],
  'desk.large-digital': [48, 24],
  'desk.compact-digital': [16, 8],
  'desk.rackmount': [16, 8],
  'desk.portable': [8, 2],
  'desk.powered': [8, 2],
  'desk.table-8': [8, 2],
  'rack.stagebox': [16, 8],
  'rack.stagebox-16': [16, 8],
  'rack.stagebox-48': [48, 24],
  'rack.stagebox-fibre': [32, 16],
};

const WORDS = {
  es: { in: 'Entradas', out: 'Salidas', note: 'Valor típico del tipo; ajústalo al equipo real' },
  en: { in: 'Inputs', out: 'Outputs', note: 'Typical value for the type; adjust it to the real equipment' },
} as const;

export const hasLibraryPorts = (itemId: string): boolean => itemId in TYPICAL_PORTS;

/** The ports the library gives an item, ready to add (without an id); empty when it has none. */
export function libraryPorts(itemId: string, lang: Show['lang']): Omit<Port, 'id'>[] {
  const typical = TYPICAL_PORTS[itemId];
  if (!typical) return [];
  const w = WORDS[lang];
  const [inputs, outputs] = typical;
  return [
    { name: w.in, dir: 'in', signal: 'audio', format: 'Analogue', channels: inputs, note: w.note },
    { name: w.out, dir: 'out', signal: 'audio', format: 'Analogue', channels: outputs, note: w.note },
  ];
}

/** Gives an element the ports of its library item; nothing changes when it already has ports or the item has none. */
export function fillPortsFromLibrary(show: Show, elementId: string): Show {
  const el = show.elements[elementId];
  if (!el || el.ports.length > 0) return show;
  let s = show;
  const ports: Port[] = [];
  for (const p of libraryPorts(el.type.id, show.lang)) {
    const [id, next] = nextId(s, 'pt');
    s = next;
    ports.push({ ...p, id });
  }
  if (ports.length === 0) return show;
  return { ...s, elements: { ...s.elements, [elementId]: { ...s.elements[elementId]!, ports } } };
}
