// The plan as a standalone SVG string, for the PDF. Sizes that must look right on paper (strokes, text, the legend, the
// scale bar) are given in millimetres of paper and converted to plan units with the print scale `k` (paper mm per plan mm).
import type { Lang } from '../i18n/index.ts';
import { withCustomItems } from '../library/custom.ts';
import { itemById } from '../library/items.ts';
import { symbolBody } from '../library/symbols.ts';
import { footprintBody, iconData, iconDefs, iconUse } from '../library/icons.ts';
import { drawnSymbolOf, iconKeyFor } from '../library/light-symbols.ts';
import type { Connection, PlanElement, Show } from '../model/schema.ts';
import { stageFrame } from '../model/stage.ts';
import { elementSize, formatLength, planBox, prosceniumWalls, unionBox, type Box } from '../plan/geometry.ts';
import { elementKey, linkKey, mountKey, paperText, plotTexts } from '../plan/labels.ts';
import { docStrings } from './strings.ts';

export interface PlanSvgOptions {
  /** Printable area for the plan, in paper millimetres. */
  availWidthMm: number;
  availHeightMm: number;
  /** Print scale as 1:N, or null to fit the area. */
  planScale: number | null;
  lang: Lang;
}

export interface PlanSvg {
  svg: string;
  /** Size of the drawing on paper. */
  widthMm: number;
  heightMm: number;
  /** The scale actually used, as 1:N (rounded), and whether the requested one fit. */
  scaleN: number;
  fits: boolean;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = (n: number) => Math.round(n * 100) / 100;

/** Rewrites a symbol's screen-pixel strokes into plan units and drops the effect that SVG renderers for print ignore. */
export function printStrokes(markup: string, f: number): string {
  return markup
    .replace(/ vector-effect="non-scaling-stroke"/g, '')
    .replace(/stroke-width="([\d.]+)"/g, (_, n: string) => `stroke-width="${r(Number(n) * f)}"`)
    .replace(/stroke-dasharray="([\d. ]+)"/g, (_, d: string) => `stroke-dasharray="${d.split(' ').map((x) => r(Number(x) * f)).join(' ')}"`);
}

const LINK_STYLE: Record<Connection['signal'], { stroke: string; dash: string }> = {
  audio: { stroke: '#0b6e78', dash: '' },
  video: { stroke: '#7a3db8', dash: '10 5' },
  lightControl: { stroke: '#b36b00', dash: '10 4 2 4' },
  network: { stroke: '#3a6e1a', dash: '2 5' },
};

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

const NICE = [500, 1000, 2000, 5000, 10000, 20000, 50000];

/** The plan as a printable SVG. The show's own elements are drawn from the show itself, open or not. */
export const planSvg = (show: Show, images: Record<string, Uint8Array>, opts: PlanSvgOptions): PlanSvg => withCustomItems(show.customItems, () => planSvgIn(show, images, opts));

function planSvgIn(show: Show, images: Record<string, Uint8Array>, opts: PlanSvgOptions): PlanSvg {
  const D = docStrings(opts.lang);
  const bgInfo = backgroundBox(show, images);
  const box = bgInfo ? unionBox([planBox(show, 700), bgInfo.box])! : planBox(show, 700);
  const worldW = box.x1 - box.x0;
  const worldH = box.y1 - box.y0;

  const layers = new Map(show.layers.map((l, i) => [l.id, { l, i }]));
  const els = Object.values(show.elements)
    .filter((e) => layers.get(e.layerId)?.l.visible)
    .sort((a, b) => (layers.get(a.layerId)?.i ?? 0) - (layers.get(b.layerId)?.i ?? 0));

  // Legend: one cell per distinct item on the plan.
  const used = show.document.planLegend === false ? [] : [...new Set(els.map((e) => e.type.id))].filter((id) => itemById(id));
  const cellW = 46;
  const cellH = 10;
  // The legend is as wide as the plan, but never narrower than three cells.
  const k0 = Math.min(opts.availWidthMm / worldW, opts.availHeightMm / worldH);
  const cols = Math.max(1, Math.min(Math.floor(opts.availWidthMm / cellW), Math.floor(Math.max(worldW * k0, 3 * cellW) / cellW)));
  const legendMm = used.length > 0 ? Math.ceil(used.length / cols) * cellH + 8 : 0;
  const barMm = 10;
  const extraMm = legendMm + barMm;

  // A plan that is limited by the height of the page gains more from the legend beside it, filled top to bottom.
  const sideRows = Math.max(1, Math.floor((opts.availHeightMm - barMm) / cellH));
  const sideMm = used.length > 0 ? Math.ceil(used.length / sideRows) * cellW + 6 : 0;
  const fitBelow = Math.min(opts.availWidthMm / worldW, (opts.availHeightMm - extraMm) / worldH);
  const fitBeside = Math.min((opts.availWidthMm - sideMm) / worldW, (opts.availHeightMm - barMm) / worldH);
  const beside = used.length > 0 && fitBeside > fitBelow * 1.1;
  const fitK = beside ? fitBeside : fitBelow;
  const wanted = opts.planScale ? 1 / opts.planScale : null;
  const fits = wanted === null || wanted <= fitK + 1e-9;
  const k = wanted !== null && fits ? wanted : fitK;
  const extra = extraMm / k;
  const f = 0.17 / k; // paper-pixel unit: 1.5 becomes 0.26 mm

  const texts = plotTexts(show, { sizes: paperText(k), bounds: box, lang: opts.lang, mounts: true });

  const out: string[] = [];
  // Written after every element: on a plan too full to give each text a free place, a text still shows over what it touches.
  const written: string[] = [];
  const stage = show.stage.shape;
  const stageAttrs = `fill="#f1f1ee" stroke="#000" stroke-width="${r(0.35 / k)}"`;
  out.push(stage.kind === 'rect' ? `<rect x="0" y="0" width="${stage.width}" height="${stage.depth}" ${stageAttrs}/>` : `<polygon points="${stage.points.map((p) => `${p.x},${p.y}`).join(' ')}" ${stageAttrs}/>`);

  if (bgInfo && show.stage.background && layers.get([...layers.keys()].find((id) => layers.get(id)!.l.subject === 'background') ?? '')?.l.visible !== false) {
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

  for (const m of Object.values(show.mounts)) {
    const floor = m.kind === 'floor';
    out.push(`<line x1="${m.from.x}" y1="${m.from.y}" x2="${m.to.x}" y2="${m.to.y}" stroke="#555" stroke-width="${r((floor ? 0.3 : 0.6) / k)}"${floor ? ` stroke-dasharray="${r(0.4 / k)} ${r(1.2 / k)}"` : ''}/>`);
    const name = texts.get(mountKey(m.id));
    if (name) written.push(`<text x="${r(name.x)}" y="${r(name.y)}" text-anchor="middle" font-size="${r(2.2 / k)}" fill="#444" font-family="Inter">${esc(m.name)}</text>`);
  }

  const visible = (id: string) => !!show.elements[id] && !!layers.get(show.elements[id]!.layerId)?.l.visible;
  for (const c of show.view.links ? Object.values(show.connections) : []) {
    if (!visible(c.from) || !visible(c.to)) continue;
    const a = show.elements[c.from]!;
    const b = show.elements[c.to]!;
    const st = LINK_STYLE[c.signal];
    const dash = st.dash ? ` stroke-dasharray="${st.dash.split(' ').map((x) => r(Number(x) * f)).join(' ')}"` : '';
    out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${st.stroke}" stroke-width="${r(0.3 / k)}"${dash}/>`);
    const text = texts.get(linkKey(c.id));
    if (c.connector && text) written.push(`<text x="${r(text.x)}" y="${r(text.y)}" text-anchor="middle" font-size="${r(2 / k)}" fill="${st.stroke}" font-family="Inter">${esc(c.connector)}</text>`);
  }

  for (const e of els) {
    const dim = layers.get(e.layerId)?.l.dim ?? 0;
    out.push(elementSvg(e, f, k, dim, show.units, opts.lang, show.view.outlines, show.view.rp2Lights));
    const label = texts.get(elementKey(e.id));
    if (label?.leader) written.push(`<line x1="${r(label.leader.x1)}" y1="${r(label.leader.y1)}" x2="${r(label.leader.x2)}" y2="${r(label.leader.y2)}" stroke="#555" stroke-width="${r(0.12 / k)}"${dim > 0 ? ` opacity="${r(1 - dim * 0.7)}"` : ''}/>`);
    if (label) written.push(`<text x="${r(label.x)}" y="${r(label.y)}" text-anchor="middle" font-size="${r(2.3 / k)}" fill="#000" font-family="Inter"${dim > 0 ? ` opacity="${r(1 - dim * 0.7)}"` : ''}>${esc(e.label)}</text>`);
  }
  out.push(...written);

  // Scale bar and legend, below the plan.
  const y0 = box.y1 + 1.5 / k;
  const bar = NICE.find((n) => n * k >= 15) ?? 50000;
  const bx = box.x0 + 2 / k;
  out.push(`<g stroke="#000" stroke-width="${r(0.3 / k)}"><line x1="${bx}" y1="${y0 + 3 / k}" x2="${bx + bar}" y2="${y0 + 3 / k}"/><line x1="${bx}" y1="${y0 + 2 / k}" x2="${bx}" y2="${y0 + 4 / k}"/><line x1="${bx + bar}" y1="${y0 + 2 / k}" x2="${bx + bar}" y2="${y0 + 4 / k}"/></g>`);
  const barLabel = bar >= 1000 ? `${bar / 1000} m` : `${bar} mm`;
  out.push(`<text x="${bx + bar + 2 / k}" y="${y0 + 4 / k}" font-size="${r(2.4 / k)}" fill="#000" font-family="Inter">${esc(`${barLabel} · ${D.scaleLabel} 1:${Math.round(1 / k)}`)}</text>`);

  used.forEach((id, i) => {
    const it = itemById(id)!;
    const cx = beside ? box.x1 + (6 + Math.floor(i / sideRows) * cellW) / k : box.x0 + (i % cols) * (cellW / k);
    const cy = beside ? box.y0 + ((i % sideRows) * cellH) / k : y0 + (barMm + Math.floor(i / cols) * cellH) / k;
    const side = 7 / k;
    const sc = Math.min(side / it.size.w, side / it.size.d);
    const w = it.size.w * sc;
    const d = it.size.d * sc;
    const lk = iconKeyFor(it, show.view.rp2Lights);
    const licon = lk && iconData(lk) ? lk : undefined;
    out.push(`<g transform="translate(${r(cx + (side - w) / 2)} ${r(cy + (side - d) / 2)}) scale(${r(sc * 1000) / 1000})">${printStrokes(licon ? footprintBody(it.size.w, it.size.d) : symbolBody(drawnSymbolOf(it, show.view.rp2Lights), it.size.w, it.size.d), f / sc)}${licon ? iconUse(licon, it.size.w, it.size.d) : ''}</g>`);
    out.push(`<text x="${r(cx + side + 1.5 / k)}" y="${r(cy + side / 2 + 0.8 / k)}" font-size="${r(2.2 / k)}" fill="#000" font-family="Inter">${esc(it.name[opts.lang])}</text>`);
  });

  const height = beside ? Math.max(worldH + barMm / k, (Math.min(sideRows, used.length) * cellH) / k) : worldH + extra;
  const width = beside ? worldW + sideMm / k : Math.max(worldW, used.length > 0 ? (cols * cellW) / k : 0);
  const defs = iconDefs(els.map((e) => itemById(e.type.id)).concat(used.map((id) => itemById(id))).map((it) => (it ? iconKeyFor(it, show.view.rp2Lights) : undefined)).filter((x): x is string => !!x));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(box.x0)} ${r(box.y0)} ${r(width)} ${r(height)}" width="${r(width)}" height="${r(height)}">${defs}${out.join('')}</svg>`;
  return { svg, widthMm: width * k, heightMm: height * k, scaleN: Math.round(1 / k), fits };
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
