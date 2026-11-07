import type { Show } from '../model/schema.ts';
import { iconKeyOf, loadIcons } from './icons.ts';

/** Loads the icons of every element of the show, so a drawing built next (PDF, SVG, PNG) has them. */
export function loadShowIcons(show: Show): Promise<void> {
  const keys = new Set<string>();
  for (const e of Object.values(show.elements)) {
    const k = iconKeyOf(e.type.id);
    if (k) keys.add(k);
  }
  return loadIcons(keys);
}
