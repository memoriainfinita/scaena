// The interactive plan: camera, selection, drag, keyboard. The drawing of one element is `PlanEl`; the
// camera only changes the `transform` of one group, so zooming does not repaint the elements.
import { batch, signal, useComputed, useSignal, type Signal } from '@preact/signals';
import { memo } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';
import { addTextAt, alignSelection, commitDrag, deleteSelection, distributeSelection, duplicateSelection, editable, flipSelection, groupSelection, moveSelection, rotateSelection, selectAll, setGrid, targets, tool, ungroupSelection } from '../app/plan-actions.ts';
import { connectSignal, connectTo, linkFrom } from '../app/computer-actions.ts';
import { dialog, selection, session } from '../app/state.ts';
import { lang, t, type Key } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { symbolBody } from '../library/symbols.ts';
import { SIGNALS, type SignalType } from '../model/connections.ts';
import { expandGroups, type AlignMode } from '../model/ops.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { boxesIntersect, elementBox, elementSize, fitCamera, formatLength, planBox, snap, toWorld, zoomAt, type Camera } from '../plan/geometry.ts';

/** True while the user is zooming: elements are drawn as plain boxes until the gesture settles. */
const gesture = signal(false);

const symCache = new Map<string, string>();
function symbolMarkup(key: string, w: number, d: number): string {
  const k = `${key}|${w}|${d}`;
  let v = symCache.get(k);
  if (v === undefined) {
    v = symbolBody(key, w, d);
    if (symCache.size > 3000) symCache.clear();
    symCache.set(k, v);
  }
  return v;
}

const focusLabel = () => requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[data-label-field]')?.select());

interface ElProps {
  el: PlanElement;
  selected: boolean;
  locked: boolean;
  dim: number;
}

const PlanEl = memo(function PlanEl({ el, selected, locked, dim }: ElProps) {
  const simple = gesture.value;
  const it = itemById(el.type.id);
  if (!it) return null;
  const { w, d } = elementSize(el);
  const isText = it.symbol === 'textbox';
  const name = el.label || it.name[lang.value];
  const box = elementBox(el, { w, d });
  const frame = selected ? { stroke: '#0b6e78', 'stroke-width': 3, 'stroke-dasharray': '8 5' } : { stroke: 'none' };
  return (
    <g
      class="el"
      data-id={el.id}
      transform={`translate(${el.x} ${el.y})`}
      opacity={dim > 0 ? 1 - dim * 0.7 : undefined}
      tabIndex={locked ? -1 : 0}
      role="button"
      aria-label={name}
      aria-pressed={selected}
      aria-disabled={locked || undefined}
      onFocus={() => {
        if (!locked && !selection.peek().includes(el.id)) selection.value = expandGroups(session.value!.show.peek(), [el.id]);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !locked) {
          e.preventDefault();
          focusLabel();
        }
      }}
    >
      <g transform={`rotate(${el.rotation}) scale(${el.flipX ? -1 : 1} ${el.flipY ? -1 : 1}) translate(${-w / 2} ${-d / 2})`}>
        <rect class="hit" x={-40} y={-40} width={w + 80} height={d + 80} fill="transparent" vector-effect="non-scaling-stroke" {...frame} />
        {simple ? <rect width={w} height={d} fill="#fff" stroke="#000" stroke-width="1" vector-effect="non-scaling-stroke" /> : <g dangerouslySetInnerHTML={{ __html: symbolMarkup(it.symbol, w, d) }} />}
      </g>
      {isText && !simple && (
        <g transform={`rotate(${el.rotation})`}>
          <text x={-w / 2 + 80} y={d * 0.28} font-size={d * 0.62} fill="#000" font-family="Inter Variable, sans-serif" style="white-space:pre">
            {el.label}
          </text>
        </g>
      )}
      {!isText && el.label && !simple && (
        <text x={0} y={box.y1 - el.y + 190} text-anchor="middle" font-size="170" fill="#000" font-family="Inter Variable, sans-serif">
          {el.label}
        </text>
      )}
    </g>
  );
});

