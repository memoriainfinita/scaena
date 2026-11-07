// The user's own elements: a name, a real size and a drawing (a cleaned SVG), kept inside the show so the file carries them.
// The library lookups (`itemById`, `symbolBody`) read them from whichever show is open, or from the one a document is built from.
import type { CustomItem } from '../model/schema.ts';
import type { LibraryItem } from './types.ts';

export const CUSTOM_ITEM_PREFIX = 'custom.';
export const CUSTOM_SYMBOL_PREFIX = 'custom:';

type Source = () => Record<string, CustomItem>;
let source: Source = () => ({});

/** Where the lookups find the open show's own elements. Set once by the app state. */
export const setCustomSource = (s: Source): void => {
  source = s;
};

/** Runs `fn` with the lookups reading another show's own elements (documents and reports of a show that is not the open one). */
export function withCustomItems<T>(items: Record<string, CustomItem>, fn: () => T): T {
  const prev = source;
  source = () => items;
  try {
    return fn();
  } finally {
    source = prev;
  }
}

const cache = new WeakMap<CustomItem, LibraryItem>();

function toLibraryItem(c: CustomItem): LibraryItem {
  let it = cache.get(c);
  if (!it) {
    it = {
      id: `${CUSTOM_ITEM_PREFIX}${c.id}`,
      version: 1,
      category: 'scenery',
      layer: c.layer,
      name: { es: c.name, en: c.name },
      tags: [],
      size: { w: c.w, d: c.d, h: c.h },
      weightKg: c.weightKg,
      powerW: c.powerW,
      symbol: `${CUSTOM_SYMBOL_PREFIX}${c.id}`,
    };
    cache.set(c, it);
  }
  return it;
}

export function customItemById(typeId: string): LibraryItem | undefined {
  if (!typeId.startsWith(CUSTOM_ITEM_PREFIX)) return undefined;
  const c = source()[typeId.slice(CUSTOM_ITEM_PREFIX.length)];
  return c ? toLibraryItem(c) : undefined;
}

export const customItems = (): LibraryItem[] => Object.values(source()).map(toLibraryItem);

/** The drawing scaled to the element's size; a plain crossed box when the element was removed from the show. */
export function customSymbolBody(key: string, w: number, d: number): string | undefined {
  if (!key.startsWith(CUSTOM_SYMBOL_PREFIX)) return undefined;
  const c = source()[key.slice(CUSTOM_SYMBOL_PREFIX.length)];
  if (!c) return undefined;
  const [x, y, vw, vh] = c.viewBox;
  return `<g transform="scale(${Math.round((w / vw) * 100000) / 100000} ${Math.round((d / vh) * 100000) / 100000}) translate(${-x} ${-y})">${c.markup}</g>`;
}
