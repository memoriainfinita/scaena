// Symbols drawn from scratch for scaena, in top view. Each one is a function of the real size (w by d, in
// millimetres), with the front towards +y marked by a thicker line (RP-2 convention). Single style: simple
// shapes, 1.5 px strokes that do not scale with zoom, white fill so overlaps read, legible in black and white.
// No brand shapes and no copied standard sheets.

const S = 'stroke="#000" vector-effect="non-scaling-stroke"';
const sw = (n: number) => `stroke-width="${n}"`;
const n = (v: number) => Math.round(v * 10) / 10;

const rect = (x: number, y: number, w: number, h: number, fill = '#fff') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" ${S} ${sw(1.5)}/>`;
const circle = (cx: number, cy: number, r: number, fill = '#fff') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" ${S} ${sw(1.5)}/>`;
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill = '#fff') => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${S} ${sw(1.5)}/>`;
const line = (x1: number, y1: number, x2: number, y2: number, width = 1.5, dash = '') => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${S} ${sw(width)}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const path = (d: string, fill = 'none', width = 1.5, dash = '') => `<path d="${d}" fill="${fill}" ${S} ${sw(width)}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
/** The thick front line, towards the audience. */
const front = (w: number, d: number) => line(0, d, w, d, 4);

type Draw = (w: number, d: number) => string;

