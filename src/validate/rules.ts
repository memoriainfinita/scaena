// Validators: pure functions over the show. Each finding says what is wrong in words (the UI shows the text, never
// only a colour) and points at the thing to fix. Findings never block anything, exporting included.
import { itemById } from '../library/items.ts';
import { incompatiblePrograms } from '../library/programs.ts';
import { channelList, drawnWedges, outputList, wedgeOrder } from '../model/audio.ts';
import { slotsOf, UNIVERSE_SIZE, universeInfo, universesInUse } from '../model/dmx.ts';
import { dimmerLoads, luminaires, mountStats, phaseLoads } from '../model/lights.ts';
import { handlesSignal, maxCableM } from '../model/compat.ts';
import { effectivePatch, patchAnalysis } from '../model/patch.ts';
import { isClock } from '../model/production.ts';
import type { PlanElement, Show } from '../model/schema.ts';

export type Severity = 'error' | 'warning' | 'tip';
export const SEVERITIES: readonly Severity[] = ['error', 'warning', 'tip'];

export type RuleId =
  | 'stereoPairOdd'
  | 'channelUnnamed'
  | 'channelGaps'
  | 'danglingSource'
  | 'sourceWithoutChannel'
  | 'monitorOrder'
  | 'wedgeMismatch'
  | 'unmarkedSupplier'
  | 'outletUnmarked'
  | 'dmxOverlap'
  | 'dimmerOverload'
  | 'unitsDuplicated'
  | 'phaseBreaker'
  | 'mountOverload'
  | 'luminaireMissing'
  | 'noContact'
  | 'noDate'
  | 'programOs'
  | 'timeFormat'
  | 'duplicatePatch'
  | 'connectionMismatch'
  | 'cableTooLong'
  | 'ipDuplicate'
  | 'stageCrossing'
  | 'portTaken'
  | 'portRange'
  | 'patchMismatch'
  | 'cableLinesShort'
  | 'dmxBeyond'
  | 'universeRepeated';

export type RefKind = 'element' | 'channel' | 'output' | 'mount' | 'dimmer' | 'phase' | 'show';
export interface Ref {
  kind: RefKind;
  id: string;
}

export interface Issue {
  /** Stable across edits for the same problem: rule plus the thing it is about. */
  key: string;
  rule: RuleId;
  severity: Severity;
  ref: Ref;
  vars: Record<string, string | number>;
  /** Names to list in the message: field keys or operating-system ids, according to the rule. */
  list?: string[];
  /** True when the user silenced this finding; it stays out of counts and marks. */
  muted?: true;
}

/** The severity of every rule, in one place so the UI and the documentation read the same table. */
export const SEVERITY_OF: Record<RuleId, Severity> = {
  stereoPairOdd: 'warning',
  channelUnnamed: 'warning',
  channelGaps: 'tip',
  danglingSource: 'error',
  sourceWithoutChannel: 'warning',
  monitorOrder: 'tip',
  wedgeMismatch: 'warning',
  unmarkedSupplier: 'tip',
  outletUnmarked: 'warning',
  dmxOverlap: 'error',
  dimmerOverload: 'error',
  unitsDuplicated: 'warning',
  phaseBreaker: 'error',
  mountOverload: 'error',
  luminaireMissing: 'warning',
  noContact: 'warning',
  noDate: 'warning',
  programOs: 'warning',
  timeFormat: 'warning',
  duplicatePatch: 'warning',
  connectionMismatch: 'warning',
  cableTooLong: 'warning',
  ipDuplicate: 'error',
  stageCrossing: 'warning',
  portTaken: 'error',
  portRange: 'warning',
  patchMismatch: 'warning',
  cableLinesShort: 'warning',
  dmxBeyond: 'warning',
  universeRepeated: 'error',
};

const elName = (e: PlanElement): string => e.label || itemById(e.type.id)?.name.es || e.type.id;

