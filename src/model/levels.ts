// Raised areas of the stage (risers and platforms): each has a height above the stage deck, shown in the side section.
import { itemById } from '../library/items.ts';
import { elementBox } from '../plan/geometry.ts';
import type { PlanElement, Show } from './schema.ts';

export const LEVEL_ITEMS = ['furniture.riser', 'scenery.platform'];

export const isLevel = (e: PlanElement): boolean => LEVEL_ITEMS.includes(e.type.id);

/** Height of the top of a riser or platform above the stage deck, in millimetres: its own, else the library's. */
export const levelHeight = (e: PlanElement): number => e.height ?? itemById(e.type.id)?.size.h ?? 0;

export interface Level {
  element: PlanElement;
  /** Extent along the depth axis of the stage (back to front), in plan millimetres. */
  from: number;
  to: number;
  heightMm: number;
}

/** The raised areas, back to front; a taller one is drawn after (in front of) a lower one that shares its place. */
export function levels(show: Show): Level[] {
  return Object.values(show.elements)
    .filter(isLevel)
    .map((element) => {
      const b = elementBox(element);
      return { element, from: b.y0, to: b.y1, heightMm: levelHeight(element) };
    })
    .sort((a, b) => a.from - b.from || a.heightMm - b.heightMm);
}
