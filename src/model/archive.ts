// `.scaena` file: a zip with show.json, the imported images and the copy of each revision (`revisions/<n>.gz`). Nothing else is read from it.
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { openShow } from './migrate.ts';
import type { Show } from './schema.ts';

const MAX_UNCOMPRESSED = 256 * 1024 * 1024;
const MAX_FILES = 500;

export interface Packed {
  show: Show;
  images: Record<string, Uint8Array>;
  /** How many values were cut or clamped to fit the format when the file was read. */
  repaired: number;
  /** The stored copy of each revision the show lists, by number (see `revisions.ts`). */
  revisions: Record<number, Uint8Array>;
}

const REVISION_FILE = /^revisions\/(\d{1,6})\.gz$/;

export function packShow(show: Show, images: Record<string, Uint8Array> = {}, revisions: Record<number, Uint8Array> = {}): Uint8Array {
  const files: Record<string, Uint8Array> = { 'show.json': strToU8(JSON.stringify(show)) };
  for (const [name, data] of Object.entries(images)) files[`images/${name}`] = data;
  for (const [n, data] of Object.entries(revisions)) files[`revisions/${n}.gz`] = data;
  return zipSync(files, { level: 6 });
}

export function unpackShow(bytes: Uint8Array): Packed {
  let total = 0;
  let count = 0;
  const files = unzipSync(bytes, {
    filter: (f) => {
      count++;
      total += f.originalSize;
      if (count > MAX_FILES || total > MAX_UNCOMPRESSED) throw new Error('archive too large');
      return f.name === 'show.json' || REVISION_FILE.test(f.name) || (f.name.startsWith('images/') && !f.name.includes('..') && f.name.length < 200);
    },
  });
  const json = files['show.json'];
  if (!json) throw new Error('show.json missing');
  const images: Record<string, Uint8Array> = {};
  for (const [name, data] of Object.entries(files)) if (name.startsWith('images/')) images[name.slice('images/'.length)] = data;
  const { show, repaired } = openShow(JSON.parse(strFromU8(json)));
  // Only the copies of revisions the show lists are kept.
  const listed = new Set(show.revisions.map((r) => r.number));
  const revisions: Record<number, Uint8Array> = {};
  for (const [name, data] of Object.entries(files)) {
    const n = REVISION_FILE.exec(name)?.[1];
    if (n !== undefined && listed.has(Number(n))) revisions[Number(n)] = data;
  }
  return { show, images, repaired, revisions };
}
