// Turns a user's SVG file into plan-symbol markup that is safe to put in the page and in the PDF.
// It does not filter the file: it reads it with a strict tokenizer and builds new markup from a closed list of shapes and
// attributes. Scripts, styles, images, links, fonts, gradients, filters and anything else are not carried over, so there
// is nothing to execute and no address to fetch. It uses no DOM, so it runs the same in the app, a worker and the tests.

export const MAX_SVG_BYTES = 200_000;
const MAX_ELEMENTS = 2000;
const MAX_DEPTH = 16;
const MAX_PATH = 50_000;

export interface CleanSvg {
  /** Shapes in the file's own coordinates, with every stroke 1.5 px wide and constant at any zoom. */
  markup: string;
  /** x, y, width and height of the drawing in those coordinates. */
  viewBox: [number, number, number, number];
  /** Drawing elements the file had that are not supported (text, images, gradients, links, nested svg…). */
  dropped: number;
}
export type CleanError = 'tooBig' | 'notSvg' | 'forbidden' | 'empty' | 'badBox';
export type CleanResult = { ok: true; svg: CleanSvg } | { ok: false; error: CleanError };

const SHAPES = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon']);
const GROUP = 'g';
/** Present in many files and harmless to leave out: they are skipped without counting. */
const QUIET = new Set(['title', 'desc', 'metadata', 'defs', 'namedview']);

