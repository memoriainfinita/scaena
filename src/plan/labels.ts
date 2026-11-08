// Where the texts written on the plan go, so they do not cover each other: docs/design/plot-labels-2026-11-08.md.
// `placeTexts` is the algorithm; `plotTexts` turns a show into its input. Both are plain functions over plan millimetres, for the screen and the PDF.
import type { Lang } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import type { Show } from '../model/schema.ts';
import { boxContains, elementBox, elementSize, formatLength, type Box } from './geometry.ts';

/** A text position: `x` is its centre (it is drawn with text-anchor="middle") and `y` its baseline. */
export interface Slot {
  x: number;
  y: number;
  /** How far out this slot is from its natural place; a text prefers a near slot that touches an element to one two rings away. */
  ring?: number;
}
export interface PlacedText extends Slot {
  box: Box;
}
/** Something a text must not sit on. */
export interface Solid {
  id: string;
  box: Box;
}
export interface TextRequest {
  id: string;
  /** Lower groups are placed first; inside a group the id decides, so the order of the input does not matter. */
  group: number;
  width: number;
  fontSize: number;
  /** In order of preference. */
  slots: Slot[];
  /** The solid this text belongs to: it can touch it. */
  owner?: string;
  /** The box of the owner: a solid that contains it whole is what it stands on, so it does not count (a drum kit on its riser). */
  ownerBox?: Box;
}

const ASCENT = 0.85;
const DESCENT = 0.25;

const textBox = (s: Slot, width: number, fontSize: number): Box => ({ x0: s.x - width / 2, y0: s.y - fontSize * ASCENT, x1: s.x + width / 2, y1: s.y + fontSize * DESCENT });

const NARROW = new Set(" .,:;'|!ijlI");
const SLIM = new Set('frt()-/[]');
const BROAD = new Set('mwMW@%');

/** Width of a line of Inter, estimated from classes of characters. Neither the tests nor the PDF worker have a DOM to measure with. */
export function textWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const c of text) {
    if (NARROW.has(c)) em += 0.3;
    else if (SLIM.has(c)) em += 0.4;
    else if (BROAD.has(c)) em += 0.86;
    else if (c >= '⺀') em += 1;
    else if ((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) em += 0.67;
    else em += 0.57;
  }
  return em * fontSize;
}

function overlap(a: Box, b: Box): number {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return w > 0 && h > 0 ? w * h : 0;
}

interface Entry {
  box: Box;
  /** Null for a text already placed. */
  solid: string | null;
  seen: number;
}

/** A box covering more cells than this goes in a short list that every query reads, instead of filling the map. */
const MAX_CELLS = 256;

/** Boxes in square cells, so a query only reads what is near it. */
class Buckets {
  private cells = new Map<number, Entry[]>();
  private large: Entry[] = [];
  private query = 0;

  constructor(private size: number) {}

  private key = (ix: number, iy: number) => (ix + 0x8000) * 0x10000 + (iy + 0x8000);
  private cell = (v: number) => Math.floor(v / this.size);

  add(box: Box, solid: string | null): void {
    const entry: Entry = { box, solid, seen: 0 };
    const [ix0, ix1, iy0, iy1] = [this.cell(box.x0), this.cell(box.x1), this.cell(box.y0), this.cell(box.y1)];
    if ((ix1 - ix0 + 1) * (iy1 - iy0 + 1) > MAX_CELLS) {
      this.large.push(entry);
      return;
    }
    for (let ix = ix0; ix <= ix1; ix++) {
      for (let iy = iy0; iy <= iy1; iy++) {
        const k = this.key(ix, iy);
        const list = this.cells.get(k);
        if (list) list.push(entry);
        else this.cells.set(k, [entry]);
      }
    }
  }

  forEachNear(box: Box, visit: (e: Entry) => void): void {
    const q = ++this.query;
    const once = (e: Entry) => {
      if (e.seen !== q) {
        e.seen = q;
        visit(e);
      }
    };
    this.large.forEach(once);
    const [ix0, ix1, iy0, iy1] = [this.cell(box.x0), this.cell(box.x1), this.cell(box.y0), this.cell(box.y1)];
    for (let ix = ix0; ix <= ix1; ix++) for (let iy = iy0; iy <= iy1; iy++) this.cells.get(this.key(ix, iy))?.forEach(once);
  }
}

/** Against 1 for covering an element: covering another text is worst, and being cut off by the edge of the plan comes next. */
const TEXT_WEIGHT = 1000;
const EDGE_WEIGHT = TEXT_WEIGHT;
/** Air kept between two texts, as a fraction of the font size: sideways more than a word space, so that two labels do not read as one phrase. */
export const AIR_X = 0.6;
export const AIR_Y = 0.15;
/** Each ring beyond the first costs this fraction of the text's own area. */
const RING_WEIGHT = 0.005;

