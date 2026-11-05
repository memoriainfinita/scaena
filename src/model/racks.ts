// Racks: the gear mounted in a rack, in rack units from the top. A builder for the technician, and a table for the rider.
import type { PlanElement, Rack, RackSlot, Show } from './schema.ts';

export const RACK_ITEM = 'rack.rack';
export const emptyRack = (): Rack => ({ units: 12, slots: [] });

/** Rack units taken by the devices in a rack. */
export const rackUsed = (rack: Rack): number => rack.slots.reduce((n, s) => n + s.u, 0);

export const racks = (show: Show): PlanElement[] => Object.values(show.elements).filter((e) => e.rack);

function withRack(show: Show, id: string, fn: (r: Rack) => Rack): Show {
  const el = show.elements[id];
  if (!el?.rack) return show;
  const next = fn(el.rack);
  return next === el.rack ? show : { ...show, elements: { ...show.elements, [id]: { ...el, rack: next } } };
}

export function makeRack(show: Show, id: string): Show {
  const el = show.elements[id];
  return el && !el.rack ? { ...show, elements: { ...show.elements, [id]: { ...el, rack: emptyRack() } } } : show;
}

export const setRackUnits = (show: Show, id: string, units: number): Show => withRack(show, id, (r) => ({ ...r, units: Math.min(60, Math.max(1, Math.round(units))) }));

export function addRackSlot(show: Show, id: string, name: string, u = 1): Show {
  return withRack(show, id, (r) => {
    const n = Math.max(0, ...r.slots.map((s) => Number(s.id.slice(1)) || 0)) + 1;
    const slot: RackSlot = { id: `s${n}`, name: name.slice(0, 80), u: Math.min(20, Math.max(1, Math.round(u))) };
    return { ...r, slots: [...r.slots, slot] };
  });
}

export const updateRackSlot = (show: Show, id: string, slotId: string, patch: Partial<Omit<RackSlot, 'id'>>): Show =>
  withRack(show, id, (r) => ({ ...r, slots: r.slots.map((s) => (s.id === slotId ? { ...s, ...patch, name: (patch.name ?? s.name).slice(0, 80), u: Math.min(20, Math.max(1, Math.round(patch.u ?? s.u))) } : s)) }));

export const removeRackSlot = (show: Show, id: string, slotId: string): Show => withRack(show, id, (r) => ({ ...r, slots: r.slots.filter((s) => s.id !== slotId) }));

/** Moves a device one place up (-1) or down (+1) in the rack. */
export function moveRackSlot(show: Show, id: string, slotId: string, delta: -1 | 1): Show {
  return withRack(show, id, (r) => {
    const i = r.slots.findIndex((s) => s.id === slotId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= r.slots.length) return r;
    const slots = [...r.slots];
    [slots[i], slots[j]] = [slots[j]!, slots[i]!];
    return { ...r, slots };
  });
}

/** Each device with the rack unit where it starts, counted from the top. */
export function rackLayout(rack: Rack): { slot: RackSlot; from: number; to: number }[] {
  let at = 1;
  return rack.slots.map((slot) => {
    const row = { slot, from: at, to: at + slot.u - 1 };
    at += slot.u;
    return row;
  });
}
