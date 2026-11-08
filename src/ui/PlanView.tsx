// The interactive plan: camera, selection, drag, keyboard. The drawing of one element is `PlanEl`; the
// camera only changes the `transform` of one group, so zooming does not repaint the elements.
import { batch, effect, signal, useComputed, useSignal, type Signal } from '@preact/signals';
import { memo } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import { setFocusPoint } from '../app/lights-actions.ts';
import { beamDegrees } from '../model/lights.ts';
import { addDimension, addTextAt, alignSelection, commitDrag, deleteSelection, distributeSelection, duplicateSelection, editable, flipSelection, groupSelection, moveSelection, rotateSelection, selectAll, setGrid, setLabels, setLinks, setOutlines, targets, tool, ungroupSelection } from '../app/plan-actions.ts';
import { calibrateBackground, fitRequest, updateBackground } from '../app/background-actions.ts';
import { pngSize } from '../background/png.ts';
import { connectSignal, connectTo, linkFrom } from '../app/computer-actions.ts';
import { issues } from '../app/issues.ts';
import type { Severity } from '../validate/rules.ts';
import { addFromLibrary, dialog, selection, session } from '../app/state.ts';
import { lang, t, type Key } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { symbolBody } from '../library/symbols.ts';
import { footprintBody, iconData, iconKeyOf, iconUse, iconsVersion, loadIcons } from '../library/icons.ts';
import { SIGNALS, type SignalType } from '../model/connections.ts';
import { expandGroups, type AlignMode } from '../model/ops.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { stageFrame, stagePoints } from '../model/stage.ts';
import { addStagePointAfter, deleteStagePoint, moveStagePointTo, stageEdit, stopStageEdit } from '../app/stage-actions.ts';
import { boxesIntersect, clampK, elementBox, elementSize, fitCamera, formatLength, planBox, prosceniumWalls, snap, toWorld, unionBox, zoomAt, type Camera } from '../plan/geometry.ts';

/** True while the user is zooming: elements are drawn as plain boxes until the gesture settles. */
const gesture = signal(false);

/** Above this many drawn elements the plan swaps to plain boxes while it zooms or something is dragged (measured in docs/research/rendimiento-app-2026-11-05.md). */
export const LOD_MIN = 150;

const symCache = new Map<string, string>();
/** Icons use a thin footprint instead of the drawn top view; the icon itself is drawn apart (see PlanEl). */
function symbolMarkup(key: string, w: number, d: number, icon: boolean): string {
  const k = `${key}|${w}|${d}|${icon ? 'i' : ''}`;
  let v = symCache.get(k);
  if (v === undefined) {
    v = icon ? footprintBody(w, d) : symbolBody(key, w, d);
    if (symCache.size > 3000) symCache.clear();
    symCache.set(k, v);
  }
  return v;
}

const focusLabel = () => requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[data-label-field]')?.select());

/** The drag-and-drop type that carries a library item id from the library onto the plan. */
export const LIBRARY_DRAG = 'application/x-scaena-item';

interface ElProps {
  el: PlanElement;
  sev: Severity | null;
  selected: boolean;
  locked: boolean;
  dim: number;
}

const BADGE: Record<Severity, string> = { error: '#b3261e', warning: '#9a5b00', tip: '#1a5fb4' };

