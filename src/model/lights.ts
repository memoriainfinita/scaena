// Light plot data: luminaires, mounting positions, numbering and the electrical load derived from them.
import { fixtureById } from '../library/models.ts';
import { nextId } from './ids.ts';
import type { Luminaire, Mount, PlanElement, Show, WorkNote } from './schema.ts';

export const emptyLuminaire = (): Luminaire => ({ mountId: null, unit: null, channel: null, dimmer: null, circuit: null, universe: null, address: null, color: '', modelId: null, accessories: [], focus: null, notes: '' });

/** The elements that are luminaires, in creation order. */
export const luminaires = (show: Show): PlanElement[] => Object.values(show.elements).filter((e) => e.luminaire);

export const mountList = (show: Show): Mount[] => Object.values(show.mounts).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));

export function addMount(show: Show, init: Pick<Mount, 'kind' | 'name' | 'from' | 'to'> & Partial<Mount>): [Show, Mount] {
  const [id, s] = nextId(show, 'm');
  const m: Mount = { heightMm: 0, maxLoadKg: null, ...init, id };
  return [{ ...s, mounts: { ...s.mounts, [id]: m } }, m];
}

export function updateMount(show: Show, id: string, patch: Partial<Omit<Mount, 'id'>>): Show {
  const m = show.mounts[id];
  return m ? { ...show, mounts: { ...show.mounts, [id]: { ...m, ...patch } } } : show;
}

/** Removes a mount; the luminaires that hung from it stay on the plan, unmounted. */
export function removeMount(show: Show, id: string): Show {
  if (!show.mounts[id]) return show;
  const mounts = Object.fromEntries(Object.entries(show.mounts).filter(([k]) => k !== id));
  const elements = Object.fromEntries(Object.entries(show.elements).map(([k, e]) => [k, e.luminaire?.mountId === id ? { ...e, luminaire: { ...e.luminaire, mountId: null } } : e]));
  return { ...show, mounts, elements };
}

export function updateLuminaire(show: Show, id: string, patch: Partial<Luminaire>): Show {
  const e = show.elements[id];
  if (!e?.luminaire) return show;
  return { ...show, elements: { ...show.elements, [id]: { ...e, luminaire: { ...e.luminaire, ...patch } } } };
}

/** Sets the fixture model; weight and power start from the model's when it has them, and stay as they were when not. */
export function setFixtureModel(show: Show, id: string, model: { id: string; weightKg: number | null; powerW: number | null } | null): Show {
  const e = show.elements[id];
  if (!e?.luminaire) return show;
  const next: PlanElement = { ...e, luminaire: { ...e.luminaire, modelId: model?.id ?? null } };
  if (model) {
    if (model.weightKg !== null) next.weightKg = model.weightKg;
    if (model.powerW !== null) next.powerW = model.powerW;
  }
  return { ...show, elements: { ...show.elements, [id]: next } };
}

/** Numbers the luminaires 1..n by mount (in the order the mounts were created) and then from left to right and back to front. */
export function autoNumber(show: Show): Show {
  const mountIndex = new Map(mountList(show).map((m, i) => [m.id, i]));
  const order = luminaires(show).sort((a, b) => {
    const ma = a.luminaire!.mountId === null ? Infinity : (mountIndex.get(a.luminaire!.mountId!) ?? Infinity);
    const mb = b.luminaire!.mountId === null ? Infinity : (mountIndex.get(b.luminaire!.mountId!) ?? Infinity);
    return ma - mb || a.x - b.x || a.y - b.y;
  });
  let s = show;
  order.forEach((e, i) => (s = updateLuminaire(s, e.id, { unit: i + 1 })));
  return s;
}

export interface MountStat {
  mountId: string | null;
  count: number;
  weightKg: number;
  powerW: number;
  maxLoadKg: number | null;
  overloaded: boolean;
}

