// Builds src/library/ofl-data.json from a local clone of the Open Fixture Library (MIT).
// Usage: node scripts/import-ofl.mjs <path to the clone>
// Keeps only what the plan uses: brand, model, kind, weight, power, beam angle and the fixture's page.
import { readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) {
  console.error('Usage: node scripts/import-ofl.mjs <open-fixture-library clone>');
  process.exit(1);
}
const fixtures = join(root, 'fixtures');
const makers = JSON.parse(readFileSync(join(fixtures, 'manufacturers.json'), 'utf8'));

const kindOf = (cats) => {
  if (cats.includes('Moving Head') || cats.includes('Scanner') || cats.includes('Barrel Scanner')) return 'moving';
  if (cats.includes('Smoke')) return 'smoke';
  if (cats.includes('Hazer')) return 'haze';
  if (cats.includes('Strobe') && cats.length === 1) return 'strobe';
  return 'led';
};
const beamOf = (lens) => {
  const r = lens?.degreesMinMax;
  if (!Array.isArray(r)) return '';
  return r[0] === r[1] ? `${r[0]}°` : `${r[0]}-${r[1]}°`;
};
const num = (x) => (typeof x === 'number' && Number.isFinite(x) && x > 0 ? x : null);

const out = [];
for (const dir of readdirSync(fixtures, { withFileTypes: true })) {
  if (!dir.isDirectory() || !makers[dir.name]) continue;
  for (const file of readdirSync(join(fixtures, dir.name)).filter((f) => f.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(join(fixtures, dir.name, file), 'utf8'));
    if (d.redirectTo || !d.name) continue;
    const slug = file.slice(0, -5);
    const p = d.physical ?? {};
    out.push({
      id: `ofl.${dir.name}.${slug}`,
      brand: makers[dir.name].name,
      model: d.name,
      kind: kindOf(d.categories ?? []),
      weightKg: num(p.weight),
      powerW: num(p.power),
      beam: beamOf(p.lens),
      source: `https://open-fixture-library.org/${dir.name}/${slug}`,
    });
  }
}
out.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(new URL('../src/library/ofl-data.json', import.meta.url), JSON.stringify(out));
mkdirSync(new URL('../third_party/', import.meta.url), { recursive: true });
copyFileSync(join(root, 'LICENSE'), new URL('../third_party/open-fixture-library-LICENSE', import.meta.url));
console.log(`${out.length} fixtures`);
