// An accessibility pass over every view and every dialog, in the dark theme (project `app`) and the light one (`app-light`).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
const clean = async (page: Page) => expect((await axe(page)).violations).toEqual([]);

async function theatre(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Teatro con micros/ }).click();
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  const dlg = page.getByRole('dialog', { name: 'Ajustes del montaje' });
  await dlg.getByRole('checkbox', { name: 'Producción' }).check();
  await clean(page); // the settings dialog, with a module switched on
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('g.el').first()).toBeVisible();
}

test('every view and each of its sections has no violations @a11y', async ({ page }) => {
  test.setTimeout(120_000);
  await theatre(page);
  await clean(page);

  for (const view of ['Entradas', 'Salidas']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await clean(page);
  }
  await page.getByRole('button', { name: 'Luces', exact: true }).click();
  for (const tab of ['Instrumentos', 'Montajes', 'Eléctrica', 'Sección']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await clean(page);
  }
  await page.getByRole('button', { name: 'Producción', exact: true }).click();
  for (const tab of ['Setlist', 'Horario del día', 'Montaje', 'Hospitalidad', 'Contrato', 'Evento y hoja de ruta']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await clean(page);
  }
  await page.getByRole('button', { name: 'Informes', exact: true }).click();
  for (const report of ['Hookup de canales', 'Circuitos', 'Etiquetas']) {
    await page.getByRole('button', { name: report, exact: true }).click();
    await clean(page);
  }
  await page.getByRole('button', { name: 'Documento', exact: true }).click();
  await page.getByText('Datos del documento').click();
  await page.getByRole('button', { name: 'Añadir contacto' }).click();
  await clean(page);
  await expect(page.getByRole('img', { name: 'Página 1' })).toBeVisible({ timeout: 90_000 });
  await clean(page);
});

test('every dialog has no violations @a11y', async ({ page }) => {
  test.setTimeout(120_000);
  await theatre(page);
  for (const [opener, title] of [
    ['Ajustes de la aplicación', 'Aplicación'],
    ['Exportar', 'Exportar'],
    ['Revisiones', 'Revisiones'],
    [/^Avisos/, 'Avisos'],
    ['Fondo PDF o DXF', 'Fondo de plano'],
  ] as const) {
    await page.getByRole('button', { name: opener }).first().click();
    await expect(page.getByRole('dialog', { name: title })).toBeVisible();
    await clean(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: 'Atajos de teclado' })).toBeVisible();
  await clean(page);
});

test('the plan can be used with the keyboard alone @a11y', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.locator('g.el').first()).toBeVisible();
  // The first Tab stop is a skip link; Enter on it puts the focus on the first plan element (the library has fifty buttons before it).
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Saltar al contenido principal' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.matches('g.el[data-id]'))).toBe(true);
  // And the plan elements are plain Tab stops too: Tab goes on to the next one.
  const first = await page.evaluate(() => document.activeElement?.getAttribute('data-id'));
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('data-id'))).not.toBe(first);
  await page.keyboard.press('Shift+Tab');
  // Focusing selects it; the arrows move it, R turns it, and Ctrl+Z undoes both.
  await expect(page.getByText('1 seleccionado', { exact: true })).toBeVisible();
  const x = page.getByLabel('X (m)');
  const before = Number(await x.inputValue());
  await page.keyboard.press('ArrowRight');
  expect(Number(await x.inputValue())).toBeCloseTo(before + 0.5, 6);
  await page.keyboard.press('r');
  await expect(page.getByLabel('Giro')).toHaveValue('15');
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+z');
  expect(Number(await x.inputValue())).toBeCloseTo(before, 6);
});
