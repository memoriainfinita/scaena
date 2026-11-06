// Builds the Typst source of the rider from a show. Every user string goes in as a Typst string literal, so nothing a
// user types can be read as markup or code.
import { itemById } from '../library/items.ts';
import { audioLabel } from '../library/models.ts';
import { channelList, outputList } from '../model/audio.ts';
import { circuitLoads, dimmerLoads, luminaires, mountStats, phaseLoads } from '../model/lights.ts';
import { stagePosition } from '../model/position.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { fixtureById } from '../library/models.ts';
import { magicSheet } from './magic-svg.ts';
import { planSvg } from './plan-svg.ts';
import { buildReport } from '../reports/reports.ts';
import { effectiveSections, type SectionId } from './sections.ts';
import { formatDuration, setlistTotal, sortedSlots } from '../model/production.ts';
import { docStrings, prodStrings, type DocStrings } from './strings.ts';

export interface DocWarning {
  kind: 'overflow' | 'scale';
  text: string;
}

export interface Built {
  source: string;
  /** Files the source refers to, by absolute path in the Typst project. */
  files: Record<string, Uint8Array>;
  warnings: DocWarning[];
  sections: SectionId[];
}

export const PAPERS: Record<Show['paper'], { typst: string; w: number; h: number }> = {
  A4: { typst: 'a4', w: 210, h: 297 },
  A3: { typst: 'a3', w: 297, h: 420 },
  Letter: { typst: 'us-letter', w: 215.9, h: 279.4 },
  Tabloid: { typst: 'us-tabloid', w: 279.4, h: 431.8 },
};
const MARGIN = 15;
const BODY_PT = 9;

/** A Typst string literal that evaluates to the given text. */
export const lit = (s: string): string => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '')}"`;
/** The same as content: `#"text"` inside markup. */
export const txt = (s: string): string => `#${lit(s)}`;

type Col = { mm: number } | { fr: number };

class Collector {
  warnings: DocWarning[] = [];
  constructor(
    readonly contentMm: number,
    readonly D: DocStrings,
  ) {}

  /** A table with a header row; cells that hold a word too long for their column raise a warning. */
  table(section: string, cols: Col[], header: string[], rows: string[][]): string {
    const fixed = cols.reduce((a, c) => a + ('mm' in c ? c.mm : 0), 0);
    const fr = cols.reduce((a, c) => a + ('fr' in c ? c.fr : 0), 0) || 1;
    const widths = cols.map((c) => ('mm' in c ? c.mm : ((this.contentMm - fixed) * c.fr) / fr));
    rows.forEach((row, r) =>
      row.forEach((cell, i) => {
        const longest = cell.split(/\s+/).reduce((a, w) => Math.max(a, w.length), 0);
        if (longest * BODY_PT * 0.3528 * 0.56 > widths[i]! - 3.2) this.warnings.push({ kind: 'overflow', text: `${section} · ${header[i] ?? ''} · ${r + 1}: «${cell.slice(0, 40)}»` });
      }),
    );
    const spec = cols.map((c) => ('mm' in c ? `${c.mm}mm` : `${c.fr}fr`)).join(', ');
    const head = header.map((h) => `[*${txt(h)}*]`).join(', ');
    const body = rows.map((row) => row.map((c) => `[${txt(c)}]`).join(', ')).join(',\n  ');
    return `#table(
  columns: (${spec}),
  inset: 4.5pt,
  stroke: 0.4pt + luma(160),
  fill: (_, y) => if y == 0 { luma(232) },
  table.header(${head}),
  ${body}${rows.length ? ',' : ''}
)
`;
  }
}

const yn = (D: DocStrings, b: boolean) => (b ? D.yes : D.no);
const supplier = (D: DocStrings, s: PlanElement['suppliedBy']) => ({ unset: D.unset, band: D.band, venue: D.venueSupplies, rental: D.rental })[s];
const elName = (e: PlanElement | undefined, lang: 'es' | 'en'): string => (e ? e.label || itemById(e.type.id)?.name[lang] || e.type.id : '');
const num = (n: number | null, digits = 0) => (n === null ? '' : String(Math.round(n * 10 ** digits) / 10 ** digits));
/** Like num, but zero reads as nothing: an unstated weight or height is not a measurement of zero. */
const numNZ = (n: number | null, digits = 0) => (n === null || n === 0 ? '' : num(n, digits));

