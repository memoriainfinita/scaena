// Reports: the lists a technician reads or hands over, as plain tables. The same rows feed the screen, the CSV files and the copy-as-text.
import type { Lang } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { audioLabel, fixtureById } from '../library/models.ts';
import { channelList, mixText, outputList } from '../model/audio.ts';
import { cableLength, connectionsOf, type SignalType } from '../model/connections.ts';
import { modeLabel, PROTOCOL_NAME, slotsOf, universeInfo, universesInUse } from '../model/dmx.ts';
import { effectivePatch } from '../model/patch.ts';
import { stagePosition } from '../model/position.ts';
import { rackLayout, racks, rackUsed } from '../model/racks.ts';
import { circuitLoads, dimmerLoads, luminaires, powered, riggingPlan } from '../model/lights.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { docStrings } from '../document/strings.ts';
import { inUnits, lengthValue, lengthWithUnit, numberText, weightValue } from '../model/units.ts';

export const REPORT_IDS = ['hookup', 'instruments', 'circuits', 'dimmers', 'colors', 'focus', 'labels', 'equipment', 'cheat', 'rigging', 'racks', 'worknotes', 'cables', 'power', 'dmx', 'universes', 'network', 'inputs', 'outputs'] as const;
export type ReportId = (typeof REPORT_IDS)[number];

/** The module a report belongs to: it is offered only when that module is on. */
export const REPORT_MODULE: Record<ReportId, 'lights' | 'audio' | 'any'> = { hookup: 'lights', instruments: 'lights', circuits: 'lights', dimmers: 'lights', colors: 'lights', focus: 'lights', labels: 'lights', equipment: 'lights', rigging: 'lights', racks: 'audio', cheat: 'lights', worknotes: 'lights', cables: 'any', power: 'any', dmx: 'lights', universes: 'lights', network: 'any', inputs: 'audio', outputs: 'audio' };

export interface ReportTable {
  id: ReportId;
  header: string[];
  rows: string[][];
}

/** A number the way the language writes it, at most `digits` decimals; empty when there is none. */
const fmt = (n: number | null, lang: Lang, digits = 0) => (n === null ? '' : numberText(n, lang, digits, false));
const name = (e: PlanElement | undefined, lang: Lang) => (e ? e.label || itemById(e.type.id)?.name[lang] || e.type.id : '');
const byNumber = (a: number | null, b: number | null) => (a ?? Infinity) - (b ?? Infinity);

/** The cables of the given signal types that touch an element, as a line: "XLR 10 m → Stagebox". Estimated lengths carry a "≈". */
export function cableText(show: Show, elementId: string, signals: readonly SignalType[], lang: Lang = show.lang): string {
  return connectionsOf(show, elementId)
    .filter((c) => signals.includes(c.signal))
    .map((c) => {
      const len = cableLength(show, c);
      const other = show.elements[c.from === elementId ? c.to : c.from];
      return [c.connector || (c.wireless ? docStrings(lang).wireless : ''), len ? `${len.estimated ? '≈ ' : ''}${lengthWithUnit(len.mm, show.units, lang)}` : '', other ? `→ ${name(other, lang)}` : ''].filter(Boolean).join(' ');
    })
    .join('; ');
}

export function availableReports(show: Show): ReportId[] {
  return REPORT_IDS.filter((id) => (REPORT_MODULE[id] === 'any' || show.modules.includes(REPORT_MODULE[id])) && (id !== 'cables' || Object.values(show.connections).some((c) => !c.wireless)) && (id !== 'power' || powered(show).length > 0) && (id !== 'racks' || racks(show).length > 0) && (id !== 'worknotes' || show.workNotes.length > 0) && (id !== 'dmx' || luminaires(show).some((e) => e.luminaire!.address !== null)) && (id !== 'universes' || universesInUse(show).length > 0) && (id !== 'network' || Object.values(show.elements).some((e) => e.ip.trim())));
}

