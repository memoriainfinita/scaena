// Edits of the production data: setlist, schedules, hospitality, contract and event facts. Each is one undo step.
import { signal } from '@preact/signals';
import { applyBackwards, addSlot, addSong, type BackwardRow, type Milestone, moveSong, parseDuration, removeSlot, removeSong, updateSlot, updateSong } from '../model/production.ts';
import type { Contract, EventInfo, Hospitality, SetlistItem, Show } from '../model/schema.ts';
import { session } from './state.ts';

export type ProdTab = 'setlist' | 'schedule' | 'build' | 'hospitality' | 'contract' | 'event';
export const prodTab = signal<ProdTab>('setlist');

type Slot = Show['schedule'][number];
const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

export const addSongRow = (): void => commit((show) => addSong(show)[0]);
export const setSong = (id: string, patch: Partial<Omit<SetlistItem, 'id'>>): void => commit((show) => updateSong(show, id, patch));
/** Sets the length from what the user typed ("4:30", "4.5", "270s"); returns false and changes nothing when it is not a length. */
export function setSongLength(id: string, text: string): boolean {
  const seconds = parseDuration(text);
  if (seconds === null) return false;
  setSong(id, { seconds });
  return true;
}
export const removeSongRow = (id: string): void => commit((show) => removeSong(show, id));
export const moveSongRow = (id: string, delta: -1 | 1): void => commit((show) => moveSong(show, id, delta));

export const addSlotRow = (kind: Slot['kind'], what = ''): void => commit((show) => addSlot(show, kind, what)[0]);
export const setSlot = (id: string, patch: Partial<Omit<Slot, 'id'>>): void => commit((show) => updateSlot(show, id, patch));
export const applyBackwardPlan = (rows: BackwardRow[], names: Record<Milestone, string>): void => commit((show) => applyBackwards(show, rows, names));
export const removeSlotRow = (id: string): void => commit((show) => removeSlot(show, id));

export const setHospitality = (patch: Partial<Hospitality>): void => commit((show) => ({ ...show, hospitality: { ...show.hospitality, ...patch } }));
export const setContract = (patch: Partial<Contract>): void => commit((show) => ({ ...show, contract: { ...show.contract, ...patch } }));
export const setEvent = (patch: Partial<EventInfo>): void => commit((show) => ({ ...show, event: { ...show.event, ...patch } }));
