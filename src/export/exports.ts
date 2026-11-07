// The files the app can hand to the user. Each function builds the bytes; `saveFile` is what puts them in the downloads.
import { fixPdf, compilePdf } from '../document/compile.ts';
import { planSvg } from '../document/plan-svg.ts';
import { loadShowIcons } from '../library/show-icons.ts';
import { buildDaySheet } from '../document/daysheet.ts';
import { buildDocument, lit, PAPERS } from '../document/typst-source.ts';
import { docStrings } from '../document/strings.ts';
import { zipSync } from 'fflate';
import { planDxf } from './dxf.ts';
import type { RevisionMeta, Show } from '../model/schema.ts';
import { availableReports, buildReport, toCsv } from '../reports/reports.ts';

export interface OutFile {
  name: string;
  bytes: Uint8Array;
  mime: string;
}

/** A file name from a show name: letters, digits and dashes only. */
export const baseName = (name: string): string => name.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'rider';

export function saveFile(f: OutFile): void {
  const url = URL.createObjectURL(new Blob([f.bytes as BlobPart], { type: f.mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = f.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const enc = new TextEncoder();

/** The plan alone as an SVG sized in millimetres on paper, so it opens at its print scale. */
export function planSvgFile(show: Show, images: Record<string, Uint8Array>): OutFile {
  const paper = PAPERS[show.paper];
  const plan = planSvg(show, images, { availWidthMm: paper.h - 30, availHeightMm: paper.w - 30, planScale: show.document.planScale, lang: show.lang });
  const svg = plan.svg.replace(/ width="[\d.]+" height="[\d.]+">/, ` width="${plan.widthMm.toFixed(2)}mm" height="${plan.heightMm.toFixed(2)}mm">`);
  return { name: `${baseName(show.name)}-plano.svg`, bytes: enc.encode(svg), mime: 'image/svg+xml' };
}

/** The plan as a DXF drawing in millimetres for CAD programs. */
export function planDxfFile(show: Show): OutFile {
  return { name: `${baseName(show.name)}-plano.dxf`, bytes: enc.encode(planDxf(show).text), mime: 'application/dxf' };
}

/** The plan as a PNG, drawn through the browser's own SVG renderer (the loaded fonts are not available there). */
export async function planPngFile(show: Show, images: Record<string, Uint8Array>, widthPx = 3000): Promise<OutFile> {
  await loadShowIcons(show);
  const svgFile = planSvgFile(show, images);
  const url = URL.createObjectURL(new Blob([svgFile.bytes as BlobPart], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ratio = img.naturalHeight / img.naturalWidth || 0.7;
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = Math.round(widthPx * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d canvas');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('canvas.toBlob returned nothing');
    return { name: `${baseName(show.name)}-plano.png`, bytes: new Uint8Array(await blob.arrayBuffer()), mime: 'image/png' };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function pdfOf(show: Show, images: Record<string, Uint8Array>): Promise<Uint8Array> {
  await loadShowIcons(show);
  const built = buildDocument(show, images);
  return fixPdf(await compilePdf(built.source, built.files));
}

export async function riderPdfFile(show: Show, images: Record<string, Uint8Array>): Promise<OutFile> {
  return { name: `${baseName(show.name)}.pdf`, bytes: await pdfOf(show, images), mime: 'application/pdf' };
}

/** A PDF of the plan alone, whichever sections the rider has. */
export async function planPdfFile(show: Show, images: Record<string, Uint8Array>): Promise<OutFile> {
  const only: Show = { ...show, document: { ...show.document, template: 'custom', sections: ['plan'] } };
  return { name: `${baseName(show.name)}-plano.pdf`, bytes: await pdfOf(only, images), mime: 'application/pdf' };
}

/** Every report available for the show as a CSV, in one zip. */
export function csvZipFile(show: Show): OutFile {
  const files: Record<string, Uint8Array> = {};
  for (const id of availableReports(show)) files[`${id}.csv`] = enc.encode(toCsv(buildReport(show, id)));
  return { name: `${baseName(show.name)}-listas.zip`, bytes: zipSync(files), mime: 'application/zip' };
}

/** A one-page PDF that says what changed in a revision, to send to whoever has the previous one. */
export async function updateSheetFile(show: Show, rev: RevisionMeta): Promise<OutFile> {
  const D = docStrings(show.lang);
  const q = (s: string) => `#${lit(s)}`;
  const source = `#set page(paper: ${lit(PAPERS[show.paper].typst)}, margin: 20mm)
#set text(font: "Inter", size: 11pt, lang: ${lit(show.lang)})
#set document(title: ${lit(`${show.name} — ${D.revision} ${rev.number}`)})
= ${q(show.name)}
#text(size: 13pt, fill: luma(80))[${q(`${D.revision} ${rev.number}`)} · ${q(rev.date)}]
#v(8pt)
${rev.note ? q(rev.note) : ''}
${rev.changes.length ? `== ${q(D.changes)}\n${rev.changes.map((c) => `- ${q(c)}`).join('\n')}` : ''}
`;
  return { name: `${baseName(show.name)}-rev${rev.number}.pdf`, bytes: await fixPdf(await compilePdf(source)), mime: 'application/pdf' };
}

/** The day sheet of the event: schedules, contacts and where to be. */
export async function daySheetFile(show: Show): Promise<OutFile> {
  const sheet = buildDaySheet(show);
  return { name: `${baseName(show.name)}-hoja-de-ruta.pdf`, bytes: await fixPdf(await compilePdf(sheet.source)), mime: 'application/pdf' };
}
