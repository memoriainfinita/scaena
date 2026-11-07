// The plan as a DXF drawing for CAD programs: millimetres, one DXF layer per plan layer, every symbol as lines and circles.
// ASCII R12 (AC1009) keeps to what any reader takes: LINE, CIRCLE and TEXT. Curves become short lines.
import { symbolBody } from '../library/symbols.ts';
import { itemById } from '../library/items.ts';
import { withCustomItems } from '../library/custom.ts';
import { elementSize } from '../plan/geometry.ts';
import type { PlanElement, Show } from '../model/schema.ts';

type Pt = [number, number];
/** Affine matrix as in SVG: [a b c d e f]. */
type M = [number, number, number, number, number, number];
const ID: M = [1, 0, 0, 1, 0, 0];

const mul = (m: M, n: M): M => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const apply = (m: M, [x, y]: Pt): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

/** The transform list of an SVG `transform` attribute. Unknown functions are ignored. */
export function parseTransform(text: string): M {
  let out: M = ID;
  for (const f of text.matchAll(/(translate|scale|rotate|skewX|skewY|matrix)\(([^)]*)\)/g)) {
    const a = f[2]!.split(/[\s,]+/).filter(Boolean).map(Number);
    if (a.some((x) => !Number.isFinite(x))) continue;
    let m: M = ID;
    if (f[1] === 'translate') m = [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0];
    else if (f[1] === 'scale') m = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0];
    else if (f[1] === 'rotate') {
      const r = ((a[0] ?? 0) * Math.PI) / 180;
      const rot: M = [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
      m = a.length >= 3 ? mul(mul([1, 0, 0, 1, a[1]!, a[2]!], rot), [1, 0, 0, 1, -a[1]!, -a[2]!]) : rot;
    } else if (f[1] === 'skewX') m = [1, 0, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 1, 0, 0];
    else if (f[1] === 'skewY') m = [1, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 0, 1, 0, 0];
    else if (a.length === 6) m = a as M;
    out = mul(out, m);
  }
  return out;
}

const SEG = 12;

/** Points along a quadratic curve, without the start point. */
const quad = (p0: Pt, c: Pt, p1: Pt): Pt[] => Array.from({ length: SEG }, (_, i) => {
  const t = (i + 1) / SEG;
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]] as Pt;
});
const cubic = (p0: Pt, c1: Pt, c2: Pt, p1: Pt): Pt[] => Array.from({ length: SEG }, (_, i) => {
  const t = (i + 1) / SEG;
  const u = 1 - t;
  return [u ** 3 * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t ** 3 * p1[0], u ** 3 * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t ** 3 * p1[1]] as Pt;
});

/** Points along an SVG elliptical arc (endpoint form), without the start point. */
function arc(p0: Pt, rx: number, ry: number, rotDeg: number, large: boolean, sweep: boolean, p1: Pt): Pt[] {
  if (rx === 0 || ry === 0 || (p0[0] === p1[0] && p0[1] === p1[1])) return [p1];
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const phi = (rotDeg * Math.PI) / 180;
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const dx = (p0[0] - p1[0]) / 2;
  const dy = (p0[1] - p1[1]) / 2;
  const x1 = cp * dx + sp * dy;
  const y1 = -sp * dx + cp * dy;
  const lam = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lam > 1) {
    rx *= Math.sqrt(lam);
    ry *= Math.sqrt(lam);
  }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const co = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (co * rx * y1) / ry;
  const cyp = (-co * ry * x1) / rx;
  const cx = cp * cxp - sp * cyp + (p0[0] + p1[0]) / 2;
  const cy = sp * cxp + cp * cyp + (p0[1] + p1[1]) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const th1 = ang(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry);
  let dth = ang((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry);
  if (!sweep && dth > 0) dth -= 2 * Math.PI;
  else if (sweep && dth < 0) dth += 2 * Math.PI;
  const n = Math.max(4, Math.ceil((Math.abs(dth) / (2 * Math.PI)) * 32));
  return Array.from({ length: n }, (_, i) => {
    if (i === n - 1) return p1;
    const a = th1 + (dth * (i + 1)) / n;
    return [cp * rx * Math.cos(a) - sp * ry * Math.sin(a) + cx, sp * rx * Math.cos(a) + cp * ry * Math.sin(a) + cy] as Pt;
  });
}

export interface Poly {
  pts: Pt[];
  closed: boolean;
}