/** Count, weight and power per mount, plus the unmounted ones last. Empty weights count as zero. */
export function mountStats(show: Show): MountStat[] {
  const rows: MountStat[] = mountList(show).map((m) => ({ mountId: m.id, count: 0, weightKg: 0, powerW: 0, maxLoadKg: m.maxLoadKg, overloaded: false }));
  const none: MountStat = { mountId: null, count: 0, weightKg: 0, powerW: 0, maxLoadKg: null, overloaded: false };
  for (const e of luminaires(show)) {
    const row = rows.find((r) => r.mountId === e.luminaire!.mountId) ?? none;
    row.count++;
    row.weightKg += e.weightKg ?? 0;
    row.powerW += e.powerW ?? 0;
  }
  for (const r of rows) r.overloaded = r.maxLoadKg !== null && r.weightKg > r.maxLoadKg;
  return none.count > 0 ? [...rows, none] : rows;
}

export interface CircuitLoad {
  circuit: number;
  count: number;
  powerW: number;
  amps: number;
  phase: number | null;
}

const amps = (w: number, voltage: number) => (voltage > 0 ? Math.round((w / voltage) * 100) / 100 : 0);

/** Load per circuit number used by the luminaires, with the phase the user assigned to it. */
export function circuitLoads(show: Show): CircuitLoad[] {
  const byCircuit = new Map<number, { count: number; powerW: number }>();
  for (const e of luminaires(show)) {
    const c = e.luminaire!.circuit;
    if (c === null) continue;
    const row = byCircuit.get(c) ?? { count: 0, powerW: 0 };
    row.count++;
    row.powerW += e.powerW ?? 0;
    byCircuit.set(c, row);
  }
  return [...byCircuit.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([circuit, r]) => ({ circuit, count: r.count, powerW: r.powerW, amps: amps(r.powerW, show.region.voltage), phase: show.electrical.circuits.find((x) => x.number === circuit)?.phase ?? null }));
}

export interface DimmerLoad {
  dimmer: number;
  count: number;
  powerW: number;
  maxW: number | null;
  overloaded: boolean;
}

export function dimmerLoads(show: Show): DimmerLoad[] {
  const byDimmer = new Map<number, { count: number; powerW: number }>();
  for (const e of luminaires(show)) {
    const d = e.luminaire!.dimmer;
    if (d === null) continue;
    const row = byDimmer.get(d) ?? { count: 0, powerW: 0 };
    row.count++;
    row.powerW += e.powerW ?? 0;
    byDimmer.set(d, row);
  }
  return [...byDimmer.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([dimmer, r]) => {
      const maxW = show.electrical.dimmers.find((x) => x.number === dimmer)?.maxW ?? null;
      return { dimmer, count: r.count, powerW: r.powerW, maxW, overloaded: maxW !== null && r.powerW > maxW };
    });
}

export interface PhaseLoad {
  phase: number | null;
  powerW: number;
  amps: number;
}

/** Power per phase from the circuits; circuits with no phase are grouped under null. */
export function phaseLoads(show: Show): PhaseLoad[] {
  const by = new Map<number | null, number>();
  for (const c of circuitLoads(show)) by.set(c.phase, (by.get(c.phase) ?? 0) + c.powerW);
  return [...by.entries()].sort((a, b) => (a[0] ?? Infinity) - (b[0] ?? Infinity)).map(([phase, powerW]) => ({ phase, powerW, amps: amps(powerW, show.region.voltage) }));
}

export function setCircuitPhase(show: Show, circuit: number, phase: number | null): Show {
  const existing = show.electrical.circuits.find((c) => c.number === circuit);
  if (existing) return { ...show, electrical: { ...show.electrical, circuits: show.electrical.circuits.map((c) => (c === existing ? { ...c, phase } : c)) } };
  const [id, s] = nextId(show, 'ci');
  return { ...s, electrical: { ...s.electrical, circuits: [...s.electrical.circuits, { id, number: circuit, dimmerId: null, phase }] } };
}

