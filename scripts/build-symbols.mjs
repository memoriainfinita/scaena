// Bundles symbols/<category>/<id>.svg into src/library/icons/<category>.json ({ id: [w, h, path] }) and
// src/library/icon-index.json ({ id: category }). The folder name is the category, the file name is the library item id.
// usage: node scripts/build-symbols.mjs   (a unit test fails when the generated files are out of date)
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'symbols');
const out = join(root, 'src/library/icons');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const index = {};
let total = 0;
for (const cat of readdirSync(src, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  const icons = {};
  for (const f of readdirSync(join(src, cat)).filter((n) => n.endsWith('.svg')).sort()) {
    const id = f.slice(0, -4);
    const text = readFileSync(join(src, cat, f), 'utf8');
    const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(text);
    const d = / d="([^"]+)"/.exec(text);
    if (!box || !d) throw new Error(`${cat}/${f}: needs viewBox="0 0 w h" and one path`);
    if (index[id]) throw new Error(`${id} is in ${index[id]} and ${cat}`);
    icons[id] = [Number(box[1]), Number(box[2]), d[1]];
    index[id] = cat;
    total++;
  }
  writeFileSync(join(out, `${cat}.json`), JSON.stringify(icons));
}
writeFileSync(join(root, 'src/library/icon-index.json'), JSON.stringify(index));
console.log(`${total} symbols in ${new Set(Object.values(index)).size} categories`);
