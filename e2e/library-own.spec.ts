import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
const start = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByRole('complementary', { name: 'Capas' }).or(page.getByRole('heading', { name: 'Capas' }))).toBeVisible();
};

test('your own layers: add, move an element to it, rename and remove @a11y', async ({ page }) => {
  await start(page);
  await page.getByLabel('Nombre de la capa nueva').fill('Vestuario');
  await page.getByRole('button', { name: 'Añadir capa' }).click();
  await expect(page.getByLabel('Nombre de la capa Vestuario')).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);

  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('Persona');
  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  const layer = page.getByRole('combobox', { name: 'Capa' });
  await expect(layer).toHaveValue('l-stage');
  await layer.selectOption({ label: 'Vestuario' });
  await expect(layer).toHaveValue('ly1');

  await page.getByLabel('Nombre de la capa Vestuario').fill('Atrezo');
  await expect(page.getByLabel('Nombre de la capa Atrezo')).toBeVisible();
  await page.getByRole('button', { name: /^Los elementos nuevos van a Atrezo/ }).focus();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowDown');

  await page.getByRole('button', { name: 'Quitar Atrezo' }).click();
  await expect(page.getByLabel('Nombre de la capa Atrezo')).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Capa' })).toHaveValue('l-stage');
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByLabel('Nombre de la capa Atrezo')).toBeVisible();
});

test('your own element: a drawing is cleaned, saved, placed, and kept while it is on the plan @a11y', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Crear elemento propio' }).click();
  const dlg = page.getByRole('dialog', { name: 'Elementos propios' });
  const file = dlg.getByLabel(/Dibujo \(SVG/);

  await file.setInputFiles({ name: 'no.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<html><body>hola</body></html>') });
  await expect(dlg.getByRole('alert')).toContainText('No es un SVG válido');
  await expect(dlg.getByRole('button', { name: 'Guardar elemento' })).toHaveCount(0);

  await file.setInputFiles('e2e/fixtures/mesa.svg');
  await expect(dlg.getByRole('img', { name: 'Vista previa del dibujo' })).toBeVisible();
  await expect(dlg.getByText(/Se han omitido 2 partes/)).toBeVisible();
  const preview = await dlg.getByRole('img', { name: 'Vista previa del dibujo' }).innerHTML();
  expect(preview).toContain('<circle');
  for (const bad of ['script', 'text', 'alert']) expect(preview).not.toContain(bad);
  await expect(dlg.getByLabel('Nombre', { exact: true })).toHaveValue('mesa');
  await expect(dlg.getByLabel('Ancho (m)')).toHaveValue('1');
  await expect(dlg.getByLabel('Fondo (m)')).toHaveValue('0.5');
  await dlg.getByLabel('Nombre', { exact: true }).fill('Mesa de regiduría');
  await dlg.getByLabel('Ancho (m)').fill('2');
  await dlg.getByLabel('Fondo (m)').fill('1');
  expect((await axe(page)).violations).toEqual([]);
  await dlg.getByRole('button', { name: 'Guardar elemento' }).click();
  await expect(dlg.getByRole('status')).toContainText('Elemento «Mesa de regiduría» guardado.');
  await expect(dlg.getByRole('button', { name: 'Borrar Mesa de regiduría' })).toBeEnabled();
  await page.keyboard.press('Escape');

  const before = Number((await page.getByText(/\d+ elementos/).textContent())!.match(/\d+/)![0]);
  await page.getByPlaceholder('Buscar en la biblioteca').fill('regiduria');
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('Mesa de regiduría');
  await page.getByRole('button', { name: 'Añadir Mesa de regiduría al plano' }).click();
  await expect(page.getByText(`${before + 1} elementos`)).toBeVisible();
  await expect(page.locator('g.el[aria-label="Mesa de regiduría"] circle')).toHaveCount(1);

  await page.getByRole('button', { name: 'Crear elemento propio' }).click();
  await expect(dlg.getByRole('button', { name: 'Borrar Mesa de regiduría' })).toBeDisabled();
});

test('a luminaire can be given a model from the Open Fixture Library, with its source and a note @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Teatro con micros/ }).click();
  // The element itself, not the middle of its box: its label and leader line make the box wider than the symbol.
  await page.locator('svg.plansvg g.el[aria-label="Fresnel 1"] rect.hit').first().click();
  const model = page.getByLabel('Modelo', { exact: true });
  await model.selectOption('ofl.etc.colorsource-par');
  await expect(page.getByText(/Datos aportados por voluntarios/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Fixture Library' })).toHaveAttribute('href', 'https://open-fixture-library.org/etc/colorsource-par');
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Luces', exact: true }).click();
  await expect(page.getByLabel('Potencia (W) · Fresnel 1', { exact: true })).toHaveValue('90');
  await expect(page.getByLabel('Modelo · Fresnel 1', { exact: true })).toHaveValue('ofl.etc.colorsource-par');
});

test('the drawing file for the test is what the page was written for', () => {
  expect(readFileSync('e2e/fixtures/mesa.svg', 'utf8')).toContain('<script>');
});
