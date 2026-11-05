// Renders the app icons from the logo with a headless Firefox (no extra dependencies): `node scripts/make-icons.mjs`.
// Two kinds: "any" and "maskable" (the logo inside the safe zone), plus the square icon iOS wants.
import { firefox } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const TEAL = '#0b6e78';
const glyph = '<rect x="4" y="5" width="18" height="11" fill="none" stroke="#fff" stroke-width="2"/><path d="M4 20h18" stroke="#fff" stroke-width="2"/><circle cx="13" cy="10.5" r="2.2" fill="#fff"/>';

const svg = (kind) => {
  // Full bleed in both: Firefox cannot take screenshots with a transparent background, and a square icon is what iOS wants.
  // The glyph is smaller in the maskable one so a circular mask never cuts it.
  const scale = kind === 'any' ? 0.8 : 0.6;
  const inner = `<g transform="translate(13 13) scale(${scale}) translate(-13 -13)">${glyph}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26"><rect width="26" height="26" fill="${TEAL}"/>${inner}</svg>`;
};

const jobs = [
  ['icon-192.png', 192, 'any'],
  ['icon-512.png', 512, 'any'],
  ['icon-maskable-512.png', 512, 'maskable'],
  ['apple-touch-icon.png', 180, 'maskable'],
];

mkdirSync('public/icons', { recursive: true });
const browser = await firefox.launch();
for (const [file, size, kind] of jobs) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(kind).replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: `public/icons/${file}`});
  await page.close();
  console.log('wrote', file);
}
await browser.close();
