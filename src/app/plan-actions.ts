// Edits of the plan: each one acts on the current selection (or the ids it is given) and is one undo step.
import { signal } from '@preact/signals';
import { elementBox } from '../plan/geometry.ts';
import { addElement, alignElements, distributeElements, duplicateElements, expandGroups, flipElements, groupElements, moveElements, removeElements, rotateElements, ungroupElements, type AlignMode } from '../model/ops.ts';
import { addLayer, moveLayer, removeLayer, renameLayer, setElementsLayer } from '../model/layers.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { selection, session } from './state.ts';

export type ToolId = 'select' | 'pan' | 'connect' | 'text' | 'measure' | 'background';
export const tool = signal<ToolId>('select');

/** True when the element's layer is shown and not locked: those are the ones the user can touch. */
export function editable(show: Show, el: PlanElement): boolean {
  const layer = show.layers.find((l) => l.id === el.layerId);
  return !!layer && layer.visible && !layer.locked;
}

/** Ids that exist and can be edited, with their groups included. */
export function targets(show: Show, ids: string[] = selection.value): string[] {
  return expandGroups(show, ids.filter((id) => show.elements[id])).filter((id) => {
    const el = show.elements[id];
    return !!el && editable(show, el);
  });
}

function act(fn: (show: Show, ids: string[]) => Show, minimum = 1): boolean {
  const s = session.value;
  if (!s) return false;
  const ids = targets(s.show.value);
  if (ids.length < minimum) return false;
  s.commit((show) => fn(show, targets(show, ids)));
  return true;
}

export const moveSelection = (dx: number, dy: number): boolean => act((show, ids) => moveElements(show, ids, dx, dy));
export const rotateSelection = (deg: number): boolean => act((show, ids) => rotateElements(show, ids, deg));
export const flipSelection = (axis: 'x' | 'y'): boolean => act((show, ids) => flipElements(show, ids, axis));
export const alignSelection = (mode: AlignMode): boolean => act((show, ids) => alignElements(show, ids, mode, (e) => elementBox(e)), 2);
export const distributeSelection = (axis: 'x' | 'y'): boolean => act((show, ids) => distributeElements(show, ids, axis, (e) => elementBox(e)), 3);
export const groupSelection = (): boolean => act((show, ids) => groupElements(show, ids)[0], 2);
export const ungroupSelection = (): boolean => act((show, ids) => ungroupElements(show, ids));

export function deleteSelection(): boolean {
  const ok = act((show, ids) => removeElements(show, ids));
  if (ok) selection.value = [];
  return ok;
}

export function duplicateSelection(offset: number): boolean {
  const s = session.value;
  if (!s) return false;
  const ids = targets(s.show.value);
  if (ids.length === 0) return false;
  let created: string[] = [];
  s.commit((show) => {
    const [next, made] = duplicateElements(show, ids, offset, offset);
    created = made;
    return next;
  });
  selection.value = created;
  return true;
}

export function selectAll(): void {
  const s = session.value;
  if (!s) return;
  const show = s.show.value;
  selection.value = Object.values(show.elements)
    .filter((e) => editable(show, e))
    .map((e) => e.id);
}

/** Applies a finished drag: the selection moved by (dx, dy), as a single step. */
export const commitDrag = (ids: string[], dx: number, dy: number): void => {
  if (dx === 0 && dy === 0) return;
  session.value?.commit((show) => moveElements(show, targets(show, ids), dx, dy));
};

/** Places a text note at (x, y) on the notes layer and selects it. */
export function addTextAt(x: number, y: number, text: string): string | null {
  const s = session.value;
  if (!s) return null;
  let id: string | null = null;
  s.commit((show) => {
    const layer = show.layers.find((l) => l.subject === 'notes');
    if (!layer) return show;
    const [next, el] = addElement(show, { type: { id: 'note.text', version: 1 }, x, y, layerId: layer.id, label: text });
    id = el.id;
    return next;
  });
  if (id) selection.value = [id];
  return id;
}

/** Fixes a measured distance on the plan as a dimension: an element on the notes layer, selectable and movable like any other. */
export function addDimension(a: { x: number; y: number }, b: { x: number; y: number }): string | null {
  const s = session.value;
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (!s || length < 1) return null;
  let id: string | null = null;
  s.commit((show) => {
    const layer = show.layers.find((l) => l.subject === 'notes');
    if (!layer) return show;
    let deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    if (deg > 90) deg -= 180; // keep the text readable, never upside down
    if (deg <= -90) deg += 180;
    const rotation = Math.round(deg * 100) / 100;
    const [next, el] = addElement(show, { type: { id: 'note.dimension', version: 1 }, x: Math.round((a.x + b.x) / 2), y: Math.round((a.y + b.y) / 2), rotation, width: Math.round(length), layerId: layer.id });
    id = el.id;
    return next;
  });
  if (id) selection.value = [id];
  return id;
}

/** Adds a layer of the user's own; false when the name is empty or the limit is reached. */
export function createLayer(name: string): boolean {
  const s = session.value;
  if (!s) return false;
  const [, layer] = addLayer(s.show.value, name);
  if (!layer) return false;
  s.commit((show) => addLayer(show, name)[0]);
  return true;
}
export const renameCustomLayer = (id: string, name: string): void => session.value?.commit((show) => renameLayer(show, id, name));
export const removeCustomLayer = (id: string): void => session.value?.commit((show) => removeLayer(show, id));
export const moveCustomLayer = (id: string, dir: 1 | -1): void => session.value?.commit((show) => moveLayer(show, id, dir));
export const moveToLayer = (ids: string[], layerId: string): void => session.value?.commit((show) => setElementsLayer(show, ids, layerId));

export function setLayerDim(layerId: string, dim: number): void {
  session.value?.commit((show) => ({ ...show, layers: show.layers.map((l) => (l.id === layerId ? { ...l, dim } : l)) }));
}

export function setGrid(on: boolean): void {
  session.value?.commit((show) => ({ ...show, view: { ...show.view, grid: on } }));
}