type Rule = (show: Show) => Issue[];
const issue = (rule: RuleId, ref: Ref, vars: Issue['vars'] = {}, list?: string[], part?: string): Issue => ({ key: `${rule}:${ref.kind}:${ref.id}${part ? `:${part}` : ''}`, rule, severity: SEVERITY_OF[rule], ref, vars, ...(list ? { list } : {}) });

const audioOn = (s: Show) => s.modules.includes('audio');
const lightsOn = (s: Show) => s.modules.includes('lights');
const docOn = (s: Show) => s.modules.includes('document');

const stereoPairOdd: Rule = (show) => {
  if (!audioOn(show)) return [];
  const out: Issue[] = [];
  const seen = new Set<string>();
  for (const c of channelList(show)) {
    const p = c.stereoPairWith ? show.channels[c.stereoPairWith] : undefined;
    if (!p || seen.has(c.id)) continue;
    seen.add(c.id);
    seen.add(p.id);
    const low = c.number < p.number ? c : p;
    if (low.number % 2 === 0) out.push(issue('stereoPairOdd', { kind: 'channel', id: low.id }, { a: Math.min(c.number, p.number), b: Math.max(c.number, p.number) }));
  }
  return out;
};

const channelUnnamed: Rule = (show) =>
  audioOn(show)
    ? channelList(show)
        .filter((c) => !c.shortName.trim() || !c.mic.trim())
        .map((c) => issue('channelUnnamed', { kind: 'channel', id: c.id }, { n: c.number }, [...(c.shortName.trim() ? [] : ['name']), ...(c.mic.trim() ? [] : ['mic'])]))
    : [];

const channelGaps: Rule = (show) => {
  if (!audioOn(show)) return [];
  const nums = channelList(show).map((c) => c.number);
  const gap = nums.findIndex((n, i) => n !== i + 1);
  return gap < 0 ? [] : [issue('channelGaps', { kind: 'show', id: 'channels' }, { n: gap + 1 })];
};

const danglingSource: Rule = (show) => [
  ...channelList(show)
    .filter((c) => c.sourceElementId && !show.elements[c.sourceElementId])
    .map((c) => issue('danglingSource', { kind: 'channel', id: c.id }, { n: c.number })),
  ...outputList(show)
    .filter((o) => o.sourceElementId && !show.elements[o.sourceElementId])
    .map((o) => issue('danglingSource', { kind: 'output', id: o.id }, { n: o.number })),
];

const sourceWithoutChannel: Rule = (show) => {
  if (!audioOn(show)) return [];
  const used = new Set(Object.values(show.channels).map((c) => c.sourceElementId));
  return Object.values(show.elements)
    .filter((e) => (itemById(e.type.id)?.suggestedChannels?.length ?? 0) > 0 && !used.has(e.id))
    .map((e) => issue('sourceWithoutChannel', { kind: 'element', id: e.id }, { name: elName(e) }));
};

const monitorOrder: Rule = (show) => {
  if (!audioOn(show)) return [];
  const wedges = drawnWedges(show);
  if (wedges.length < 2) return [];
  const expected = [...wedges].sort(wedgeOrder).map((w) => w.o.number);
  const actual = [...wedges].sort((a, b) => a.o.number - b.o.number).map((w) => w.o.number);
  const bad = actual.findIndex((n, i) => n !== expected[i]);
  if (bad < 0) return [];
  const first = wedges.find((w) => w.o.number === actual[bad])!;
  return [issue('monitorOrder', { kind: 'output', id: first.o.id }, { n: first.o.number })];
};

const wedgeMismatch: Rule = (show) => {
  if (!audioOn(show)) return [];
  const drawn = new Set(
    outputList(show)
      .filter((o) => o.kind === 'wedge')
      .map((o) => o.sourceElementId),
  );
  return [
    ...outputList(show)
      .filter((o) => o.kind === 'wedge' && !o.sourceElementId)
      .map((o) => issue('wedgeMismatch', { kind: 'output', id: o.id }, { n: o.number, side: 'asked' })),
    ...Object.values(show.elements)
      .filter((e) => itemById(e.type.id)?.symbol === 'wedge' && !drawn.has(e.id))
      .map((e) => issue('wedgeMismatch', { kind: 'element', id: e.id }, { name: elName(e), side: 'drawn' })),
  ];
};

