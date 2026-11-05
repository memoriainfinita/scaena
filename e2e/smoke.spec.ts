import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

test('start screen: package list, no accessibility violations @a11y', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Nuevo montaje' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Banda de rock/ })).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
});

test('creates a rock show, edits it, undoes, and the editor has no violations @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('17 canales')).toBeVisible();
  await expect(page.getByText('14 elementos')).toBeVisible();

  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  await expect(page.getByText('15 elementos')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inspector' })).toBeVisible();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByText('14 elementos')).toBeVisible();
  await page.getByRole('button', { name: 'Rehacer' }).click();
  await expect(page.getByText('15 elementos')).toBeVisible();

  // Library search, with accents ignored.
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('bateria');
  await expect(page.getByRole('button', { name: /Añadir Batería de 5 piezas/ })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('zzzz');
  await expect(page.getByText('Sin resultados para «zzzz»')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('');

  // Layers: hiding one removes its elements from the drawing.
  await page.getByRole('checkbox', { name: 'Mostrar Eléctrica' }).uncheck();
  await page.getByRole('checkbox', { name: 'Bloquear Audio' }).check();
  expect((await axe(page)).violations).toEqual([]);
});

test('show settings turn a module on and the tab appears @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByRole('button', { name: 'Luces', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  const dlg = page.getByRole('dialog', { name: 'Ajustes del montaje' });
  await dlg.getByRole('checkbox', { name: 'Luces' }).check();
  await dlg.getByLabel('Papel').selectOption('Letter');
  expect((await axe(page)).violations).toEqual([]);
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByRole('button', { name: 'Luces', exact: true })).toBeVisible();
  await expect(page.getByText('Papel Letter')).toBeVisible();
});

test('Escape closes a dialog and focus returns to its opener', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  const opener = page.getByRole('button', { name: 'Exportar' });
  await opener.focus();
  await opener.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Exportar' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('language and theme switch the whole interface @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ajustes de la aplicación' }).click();
  await page.getByRole('combobox', { name: /^Tema/ }).selectOption('dark');
  await page.getByRole('combobox', { name: /^Idioma de la interfaz/ }).selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'New show' })).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: /Rock band/ }).click();
  await expect(page.getByText('17 channels')).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
});

test('keyboard shortcuts: ? opens help, Ctrl+Z undoes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  await expect(page.getByText('15 elementos')).toBeVisible();
  await page.keyboard.press('Control+z');
  await expect(page.getByText('14 elementos')).toBeVisible();
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: 'Atajos de teclado' })).toBeVisible();
});

test('autosave: a renamed show is there after a reload, and the .scaena downloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Cantautor/ }).click();
  const name = page.getByRole('textbox', { name: 'Nombre del montaje' });
  await name.fill('Mi concierto');
  await name.press('Tab');
  await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
  await page.waitForTimeout(1500);
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Nombre del montaje' })).toHaveValue('Mi concierto');
  await expect(page.getByText('4 canales')).toBeVisible();

  await page.getByRole('button', { name: 'Exportar' }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Archivo del montaje/ }).click()]);
  expect(download.suggestedFilename()).toBe('Mi-concierto.scaena');
  const bytes = readFileSync((await download.path())!);
  expect(bytes.subarray(0, 2).toString()).toBe('PK');

  // Home goes back to the start screen, where the show is listed as recent.
  await page.getByRole('button', { name: 'Inicio' }).click();
  await expect(page.getByRole('button', { name: /Mi concierto/ })).toBeVisible();
});

test('a file that is not a show shows an error and stays on the start screen', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({ name: 'roto.scaena', mimeType: 'application/zip', buffer: Buffer.from('no es un zip') });
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nuevo montaje' })).toBeVisible();
});

test('the service worker takes control and the app still loads offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nuevo montaje' })).toBeVisible();
  await context.setOffline(false);
});
