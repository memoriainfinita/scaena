import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

test('the elements table filters, edits in place and undoes @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('35 elementos')).toBeVisible();
  await page.getByRole('button', { name: 'Equipos', exact: true }).click();
  const nav = page.getByRole('navigation', { name: 'Secciones de equipos' });
  await expect(nav).toBeVisible();
  const rows = page.getByRole('row');
  const all = await rows.count();
  await page.getByRole('searchbox', { name: 'Buscar' }).fill('batería');
  const some = await rows.count();
  expect(some).toBeGreaterThan(1);
  expect(some).toBeLessThan(all);
  const notes = page.getByRole('textbox', { name: /^Notas · / }).first();
  await notes.fill('Revisar parches');
  await expect(notes).toHaveValue('Revisar parches');
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByRole('textbox', { name: /^Notas · / }).first()).toHaveValue('');
});

test('connections and video are tables of their own and the resolution is kept @a11y', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await page.getByRole('button', { name: /Muestra completa/ }).click();
  await page.getByRole('button', { name: 'Equipos', exact: true }).click();
  await page.getByRole('button', { name: 'Conexiones', exact: true }).click();
  await page.getByRole('combobox', { name: 'Señal', exact: true }).selectOption('video');
  const first = page.getByRole('textbox', { name: /^Resolución · / }).first();
  await first.fill('1920x1080 50p');
  await expect(first).toHaveValue('1920x1080 50p');
  await page.getByRole('button', { name: 'Vídeo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Conexiones de vídeo' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /^Resolución · / }).first()).toHaveValue('1920x1080 50p');
  await expect(page.getByRole('heading', { name: 'Salidas de vídeo de los ordenadores' })).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
});
