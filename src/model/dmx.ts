// DMX of the luminaires: how many channels each takes and consecutive addressing (docs/design/dmx-2026-11-08.md).
import { fixtureById } from '../library/models.ts';
import { rigOrder, updateLuminaire } from './lights.ts';
import type { Luminaire, Show, UniverseInfo } from './schema.ts';

export const UNIVERSE_SIZE = 512;

export const PROTOCOLS: UniverseInfo['protocol'][] = ['dmx', 'sacn', 'artnet'];
export const PROTOCOL_NAME: Record<UniverseInfo['protocol'], string> = { dmx: 'DMX', sacn: 'sACN', artnet: 'Art-Net' };

/** The universes some luminaire is on, in order. */
export function universesInUse(show: Show): number[] {
  const used = new Set<number>();
  for (const e of Object.values(show.elements)) if (e.luminaire && e.luminaire.universe !== null) used.add(e.luminaire.universe);
  return [...used].sort((a, b) => a - b);
}

export const universeInfo = (show: Show, universe: number): UniverseInfo => show.universes[String(universe)] ?? { protocol: 'dmx', net: '', output: '' };

export const universeSaysSomething = (u: UniverseInfo): boolean => u.protocol !== 'dmx' || u.net !== '' || u.output !== '';

/** Changes what is said about a universe; one left as plain DMX with nothing said takes no room in the file. */
export function setUniverseInfo(show: Show, universe: number, patch: Partial<UniverseInfo>): Show {
  const next = { ...universeInfo(show, universe), ...patch };
  const universes = { ...show.universes };
  if (universeSaysSomething(next)) universes[String(universe)] = next;
  else delete universes[String(universe)];
  return { ...show, universes };
}

/** The modes of a luminaire's model, as [name, channels]; empty when the model has none. */
export const modesOfLuminaire = (l: Luminaire): [string, number][] => (l.modelId ? (fixtureById(l.modelId)?.modes ?? []) : []);

/** Channels a luminaire takes: typed, or from its mode; null when unknown. */
export function slotsOf(l: Luminaire): number | null {
  if (l.dmxSlots !== null) return l.dmxSlots;
  return modesOfLuminaire(l).find(([name]) => name === l.dmxMode)?.[1] ?? null;
}

/** The mode as written in the lists: "11ch (11)", or just the channels when there is no mode name. */
export function modeLabel(l: Luminaire): string {
  const slots = slotsOf(l);
  if (slots === null) return '';
  return l.dmxSlots === null && l.dmxMode ? `${l.dmxMode} (${slots})` : String(slots);
}

/** Consecutive addresses in rigging order, for the luminaires whose channel count is known. */
export function autoAddress(show: Show): Show {
  let universe = 1;
  let address = 1;
  let s = show;
  for (const e of rigOrder(show)) {
    const slots = slotsOf(e.luminaire!);
    if (slots === null) continue;
    if (address + slots - 1 > UNIVERSE_SIZE) {
      universe++;
      address = 1;
    }
    s = updateLuminaire(s, e.id, { universe, address });
    address += slots;
  }
  return s;
}