const STANDARD = new Set(['person', 'furniture', 'room', 'scenery', 'light', 'effect', 'vocals', 'power', 'safety', 'site', 'production', 'machinery', 'rigging', 'network']);
const unmarkedSupplier: Rule = (show) => {
  if (!audioOn(show)) return [];
  return Object.values(show.elements)
    .filter((e) => {
      const it = itemById(e.type.id);
      return !!it && !STANDARD.has(it.category) && e.suppliedBy === 'unset';
    })
    .map((e) => issue('unmarkedSupplier', { kind: 'element', id: e.id }, { name: elName(e) }));
};

const outletUnmarked: Rule = (show) =>
  Object.values(show.elements)
    .filter((e) => e.type.id === 'power.outlet' && !e.label.trim())
    .map((e) => issue('outletUnmarked', { kind: 'element', id: e.id }));

const dmxOverlap: Rule = (show) => {
  if (!lightsOn(show)) return [];
  const out: Issue[] = [];
  const placed = luminaires(show)
    .filter((e) => e.luminaire!.universe !== null && e.luminaire!.address !== null)
    .sort((x, y) => x.luminaire!.universe! - y.luminaire!.universe! || x.luminaire!.address! - y.luminaire!.address!);
  // Going up the addresses of each universe, a fixture overlaps the one that reaches furthest so far.
  let widest: PlanElement | null = null;
  let end = 0;
  for (const e of placed) {
    const { universe, address } = e.luminaire!;
    if (widest && widest.luminaire!.universe === universe && address! <= end) out.push(issue('dmxOverlap', { kind: 'element', id: e.id }, { universe: universe!, address: address!, a: elName(widest), b: elName(e) }));
    const last = address! + (slotsOf(e.luminaire!) ?? 1) - 1;
    if (!widest || widest.luminaire!.universe !== universe || last > end) {
      widest = e;
      end = last;
    }
  }
  return out;
};

const dmxBeyond: Rule = (show) =>
  lightsOn(show)
    ? luminaires(show).flatMap((e) => {
        const { address } = e.luminaire!;
        const slots = slotsOf(e.luminaire!);
        return address !== null && slots !== null && address + slots - 1 > UNIVERSE_SIZE ? [issue('dmxBeyond', { kind: 'element', id: e.id }, { name: elName(e), address, slots })] : [];
      })
    : [];

const universeRepeated: Rule = (show) => {
  if (!lightsOn(show)) return [];
  const seen = new Map<string, number>();
  const out: Issue[] = [];
  for (const universe of universesInUse(show)) {
    const { protocol, net } = universeInfo(show, universe);
    const written = net.trim();
    if (protocol === 'dmx' || !written) continue;
    const other = seen.get(`${protocol}|${written}`);
    if (other === undefined) seen.set(`${protocol}|${written}`, universe);
    else out.push(issue('universeRepeated', { kind: 'show', id: `universe:${universe}` }, { universe, other, net: written }));
  }
  return out;
};

const dimmerOverload: Rule = (show) =>
  lightsOn(show)
    ? dimmerLoads(show)
        .filter((d) => d.overloaded)
        .map((d) => issue('dimmerOverload', { kind: 'dimmer', id: String(d.dimmer) }, { dimmer: d.dimmer, w: d.powerW, max: d.maxW ?? 0 }))
    : [];

const unitsDuplicated: Rule = (show) => {
  if (!lightsOn(show)) return [];
  const seen = new Map<number, PlanElement>();
  const out: Issue[] = [];
  for (const e of luminaires(show)) {
    const u = e.luminaire!.unit;
    if (u === null) continue;
    if (seen.has(u)) out.push(issue('unitsDuplicated', { kind: 'element', id: e.id }, { unit: u, other: elName(seen.get(u)!) }));
    else seen.set(u, e);
  }
  return out;
};