function Stage({ show }: { show: Show }) {
  const sh = show.stage.shape;
  const ref = show.stage.referenceLines;
  const common = { fill: '#f1f1ee', stroke: '#000', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' } as const;
  return (
    <g aria-hidden="true">
      {sh.kind === 'rect' ? <rect x={0} y={0} width={sh.width} height={sh.depth} {...common} /> : <polygon points={sh.points.map((p) => `${p.x},${p.y}`).join(' ')} {...common} />}
      {sh.kind === 'rect' && (
        <>
          {ref.proscenium && <line x1={-300} y1={sh.depth} x2={sh.width + 300} y2={sh.depth} stroke="#000" stroke-width="4" vector-effect="non-scaling-stroke" />}
          {ref.center && <line x1={sh.width / 2} y1={0} x2={sh.width / 2} y2={sh.depth + 300} stroke="#000" stroke-width="1" stroke-dasharray="14 6 2 6" vector-effect="non-scaling-stroke" />}
        </>
      )}
    </g>
  );
}

const LINK_STYLE: Record<SignalType, { stroke: string; dash: string }> = {
  audio: { stroke: '#0b6e78', dash: '' },
  video: { stroke: '#7a3db8', dash: '10 5' },
  lightControl: { stroke: '#b36b00', dash: '10 4 2 4' },
  network: { stroke: '#3a6e1a', dash: '2 5' },
};

/** Cables between elements: the colour is always backed by a different dash and the connector name. */
function Connections({ show, hidden }: { show: Show; hidden: Set<string> }) {
  const simple = gesture.value;
  const layers = new Map(show.layers.map((l) => [l.id, l]));
  const shown = (id: string) => {
    const el = show.elements[id];
    return !!el && !hidden.has(id) && !!layers.get(el.layerId)?.visible;
  };
  return (
    <g aria-hidden="true" pointer-events="none">
      {Object.values(show.connections)
        .filter((c) => shown(c.from) && shown(c.to))
        .map((c) => {
          const a = show.elements[c.from]!;
          const b = show.elements[c.to]!;
          const st = LINK_STYLE[c.signal];
          return (
            <g key={c.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={st.stroke} stroke-width="2" stroke-dasharray={st.dash || undefined} vector-effect="non-scaling-stroke" />
              {!simple && c.connector && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 60} text-anchor="middle" font-size="150" fill={st.stroke} stroke="#fff" stroke-width="40" paint-order="stroke" font-family="Inter Variable, sans-serif">
                  {c.connector}
                </text>
              )}
            </g>
          );
        })}
    </g>
  );
}

/** Grid lines in screen space: never denser than one every 12 px. */
function Grid({ cam, size, stepMm }: { cam: Signal<Camera>; size: Signal<{ w: number; h: number }>; stepMm: number }) {
  const c = cam.value;
  const { w, h } = size.value;
  let step = stepMm;
  while (step * c.k < 12) step *= 2;
  const px = step * c.k;
  if (!isFinite(px) || px <= 0 || w === 0) return null;
  let d = '';
  for (let x = ((c.x % px) + px) % px; x < w; x += px) d += `M${x.toFixed(1)} 0V${h}`;
  for (let y = ((c.y % px) + px) % px; y < h; y += px) d += `M0 ${y.toFixed(1)}H${w}`;
  return <path d={d} stroke="#dcdcd8" stroke-width="1" fill="none" aria-hidden="true" />;
}

type Pt = { x: number; y: number };
interface Marquee {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
interface Measure {
  a: Pt;
  b: Pt | null;
  done: boolean;
}

/** Overlays that live in screen space so their strokes and text keep a constant size. */
function Overlays({ cam, marquee, measure, units, link, cursor }: { cam: Signal<Camera>; marquee: Signal<Marquee | null>; measure: Signal<Measure | null>; units: Show['units']; link: Pt | null; cursor: Signal<Pt | null> }) {
  const c = cam.value;
  const m = measure.value;
  const q = marquee.value;
  const toScreen = (p: Pt) => ({ x: p.x * c.k + c.x, y: p.y * c.k + c.y });
  const cur = cursor.value;
  return (
    <g aria-hidden="true" pointer-events="none">
      {link && cur && (() => {
        const a = toScreen(link);
        const b = toScreen(cur);
        return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#0b6e78" stroke-width="2" stroke-dasharray="5 4" />;
      })()}
      {q && <rect x={Math.min(q.x0, q.x1)} y={Math.min(q.y0, q.y1)} width={Math.abs(q.x1 - q.x0)} height={Math.abs(q.y1 - q.y0)} fill="rgba(11,110,120,0.12)" stroke="#0b6e78" stroke-width="1" stroke-dasharray="4 3" />}
      {m &&
        (() => {
          const a = toScreen(m.a);
          const b = m.b ? toScreen(m.b) : null;
          return (
            <>
              <circle cx={a.x} cy={a.y} r="4" fill="#0b6e78" />
              {b && m.b && (
                <>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#0b6e78" stroke-width="2" />
                  <circle cx={b.x} cy={b.y} r="4" fill="#0b6e78" />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 8} text-anchor="middle" font-size="13" font-weight="600" fill="#08515a" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="Inter Variable, sans-serif">
                    {t('plan.measure', { value: formatLength(Math.hypot(m.b.x - m.a.x, m.b.y - m.a.y), units, lang.value) })}
                  </text>
                </>
              )}
            </>
          );
        })()}
    </g>
  );
}

