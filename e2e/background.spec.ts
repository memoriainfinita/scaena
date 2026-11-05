import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('16 elementos')).toBeVisible();
}

async function importFile(page: Page, name: string) {
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await page.getByLabel('Elegir un PDF o un DXF').setInputFiles(fixture(name));
  await expect(page.locator('svg.plansvg image')).toHaveCount(1, { timeout: 20000 });
}

test('a PDF becomes the background, fitted in view, and the dialog has no violations @a11y', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  expect((await axe(page)).violations).toEqual([]);
  await page.getByLabel('Elegir un PDF o un DXF').setInputFiles(fixture('sala.pdf'));
  const img = page.locator('svg.plansvg image');
  await expect(img).toHaveCount(1, { timeout: 20000 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const w = Number(await img.getAttribute('width'));
  // The sample page is 640 pt wide: 225.8 mm on paper.
  expect(w).toBeGreaterThan(200);
  expect(w).toBeLessThan(260);
});

test('a DXF becomes the background too', async ({ page }) => {
  await start(page);
  await importFile(page, 'sala.dxf');
  const w = Number(await page.locator('svg.plansvg image').getAttribute('width'));
  expect(w).toBeGreaterThan(1000);
});

test('something that is neither PDF nor DXF is refused with a message', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await page.getByLabel('Elegir un PDF o un DXF').setInputFiles({ name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('hola') });
  await expect(page.getByRole('alert')).toContainText('Solo se admiten archivos PDF o DXF');
  await page.getByLabel('Elegir un PDF o un DXF').setInputFiles({ name: 'roto.dxf', mimeType: 'application/dxf', buffer: Buffer.from('esto no es un dxf') });
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('svg.plansvg image')).toHaveCount(0);
});

test('calibrating by two points rescales the background', async ({ page }) => {
  await start(page);
  await importFile(page, 'sala.dxf');
  const img = page.locator('svg.plansvg image');
  const before = Number(await img.getAttribute('width'));
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await page.getByRole('button', { name: 'Calibrar la escala' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'dos puntos' })).toBeVisible();
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.mouse.click(area.x + 300, area.y + 300);
  await page.mouse.click(area.x + 500, area.y + 300);
  await page.getByLabel('Distancia real (m)').fill('1');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByLabel('Distancia real (m)')).toHaveCount(0);
  await expect.poll(async () => Number(await img.getAttribute('width'))).not.toBe(before);
  // Undo brings the old scale back in one step.
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect.poll(async () => Number(await img.getAttribute('width'))).toBeCloseTo(before, 3);
});

test('opacity, removal and undo; the image travels in the .scaena and survives a reload', async ({ page }) => {
  await start(page);
  await importFile(page, 'sala.pdf');
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  const slider = page.getByLabel('Opacidad');
  await slider.fill('80');
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('svg.plansvg image')).toHaveAttribute('opacity', '0.8');
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await page.getByRole('button', { name: 'Quitar el fondo' }).click();
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('svg.plansvg image')).toHaveCount(0);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.locator('svg.plansvg image')).toHaveCount(1);

  // Export: the archive holds the PNG next to show.json.
  await page.getByRole('button', { name: 'Exportar' }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Archivo del montaje/ }).click()]);
  const bytes = readFileSync((await download.path())!);
  expect(bytes.includes(Buffer.from('images/background-'))).toBe(true);

  // Reload: the autosaved show comes back with its background.
  await page.waitForTimeout(1500);
  await page.reload();
  await expect(page.locator('svg.plansvg image')).toHaveCount(1, { timeout: 10000 });
});