/** The subpaths of an SVG path as polylines. */
export function flattenPath(d: string): Poly[] {
  const tokens: (string | number)[] = [...d.matchAll(/([MmLlHhVvCcSsQqTtAaZz])|([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g)].map((m) => m[1] ?? Number(m[2]));
  const out: Poly[] = [];
  let cur: Poly | null = null;
  let p: Pt = [0, 0];
  let start: Pt = [0, 0];
  let lastC: Pt | null = null;
  let lastKind = '';
  let i = 0;
  let cmd = '';
  const nums = (n: number): number[] | null => {
    const v = tokens.slice(i, i + n);
    if (v.length < n || v.some((x) => typeof x !== 'number')) return null;
    i += n;
    return v as unknown as number[];
  };
  const push = (...pts: Pt[]) => {
    if (!cur) out.push((cur = { pts: [p], closed: false }));
    cur.pts.push(...pts);
    p = pts[pts.length - 1]!;
  };
  while (i < tokens.length) {
    const t = tokens[i];
    if (typeof t === 'string') {
      cmd = t;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        if (cur) cur.closed = true;
        cur = null;
        p = start;
        lastC = null;
        lastKind = 'z';
        continue;
      }
    } else if (cmd === '' || cmd === 'Z' || cmd === 'z') {
      return out;
    }
    const rel = cmd === cmd.toLowerCase();
    const o: Pt = rel ? p : [0, 0];
    const up = cmd.toUpperCase();
    if (up === 'M') {
      const a = nums(2);
      if (!a) return out;
      p = [o[0] + a[0]!, o[1] + a[1]!];
      start = p;
      cur = { pts: [p], closed: false };
      out.push(cur);
      cmd = rel ? 'l' : 'L';
      lastKind = 'm';
    } else if (up === 'L') {
      const a = nums(2);
      if (!a) return out;
      push([o[0] + a[0]!, o[1] + a[1]!]);
      lastKind = 'l';
    } else if (up === 'H') {
      const a = nums(1);
      if (!a) return out;
      push([o[0] + a[0]!, p[1]]);
      lastKind = 'l';
    } else if (up === 'V') {
      const a = nums(1);
      if (!a) return out;
      push([p[0], o[1] + a[0]!]);
      lastKind = 'l';
    } else if (up === 'Q') {
      const a = nums(4);
      if (!a) return out;
      const c: Pt = [o[0] + a[0]!, o[1] + a[1]!];
      const e: Pt = [o[0] + a[2]!, o[1] + a[3]!];
      push(...quad(p, c, e));
      lastC = c;
      lastKind = 'q';
    } else if (up === 'T') {
      const a = nums(2);
      if (!a) return out;
      const c: Pt = lastKind === 'q' && lastC ? [2 * p[0] - lastC[0], 2 * p[1] - lastC[1]] : p;
      const e: Pt = [o[0] + a[0]!, o[1] + a[1]!];
      push(...quad(p, c, e));
      lastC = c;
      lastKind = 'q';
    } else if (up === 'C') {
      const a = nums(6);
      if (!a) return out;
      const c2: Pt = [o[0] + a[2]!, o[1] + a[3]!];
      push(...cubic(p, [o[0] + a[0]!, o[1] + a[1]!], c2, [o[0] + a[4]!, o[1] + a[5]!]));
      lastC = c2;
      lastKind = 'c';
    } else if (up === 'S') {
      const a = nums(4);
      if (!a) return out;
      const c1: Pt = lastKind === 'c' && lastC ? [2 * p[0] - lastC[0], 2 * p[1] - lastC[1]] : p;
      const c2: Pt = [o[0] + a[0]!, o[1] + a[1]!];
      push(...cubic(p, c1, c2, [o[0] + a[2]!, o[1] + a[3]!]));
      lastC = c2;
      lastKind = 'c';
    } else if (up === 'A') {
      const a = nums(7);
      if (!a) return out;
      push(...arc(p, a[0]!, a[1]!, a[2]!, a[3] !== 0, a[4] !== 0, [o[0] + a[5]!, o[1] + a[6]!]));
      lastKind = 'a';
    } else return out;
  }
  return out;
}

export type Prim = { k: 'line'; a: Pt; b: Pt } | { k: 'circle'; c: Pt; r: number };

const attrs = (s: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const m of s.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) out[m[1]!] = m[2]!;
  return out;
};
const n = (v: string | undefined, d = 0): number => (v === undefined || !Number.isFinite(Number(v)) ? d : Number(v));
const ellipsePts = (cx: number, cy: number, rx: number, ry: number): Pt[] => Array.from({ length: 32 }, (_, i) => [cx + rx * Math.cos((i / 32) * 2 * Math.PI), cy + ry * Math.sin((i / 32) * 2 * Math.PI)] as Pt);