export function buildReport(show: Show, id: ReportId, lang: Lang = show.lang): ReportTable {
  const D = docStrings(lang);
  const num = (n: number | null, digits = 0) => fmt(n, lang, digits);
  const kgv = (kg: number | null) => (kg === null ? '' : weightValue(kg, show.units, lang));
  const lum = luminaires(show);
  const model = (e: PlanElement) => {
    const f = e.luminaire?.modelId ? fixtureById(e.luminaire.modelId) : undefined;
    return f ? `${f.brand} ${f.model}` : '';
  };
  const mount = (e: PlanElement) => (e.luminaire?.mountId && show.mounts[e.luminaire.mountId]?.name) || '';
  const unitList = (els: PlanElement[]) =>
    els
      .map((e) => e.luminaire!.unit)
      .filter((u): u is number => u !== null)
      .sort((a, b) => a - b)
      .join(', ');

  if (id === 'hookup') {
    const rows = [...lum].sort((a, b) => byNumber(a.luminaire!.channel, b.luminaire!.channel) || byNumber(a.luminaire!.unit, b.luminaire!.unit)).map((e) => [num(e.luminaire!.channel), num(e.luminaire!.unit), name(e, lang), model(e), mount(e), num(e.luminaire!.dimmer), num(e.luminaire!.circuit), e.luminaire!.color, e.notes]);
    return { id, header: [D.channel, D.unit, D.element, D.model, D.mount, D.dimmer, D.circuit, D.color, D.note], rows };
  }
  if (id === 'instruments') {
    const rows = [...lum]
      .sort((a, b) => byNumber(a.luminaire!.unit, b.luminaire!.unit) || a.id.localeCompare(b.id, 'en', { numeric: true }))
      .map((e) => [num(e.luminaire!.unit), name(e, lang), model(e), mount(e), num(e.luminaire!.channel), num(e.luminaire!.dimmer), num(e.luminaire!.circuit), num(e.luminaire!.universe), num(e.luminaire!.address), modeLabel(e.luminaire!), e.luminaire!.color, kgv(e.weightKg), num(e.powerW), e.notes, cableText(show, e.id, ['lightControl', 'network'], lang)]);
    return { id, header: [D.unit, D.element, D.model, D.mount, D.channel, D.dimmer, D.circuit, D.universe, D.address, D.dmxMode, D.color, inUnits(D.weight, show.units), D.power, D.note, D.cables], rows };
  }
  if (id === 'circuits') {
    const rows = circuitLoads(show).map((c) => [String(c.circuit), String(c.count), unitList(lum.filter((e) => e.luminaire!.circuit === c.circuit)), num(c.powerW), num(c.amps, 2), c.phase === null ? '' : `L${c.phase}`]);
    return { id, header: [D.circuit, D.count, D.unit, D.power, D.amps, D.phase], rows };
  }
  if (id === 'dimmers') {
    const rows = dimmerLoads(show).map((d) => [String(d.dimmer), String(d.count), unitList(lum.filter((e) => e.luminaire!.dimmer === d.dimmer)), num(d.powerW), num(d.maxW)]);
    return { id, header: [D.dimmer, D.count, D.unit, D.power, `${D.maxLoad.replace(/ \(kg\)/, '')} (W)`], rows };
  }
  if (id === 'colors') {
    const groups = new Map<string, PlanElement[]>();
    for (const e of lum) {
      const key = e.luminaire!.color.trim() || '';
      const k = key.toLowerCase();
      const g = [...groups.keys()].find((x) => x.toLowerCase() === k) ?? key;
      groups.set(g, [...(groups.get(g) ?? []), e]);
    }
    const rows = [...groups.entries()].sort((a, b) => Number(a[0] === '') - Number(b[0] === '') || b[1].length - a[1].length || a[0].localeCompare(b[0], lang)).map(([color, els]) => [color || D.none, String(els.length), unitList(els)]);
    return { id, header: [D.color, D.count, D.unit], rows };
  }
  if (id === 'focus') {
    const rows = [...lum].sort((a, b) => byNumber(a.luminaire!.unit, b.luminaire!.unit)).map((e) => [num(e.luminaire!.unit), name(e, lang), mount(e), e.luminaire!.focus ? lengthValue(e.luminaire!.focus.x, show.units, lang, 2) : '', e.luminaire!.focus ? lengthValue(e.luminaire!.focus.y, show.units, lang, 2) : '', e.luminaire!.notes]);
    return { id, header: [D.unit, D.element, D.mount, inUnits('X (m)', show.units), inUnits('Y (m)', show.units), D.note], rows };
  }
  if (id === 'labels') {
    const rows = [...lum].sort((a, b) => byNumber(a.luminaire!.unit, b.luminaire!.unit)).map((e) => {
      const l = e.luminaire!;
      const parts = [l.unit !== null ? `U${l.unit}` : '', l.channel !== null ? `${D.channel} ${l.channel}` : '', l.dimmer !== null ? `D${l.dimmer}` : '', l.circuit !== null ? `C${l.circuit}` : '', l.color].filter(Boolean);
      return [parts.join(' · '), name(e, lang)];
    });
    return { id, header: [D.note, D.element], rows };
  }
  if (id === 'equipment') {
    // One row per model (or per generic type when no model is chosen), with the totals a rental list needs.
    const groups = new Map<string, { label: string; els: PlanElement[] }>();
    for (const e of lum) {
      const key = e.luminaire!.modelId ?? `type:${e.type.id}`;
      const label = model(e) || itemById(e.type.id)?.name[lang] || e.type.id;
      const g = groups.get(key) ?? { label, els: [] };
      g.els.push(e);
      groups.set(key, g);
    }
    const sum = (els: PlanElement[], f: (e: PlanElement) => number | null) => els.reduce((a, e) => a + (f(e) ?? 0), 0);
    const rows = [...groups.values()].sort((a, b) => b.els.length - a.els.length || a.label.localeCompare(b.label, lang)).map((g) => [g.label, String(g.els.length), kgv(sum(g.els, (e) => e.weightKg)), num(sum(g.els, (e) => e.powerW))]);
    if (rows.length > 0) rows.push([D.total, String(lum.length), kgv(sum(lum, (e) => e.weightKg)), num(sum(lum, (e) => e.powerW))]);
    return { id, header: [D.model, D.count, inUnits(D.weight, show.units), D.power], rows };
  }
  if (id === 'cheat') {
    // The one-page summary at the board: each channel with what it controls, where, and in which colour.
    const byChannel = new Map<number, PlanElement[]>();
    for (const e of lum) if (e.luminaire!.channel !== null) byChannel.set(e.luminaire!.channel, [...(byChannel.get(e.luminaire!.channel) ?? []), e]);
    const rows = [...byChannel.entries()].sort((a, b) => a[0] - b[0]).map(([ch, els]) => {
      const mounts = [...new Set(els.map(mount).filter(Boolean))].join(', ');
      const colors = [...new Set(els.map((e) => e.luminaire!.color.trim()).filter(Boolean))].join(', ');
      return [String(ch), String(els.length), [...new Set(els.map((e) => name(e, lang)))].join(', '), mounts, colors];
    });
    return { id, header: [D.channel, D.count, D.element, D.mount, D.color], rows };
  }
  if (id === 'rigging') {
    const rows: string[][] = [];
    for (const g of riggingPlan(show)) {
      const mname = g.mount?.name ?? D.none;
      g.lights.forEach((e, i) => rows.push([mname, String(i + 1), num(e.luminaire!.unit), name(e, lang), model(e), num(e.luminaire!.channel), e.luminaire!.color, kgv(e.weightKg), num(e.powerW)]));
      rows.push([mname, '', '', D.total, '', '', '', kgv(g.weightKg), num(g.powerW)]);
    }
    return { id, header: [D.mount, '#', D.unit, D.element, D.model, D.channel, D.color, inUnits(D.weight, show.units), D.power], rows };
  }
  if (id === 'racks') {
    const rows: string[][] = [];
    for (const e of racks(show)) {
      for (const { slot, from, to } of rackLayout(e.rack!)) rows.push([name(e, lang), from === to ? String(from) : `${from}-${to}`, slot.name, String(slot.u)]);
      rows.push([name(e, lang), '', D.total, `${rackUsed(e.rack!)} / ${e.rack!.units}`]);
    }
    return { id, header: [D.element, 'U', D.model, D.count], rows };
  }
  if (id === 'dmx') {
    const rows = lum
      .filter((e) => e.luminaire!.address !== null)
      .sort((a, b) => byNumber(a.luminaire!.universe, b.luminaire!.universe) || byNumber(a.luminaire!.address, b.luminaire!.address))
      .map((e) => {
        const l = e.luminaire!;
        return [num(l.universe), num(l.address), String(l.address! + (slotsOf(l) ?? 1) - 1), num(l.unit), name(e, lang), model(e), modeLabel(l), mount(e)];
      });
    return { id, header: [D.universe, D.address, D.dmxEnd, D.unit, D.element, D.model, D.dmxMode, D.mount], rows };
  }
  if (id === 'universes') {
    const rows = universesInUse(show).map((n) => {
      const u = universeInfo(show, n);
      return [String(n), PROTOCOL_NAME[u.protocol], u.protocol === 'dmx' ? '' : u.net, u.output];
    });
    return { id, header: [D.universe, D.protocol, D.netNumber, D.stageOutput], rows };
  }
  if (id === 'network') {
    const rows = Object.values(show.elements)
      .filter((e) => e.ip.trim())
      .sort((a, b) => a.ip.localeCompare(b.ip, 'en', { numeric: true }))
      .map((e) => [name(e, lang), itemById(e.type.id)?.name[lang] ?? '', e.ip.trim(), stagePosition(show, e), e.notes]);
    return { id, header: [D.element, D.model, 'IP', D.position, D.note], rows };
  }
  if (id === 'cables') {
    const order = ['audio', 'video', 'lightControl', 'network'];
    // A wireless link is not a cable to pull, so it is not in the list.
    const rows = Object.values(show.connections)
      .filter((c) => !c.wireless)
      .sort((a, b) => order.indexOf(a.signal) - order.indexOf(b.signal) || a.connector.localeCompare(b.connector, 'en') || a.id.localeCompare(b.id, 'en', { numeric: true }))
      .map((c, i) => {
        const len = cableLength(show, c);
        return [String(i + 1), name(show.elements[c.from], lang), name(show.elements[c.to], lang), D.signals[c.signal], c.connector, len === null ? '' : `${len.estimated ? '≈ ' : ''}${lengthValue(len.mm, show.units, lang)}`];
      });
    return { id, header: ['#', D.cableFrom, D.cableTo, D.cableSignal, D.cableConnector, inUnits(D.cableLength, show.units)], rows };
  }
  if (id === 'power') {
    const volts = show.region.voltage;
    const amps = (w: number) => (volts > 0 ? num(w / volts, 2) : '');
    const list = powered(show).sort((a, b) => byNumber(a.phase, b.phase) || name(a, lang).localeCompare(name(b, lang), lang) || a.id.localeCompare(b.id, 'en', { numeric: true }));
    const rows = list.map((e) => [name(e, lang), num(e.powerW), amps(e.powerW!), e.phase === null ? '' : `L${e.phase}`]);
    if (rows.length > 0) {
      const total = list.reduce((a, e) => a + e.powerW!, 0);
      const lightsW = lum.reduce((a, e) => a + (e.powerW ?? 0), 0);
      if (lightsW > 0) rows.push([D.lights, num(lightsW), amps(lightsW), '']);
      rows.push([D.total, num(total + lightsW), amps(total + lightsW), '']);
    }
    return { id, header: [D.element, D.power, D.amps, D.phase], rows };
  }
  if (id === 'worknotes') {
    const rows = show.workNotes.map((n) => [n.text, n.done ? D.yes : D.no, n.refId && show.elements[n.refId] ? name(show.elements[n.refId], lang) : '']);
    return { id, header: [D.task, D.done, D.element], rows };
  }
  if (id === 'inputs') {
    const rows = channelList(show).map((c) => {
      const pair = c.stereoPairWith ? show.channels[c.stereoPairWith] : undefined;
      const src = c.sourceElementId ? show.elements[c.sourceElementId] : undefined;
      return [String(c.number), c.shortName, audioLabel(c.mic), c.stand, effectivePatch(show, c), c.phantom ? D.yes : D.no, pair ? String(pair.number) : '', name(src, lang), src ? stagePosition(show, src) : '', c.notes, src ? cableText(show, src.id, ['audio'], lang) : ''];
    });
    return { id, header: [D.channel, D.shortName, D.mic, D.stand, D.patch, D.phantom, D.pair, D.source, D.position, D.note, D.cables], rows };
  }
  const rows = outputList(show).map((o) => [String(o.number), D.kinds[o.kind], o.stereo ? D.yes : D.no, o.aux, name(o.sourceElementId ? show.elements[o.sourceElementId] : undefined, lang), o.who, o.kind === 'main' ? '' : mixText(show, o, D.mixWords), o.notes]);
  return { id, header: ['#', D.kind, D.stereo, D.aux, D.source, D.who, D.mix, D.note], rows };
}

// ---- Text formats ----

/** A cell that a spreadsheet could take for a formula gets a quote in front, so opening a CSV never runs anything. */
const safeCell = (s: string): string => (/^[=+\-@\t\r]/.test(s) ? `'${s}` : s);
const csvCell = (s: string): string => {
  const v = safeCell(s);
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

/** RFC 4180 CSV with a byte-order mark so Excel reads the accents. */
export function toCsv(t: Pick<ReportTable, 'header' | 'rows'>): string {
  return '﻿' + [t.header, ...t.rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

/** Tab-separated text, for pasting into a spreadsheet or a message. */
export function toTsv(t: Pick<ReportTable, 'header' | 'rows'>): string {
  return [t.header, ...t.rows].map((r) => r.map((c) => c.replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');
}

/** The input list as plain text lines, for a message or an email. */
export function inputsAsText(show: Show, lang: Lang = show.lang): string {
  return buildReport(show, 'inputs', lang)
    .rows.map((r) => [r[0] + '.', [r[1], r[2], r[3]].filter(Boolean).join(' — '), r[4] === docStrings(lang).yes ? '(48 V)' : ''].filter(Boolean).join(' '))
    .join('\n');
}
