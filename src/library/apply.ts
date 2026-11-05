import { nextId } from '../model/ids.ts';
import { newShow } from '../model/new.ts';
import { addElement } from '../model/ops.ts';
import { addMount, emptyLuminaire, updateLuminaire } from '../model/lights.ts';
import type { Computer, InputChannel, Mount, Output, PlanElement, Show } from '../model/schema.ts';
import { templateForPackage } from '../document/sections.ts';
import { itemById } from './items.ts';
import { translatePackageText } from './translate.ts';
import type { ShowPackage } from './types.ts';


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
      ? { functions: pe.computer.functions, os: pe.computer.os, programs: pe.computer.programs.map((p) => ({ name: p.name, version: '', use: translatePackageText(p.use, lang) })), license: '', dongle: false, outputs: [] }
      : null;
    let el: PlanElement;
    [show, el] = addElement(show, {
      type: { id: item.id, version: item.version },
      x: pe.x,
      y: pe.y,
      layerId: layer.id,
      label: translatePackageText(pe.label ?? '', lang),
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
    channels[id] = { id, number: i + 1, shortName: translatePackageText(c.name, lang).slice(0, 16), mic: translatePackageText(c.mic, lang), stand: translatePackageText(c.stand, lang), phantom: c.phantom, insert: '', stereoPairWith: null, sourceElementId: c.element === undefined ? null : placed[c.element]!.id, notes: '' };
  });
  const outputs: Record<string, Output> = {};
  pkg.outputs.forEach((o, i) => {
    let id: string;
    [id, show] = nextId(show, 'out');
    outputs[id] = { id, number: i + 1, kind: o.kind, stereo: false, aux: '', sourceElementId: o.element === undefined ? null : placed[o.element]!.id, notes: '' };
  });
  // Lights in a package hang from one bar across them, so the plot starts with a mounting position to edit.
  const lit = placed.filter((e) => e.luminaire);
  if (lit.length > 0) {
    const xs = lit.map((e) => e.x);
    const y = Math.round(lit.reduce((acc, e) => acc + e.y, 0) / lit.length);
    let mount: Mount;
    [show, mount] = addMount(show, { kind: 'bar', name: lang === 'en' ? 'Bar 1' : 'Vara 1', from: { x: Math.min(...xs) - 500, y }, to: { x: Math.max(...xs) + 500, y } });
    for (const e of lit) show = updateLuminaire(show, e.id, { mountId: mount.id });
  }
  return { ...show, channels, outputs, document: { template: templateForPackage(pkg.id), sections: [], planScale: null } };
}