/** Gives every text the first free slot, or the one that covers least when none is free. A text is never dropped. */
export function placeTexts(solids: Solid[], texts: TextRequest[], bounds?: Box): Map<string, PlacedText> {
  const placed = new Map<string, PlacedText>();
  if (texts.length === 0) return placed;
  const buckets = new Buckets(Math.max(1, 6 * Math.max(...texts.map((t) => t.fontSize))));
  for (const s of [...solids].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) buckets.add(s.box, s.id);

  const ordered = [...texts].sort((a, b) => a.group - b.group || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const t of ordered) {
    let best: Slot | null = null;
    let bestCost = Infinity;
    for (const slot of t.slots) {
      const box = textBox(slot, t.width, t.fontSize);
      const reach = { x0: box.x0 - t.fontSize * AIR_X, y0: box.y0 - t.fontSize * AIR_Y, x1: box.x1 + t.fontSize * AIR_X, y1: box.y1 + t.fontSize * AIR_Y };
      const area = (box.x1 - box.x0) * (box.y1 - box.y0);
      let cost = (bounds ? (area - overlap(box, bounds)) * EDGE_WEIGHT : 0) + Math.max(0, (slot.ring ?? 0) - 1) * RING_WEIGHT * area;
      buckets.forEachNear(reach, (e) => {
        if (e.solid === null) cost += overlap(box, e.box) * TEXT_WEIGHT + overlap(reach, e.box) * 0.1;
        else if (e.solid !== t.owner && !(t.ownerBox && boxContains(e.box, t.ownerBox))) cost += overlap(box, e.box);
      });
      if (cost < bestCost) {
        best = slot;
        bestCost = cost;
        if (cost <= 0) break;
      }
    }
    if (!best) continue;
    const box = textBox(best, t.width, t.fontSize);
    placed.set(t.id, { x: best.x, y: best.y, box });
    buckets.add(box, null);
  }
  return placed;
}

/** Below, above, right, left of the box; the same a little to each side; the same again further out. */
export function elementSlots(b: Box, width: number, fontSize: number, gap: number): Slot[] {
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  const step = fontSize * 1.1;
  const out: Slot[] = [];
  for (let ring = 0; ring < 6; ring++) {
    const g = gap + ring * step;
    const below = b.y1 + g + fontSize * ASCENT;
    const above = b.y0 - g - fontSize * DESCENT;
    const right = b.x1 + g + width / 2;
    const left = b.x0 - g - width / 2;
    const middle = cy + fontSize * DESCENT;
    out.push({ x: cx, y: below, ring }, { x: cx, y: above, ring }, { x: right, y: middle, ring }, { x: left, y: middle, ring });
    for (const shift of [-0.5, 0.5, -1, 1]) out.push({ x: cx + shift * width, y: below, ring }, { x: cx + shift * width, y: above, ring });
    for (const side of [-1, 1]) out.push({ x: right, y: middle + side * step, ring }, { x: left, y: middle + side * step, ring });
  }
  return out;
}

/** Beside the bar at its middle first; then at its ends, or along it. */
export function mountSlots(from: Slot, to: Slot, width: number, fontSize: number): Slot[] {
  const gap = fontSize * 0.35;
  const x0 = Math.min(from.x, to.x);
  const x1 = Math.max(from.x, to.x);
  const [top, bottom] = from.y <= to.y ? [from, to] : [to, from];
  const shift = fontSize * 0.3;
  const left = x0 - gap - width / 2;
  const right = x1 + gap + width / 2;
  const my = (from.y + to.y) / 2;
  const above = top.y - gap - fontSize * DESCENT;
  const below = bottom.y + gap + fontSize * ASCENT;
  const out: Slot[] = [{ x: left, y: my + shift }, { x: right, y: my + shift }, { x: top.x, y: above }, { x: bottom.x, y: below }];
  if (x1 - x0 >= bottom.y - top.y) {
    for (const y of [above, below]) out.push({ x: x0 + width / 2, y }, { x: x1 - width / 2, y });
  } else {
    for (const q of [0.25, 0.75]) out.push({ x: left, y: top.y + (bottom.y - top.y) * q + shift }, { x: right, y: top.y + (bottom.y - top.y) * q + shift });
  }
  return out;
}