const PlanEl = memo(function PlanEl({ el, selected, locked, dim, sev }: ElProps) {
  const it = itemById(el.type.id);
  if (!it) return null;
  const { w, d } = elementSize(el);
  const isText = it.symbol === 'textbox';
  const isDim = it.symbol === 'dimension';
  void iconsVersion.value; // redraw when the sheet of this element's icon arrives
  const iconKey = iconKeyOf(it.id);
  const icon = iconKey && iconData(iconKey) ? iconKey : undefined;
  const shown = session.value!.show.value;
  const units = isDim ? shown.units : 'metric';
  const { labels, outlines } = shown.view;
  const name = el.label || it.name[lang.value];
  const box = elementBox(el, { w, d });
  const frame = selected ? { stroke: '#0b6e78', 'stroke-width': 3, 'stroke-dasharray': '8 5' } : { stroke: 'none' };
  return (
    <g
      class="el"
      data-id={el.id}
      transform={`translate(${el.x} ${el.y})`}
      opacity={dim > 0 ? 1 - dim * 0.7 : undefined}
      tabindex={locked ? -1 : 0}
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
        <rect class="simple" width={w} height={d} fill="#c9cfd4" />
        <g class="detail" dangerouslySetInnerHTML={{ __html: (icon && !outlines ? '' : symbolMarkup(it.symbol, w, d, !!icon)) + (icon ? iconUse(icon, w, d) : '') }} />
      </g>
      {isText && (
        <g class="detail" transform={`rotate(${el.rotation})`}>
          <text x={-w / 2 + 80} y={d * 0.28} font-size={d * 0.62} fill="#000" font-family="Inter Variable, sans-serif" style="white-space:pre">
            {el.label}
          </text>
        </g>
      )}
      {isDim && (
        <g class="detail" transform={`rotate(${el.rotation})`}>
          <text x={0} y={-d / 2 - 60} text-anchor="middle" font-size="170" font-weight="600" fill="#000" stroke="#fff" stroke-width="40" paint-order="stroke" font-family="Inter Variable, sans-serif">
            {el.label || formatLength(w, units, lang.value)}
          </text>
        </g>
      )}
      {sev && (
        <g class="detail" transform={`translate(${box.x1 - el.x + 130} ${box.y0 - el.y - 130})`} aria-hidden="true">
          {sev === 'error' ? <circle r="150" fill={BADGE[sev]} /> : sev === 'warning' ? <path d="M0 -170L165 130H-165Z" fill={BADGE[sev]} /> : <rect x="-130" y="-130" width="260" height="260" rx="40" fill={BADGE[sev]} />}
          <text y="75" text-anchor="middle" font-size="210" font-weight="700" fill="#fff" font-family="Inter Variable, sans-serif">
            {sev === 'tip' ? 'i' : '!'}
          </text>
        </g>
      )}
      {!isText && !isDim && el.label && labels && (
        <text class="detail" x={0} y={box.y1 - el.y + 190} text-anchor="middle" font-size="170" fill="#000" font-family="Inter Variable, sans-serif">
          {el.label}
        </text>
      )}
    </g>
  );
});

/** The imported PDF or DXF, drawn over the stage floor and under everything else. */
function BackgroundImage({ show }: { show: Show }) {
  const bg = show.stage.background;
  const layer = show.layers.find((l) => l.subject === 'background');
  const s = session.value;
  if (!bg || !s || layer?.visible === false) return null;
  const url = s.imageUrl(bg.file);
  const size = pngSize(s.imageBytes(bg.file) ?? new Uint8Array());
  if (!url || !size) return null;
  const off = bgDrag.value;
  return <image href={url} x={bg.x + (off?.dx ?? 0)} y={bg.y + (off?.dy ?? 0)} width={size.w * bg.scale} height={size.h * bg.scale} opacity={bg.opacity * (1 - (layer?.dim ?? 0) * 0.7)} preserveAspectRatio="none" aria-hidden="true" pointer-events="none" />;
}

/** The point being dragged and where it is now, so the stage follows the pointer before the change is made. */
const vertexDrag = signal<{ index: number; x: number; y: number } | null>(null);

