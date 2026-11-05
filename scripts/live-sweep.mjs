// A wide pass over the published site: every package in both languages, every view, errors and failed requests collected.
// `node scripts/live-sweep.mjs [url]`
import { firefox } from '@playwright/test';

const url = process.argv[2] ?? 'https://memoriainfinita.github.io/scaena/';
const browser = await firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0' } });
const problems = [];
const seen = new Set();

for (const lang of ['es', 'en']) {
  const names = [0, 1, 2, 3, 4, 5, 6];
  for (const name of names) {
    // A fresh context each time: the app reopens the last show it finds, so a shared one would skip the start screen.
    const ctx = await browser.newContext({ locale: lang === 'es' ? 'es-ES' : 'en-US', viewport: { width: 1440, height: 860 } });
    const page = await ctx.newPage();
    const tag = `${lang}/package ${name}`;
    page.on('pageerror', (e) => problems.push(`${tag} pageerror: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && problems.push(`${tag} console: ${m.text().slice(0, 160)}`));
    page.on('requestfailed', (r) => problems.push(`${tag} request failed: ${r.url()}`));
    page.on('response', (r) => r.status() >= 400 && problems.push(`${tag} HTTP ${r.status()}: ${r.url()}`));
    await page.goto(url);
    await page.locator('.pkg:not(.dashed)').nth(name).click();
    await page.locator('svg.plansvg').waitFor();
    const tabs = await page.getByRole('navigation').first().getByRole('button').allInnerTexts();
    for (const t of tabs) {
      await page.getByRole('navigation').first().getByRole('button', { name: t, exact: true }).click();
      await page.waitForTimeout(150);
      if (!seen.has(`${lang}/${t}`)) {
        seen.add(`${lang}/${t}`);
      }
    }
    const text = await page.locator('body').innerText();
    // Words that mean a Spanish text leaked into the English interface (or the reverse).
    if (lang === 'en' && /\b(Batería|Guitarra|Cuña|Voz \d|Lista de|Guardar|Añadir)\b/.test(text)) problems.push(`${tag}: Spanish text in the English interface`);
    if (lang === 'es' && /\b(Add |Save |Drums|Wedge)\b/.test(text)) problems.push(`${tag}: English text in the Spanish interface`);
    await ctx.close();
  }
}
await browser.close();
console.log(problems.length === 0 ? 'no problems' : problems.join('\n'));
