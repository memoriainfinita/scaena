import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('14 elementos')).toBeVisible();
}

async function addLaptop(page: Page) {
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('portátil');
  await page.getByRole('button', { name: /Añadir Ordenador portátil/ }).click();
  await expect(page.getByRole('heading', { name: 'Ordenador' })).toBeVisible();
}

test('a laptop gets a computer panel; programs warn when the system lacks them @a11y', async ({ page }) => {
  await start(page);
  await addLaptop(page);
  await page.getByRole('combobox', { name: 'Nombre del programa' }).fill('QLab');
  await page.getByRole('button', { name: 'Añadir programa' }).click();
  await expect(page.getByRole('button', { name: 'Quitar QLab' })).toBeVisible();
  // No system stated: no warning.
  await expect(page.getByRole('note')).toHaveCount(0);
  await page.getByLabel('Sistema operativo').selectOption('windows');
  await expect(page.getByRole('note')).toContainText('QLab solo existe para macOS');
  expect((await axe(page)).violations).toEqual([]);
  await page.getByLabel('Sistema operativo').selectOption('macos');
  await expect(page.getByRole('note')).toHaveCount(0);
});

test('the last function of a computer cannot be switched off, and an output can be added', async ({ page }) => {
  await start(page);
  await addLaptop(page);
  const sound = page.getByRole('checkbox', { name: 'Sonido' });
  await expect(sound).toBeChecked();
  await expect(sound).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Vídeo', exact: true }).check();
  await sound.uncheck();
  await expect(sound).not.toBeChecked();
  await page.getByRole('button', { name: 'Añadir salida' }).click();
  await expect(page.getByLabel('Nota · Salida 1')).toBeVisible();
});

test('the connect tool joins two elements and the connection can be edited and undone @a11y', async ({ page }) => {
  await start(page);
  await addLaptop(page);
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('proyector');
  await page.getByRole('button', { name: /Añadir Proyector/ }).click();
  await page.getByRole('button', { name: 'Cable o conexión' }).click();
  await page.getByRole('button', { name: 'Vídeo', exact: true }).click();
  const els = page.locator('g.el[data-id] .hit');
  const n = await els.count();
  const a = (await els.nth(n - 2).boundingBox())!;
  const b = (await els.nth(n - 1).boundingBox())!;
  await page.mouse.click(a.x + a.width / 2, a.y + a.height / 2);
  await expect(page.getByRole('status').filter({ hasText: 'Conectando' })).toBeVisible();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await expect(page.getByRole('heading', { name: 'Conexiones' })).toBeVisible();
  const connector = page.getByLabel(/^Conector · /);
  await expect(connector).toHaveValue('HDMI');
  await connector.fill('SDI');
  await connector.press('Tab');
  await expect(connector).toHaveValue('SDI');
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: /^Quitar la conexión con/ }).click();
  await expect(page.getByText('Sin conexiones')).toBeVisible();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(connector).toHaveValue('SDI');
});
