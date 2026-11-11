// Screenshots of the published site in English and dark, to look at: `node scripts/live-look.mjs [url]` (into test-results/live-*.png)
import { firefox } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'https://memoriainfinita.github.io/scaena/';
mkdirSync('test-results', { recursive: true });
const browser = await firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0', 'layout.css.prefers-color-scheme.content-override': 0 } });
const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 860 } });
const page = await ctx.newPage();
await page.goto(url);
await page.screenshot({ path: 'test-results/live-start-en-dark.png' });
await page.locator('.pkg:not(.dashed)').nth(5).click();
await page.locator('svg.plansvg').waitFor();
await page.mouse.move(5, 5);
await page.screenshot({ path: 'test-results/live-plot-en-dark.png' });
await page.getByRole('button', { name: 'Document', exact: true }).click();
await page.getByRole('img', { name: 'Page 1', exact: true }).waitFor({ timeout: 120000 });
await page.screenshot({ path: 'test-results/live-document-en-dark.png' });
await browser.close();
