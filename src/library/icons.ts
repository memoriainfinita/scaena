// Icons: line pictograms traced from the GPT sheets (see docs/design/icons-integration-2026-11-07.md).
// Each sheet is a separate chunk loaded on demand and precached by the service worker. Every icon is a single
// even-odd path in its own pixel units; one copy per icon goes in a hidden sprite (screen) or in the file's own
// <defs> (PDF), and elements reference it with <use>.

import { signal } from '@preact/signals';
import { ICON_OF } from './icon-map.ts';
import { front, rect } from './symbol-kit.ts';

/** Width, height and path data of an icon. */
export type IconData = [number, number, string];

const chunks = import.meta.glob<Record<string, IconData>>('./icons/*.json', { import: 'default' });
const loaded = new Map<string, IconData>();
const sheets = new Map<string, Promise<void>>();

/** Bumps whenever a sheet finishes loading, so drawing code that reads it redraws. */
export const iconsVersion = signal(0);

export const iconKeyOf = (itemId: string): string | undefined => ICON_OF[itemId];
export const sheetOf = (key: string): string => key.slice(0, key.lastIndexOf('-'));
export const iconData = (key: string): IconData | undefined => loaded.get(key);
export const iconId = (key: string): string => `ic-${key}`;

const pathOf = (key: string, d: IconData) => `<path id="${iconId(key)}" fill="#000" fill-rule="evenodd" d="${d[2]}"/>`;

let sprite: SVGDefsElement | null = null;
function spriteNode(): SVGDefsElement | null {
  if (typeof document === 'undefined') return null;
  if (!sprite) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    sprite = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(sprite);
    document.body.appendChild(svg);
  }
  return sprite;
}

function loadSheet(sheet: string): Promise<void> {
  let p = sheets.get(sheet);
  if (!p) {
    const load = chunks[`./icons/${sheet}.json`];
    p = load
      ? load().then((data) => {
          const defs = spriteNode();
          const parts: string[] = [];
          for (const [key, d] of Object.entries(data)) {
            loaded.set(key, d);
            parts.push(pathOf(key, d));
          }
          if (defs) {
            const holder = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            holder.innerHTML = parts.join('');
            while (holder.firstChild) defs.appendChild(holder.firstChild);
          }
          iconsVersion.value++;
        })
      : Promise.resolve();
    sheets.set(sheet, p);
  }
  return p;
}

/** Loads the sheets that hold these icons. Resolves when they are ready to draw. */
export function loadIcons(keys: Iterable<string>): Promise<void> {
  return Promise.all([...new Set([...keys].map(sheetOf))].map(loadSheet)).then(() => undefined);
}

/** Loads every sheet, for the library panel. */
export const loadAllIcons = (): Promise<void> => Promise.all(Object.keys(chunks).map((f) => loadSheet(f.slice(8, -5)))).then(() => undefined);

/** Where an icon goes inside a footprint of w by d: centred, aspect kept, about 92% of the box. */
export function iconFit(key: string, w: number, d: number): { x: number; y: number; s: number; iw: number; ih: number } | undefined {
  const data = loaded.get(key);
  if (!data) return undefined;
  const [iw, ih] = data;
  const s = Math.min((w * 0.92) / iw, (d * 0.92) / ih);
  return { x: w / 2, y: d / 2, s, iw, ih };
}

/** A <use> that draws the icon centred at (cx, cy) inside a footprint of w by d. */
export function iconUse(key: string, w: number, d: number, cx = w / 2, cy = d / 2): string {
  const f = iconFit(key, w, d);
  if (!f) return '';
  const k = Math.round(f.s * 10000) / 10000;
  return `<use href="#${iconId(key)}" transform="translate(${Math.round(cx * 10) / 10} ${Math.round(cy * 10) / 10}) scale(${k}) translate(${-f.iw / 2} ${-f.ih / 2})"/>`;
}

/** The <defs> block for a standalone SVG (the PDF plan) that uses these icons. */
export function iconDefs(keys: Iterable<string>): string {
  const out: string[] = [];
  for (const key of new Set(keys)) {
    const d = loaded.get(key);
    if (d) out.push(pathOf(key, d));
  }
  return out.length ? `<defs>${out.join('')}</defs>` : '';
}

/** A complete standalone SVG of one icon for small thumbnails; draws from the sprite. */
export function iconThumb(key: string, title: string): string {
  const d = loaded.get(key);
  if (!d) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d[0]} ${d[1]}" role="img"><title>${title}</title><use href="#${iconId(key)}"/></svg>`;
}

/** The thin outline that stays under an icon and turns with the element: the real footprint and its front line. */
export const footprintBody = (w: number, d: number): string => rect(0, 0, w, d, '#fff') + front(w, d);