/** A bar that shows a round length at the current zoom. */
function ScaleBar({ cam, units }: { cam: Signal<Camera>; units: Show['units'] }) {
  const k = cam.value.k;
  const nice = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000].find((mm) => mm * k >= 60) ?? 50000;
  return (
    <div class="scalebar" aria-hidden="true">
      <span style={`width:${Math.round(nice * k)}px`} />
      {formatLength(nice, units, lang.value)}
    </div>
  );
}

const ICONS: Record<string, string> = {
  left: 'M3 2v14M6 5h9M6 11h5',
  center: 'M9 2v14M4 5h10M6 11h6',
  right: 'M15 2v14M3 5h9M7 11h5',
  top: 'M2 3h14M5 6v9M11 6v5',
  middle: 'M2 9h14M5 4v10M11 6v6',
  bottom: 'M2 15h14M5 3v9M11 7v5',
  distributeX: 'M3 2v14M15 2v14M7 6h4v6H7z',
  distributeY: 'M2 3h14M2 15h14M6 7h6v4H6z',
  rotate: 'M14 9a5 5 0 1 1-1.6-3.7M14 3v3h-3',
  flip: 'M9 2v14M6 5L2 9l4 4zM12 5l4 4-4 4z',
  duplicate: 'M6 6h9v9H6zM3 12V3h9',
  group: 'M2 2h7v7H2zM9 9h7v7H9z',
  ungroup: 'M2 2h5v5H2zM11 11h5v5h-5z',
  trash: 'M3 5h12M7 5V3h4v2M5 5l1 11h6l1-11',
  zoomIn: 'M3 9h12M9 3v12',
  zoomOut: 'M3 9h12',
  fit: 'M3 7V3h4M11 3h4v4M15 11v4h-4M7 15H3v-4',
  grid: 'M3 3h12v12H3zM9 3v12M3 9h12',
  dim: 'M9 3a6 6 0 1 0 0 12z',
};