export function buildDocument(show: Show, images: Record<string, Uint8Array> = {}): Built {
  const D = docStrings(show.lang);
  const P = prodStrings(show.lang);
  const paper = PAPERS[show.paper];
  const contentMm = paper.w - 2 * MARGIN;
  const c = new Collector(contentMm, D);
  const sections = effectiveSections(show);
  const files: Record<string, Uint8Array> = {};
  const parts: string[] = [];
  const elements = Object.values(show.elements);

  const heading = (title: string) => `= ${txt(title)}\n\n`;

  const hasData: Partial<Record<SectionId, boolean>> = {
    contacts: show.contacts.length > 0,
    schedule: show.schedule.some((x) => x.kind === 'day'),
    build: show.schedule.some((x) => x.kind === 'build'),
    setlist: show.setlist.length > 0,
    hospitality: hospitalityRows(show, P).length > 0,
    contract: contractRows(show, P).length > 0,
    notes: elements.some((e) => e.notes.trim()),
    revisions: show.revisions.length > 0,
  };
  const printed = sections.filter((s) => hasData[s] !== false);

  for (const s of printed) {
    if (s === 'cover') {
      const meta: [string, string][] = [
        [D.production, show.titleBlock.production],
        [D.venue, show.titleBlock.venue],
        [D.author, show.titleBlock.author],
        [D.date, show.date],
        [D.revision, String(show.revision)],
      ].filter(([, v]) => v) as [string, string][];
      parts.push(`#align(center)[
  #v(40pt)
  #text(size: 26pt, weight: "bold")[${txt(show.name)}]
  #v(6pt)
  #text(size: 13pt, fill: luma(80))[${txt(D.rider)}]
  #v(24pt)
]
${meta.length ? `#align(center)[#table(columns: (auto, auto), inset: 5pt, stroke: none, align: (right, left), ${meta.map(([k, v]) => `[#text(fill: luma(100))[${txt(k)}]], [${txt(v)}]`).join(', ')})]` : ''}
#pagebreak(weak: true)
`);
    } else if (s === 'contacts') {
      const rows = show.contacts.map((ct) => ['role', 'name', 'phone', 'email'].map((f) => (ct.hidden.includes(f as 'role') ? D.none : ct[f as 'role'])));
      parts.push(heading(D.contacts) + (rows.length ? c.table(D.contacts, [{ fr: 1 }, { fr: 1.4 }, { fr: 1 }, { fr: 1.6 }], [D.role, D.name, D.phone, D.email], rows) : txt(D.none)) + '\n');
    } else if (s === 'schedule') {
      parts.push(heading(D.schedule) + c.table(D.schedule, [{ mm: 22 }, { fr: 1 }], [D.time, D.what], sortedSlots(show, 'day').map((x) => [x.time, x.what])) + '\n');
    } else if (s === 'build') {
      parts.push(heading(P.build) + c.table(P.build, [{ mm: 22 }, { fr: 1 }], [D.time, D.what], sortedSlots(show, 'build').map((x) => [x.time, x.what])) + '\n');
    } else if (s === 'setlist') {
      const rows = show.setlist.map((x, i) => [String(i + 1), x.title, x.comment, x.seconds ? formatDuration(x.seconds) : '']);
      rows.push(['', P.total, '', formatDuration(setlistTotal(show))]);
      parts.push(heading(P.setlist) + c.table(P.setlist, [{ mm: 12 }, { fr: 1.6 }, { fr: 1.4 }, { mm: 22 }], [P.song, P.songTitle, P.comment, P.duration], rows) + '\n');
    } else if (s === 'hospitality') {
      parts.push(heading(P.hospitality) + keyValueTable(hospitalityRows(show, P)) + '\n');
    } else if (s === 'contract') {
      parts.push(heading(P.contract) + keyValueTable(contractRows(show, P)) + '\n');
    } else if (s === 'plan') {
      const flipped = paper.h > paper.w;
      const availW = paper.h - 2 * MARGIN;
      const availH = paper.w - 2 * MARGIN - 14 - 10;
      const plan = planSvg(show, images, { availWidthMm: availW, availHeightMm: availH, planScale: show.document.planScale, lang: show.lang });
      if (!plan.fits) c.warnings.push({ kind: 'scale', text: `1:${show.document.planScale} → 1:${plan.scaleN}` });
      files['/plan.svg'] = new TextEncoder().encode(plan.svg);
      const alt = `${D.plan}: ${elements.length}`;
      parts.push(`#page(flipped: ${flipped})[
${heading(D.plan)}#align(center)[#image("/plan.svg", width: ${plan.widthMm.toFixed(2)}mm, alt: ${lit(alt)})]
]
`);
    } else if (s === 'inputs') {
      const list = channelList(show);
      const rows = list.map((ch) => {
        const pair = ch.stereoPairWith ? show.channels[ch.stereoPairWith] : undefined;
        const src = ch.sourceElementId ? show.elements[ch.sourceElementId] : undefined;
        return [String(ch.number), ch.shortName, audioLabel(ch.mic), ch.stand, ch.patch, yn(D, ch.phantom), pair ? String(pair.number) : '', elName(src, show.lang), src ? stagePosition(show, src) : ''];
      });
      const deskLine = [show.desk.model && `${D.desk}: ${show.desk.model}`, show.desk.showFile && `${D.showFile}: ${show.desk.showFile}`].filter(Boolean).join(' · ');
      parts.push(heading(D.inputs) + (deskLine ? `${txt(deskLine)}

` : '') + c.table(D.inputs, [{ mm: 11 }, { fr: 1 }, { fr: 1.3 }, { fr: 1 }, { mm: 16 }, { mm: 11 }, { mm: 10 }, { fr: 1.1 }, { mm: 12 }], [D.channel, D.shortName, D.mic, D.stand, D.patch, D.phantom, D.pair, D.source, D.position], rows) + `\n${txt(D.positionLegend)}\n`);
    } else if (s === 'outputs') {
      const rows = outputList(show).map((o) => [String(o.number), D.kinds[o.kind], yn(D, o.stereo), o.aux, elName(o.sourceElementId ? show.elements[o.sourceElementId] : undefined, show.lang), o.notes]);
      parts.push(heading(D.outputs) + c.table(D.outputs, [{ mm: 11 }, { fr: 1 }, { mm: 16 }, { mm: 16 }, { fr: 1.2 }, { fr: 1.6 }], ['#', D.kind, D.stereo, D.aux, D.source, D.note], rows) + '\n');
    } else if (s === 'computers') {
      const pcs = elements.filter((e) => e.computer);
      let md = heading(D.computers);
      if (pcs.length === 0) md += txt(D.none);
      for (const e of pcs) {
        const cp = e.computer!;
        const kv: [string, string][] = [
          [D.os, D.oses[cp.os]],
          [D.functions, cp.functions.map((f) => D.fn[f]).join(', ')],
          [D.programs, cp.programs.map((p) => (p.use ? `${p.name} (${p.use})` : p.name)).join('; ') || D.none],
          [D.license, cp.license || D.none],
          [D.dongle, yn(D, cp.dongle)],
          [D.outputsOf, cp.outputs.map((o) => `${D.signals[o.signal]} ${o.connector}${o.note ? ` (${o.note})` : ''}`).join('; ') || D.none],
          [D.supplier, supplier(D, e.suppliedBy)],
        ];
        md += `== ${txt(elName(e, show.lang))}\n#table(columns: (34mm, 1fr), inset: 4.5pt, stroke: 0.4pt + luma(160), ${kv.map(([k, v]) => `[*${txt(k)}*], [${txt(v)}]`).join(', ')})\n\n`;
      }
      parts.push(md);
    } else if (s === 'lights') {
      const rows = luminaires(show)
        .sort((a, b) => (a.luminaire!.unit ?? 1e9) - (b.luminaire!.unit ?? 1e9) || a.id.localeCompare(b.id, 'en', { numeric: true }))
        .map((e) => {
          const l = e.luminaire!;
          const fm = l.modelId ? fixtureById(l.modelId) : undefined;
          return [num(l.unit), elName(e, show.lang), fm ? `${fm.brand} ${fm.model}` : '', (l.mountId && show.mounts[l.mountId]?.name) || '', num(l.channel), num(l.dimmer), num(l.circuit), l.color, numNZ(e.powerW)];
        });
      let md = heading(D.lights) + c.table(D.lights, [{ mm: 15 }, { fr: 1.1 }, { fr: 1.4 }, { fr: 1 }, { mm: 15 }, { mm: 17 }, { mm: 18 }, { fr: 0.8 }, { mm: 19 }], [D.unit, D.element, D.model, D.mount, D.channel, D.dimmer, D.circuit, D.color, D.power], rows);
      const stats = mountStats(show);
      if (stats.length > 0) {
        md += `\n== ${txt(D.count)}\n` + c.table(D.count, [{ fr: 1.4 }, { fr: 1 }, { fr: 1 }, { fr: 1 }, { fr: 1 }, { fr: 1 }], [D.mount, D.kind, D.height, D.element, D.weight, D.power], stats.map((st) => {
          const m = st.mountId ? show.mounts[st.mountId] : undefined;
          return [m?.name ?? D.none, m ? D.mountKinds[m.kind] : '', m ? numNZ(m.heightMm / 1000, 1) : '', String(st.count), `${numNZ(st.weightKg, 1)}${st.maxLoadKg !== null ? ` / ${num(st.maxLoadKg)}` : ''}`, numNZ(st.powerW)];
        }));
      }
      parts.push(md + '\n');
    } else if (s === 'rigging') {
      const rows = buildReport(show, 'rigging').rows;
      parts.push(heading(D.rigging) + c.table(D.rigging, [{ fr: 1.2 }, { mm: 9 }, { mm: 14 }, { fr: 1.2 }, { fr: 1.4 }, { mm: 15 }, { fr: 0.8 }, { mm: 17 }, { mm: 17 }], [D.mount, '#', D.unit, D.element, D.model, D.channel, D.color, D.weight, D.power], rows) + '\n');
    } else if (s === 'racks') {
      const rows = buildReport(show, 'racks').rows;
      parts.push(heading(D.racks) + c.table(D.racks, [{ fr: 1.2 }, { mm: 16 }, { fr: 2 }, { mm: 20 }], [D.element, 'U', D.model, D.count], rows) + '\n');
    } else if (s === 'magic') {
      const sheet = magicSheet(show, show.lang);
      if (sheet) {
        const flipped = paper.h > paper.w;
        const availW = flipped ? paper.h - 2 * MARGIN : paper.w - 2 * MARGIN;
        const availH = (flipped ? paper.w : paper.h) - 2 * MARGIN - 14 - 10;
        const width = Math.min(availW, availH * sheet.aspect);
        files['/magic.svg'] = new TextEncoder().encode(sheet.svg);
        parts.push(`#page(flipped: ${flipped})[
${heading(D.magic)}#align(center)[#image("/magic.svg", width: ${width.toFixed(2)}mm, alt: ${lit(`${D.magic}: ${sheet.count}`)})]
]
`);
      }
    } else if (s === 'electrical') {
      const kv: [string, string][] = [
        [D.voltage, `${show.region.voltage} V`],
        [D.plug, show.region.plug || D.none],
      ];
      let md = heading(D.electrical) + `#table(columns: (34mm, 1fr), inset: 4.5pt, stroke: 0.4pt + luma(160), ${kv.map(([k, v]) => `[*${txt(k)}*], [${txt(v)}]`).join(', ')})\n\n`;
      const circuits = circuitLoads(show);
      if (circuits.length > 0) md += c.table(D.circuit, [{ mm: 20 }, { fr: 1 }, { fr: 1 }, { fr: 1 }, { fr: 1 }], [D.circuit, D.element, D.power, D.amps, D.phase], circuits.map((x) => [String(x.circuit), String(x.count), num(x.powerW), num(x.amps, 2), x.phase === null ? D.none : `L${x.phase}`])) + '\n';
      const dimmers = dimmerLoads(show);
      if (dimmers.length > 0) md += c.table(D.dimmer, [{ mm: 20 }, { fr: 1 }, { fr: 1 }, { fr: 1 }], [D.dimmer, D.element, D.power, D.maxLoad.replace(/ \(kg\)/, ' (W)')], dimmers.map((x) => [String(x.dimmer), String(x.count), num(x.powerW), num(x.maxW)])) + '\n';
      const phases = phaseLoads(show);
      if (phases.length > 0) md += c.table(D.phase, [{ mm: 24 }, { fr: 1 }, { fr: 1 }], [D.phase, D.power, D.amps], phases.map((x) => [x.phase === null ? D.none : `L${x.phase}`, num(x.powerW), num(x.amps, 2)]));
      parts.push(md + '\n');
    } else if (s === 'notes') {
      const rows = elements.filter((e) => e.notes.trim()).map((e) => [elName(e, show.lang), supplier(D, e.suppliedBy), e.notes]);
      parts.push(heading(D.notes) + (rows.length ? c.table(D.notes, [{ fr: 1 }, { mm: 26 }, { fr: 2.4 }], [D.ref, D.supplier, D.note], rows) : txt(D.none)) + '\n');
    } else if (s === 'revisions') {
      const rows = show.revisions.map((rv) => [String(rv.number), rv.date, rv.note, rv.changes.join('; ')]);
      parts.push(heading(D.revisions) + (rows.length ? c.table(D.revisions, [{ mm: 14 }, { mm: 24 }, { fr: 1 }, { fr: 1.6 }], [D.revision, D.date, D.note, D.changes], rows) : txt(D.none)) + '\n');
    }
  }

  const footer = `${show.name} · ${D.revision} ${show.revision}`;
  const source = `#set page(paper: ${lit(paper.typst)}, margin: (x: ${MARGIN}mm, top: ${MARGIN}mm, bottom: 18mm), footer: context [
  #set text(size: 8pt, fill: luma(90))
  ${txt(footer)} #h(1fr) ${txt(D.page)} #counter(page).display() ${txt(D.of)} #counter(page).final().first()
])
#set text(font: "Inter", size: ${BODY_PT}pt, lang: ${lit(show.lang)})
#set document(title: ${lit(`${show.name} — ${D.rider}`)}, author: ${lit(show.titleBlock.author || '')})
#show raw: set text(font: "JetBrains Mono")
#show heading.where(level: 1): set text(size: 15pt, weight: "bold")
#show heading.where(level: 1): set block(below: 10pt)
#show heading.where(level: 2): set text(size: 11pt, weight: "bold")
#show heading.where(level: 2): set block(above: 14pt, below: 6pt)

${parts.join('\n')}`;
  return { source, files, warnings: c.warnings, sections: printed };
}

