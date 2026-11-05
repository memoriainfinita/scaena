// `.scaena` file: a zip with show.json and the imported images. Nothing else is read from it.
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { loadShow } from './migrate.ts';
import type { Show } from './schema.ts';

const MAX_UNCOMPRESSED = 256 * 1024 * 1024;
const MAX_FILES = 500;

export interface Packed {
  show: Show;
  images: Record<string, Uint8Array>;
}

export function packShow(show: Show, images: Record<string, Uint8Array> = {}): Uint8Array {
  const files: Record<string, Uint8Array> = { 'show.json': strToU8(JSON.stringify(show)) };
  for (const [name, data] of Object.entries(images)) files[`images/${name}`] = data;
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
      return f.name === 'show.json' || (f.name.startsWith('images/') && !f.name.includes('..') && f.name.length < 200);
    },
  });
  const json = files['show.json'];
  if (!json) throw new Error('show.json missing');
  const images: Record<string, Uint8Array> = {};
  for (const [name, data] of Object.entries(files)) if (name.startsWith('images/')) images[name.slice('images/'.length)] = data;
  return { show: loadShow(JSON.parse(strFromU8(json))), images };
}
