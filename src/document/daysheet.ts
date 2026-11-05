// The day sheet of the event: what happens, when, who to call and where to be. One document with the rider's data.
import { sortedSlots } from '../model/production.ts';
import type { Show } from '../model/schema.ts';
import { docStrings, prodStrings } from './strings.ts';
import { PAPERS, keyValueTable, lit, txt } from './typst-source.ts';

export interface DaySheet {
  source: string;
  /** Rows with no data are left out; false when there is nothing to print at all. */
  empty: boolean;
}

export function buildDaySheet(show: Show): DaySheet {
  const D = docStrings(show.lang);
  const P = prodStrings(show.lang);
  const paper = PAPERS[show.paper];
  const day = sortedSlots(show, 'day');
  const build = sortedSlots(show, 'build');
  const h = show.hospitality;
  const e = show.event;

  const parts: string[] = [];
  const table = (cols: string, header: string[], rows: string[][]): string =>
    `#table(columns: (${cols}), inset: 4.5pt, stroke: 0.4pt + luma(160), fill: (_, y) => if y == 0 { luma(232) }, table.header(${header.map((x) => `[*${txt(x)}*]`).join(', ')}), ${rows.map((r) => r.map((c) => `[${txt(c)}]`).join(', ')).join(', ')})\n`;

  const meta = [show.titleBlock.venue, e.venueAddress, show.date].filter((x) => x.trim());
  parts.push(`#text(size: 20pt, weight: "bold")[${txt(show.name)}]\n#v(2pt)\n#text(size: 12pt, fill: luma(80))[${txt(P.daySheet)}${meta.length ? ` · ${meta.map((m) => txt(m)).join(' · ')}` : ''}]\n#v(10pt)\n`);

  if (day.length) parts.push(`= ${txt(D.schedule)}\n\n${table('22mm, 1fr', [D.time, D.what], day.map((x) => [x.time, x.what]))}\n`);
  if (build.length) parts.push(`= ${txt(P.build)}\n\n${table('22mm, 1fr', [D.time, D.what], build.map((x) => [x.time, x.what]))}\n`);

  const contacts = show.contacts.map((c) => ['role', 'name', 'phone', 'email'].map((f) => (c.hidden.includes(f as 'role') ? D.none : c[f as 'role'])));
  if (contacts.length) parts.push(`= ${txt(D.contacts)}\n\n${table('1fr, 1.4fr, 1fr, 1.6fr', [D.role, D.name, D.phone, D.email], contacts)}\n`);

  const where = [
    [P.venueAddress, e.venueAddress],
    [P.parking, e.parking],
    [P.transport, h.transport],
    [P.lodging, h.lodging],
    [P.localTransport, h.localTransport],
    [P.dressingRooms, h.dressingRooms === null ? '' : String(h.dressingRooms)],
    [P.meals, h.meals === null ? '' : String(h.meals)],
    [P.dietary, h.dietary],
    [P.event, e.notes],
  ].filter(([, v]) => v!.trim()) as [string, string][];
  if (where.length) parts.push(`= ${txt(P.event)}\n\n${keyValueTable(where)}\n`);

  const source = `#set page(paper: ${lit(paper.typst)}, margin: 15mm)
#set text(font: "Inter", size: 9.5pt, lang: ${lit(show.lang)})
#set document(title: ${lit(`${show.name} — ${P.daySheet}`)}, author: ${lit(show.titleBlock.author || '')})
#show heading.where(level: 1): set text(size: 13pt, weight: "bold")
#show heading.where(level: 1): set block(above: 14pt, below: 6pt)

${parts.join('\n')}`;
  return { source, empty: !day.length && !build.length && !contacts.length && !where.length };
}