/** Lines and circles of a symbol's markup after transform `base`. */
export function primitivesOf(markup: string, base: M): Prim[] {
  const out: Prim[] = [];
  const stack: M[] = [base];
  const poly = (m: M, pts: Pt[], closed: boolean) => {
    const q = pts.map((p) => apply(m, p));
    for (let i = 0; i + 1 < q.length; i++) out.push({ k: 'line', a: q[i]!, b: q[i + 1]! });
    if (closed && q.length > 2) out.push({ k: 'line', a: q[q.length - 1]!, b: q[0]! });
  };
  for (const tag of markup.matchAll(/<(\/?)(g|rect|circle|ellipse|line|path|polyline|polygon)\b([^>]*?)(\/?)>/g)) {
    const [, close, name, rest, self] = tag as unknown as [string, string, string, string, string];
    if (name === 'g') {
      if (close) stack.pop();
      else if (self) continue;
      else stack.push(mul(stack[stack.length - 1]!, parseTransform(attrs(rest).transform ?? '')));
      continue;
    }
    if (close) continue;
    const a = attrs(rest);
    const m = mul(stack[stack.length - 1]!, parseTransform(a.transform ?? ''));
    if (name === 'rect') {
      const x = n(a.x);
      const y = n(a.y);
      const w = n(a.width);
      const h = n(a.height);
      poly(m, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
    } else if (name === 'line') poly(m, [[n(a.x1), n(a.y1)], [n(a.x2), n(a.y2)]], false);
    else if (name === 'circle' || name === 'ellipse') {
      const rx = name === 'circle' ? n(a.r) : n(a.rx);
      const ry = name === 'circle' ? n(a.r) : n(a.ry);
      const uniform = Math.abs(Math.hypot(m[0], m[1]) - Math.hypot(m[2], m[3])) < 1e-6 * Math.max(1, Math.hypot(m[0], m[1])) && Math.abs(m[0] * m[2] + m[1] * m[3]) < 1e-6 * Math.max(1, Math.hypot(m[0], m[1]) ** 2);
      if (rx === ry && uniform) out.push({ k: 'circle', c: apply(m, [n(a.cx), n(a.cy)]), r: rx * Math.hypot(m[0], m[1]) });
      else poly(m, ellipsePts(n(a.cx), n(a.cy), rx, ry), true);
    } else if (name === 'polyline' || name === 'polygon') {
      const v = (a.points ?? '').split(/[\s,]+/).filter(Boolean).map(Number);
      const pts: Pt[] = [];
      for (let i = 0; i + 1 < v.length; i += 2) pts.push([v[i]!, v[i + 1]!]);
      poly(m, pts, name === 'polygon');
    } else if (name === 'path') for (const sp of flattenPath(a.d ?? '')) poly(m, sp.pts, sp.closed);
  }
  return out;
}

// ---- writing ----

const COLORS = [7, 1, 3, 5, 4, 2, 6, 30, 140, 40];

/** A DXF layer name: capitals, digits and a few marks; at most 31 characters. */
export function layerName(raw: string, taken: Set<string>): string {
  const base = (raw.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().replace(/[^A-Z0-9$_-]+/g, '_').replace(/^_+|_+$/g, '') || 'LAYER').slice(0, 28);
  let name = base;
  for (let i = 2; taken.has(name); i++) name = `${base.slice(0, 26)}_${i}`;
  taken.add(name);
  return name;
}

/** DXF text: characters outside ASCII are written as \U+XXXX, which every version reads. */
const dxfText = (s: string): string => s.replace(/[\r\n]+/g, ' ').replace(/[^\x20-\x7e]/g, (c) => `\\U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
const f = (x: number): string => String(Math.round(x * 1000) / 1000);

export interface DxfFile {
  text: string;
  entities: number;
}

/** The plan seen from the audience, y up as CAD expects (the plan's y runs towards the audience, so it is mirrored). */
export function planDxf(show: Show): DxfFile {
  return withCustomItems(show.customItems, () => {
    const taken = new Set<string>();
    const stageLayer = layerName('STAGE-OUTLINE', taken);
    const planLayers = show.layers.map((l) => ({ id: l.id, name: layerName(l.name || l.subject, taken) }));
    const byId = new Map(planLayers.map((l) => [l.id, l.name]));
    const allNames = [stageLayer, ...planLayers.map((l) => l.name)];
    const out: string[] = [];
    let entities = 0;
    const g = (code: number, value: string | number) => out.push(String(code).padStart(3), String(value));
    const line = (layer: string, a: Pt, b: Pt) => {
      g(0, 'LINE');
      g(8, layer);
      g(10, f(a[0]));
      g(20, f(-a[1]));
      g(30, 0);
      g(11, f(b[0]));
      g(21, f(-b[1]));
      g(31, 0);
      entities++;
    };
    const circle = (layer: string, c: Pt, r: number) => {
      g(0, 'CIRCLE');
      g(8, layer);
      g(10, f(c[0]));
      g(20, f(-c[1]));
      g(30, 0);
      g(40, f(r));
      entities++;
    };
    const text = (layer: string, at: Pt, height: number, value: string) => {
      g(0, 'TEXT');
      g(8, layer);
      g(10, f(at[0]));
      g(20, f(-at[1]));
      g(30, 0);
      g(40, f(height));
      g(1, dxfText(value));
      entities++;
    };
    const draw = (layer: string, prims: Prim[]) => {
      for (const p of prims) if (p.k === 'line') line(layer, p.a, p.b);
      else circle(layer, p.c, p.r);
    };

    // The stage outline.
    const sh = show.stage.shape;
    const outline: Pt[] = sh.kind === 'rect' ? [[0, 0], [sh.width, 0], [sh.width, sh.depth], [0, sh.depth]] : sh.points.map((q) => [q.x, q.y] as Pt);
    for (let i = 0; i < outline.length; i++) line(stageLayer, outline[i]!, outline[(i + 1) % outline.length]!);

    const element = (e: PlanElement) => {
      const it = itemById(e.type.id);
      const layer = byId.get(e.layerId);
      if (!it || !layer) return;
      const { w, d } = elementSize(e);
      const r = (e.rotation * Math.PI) / 180;
      let m: M = [1, 0, 0, 1, e.x, e.y];
      m = mul(m, [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]);
      m = mul(m, [e.flipX ? -1 : 1, 0, 0, e.flipY ? -1 : 1, 0, 0]);
      m = mul(m, [1, 0, 0, 1, -w / 2, -d / 2]);
      draw(layer, primitivesOf(symbolBody(it.symbol, w, d), m));
      const label = e.label.trim();
      if (label) text(layer, [e.x - w / 2, e.y + d / 2 + 160], 100, label);
    };
    Object.values(show.elements).forEach(element);

    const body = out;
    const head: string[] = [];
    const hg = (code: number, value: string | number) => head.push(String(code).padStart(3), String(value));
    hg(0, 'SECTION');
    hg(2, 'HEADER');
    hg(9, '$ACADVER');
    hg(1, 'AC1009');
    hg(9, '$INSUNITS');
    hg(70, 4);
    hg(0, 'ENDSEC');
    hg(0, 'SECTION');
    hg(2, 'TABLES');
    hg(0, 'TABLE');
    hg(2, 'LTYPE');
    hg(70, 1);
    hg(0, 'LTYPE');
    hg(2, 'CONTINUOUS');
    hg(70, 0);
    hg(3, 'Solid line');
    hg(72, 65);
    hg(73, 0);
    hg(40, 0);
    hg(0, 'ENDTAB');
    hg(0, 'TABLE');
    hg(2, 'LAYER');
    hg(70, allNames.length);
    allNames.forEach((name, i) => {
      hg(0, 'LAYER');
      hg(2, name);
      hg(70, 0);
      hg(62, COLORS[i % COLORS.length]!);
      hg(6, 'CONTINUOUS');
    });
    hg(0, 'ENDTAB');
    hg(0, 'ENDSEC');
    hg(0, 'SECTION');
    hg(2, 'ENTITIES');
    const tail = ['  0', 'ENDSEC', '  0', 'EOF'];
    return { text: [...head, ...body, ...tail].join('\r\n') + '\r\n', entities };
  });
}
