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

type Spec = { es: string; en: string; dir: Port['dir']; signal: Port['signal']; format: string; channels: number };
const spec = (es: string, en: string, dir: Port['dir'], signal: Port['signal'], format: string, channels = 1): Spec => ({ es, en, dir, signal, format, channels });

/** The usual connectors of other equipment: interfaces and preamps, network gear, video sources and screens. */
const OTHER_PORTS: Record<string, Spec[]> = {
  'rack.interface': [spec('Entradas', 'Inputs', 'in', 'audio', 'Analogue', 8), spec('Salidas', 'Outputs', 'out', 'audio', 'Analogue', 8), spec('USB', 'USB', 'io', 'usb', 'USB audio', 2)],
  'rack.preamp': [spec('Entradas', 'Inputs', 'in', 'audio', 'Analogue', 8), spec('Salidas', 'Outputs', 'out', 'audio', 'Analogue', 8)],
  'rack.network': [spec('Red', 'Network', 'io', 'network', 'Ethernet', 8)],
  'net.router': [spec('Red', 'Network', 'io', 'network', 'Ethernet', 4)],
  'net.poe': [spec('Red', 'Network', 'io', 'network', 'Ethernet PoE', 8)],
  'net.wifi-ap': [spec('Red', 'Network', 'io', 'network', 'Ethernet PoE')],
  'net.artnet': [spec('Red', 'Network', 'in', 'network', 'Ethernet'), spec('DMX', 'DMX', 'out', 'lightControl', 'DMX 5', 2)],
  'video.projector': [spec('Entrada de vídeo', 'Video input', 'in', 'video', 'HDMI')],
  'video.proj-ceiling': [spec('Entrada de vídeo', 'Video input', 'in', 'video', 'HDMI')],
  'video.proj-stand': [spec('Entrada de vídeo', 'Video input', 'in', 'video', 'HDMI')],
  'video.proj-large': [spec('Entrada de vídeo', 'Video input', 'in', 'video', 'SDI')],
  'video.proj-short': [spec('Entrada de vídeo', 'Video input', 'in', 'video', 'HDMI')],
  'video.tv': [spec('Entradas de vídeo', 'Video inputs', 'in', 'video', 'HDMI', 2)],
  'video.led-proc': [spec('Entrada de vídeo', 'Video input', 'in', 'video', 'HDMI'), spec('Salida a pantalla', 'Wall output', 'out', 'video', 'Ethernet')],
  'video.camera': [spec('Salida de vídeo', 'Video output', 'out', 'video', 'SDI')],
  'video.ptz': [spec('Salida de vídeo', 'Video output', 'out', 'video', 'SDI'), spec('Control', 'Control', 'in', 'network', 'Ethernet')],
  'video.capture': [spec('Entrada de vídeo', 'Video input', 'in', 'video', 'HDMI'), spec('USB', 'USB', 'out', 'usb', 'USB')],
};

const WORDS = {
  es: { in: 'Entradas', out: 'Salidas', note: 'Valor típico del tipo; ajústalo al equipo real' },
  en: { in: 'Inputs', out: 'Outputs', note: 'Typical value for the type; adjust it to the real equipment' },
} as const;

/** The ids that have ports from the library, for the tests. */
export const LIBRARY_PORT_IDS = (): string[] => [...Object.keys(TYPICAL_PORTS), ...Object.keys(OTHER_PORTS)];

export const hasLibraryPorts = (itemId: string): boolean => itemId in TYPICAL_PORTS || itemId in OTHER_PORTS;

/** The ports the library gives an item, ready to add (without an id); empty when it has none. */
export function libraryPorts(itemId: string, lang: Show['lang']): Omit<Port, 'id'>[] {
  const w = WORDS[lang];
  const other = OTHER_PORTS[itemId];
  if (other) return other.map((x) => ({ name: x[lang], dir: x.dir, signal: x.signal, format: x.format, channels: x.channels, note: w.note }));
  const typical = TYPICAL_PORTS[itemId];
  if (!typical) return [];
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
