// The plan as a standalone SVG string, for the PDF. Sizes that must look right on paper (strokes, text, the legend, the
// scale bar) are given in millimetres of paper and converted to plan units with the print scale `k` (paper mm per plan mm).
import type { Lang } from '../i18n/index.ts';
import { CUSTOM_DRAWING, withCustomItems } from '../library/custom.ts';
import { itemById } from '../library/items.ts';
import { symbolBody } from '../library/symbols.ts';
import { footprintBody, iconData, iconDefs, iconUse } from '../library/icons.ts';
import { drawnSymbolOf, iconKeyFor } from '../library/light-symbols.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { stageFrame } from '../model/stage.ts';
import { barText, niceLengths, scaleText } from '../model/units.ts';
import { elementSize, formatLength, planBox, prosceniumWalls, unionBox, type Box } from '../plan/geometry.ts';
import { TAG_ABOVE, TAG_RADIUS, luminaireTag, paperText, textWidth } from '../plan/labels.ts';
import { buildScene, elementsDrawn, layersDrawn } from '../plan/scene.ts';
import { LINK_STYLE, linkDash } from '../plan/style.ts';
import { docStrings } from './strings.ts';

export interface PlanSvgOptions {
  /** Printable area for the plan, in paper millimetres. */
  availWidthMm: number;
  availHeightMm: number;
  /** Print scale as 1:N, or null to fit the area. */
  planScale: number | null;
  lang: Lang;
  /** The layers to draw; absent means the ones the show has visible. A report of the plan is a preset of layers and a scale. */
  layerIds?: ReadonlySet<string>;
  /** Luminaires carry a tag (unit in a circle, channel and colour under it) in place of their name: the light plot. */
  fixtureTags?: boolean;
}