export function setDimmerMax(show: Show, number: number, maxW: number | null): Show {
  const existing = show.electrical.dimmers.find((d) => d.number === number);
  if (existing) return { ...show, electrical: { ...show.electrical, dimmers: show.electrical.dimmers.map((d) => (d === existing ? { ...d, maxW } : d)) } };
  const [id, s] = nextId(show, 'di');
  return { ...s, electrical: { ...s.electrical, dimmers: [...s.electrical.dimmers, { id, number, maxW }] } };
}

/** The breaker of phase `phase` (named L1, L2, L3), in amps; null clears it. */
export function setPhaseBreaker(show: Show, phase: number, breakerA: number | null): Show {
  const name = `L${phase}`;
  const existing = show.electrical.phases.find((p) => p.name === name);
  if (existing) return { ...show, electrical: { ...show.electrical, phases: show.electrical.phases.map((p) => (p === existing ? { ...p, breakerA } : p)) } };
  const [id, s] = nextId(show, 'ph');
  return { ...s, electrical: { ...s.electrical, phases: [...s.electrical.phases, { id, name, breakerA }] } };
}

/** The lens angle of a luminaire in degrees (the widest of a range), or null when it has no known model. */
export function beamDegrees(el: PlanElement): number | null {
  const f = el.luminaire?.modelId ? fixtureById(el.luminaire.modelId) : undefined;
  const nums = (f?.beam.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => Number(x.replace(',', '.')));
  return nums.length > 0 ? Math.max(...nums) : null;
}

/** Where a luminaire points by default when the user asks for a focus point: the middle of the stage. */
export function defaultFocus(show: Show): { x: number; y: number } {
  const sh = show.stage.shape;
  return sh.kind === 'rect' ? { x: Math.round(sh.width / 2), y: Math.round(sh.depth / 2) } : { x: 0, y: 0 };
}

/** Work notes: the to-do list of the light plot (refocus this, swap that colour), optionally tied to an element. */
export function addWorkNote(show: Show, text: string, refId: string | null = null): [Show, WorkNote] {
  const [id, s] = nextId(show, 'wn');
  const note: WorkNote = { id, text: text.slice(0, 2000), done: false, refId: refId && show.elements[refId] ? refId : null };
  return [{ ...s, workNotes: [...s.workNotes, note] }, note];
}

export function updateWorkNote(show: Show, id: string, patch: Partial<Omit<WorkNote, 'id'>>): Show {
  return { ...show, workNotes: show.workNotes.map((n) => (n.id === id ? { ...n, ...patch, text: patch.text === undefined ? n.text : patch.text.slice(0, 2000) } : n)) };
}

export const removeWorkNote = (show: Show, id: string): Show => ({ ...show, workNotes: show.workNotes.filter((n) => n.id !== id) });

export interface RiggingGroup {
  mount: Mount | null;
  /** Instruments hung there, left to right as seen from the audience. */
  lights: PlanElement[];
  weightKg: number;
  powerW: number;
}

/** The hanging plot: the instruments of each mounting position in hanging order, with the totals a rigger reads. */
export function riggingPlan(show: Show): RiggingGroup[] {
  const lum = luminaires(show);
  const groups: RiggingGroup[] = mountList(show).map((m) => ({ mount: m, lights: lum.filter((e) => e.luminaire!.mountId === m.id), weightKg: 0, powerW: 0 }));
  const loose = lum.filter((e) => !e.luminaire!.mountId || !show.mounts[e.luminaire!.mountId]);
  if (loose.length > 0) groups.push({ mount: null, lights: loose, weightKg: 0, powerW: 0 });
  for (const g of groups) {
    g.lights.sort((a, b) => a.x - b.x || a.id.localeCompare(b.id, 'en', { numeric: true }));
    g.weightKg = g.lights.reduce((a, e) => a + (e.weightKg ?? 0), 0);
    g.powerW = g.lights.reduce((a, e) => a + (e.powerW ?? 0), 0);
  }
  return groups.filter((g) => g.lights.length > 0 || g.mount !== null);
}
