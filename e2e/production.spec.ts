import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function production(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  const dlg = page.getByRole('dialog', { name: 'Ajustes del montaje' });
  await dlg.getByRole('checkbox', { name: 'Producción' }).check();
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await page.getByRole('button', { name: 'Producción', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Secciones de producción' })).toBeVisible();
}

test('the setlist keeps order and total, and a bad length is refused with a message @a11y', async ({ page }) => {
  await production(page);
  await page.getByRole('button', { name: 'Añadir tema' }).click();
  await page.getByRole('button', { name: 'Añadir tema' }).click();
  await page.getByLabel('Título · 1', { exact: true }).fill('Primera');
  await page.getByLabel('Título · 2', { exact: true }).fill('Segunda');
  await page.getByLabel('Duración · 1', { exact: true }).fill('3:20');
  await page.getByLabel('Duración · 1', { exact: true }).press('Tab');
  await page.getByLabel('Duración · 2', { exact: true }).fill('4,5');
  await page.getByLabel('Duración · 2', { exact: true }).press('Tab');
  await expect(page.getByText('Total: 7:50')).toBeVisible();
  await page.getByLabel('Duración · 2', { exact: true }).fill('mucho');
  await expect(page.getByRole('alert')).toContainText('4:30');
  expect((await axe(page)).violations).toEqual([]);
  await page.getByLabel('Duración · 2', { exact: true }).fill('4:30');
  await page.getByRole('button', { name: 'Bajar · 1' }).click();
  await expect(page.getByLabel('Título · 1', { exact: true })).toHaveValue('Segunda');
});

test('the day schedule starts from usual milestones, sorts by time and flags a bad time @a11y', async ({ page }) => {
  await production(page);
  await page.getByRole('button', { name: 'Horario del día' }).click();
  await page.getByRole('button', { name: '+ Puertas' }).click();
  await page.getByRole('button', { name: '+ Carga' }).click();
  await page.getByLabel('Hora · 1', { exact: true }).fill('20:00');
  await page.getByLabel('Hora · 1', { exact: true }).press('Tab');
  await page.getByLabel('Hora · 2', { exact: true }).fill('14:00');
  await page.getByLabel('Hora · 2', { exact: true }).press('Tab');
  // The table reads in time order: the load-in comes first now.
  await expect(page.getByLabel('Qué · 1', { exact: true })).toHaveValue('Carga');
  await page.getByLabel('Hora · 1', { exact: true }).fill('8h');
  await expect(page.getByRole('note').filter({ hasText: '8:30 o 20:30' })).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
  // The warning panel knows too.
  await page.getByRole('button', { name: /^Avisos/ }).click();
  await expect(page.getByRole('dialog', { name: 'Avisos' }).getByText(/no tiene el formato/)).toBeVisible();
});

test('hospitality and contract are structured forms, and the document prints them @a11y', async ({ page }) => {
  test.setTimeout(120_000);
  await production(page);
  await page.getByRole('button', { name: 'Hospitalidad', exact: true }).click();
  await page.getByLabel('Camerinos', { exact: true }).fill('2');
  await page.getByLabel('Camerinos', { exact: true }).press('Tab');
  await page.getByLabel('Comida tras el show').check();
  await page.getByLabel('Compensación en efectivo en lugar de suministros').check();
  await page.getByLabel('Importe').fill('300 USD');
  await page.getByLabel('Importe').press('Tab');
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Contrato', exact: true }).click();
  await page.getByLabel('Caché').fill('1.500 €');
  await page.getByLabel('Caché').press('Tab');
  expect((await axe(page)).violations).toEqual([]);

  await page.getByRole('button', { name: 'Documento', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole('checkbox', { name: 'Hospitalidad' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Contrato' })).toBeChecked();
});

test('the day sheet downloads as a PDF', async ({ page }) => {
  test.setTimeout(120_000);
  await production(page);
  await page.getByRole('button', { name: 'Horario del día' }).click();
  await page.getByRole('button', { name: '+ Show' }).click();
  await page.getByLabel('Hora · 1', { exact: true }).fill('21:00');
  await page.getByLabel('Hora · 1', { exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Evento y hoja de ruta' }).click();
  await page.getByLabel('Dirección de la sala').fill('Calle Mayor 1');
  await page.getByLabel('Dirección de la sala').press('Tab');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90_000 }), page.getByRole('button', { name: 'Descargar la hoja de ruta (PDF)' }).click()]);
  expect(dl.suggestedFilename()).toBe('Banda-de-rock-hoja-de-ruta.pdf');
  const pdf = readFileSync((await dl.path())!);
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  mkdirSync('test-results', { recursive: true });
  writeFileSync('test-results/hoja-de-ruta.pdf', pdf);
});