/** Above, below and to each side of the line, from its middle towards its ends; the same again further from the line. */
export function linkSlots(a: Slot, b: Slot, width: number, fontSize: number, lift: number): Slot[] {
  const out: Slot[] = [];
  for (let ring = 0; ring < 6; ring++) {
    const g = lift + ring * fontSize * 1.1;
    for (const t of [0.5, 0.35, 0.65, 0.25, 0.75, 0.15, 0.85]) {
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const middle = y + fontSize * DESCENT;
      out.push({ x, y: y - g }, { x, y: y + g + fontSize * ASCENT }, { x: x + g + width / 2, y: middle }, { x: x - g - width / 2, y: middle });
    }
  }
  return out;
}

/** The sizes one renderer writes its texts at, in plan millimetres. */
export interface TextSizes {
  element: number;
  elementGap: number;
  mount: number;
  link: number;
  linkLift: number;
  dimension: number;
  dimensionLift: number;
}

/** The editor writes at a fixed size in plan millimetres. */
export const SCREEN_TEXT: TextSizes = { element: 170, elementGap: 45.5, mount: 170, link: 150, linkLift: 60, dimension: 170, dimensionLift: 60 };

/** The PDF writes at a size in paper millimetres; `k` is paper mm per plan mm. */
export const paperText = (k: number): TextSizes => ({ element: 2.3 / k, elementGap: 0.645 / k, mount: 2.2 / k, link: 2 / k, linkLift: 0.8 / k, dimension: 2.3 / k, dimensionLift: 0.8 / k });

export const elementKey = (id: string) => `el:${id}`;
export const mountKey = (id: string) => `mount:${id}`;
export const linkKey = (id: string) => `link:${id}`;

const GROUP = { mount: 0, element: 1, link: 2 };

export interface PlotTextOptions {
  sizes: TextSizes;
  /** The area that is drawn; on paper, whatever leaves it is cut. */
  bounds: Box;
  lang: Lang;
  /** Whether this renderer writes the names of the mounts. */
  mounts: boolean;
}

/** The solids and texts of a show, as one renderer draws them. Exported for the tests. */
export function plotInput(show: Show, { sizes, lang, mounts }: PlotTextOptions): { solids: Solid[]; texts: TextRequest[] } {
  const visibleLayers = new Set(show.layers.filter((l) => l.visible).map((l) => l.id));
  const shown = Object.values(show.elements).filter((e) => visibleLayers.has(e.layerId));
  const solids: Solid[] = [];
  const texts: TextRequest[] = [];
  for (const e of shown) {
    const it = itemById(e.type.id);
    if (!it) continue;
    const box = elementBox(e);
    solids.push({ id: e.id, box });
    if (it.symbol === 'dimension') {
      const { w, d } = elementSize(e);
      const a = (e.rotation * Math.PI) / 180;
      const up = d / 2 + sizes.dimensionLift + sizes.dimension * (ASCENT - DESCENT) / 2;
      const halfW = textWidth(e.label || formatLength(w, show.units, lang), sizes.dimension) / 2;
      const halfH = sizes.dimension / 2;
      const hw = halfW * Math.abs(Math.cos(a)) + halfH * Math.abs(Math.sin(a));
      const hh = halfW * Math.abs(Math.sin(a)) + halfH * Math.abs(Math.cos(a));
      const cx = e.x + up * Math.sin(a);
      const cy = e.y - up * Math.cos(a);
      solids.push({ id: `${e.id}#text`, box: { x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh } });
    } else if (it.symbol !== 'textbox' && e.label && show.view.labels) {
      const width = textWidth(e.label, sizes.element);
      texts.push({ id: elementKey(e.id), group: GROUP.element, width, fontSize: sizes.element, owner: e.id, ownerBox: box, slots: elementSlots(box, width, sizes.element, sizes.elementGap) });
    }
  }
  if (mounts) {
    for (const m of Object.values(show.mounts)) {
      const width = textWidth(m.name, sizes.mount);
      texts.push({ id: mountKey(m.id), group: GROUP.mount, width, fontSize: sizes.mount, slots: mountSlots(m.from, m.to, width, sizes.mount) });
    }
  }
  if (show.view.links) {
    const live = new Set(shown.map((e) => e.id));
    for (const c of Object.values(show.connections)) {
      if (!c.connector || !live.has(c.from) || !live.has(c.to)) continue;
      const a = show.elements[c.from]!;
      const b = show.elements[c.to]!;
      const width = textWidth(c.connector, sizes.link);
      texts.push({ id: linkKey(c.id), group: GROUP.link, width, fontSize: sizes.link, slots: linkSlots(a, b, width, sizes.link, sizes.linkLift) });
    }
  }
  return { solids, texts };
}

/** Where every text of the plan goes, for one renderer. */
export function plotTexts(show: Show, options: PlotTextOptions): Map<string, PlacedText> {
  const { solids, texts } = plotInput(show, options);
  return placeTexts(solids, texts, options.bounds);
}
