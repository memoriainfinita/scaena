// Validators: pure functions over the show. Each finding says what is wrong in words (the UI shows the text, never
// only a colour) and points at the thing to fix. Findings never block anything, exporting included.
import { itemById } from '../library/items.ts';
import { incompatiblePrograms } from '../library/programs.ts';
import { channelList, outputList } from '../model/audio.ts';
import { dimmerLoads, luminaires, mountStats, phaseLoads } from '../model/lights.ts';
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
  | 'programOs';

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
};

const elName = (e: PlanElement): string => e.label || itemById(e.type.id)?.name.es || e.type.id;

type Rule = (show: Show) => Issue[];
const issue = (rule: RuleId, ref: Ref, vars: Issue['vars'] = {}, list?: string[]): Issue => ({ key: `${rule}:${ref.kind}:${ref.id}`, rule, severity: SEVERITY_OF[rule], ref, vars, ...(list ? { list } : {}) });

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
  const wedges = outputList(show)
    .filter((o) => o.kind === 'wedge' && o.sourceElementId && show.elements[o.sourceElementId])
    .map((o) => ({ o, e: show.elements[o.sourceElementId!]! }));
  if (wedges.length < 2) return [];
  // Left to right and, at the same x, front (large y) first.
  const expected = [...wedges].sort((a, b) => a.e.x - b.e.x || b.e.y - a.e.y).map((w) => w.o.number);
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

const STANDARD = new Set(['person', 'furniture', 'room', 'scenery', 'light', 'effect', 'vocals', 'power']);
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
  const by = new Map<string, PlanElement[]>();
  for (const e of luminaires(show)) {
    const { universe, address } = e.luminaire!;
    if (universe === null || address === null) continue;
    const k = `${universe}:${address}`;
    by.set(k, [...(by.get(k) ?? []), e]);
  }
  return [...by.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([k, list]) => {
      const [u, a] = k.split(':');
      return issue('dmxOverlap', { kind: 'element', id: list[1]!.id }, { universe: Number(u), address: Number(a), a: elName(list[0]!), b: elName(list[1]!) });
    });
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
  if (!lightsOn(show)) return [];
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

export const RULES: Record<RuleId, Rule> = { stereoPairOdd, channelUnnamed, channelGaps, danglingSource, sourceWithoutChannel, monitorOrder, wedgeMismatch, unmarkedSupplier, outletUnmarked, dmxOverlap, dimmerOverload, unitsDuplicated, phaseBreaker, mountOverload, luminaireMissing, noContact, noDate, programOs };

const RANK: Record<Severity, number> = { error: 0, warning: 1, tip: 2 };

/** All findings, errors first, with keys that are unique within the list. */
export function validate(show: Show): Issue[] {
  const all = Object.values(RULES).flatMap((r) => r(show));
  const count = new Map<string, number>();
  const unique = all.map((i) => {
    const n = (count.get(i.key) ?? 0) + 1;
    count.set(i.key, n);
    return n === 1 ? i : { ...i, key: `${i.key}#${n}` };
  });
  return unique.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}
