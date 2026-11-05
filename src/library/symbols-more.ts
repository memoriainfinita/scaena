// More symbols, drawn the same way as symbols.ts: top view, real size in millimetres, the front towards +y. These
// are a little richer than the first set: a player is shown as shoulders and a head with the instrument where it
// really sits, so a plan reads at a glance.
import { circle, ellipse, front, line, path, rect } from './symbol-kit.ts';

type Draw = (w: number, d: number) => string;

/** A person seen from above: shoulders and a head, facing +y. */
const body = (cx: number, cy: number, r: number): string => ellipse(cx, cy, r * 1.25, r * 0.72) + circle(cx, cy, r * 0.46, '#fff');
const seat = (cx: number, cy: number, r: number): string => circle(cx, cy, r, '#fff') + circle(cx, cy, r * 0.55, 'none');
const knobs = (x0: number, x1: number, y: number, count: number, r: number): string => Array.from({ length: count }, (_, i) => circle(x0 + ((x1 - x0) * (i + 0.5)) / count, y, r)).join('');
const keyRow = (x: number, y: number, w: number, h: number, count: number): string => rect(x, y, w, h) + Array.from({ length: count - 1 }, (_, i) => line(x + (w * (i + 1)) / count, y, x + (w * (i + 1)) / count, y + h, 1)).join('');
const hatch = (w: number, d: number, step: number): string => {
  let out = '';
  for (let x = -d; x < w; x += step) out += line(Math.max(0, x), Math.max(0, -x), Math.min(w, x + d), Math.min(d, w - x), 1);
  return out;
};