const phaseBreaker: Rule = (show) => {
  const out: Issue[] = [];
  for (const p of phaseLoads(show)) {
    if (p.phase === null) continue;
    const cfg = show.electrical.phases.find((x) => x.name === `L${p.phase}`);
    if (cfg?.breakerA != null && p.amps > cfg.breakerA) out.push(issue('phaseBreaker', { kind: 'phase', id: String(p.phase) }, { phase: p.phase, amps: p.amps, max: cfg.breakerA }));
  }
  return out;
};

const mountOverload: Rule = (show) =>
  lightsOn(show)
    ? mountStats(show)
        .filter((s) => s.overloaded && s.mountId)
        .map((s) => issue('mountOverload', { kind: 'mount', id: s.mountId! }, { name: show.mounts[s.mountId!]!.name, kg: Math.round(s.weightKg * 10) / 10, max: s.maxLoadKg ?? 0 }))
    : [];

const luminaireMissing: Rule = (show) => {
  if (!lightsOn(show)) return [];
  return luminaires(show)
    .map((e) => {
      const l = e.luminaire!;
      const missing = [...(l.modelId ? [] : ['model']), ...(l.mountId ? [] : ['mount']), ...(l.channel === null ? ['channel'] : [])];
      return missing.length > 0 ? issue('luminaireMissing', { kind: 'element', id: e.id }, { name: elName(e) }, missing) : null;
    })
    .filter((x): x is Issue => x !== null);
};

const noContact: Rule = (show) => (docOn(show) && !show.contacts.some((c) => c.name.trim() && c.phone.trim() && c.email.trim()) ? [issue('noContact', { kind: 'show', id: 'contacts' })] : []);
const noDate: Rule = (show) => (docOn(show) && !show.date.trim() ? [issue('noDate', { kind: 'show', id: 'date' })] : []);

const programOs: Rule = (show) =>
  Object.values(show.elements).flatMap((e) =>
    e.computer
      ? incompatiblePrograms(
          e.computer.os,
          e.computer.programs.map((p) => p.name),
        ).map((w) => issue('programOs', { kind: 'element', id: e.id }, { program: w.program, name: elName(e) }, w.available))
      : [],
  );

const timeFormat: Rule = (show) =>
  show.schedule.filter((x) => x.time.trim() !== '' && !isClock(x.time)).map((x) => issue('timeFormat', { kind: 'show', id: 'schedule' }, { time: x.time, what: x.what }));

const duplicatePatch: Rule = (show) => {
  if (!audioOn(show)) return [];
  const seen = new Map<string, number>();
  const out: Issue[] = [];
  for (const c of channelList(show)) {
    const shown = effectivePatch(show, c);
    const p = shown.toLowerCase();
    if (!p) continue;
    const first = seen.get(p);
    if (first === undefined) seen.set(p, c.number);
    else out.push(issue('duplicatePatch', { kind: 'channel', id: c.id }, { patch: shown, other: first, n: c.number }));
  }
  return out;
};

const connectionMismatch: Rule = (show) =>
  Object.values(show.connections).flatMap((c) =>
    [c.from, c.to]
      .map((id) => show.elements[id])
      .filter((e): e is PlanElement => !!e && !handlesSignal(e, c.signal))
      .map((e) => issue('connectionMismatch', { kind: 'element', id: e.id }, { name: elName(e), signal: c.signal }, undefined, c.id)),
  );

const cableTooLong: Rule = (show) =>
  Object.values(show.connections).flatMap((c) => {
    const max = maxCableM(c.connector);
    const from = show.elements[c.from];
    if (c.lengthMm === null || max === null || c.lengthMm / 1000 <= max || !from) return [];
    return [issue('cableTooLong', { kind: 'element', id: from.id }, { name: elName(from), connector: c.connector.trim(), m: Math.round(c.lengthMm / 100) / 10, max }, undefined, c.id)];
  });

