// Pure operations on a show: each returns a new show and never mutates the old one.
import { nextId } from './ids.ts';
import type { Computer, PlanElement, Show } from './schema.ts';

/** A computer element with nothing filled in: it does sound until the user says otherwise. */
export const emptyComputer = (): Computer => ({ functions: ['sound'], os: 'other', programs: [], license: '', dongle: false, outputs: [] });

export type NewElement = Pick<PlanElement, 'type' | 'x' | 'y' | 'layerId'> & Partial<PlanElement>;

export function addElement(show: Show, init: NewElement): [Show, PlanElement] {
  if (!show.layers.some((l) => l.id === init.layerId)) throw new Error(`unknown layer ${init.layerId}`);
  const [id, s] = nextId(show, 'e');
  const el: PlanElement = {
    z: 0, rotation: 0, flipX: false, flipY: false, width: null, depth: null, height: null, label: '', groupId: null,
    suppliedBy: 'unset', notes: '', weightKg: null, powerW: null, phase: null, computer: null, luminaire: null, rack: null, ip: '',
    ...init, id,
  };
  return [{ ...s, elements: { ...s.elements, [id]: el } }, el];
}

export function updateElement(show: Show, id: string, patch: Partial<Omit<PlanElement, 'id'>>): Show {
  const el = show.elements[id];
  if (!el) throw new Error(`unknown element ${id}`);
  return { ...show, elements: { ...show.elements, [id]: { ...el, ...patch } } };
}

export function moveElements(show: Show, ids: string[], dx: number, dy: number): Show {
  const elements = { ...show.elements };
  for (const id of ids) {
    const el = elements[id];
    if (el) elements[id] = { ...el, x: el.x + dx, y: el.y + dy };
  }
  return { ...show, elements };
}

const filterRecord = <T>(rec: Record<string, T>, drop: (x: T) => boolean): Record<string, T> => Object.fromEntries(Object.entries(rec).filter(([, x]) => !drop(x)));

/** Removes the elements and everything that points at them: channels, outputs and connections. */
export function removeElements(show: Show, ids: string[]): Show {
  const gone = new Set(ids);
  return {
    ...show,
    elements: filterRecord(show.elements, (e) => gone.has(e.id)),
    channels: filterRecord(show.channels, (c) => c.sourceElementId !== null && gone.has(c.sourceElementId)),
    outputs: filterRecord(show.outputs, (o) => o.sourceElementId !== null && gone.has(o.sourceElementId)),
    connections: filterRecord(show.connections, (c) => gone.has(c.from) || gone.has(c.to)),
  };
}

export type SizeOf = (el: PlanElement) => { w: number; d: number };
export type AlignMode = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

const norm = (deg: number) => ((deg % 360) + 360) % 360;
const round = (v: number) => Math.round(v * 100) / 100;

function centroid(els: PlanElement[]): { x: number; y: number } {
  return { x: els.reduce((a, e) => a + e.x, 0) / els.length, y: els.reduce((a, e) => a + e.y, 0) / els.length };
}

/** Rotates the elements about the centre of the selection; each one turns by `deg` (clockwise on screen). */
export function rotateElements(show: Show, ids: string[], deg: number): Show {
  const els = ids.map((id) => show.elements[id]).filter((e): e is PlanElement => !!e);
  if (els.length === 0) return show;
  const c = centroid(els);
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const elements = { ...show.elements };
  for (const e of els) {
    const dx = e.x - c.x;
    const dy = e.y - c.y;
    elements[e.id] = { ...e, x: round(c.x + dx * cos - dy * sin), y: round(c.y + dx * sin + dy * cos), rotation: norm(round(e.rotation + deg)) };
  }
  return { ...show, elements };
}

/** Mirrors the selection across a vertical (`x`) or horizontal (`y`) axis through its centre. */
export function flipElements(show: Show, ids: string[], axis: 'x' | 'y'): Show {
  const els = ids.map((id) => show.elements[id]).filter((e): e is PlanElement => !!e);
  if (els.length === 0) return show;
  const c = centroid(els);
  const elements = { ...show.elements };
  for (const e of els) {
    elements[e.id] = axis === 'x' ? { ...e, x: round(2 * c.x - e.x), flipX: !e.flipX, rotation: norm(-e.rotation) } : { ...e, y: round(2 * c.y - e.y), flipY: !e.flipY, rotation: norm(-e.rotation) };
  }
  return { ...show, elements };
}

/** Copies the elements, offset by (dx, dy). Groups are copied as new groups. Channels, outputs and connections are not copied. */
export function duplicateElements(show: Show, ids: string[], dx: number, dy: number): [Show, string[]] {
  let s = show;
  const created: string[] = [];
  const groupMap = new Map<string, string>();
  for (const id of ids) {
    const src = show.elements[id];
    if (!src) continue;
    const [nid, n] = nextId(s, 'e');
    let groupId = src.groupId;
    if (groupId) {
      let g = groupMap.get(groupId);
      if (!g) {
        const [gid, n2] = nextId(n, 'g');
        g = gid;
        groupMap.set(groupId, g);
        s = n2;
      } else s = n;
      groupId = g;
    } else s = n;
    s = { ...s, elements: { ...s.elements, [nid]: { ...src, id: nid, x: src.x + dx, y: src.y + dy, groupId, label: src.label } } };
    created.push(nid);
  }
  return [s, created];
}

