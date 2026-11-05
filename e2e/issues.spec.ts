import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

test('the warnings dialog lists findings in words, filters them, and goes to the thing @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Teatro con micros/ }).click();
  const bar = page.getByRole('button', { name: /^Avisos · \d+ avisos?$/ });
  await expect(bar).toBeVisible();
  await bar.click();
  const dlg = page.getByRole('dialog', { name: 'Avisos' });
  await expect(dlg).toBeVisible();
  // The theatre package has lights with no model: a warning with its reason in text.
  await expect(dlg.getByText(/le falta: modelo/).first()).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
  // Filtering by severity hides the group.
  await dlg.getByRole('checkbox', { name: /^Aviso \(/ }).uncheck();
  await expect(dlg.getByText(/le falta: modelo/)).toHaveCount(0);
  await dlg.getByRole('checkbox', { name: /^Aviso \(/ }).check();
  // Going to a finding closes the dialog and selects its element on the plan.
  await dlg.getByRole('listitem').filter({ hasText: /le falta: modelo/ }).first().getByRole('button', { name: 'Ir al aviso' }).click();
  await expect(dlg).toHaveCount(0);
  await expect(page.getByText('1 seleccionado', { exact: true })).toBeVisible();
});

test('an unnamed channel shows a mark in its row with the reason, and the plan shows a badge', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Entradas', exact: true }).click();
  const name = page.getByLabel('Nombre · Canal 1', { exact: true });
  await name.fill('');
  await name.press('Tab');
  const mark = page.getByRole('img', { name: /^Aviso: Al canal 1 le falta: nombre corto/ });
  await expect(mark).toBeVisible();
  await page.getByRole('button', { name: 'Plano', exact: true }).click();
  // Rock has guitar amps and keys with no supplier set: tips show as badges on the plan.
  await expect(page.locator('g.el svg, g.el rect[rx="40"]').first()).toBeAttached();
});

test('warnings never block exporting', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Teatro con micros/ }).click();
  await page.getByRole('button', { name: 'Exportar' }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Archivo del montaje/ }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.scaena$/);
});

test('the warnings dialog of a simple show has no accessibility violations @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Cantautor/ }).click();
  await page.getByRole('button', { name: /^Avisos/ }).click();
  const dlg = page.getByRole('dialog', { name: 'Avisos' });
  await expect(dlg).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
});
