// What the plan draws and where, for the editor and the PDF alike: which elements, mounts and cables are shown, in which order,
// and where each text goes. Each renderer turns a scene into its own markup, with its own units and its own interactivity.
// Pure, with no DOM: the PDF worker and the tests use it too (docs/design/grupo-2-legibilidad-2026-11-11.md).
import type { Lang } from '../i18n/index.ts';
import type { Connection, Layer, Mount, PlanElement, Show } from '../model/schema.ts';
import { itemById } from '../library/items.ts';
import { elementBox, type Box } from './geometry.ts';
import { elementKey, linkKey, mountKey, plotTexts, tagKey, type PlacedText, type TextSizes } from './labels.ts';
import { routeLinks, type Pt } from './routes.ts';
import { mountsShown } from './style.ts';

export interface SceneOptions {
  /** The layers drawn; absent means the ones the show has visible. */
  layerIds?: ReadonlySet<string>;
  /** Sizes of the texts, in plan millimetres: fixed on screen, a size on paper divided by the print scale in the PDF. */
  sizes: TextSizes;
  /** The area that is drawn; on paper, whatever leaves it is cut. */
  bounds: Box;
  lang: Lang;
  /** Luminaires carry a tag (unit, channel, colour) in place of their name: the light plot. */
  fixtureTags?: boolean;
}

export interface SceneElement {
  el: PlanElement;
  layer: Layer;
  label?: PlacedText;
  tag?: PlacedText;
}
export interface SceneMount {
  mount: Mount;
  text?: PlacedText;
}
export interface SceneLink {
  link: Connection;
  from: PlanElement;
  to: PlanElement;
  /** The path from one end to the other: two points for a straight cable, more for one that goes around elements. */
  route: Pt[];
  text?: PlacedText;
}
export interface Scene {
  /** Layers drawn, by id. */
  layerOn: Set<string>;
  /** In painting order: by layer, bottom first. */
  elements: SceneElement[];
  mounts: SceneMount[];
  links: SceneLink[];
  texts: Map<string, PlacedText>;
}

/** The ids of the layers drawn: the preset when there is one, else the visible ones. */
export const layersDrawn = (show: Show, layerIds?: ReadonlySet<string>): Set<string> => new Set(show.layers.filter((l) => (layerIds ? layerIds.has(l.id) : l.visible)).map((l) => l.id));

/** The elements on the layers drawn, bottom layer first. */
export function elementsDrawn(show: Show, layerOn: ReadonlySet<string>): PlanElement[] {
  const index = new Map(show.layers.map((l, i) => [l.id, i]));
  return Object.values(show.elements)
    .filter((e) => layerOn.has(e.layerId))
    .sort((a, b) => (index.get(a.layerId) ?? 0) - (index.get(b.layerId) ?? 0));
}

export function buildScene(show: Show, opts: SceneOptions): Scene {
  const layerOn = layersDrawn(show, opts.layerIds);
  const layers = new Map(show.layers.map((l) => [l.id, l]));
  const withMounts = mountsShown(show, (id) => layerOn.has(id));
  const live = (id: string) => !!show.elements[id] && layerOn.has(show.elements[id]!.layerId);
  const wanted = (show.view.links ? Object.values(show.connections) : []).filter((c) => live(c.from) && live(c.to));
  const routes = show.view.linkStyle === 'routed' && wanted.length > 0 ? routeAll(show, wanted, layerOn, opts.bounds) : new Map<string, Pt[]>();
  const texts = plotTexts(show, { sizes: opts.sizes, bounds: opts.bounds, lang: opts.lang, mounts: withMounts, layerIds: layerOn, fixtureTags: opts.fixtureTags, routes });
  const elements = elementsDrawn(show, layerOn).map((el) => ({ el, layer: layers.get(el.layerId)!, label: texts.get(elementKey(el.id)), tag: el.luminaire ? texts.get(tagKey(el.id)) : undefined }));
  const mounts = withMounts ? Object.values(show.mounts).map((mount) => ({ mount, text: texts.get(mountKey(mount.id)) })) : [];
  const links = wanted.map((link) => {
    const from = show.elements[link.from]!;
    const to = show.elements[link.to]!;
    return { link, from, to, route: routes.get(link.id) ?? [{ x: from.x, y: from.y }, { x: to.x, y: to.y }], text: texts.get(linkKey(link.id)) };
  });
  return { layerOn, elements, mounts, links, texts };
}

/** The paths of the cables, around every element that is drawn (dimension lines are not in the way of a cable). */
function routeAll(show: Show, links: Connection[], layerOn: ReadonlySet<string>, bounds: Box): Map<string, Pt[]> {
  const obstacles = elementsDrawn(show, layerOn)
    .filter((e) => itemById(e.type.id)?.symbol !== 'dimension')
    .map((e) => ({ id: e.id, box: elementBox(e) }));
  // A wireless link is not a cable: it is not routed, and is drawn straight.
  const requests = links.filter((c) => !c.wireless).map((c) => ({ id: c.id, fromId: c.from, toId: c.to, from: { x: show.elements[c.from]!.x, y: show.elements[c.from]!.y }, to: { x: show.elements[c.to]!.x, y: show.elements[c.to]!.y } }));
  return routeLinks(requests, obstacles, { bounds });
}