type Row = [string, string];

/** A two-column table of label and value; the value is Typst-safe text. */
export function keyValueTable(rows: Row[]): string {
  return `#table(columns: (46mm, 1fr), inset: 4.5pt, stroke: 0.4pt + luma(160), ${rows.map(([k, v]) => `[*${txt(k)}*], [${txt(v)}]`).join(', ')})\n`;
}

const yesNo = (P: { yes: string }, on: boolean, no: string): string => (on ? P.yes : no);

/** The hospitality block as label and value rows; what the artist left empty is not printed. */
export function hospitalityRows(show: Show, P: ReturnType<typeof prodStrings>): Row[] {
  const h = show.hospitality;
  const rows: Row[] = [
    [P.dressingRooms, h.dressingRooms === null ? '' : String(h.dressingRooms)],
    [P.dressingNotes, h.dressingNotes],
    [P.meals, h.meals === null ? '' : String(h.meals)],
    [P.dietary, h.dietary],
    [P.cateringNotes, h.cateringNotes],
    [P.afterShowMeal, yesNo(P, h.afterShowMeal, '')],
    [P.busStock, yesNo(P, h.busStock, '')],
    [P.supplies, h.supplies],
    [P.transport, h.transport],
    [P.lodging, h.lodging],
    [P.localTransport, h.localTransport],
    [P.cashInstead, h.cashInstead ? `${P.yes}${h.cashAmount ? ` — ${h.cashAmount}` : ''}` : ''],
  ];
  return rows.filter(([, v]) => v.trim() !== '');
}

export function contractRows(show: Show, P: ReturnType<typeof prodStrings>): Row[] {
  const c = show.contract;
  const rows: Row[] = [
    [P.fee, c.fee],
    [P.deposit, c.deposit],
    [P.payment, c.payment],
    [P.cancellation, c.cancellation],
    [P.insurance, c.insurance],
    [P.setLength, c.setLengthMin === null ? '' : `${c.setLengthMin} ${P.minutes}`],
    [P.crew, c.crew],
    [P.other, c.other],
  ];
  return rows.filter(([, v]) => v.trim() !== '');
}
