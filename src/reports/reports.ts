// Reports: the lists a technician reads or hands over, as plain tables. The same rows feed the screen, the CSV files and the copy-as-text.
import type { Lang } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { audioLabel, fixtureById } from '../library/models.ts';
import { channelList, outputList } from '../model/audio.ts';
import { circuitLoads, dimmerLoads, luminaires } from '../model/lights.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { docStrings } from '../document/strings.ts';

export const REPORT_IDS = ['hookup', 'instruments', 'circuits', 'dimmers', 'colors', 'focus', 'labels', 'equipment', 'cheat', 'worknotes', 'inputs', 'outputs'] as const;
export type ReportId = (typeof REPORT_IDS)[number];

/** The module a report belongs to: it is offered only when that module is on. */
export const REPORT_MODULE: Record<ReportId, 'lights' | 'audio'> = { hookup: 'lights', instruments: 'lights', circuits: 'lights', dimmers: 'lights', colors: 'lights', focus: 'lights', labels: 'lights', equipment: 'lights', cheat: 'lights', worknotes: 'lights', inputs: 'audio', outputs: 'audio' };

export interface ReportTable {
  id: ReportId;
  header: string[];
  rows: string[][];
}

const num = (n: number | null, digits = 0) => (n === null ? '' : String(Math.round(n * 10 ** digits) / 10 ** digits));
const name = (e: PlanElement | undefined, lang: Lang) => (e ? e.label || itemById(e.type.id)?.name[lang] || e.type.id : '');
const byNumber = (a: number | null, b: number | null) => (a ?? Infinity) - (b ?? Infinity);

export function availableReports(show: Show): ReportId[] {
  return REPORT_IDS.filter((id) => show.modules.includes(REPORT_MODULE[id]));
}

export function buildReport(show: Show, id: ReportId, lang: Lang = show.lang): ReportTable {
  const D = docStrings(lang);
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
      .map((e) => [num(e.luminaire!.unit), name(e, lang), model(e), mount(e), num(e.luminaire!.channel), num(e.luminaire!.dimmer), num(e.luminaire!.circuit), num(e.luminaire!.universe), num(e.luminaire!.address), e.luminaire!.color, num(e.weightKg, 1), num(e.powerW), e.notes]);
    return { id, header: [D.unit, D.element, D.model, D.mount, D.channel, D.dimmer, D.circuit, D.universe, D.address, D.color, D.weight, D.power, D.note], rows };
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
    const rows = [...lum].sort((a, b) => byNumber(a.luminaire!.unit, b.luminaire!.unit)).map((e) => [num(e.luminaire!.unit), name(e, lang), mount(e), e.luminaire!.focus ? num(e.luminaire!.focus.x / 1000, 2) : '', e.luminaire!.focus ? num(e.luminaire!.focus.y / 1000, 2) : '', e.luminaire!.notes]);
    return { id, header: [D.unit, D.element, D.mount, 'X (m)', 'Y (m)', D.note], rows };
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
    const rows = [...groups.values()].sort((a, b) => b.els.length - a.els.length || a.label.localeCompare(b.label, lang)).map((g) => [g.label, String(g.els.length), num(sum(g.els, (e) => e.weightKg), 1), num(sum(g.els, (e) => e.powerW))]);
    if (rows.length > 0) rows.push([D.total, String(lum.length), num(sum(lum, (e) => e.weightKg), 1), num(sum(lum, (e) => e.powerW))]);
    return { id, header: [D.model, D.count, D.weight, D.power], rows };
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
  if (id === 'worknotes') {
    const rows = show.workNotes.map((n) => [n.text, n.done ? D.yes : D.no, n.refId && show.elements[n.refId] ? name(show.elements[n.refId], lang) : '']);
    return { id, header: [D.task, D.done, D.element], rows };
  }
  if (id === 'inputs') {
    const rows = channelList(show).map((c) => {
      const pair = c.stereoPairWith ? show.channels[c.stereoPairWith] : undefined;
      return [String(c.number), c.shortName, audioLabel(c.mic), c.stand, c.phantom ? D.yes : D.no, pair ? String(pair.number) : '', name(c.sourceElementId ? show.elements[c.sourceElementId] : undefined, lang), c.notes];
    });
    return { id, header: [D.channel, D.shortName, D.mic, D.stand, D.phantom, D.pair, D.source, D.note], rows };
  }
  const rows = outputList(show).map((o) => [String(o.number), D.kinds[o.kind], o.stereo ? D.yes : D.no, o.aux, name(o.sourceElementId ? show.elements[o.sourceElementId] : undefined, lang), o.notes]);
  return { id, header: ['#', D.kind, D.stereo, D.aux, D.source, D.note], rows };
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
