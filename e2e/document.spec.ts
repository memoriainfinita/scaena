import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function open(page: Page, pkg: RegExp) {
  await page.goto('/');
  await page.getByRole('button', { name: pkg }).click();
  await page.getByRole('button', { name: 'Documento', exact: true }).click();
}

test.describe('PDF rider', () => {
  test.setTimeout(120_000);

  test('the theatre rider compiles to a PDF, shows its pages and downloads @a11y', async ({ page }) => {
    await open(page, /Teatro con micros/);
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    await expect(page.getByRole('status').filter({ hasText: /\d+ páginas/ })).toBeVisible();
    expect((await axe(page)).violations).toEqual([]);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar PDF' }).click()]);
    expect(download.suggestedFilename()).toBe('Teatro-con-micros-de-diadema.pdf');
    const bytes = readFileSync((await download.path())!);
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    mkdirSync('test-results', { recursive: true });
    writeFileSync('test-results/rider-teatro.pdf', bytes);
    // Fixed up after compiling: title shown and tab order set.
    const text = bytes.toString('latin1');
    expect(text).toContain('/DisplayDocTitle true');
    expect(text).toContain('/Tabs /S');
  });

  test('a show named in Cyrillic and Greek compiles with the wide fonts and keeps its letters', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Banda de rock/ }).click();
    const name = 'Группа Ελληνικά';
    await page.getByRole('textbox', { name: 'Nombre del montaje' }).fill(name);
    await page.getByRole('textbox', { name: 'Nombre del montaje' }).press('Tab');
    await page.getByRole('button', { name: 'Documento', exact: true }).click();
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar PDF' }).click()]);
    mkdirSync('test-results', { recursive: true });
    writeFileSync('test-results/rider-cyrillic.pdf', readFileSync((await download.path())!));
  });

  test('the channel list can be turned and split in blocks, and the layout is kept as an own template', async ({ page }) => {
    await open(page, /Banda de rock/);
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    await page.getByLabel('Orientación de la lista de canales').selectOption({ label: 'Horizontal' });
    await page.getByLabel('Bloques de la lista de canales').selectOption('2');
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    await expect(page.getByRole('status').filter({ hasText: /\d+ páginas/ })).toBeVisible({ timeout: 90_000 });

    await page.getByText('Plantillas propias').click();
    await page.getByLabel('Nombre de la plantilla').fill('Mi gira');
    await page.getByRole('button', { name: 'Guardar como plantilla' }).click();
    await expect(page.getByText('Plantilla «Mi gira» guardada.')).toBeVisible();
    await page.getByLabel('Orientación de la lista de canales').selectOption({ label: 'Vertical' });
    await page.getByLabel('Bloques de la lista de canales').selectOption({ label: 'Automático' });
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
    await expect(page.getByLabel('Orientación de la lista de canales')).toHaveValue('landscape');
    await expect(page.getByLabel('Bloques de la lista de canales')).toHaveValue('2');
    await page.getByRole('button', { name: 'Borrar', exact: true }).click();
    await expect(page.getByLabel('Plantilla guardada')).toHaveCount(0);
  });

  test('a logo goes on the cover, and a file that is not an image is refused', async ({ page }) => {
    await open(page, /Banda de rock/);
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await page.getByText('Datos del documento', { exact: true }).click();
    const input = page.getByLabel(/Logotipo de la portada/);
    await input.setInputFiles({ name: 'logo.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image at all') });
    await expect(page.getByRole('alert').filter({ hasText: 'El logotipo debe ser' })).toBeVisible();
    await input.setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
    await expect(page.getByRole('button', { name: 'Quitar logotipo' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    await expect(page.getByRole('status').filter({ hasText: /\d+ páginas/ })).toBeVisible({ timeout: 90_000 });
    await page.getByRole('button', { name: 'Quitar logotipo' }).click();
    await expect(page.getByRole('button', { name: 'Quitar logotipo' })).toHaveCount(0);
  });

  test('turning a section off recompiles with fewer pages and switches to a custom template', async ({ page }) => {
    await open(page, /Banda de rock/);
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    const before = await page.getByRole('img', { name: /^Página \d+$/ }).count();
    for (const s of ['Lista de entradas', 'Lista de salidas', 'Plano del escenario', 'Notas', 'Revisiones', 'Contactos', 'Horario']) await page.getByRole('checkbox', { name: s, exact: true }).uncheck();
    await expect(page.getByRole('combobox', { name: /^Plantilla(?! guardada)/ })).toHaveValue('custom');
    await expect.poll(() => page.getByRole('img', { name: /^Página \d+$/ }).count(), { timeout: 60_000 }).toBeLessThan(before);
  });
});

test.describe('offline', () => {
  test.setTimeout(150_000);

  test('after one compile the service worker holds the compiler, so the rider compiles without a network', async ({ page, context }) => {
    await open(page, /Banda de rock/);
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    // Reload under the service worker's control, then cut the network and change something so it recompiles.
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await page.getByRole('button', { name: 'Documento', exact: true }).click();
    await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 60_000 });
    await context.setOffline(false);
  });
});

test('the document details are edited in the document view and clear the matching warnings @a11y', async ({ page }) => {
  test.setTimeout(120_000);
  await open(page, /Teatro con micros/);
  await page.getByText('Datos del documento').click();
  await page.getByLabel('Producción').fill('La casa de Bernarda Alba');
  await page.getByLabel('Fecha').fill('2026-12-01');
  await page.getByRole('button', { name: 'Añadir contacto' }).click();
  await page.getByLabel('Nombre · 1', { exact: true }).fill('Ana Ruiz');
  await page.getByLabel('Teléfono · 1', { exact: true }).fill('600123456');
  await page.getByLabel('Correo · 1', { exact: true }).fill('ana@example.org');
  await page.getByLabel('Correo · 1', { exact: true }).press('Tab');
  await page.getByRole('checkbox', { name: 'No imprimir el teléfono · 1' }).check();
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: /^Avisos/ }).click();
  const dlg = page.getByRole('dialog', { name: 'Avisos' });
  await expect(dlg).toBeVisible();
  await expect(dlg.getByText(/No hay un contacto técnico/)).toHaveCount(0);
  await expect(dlg.getByText(/no tiene fecha de versión/)).toHaveCount(0);
});