function Ico({ name }: { name: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}
export { Ico };

function Btn({ icon, label, onClick, pressed, disabled }: { icon: string; label: string; onClick: () => void; pressed?: boolean; disabled?: boolean }) {
  return (
    <button type="button" class="pbtn" aria-label={label} title={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>
      <Ico name={icon} />
    </button>
  );
}

type Interaction =
  | { kind: 'pan'; sx: number; sy: number; cam: Camera }
  | { kind: 'drag'; ids: string[]; hitId: string; p0: Pt; w0: Pt; sx: number; sy: number; moved: boolean; shift: boolean; wasMulti: boolean }
  | { kind: 'marquee'; sx: number; sy: number; add: boolean; base: string[] };

const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function PlanView({ show }: { show: Show }) {
  const wrap = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cam = useSignal<Camera>({ x: 0, y: 0, k: 0.05 });
  const size = useSignal({ w: 0, h: 0 });
  const dragIds = useSignal<string[] | null>(null);
  const dragDelta = useSignal({ dx: 0, dy: 0 });
  const marquee = useSignal<Marquee | null>(null);
  const measure = useSignal<Measure | null>(null);
  const cursor = useSignal<Pt | null>(null);
  const camT = useComputed(() => `translate(${cam.value.x} ${cam.value.y}) scale(${cam.value.k})`);
  const dragT = useComputed(() => `translate(${dragDelta.value.dx} ${dragDelta.value.dy})`);

  const showRef = useRef(show);
  showRef.current = show;
  const fitted = useRef(false);
  const space = useRef(false);
  const timer = useRef(0);
  const act = useRef<Interaction | null>(null);

  const fit = () => {
    const { w, h } = size.peek();
    if (w > 0) cam.value = fitCamera(planBox(showRef.current), w, h);
  };

  // Size of the drawing area; the first measurement fits the plan.
  useEffect(() => {
    const node = wrap.current!;
    const ro = new ResizeObserver(() => {
      const r = node.getBoundingClientRect();
      size.value = { w: r.width, h: r.height };
      if (!fitted.current && r.width > 0) {
        fitted.current = true;
        cam.value = fitCamera(planBox(showRef.current), r.width, r.height);
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const local = (e: { clientX: number; clientY: number }): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const world = (e: { clientX: number; clientY: number }): Pt => {
    const p = local(e);
    return toWorld(cam.peek(), p.x, p.y);
  };
  const gridStep = () => (showRef.current.view.grid ? showRef.current.view.gridMm : 0);

  const zoomBy = (factor: number, at?: Pt) => {
    const { w, h } = size.peek();
    const p = at ?? { x: w / 2, y: h / 2 };
    cam.value = zoomAt(cam.peek(), p.x, p.y, factor);
    gesture.value = true;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => (gesture.value = false), 140);
  };

  // The wheel needs a non-passive listener to stop the page from scrolling.
  useEffect(() => {
    const node = svgRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.shiftKey) {
        const c = cam.peek();
        cam.value = { ...c, x: c.x - (e.deltaX || e.deltaY), y: c.y };
        return;
      }
      zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), local(e));
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', onWheel);
      linkFrom.value = null;
      clearTimeout(timer.current);
      gesture.value = false;
    };
  }, []);

  // Keyboard: window-level so it works whichever element is focused, except while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || dialog.value) return;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const v = showRef.current.view;
      const step = e.shiftKey ? 10 : v.grid ? v.gridMm : 100;
      const has = targets(showRef.current).length > 0;
      let handled = true;
      if (e.key === ' ') {
        space.current = true;
      } else if (e.key.startsWith('Arrow')) {
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        if (has) moveSelection(dx, dy);
        else {
          const c = cam.peek();
          cam.value = { ...c, x: c.x - dx * c.k * 4, y: c.y - dy * c.k * 4 };
        }
      } else if (mod && key === 'd') duplicateSelection(v.grid ? v.gridMm : 500);
      else if (mod && key === 'g') {
        if (e.shiftKey) ungroupSelection();
        else groupSelection();
      }
      else if (mod && key === 'a') selectAll();
      else if (!mod && !e.altKey && key === 'r') rotateSelection(e.shiftKey ? -15 : 15);
      else if (!mod && !e.altKey && key === 'f') flipSelection(e.shiftKey ? 'y' : 'x');
      else if (!mod && (e.key === 'Delete' || e.key === 'Backspace')) deleteSelection();
      else if (!mod && e.key === '0') fit();
      else if (!mod && (e.key === '+' || e.key === '=')) zoomBy(1.25);
      else if (!mod && (e.key === '-' || e.key === '_')) zoomBy(0.8);
      else if (e.key === 'Escape') {
        selection.value = [];
        tool.value = 'select';
        measure.value = null;
        linkFrom.value = null;
        handled = false; // dialogs and menus still get their Escape
      } else handled = false;
      if (handled) e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === ' ') space.current = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    const svg = svgRef.current!;
    const p = local(e);
    const mode = e.button === 1 || space.current || tool.value === 'pan' ? 'pan' : tool.value;
    const s = showRef.current;
    if (mode === 'pan') {
      e.preventDefault();
      svg.setPointerCapture(e.pointerId);
      act.current = { kind: 'pan', sx: p.x, sy: p.y, cam: cam.peek() };
    } else if (mode === 'measure') {
      const w = world(e);
      const st = e.altKey ? 0 : gridStep();
      const pt = { x: snap(w.x, st), y: snap(w.y, st) };
      const m = measure.peek();
      measure.value = !m || m.done ? { a: pt, b: null, done: false } : { a: m.a, b: pt, done: true };
    } else if (mode === 'connect') {
      const id = (e.target as Element).closest('[data-id]')?.getAttribute('data-id');
      const el = id ? s.elements[id] : undefined;
      if (!el || !editable(s, el)) linkFrom.value = null;
      else if (!linkFrom.peek()) {
        linkFrom.value = el.id;
        selection.value = [el.id];
      } else if (!connectTo(el.id)) linkFrom.value = null;
    } else if (mode === 'text') {
      const w = world(e);
      const st = e.altKey ? 0 : gridStep();
      if (addTextAt(snap(w.x, st), snap(w.y, st), t('plan.text'))) {
        tool.value = 'select';
        focusLabel();
      }
    } else if (mode === 'select') {
      const id = (e.target as Element).closest('[data-id]')?.getAttribute('data-id');
      const el = id ? s.elements[id] : undefined;
      svg.setPointerCapture(e.pointerId);
      if (el && editable(s, el)) {
        const group = expandGroups(s, [el.id]);
        const was = selection.peek().includes(el.id);
        let sel = selection.peek();
        if (e.shiftKey) sel = was ? sel.filter((x) => !group.includes(x)) : [...new Set([...sel, ...group])];
        else if (!was) sel = group;
        selection.value = sel;
        if (e.shiftKey && was) return;
        const w0 = world(e);
        act.current = { kind: 'drag', ids: targets(s, sel), hitId: el.id, p0: { x: el.x, y: el.y }, w0, sx: p.x, sy: p.y, moved: false, shift: e.shiftKey, wasMulti: was && sel.length > 1 };
      } else {
        act.current = { kind: 'marquee', sx: p.x, sy: p.y, add: e.shiftKey, base: selection.peek() };
        marquee.value = null;
      }
    }
  };

  const onMove = (e: PointerEvent) => {
    const a = act.current;
    const p = local(e);
    if (!a) {
      if (linkFrom.peek()) cursor.value = toWorld(cam.peek(), p.x, p.y);
      const m = measure.peek();
      if (m && !m.done && tool.peek() === 'measure') {
        const w = toWorld(cam.peek(), p.x, p.y);
        const st = e.altKey ? 0 : gridStep();
        measure.value = { ...m, b: { x: snap(w.x, st), y: snap(w.y, st) } };
      }
      return;
    }
    if (a.kind === 'pan') cam.value = { ...a.cam, x: a.cam.x + p.x - a.sx, y: a.cam.y + p.y - a.sy };
    else if (a.kind === 'drag') {
      if (!a.moved && Math.hypot(p.x - a.sx, p.y - a.sy) < 4) return;
      a.moved = true;
      const w = world(e);
      let dx = w.x - a.w0.x;
      let dy = w.y - a.w0.y;
      const st = e.altKey ? 0 : gridStep();
      if (st > 0) {
        dx = snap(a.p0.x + dx, st) - a.p0.x;
        dy = snap(a.p0.y + dy, st) - a.p0.y;
      }
      batch(() => {
        if (dragIds.peek() === null) dragIds.value = a.ids;
        dragDelta.value = { dx, dy };
      });
    } else if (a.kind === 'marquee') {
      if (marquee.peek() || Math.hypot(p.x - a.sx, p.y - a.sy) >= 4) marquee.value = { x0: a.sx, y0: a.sy, x1: p.x, y1: p.y };
    }
  };

  const finish = (cancelled: boolean) => {
    const a = act.current;
    act.current = null;
    if (!a) return;
    const s = showRef.current;
    if (a.kind === 'drag') {
      batch(() => {
        const d = dragDelta.peek();
        if (a.moved && !cancelled) commitDrag(a.ids, d.dx, d.dy);
        else if (!a.moved && !a.shift && a.wasMulti && !cancelled) selection.value = expandGroups(s, [a.hitId]);
        dragIds.value = null;
        dragDelta.value = { dx: 0, dy: 0 };
      });
    } else if (a.kind === 'marquee') {
      const q = marquee.peek();
      marquee.value = null;
      if (cancelled) return;
      if (!q) {
        if (!a.add) selection.value = [];
        return;
      }
      const c = cam.peek();
      const w0 = toWorld(c, Math.min(q.x0, q.x1), Math.min(q.y0, q.y1));
      const w1 = toWorld(c, Math.max(q.x0, q.x1), Math.max(q.y0, q.y1));
      const area = { x0: w0.x, y0: w0.y, x1: w1.x, y1: w1.y };
      const inside = Object.values(s.elements)
        .filter((el) => editable(s, el) && boxesIntersect(area, elementBox(el)))
        .map((el) => el.id);
      selection.value = [...new Set([...(a.add ? a.base : []), ...expandGroups(s, inside)])];
    }
  };

  const layers = new Map(show.layers.map((l) => [l.id, l]));
  const layerIndex = new Map(show.layers.map((l, i) => [l.id, i]));
  const sel = new Set(selection.value);
  const dragSet = dragIds.value ? new Set(dragIds.value) : null;
  const rows = Object.values(show.elements)
    .filter((e) => layers.get(e.layerId)?.visible)
    .sort((a, b) => (layerIndex.get(a.layerId) ?? 0) - (layerIndex.get(b.layerId) ?? 0));
  const mk = (e: PlanElement) => {
    const l = layers.get(e.layerId)!;
    return <PlanEl key={e.id} el={e} selected={sel.has(e.id)} locked={l.locked} dim={l.dim ?? 0} />;
  };
  const resting = (dragSet ? rows.filter((e) => !dragSet.has(e.id)) : rows).map(mk);
  const moving = dragSet ? rows.filter((e) => dragSet.has(e.id)).map(mk) : [];

  const count = targets(show, selection.value).length;
  const grouped = targets(show, selection.value).some((id) => show.elements[id]?.groupId);
  const mode = tool.value;
  const linkId = linkFrom.value;
  const linkEl = linkId ? show.elements[linkId] : undefined;
  const signal = connectSignal.value;
  const align = (m: AlignMode) => alignSelection(m);
  const isPan = mode === 'pan';

  return (
    <div class="plan" ref={wrap}>
      <svg
        ref={svgRef}
        class={`plansvg${isPan ? ' pan' : mode === 'measure' || mode === 'text' ? ' cross' : ''}`}
        role="group"
        aria-label={t('canvas.alt', { n: rows.length })}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => finish(false)}
        onPointerCancel={() => finish(true)}
      >
        {show.view.grid && <Grid cam={cam} size={size} stepMm={show.view.gridMm} />}
        <g transform={camT}>
          <Stage show={show} />
          <Connections show={show} hidden={dragSet ?? new Set()} />
          <g>{resting}</g>
          <g transform={dragT}>{moving}</g>
        </g>
        <Overlays cam={cam} marquee={marquee} measure={measure} units={show.units} link={linkEl ? { x: linkEl.x, y: linkEl.y } : null} cursor={cursor} />
      </svg>
      {mode === 'connect' && (
        <div class="planbar left" role="group" aria-label={t('connect.signal')}>
          {SIGNALS.map((sg) => (
            <button key={sg} type="button" class="chipbtn" aria-pressed={signal === sg} onClick={() => (connectSignal.value = sg)}>
              {t(`signal.${sg}` as Key)}
            </button>
          ))}
          {linkEl && (
            <span class="muted pad-s" role="status">
              {t('plan.connecting', { name: linkEl.label || itemById(linkEl.type.id)?.name[lang.value] || '' })}
            </span>
          )}
        </div>
      )}
      <div class="planbar top" role="toolbar" aria-label={t('align.label')} hidden={count === 0}>
        <Btn icon="rotate" label={`${t('plan.rotate')} (R)`} onClick={() => rotateSelection(15)} />
        <Btn icon="flip" label={`${t('plan.flip')} (F)`} onClick={() => flipSelection('x')} />
        <Btn icon="duplicate" label={`${t('plan.duplicate')} (Ctrl+D)`} onClick={() => duplicateSelection(show.view.grid ? show.view.gridMm : 500)} />
        <Btn icon={grouped ? 'ungroup' : 'group'} label={grouped ? `${t('plan.ungroup')} (Ctrl+Mayús+G)` : `${t('plan.group')} (Ctrl+G)`} disabled={!grouped && count < 2} onClick={() => (grouped ? ungroupSelection() : groupSelection())} />
        <Btn icon="trash" label={`${t('plan.delete')} (Supr)`} onClick={() => deleteSelection()} />
        <span class="psep" />
        {(['left', 'center', 'right', 'top', 'middle', 'bottom'] as const).map((m) => (
          <Btn key={m} icon={m} label={t(`align.${m}` as Key)} disabled={count < 2} onClick={() => align(m)} />
        ))}
        <Btn icon="distributeX" label={t('align.distributeX')} disabled={count < 3} onClick={() => distributeSelection('x')} />
        <Btn icon="distributeY" label={t('align.distributeY')} disabled={count < 3} onClick={() => distributeSelection('y')} />
      </div>
      <div class="planbar bottom">
        <Btn icon="zoomOut" label={`${t('plan.zoomOut')} (−)`} onClick={() => zoomBy(0.8)} />
        <Btn icon="zoomIn" label={`${t('plan.zoomIn')} (+)`} onClick={() => zoomBy(1.25)} />
        <Btn icon="fit" label={`${t('plan.fit')} (0)`} onClick={fit} />
        <Btn icon="grid" label={t('plan.grid')} pressed={show.view.grid} onClick={() => setGrid(!show.view.grid)} />
        <ScaleBar cam={cam} units={show.units} />
      </div>
    </div>
  );
}
