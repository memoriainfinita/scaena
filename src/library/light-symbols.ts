// Luminaires in RP-2 style: the top-view outlines drawn by hand in symbols.ts, which lighting designers expect on a
// light plot, instead of the side-view pictograms. Chosen per show with `view.rp2Lights` (decided 2026-11-08).
import { iconKeyOf } from './icons.ts';
import type { LibraryItem } from './types.ts';

/** Luminaires that only have a generic symbol, mapped to the closest hand-drawn RP-2 outline. Others keep their icon. */
const RP2_FALLBACK: Record<string, string> = {
  'light.par64': 'par',
  'light.pinspot': 'par',
  'light.led-par-mini': 'ledPar',
  'light.led-panel': 'ledPar',
  'light.led-fresnel': 'fresnel',
  'light.led-zoom': 'ledProfile',
  'light.cyc-led': 'cyc',
  'light.ground-row': 'strip',
  'light.footlight': 'strip',
  'light.led-mover': 'movingWash',
  'light.mover-hybrid': 'movingSpot',
};

/** The RP-2 outline of a luminaire, or undefined when the item is not a luminaire or has none. */
export function rp2SymbolOf(it: LibraryItem): string | undefined {
  if (it.category !== 'light') return undefined;
  return it.symbol !== 'generic' ? it.symbol : RP2_FALLBACK[it.id];
}

/** The icon an element draws: none when RP-2 lights are on and the item has an RP-2 outline. */
export const iconKeyFor = (it: LibraryItem, rp2Lights: boolean): string | undefined => (rp2Lights && rp2SymbolOf(it) ? undefined : iconKeyOf(it.id));

/** The hand-drawn symbol an element draws when it has no icon (or under its icon, as the footprint). */
export const drawnSymbolOf = (it: LibraryItem, rp2Lights: boolean): string => (rp2Lights ? (rp2SymbolOf(it) ?? it.symbol) : it.symbol);
