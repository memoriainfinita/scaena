// Pure operations on a show: each returns a new show and never mutates the old one.
import { nextId } from './ids.ts';
import type { PlanElement, Show } from './schema.ts';

export type NewElement = Pick<PlanElement, 'type' | 'x' | 'y' | 'layerId'> & Partial<PlanElement>;

export function addElement(show: Show, init: NewElement): [Show, PlanElement] {
  if (!show.layers.some((l) => l.id === init.layerId)) throw new Error(`unknown layer ${init.layerId}`);
  const [id, s] = nextId(show, 'e');
  const el: PlanElement = {
    z: 0, rotation: 0, flipX: false, flipY: false, width: null, depth: null, label: '', groupId: null,
    suppliedBy: 'unset', notes: '', weightKg: null, powerW: null, computer: null, luminaire: null,
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

export function setModules(show: Show, modules: Show['modules']): Show {
  return { ...show, modules };
}