const ipDuplicate: Rule = (show) => {
  const seen = new Map<string, PlanElement>();
  const out: Issue[] = [];
  for (const e of Object.values(show.elements)) {
    const ip = e.ip.trim().toLowerCase();
    if (!ip) continue;
    const first = seen.get(ip);
    if (!first) seen.set(ip, e);
    else out.push(issue('ipDuplicate', { kind: 'element', id: e.id }, { ip: e.ip.trim(), a: elName(first), b: elName(e) }));
  }
  return out;
};

type Pt = { x: number; y: number };
const cross = (o: Pt, a: Pt, b: Pt): number => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
/** True when segments ab and cd cross or touch (collinear overlaps included). */
function segmentsMeet(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const on = (p: Pt, q: Pt, r: Pt) => Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) && Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y);
  return (d1 === 0 && on(c, d, a)) || (d2 === 0 && on(c, d, b)) || (d3 === 0 && on(a, b, c)) || (d4 === 0 && on(a, b, d));
}

/** A free-form stage whose outline crosses itself: its area, the reference lines and the side section are then wrong. */
const stageCrossing: Rule = (show) => {
  const sh = show.stage.shape;
  if (sh.kind !== 'polygon') return [];
  const p = sh.points;
  const n = p.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue; // neighbours share a corner
      if (segmentsMeet(p[i]!, p[(i + 1) % n]!, p[j]!, p[(j + 1) % n]!)) return [issue('stageCrossing', { kind: 'show', id: 'stage' }, { a: i + 1, b: j + 1 })];
    }
  return [];
};

const elementNamed = (show: Show, id: string): string => (show.elements[id] ? elName(show.elements[id]!) : id);

const portTaken: Rule = (show) => (audioOn(show) ? patchAnalysis(show).taken.map((p) => issue('portTaken', { kind: 'element', id: p.element }, { name: elementNamed(show, p.element), port: p.port }, undefined, String(p.port))) : []);

const portRange: Rule = (show) => (audioOn(show) ? patchAnalysis(show).over.map((p) => issue('portRange', { kind: 'element', id: p.element }, { name: elementNamed(show, p.element), port: p.port, max: p.max }, undefined, String(p.port))) : []);

const patchMismatch: Rule = (show) => {
  if (!audioOn(show)) return [];
  const { derived } = patchAnalysis(show);
  return channelList(show).flatMap((c) => {
    const typed = c.patch.trim();
    const fromCables = derived.get(c.id);
    return typed && fromCables && typed.toLowerCase().replace(/\s+/g, ' ') !== fromCables.toLowerCase() ? [issue('patchMismatch', { kind: 'channel', id: c.id }, { n: c.number, typed, cables: fromCables })] : [];
  });
};

const cableLinesShort: Rule = (show) => (audioOn(show) ? patchAnalysis(show).short.map((s) => issue('cableLinesShort', { kind: 'element', id: s.element }, { name: elementNamed(show, s.element), channels: s.channels, lines: s.lines })) : []);

export const RULES: Record<RuleId, Rule> = { universeRepeated, dmxBeyond, portTaken, portRange, patchMismatch, cableLinesShort, stageCrossing, duplicatePatch, connectionMismatch, cableTooLong, ipDuplicate, timeFormat, stereoPairOdd, channelUnnamed, channelGaps, danglingSource, sourceWithoutChannel, monitorOrder, wedgeMismatch, unmarkedSupplier, outletUnmarked, dmxOverlap, dimmerOverload, unitsDuplicated, phaseBreaker, mountOverload, luminaireMissing, noContact, noDate, programOs };

const RANK: Record<Severity, number> = { error: 0, warning: 1, tip: 2 };

/** All findings, errors first, with keys that are unique within the list. The ones the user silenced carry `muted`. */
export function validate(show: Show): Issue[] {
  const muted = new Set(show.muted);
  const all = Object.values(RULES).flatMap((r) => r(show));
  const count = new Map<string, number>();
  const unique = all.map((i) => {
    const n = (count.get(i.key) ?? 0) + 1;
    count.set(i.key, n);
    const u = n === 1 ? i : { ...i, key: `${i.key}#${n}` };
    return muted.has(u.key) ? { ...u, muted: true as const } : u;
  });
  return unique.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}
