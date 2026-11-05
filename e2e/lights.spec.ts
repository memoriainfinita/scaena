import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const L = (page: Page, text: string) => page.getByLabel(text, { exact: true });
const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function theatre(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Teatro con micros/ }).click();
  await page.getByRole('button', { name: 'Luces', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Secciones de luces' })).toBeVisible();
}

test('instruments are listed with their mount, numbered, and edited in the table @a11y', async ({ page }) => {
  await theatre(page);
  await expect(page.getByLabel('Montaje · Recorte 1', { exact: true })).toHaveValue(/m\d+/);
  await page.getByRole('button', { name: 'Numerar instrumentos' }).click();
  const units = await page.locator('input[aria-label^="Unidad ·"]').evaluateAll((els) => els.map((e) => Number((e as HTMLInputElement).value)).sort((a, b) => a - b));
  expect(units.length).toBeGreaterThan(2);
  expect(units).toEqual(units.map((_, i) => i + 1));
  await L(page, 'Canal · Recorte 1').fill('21');
  await L(page, 'Canal · Recorte 1').press('Tab');
  await expect(L(page, 'Canal · Recorte 1')).toHaveValue('21');
  await L(page, 'Modelo · Recorte 1').selectOption({ label: 'ETC Source Four 19°' });
  await expect(L(page, 'Potencia (W) · Recorte 1')).toHaveValue('750');
  await expect(page.getByRole('region', { name: 'Recuento por montaje' })).toContainText('Vara 1');
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(L(page, 'Modelo · Recorte 1')).toHaveValue('');
});

test('mounts: a load limit flags an overloaded bar and the section draws it @a11y', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Montajes', exact: true }).click();
  await L(page, 'Carga máx. (kg) · Vara 1').fill('1');
  await L(page, 'Carga máx. (kg) · Vara 1').press('Tab');
  await L(page, 'Altura (m) · Vara 1').fill('5.5');
  await L(page, 'Altura (m) · Vara 1').press('Tab');
  // Weights are empty until a model is picked, so the bar is not overloaded yet.
  await expect(page.getByRole('note')).toHaveCount(0);
  await page.getByRole('button', { name: 'Instrumentos', exact: true }).click();
  for (const n of [1, 2, 3]) await L(page, `Modelo · Recorte ${n}`).selectOption({ label: 'ETC Source Four 19°' });
  await expect(page.getByRole('note').first()).toContainText('Supera la carga máxima');
  await page.getByRole('button', { name: 'Sección', exact: true }).click();
  await expect(page.getByRole('img', { name: /Sección lateral/ })).toContainText('Vara 1');
  await expect(page.getByRole('img', { name: /Sección lateral/ })).toContainText('5,5 m');
  expect((await axe(page)).violations).toEqual([]);
});

test('electrical: circuits give power and amps, and phases add up @a11y', async ({ page }) => {
  await theatre(page);
  for (const n of [1, 2, 3]) {
    await L(page, `Modelo · Recorte ${n}`).selectOption({ label: 'ETC Source Four 19°' });
    await L(page, `Circuito · Recorte ${n}`).fill(String(n === 3 ? 2 : 1));
    await L(page, `Circuito · Recorte ${n}`).press('Tab');
  }
  await page.getByRole('button', { name: 'Eléctrica', exact: true }).click();
  const circuits = page.getByRole('table', { name: 'Circuitos' });
  await expect(circuits.getByRole('row')).toHaveCount(3); // header and two circuits
  await L(page, 'Fase · Circuito 1').selectOption('1');
  await expect(page.getByRole('table', { name: 'Fases' })).toContainText('L1');
  expect((await axe(page)).violations).toEqual([]);
});

test('a new light from the library is an instrument, and the plan draws the bar', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Plano', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('fresnel');
  await page.getByRole('button', { name: /Añadir Fresnel/ }).click();
  await expect(page.getByRole('heading', { name: 'Instrumento' })).toBeVisible();
  await expect(page.locator('svg.plansvg')).toContainText('Vara 1');
  await page.getByRole('button', { name: 'Luces', exact: true }).click();
  await expect(page.getByLabel(/^Unidad · Fresnel/).first()).toBeVisible();
});
