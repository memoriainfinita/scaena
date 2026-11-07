// The user's own elements inside a show: add one from a cleaned drawing, remove one that is not placed.
import { CUSTOM_ITEM_PREFIX } from '../library/custom.ts';
import type { CleanSvg } from '../library/svg-clean.ts';
import { nextId } from './ids.ts';
import type { CustomItem, Show } from './schema.ts';

export const MAX_CUSTOM_ITEMS = 100;

export interface CustomDraft {
  name: string;
  svg: CleanSvg;
  /** Real size in millimetres. */
  w: number;
  d: number;
  h: number;
  weightKg: number | null;
  powerW: number | null;
  layer: CustomItem['layer'];
}

const finitePositive = (x: number, min: number, max: number): boolean => Number.isFinite(x) && x >= min && x <= max;

/** Adds the element to the show's library. Null when the name is empty, the size is out of range or there are too many. */
export function addCustomItem(show: Show, draft: CustomDraft): [Show, CustomItem | null] {
  const name = draft.name.trim().slice(0, 80);
  if (!name || Object.keys(show.customItems).length >= MAX_CUSTOM_ITEMS) return [show, null];
  if (!finitePositive(draft.w, 10, 100000) || !finitePositive(draft.d, 10, 100000) || !finitePositive(draft.h, 0, 100000)) return [show, null];
  const [id, s] = nextId(show, 'cu');
  const item: CustomItem = {
    id,
    name,
    layer: draft.layer,
    w: Math.round(draft.w),
    d: Math.round(draft.d),
    h: Math.round(draft.h),
    weightKg: draft.weightKg !== null && draft.weightKg >= 0 ? draft.weightKg : null,
    powerW: draft.powerW !== null && draft.powerW >= 0 ? draft.powerW : null,
    viewBox: draft.svg.viewBox,
    markup: draft.svg.markup,
  };
  return [{ ...s, customItems: { ...s.customItems, [id]: item } }, item];
}

export const customItemUses = (show: Show, id: string): number => Object.values(show.elements).filter((e) => e.type.id === `${CUSTOM_ITEM_PREFIX}${id}`).length;

/** Removes an element of the user's own from the library; refused (same show back) while it is placed on the plan. */
export function removeCustomItem(show: Show, id: string): Show {
  if (!show.customItems[id] || customItemUses(show, id) > 0) return show;
  const { [id]: _gone, ...rest } = show.customItems;
  return { ...show, customItems: rest };
}
