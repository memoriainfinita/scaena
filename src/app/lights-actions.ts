// Edits of the light plot: each one is a single undo step.
import { autoAddress, setUniverseInfo } from '../model/dmx.ts';
import { signal } from '@preact/signals';
import { fixtureById } from '../library/models.ts';
import { addMount, addWorkNote, resetMagicLayout, setMagicPosition, removeWorkNote, updateWorkNote, autoNumber, removeMount, setCircuitPhase, setDimmerMax, setFixtureModel, setPhaseBreaker, updateLuminaire, updateMount } from '../model/lights.ts';
import { updateElement } from '../model/ops.ts';
import type { Luminaire, Mount, Show, UniverseInfo } from '../model/schema.ts';
import { selection, session } from './state.ts';

export type LightsTab = 'instruments' | 'mounts' | 'electrical' | 'section' | 'magic' | 'worknotes';
export const lightsTab = signal<LightsTab>('instruments');

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

export const setLuminaire = (id: string, patch: Partial<Luminaire>): void => commit((show) => updateLuminaire(show, id, patch));
export const setLuminaireModel = (id: string, modelId: string): void => commit((show) => setFixtureModel(show, id, modelId ? (fixtureById(modelId) ?? null) : null));
export const setElementNumber = (id: string, field: 'weightKg' | 'powerW', value: number | null): void => commit((show) => (show.elements[id] ? updateElement(show, id, { [field]: value }) : show));
/** The mains phase of a piece of equipment that is not a light; null clears it. */
export const setElementPhase = (id: string, phase: number | null): void => commit((show) => (show.elements[id] ? updateElement(show, id, { phase }) : show));
/** Sets or clears where a luminaire points, in plan millimetres. */
export const setFocusPoint = (id: string, p: { x: number; y: number } | null): void => commit((show) => updateLuminaire(show, id, { focus: p ? { x: Math.round(p.x / 10) * 10, y: Math.round(p.y / 10) * 10 } : null }));
/** Moves an instrument on the magic sheet only; each move is one undo step. */
export const setMagicPos = (id: string, p: { x: number; y: number }): void => commit((show) => setMagicPosition(show, id, p));
export const resetMagic = (): void => commit((show) => resetMagicLayout(show));
export const numberUnits = (): void => commit((show) => autoNumber(show));
export const addressDmx = (): void => commit((show) => autoAddress(show));
export const setUniverse = (universe: number, patch: Partial<UniverseInfo>): void => commit((show) => setUniverseInfo(show, universe, patch));

/** A new bar across the stage, a third of the way from the back; `name` is the already-translated default. */
export function addMountRow(name: string, kind: Mount['kind'] = 'bar'): string | null {
  let id: string | null = null;
  commit((show) => {
    const sh = show.stage.shape;
    const w = sh.kind === 'rect' ? sh.width : 8000;
    const d = sh.kind === 'rect' ? sh.depth : 5000;
    const y = Math.round(d / 3 + Object.keys(show.mounts).length * 600);
    const [next, m] = addMount(show, { kind, name, from: { x: 500, y }, to: { x: w - 500, y } });
    id = m.id;
    return next;
  });
  return id;
}
export const setMount = (id: string, patch: Partial<Omit<Mount, 'id'>>): void => commit((show) => updateMount(show, id, patch));
export const removeMountRow = (id: string): void => commit((show) => removeMount(show, id));

export const setPhase = (circuit: number, phase: number | null): void => commit((show) => setCircuitPhase(show, circuit, phase));
export const setBreaker = (phase: number, a: number | null): void => commit((show) => setPhaseBreaker(show, phase, a));
export const setDimmerMaxW = (dimmer: number, maxW: number | null): void => commit((show) => setDimmerMax(show, dimmer, maxW));

export function selectElement(id: string): void {
  if (session.value?.show.peek().elements[id]) selection.value = [id];
}

export const addNote = (text: string, refId: string | null = null): void => commit((show) => addWorkNote(show, text, refId)[0]);
export const setNote = (id: string, patch: Parameters<typeof updateWorkNote>[2]): void => commit((show) => updateWorkNote(show, id, patch));
export const removeNote = (id: string): void => commit((show) => removeWorkNote(show, id));
