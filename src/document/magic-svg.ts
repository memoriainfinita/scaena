// The magic sheet: a schematic of the stage with every instrument shown as its channel number, in the place where it
// hangs. The board operator reads it to find a channel by position. Drawn in plan millimetres on a white sheet.
import type { Lang } from '../i18n/index.ts';
import { luminaires } from '../model/lights.ts';
import type { Show } from '../model/schema.ts';
import { docStrings } from './strings.ts';

export interface MagicSheet {
  svg: string;
  /** Width over height of the drawing. */
  aspect: number;
  count: number;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = (n: number) => Math.round(n * 10) / 10;

export function magicSheet(show: Show, lang: Lang = show.lang): MagicSheet | null {
  const lum = luminaires(show);
  if (lum.length === 0) return null;
  const D = docStrings(lang);
  const sh = show.stage.shape;
  const sw = sh.kind === 'rect' ? sh.width : Math.max(...sh.points.map((p) => p.x));
  const sd = sh.kind === 'rect' ? sh.depth : Math.max(...sh.points.map((p) => p.y));
  const xs = [0, sw, ...lum.map((e) => e.x), ...Object.values(show.mounts).flatMap((m) => [m.from.x, m.to.x])];
  const ys = [0, sd, ...lum.map((e) => e.y), ...Object.values(show.mounts).flatMap((m) => [m.from.y, m.to.y])];
  const u = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 55; // one "type unit"
  const pad = u * 6;
  const x0 = Math.min(...xs) - pad;
  const y0 = Math.min(...ys) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + 2 * pad;
  const h = Math.max(...ys) - Math.min(...ys) + 2 * pad;
  const out: string[] = [];
  const stroke = `stroke="#000" stroke-width="${r(u * 0.12)}"`;
  out.push(sh.kind === 'rect' ? `<rect x="0" y="0" width="${sh.width}" height="${sh.depth}" fill="none" ${stroke}/>` : `<polygon points="${sh.points.map((p) => `${p.x},${p.y}`).join(' ')}" fill="none" ${stroke}/>`);
  for (const m of Object.values(show.mounts)) {
    out.push(`<line x1="${m.from.x}" y1="${m.from.y}" x2="${m.to.x}" y2="${m.to.y}" stroke="#777" stroke-width="${r(u * 0.1)}" stroke-dasharray="${r(u * 0.8)} ${r(u * 0.5)}"/>`);
    out.push(`<text x="${r(Math.min(m.from.x, m.to.x) - u * 0.8)}" y="${r((m.from.y + m.to.y) / 2 + u * 0.4)}" text-anchor="end" font-size="${r(u * 1.5)}" fill="#444" font-family="Inter">${esc(m.name)}</text>`);
  }
  const rad = u * 1.6;
  for (const e of lum) {
    const l = e.luminaire!;
    const ch = l.channel === null ? '–' : String(l.channel);
    out.push(`<circle cx="${e.x}" cy="${e.y}" r="${r(rad)}" fill="#fff" ${stroke}/>`);
    out.push(`<text x="${e.x}" y="${r(e.y + u * 0.6)}" text-anchor="middle" font-size="${r(u * (ch.length > 2 ? 1.4 : 1.8))}" font-weight="700" fill="#000" font-family="Inter">${esc(ch)}</text>`);
    if (l.color.trim()) out.push(`<text x="${e.x}" y="${r(e.y + rad + u * 1.5)}" text-anchor="middle" font-size="${r(u * 1.2)}" fill="#333" font-family="Inter">${esc(l.color.trim())}</text>`);
  }
  out.push(`<text x="${r(x0 + pad * 0.5)}" y="${r(y0 + pad * 0.7)}" font-size="${r(u * 1.5)}" fill="#000" font-family="Inter">${esc(D.magic)} · ${esc(D.audience)} ↓</text>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x0)} ${r(y0)} ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}">${out.join('')}</svg>`;
  return { svg, aspect: w / h, count: lum.length };
}