const SYMBOLS: Record<string, Draw> = {
  drums: (w, d) => {
    const m = Math.min(w, d);
    const cymbal = m * 0.12;
    return [
      ellipse(w * 0.5, d * 0.3, w * 0.12, d * 0.14), // bass drum, seen from above
      circle(w * 0.5, d * 0.62, m * 0.1), // snare
      circle(w * 0.35, d * 0.4, m * 0.08), // tom 1
      circle(w * 0.65, d * 0.4, m * 0.08), // tom 2
      circle(w * 0.82, d * 0.58, m * 0.12), // floor tom
      circle(w * 0.2, d * 0.66, m * 0.09), // hi-hat
      path(`M${n(w * 0.2 - cymbal)} ${n(d * 0.28)}a${n(cymbal)} ${n(cymbal)} 0 1 0 ${n(2 * cymbal)} 0a${n(cymbal)} ${n(cymbal)} 0 1 0 ${n(-2 * cymbal)} 0`, 'none', 1.5, '6 4'), // crash
      circle(w * 0.5, d * 0.9, m * 0.09), // stool
      front(w, d),
    ].join('');
  },
  guitarAmp: (w, d) => rect(0, 0, w, d) + circle(w / 2, d / 2, Math.min(w, d) * 0.32) + line(w * 0.2, d * 0.12, w * 0.8, d * 0.12) + front(w, d),
  bassAmp: (w, d) => rect(0, 0, w, d) + circle(w * 0.3, d / 2, Math.min(w, d) * 0.3) + circle(w * 0.7, d / 2, Math.min(w, d) * 0.3) + front(w, d),
  keyboard: (w, d) => rect(0, 0, w, d) + Array.from({ length: 9 }, (_, i) => line(w * (0.1 + i * 0.1), d * 0.35, w * (0.1 + i * 0.1), d)).join('') + front(w, d),
  piano: (w, d) => path(`M0 ${d * 0.1}L${w * 0.45} 0Q${w} 0 ${w} ${d * 0.45}L${w} ${d}L0 ${d}Z`, '#fff', 1.5) + rect(w * 0.1, d * 0.78, w * 0.8, d * 0.14) + front(w, d),
  doubleBass: (w, d) => ellipse(w / 2, d * 0.7, w * 0.42, d * 0.26) + line(w / 2, d * 0.44, w / 2, 0, 3) + front(w, d),
  person: (w, d) => circle(w / 2, d / 2, Math.min(w, d) * 0.45) + line(w * 0.2, d * 0.5, w * 0.8, d * 0.5) + front(w, d),
  micStand: (w, d) => circle(w * 0.5, d * 0.65, Math.min(w, d) * 0.22) + line(w * 0.5, d * 0.65, w * 0.5, 0, 2) + circle(w * 0.5, 0, Math.min(w, d) * 0.1, '#000'),
  wedge: (w, d) => path(`M${w * 0.1} 0L${w * 0.9} 0L${w} ${d}L0 ${d}Z`, '#fff', 1.5) + line(w * 0.25, d * 0.45, w * 0.75, d * 0.45) + front(w, d),
  paLine: (w, d) => rect(0, 0, w, d) + path(`M${w * 0.15} ${d * 0.15}L${w * 0.5} ${d * 0.7}L${w * 0.85} ${d * 0.15}`) + front(w, d),
  sub: (w, d) => rect(0, 0, w, d) + circle(w / 2, d / 2, Math.min(w, d) * 0.36) + circle(w / 2, d / 2, Math.min(w, d) * 0.16) + front(w, d),
  iem: (w, d) => rect(0, d * 0.25, w, d * 0.75) + line(w * 0.8, d * 0.25, w * 0.8, 0, 2),
  desk: (w, d) => rect(0, 0, w, d) + Array.from({ length: 8 }, (_, i) => line(w * (0.1 + i * 0.1), d * 0.35, w * (0.1 + i * 0.1), d * 0.9, 3)).join('') + front(w, d),
  stagebox: (w, d) => rect(0, 0, w, d) + Array.from({ length: 8 }, (_, i) => circle(w * (0.15 + (i % 4) * 0.23), d * (i < 4 ? 0.33 : 0.67), Math.min(w, d) * 0.07)).join(''),
  rack: (w, d) => rect(0, 0, w, d) + Array.from({ length: 5 }, (_, i) => line(0, d * (0.17 + i * 0.17), w, d * (0.17 + i * 0.17))).join(''),
  di: (w, d) => rect(0, 0, w, d) + circle(w * 0.3, d / 2, Math.min(w, d) * 0.22) + circle(w * 0.7, d / 2, Math.min(w, d) * 0.22),
  djBooth: (w, d) => rect(0, 0, w, d) + circle(w * 0.2, d / 2, Math.min(w, d) * 0.34) + circle(w * 0.8, d / 2, Math.min(w, d) * 0.34) + rect(w * 0.4, d * 0.2, w * 0.2, d * 0.6) + front(w, d),
  laptop: (w, d) => rect(0, 0, w, d * 0.6) + path(`M${w * 0.05} ${d * 0.6}L${w * 0.95} ${d * 0.6}L${w} ${d}L0 ${d}Z`, '#fff', 1.5),
  screen: (w, d) => rect(0, 0, w, d) + Array.from({ length: Math.max(2, Math.floor(w / 400)) }, (_, i) => line(w * ((i + 0.5) / Math.max(2, Math.floor(w / 400))), 0, w * ((i + 0.5) / Math.max(2, Math.floor(w / 400))) - d * 0.8, d, 1)).join('') + front(w, d),
  projector: (w, d) => rect(0, 0, w, d * 0.8) + circle(w / 2, d * 0.8, Math.min(w, d) * 0.18) + front(w, d),
  videoMixer: (w, d) => rect(0, 0, w, d) + Array.from({ length: 4 }, (_, i) => rect(w * (0.1 + (i % 2) * 0.45), d * (0.12 + Math.floor(i / 2) * 0.42), w * 0.35, d * 0.32)).join(''),
  riser: (w, d) => rect(0, 0, w, d) + line(0, 0, w, d, 1) + line(w, 0, 0, d, 1),
  chair: (w, d) => rect(0, 0, w, d) + line(0, d * 0.15, w, d * 0.15, 4),
  musicStand: (w, d) => circle(w / 2, d / 2, Math.min(w, d) * 0.4) + line(w * 0.1, d * 0.3, w * 0.9, d * 0.3, 3),
  table: (w, d) => rect(0, 0, w, d),
  flightcase: (w, d) => rect(0, 0, w, d) + line(0, 0, w, d, 1, '8 5') + line(w, 0, 0, d, 1, '8 5'),
  lectern: (w, d) => path(`M${w * 0.1} 0L${w * 0.9} 0L${w} ${d}L0 ${d}Z`, '#fff', 1.5) + circle(w / 2, d * 0.4, Math.min(w, d) * 0.1) + front(w, d),
  audience: (w, d) => path(`M0 0L${w} 0L${w} ${d}L0 ${d}Z`, 'none', 1.5, '12 8') + Array.from({ length: 5 }, (_, i) => line(0, d * (0.2 + i * 0.15), w, d * (0.2 + i * 0.15), 1, '2 14')).join(''),
  foh: (w, d) => rect(0, 0, w, d) + line(0, 0, w, d, 1) + line(w, 0, 0, d, 1) + front(w, d),
  access: (w, d) => rect(0, 0, w, d, 'none') + line(w * 0.1, d / 2, w * 0.9, d / 2, 2) + path(`M${w * 0.75} ${d * 0.2}L${w * 0.9} ${d / 2}L${w * 0.75} ${d * 0.8}`, 'none', 2),
  curtain: (w, d) => rect(0, 0, w, d) + path(`M0 ${d / 2}${Array.from({ length: Math.max(4, Math.floor(w / 300)) }, (_, i) => `L${n(((i + 1) * w) / Math.max(4, Math.floor(w / 300)))} ${i % 2 ? d * 0.2 : d * 0.8}`).join('')}`, 'none', 1),
  stairs: (w, d) => rect(0, 0, w, d) + Array.from({ length: 6 }, (_, i) => line(0, d * ((i + 1) / 7), w, d * ((i + 1) / 7), 1)).join('') + front(w, d),
  platform: (w, d) => rect(0, 0, w, d) + line(0, 0, w, d, 1) + line(w, 0, 0, d, 1),
  // Lights: body at the back, lens end towards +y with the thick front line.
  ellipsoidal: (w, d) => rect(w * 0.2, 0, w * 0.6, d * 0.72) + path(`M${w * 0.1} ${d * 0.72}L${w * 0.9} ${d * 0.72}L${w * 0.75} ${d}L${w * 0.25} ${d}Z`, '#fff') + line(w * 0.25, d, w * 0.75, d, 4),
  fresnel: (w, d) => rect(w * 0.2, 0, w * 0.6, d * 0.55) + circle(w / 2, d * 0.78, Math.min(w, d) * 0.22) + circle(w / 2, d * 0.78, Math.min(w, d) * 0.12) + line(w * 0.1, d, w * 0.9, d, 4),
  pc: (w, d) => rect(w * 0.2, 0, w * 0.6, d * 0.55) + path(`M${w * 0.12} ${d * 0.6}A${w * 0.38} ${d * 0.4} 0 0 0 ${w * 0.88} ${d * 0.6}`, '#fff') + line(w * 0.1, d, w * 0.9, d, 4),
  par: (w, d) => circle(w / 2, d * 0.45, Math.min(w, d) * 0.42) + circle(w / 2, d * 0.45, Math.min(w, d) * 0.22) + line(w * 0.1, d, w * 0.9, d, 4),
  ledPar: (w, d) => circle(w / 2, d * 0.45, Math.min(w, d) * 0.42) + [0.28, 0.5, 0.72].map((x) => circle(w * x, d * 0.45, Math.min(w, d) * 0.07, '#000')).join('') + line(w * 0.1, d, w * 0.9, d, 4),
  scoop: (w, d) => path(`M0 0L${w} 0L${w} ${d * 0.35}A${w / 2} ${d * 0.65} 0 0 1 0 ${d * 0.35}Z`, '#fff') + line(w * 0.1, d, w * 0.9, d, 4),
  strip: (w, d) => rect(0, 0, w, d) + Array.from({ length: 3 }, (_, i) => line(w * ((i + 1) / 4), 0, w * ((i + 1) / 4), d, 1)).join('') + front(w, d),
  cyc: (w, d) => rect(0, 0, w, d * 0.6) + path(`M${w * 0.15} ${d * 0.6}L0 ${d}M${w * 0.5} ${d * 0.6}L${w * 0.5} ${d}M${w * 0.85} ${d * 0.6}L${w} ${d}`, 'none', 1.5) + line(0, d, w, d, 4),
  followspot: (w, d) => rect(w * 0.15, 0, w * 0.7, d * 0.7) + circle(w / 2, d * 0.78, Math.min(w, d) * 0.2) + circle(w / 2, d * 0.18, Math.min(w, d) * 0.08, '#000') + line(w * 0.1, d, w * 0.9, d, 4),
  haze: (w, d) => rect(0, 0, w, d) + path(`M${w * 0.15} ${d * 0.4}q${w * 0.1} -${d * 0.2} ${w * 0.2} 0t${w * 0.2} 0t${w * 0.2} 0`, 'none', 1.5) + path(`M${w * 0.15} ${d * 0.7}q${w * 0.1} -${d * 0.2} ${w * 0.2} 0t${w * 0.2} 0t${w * 0.2} 0`, 'none', 1.5),
  smoke: (w, d) => rect(0, 0, w, d) + circle(w * 0.32, d * 0.55, Math.min(w, d) * 0.22) + circle(w * 0.58, d * 0.45, Math.min(w, d) * 0.28) + circle(w * 0.76, d * 0.62, Math.min(w, d) * 0.18),
  strobe: (w, d) => rect(0, 0, w, d) + path(`M${w * 0.55} ${d * 0.1}L${w * 0.35} ${d * 0.55}L${w * 0.5} ${d * 0.55}L${w * 0.4} ${d * 0.92}L${w * 0.7} ${d * 0.4}L${w * 0.52} ${d * 0.4}Z`, '#000', 1) + front(w, d),
  // A text note: the label is drawn inside by the plan; the symbol is only a light frame.
  textbox: (w, d) => path(`M0 0H${w}V${d}H0Z`, 'none', 1, '6 5'),
  generic: (w, d) => rect(0, 0, w, d) + line(0, 0, w, d, 1) + line(w, 0, 0, d, 1),
};

export const symbolKeys = (): string[] => Object.keys(SYMBOLS);

/** SVG inner markup for a symbol at a given real size, in millimetres with the origin at the top left. */
export function symbolBody(key: string, w: number, d: number): string {
  const draw = SYMBOLS[key];
  if (!draw) throw new Error(`unknown symbol ${key}`);
  return draw(w, d);
}

/** A complete, standalone SVG for the library panel and the contact sheet. */
export function symbolSvg(key: string, w: number, d: number, title: string): string {
  const pad = Math.max(w, d) * 0.03;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(-pad)} ${n(-pad)} ${n(w + 2 * pad)} ${n(d + 2 * pad)}" role="img"><title>${title}</title>${symbolBody(key, w, d)}</svg>`;
}
