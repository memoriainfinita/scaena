// A check against the published site: opens a show, makes the PDF and goes offline. `node scripts/live-check.mjs [url]`
import { firefox } from '@playwright/test';

const url = process.argv[2] ?? 'https://memoriainfinita.github.io/scaena/';
const browser = await firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0' } });
const ctx = await browser.newContext({ locale: 'es-ES' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url);
await page.getByRole('button', { name: /Teatro con micros/ }).click();
await page.getByRole('button', { name: 'Documento', exact: true }).click();
const t0 = Date.now();
await page.getByRole('img', { name: 'Página 1' }).waitFor({ timeout: 120000 });
console.log('first PDF in', Date.now() - t0, 'ms');
await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
await page.reload();
await page.waitForFunction(() => !!navigator.serviceWorker.controller);
await ctx.setOffline(true);
await page.reload();
await page.getByRole('button', { name: 'Documento', exact: true }).click();
const t1 = Date.now();
await page.getByRole('img', { name: 'Página 1' }).waitFor({ timeout: 60000 });
console.log('offline PDF in', Date.now() - t1, 'ms; console errors:', errors.length, errors.slice(0, 3));
await browser.close();
