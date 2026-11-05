// Edits of a rack and its devices: each one is a single undo step.
import { addRackSlot, makeRack, moveRackSlot, removeRackSlot, setRackUnits, updateRackSlot } from '../model/racks.ts';
import type { RackSlot, Show } from '../model/schema.ts';
import { session } from './state.ts';

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

export const buildRack = (id: string): void => commit((s) => makeRack(s, id));
export const rackUnits = (id: string, units: number): void => commit((s) => setRackUnits(s, id, units));
export const rackAdd = (id: string, name: string, u: number): void => commit((s) => addRackSlot(s, id, name, u));
export const rackSet = (id: string, slotId: string, patch: Partial<Omit<RackSlot, 'id'>>): void => commit((s) => updateRackSlot(s, id, slotId, patch));
export const rackRemove = (id: string, slotId: string): void => commit((s) => removeRackSlot(s, id, slotId));
export const rackMove = (id: string, slotId: string, delta: -1 | 1): void => commit((s) => moveRackSlot(s, id, slotId, delta));