function Stage({ show }: { show: Show }) {
  const drag = vertexDrag.value;
  const live = drag && show.stage.shape.kind === 'polygon' ? { ...show, stage: { ...show.stage, shape: { ...show.stage.shape, points: show.stage.shape.points.map((p, i) => (i === drag.index ? { x: drag.x, y: drag.y } : p)) } } } : show;
  const sh = live.stage.shape;
  const ref = show.stage.referenceLines;
  const f = stageFrame(live);
  const common = { fill: '#f1f1ee', stroke: '#000', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' } as const;
  return (
    <g aria-hidden="true">
      {sh.kind === 'rect' ? <rect x={0} y={0} width={sh.width} height={sh.depth} {...common} /> : <polygon points={sh.points.map((p) => `${p.x},${p.y}`).join(' ')} {...common} />}
      {ref.plaster && <line x1={f.x0 - 300} y1={f.downstage} x2={f.x1 + 300} y2={f.downstage} stroke="#000" stroke-width="1" stroke-dasharray="14 6 2 6" vector-effect="non-scaling-stroke" />}
      {ref.proscenium && prosceniumWalls(f.width, f.opening).map(([a, b]) => <line key={a} x1={f.x0 + a} y1={f.downstage} x2={f.x0 + b} y2={f.downstage} stroke="#000" stroke-width="4" vector-effect="non-scaling-stroke" />)}
      {ref.center && <line x1={f.centre} y1={f.upstage} x2={f.centre} y2={f.downstage + 300} stroke="#000" stroke-width="1" stroke-dasharray="14 6 2 6" vector-effect="non-scaling-stroke" />}
    </g>
  );
}

/** Handles on the points of a free-form stage: drag or use the arrows to move one, Delete to remove it, and the small ones to add a point on a side. */
function StageHandles({ show, cam }: { show: Show; cam: Signal<Camera> }) {
  if (!stageEdit.value || show.stage.shape.kind !== 'polygon') return null;
  const drag = vertexDrag.value;
  const pts = stagePoints(show).map((p, i) => (drag && drag.index === i ? { x: drag.x, y: drag.y } : p));
  const k = cam.value.k;
  const r = 14 / k; // handles keep their size on screen at any zoom, and at least 24 px across
  const keyStep = (e: KeyboardEvent): number => (e.shiftKey ? 10 : 1) * (show.view.grid ? show.view.gridMm : 100);
  return (
    <g>
      {pts.map((a, i) => {
        const b = pts[(i + 1) % pts.length]!;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g
            key={`m${i}`}
            data-mid={i}
            role="button"
            tabindex={0}
            class="vtx mid"
            aria-label={t('stage.addPoint', { n: i + 1 })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                addStagePointAfter(i);
              }
            }}
          >
            <circle cx={mx} cy={my} r={r * 0.86} />
            <path d={`M${mx - r * 0.45} ${my}h${r * 0.9}M${mx} ${my - r * 0.45}v${r * 0.9}`} />
          </g>
        );
      })}
      {pts.map((p, i) => (
        <g
          key={`v${i}`}
          data-vtx={i}
          role="button"
          tabindex={0}
          class="vtx"
          aria-label={t('stage.point', { n: i + 1, x: formatLength(p.x, show.units, lang.value), y: formatLength(p.y, show.units, lang.value) })}
          onKeyDown={(e) => {
            const s = keyStep(e);
            const move = (dx: number, dy: number) => {
              e.preventDefault();
              e.stopPropagation();
              moveStagePointTo(i, p.x + dx, p.y + dy);
            };
            if (e.key === 'ArrowLeft') move(-s, 0);
            else if (e.key === 'ArrowRight') move(s, 0);
            else if (e.key === 'ArrowUp') move(0, -s);
            else if (e.key === 'ArrowDown') move(0, s);
            else if (e.key === 'Delete' || e.key === 'Backspace') {
              e.preventDefault();
              e.stopPropagation();
              deleteStagePoint(i);
            }
          }}
        >
          <circle cx={p.x} cy={p.y} r={r} />
          <text x={p.x} y={p.y} dy="0.34em" text-anchor="middle" font-size={r * 1.15}>
            {i + 1}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Mounting positions: bars and pipes as thick lines with their name, floor positions dotted. */
function Mounts({ show }: { show: Show }) {
  const visible = show.layers.find((l) => l.subject === 'lights')?.visible ?? true;
  const list = Object.values(show.mounts);
  if (!visible || list.length === 0) return null;
  return (
    <g aria-hidden="true" pointer-events="none">
      {list.map((m) => {
        const floor = m.kind === 'floor';
        return (
          <g key={m.id}>
            <line x1={m.from.x} y1={m.from.y} x2={m.to.x} y2={m.to.y} stroke="#555" stroke-width={floor ? 2 : 4} stroke-dasharray={floor ? '2 6' : m.kind === 'truss' ? '12 4' : undefined} vector-effect="non-scaling-stroke" />
            {(
              <text class="detail" x={Math.min(m.from.x, m.to.x) - 60} y={(m.from.y + m.to.y) / 2 + 55} text-anchor="end" font-size="170" fill="#444" stroke="#fff" stroke-width="40" paint-order="stroke" font-family="Inter Variable, sans-serif">
                {m.name}
              </text>
            )}
          </g>
        );
      })}
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
              {c.connector && (
                <text class="detail" x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 60} text-anchor="middle" font-size="150" fill={st.stroke} stroke="#fff" stroke-width="40" paint-order="stroke" font-family="Inter Variable, sans-serif">
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

/** Where the selected luminaires point: a dashed line to the focus point, the beam as a wedge, and a handle to drag. */
function FocusOverlay({ show, ids, world }: { show: Show; ids: string[]; world: (e: { clientX: number; clientY: number }) => Pt }) {
  if (!(show.layers.find((l) => l.subject === 'lights')?.visible ?? true)) return null;
  const list = ids.map((id) => show.elements[id]).filter((e): e is PlanElement => !!e?.luminaire?.focus);
  if (list.length === 0) return null;
  return (
    <g>
      {list.map((e) => {
        const f = e.luminaire!.focus!;
        const beam = beamDegrees(e);
        const dx = f.x - e.x;
        const dy = f.y - e.y;
        const dist = Math.hypot(dx, dy) || 1;
        const half = beam ? dist * Math.tan(((beam / 2) * Math.PI) / 180) : 0;
        const nx = (-dy / dist) * half;
        const ny = (dx / dist) * half;
        const name = e.label || itemById(e.type.id)?.name[lang.value] || '';
        return (
          <g key={e.id}>
            {beam && <polygon points={`${e.x},${e.y} ${f.x + nx},${f.y + ny} ${f.x - nx},${f.y - ny}`} fill="rgba(11,110,120,0.13)" stroke="#0b6e78" stroke-width="1" vector-effect="non-scaling-stroke" pointer-events="none" aria-hidden="true" />}
            <line x1={e.x} y1={e.y} x2={f.x} y2={f.y} stroke="#0b6e78" stroke-width="1.5" stroke-dasharray="6 4" vector-effect="non-scaling-stroke" pointer-events="none" aria-hidden="true" />
            <g
              class="focus-handle"
              tabindex={0}
              role="button"
              aria-label={t('focus.handle', { name })}
              onPointerDown={(ev) => {
                ev.stopPropagation();
                (ev.currentTarget as Element).setPointerCapture?.(ev.pointerId);
              }}
              onPointerMove={(ev) => {
                if (!(ev.buttons & 1)) return;
                ev.stopPropagation();
                const w = world(ev);
                setFocusPoint(e.id, w);
              }}
              onKeyDown={(ev) => {
                const step = ev.shiftKey ? 1000 : 100;
                const d = ev.key === 'ArrowLeft' ? [-step, 0] : ev.key === 'ArrowRight' ? [step, 0] : ev.key === 'ArrowUp' ? [0, -step] : ev.key === 'ArrowDown' ? [0, step] : null;
                if (!d) return;
                ev.preventDefault();
                ev.stopPropagation();
                setFocusPoint(e.id, { x: f.x + d[0]!, y: f.y + d[1]! });
              }}
            >
              <circle cx={f.x} cy={f.y} r={260} fill="transparent" />
              <circle cx={f.x} cy={f.y} r={110} fill="#fff" stroke="#0b6e78" stroke-width="2.5" vector-effect="non-scaling-stroke" />
              <path d={`M${f.x - 200} ${f.y}H${f.x + 200}M${f.x} ${f.y - 200}V${f.y + 200}`} stroke="#0b6e78" stroke-width="1.5" vector-effect="non-scaling-stroke" />
            </g>
          </g>
        );
      })}
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
  links: 'M3 14L15 4M3 14h0M15 4h0',
  labels: 'M3 5h12M9 5v9M6 14h6',
  outlines: 'M3 3h3M8 3h2M12 3h3M15 3v3M15 8v2M15 12v3M3 15h3M8 15h2M12 15h3M3 3v3M3 8v2M3 12v3',
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

/** Asks for the real distance between the two clicked points and rescales the background to match. */
function CalibrateBar({ measure, onDone }: { measure: Signal<Measure | null>; onDone: () => void }) {
  const [real, setReal] = useState('');
  const m = measure.value;
  const submit = (e: Event) => {
    e.preventDefault();
    if (!m?.b) return;
    const mm = Number(real.replace(',', '.')) * 1000;
    if (calibrateBackground(m.a, m.b, mm)) onDone();
  };
  return (
    <form class="planbar left" onSubmit={submit} aria-label={t('bg.calibrate')}>
      {m?.done && m.b ? (
        <>
          <label class="pad-s">
            {t('bg.distance')}
            <input class="input mono" style="width:90px;margin-left:8px" inputMode="decimal" value={real} onInput={(e) => setReal((e.currentTarget as HTMLInputElement).value)} />
          </label>
          <button type="submit" class="btn primary" disabled={!(Number(real.replace(',', '.')) > 0)}>
            {t('bg.apply')}
          </button>
        </>
      ) : (
        <span class="pad-s" role="status">
          {t('bg.pick')}
        </span>
      )}
      <button type="button" class="btn" onClick={onDone}>
        {t('settings.cancel')}
      </button>
    </form>
  );
}

type Interaction =
  | { kind: 'pan'; sx: number; sy: number; cam: Camera; tap?: boolean; moved?: boolean }
  | { kind: 'drag'; ids: string[]; hitId: string; p0: Pt; w0: Pt; sx: number; sy: number; moved: boolean; shift: boolean; wasMulti: boolean }
  | { kind: 'marquee'; sx: number; sy: number; add: boolean; base: string[] }
  | { kind: 'bgdrag'; w0: Pt; x0: number; y0: number }
  | { kind: 'vertex'; index: number };

/** How far the background has been dragged while the mouse is still down; written to the show on release. */
const bgDrag = signal<{ dx: number; dy: number } | null>(null);

/** Keeps the pointer events coming to the plan while a finger or the mouse moves outside it; some environments refuse, and nothing depends on it. */
const capture = (el: Element, id: number) => {
  try {
    el.setPointerCapture(id);
  } catch {
    // The pointer is already gone or never existed (a synthetic event): the gesture still works inside the plan.
  }
};

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

  // While a zoom or pinch runs, the plan carries a class that swaps every element for its plain box: one style change, no re-render.
  useEffect(
    () =>
      effect(() => {
        svgRef.current?.classList.toggle('gesture', gesture.value);
      }),
    [],
  );
  const fitReq = fitRequest.value;
  const lod = useRef(false);
  const showRef = useRef(show);
  showRef.current = show;
  const fitted = useRef(false);
  const space = useRef(false);
  const timer = useRef(0);
  const act = useRef<Interaction | null>(null);
  // Fingers on the screen: a second one turns whatever was going on into a pinch (zoom and pan together).
  const pointers = useRef(new Map<number, Pt>());
  const pinch = useRef<{ d0: number; cam: Camera; c0: Pt; w0: Pt } | null>(null);

  // The camera the app set itself by fitting; while it is still the camera in use, a new size fits again.
  const autoCam = useRef<Camera | null>(null);
  // Room taken at the bottom by the zoom bar and the Library / Inspector buttons, so the plan is not fitted under them.
  const bottomInset = (): number => {
    const node = wrap.current;
    if (!node) return 0;
    const r = node.getBoundingClientRect();
    let bottom = 0;
    for (const el of document.querySelectorAll('.planbar.bottom, .fabs')) {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && b.height > 0 && b.top < r.bottom && b.bottom > r.top && b.left < r.right && b.right > r.left) bottom = Math.max(bottom, r.bottom - b.top);
    }
    return Math.min(bottom, r.height * 0.5);
  };

  const fit = () => {
    const { w, h } = size.peek();
    if (w <= 0) return;
    let box = planBox(showRef.current);
    const bg = showRef.current.stage.background;
    const dims = bg ? pngSize(session.value?.imageBytes(bg.file) ?? new Uint8Array()) : null;
    if (bg && dims) box = unionBox([box, { x0: bg.x, y0: bg.y, x1: bg.x + dims.w * bg.scale, y1: bg.y + dims.h * bg.scale }])!;
    cam.value = fitCamera(box, w, h, 32, { top: 0, left: 0, right: 0, bottom: bottomInset() });
    autoCam.current = cam.peek();
  };

  // A new background asks for the view to fit the plan and the image.
  useEffect(() => {
    if (fitReq > 0) fit();
  }, [fitReq]);

  // Size of the drawing area; the first measurement fits the plan.
  useEffect(() => {
    const node = wrap.current!;
    const ro = new ResizeObserver(() => {
      const r = node.getBoundingClientRect();
      size.value = { w: r.width, h: r.height };
      if (r.width <= 0) return;
      if (!fitted.current) {
        fitted.current = true;
        fit();
      } else if (cam.peek() === autoCam.current) fit(); // turned the phone, resized the window: still the fitted view

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
    if (lod.current) {
      gesture.value = true;
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => (gesture.value = false), 140);
    }
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
      if ((e.target as Element | null)?.closest?.('[data-vtx], [data-mid]') && e.key !== 'Escape') return;
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
        stopStageEdit();
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
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2) {
      capture(svg, e.pointerId);
      act.current = null;
      batch(() => {
        marquee.value = null;
        dragIds.value = null;
        dragDelta.value = { dx: 0, dy: 0 };
      });
      const [a, b] = [...pointers.current.values()] as [Pt, Pt];
      const c0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      pinch.current = { d0: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), cam: cam.peek(), c0, w0: toWorld(cam.peek(), c0.x, c0.y) };
      return;
    }
    if (pointers.current.size > 2) return;
    const mode = e.button === 1 || space.current || tool.value === 'pan' ? 'pan' : tool.value;
    const s = showRef.current;
    if (mode === 'pan') {
      e.preventDefault();
      capture(svg, e.pointerId);
      act.current = { kind: 'pan', sx: p.x, sy: p.y, cam: cam.peek() };
    } else if (mode === 'bgmove') {
      const bg = s.stage.background;
      if (bg && !bg.locked) {
        capture(svg, e.pointerId);
        act.current = { kind: 'bgdrag', w0: world(e), x0: bg.x, y0: bg.y };
      }
    } else if (mode === 'measure' || mode === 'background') {
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
    } else if (mode === 'select' && stageEdit.peek() && (e.target as Element).closest('[data-vtx], [data-mid]')) {
      const hit = (e.target as Element).closest('[data-vtx], [data-mid]')!;
      if (hit.hasAttribute('data-mid')) addStagePointAfter(Number(hit.getAttribute('data-mid')));
      else {
        const index = Number(hit.getAttribute('data-vtx'));
        const pt = stagePoints(s)[index];
        if (pt) {
          capture(svg, e.pointerId);
          vertexDrag.value = { index, x: pt.x, y: pt.y };
          act.current = { kind: 'vertex', index };
        }
      }
    } else if (mode === 'select') {
      const id = (e.target as Element).closest('[data-id]')?.getAttribute('data-id');
      const el = id ? s.elements[id] : undefined;
      capture(svg, e.pointerId);
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
        // A finger on the background pans; a tap that does not move lets go of the selection. A mouse draws a marquee.
        if (e.pointerType === 'touch') act.current = { kind: 'pan', sx: p.x, sy: p.y, cam: cam.peek(), tap: true };
        else act.current = { kind: 'marquee', sx: p.x, sy: p.y, add: e.shiftKey, base: selection.peek() };
        marquee.value = null;
      }
    }
  };

  const onMove = (e: PointerEvent) => {
    const p = local(e);
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, p);
    const pz = pinch.current;
    if (pz && pointers.current.size >= 2) {
      const [a1, b1] = [...pointers.current.values()] as [Pt, Pt];
      const k = clampK(pz.cam.k * (Math.hypot(a1.x - b1.x, a1.y - b1.y) / pz.d0));
      const c = { x: (a1.x + b1.x) / 2, y: (a1.y + b1.y) / 2 };
      cam.value = { k, x: c.x - pz.w0.x * k, y: c.y - pz.w0.y * k };
      if (lod.current) {
        gesture.value = true;
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => (gesture.value = false), 140);
      }
      return;
    }
    const a = act.current;
    if (!a) {
      if (linkFrom.peek()) cursor.value = toWorld(cam.peek(), p.x, p.y);
      const m = measure.peek();
      if (m && !m.done && (tool.peek() === 'measure' || tool.peek() === 'background')) {
        const w = toWorld(cam.peek(), p.x, p.y);
        const st = e.altKey ? 0 : gridStep();
        measure.value = { ...m, b: { x: snap(w.x, st), y: snap(w.y, st) } };
      }
      return;
    }
    if (a.kind === 'pan') {
      if (Math.hypot(p.x - a.sx, p.y - a.sy) >= 4) a.moved = true;
      cam.value = { ...a.cam, x: a.cam.x + p.x - a.sx, y: a.cam.y + p.y - a.sy };
    }
    else if (a.kind === 'vertex') {
      const w = world(e);
      const st = e.altKey ? 0 : gridStep();
      vertexDrag.value = { index: a.index, x: snap(w.x, st), y: snap(w.y, st) };
    } else if (a.kind === 'bgdrag') {
      const w = world(e);
      bgDrag.value = { dx: Math.round(w.x - a.w0.x), dy: Math.round(w.y - a.w0.y) };
    } else if (a.kind === 'drag') {
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
        if (dragIds.peek() === null) {
          dragIds.value = a.ids;
          if (lod.current) gesture.value = true;
        }
        dragDelta.value = { dx, dy };
      });
    } else if (a.kind === 'marquee') {
      if (marquee.peek() || Math.hypot(p.x - a.sx, p.y - a.sy) >= 4) marquee.value = { x0: a.sx, y0: a.sy, x1: p.x, y1: p.y };
    }
  };

  const finish = (cancelled: boolean, pointerId: number) => {
    pointers.current.delete(pointerId);
    if (pinch.current) {
      if (pointers.current.size < 2) pinch.current = null;
      return;
    }
    const a = act.current;
    act.current = null;
    if (!a) return;
    const s = showRef.current;
    if (a.kind === 'pan' && a.tap && !a.moved && !cancelled) selection.value = [];
    if (a.kind === 'vertex') {
      const d = vertexDrag.peek();
      vertexDrag.value = null;
      if (d && !cancelled) moveStagePointTo(d.index, d.x, d.y);
    } else if (a.kind === 'bgdrag') {
      const d = bgDrag.peek();
      bgDrag.value = null;
      if (d && !cancelled && (d.dx !== 0 || d.dy !== 0)) updateBackground({ x: a.x0 + d.dx, y: a.y0 + d.dy });
    } else if (a.kind === 'drag') {
      batch(() => {
        const d = dragDelta.peek();
        if (a.moved && !cancelled) commitDrag(a.ids, d.dx, d.dy);
        else if (!a.moved && !a.shift && a.wasMulti && !cancelled) selection.value = expandGroups(s, [a.hitId]);
        dragIds.value = null;
        dragDelta.value = { dx: 0, dy: 0 };
        if (lod.current) gesture.value = false;
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
  // The list is sorted errors first, so the first finding per element is its worst.
  const elementSev = new Map<string, Severity>();
  for (const i of issues.value) if (i.ref.kind === 'element' && !elementSev.has(i.ref.id)) elementSev.set(i.ref.id, i.severity);
  const dragSet = dragIds.value ? new Set(dragIds.value) : null;
  const rows = Object.values(show.elements)
    .filter((e) => layers.get(e.layerId)?.visible)
    .sort((a, b) => (layerIndex.get(a.layerId) ?? 0) - (layerIndex.get(b.layerId) ?? 0));
  const mk = (e: PlanElement) => {
    const l = layers.get(e.layerId)!;
    return <PlanEl key={e.id} el={e} selected={sel.has(e.id)} locked={l.locked} dim={l.dim ?? 0} sev={elementSev.get(e.id) ?? null} />;
  };
  lod.current = rows.length > LOD_MIN;
  const iconKeys = [...new Set(rows.map((e) => iconKeyOf(e.type.id)).filter((k): k is string => !!k))].join(',');
  useEffect(() => {
    if (iconKeys) void loadIcons(iconKeys.split(','));
  }, [iconKeys]);
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
    <div
      class="plan"
      ref={wrap}
      onDragOver={(e) => {
        if (e.dataTransfer?.types.includes(LIBRARY_DRAG)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={(e) => {
        const itemId = e.dataTransfer?.getData(LIBRARY_DRAG);
        if (!itemId) return;
        e.preventDefault();
        addFromLibrary(itemId, world(e));
      }}
    >
      <svg
        ref={svgRef}
        class={`plansvg${isPan ? ' pan' : mode === 'measure' || mode === 'text' ? ' cross' : ''}`}
        role="group"
        aria-label={t('canvas.alt', { n: rows.length })}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={(e) => finish(false, e.pointerId)}
        onPointerCancel={(e) => finish(true, e.pointerId)}
      >
        {show.view.grid && <Grid cam={cam} size={size} stepMm={show.view.gridMm} />}
        <g transform={camT}>
          <Stage show={show} />
          <BackgroundImage show={show} />
          <Mounts show={show} />
          {show.view.links && <Connections show={show} hidden={dragSet ?? new Set()} />}
          <g>{resting}</g>
          <g class="moving" transform={dragT}>
            {moving}
          </g>
          <FocusOverlay show={show} ids={selection.value} world={world} />
          <StageHandles show={show} cam={cam} />
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
      {mode === 'measure' && measure.value?.done && measure.value.b && (
        <div class="planbar left" role="group" aria-label={t('plan.measureBar')}>
          <button
            type="button"
            class="btn primary"
            onClick={() => {
              const m = measure.peek();
              if (m?.b) addDimension(m.a, m.b);
              measure.value = null;
              tool.value = 'select';
            }}
          >
            {t('plan.dimension.fix')}
          </button>
        </div>
      )}
      {mode === 'bgmove' && (
        <div class="planbar left" role="group" aria-label={t('bg.move')}>
          <span class="pad-s" role="status">
            {t('bg.moveHint')}
          </span>
          <button type="button" class="btn primary" onClick={() => (tool.value = 'select')}>
            {t('bg.moveDone')}
          </button>
        </div>
      )}
      {mode === 'background' && (
        <CalibrateBar
          measure={measure}
          onDone={() => {
            measure.value = null;
            tool.value = 'select';
          }}
        />
      )}
      <div class="planbar top" role="toolbar" aria-label={t('align.label')} hidden={count === 0}>
        <Btn icon="rotate" label={`${t('plan.rotate')} (R)`} onClick={() => rotateSelection(15)} />
        <Btn icon="flip" label={`${t('plan.flip')} (F)`} onClick={() => flipSelection('x')} />
        <Btn icon="duplicate" label={`${t('plan.duplicate')} (Ctrl+D)`} onClick={() => duplicateSelection(show.view.grid ? show.view.gridMm : 500)} />
        <Btn icon={grouped ? 'ungroup' : 'group'} label={grouped ? `${t('plan.ungroup')} (Ctrl+${t('key.shift')}+G)` : `${t('plan.group')} (Ctrl+G)`} disabled={!grouped && count < 2} onClick={() => (grouped ? ungroupSelection() : groupSelection())} />
        <Btn icon="trash" label={`${t('plan.delete')} (${t('key.del')})`} onClick={() => deleteSelection()} />
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
        <Btn icon="links" label={t('plan.links')} pressed={show.view.links} onClick={() => setLinks(!show.view.links)} />
        <Btn icon="labels" label={t('plan.labels')} pressed={show.view.labels} onClick={() => setLabels(!show.view.labels)} />
        <Btn icon="outlines" label={t('plan.outlines')} pressed={show.view.outlines} onClick={() => setOutlines(!show.view.outlines)} />
        <ScaleBar cam={cam} units={show.units} />
      </div>
    </div>
  );
}
