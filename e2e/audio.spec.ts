import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const L = (page: Page, text: string) => page.getByLabel(text, { exact: true });
const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function inputs(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Entradas', exact: true }).click();
  await expect(L(page, 'Nombre · Canal 1')).toBeVisible();
}

test('a channel name is edited in the table and undone as one step @a11y', async ({ page }) => {
  await inputs(page);
  const name = L(page, 'Nombre · Canal 1');
  const before = await name.inputValue();
  await name.fill('Bombo in');
  await name.press('Tab');
  await expect(name).toHaveValue('Bombo in');
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(name).toHaveValue(before);
  expect((await axe(page)).violations).toEqual([]);
});

test('add and remove channels keep the numbers whole', async ({ page }) => {
  await inputs(page);
  await page.getByRole('button', { name: 'Añadir canal' }).click();
  await expect(page.getByText('18 canales')).toBeVisible();
  await expect(L(page, 'Nombre · Canal 18')).toBeVisible();
  await page.getByRole('button', { name: 'Quitar · Canal 2', exact: true }).click();
  await expect(page.getByText('17 canales')).toBeVisible();
  await expect(L(page, 'Nombre · Canal 18')).toHaveCount(0);
});

test('a condenser sets phantom power, and moving a row swaps the numbers', async ({ page }) => {
  await inputs(page);
  const mic = L(page, 'Micro o DI · Canal 1');
  await mic.fill('AKG C414 XLII');
  await mic.press('Tab');
  await expect(L(page, 'Fantasma · Canal 1')).toBeChecked();
  const first = await L(page, 'Nombre · Canal 1').inputValue();
  const second = await L(page, 'Nombre · Canal 2').inputValue();
  await page.getByRole('button', { name: 'Bajar · Canal 1', exact: true }).click();
  await expect(L(page, 'Nombre · Canal 1')).toHaveValue(second);
  await expect(L(page, 'Nombre · Canal 2')).toHaveValue(first);
});

test('a stereo pair shows on both channels', async ({ page }) => {
  await inputs(page);
  await L(page, 'Par estéreo · Canal 3').selectOption({ index: 1 });
  const other = await L(page, 'Par estéreo · Canal 3').inputValue();
  expect(other).not.toBe('');
  await L(page, 'Par estéreo · Canal 3').selectOption('');
  await expect(L(page, 'Par estéreo · Canal 3')).toHaveValue('');
});

test('focusing a row selects its element on the plan', async ({ page }) => {
  await inputs(page);
  await L(page, 'Nombre · Canal 1').focus();
  await expect(page.getByText('1 seleccionado', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Plano', exact: true }).click();
  await expect(page.locator('g.el[aria-pressed="true"]')).toHaveCount(1);
});

test('outputs: add one and the signal flow draws sources, desk and outputs @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Salidas', exact: true }).click();
  const n = await page.locator('table.editable tbody tr').count();
  await page.getByRole('button', { name: 'Añadir salida' }).click();
  await expect(L(page, `Tipo · Salida ${n + 1}`)).toBeVisible();
  await L(page, `Tipo · Salida ${n + 1}`).selectOption('main');
  const flow = page.getByRole('img', { name: 'Flujo de señal' });
  await expect(flow).toBeVisible();
  await expect(flow.getByText('Micros y DI').first()).toBeVisible();
  await expect(flow.getByText('Principal', { exact: false }).first()).toBeVisible();
  await L(page, 'Mesa de mezclas').fill('Behringer X32');
  await L(page, 'Mesa de mezclas').press('Tab');
  await expect(flow.getByText('Behringer X32')).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
});

test('a rack is built from its devices, flags too much gear and appears in the reports @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('rack');
  await page.getByRole('button', { name: /^Añadir Rack al plano/ }).first().click();
  await page.getByRole('button', { name: 'Montar el rack' }).click();
  await page.getByLabel('Unidades del rack (U)').fill('3');
  await page.getByLabel('Nuevo equipo').fill('Procesador');
  await page.getByRole('button', { name: 'Añadir', exact: true }).click();
  await page.getByLabel('Nuevo equipo').fill('Amplificador');
  await page.getByLabel('U', { exact: true }).fill('3');
  await page.getByRole('button', { name: 'Añadir', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sobran equipos: 4 U en un rack de 3 U' })).toBeVisible();
  await page.getByLabel('Unidades del rack (U)').fill('6');
  await expect(page.getByRole('status').filter({ hasText: '4 de 6 U' }).or(page.getByText('Ocupadas 4 de 6 U'))).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Subir Amplificador' }).click();
  await page.getByRole('button', { name: 'Informes', exact: true }).click();
  await page.getByRole('button', { name: 'Racks', exact: true }).click();
  await expect(page.getByRole('table')).toContainText('Amplificador');
});

test('patch and stage position are columns, a repeated patch warns and the warning can be muted @a11y', async ({ page }) => {
  await inputs(page);
  await expect(page.getByRole('columnheader', { name: 'Pos.' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Patch' })).toBeVisible();
  for (const n of [1, 2]) {
    await L(page, `Patch · Canal ${n}`).fill('SB A 1');
    await L(page, `Patch · Canal ${n}`).press('Tab');
  }
  await page.getByRole('button', { name: /^Avisos/ }).click();
  const dlg = page.getByRole('dialog', { name: 'Avisos' });
  await expect(dlg).toContainText('El patch «SB A 1» está en los canales 1 y 2');
  expect((await axe(page)).violations).toEqual([]);
  await dlg.getByRole('button', { name: /^Silenciar: El patch/ }).click();
  await expect(dlg).not.toContainText('El patch «SB A 1»');
  await dlg.getByRole('checkbox', { name: /Mostrar silenciados \(1\)/ }).check();
  await expect(dlg).toContainText('Silenciado.');
  await dlg.getByRole('button', { name: /^Reactivar: El patch/ }).click();
  await expect(dlg.getByRole('checkbox', { name: /Mostrar silenciados/ })).toHaveCount(0);
  await expect(dlg).toContainText('El patch «SB A 1» está en los canales 1 y 2');
});

test('wedges out of order are renumbered left to right with one button @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Salidas', exact: true }).click();
  const button = page.getByRole('button', { name: 'Numerar cuñas' });
  await expect(button).toBeDisabled();
  await L(page, 'Fuente · Salida 1').selectOption({ label: 'Cuña 4' });
  await L(page, 'Fuente · Salida 4').selectOption({ label: 'Cuña 1' });
  await expect(button).toBeEnabled();
  expect((await axe(page)).violations).toEqual([]);
  await button.click();
  await expect(button).toBeDisabled();
  await expect(L(page, 'Fuente · Salida 1').locator('option:checked')).toHaveText('Cuña 1');
  await expect(L(page, 'Fuente · Salida 4').locator('option:checked')).toHaveText('Cuña 4');
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(button).toBeEnabled();
});

test('a power outlet from the library comes labelled with the region voltage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('toma de corriente');
  await page.getByRole('button', { name: /^Añadir Toma de corriente/ }).first().click();
  await expect(page.getByLabel('Etiqueta', { exact: true })).toHaveValue(/^230 V/);
});
