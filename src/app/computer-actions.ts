// Edits of a computer element and of the connections between elements: each one is a single undo step.
import { signal } from '@preact/signals';
import { addConnection, removeConnection, updateConnection, type SignalType } from '../model/connections.ts';
import { emptyComputer, updateElement } from '../model/ops.ts';
import type { Computer, Connection, Show } from '../model/schema.ts';
import { selection, session } from './state.ts';

const commit = (fn: (show: Show) => Show): void => session.value?.commit(fn);

/** Applies a change to the computer of an element; does nothing when it has none. */
export function changeComputer(id: string, fn: (c: Computer) => Computer): void {
  commit((show) => {
    const c = show.elements[id]?.computer;
    const next = c ? fn(c) : null;
    return c && next && next !== c ? updateElement(show, id, { computer: next }) : show;
  });
}

export const makeComputer = (id: string): void => commit((show) => (show.elements[id] && !show.elements[id]!.computer ? updateElement(show, id, { computer: emptyComputer() }) : show));

export const setFunction = (id: string, fn: Computer['functions'][number], on: boolean): void =>
  changeComputer(id, (c) => {
    const has = c.functions.includes(fn);
    // A computer always does something: the last function cannot be switched off.
    if (!on && c.functions.length === 1) return c;
    return { ...c, functions: on ? (has ? c.functions : [...c.functions, fn]) : c.functions.filter((f) => f !== fn) };
  });

export const addProgram = (id: string, name: string): void => {
  const n = name.trim().slice(0, 120);
  if (n) changeComputer(id, (c) => (c.programs.some((p) => p.name.toLowerCase() === n.toLowerCase()) ? c : { ...c, programs: [...c.programs, { name: n, version: '', use: '' }] }));
};
export const removeProgram = (id: string, index: number): void => changeComputer(id, (c) => ({ ...c, programs: c.programs.filter((_, i) => i !== index) }));
export const setProgramUse = (id: string, index: number, use: string): void => changeComputer(id, (c) => ({ ...c, programs: c.programs.map((p, i) => (i === index ? { ...p, use: use.slice(0, 200) } : p)) }));

export const addComputerOutput = (id: string): void => changeComputer(id, (c) => ({ ...c, outputs: [...c.outputs, { signal: 'video', connector: 'hdmi', note: '' }] }));
export const setComputerOutput = (id: string, index: number, patch: Partial<Computer['outputs'][number]>): void => changeComputer(id, (c) => ({ ...c, outputs: c.outputs.map((o, i) => (i === index ? { ...o, ...patch } : o)) }));
export const removeComputerOutput = (id: string, index: number): void => changeComputer(id, (c) => ({ ...c, outputs: c.outputs.filter((_, i) => i !== index) }));

// ---- connections ----

/** The signal type the Connect tool creates. */
export const connectSignal = signal<SignalType>('video');
/** The element a connection is being drawn from, until the target is picked. */
export const linkFrom = signal<string | null>(null);

/** Completes a connection from `linkFrom` to `to`. Returns true when one was created. */
export function connectTo(to: string): boolean {
  const from = linkFrom.peek();
  const s = session.value;
  if (!from || !s) return false;
  if (from === to) return false;
  let made = false;
  s.commit((show) => {
    const [next, c] = addConnection(show, from, to, connectSignal.peek());
    made = !!c;
    return next;
  });
  linkFrom.value = null;
  if (made) selection.value = [to];
  return made;
}

export const setConnection = (id: string, patch: Partial<Omit<Connection, 'id' | 'from' | 'to'>>): void => commit((show) => updateConnection(show, id, patch));
export const dropConnection = (id: string): void => commit((show) => removeConnection(show, id));
