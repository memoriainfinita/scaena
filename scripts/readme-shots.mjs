// Takes the screenshots of the README into docs/img, in English: `pnpm build` first, then `node scripts/readme-shots.mjs`.
// Firefox, silent, light theme. It starts its own preview server on port 4186 and stops it at the end.
import { firefox } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { preview } from 'vite';

mkdirSync('docs/img', { recursive: true });
const server = await preview({ preview: { port: 4186, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
const base = 'http://127.0.0.1:4186/';
const browser = await firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0', 'layout.css.prefers-color-scheme.content-override': 1 } });

const fresh = async () => {
  const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 1440, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(base);
  return page;
};
const shot = async (page, name) => {
  await page.mouse.move(5, 5);
  await page.screenshot({ path: `docs/img/${name}.png` });
  console.log('wrote', name);
};

try {
  let page = await fresh();
  await shot(page, 'start');
  await page.getByRole('button', { name: /Rock band/ }).click();
  await page.locator('svg.plansvg').waitFor();
  await page.keyboard.press('0');
  await shot(page, 'plot');
  await page.getByRole('button', { name: 'Inputs', exact: true }).click();
  await shot(page, 'inputs');
  await page.close();

  page = await fresh();
  await page.getByRole('button', { name: /Theatre with headset mics/ }).click();
  await page.locator('svg.plansvg').waitFor();
  await page.getByRole('button', { name: 'Lights', exact: true }).click();
  await shot(page, 'lights');
  await page.getByRole('button', { name: 'Document', exact: true }).click();
  await page.getByRole('img', { name: 'Page 1' }).waitFor({ timeout: 120_000 });
  await page.waitForTimeout(1500);
  await shot(page, 'document');
} finally {
  await browser.close();
  await server.close();
}
