import { addConnection, updateConnection } from '../model/connections.ts';
import { nextId } from '../model/ids.ts';
import { newShow } from '../model/new.ts';
import { addElement } from '../model/ops.ts';
import { addMount, autoNumber, emptyLuminaire, setFixtureModel, updateLuminaire } from '../model/lights.ts';
import { addRackSlot, makeRack, setRackUnits as updateRackUnits } from '../model/racks.ts';
import { diffShows } from '../model/diff.ts';
import { saveRevision } from '../model/revisions.ts';
import type { Computer, Connection, InputChannel, Mount, Output, PlanElement, Show } from '../model/schema.ts';
import { templateForPackage } from '../document/sections.ts';
import { itemById } from './items.ts';
import { audioById, fixtureById } from './models.ts';
import { translatePackageText } from './translate.ts';
import type { Bilingual, ShowPackage } from './types.ts';

const tx = (b: Bilingual | string, lang: 'es' | 'en'): string => (typeof b === 'string' ? translatePackageText(b, lang) : b[lang]);
const translateBilingual = (b: Bilingual, lang: 'es' | 'en'): string => b[lang];


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
      rotation: pe.rotation ?? 0,
      ip: pe.ip ?? '',
      layerId: layer.id,
      label: translatePackageText(pe.label ?? '', lang),
      suppliedBy: pe.suppliedBy ?? 'unset',
      powerW: item.powerW,
      computer,
      luminaire: item.layer === 'lights' && item.category === 'light' ? emptyLuminaire() : null,
      ...(pe.size ? { width: pe.size.w, depth: pe.size.d, height: pe.size.height ?? null } : {}),
      notes: pe.notes ? translateBilingual(pe.notes, lang) : '',
    });
    placed.push(el);
  }
  const channels: Record<string, InputChannel> = {};
  const channelIds: string[] = [];
  pkg.channels.forEach((c, i) => {
    let id: string;
    [id, show] = nextId(show, 'ch');
    channelIds.push(id);
    channels[id] = { id, number: i + 1, shortName: translatePackageText(c.name, lang).slice(0, 16), mic: translatePackageText(c.mic, lang), stand: translatePackageText(c.stand, lang), phantom: c.phantom, insert: '', patch: c.patch ?? '', stereoPairWith: null, sourceElementId: c.element === undefined ? null : placed[c.element]!.id, notes: '' };
  });
  const outputs: Record<string, Output> = {};
  pkg.outputs.forEach((o, i) => {
    let id: string;
    [id, show] = nextId(show, 'out');
    outputs[id] = { id, number: i + 1, kind: o.kind, stereo: false, aux: '', sourceElementId: o.element === undefined ? null : placed[o.element]!.id, who: tx(o.who ?? '', lang), mix: Object.fromEntries(Object.entries(o.mix ?? {}).map(([n, level]) => [channelIds[Number(n)]!, level])), notes: '' };
  });
  // Cables the package draws between its elements.
  for (const link of pkg.links ?? []) {
    const a = placed[link.from];
    const b = placed[link.to];
    if (!a || !b) continue;
    let made: Connection | null;
    [show, made] = addConnection(show, a.id, b.id, link.signal, link.connector === undefined ? undefined : translatePackageText(link.connector, lang));
    if (made && link.toPort !== undefined) show = updateConnection(show, made.id, { toPort: link.toPort, lines: link.lines ?? 1 });
    if (made && link.wireless) show = updateConnection(show, made.id, { wireless: true });
  }
  // Racks, with what is mounted in them.
  pkg.elements.forEach((pe, i) => {
    if (!pe.rack) return;
    show = makeRack(show, placed[i]!.id);
    show = updateRackUnits(show, placed[i]!.id, pe.rack.units);
    for (const [name, u] of pe.rack.slots) show = addRackSlot(show, placed[i]!.id, tx(name, lang), u);
  });
  // Where the lights hang: the package's own mounts, or one bar across them when it names none.
  const mounts: Mount[] = [];
  for (const m of pkg.mounts ?? []) {
    let mount: Mount;
    [show, mount] = addMount(show, { kind: m.kind, name: tx(m.name, lang), from: m.from, to: m.to, heightMm: m.heightMm, maxLoadKg: m.maxLoadKg ?? null });
    mounts.push(mount);
  }
  const lit = placed.filter((e) => e.luminaire);
  if (!pkg.mounts && lit.length > 0) {
    const xs = lit.map((e) => e.x);
    const y = Math.round(lit.reduce((acc, e) => acc + e.y, 0) / lit.length);
    let mount: Mount;
    [show, mount] = addMount(show, { kind: 'bar', name: lang === 'en' ? 'Bar 1' : 'Vara 1', from: { x: Math.min(...xs) - 500, y }, to: { x: Math.max(...xs) + 500, y } });
    mounts.push(mount);
  }
  pkg.elements.forEach((pe, i) => {
    const e = placed[i]!;
    if (!e.luminaire) return;
    const l = pe.light;
    const model = l ? fixtureById(l.modelId) : undefined;
    if (model) show = setFixtureModel(show, e.id, model);
    show = updateLuminaire(show, e.id, {
      mountId: (pkg.mounts ? (l?.mount === undefined ? undefined : mounts[l.mount]?.id) : mounts[0]?.id) ?? null,
      ...(l ? { channel: l.channel, circuit: l.circuit ?? null, dimmer: l.dimmer ?? null, color: l.color ?? '', universe: l.universe ?? null, address: l.address ?? null, ...(l.dmxMode ? { dmxMode: l.dmxMode } : {}), ...(l.dmxSlots ? { dmxSlots: l.dmxSlots } : {}) } : {}),
    });
  });
  if (pkg.desk) show = { ...show, desk: { ...show.desk, model: audioById(pkg.desk) ? `${audioById(pkg.desk)!.brand} ${audioById(pkg.desk)!.model}` : pkg.desk } };
  if (lit.length > 0) show = autoNumber(show);
  show = { ...show, channels, outputs, document: { template: templateForPackage(pkg.id), sections: [], planScale: null, inputs: { landscape: false, blocks: 'auto' } } };
  return pkg.finish ? pkg.finish(show, placed, (b) => tx(b, lang)) : show;
}

/** The two saved versions of an example, ready to store, and the show that lists them. */
export function withHistory(pkg: ShowPackage, show: Show): { show: Show; stored: { number: number; data: Uint8Array }[] } {
  if (!pkg.history) return { show, stored: [] };
  const { earlier, first, second } = pkg.history;
  const a = saveRevision(earlier(show), first[0], tx(first[1], show.lang));
  const current: Show = { ...show, revisions: a.show.revisions, revision: a.show.revision };
  const b = saveRevision(current, second[0], tx(second[1], show.lang), diffShows(a.show, current, show.lang));
  return { show: b.show, stored: [{ number: 1, data: a.data }, { number: 2, data: b.data }] };
}
