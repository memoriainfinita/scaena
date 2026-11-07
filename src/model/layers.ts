// The user's own layers: extra groups on the plan, over the fixed ones. Only these can be renamed, moved or removed.
import { itemById } from '../library/items.ts';
import { nextId } from './ids.ts';
import type { Layer, Show } from './schema.ts';

export const MAX_CUSTOM_LAYERS = 20;
export const MAX_LAYER_NAME = 80;

const isCustom = (l: Layer): boolean => l.subject === 'custom';
export const customLayers = (show: Show): Layer[] => show.layers.filter(isCustom);

/** Adds a layer on top of the others. Null when the name is empty or there are already too many. */
export function addLayer(show: Show, name: string): [Show, Layer | null] {
  const clean = name.trim().slice(0, MAX_LAYER_NAME);
  if (!clean || customLayers(show).length >= MAX_CUSTOM_LAYERS) return [show, null];
  const [id, s] = nextId(show, 'ly');
  const layer: Layer = { id, name: clean, subject: 'custom', visible: true, locked: false, dim: 0 };
  return [{ ...s, layers: [...s.layers, layer] }, layer];
}

export function renameLayer(show: Show, id: string, name: string): Show {
  const clean = name.trim().slice(0, MAX_LAYER_NAME);
  const l = show.layers.find((x) => x.id === id);
  if (!l || !isCustom(l) || !clean) return show;
  return { ...show, layers: show.layers.map((x) => (x.id === id ? { ...x, name: clean } : x)) };
}

/** The layer an element goes back to when its own layer is removed: the one of its library item's subject. */
function homeLayer(show: Show, elementTypeId: string): string {
  const subject = itemById(elementTypeId)?.layer;
  return (show.layers.find((l) => l.subject === subject && !isCustom(l)) ?? show.layers.find((l) => !isCustom(l)))?.id ?? show.layers[0]!.id;
}

/** Removes a custom layer; its elements move to the layer of their kind. */
export function removeLayer(show: Show, id: string): Show {
  const l = show.layers.find((x) => x.id === id);
  if (!l || !isCustom(l)) return show;
  const elements = Object.fromEntries(Object.entries(show.elements).map(([k, e]) => [k, e.layerId === id ? { ...e, layerId: homeLayer(show, e.type.id) } : e]));
  return { ...show, layers: show.layers.filter((x) => x.id !== id), elements };
}

/** Moves a custom layer one place up (drawn later, over the rest) or down. */
export function moveLayer(show: Show, id: string, dir: 1 | -1): Show {
  const i = show.layers.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || !isCustom(show.layers[i]!) || j < 0 || j >= show.layers.length) return show;
  const layers = [...show.layers];
  [layers[i], layers[j]] = [layers[j]!, layers[i]!];
  return { ...show, layers };
}

/** Puts a custom layer at a position of the list (the other layers keep their order). */
export function moveLayerTo(show: Show, id: string, to: number): Show {
  const i = show.layers.findIndex((x) => x.id === id);
  if (i < 0 || !isCustom(show.layers[i]!) || to < 0 || to >= show.layers.length || to === i) return show;
  const layers = [...show.layers];
  const [l] = layers.splice(i, 1);
  layers.splice(to, 0, l!);
  return { ...show, layers };
}

export function setElementsLayer(show: Show, ids: string[], layerId: string): Show {
  if (!show.layers.some((l) => l.id === layerId)) return show;
  const elements = { ...show.elements };
  for (const id of ids) if (elements[id]) elements[id] = { ...elements[id]!, layerId };
  return { ...show, elements };
}