/** Puts the elements in one new group. Elements that were in other groups leave them. */
export function groupElements(show: Show, ids: string[]): [Show, string | null] {
  const els = ids.filter((id) => show.elements[id]);
  if (els.length < 2) return [show, null];
  const [gid, s] = nextId(show, 'g');
  const elements = { ...s.elements };
  for (const id of els) elements[id] = { ...elements[id]!, groupId: gid };
  return [{ ...s, elements }, gid];
}

export function ungroupElements(show: Show, ids: string[]): Show {
  const groups = new Set(ids.map((id) => show.elements[id]?.groupId).filter((g): g is string => !!g));
  if (groups.size === 0) return show;
  const elements = Object.fromEntries(Object.entries(show.elements).map(([id, e]) => [id, e.groupId && groups.has(e.groupId) ? { ...e, groupId: null } : e]));
  return { ...show, elements };
}

/** The ids plus every other member of the groups they belong to. */
export function expandGroups(show: Show, ids: string[]): string[] {
  const groups = new Set(ids.map((id) => show.elements[id]?.groupId).filter((g): g is string => !!g));
  if (groups.size === 0) return ids;
  const out = new Set(ids);
  for (const e of Object.values(show.elements)) if (e.groupId && groups.has(e.groupId)) out.add(e.id);
  return [...out];
}

/** Aligns the rotated bounding boxes of the elements to the edge or centre of the whole selection. */
export function alignElements(show: Show, ids: string[], mode: AlignMode, boxOf: (el: PlanElement) => { x0: number; y0: number; x1: number; y1: number }): Show {
  const els = ids.map((id) => show.elements[id]).filter((e): e is PlanElement => !!e);
  if (els.length < 2) return show;
  const boxes = els.map(boxOf);
  const x0 = Math.min(...boxes.map((b) => b.x0));
  const x1 = Math.max(...boxes.map((b) => b.x1));
  const y0 = Math.min(...boxes.map((b) => b.y0));
  const y1 = Math.max(...boxes.map((b) => b.y1));
  const elements = { ...show.elements };
  els.forEach((e, i) => {
    const b = boxes[i]!;
    let dx = 0;
    let dy = 0;
    if (mode === 'left') dx = x0 - b.x0;
    else if (mode === 'right') dx = x1 - b.x1;
    else if (mode === 'center') dx = (x0 + x1) / 2 - (b.x0 + b.x1) / 2;
    else if (mode === 'top') dy = y0 - b.y0;
    else if (mode === 'bottom') dy = y1 - b.y1;
    else dy = (y0 + y1) / 2 - (b.y0 + b.y1) / 2;
    elements[e.id] = { ...e, x: round(e.x + dx), y: round(e.y + dy) };
  });
  return { ...show, elements };
}

/** Spreads three or more elements so the gaps between their boxes are equal; the two outermost stay put. */
export function distributeElements(show: Show, ids: string[], axis: 'x' | 'y', boxOf: (el: PlanElement) => { x0: number; y0: number; x1: number; y1: number }): Show {
  const els = ids.map((id) => show.elements[id]).filter((e): e is PlanElement => !!e);
  if (els.length < 3) return show;
  const lo = (b: ReturnType<typeof boxOf>) => (axis === 'x' ? b.x0 : b.y0);
  const hi = (b: ReturnType<typeof boxOf>) => (axis === 'x' ? b.x1 : b.y1);
  const items = els.map((e) => ({ e, b: boxOf(e) })).sort((a, b) => lo(a.b) - lo(b.b));
  const first = items[0]!;
  const last = items[items.length - 1]!;
  const total = hi(last.b) - lo(first.b);
  const sizes = items.reduce((a, it) => a + (hi(it.b) - lo(it.b)), 0);
  const gap = (total - sizes) / (items.length - 1);
  const elements = { ...show.elements };
  let cursor = lo(first.b);
  for (const it of items) {
    const delta = cursor - lo(it.b);
    elements[it.e.id] = axis === 'x' ? { ...it.e, x: round(it.e.x + delta) } : { ...it.e, y: round(it.e.y + delta) };
    cursor += hi(it.b) - lo(it.b) + gap;
  }
  return { ...show, elements };
}

/** The first free spot at or after (x, y), stepping right and then down, so new elements do not pile up on one another. */
export function freeSpot(show: Show, x: number, y: number, step = 500, clearance = 300): { x: number; y: number } {
  const els = Object.values(show.elements);
  for (let k = 0; k < 60; k++) {
    const p = { x: x + (k % 6) * step, y: y + Math.floor(k / 6) * step };
    if (!els.some((e) => Math.abs(e.x - p.x) < clearance && Math.abs(e.y - p.y) < clearance)) return p;
  }
  return { x, y };
}

export function setModules(show: Show, modules: Show['modules']): Show {
  return { ...show, modules };
}
