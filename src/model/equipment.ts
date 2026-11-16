// The rows of the equipment tables: every element of the plan, every connection, and the video signals, filtered and sorted. Pure: the names come in as a function because they depend on the language and the library.
import type { Computer, Connection, PlanElement, Show } from './schema.ts';

export type EquipmentSort = 'name' | 'type' | 'layer' | 'supplier' | 'power' | 'weight';
export const EQUIPMENT_SORTS: readonly EquipmentSort[] = ['name', 'type', 'layer', 'supplier', 'power', 'weight'];

export interface EquipmentFilter {
  query: string;
  /** A layer id; empty is all of them. */
  layerId: string;
  /** A library category; empty is all of them. */
  category: string;
  /** A `suppliedBy` value; empty is all of them. */
  suppliedBy: string;
  sort: EquipmentSort;
}

export const NO_EQUIPMENT_FILTER: EquipmentFilter = { query: '', layerId: '', category: '', suppliedBy: '', sort: 'name' };

/** What the tables show of an element, and what the search looks at. */
export interface ElementText {
  name: string;
  type: string;
  category: string;
}

const norm = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const SUPPLIERS = ['unset', 'band', 'venue', 'rental'];
const collate = (a: string, b: string, lang: string): number => a.localeCompare(b, lang, { numeric: true, sensitivity: 'base' });

/** The elements that pass the filter, in the order asked for; a number that is empty goes last. */
export function equipmentRows(show: Show, f: EquipmentFilter, text: (el: PlanElement) => ElementText, lang = 'en'): PlanElement[] {
  const q = norm(f.query.trim());
  const layerOrder = new Map(show.layers.map((l, i) => [l.id, i]));
  const rows = Object.values(show.elements).filter((el) => {
    const t = text(el);
    if (f.layerId && el.layerId !== f.layerId) return false;
    if (f.category && t.category !== f.category) return false;
    if (f.suppliedBy && el.suppliedBy !== f.suppliedBy) return false;
    return !q || [t.name, t.type, el.notes, el.ip].some((s) => norm(s).includes(q));
  });
  const num = (a: number | null, b: number | null): number => (a === null ? (b === null ? 0 : 1) : b === null ? -1 : a - b);
  const cmp: Record<EquipmentSort, (a: PlanElement, b: PlanElement) => number> = {
    name: (a, b) => collate(text(a).name, text(b).name, lang),
    type: (a, b) => collate(text(a).type, text(b).type, lang),
    layer: (a, b) => (layerOrder.get(a.layerId) ?? 0) - (layerOrder.get(b.layerId) ?? 0),
    supplier: (a, b) => SUPPLIERS.indexOf(a.suppliedBy) - SUPPLIERS.indexOf(b.suppliedBy),
    power: (a, b) => num(a.powerW, b.powerW),
    weight: (a, b) => num(a.weightKg, b.weightKg),
  };
  return rows.sort((a, b) => cmp[f.sort](a, b) || collate(text(a).name, text(b).name, lang) || a.id.localeCompare(b.id));
}

export interface ConnectionFilter {
  query: string;
  /** A signal type; empty is all of them. */
  signal: string;
}

/** The connections that pass the filter, ordered by the name of where they start and where they end. */
export function connectionRows(show: Show, f: ConnectionFilter, nameOf: (el: PlanElement | undefined) => string, lang = 'en'): Connection[] {
  const q = norm(f.query.trim());
  return Object.values(show.connections)
    .filter((c) => show.elements[c.from] && show.elements[c.to])
    .filter((c) => !f.signal || c.signal === f.signal)
    .filter((c) => !q || [nameOf(show.elements[c.from]), nameOf(show.elements[c.to]), c.label, c.connector, c.format].some((s) => norm(s).includes(q)))
    .sort((a, b) => collate(nameOf(show.elements[a.from]), nameOf(show.elements[b.from]), lang) || collate(nameOf(show.elements[a.to]), nameOf(show.elements[b.to]), lang) || collate(a.connector, b.connector, lang) || a.id.localeCompare(b.id, 'en', { numeric: true }));
}

export interface ComputerVideoOutput {
  element: PlanElement;
  /** Its place in `computer.outputs`. */
  index: number;
  output: Computer['outputs'][number];
}

/** What carries video: the connections of that signal, and the video outputs the computers declare. */
export function videoRows(show: Show, nameOf: (el: PlanElement | undefined) => string, lang = 'en'): { links: Connection[]; outputs: ComputerVideoOutput[] } {
  const outputs: ComputerVideoOutput[] = [];
  for (const element of Object.values(show.elements)) {
    element.computer?.outputs.forEach((output, index) => {
      if (output.signal === 'video') outputs.push({ element, index, output });
    });
  }
  outputs.sort((a, b) => collate(nameOf(a.element), nameOf(b.element), lang) || a.index - b.index);
  return { links: connectionRows(show, { query: '', signal: 'video' }, nameOf, lang), outputs };
}
