import { nextId } from '../model/ids.ts';
import { newShow } from '../model/new.ts';
import { addElement } from '../model/ops.ts';
import type { Computer, InputChannel, Luminaire, Output, PlanElement, Show } from '../model/schema.ts';
import { itemById } from './items.ts';
import type { ShowPackage } from './types.ts';

const emptyLuminaire = (): Luminaire => ({ mountId: null, unit: null, channel: null, dimmer: null, circuit: null, universe: null, address: null, color: '', accessories: [], focus: null, notes: '' });

/** Builds a show from a package: elements on their layers, channels in the package order, outputs on their wedges. */
export function showFromPackage(pkg: ShowPackage, name: string, lang: 'es' | 'en' = 'es'): Show {
  let show = newShow(name, pkg.modules);
  show = { ...show, lang };
  const placed: PlanElement[] = [];
  for (const pe of pkg.elements) {
    const item = itemById(pe.type);
    if (!item) throw new Error(`package ${pkg.id}: unknown item ${pe.type}`);
    const layer = show.layers.find((l) => l.subject === item.layer);
    if (!layer) throw new Error(`no layer for subject ${item.layer}`);
    const computer: Computer | null = pe.computer
      ? { functions: pe.computer.functions, os: pe.computer.os, programs: pe.computer.programs.map((p) => ({ name: p.name, version: '', use: p.use })), license: '', dongle: false, outputs: [] }
      : null;
    let el: PlanElement;
    [show, el] = addElement(show, {
      type: { id: item.id, version: item.version },
      x: pe.x,
      y: pe.y,
      layerId: layer.id,
      label: pe.label ?? '',
      suppliedBy: pe.suppliedBy ?? 'unset',
      computer,
      luminaire: item.layer === 'lights' && item.category === 'light' ? emptyLuminaire() : null,
    });
    placed.push(el);
  }
  const channels: Record<string, InputChannel> = {};
  pkg.channels.forEach((c, i) => {
    let id: string;
    [id, show] = nextId(show, 'ch');
    channels[id] = { id, number: i + 1, shortName: c.name.slice(0, 16), mic: c.mic, stand: c.stand, phantom: c.phantom, insert: '', stereoPairWith: null, sourceElementId: c.element === undefined ? null : placed[c.element]!.id, notes: '' };
  });
  const outputs: Record<string, Output> = {};
  pkg.outputs.forEach((o, i) => {
    let id: string;
    [id, show] = nextId(show, 'out');
    outputs[id] = { id, number: i + 1, kind: o.kind, stereo: false, aux: '', sourceElementId: o.element === undefined ? null : placed[o.element]!.id, notes: '' };
  });
  return { ...show, channels, outputs };
}