export interface PlanSvg {
  svg: string;
  /** Size of the drawing on paper. */
  widthMm: number;
  heightMm: number;
  /** The scale actually used, as 1:N (rounded), and whether the requested one fit. */
  scaleN: number;
  fits: boolean;
  /** The legend, when it needs a page of its own. */
  legend?: { svg: string; widthMm: number; heightMm: number };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = (n: number) => Math.round(n * 100) / 100;

/** A white edge under a text, so a bar or a cable passing behind it does not strike it through; `k` is paper mm per plan mm. */
const halo = (k: number): string => ` stroke="#fff" stroke-width="${r(0.7 / k)}" stroke-linejoin="round" paint-order="stroke"`;

/** Rewrites a symbol's screen-pixel strokes into plan units and drops the effect that SVG renderers for print ignore. */
export function printStrokes(markup: string, f: number): string {
  const own = CUSTOM_DRAWING.exec(markup);
  if (own) f /= Number(own[1]);
  return markup
    .replace(/ vector-effect="non-scaling-stroke"/g, '')
    .replace(/stroke-width="([\d.]+)"/g, (_, n: string) => `stroke-width="${r(Number(n) * f)}"`)
    .replace(/stroke-dasharray="([\d. ]+)"/g, (_, d: string) => `stroke-dasharray="${d.split(' ').map((x) => r(Number(x) * f)).join(' ')}"`);
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function backgroundBox(show: Show, images: Record<string, Uint8Array>): { box: Box; dims: { w: number; h: number } } | null {
  const bg = show.stage.background;
  const bytes = bg && images[bg.file];
  if (!bg || !bytes || bytes.length < 24) return null;
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dims = { w: v.getUint32(16), h: v.getUint32(20) };
  return { box: { x0: bg.x, y0: bg.y, x1: bg.x + dims.w * bg.scale, y1: bg.y + dims.h * bg.scale }, dims };
}


/** Height of the scale bar under the plan, in paper millimetres. */
const BAR_MM = 7;
/** Share of the size the plan would have with no legend that the legend must leave it before it may stay large. */
const PLAN_SHARE = 0.95;
const ICON_GAP = 1.2;
const COLUMN_GAP = 2.5;
const SIDE_GAP = 4;

interface LegendFace {
  /** Paper millimetres: side of the symbol, size of its name, height of a row. */
  icon: number;
  font: number;
  row: number;
}

/** From the most comfortable to the smallest that still reads on paper. */
const LEGEND_FACES: LegendFace[] = [
  { icon: 7, font: 2.2, row: 8.5 },
  { icon: 5, font: 2, row: 6 },
  { icon: 3.8, font: 1.8, row: 4.4 },
];

interface LegendPlace {
  /** Size of the legend on paper, in millimetres. */
  widthMm: number;
  heightMm: number;
  /** Where a symbol goes, in paper millimetres from the corner of the legend. */
  cell: (i: number) => [number, number];
}

interface LegendFit extends LegendPlace {
  face: LegendFace;
  /** The print scale the plan gets. */
  k: number;
  beside: boolean;
  below: LegendPlace;
}

/** The two places a legend can take at one size, and the one that leaves the plan larger. */
function fitLegend(names: string[], face: LegendFace, availW: number, availH: number, worldW: number, worldH: number): LegendFit {
  const cellMm = (name: string) => face.icon + ICON_GAP + textWidth(name, face.font) + COLUMN_GAP;

  const cellW = Math.max(0, ...names.map(cellMm));
  const cols = Math.max(1, Math.min(names.length, Math.floor(availW / Math.max(cellW, 1))));
  const below: LegendPlace = {
    widthMm: cols * cellW,
    heightMm: Math.ceil(names.length / cols) * face.row,
    cell: (i) => [(i % cols) * cellW, Math.floor(i / cols) * face.row],
  };

  // Filled top to bottom, each column only as wide as its longest name.
  const rows = Math.max(1, Math.floor((availH - BAR_MM) / face.row));
  const lefts = [SIDE_GAP];
  for (let c = 0; c * rows < names.length; c++) lefts.push(lefts[c]! + Math.max(...names.slice(c * rows, (c + 1) * rows).map(cellMm)));
  const side: LegendPlace = {
    widthMm: lefts[lefts.length - 1]!,
    heightMm: Math.min(rows, names.length) * face.row,
    cell: (i) => [lefts[Math.floor(i / rows)]!, (i % rows) * face.row],
  };

  const kBelow = Math.min(availW / worldW, (availH - BAR_MM - below.heightMm) / worldH);
  const kSide = Math.min((availW - side.widthMm) / worldW, (availH - BAR_MM) / worldH);
  const beside = kSide > kBelow;
  return { ...(beside ? side : below), face, k: Math.max(kBelow, kSide), beside, below };
}

/** The plan as a printable SVG. The show's own elements are drawn from the show itself, open or not. */
export const planSvg = (show: Show, images: Record<string, Uint8Array>, opts: PlanSvgOptions): PlanSvg => withCustomItems(show.customItems, () => planSvgIn(show, images, opts));

function planSvgIn(show: Show, images: Record<string, Uint8Array>, opts: PlanSvgOptions): PlanSvg {
  const D = docStrings(opts.lang);
  const bgInfo = backgroundBox(show, images);
  const box = bgInfo ? unionBox([planBox(show, 700), bgInfo.box])! : planBox(show, 700);
  const worldW = box.x1 - box.x0;
  const worldH = box.y1 - box.y0;

  const layerOn = layersDrawn(show, opts.layerIds);
  const els = elementsDrawn(show, layerOn);

  // Legend: one cell per distinct item on the plan.
  const used = show.document.planLegend === false ? [] : [...new Set(els.map((e) => e.type.id))].filter((id) => itemById(id));
  const names = used.map((id) => itemById(id)!.name[opts.lang]);
  const wanted = opts.planScale ? 1 / opts.planScale : null;
  const fitFree = Math.min(opts.availWidthMm / worldW, (opts.availHeightMm - BAR_MM) / worldH);
  const fitted = LEGEND_FACES.map((face) => fitLegend(names, face, opts.availWidthMm, opts.availHeightMm, worldW, worldH));
  // The plan comes first: the legend takes the largest size that costs the plan almost nothing, or that still allows the scale asked for.
  const layout = used.length === 0 ? null : (fitted.find((l) => l.k >= (wanted ?? fitFree * PLAN_SHARE)) ?? fitted[fitted.length - 1]!);
  // Only a legend that even at its smallest would cost the plan a quarter of its size goes to a page of its own.
  const apart = layout !== null && layout.k < fitFree * 0.75;
  const fitK = layout && !apart ? layout.k : fitFree;
  const fits = wanted === null || wanted <= fitK + 1e-9;
  const k = wanted !== null && fits ? wanted : fitK;
  const inPlan = apart ? null : layout;
  const f = 0.17 / k; // paper-pixel unit: 1.5 becomes 0.26 mm

  const scene = buildScene(show, { layerIds: opts.layerIds, sizes: paperText(k), bounds: box, lang: opts.lang, fixtureTags: opts.fixtureTags });

  const out: string[] = [];
  // Written after every element: on a plan too full to give each text a free place, a text still shows over what it touches.
  const written: string[] = [];
  const stage = show.stage.shape;
  const stageAttrs = `fill="#f1f1ee" stroke="#000" stroke-width="${r(0.35 / k)}"`;
  out.push(stage.kind === 'rect' ? `<rect x="0" y="0" width="${stage.width}" height="${stage.depth}" ${stageAttrs}/>` : `<polygon points="${stage.points.map((p) => `${p.x},${p.y}`).join(' ')}" ${stageAttrs}/>`);

  if (bgInfo && show.stage.background && (() => {
    const layer = show.layers.find((l) => l.subject === 'background');
    return layer ? layerOn.has(layer.id) : true;
  })()) {
    const bg = show.stage.background;
    const bytes = images[bg.file]!;
    out.push(`<image href="data:image/png;base64,${toBase64(bytes)}" x="${bg.x}" y="${bg.y}" width="${r(bgInfo.dims.w * bg.scale)}" height="${r(bgInfo.dims.h * bg.scale)}" opacity="${bg.opacity}" preserveAspectRatio="none"/>`);
  }
  {
    const f = stageFrame(show);
    if (show.stage.referenceLines.plaster) out.push(`<line x1="${f.x0 - 300}" y1="${f.downstage}" x2="${f.x1 + 300}" y2="${f.downstage}" stroke="#000" stroke-width="${r(0.2 / k)}" stroke-dasharray="${r(2.5 / k)} ${r(1 / k)} ${r(0.4 / k)} ${r(1 / k)}"/>`);
    if (show.stage.referenceLines.proscenium) for (const [a, b] of prosceniumWalls(f.width, f.opening)) out.push(`<line x1="${f.x0 + a}" y1="${f.downstage}" x2="${f.x0 + b}" y2="${f.downstage}" stroke="#000" stroke-width="${r(0.8 / k)}"/>`);
    if (show.stage.referenceLines.center) out.push(`<line x1="${f.centre}" y1="${f.upstage}" x2="${f.centre}" y2="${f.downstage + 300}" stroke="#000" stroke-width="${r(0.2 / k)}" stroke-dasharray="${r(2.5 / k)} ${r(1 / k)} ${r(0.4 / k)} ${r(1 / k)}"/>`);
  }

  for (const { mount: m, text: name } of scene.mounts) {
    const floor = m.kind === 'floor';
    out.push(`<line x1="${m.from.x}" y1="${m.from.y}" x2="${m.to.x}" y2="${m.to.y}" stroke="#555" stroke-width="${r((floor ? 0.3 : 0.6) / k)}"${floor ? ` stroke-dasharray="${r(0.4 / k)} ${r(1.2 / k)}"` : ''}/>`);
    if (name) written.push(`<text x="${r(name.x)}" y="${r(name.y)}" text-anchor="middle" font-size="${r(2.2 / k)}" fill="#444" font-family="Inter"${halo(k)}>${esc(m.name)}</text>`);
  }

  for (const { link: c, route, text } of scene.links) {
    const st = LINK_STYLE[c.signal];
    const dashes = linkDash(c);
    const dash = dashes ? ` stroke-dasharray="${dashes.split(' ').map((x) => r(Number(x) * f)).join(' ')}"` : '';
    const first = route[0]!;
    const end = route[route.length - 1]!;
    out.push(route.length === 2 ? `<line x1="${first.x}" y1="${first.y}" x2="${end.x}" y2="${end.y}" stroke="${st.stroke}" stroke-width="${r(0.3 / k)}"${dash}/>` : `<polyline points="${route.map((p) => `${r(p.x)},${r(p.y)}`).join(' ')}" fill="none" stroke="${st.stroke}" stroke-width="${r(0.3 / k)}" stroke-linejoin="round"${dash}/>`);
    if (c.connector && text) written.push(`<text x="${r(text.x)}" y="${r(text.y)}" text-anchor="middle" font-size="${r(2 / k)}" fill="${st.stroke}" font-family="Inter"${halo(k)}>${esc(c.connector)}</text>`);
  }

  for (const { el: e, layer, label, tag } of scene.elements) {
    const dim = layer.dim ?? 0;
    out.push(elementSvg(e, f, k, dim, show.units, opts.lang, show.view.outlines, show.view.rp2Lights));
    if (tag && e.luminaire) written.push(tagSvg(e, tag, k, dim));
    if (label?.leader) written.push(`<line x1="${r(label.leader.x1)}" y1="${r(label.leader.y1)}" x2="${r(label.leader.x2)}" y2="${r(label.leader.y2)}" stroke="#555" stroke-width="${r(0.12 / k)}"${dim > 0 ? ` opacity="${r(1 - dim * 0.7)}"` : ''}/>`);
    if (label) written.push(`<text x="${r(label.x)}" y="${r(label.y)}" text-anchor="middle" font-size="${r(2.3 / k)}" fill="#000" font-family="Inter"${halo(k)}${dim > 0 ? ` opacity="${r(1 - dim * 0.7)}"` : ''}>${esc(e.label)}</text>`);
  }
  out.push(...written);

  // Scale bar and legend, below the plan.
  const y0 = box.y1 + 1.5 / k;
  const bar = niceLengths(show.units, 500).find((n) => n * k >= 15) ?? 50000;
  const bx = box.x0 + 2 / k;
  out.push(`<g stroke="#000" stroke-width="${r(0.3 / k)}"><line x1="${bx}" y1="${y0 + 3 / k}" x2="${bx + bar}" y2="${y0 + 3 / k}"/><line x1="${bx}" y1="${y0 + 2 / k}" x2="${bx}" y2="${y0 + 4 / k}"/><line x1="${bx + bar}" y1="${y0 + 2 / k}" x2="${bx + bar}" y2="${y0 + 4 / k}"/></g>`);
  const barLabel = barText(bar, show.units, opts.lang);
  out.push(`<text x="${bx + bar + 2 / k}" y="${y0 + 4 / k}" font-size="${r(2.4 / k)}" fill="#000" font-family="Inter">${esc(`${barLabel} · ${D.scaleLabel} ${scaleText(Math.round(1 / k), show.units)}`)}</text>`);

  /** One symbol with its name, at a place given in the units of the drawing it goes into; `u` is paper mm per unit. */
  const legendCell = (id: string, face: LegendFace, cx: number, cy: number, u: number, stroke: number): string => {
    const it = itemById(id)!;
    const side = face.icon / u;
    const sc = Math.min(side / it.size.w, side / it.size.d);
    const w = it.size.w * sc;
    const d = it.size.d * sc;
    const lk = iconKeyFor(it, show.view.rp2Lights);
    const licon = lk && iconData(lk) ? lk : undefined;
    return `<g transform="translate(${r(cx + (side - w) / 2)} ${r(cy + (side - d) / 2)}) scale(${r(sc * 1000) / 1000})">${printStrokes(licon ? footprintBody(it.size.w, it.size.d) : symbolBody(drawnSymbolOf(it, show.view.rp2Lights), it.size.w, it.size.d), stroke / sc)}${licon ? iconUse(licon, it.size.w, it.size.d) : ''}</g><text x="${r(cx + side + ICON_GAP / u)}" y="${r(cy + side / 2 + (face.font * 0.36) / u)}" font-size="${r(face.font / u)}" fill="#000" font-family="Inter">${esc(it.name[opts.lang])}</text>`;
  };

  if (inPlan) {
    used.forEach((id, i) => {
      const [x, y] = inPlan.cell(i);
      out.push(legendCell(id, inPlan.face, (inPlan.beside ? box.x1 : box.x0) + x / k, (inPlan.beside ? box.y0 : box.y1 + BAR_MM / k) + y / k, k, f));
    });
  }

  const height = worldH + (BAR_MM + (inPlan && !inPlan.beside ? inPlan.heightMm : 0)) / k;
  const width = inPlan ? (inPlan.beside ? worldW + inPlan.widthMm / k : Math.max(worldW, inPlan.widthMm / k)) : worldW;
  const tall = inPlan?.beside ? Math.max(height, (inPlan.heightMm + BAR_MM) / k) : height;
  const defs = iconDefs(els.map((e) => itemById(e.type.id)).concat(used.map((id) => itemById(id))).map((it) => (it ? iconKeyFor(it, show.view.rp2Lights) : undefined)).filter((x): x is string => !!x));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(box.x0)} ${r(box.y0)} ${r(width)} ${r(tall)}" width="${r(width)}" height="${r(tall)}">${defs}${out.join('')}</svg>`;
  if (!apart) return { svg, widthMm: width * k, heightMm: tall * k, scaleN: Math.round(1 / k), fits };
  const page = fitted[0]!.below;
  const legendW = page.widthMm;
  const legendH = page.heightMm;
  const cells = used.map((id, i) => {
    const [x, y] = page.cell(i);
    return legendCell(id, fitted[0]!.face, x, y, 1, 0.17);
  }).join('');
  const legend = { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${legendW} ${legendH}" width="${legendW}" height="${legendH}">${iconDefs(used.map((id) => iconKeyFor(itemById(id)!, show.view.rp2Lights)).filter((x): x is string => !!x))}${cells}</svg>`, widthMm: legendW, heightMm: legendH };
  return { svg, widthMm: width * k, heightMm: height * k, scaleN: Math.round(1 / k), fits, legend };
}

/** The tag of a luminaire as drawn on paper: the unit in a circle, the channel and colour under it. `at` is the baseline of the second line. */
function tagSvg(e: PlanElement, at: { x: number; y: number; leader?: { x1: number; y1: number; x2: number; y2: number } }, k: number, dim: number): string {
  const f = 2.3 / k;
  const tag = luminaireTag(e);
  const opacity = dim > 0 ? ` opacity="${r(1 - dim * 0.7)}"` : '';
  const rad = TAG_RADIUS * f;
  // The block starts at.y - 0.85 f - TAG_ABOVE f; the circle sits against its top.
  const cyc = at.y - 0.85 * f - TAG_ABOVE * f + rad;
  const leader = at.leader ? `<line x1="${r(at.leader.x1)}" y1="${r(at.leader.y1)}" x2="${r(at.leader.x2)}" y2="${r(at.leader.y2)}" stroke="#555" stroke-width="${r(0.12 / k)}"${opacity}/>` : '';
  const circle = `<circle cx="${r(at.x)}" cy="${r(cyc)}" r="${r(rad)}" fill="#fff" stroke="#000" stroke-width="${r(0.25 / k)}"${opacity}/><text x="${r(at.x)}" y="${r(cyc + 0.33 * f)}" text-anchor="middle" font-size="${r(f * (tag.unit.length > 2 ? 0.75 : 0.95))}" font-weight="700" fill="#000" font-family="Inter"${opacity}>${esc(tag.unit)}</text>`;
  const line = tag.line ? `<text x="${r(at.x)}" y="${r(at.y)}" text-anchor="middle" font-size="${r(f)}" fill="#000" font-family="Inter"${halo(k)}${opacity}>${esc(tag.line)}</text>` : '';
  return leader + circle + line;
}

function elementSvg(e: PlanElement, f: number, k: number, dim: number, units: Show['units'], lang: Lang, outlines: boolean, rp2: boolean): string {
  const it = itemById(e.type.id);
  if (!it) return '';
  const { w, d } = elementSize(e);
  const isText = it.symbol === 'textbox';
  const opacity = dim > 0 ? ` opacity="${r(1 - dim * 0.7)}"` : '';
  let s = `<g transform="translate(${e.x} ${e.y})"${opacity}>`;
  const key = iconKeyFor(it, rp2);
  const icon = key && iconData(key) ? key : undefined;
  s += `<g transform="rotate(${e.rotation}) scale(${e.flipX ? -1 : 1} ${e.flipY ? -1 : 1}) translate(${-w / 2} ${-d / 2})">${icon && !outlines ? '' : printStrokes(icon ? footprintBody(w, d) : symbolBody(drawnSymbolOf(it, rp2), w, d), f)}${icon ? iconUse(icon, w, d) : ''}</g>`;
  if (it.symbol === 'dimension') s += `<g transform="rotate(${e.rotation})"><text x="0" y="${r(-d / 2 - 0.8 / k)}" text-anchor="middle" font-size="${r(2.3 / k)}" fill="#000" font-family="Inter">${esc(e.label || formatLength(w, units, lang))}</text></g>`;
  else if (isText) s += `<text x="${-w / 2 + 60}" y="${r(d * 0.28)}" font-size="${r(d * 0.62)}" fill="#000" font-family="Inter">${esc(e.label)}</text>`;
  return s + '</g>';
}