export const MORE_SYMBOLS: Record<string, Draw> = {
  // ---- Percussion ----
  congas: (w, d) => ellipse(w * 0.3, d * 0.3, w * 0.2, d * 0.28) + ellipse(w * 0.7, d * 0.3, w * 0.2, d * 0.28) + circle(w * 0.3, d * 0.3, w * 0.12, 'none') + circle(w * 0.7, d * 0.3, w * 0.12, 'none') + seat(w * 0.5, d * 0.82, d * 0.15) + front(w, d),
  cajon: (w, d) => rect(w * 0.2, d * 0.05, w * 0.6, d * 0.5) + circle(w * 0.5, d * 0.3, w * 0.09, 'none') + body(w * 0.5, d * 0.78, d * 0.13) + front(w, d),
  percussionTable: (w, d) => rect(0, 0, w, d * 0.5) + circle(w * 0.15, d * 0.25, d * 0.1) + circle(w * 0.35, d * 0.25, d * 0.08) + rect(w * 0.5, d * 0.15, w * 0.15, d * 0.2) + circle(w * 0.82, d * 0.25, d * 0.12, 'none') + path(`M${w * 0.78} ${d * 0.25}h${w * 0.08}`) + body(w * 0.5, d * 0.8, d * 0.13) + front(w, d),
  drumsElectronic: (w, d) => rect(w * 0.1, 0, w * 0.8, d * 0.3) + Array.from({ length: 6 }, (_, i) => rect(w * (0.14 + (i % 3) * 0.14), d * (0.06 + Math.floor(i / 3) * 0.12), w * 0.1, d * 0.09)).join('') + circle(w * 0.62, d * 0.14, d * 0.09) + circle(w * 0.78, d * 0.14, d * 0.09) + circle(w * 0.2, d * 0.5, d * 0.1) + circle(w * 0.8, d * 0.5, d * 0.1) + circle(w * 0.5, d * 0.62, d * 0.12) + seat(w * 0.5, d * 0.88, d * 0.09) + front(w, d),

  // ---- Guitars, bass and pedals ----
  guitarist: (w, d) => body(w * 0.5, d * 0.4, d * 0.2) + ellipse(w * 0.68, d * 0.5, w * 0.12, d * 0.1) + line(w * 0.72, d * 0.45, w * 0.95, d * 0.18, 3) + rect(w * 0.15, d * 0.72, w * 0.7, d * 0.2) + knobs(w * 0.18, w * 0.82, d * 0.82, 5, d * 0.035) + front(w, d),
  bassist: (w, d) => body(w * 0.5, d * 0.42, d * 0.2) + ellipse(w * 0.66, d * 0.52, w * 0.13, d * 0.11) + line(w * 0.72, d * 0.46, w * 0.98, d * 0.1, 3) + rect(w * 0.2, d * 0.78, w * 0.6, d * 0.14) + knobs(w * 0.22, w * 0.78, d * 0.85, 4, d * 0.03) + front(w, d),
  pedalboard: (w, d) => rect(0, 0, w, d) + Array.from({ length: 5 }, (_, i) => rect(w * (0.05 + i * 0.18), d * 0.12, w * 0.15, d * 0.34)).join('') + Array.from({ length: 5 }, (_, i) => circle(w * (0.125 + i * 0.18), d * 0.74, d * 0.1)).join('') + front(w, d),
  ampStack: (w, d) => rect(0, 0, w, d) + circle(w * 0.27, d * 0.3, Math.min(w, d) * 0.2) + circle(w * 0.73, d * 0.3, Math.min(w, d) * 0.2) + circle(w * 0.27, d * 0.72, Math.min(w, d) * 0.2) + circle(w * 0.73, d * 0.72, Math.min(w, d) * 0.2) + front(w, d),

  // ---- Keys ----
  synth: (w, d) => rect(0, 0, w, d) + knobs(w * 0.08, w * 0.5, d * 0.2, 6, d * 0.06) + rect(w * 0.55, d * 0.1, w * 0.38, d * 0.2) + keyRow(w * 0.02, d * 0.42, w * 0.96, d * 0.52, 20) + front(w, d),
  stagePiano: (w, d) => rect(0, 0, w, d) + rect(w * 0.06, d * 0.08, w * 0.3, d * 0.22) + knobs(w * 0.45, w * 0.94, d * 0.19, 5, d * 0.06) + keyRow(w * 0.02, d * 0.42, w * 0.96, d * 0.54, 24) + front(w, d),
  organ: (w, d) => rect(0, 0, w, d) + keyRow(w * 0.04, d * 0.08, w * 0.92, d * 0.26, 18) + keyRow(w * 0.04, d * 0.38, w * 0.92, d * 0.26, 18) + Array.from({ length: 6 }, (_, i) => line(w * (0.2 + i * 0.11), d * 0.7, w * (0.2 + i * 0.11), d * 0.95, 4)).join('') + front(w, d),

  // ---- Strings ----
  violin: (w, d) => body(w * 0.5, d * 0.5, d * 0.22) + ellipse(w * 0.62, d * 0.4, w * 0.1, d * 0.07) + line(w * 0.7, d * 0.36, w * 0.95, d * 0.12, 2) + line(w * 0.35, d * 0.15, w * 0.85, d * 0.45, 1) + front(w, d),
  cello: (w, d) => seat(w * 0.5, d * 0.72, d * 0.14) + ellipse(w * 0.5, d * 0.46, w * 0.22, d * 0.2) + line(w * 0.5, d * 0.26, w * 0.5, 0, 3) + circle(w * 0.5, d * 0.66, d * 0.025, '#000') + line(w * 0.82, d * 0.2, w * 0.2, d * 0.6, 1) + front(w, d),
  harp: (w, d) => path(`M${w * 0.15} ${d * 0.9}L${w * 0.15} ${d * 0.2}Q${w * 0.15} ${d * 0.05} ${w * 0.4} ${d * 0.05}L${w * 0.85} ${d * 0.9}Z`, '#fff', 1.5) + Array.from({ length: 6 }, (_, i) => line(w * (0.22 + i * 0.08), d * (0.18 + i * 0.1), w * (0.22 + i * 0.08), d * 0.88, 1)).join('') + seat(w * 0.45, d * 0.96, d * 0.04) + front(w, d),

  // ---- Winds ----
  sax: (w, d) => body(w * 0.5, d * 0.35, d * 0.2) + path(`M${w * 0.58} ${d * 0.4}Q${w * 0.8} ${d * 0.5} ${w * 0.66} ${d * 0.75}`, 'none', 3) + circle(w * 0.64, d * 0.8, d * 0.08) + front(w, d),
  brass: (w, d) => body(w * 0.5, d * 0.38, d * 0.2) + line(w * 0.5, d * 0.52, w * 0.5, d * 0.78, 3) + line(w * 0.58, d * 0.52, w * 0.58, d * 0.78, 3) + circle(w * 0.54, d * 0.85, d * 0.08) + front(w, d),
  trombone: (w, d) => body(w * 0.4, d * 0.3, d * 0.16) + line(w * 0.4, d * 0.44, w * 0.4, d * 0.92, 3) + line(w * 0.48, d * 0.44, w * 0.48, d * 0.92, 3) + line(w * 0.4, d * 0.92, w * 0.48, d * 0.92, 3) + circle(w * 0.62, d * 0.6, d * 0.1) + front(w, d),
  flute: (w, d) => body(w * 0.5, d * 0.4, d * 0.2) + line(w * 0.12, d * 0.55, w * 0.9, d * 0.5, 3) + circle(w * 0.12, d * 0.55, d * 0.025, '#000') + front(w, d),

  // ---- Voices ----
  choir: (w, d) => rect(0, 0, w, d) + [0.2, 0.5, 0.8].map((y) => line(0, d * (y - 0.15), w, d * (y - 0.15), 1)).join('') + [0.2, 0.5, 0.8].map((y) => Array.from({ length: 8 }, (_, i) => circle(w * (0.075 + i * 0.121), d * y, Math.min(w * 0.04, d * 0.08))).join('')).join('') + front(w, d),
  handheld: (w, d) => body(w * 0.5, d * 0.45, d * 0.24) + line(w * 0.5, d * 0.62, w * 0.62, d * 0.8, 2) + circle(w * 0.64, d * 0.84, d * 0.06, '#000') + front(w, d),

  // ---- PA and monitors ----
  paTop: (w, d) => rect(0, 0, w, d * 0.75) + circle(w * 0.5, d * 0.4, Math.min(w, d) * 0.28) + path(`M${w * 0.2} ${d * 0.75}L${w * 0.1} ${d}L${w * 0.9} ${d}L${w * 0.8} ${d * 0.75}Z`, '#fff', 1.5) + front(w, d),
  frontFill: (w, d) => path(`M${w * 0.1} 0L${w * 0.9} 0L${w} ${d}L0 ${d}Z`, '#fff', 1.5) + circle(w * 0.5, d * 0.5, Math.min(w, d) * 0.25) + front(w, d),
  delayTower: (w, d) => rect(0, 0, w, d) + path(`M${w * 0.2} ${d * 0.25}L${w * 0.5} ${d * 0.6}L${w * 0.8} ${d * 0.25}`) + path(`M${w * 0.2} ${d * 0.45}L${w * 0.5} ${d * 0.8}L${w * 0.8} ${d * 0.45}`) + front(w, d),
  sideFill: (w, d) => rect(0, 0, w, d) + circle(w * 0.5, d * 0.3, Math.min(w, d) * 0.22) + circle(w * 0.5, d * 0.7, Math.min(w, d) * 0.22) + line(w * 0.15, d * 0.5, w * 0.85, d * 0.5, 1) + front(w, d),
  drumFill: (w, d) => rect(0, 0, w, d) + circle(w * 0.5, d * 0.5, Math.min(w, d) * 0.36) + circle(w * 0.5, d * 0.5, Math.min(w, d) * 0.18) + line(w * 0.85, d * 0.1, w * 0.85, d * 0.9, 1) + front(w, d),
  iemRack: (w, d) => rect(0, d * 0.2, w, d * 0.8) + Array.from({ length: 4 }, (_, i) => line(0, d * (0.4 + i * 0.15), w, d * (0.4 + i * 0.15))).join('') + line(w * 0.25, d * 0.2, w * 0.1, 0, 2) + line(w * 0.75, d * 0.2, w * 0.9, 0, 2) + circle(w * 0.1, 0, d * 0.03, '#000') + circle(w * 0.9, 0, d * 0.03, '#000'),
  ampRack: (w, d) => rect(0, 0, w, d) + Array.from({ length: 4 }, (_, i) => rect(w * 0.1, d * (0.08 + i * 0.22), w * 0.8, d * 0.16) + line(w * 0.18, d * (0.14 + i * 0.22), w * 0.6, d * (0.14 + i * 0.22), 1)).join(''),
  fxRack: (w, d) => rect(0, 0, w, d) + Array.from({ length: 4 }, (_, i) => rect(w * 0.08, d * (0.07 + i * 0.23), w * 0.84, d * 0.17) + knobs(w * 0.12, w * 0.5, d * (0.155 + i * 0.23), 4, d * 0.035)).join(''),
  networkSwitch: (w, d) => rect(0, 0, w, d) + Array.from({ length: 8 }, (_, i) => rect(w * (0.08 + i * 0.11), d * 0.3, w * 0.08, d * 0.4)).join(''),

  // ---- Desks and DJ ----
  deskAnalog: (w, d) => rect(0, 0, w, d) + knobs(w * 0.06, w * 0.94, d * 0.14, 12, d * 0.045) + knobs(w * 0.06, w * 0.94, d * 0.3, 12, d * 0.045) + Array.from({ length: 12 }, (_, i) => line(w * (0.06 + (i + 0.5) * 0.0733), d * 0.5, w * (0.06 + (i + 0.5) * 0.0733), d * 0.9, 3)).join('') + front(w, d),
  deskMonitor: (w, d) => rect(0, 0, w, d) + knobs(w * 0.08, w * 0.92, d * 0.2, 8, d * 0.06) + Array.from({ length: 8 }, (_, i) => line(w * (0.08 + (i + 0.5) * 0.105), d * 0.4, w * (0.08 + (i + 0.5) * 0.105), d * 0.88, 3)).join('') + front(w, d),
  djController: (w, d) => rect(0, 0, w, d) + circle(w * 0.2, d * 0.5, Math.min(w * 0.14, d * 0.34)) + circle(w * 0.8, d * 0.5, Math.min(w * 0.14, d * 0.34)) + rect(w * 0.4, d * 0.1, w * 0.2, d * 0.8) + line(w * 0.45, d * 0.55, w * 0.55, d * 0.55, 3) + front(w, d),
  turntables: (w, d) => rect(0, 0, w, d) + rect(w * 0.06, d * 0.1, w * 0.32, d * 0.8) + circle(w * 0.22, d * 0.5, Math.min(w * 0.13, d * 0.34), 'none') + line(w * 0.36, d * 0.14, w * 0.3, d * 0.5, 2) + rect(w * 0.62, d * 0.1, w * 0.32, d * 0.8) + circle(w * 0.78, d * 0.5, Math.min(w * 0.13, d * 0.34), 'none') + line(w * 0.92, d * 0.14, w * 0.86, d * 0.5, 2) + rect(w * 0.42, d * 0.15, w * 0.16, d * 0.7) + front(w, d),

  // ---- People and furniture ----
  seated: (w, d) => rect(w * 0.15, d * 0.4, w * 0.7, d * 0.55) + body(w * 0.5, d * 0.45, d * 0.2) + front(w, d),
  presenter: (w, d) => body(w * 0.5, d * 0.5, d * 0.24) + line(w * 0.7, d * 0.55, w * 0.9, d * 0.82, 3) + rect(w * 0.84, d * 0.8, w * 0.1, d * 0.1, '#000') + front(w, d),
  stool: (w, d) => circle(w / 2, d / 2, Math.min(w, d) * 0.45) + circle(w / 2, d / 2, Math.min(w, d) * 0.28, 'none'),
  bench: (w, d) => rect(0, 0, w, d) + line(w * 0.12, 0, w * 0.12, d, 1) + line(w * 0.88, 0, w * 0.88, d, 1),
  cableRamp: (w, d) => rect(0, 0, w, d) + hatch(w, d, Math.max(80, d * 0.6)) + line(0, d * 0.5, w, d * 0.5, 1),
  flat: (w, d) => rect(0, 0, w, d) + hatch(w, d, Math.max(100, d)),
  ladder: (w, d) => rect(0, 0, w, d) + Array.from({ length: 7 }, (_, i) => line(w * 0.05, d * (0.12 + i * 0.125), w * 0.95, d * (0.12 + i * 0.125), 1)).join(''),

  // ---- Power ----
  powerDistro: (w, d) => rect(0, 0, w, d) + Array.from({ length: 6 }, (_, i) => circle(w * (0.15 + (i % 3) * 0.35), d * (i < 3 ? 0.32 : 0.7), Math.min(w, d) * 0.12)).join('') + path(`M${w * 0.5} ${d * 0.06}l-${w * 0.04} ${d * 0.1}h${w * 0.08}l-${w * 0.04} ${d * 0.1}`, 'none', 2),
  powerStrip: (w, d) => {
    const c = Math.max(3, Math.min(8, Math.floor(w / (d * 1.4))));
    return rect(0, 0, w, d) + Array.from({ length: c }, (_, i) => rect((w * (i + 0.5)) / c - d * 0.22, d * 0.2, d * 0.44, d * 0.6)).join('');
  },

  // ---- Lights ----
  movingSpot: (w, d) => rect(0, 0, w, d) + circle(w * 0.5, d * 0.45, Math.min(w, d) * 0.3) + line(w * 0.1, d * 0.45, w * 0.9, d * 0.45, 3) + path(`M${w * 0.35} ${d * 0.45}L${w * 0.5} ${d * 0.95}L${w * 0.65} ${d * 0.45}`, 'none', 1.5, '5 4'),
  movingWash: (w, d) => rect(0, 0, w, d) + circle(w * 0.5, d * 0.45, Math.min(w, d) * 0.34) + Array.from({ length: 6 }, (_, i) => circle(w * (0.5 + 0.2 * Math.cos((i * Math.PI) / 3)), d * (0.45 + 0.2 * Math.sin((i * Math.PI) / 3)), Math.min(w, d) * 0.05, '#000')).join('') + line(w * 0.1, d * 0.45, w * 0.9, d * 0.45, 3),
  beam: (w, d) => rect(0, 0, w, d) + circle(w * 0.5, d * 0.4, Math.min(w, d) * 0.22) + line(w * 0.42, d * 0.62, w * 0.42, d, 1.5) + line(w * 0.58, d * 0.62, w * 0.58, d, 1.5) + line(w * 0.1, d * 0.4, w * 0.9, d * 0.4, 3),
  ledBar: (w, d) => {
    const c = Math.max(4, Math.round(w / (d * 1.2)));
    return rect(0, 0, w, d) + Array.from({ length: c }, (_, i) => circle((w * (i + 0.5)) / c, d / 2, Math.min(d * 0.3, (w / c) * 0.35))).join('') + front(w, d);
  },
  blinder: (w, d) => rect(0, 0, w, d) + circle(w * 0.3, d * 0.45, Math.min(w * 0.2, d * 0.3)) + circle(w * 0.7, d * 0.45, Math.min(w * 0.2, d * 0.3)) + line(w * 0.05, d * 0.9, w * 0.95, d * 0.9, 1) + front(w, d),
  ledProfile: (w, d) => path(`M${w * 0.15} 0H${w * 0.85}V${d * 0.45}L${w} ${d}H0L${w * 0.15} ${d * 0.45}Z`, '#fff', 1.5) + rect(w * 0.3, d * 0.1, w * 0.4, d * 0.2) + line(w * 0.38, d * 0.2, w * 0.62, d * 0.2, 1) + front(w, d),
  laser: (w, d) => rect(0, 0, w, d * 0.5) + circle(w * 0.5, d * 0.25, d * 0.12) + Array.from({ length: 5 }, (_, i) => line(w * 0.5, d * 0.5, w * (0.1 + i * 0.2), d, 1)).join(''),
  mirrorBall: (w, d) => circle(w / 2, d / 2, Math.min(w, d) * 0.46) + ellipse(w / 2, d / 2, Math.min(w, d) * 0.46, Math.min(w, d) * 0.2, 'none') + line(w / 2, d / 2 - Math.min(w, d) * 0.46, w / 2, d / 2 + Math.min(w, d) * 0.46, 1) + ellipse(w / 2, d / 2, Math.min(w, d) * 0.22, Math.min(w, d) * 0.46, 'none'),
  co2Jet: (w, d) => rect(0, 0, w, d * 0.45) + circle(w * 0.5, d * 0.22, d * 0.12) + Array.from({ length: 3 }, (_, i) => line(w * 0.5, d * 0.45, w * (0.25 + i * 0.25), d, 1.5, '5 4')).join(''),

  // ---- Video and control ----
  ledWall: (w, d) => rect(0, 0, w, d) + Array.from({ length: Math.max(0, Math.floor(w / 500) - 1) }, (_, i) => line(500 * (i + 1), 0, 500 * (i + 1), d, 1)).join('') + front(w, d),
  tv: (w, d) => rect(0, 0, w, d * 0.4) + path(`M${w * 0.35} ${d * 0.4}L${w * 0.3} ${d}L${w * 0.7} ${d}L${w * 0.65} ${d * 0.4}`, '#fff', 1.5) + front(w, d * 0.4),
  camera: (w, d) => rect(w * 0.3, d * 0.2, w * 0.4, d * 0.35) + path(`M${w * 0.4} ${d * 0.55}L${w * 0.5} ${d * 0.85}L${w * 0.6} ${d * 0.55}`, '#fff', 1.5) + line(w * 0.5, d * 0.38, w * 0.15, d * 0.92, 1) + line(w * 0.5, d * 0.38, w * 0.85, d * 0.92, 1) + line(w * 0.5, d * 0.38, w * 0.5, 0, 1) + circle(w * 0.5, d * 0.38, d * 0.05, '#000'),
  tablet: (w, d) => rect(0, 0, w, d) + rect(w * 0.08, d * 0.1, w * 0.84, d * 0.8) + circle(w * 0.5, d * 0.95, d * 0.02),
  server: (w, d) => rect(0, 0, w, d) + line(0, d * 0.25, w, d * 0.25, 1) + line(0, d * 0.5, w, d * 0.5, 1) + circle(w * 0.85, d * 0.14, d * 0.04, '#000') + circle(w * 0.85, d * 0.38, d * 0.04, '#000') + circle(w * 0.85, d * 0.62, d * 0.04, '#000') + front(w, d),
};