const NUM = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?(?:px)?$/;
const COLOR = /^(?:none|#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|black|white|currentcolor)$/i;
const POINTS = /^[-+\d.eE,\s]{1,20000}$/;
const PATH = /^[MmLlHhVvCcSsQqTtAaZz\d.eE+\-,\s]*$/;
const TRANSFORM = /^\s*(?:(?:translate|scale|rotate|skewX|skewY|matrix)\(\s*[-+\d.eE,\s]+\)[\s,]*)+$/;
const UNIT = /^[01]?(?:\.\d+)?$|^[01]$/;

const GEOMETRY: Record<string, string[]> = {
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
};

const num = (v: string): number | null => {
  const s = v.trim();
  return NUM.test(s) ? Number(s.replace(/px$/, '')) : null;
};
const n3 = (x: number): string => String(Math.round(x * 1000) / 1000);

/** Presentation properties kept, from attributes or from a `style` attribute. */
function presentation(raw: Record<string, string>): string {
  const props: Record<string, string> = {};
  const take = (k: string, v: string) => {
    const val = v.trim();
    if (k === 'fill' || k === 'stroke') {
      if (COLOR.test(val)) props[k] = val.toLowerCase() === 'currentcolor' ? '#000' : val;
    } else if (k === 'opacity' || k === 'fill-opacity' || k === 'stroke-opacity') {
      if (UNIT.test(val) && val !== '') props[k] = val;
    } else if (k === 'fill-rule') {
      if (val === 'nonzero' || val === 'evenodd') props[k] = val;
    } else if (k === 'stroke-linecap') {
      if (['butt', 'round', 'square'].includes(val)) props[k] = val;
    } else if (k === 'stroke-linejoin') {
      if (['miter', 'round', 'bevel'].includes(val)) props[k] = val;
    }
  };
  for (const [k, v] of Object.entries(raw)) if (k !== 'style') take(k, v);
  if (raw.style) {
    for (const decl of raw.style.split(';')) {
      const i = decl.indexOf(':');
      if (i > 0) take(decl.slice(0, i).trim().toLowerCase(), decl.slice(i + 1));
    }
  }
  return Object.entries(props)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
}

interface Open {
  name: string;
  /** Markup built so far for this element's children. */
  inner: string;
  /** Opening tag to emit, or null when this element is skipped (its children are skipped too). */
  open: string | null;
}

const TAG = /<(\/?)([A-Za-z][\w:.-]*)((?:\s+[^\s=/>"']+\s*=\s*(?:"[^"<]*"|'[^'<]*'))*)\s*(\/?)>/y;
const ATTR = /([^\s=/>"']+)\s*=\s*(?:"([^"<]*)"|'([^'<]*)')/g;

export function cleanSvg(input: string): CleanResult {
  if (input.length > MAX_SVG_BYTES) return { ok: false, error: 'tooBig' };
  let text = input.replace(/^\uFEFF/, '');
  text = text.replace(/<\?xml[^>]*\?>/i, '').replace(/<!--[\s\S]*?-->/g, '');
  if (/<!DOCTYPE|<!ENTITY|<!\[CDATA\[|<\?/i.test(text)) return { ok: false, error: 'forbidden' };

  const stack: Open[] = [];
  let root: { viewBox: [number, number, number, number] | null; w: number | null; h: number | null } | null = null;
  let out = '';
  let dropped = 0;
  let count = 0;
  let shapes = 0;
  let pos = 0;
  let closedRoot = false;

  const emit = (markup: string) => {
    if (stack.length === 0) out += markup;
    else stack[stack.length - 1]!.inner += markup;
  };
  /** Whether everything above is being kept (a skipped ancestor skips its descendants). */
  const live = () => stack.every((s) => s.open !== null || s.name === 'svg');

  while (pos < text.length) {
    const lt = text.indexOf('<', pos);
    if (lt < 0) break;
    TAG.lastIndex = lt;
    const m = TAG.exec(text);
    if (!m || m.index !== lt) return { ok: false, error: 'notSvg' };
    pos = lt + m[0].length;
    const closing = m[1] === '/';
    const selfClosing = m[4] === '/';
    const rawName = m[2]!;
    const name = rawName.toLowerCase().replace(/^svg:/, '');

    if (closing) {
      const top = stack.pop();
      if (!top || top.name !== name) return { ok: false, error: 'notSvg' };
      if (top.name === 'svg') {
        // The root is closed: nothing else may follow but spaces.
        if (text.slice(pos).trim() !== '') return { ok: false, error: 'notSvg' };
        out = top.inner;
        closedRoot = true;
        break;
      }
      if (top.open !== null) emit(top.name === GROUP ? `${top.open}${top.inner}</g>` : top.open);
      continue;
    }

    if (++count > MAX_ELEMENTS) return { ok: false, error: 'tooBig' };
    if (stack.length >= MAX_DEPTH) return { ok: false, error: 'tooBig' };

    const attrs: Record<string, string> = {};
    for (const a of (m[3] ?? '').matchAll(ATTR)) attrs[a[1]!.toLowerCase()] = (a[2] ?? a[3] ?? '').trim();

    if (root === null) {
      if (name !== 'svg') return { ok: false, error: 'notSvg' };
      let viewBox: [number, number, number, number] | null = null;
      if (attrs.viewbox !== undefined) {
        const parts = attrs.viewbox.split(/[\s,]+/).filter(Boolean).map(Number);
        if (parts.length === 4 && parts.every(Number.isFinite) && parts[2]! > 0 && parts[3]! > 0) viewBox = parts as [number, number, number, number];
        else return { ok: false, error: 'badBox' };
      }
      root = { viewBox, w: attrs.width !== undefined ? num(attrs.width) : null, h: attrs.height !== undefined ? num(attrs.height) : null };
      stack.push({ name: 'svg', inner: '', open: '' });
      if (selfClosing) return { ok: false, error: 'empty' };
      continue;
    }

    let open: string | null = null;
    if (live()) {
      if (name === GROUP) {
        const tr = attrs.transform;
        if (tr !== undefined && !TRANSFORM.test(tr)) open = null;
        else open = `<g${tr !== undefined ? ` transform="${tr.replace(/\s+/g, ' ')}"` : ''}${presentation(attrs)}>`;
        if (open === null) dropped++;
      } else if (SHAPES.has(name)) {
        open = shapeTag(name, attrs);
        if (open === null) dropped++;
        else shapes++;
      } else if (!QUIET.has(name.split(':').pop()!) && !name.includes(':')) {
        dropped++;
      }
    }
    if (selfClosing) {
      if (open !== null) emit(name === GROUP ? '' : open);
    } else {
      stack.push({ name, inner: '', open });
    }
  }

  if (!root || !closedRoot || stack.length !== 0) return { ok: false, error: 'notSvg' };
  if (shapes === 0) return { ok: false, error: 'empty' };
  const viewBox = root.viewBox ?? (root.w && root.h && root.w > 0 && root.h > 0 ? ([0, 0, root.w, root.h] as [number, number, number, number]) : null);
  if (!viewBox) return { ok: false, error: 'badBox' };
  return { ok: true, svg: { markup: out, viewBox, dropped } };
}

const STROKE = ' stroke-width="1.5" vector-effect="non-scaling-stroke"';

/** The opening tag of a shape built from checked values, or null when one of them is not acceptable. */
function shapeTag(name: string, a: Record<string, string>): string | null {
  let geo = '';
  if (name === 'path') {
    const d = a.d ?? '';
    if (d === '' || d.length > MAX_PATH || !PATH.test(d)) return null;
    geo = ` d="${d.replace(/\s+/g, ' ')}"`;
  } else if (name === 'polyline' || name === 'polygon') {
    const p = a.points ?? '';
    if (p === '' || !POINTS.test(p)) return null;
    geo = ` points="${p.replace(/\s+/g, ' ')}"`;
  } else {
    for (const k of GEOMETRY[name]!) {
      if (a[k] === undefined) continue;
      const v = num(a[k]);
      if (v === null) return null;
      geo += ` ${k}="${n3(v)}"`;
    }
    if (name === 'rect' && (num(a.width ?? '') ?? 0) <= 0) return null;
    if (name === 'rect' && (num(a.height ?? '') ?? 0) <= 0) return null;
    if (name === 'circle' && (num(a.r ?? '') ?? 0) <= 0) return null;
    if (name === 'ellipse' && ((num(a.rx ?? '') ?? 0) <= 0 || (num(a.ry ?? '') ?? 0) <= 0)) return null;
  }
  const tr = a.transform;
  if (tr !== undefined && !TRANSFORM.test(tr)) return null;
  const transform = tr !== undefined ? ` transform="${tr.replace(/\s+/g, ' ')}"` : '';
  return `<${name}${geo}${transform}${presentation(a)}${STROKE}/>`;
}

/** True when the markup is exactly what `cleanSvg` produces: how a stored drawing is checked each time a file is opened. */
export function isCleanMarkup(markup: string, viewBox: readonly number[]): boolean {
  const r = cleanSvg(`<svg viewBox="${viewBox.join(' ')}">${markup}</svg>`);
  return r.ok && r.svg.markup === markup && r.svg.dropped === 0;
}
