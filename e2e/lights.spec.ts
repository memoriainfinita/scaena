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
  await L(page, 'Altura sobre la tarima (m) · Vara 1').fill('5.5');
  await L(page, 'Altura sobre la tarima (m) · Vara 1').press('Tab');
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

test('a focus point is set from the panel, moved with the keyboard and shown on the plan with its beam @a11y', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Plano', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('recorte');
  await page.getByRole('button', { name: /Añadir Recorte/ }).first().click();
  await page.getByRole('button', { name: 'Fijar punto de mira' }).click();
  const handle = page.getByRole('button', { name: /^Punto de mira de/ });
  await expect(handle).toBeVisible();
  await expect(page.getByLabel('Punto de mira X (m)')).toHaveValue('4');
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Punto de mira X (m)')).toHaveValue('4.1');
  await page.keyboard.press('Control+z');
  await expect(page.getByLabel('Punto de mira X (m)')).toHaveValue('4');
  const b = (await handle.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + 40, b.y + b.height / 2 + 20, { steps: 5 });
  await page.mouse.up();
  expect(Number(await page.getByLabel('Punto de mira X (m)').inputValue())).toBeGreaterThan(4.2);
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Quitar punto de mira' }).click();
  await expect(handle).toHaveCount(0);
});

test('work notes are added, ticked off and removed, and the new reports are offered @a11y', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Notas', exact: true }).click();
  await page.getByLabel('Nueva nota').fill('Reenfocar la calle 2');
  await page.getByRole('button', { name: 'Añadir', exact: true }).click();
  await expect(page.getByText('Reenfocar la calle 2')).toBeVisible();
  await page.getByRole('checkbox', { name: /Marcar como hecha/ }).check();
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Informes', exact: true }).click();
  for (const name of ['Recuento de equipo', 'Hoja resumen de canales', 'Notas de trabajo']) await expect(page.getByRole('button', { name })).toBeVisible();
  await page.getByRole('button', { name: 'Notas de trabajo' }).click();
  await expect(page.getByRole('table')).toContainText('Reenfocar la calle 2');
  await page.getByRole('button', { name: 'Luces', exact: true }).click();
  await page.getByRole('button', { name: 'Notas', exact: true }).click();
  await page.getByRole('button', { name: /Quitar nota/ }).click();
  await expect(page.getByText('Aún no hay notas de trabajo.')).toBeVisible();
});

test('magic sheet: an instrument is moved with the keyboard and the mouse, undone and reset @a11y', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Magic sheet', exact: true }).click();
  const sheet = page.getByRole('group', { name: /^Magic sheet: \d+ instrumentos/ });
  const reset = page.getByRole('button', { name: 'Restablecer disposición' });
  await expect(reset).toBeDisabled();
  const first = sheet.getByRole('button', { name: /^Instrumento, canal/ }).first();
  const id = (await first.getAttribute('data-id'))!;
  const circle = sheet.locator(`g.mi[data-id="${id}"] circle`);
  const cx = async () => Number(await circle.getAttribute('cx'));
  const before = await cx();
  await expect(sheet.locator('line[stroke-dasharray]').first()).toBeAttached(); // the hanging positions are drawn until the sheet is arranged
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(cx).toBe(before + 100);
  await expect(sheet.locator(`g.mi[data-id="${id}"]`)).toBeFocused(); // focus survives the redraw
  await expect(reset).toBeEnabled();
  await expect(sheet.locator('line[stroke-dasharray]')).toHaveCount(0);
  await page.keyboard.press('Shift+ArrowLeft');
  await expect.poll(cx).toBe(before - 400);
  const at = (await circle.boundingBox())!;
  await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
  await page.mouse.down();
  await page.mouse.move(at.x + at.width / 2 + 60, at.y + at.height / 2 + 30, { steps: 5 });
  await page.mouse.up();
  await expect.poll(cx).toBeGreaterThan(before - 400);
  expect((await axe(page)).violations).toEqual([]);
  await reset.click();
  await expect.poll(cx).toBe(before);
  await expect(reset).toBeDisabled();
  await expect(sheet.locator('line[stroke-dasharray]').first()).toBeAttached();
  await page.keyboard.press('Control+z'); // undo the reset: the arrangement is back
  await expect(reset).toBeEnabled();
});

test('the hanging plot report lists each mount with its total row', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Informes', exact: true }).click();
  await page.getByRole('button', { name: 'Plan de varas' }).click();
  const table = page.getByRole('table');
  await expect(table.getByRole('row').nth(1)).toContainText('1');
  await expect(table.getByRole('cell', { name: 'Total' }).first()).toBeVisible();
});

test('the section draws the stage deck and the raised areas, and mounts are measured from the deck @a11y', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  const dlg = page.getByRole('dialog', { name: 'Ajustes del montaje' });
  await dlg.getByLabel('Altura de la tarima (m)').fill('1.2');
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await page.getByRole('button', { name: 'Plano', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('tarima');
  await page.getByRole('button', { name: /Añadir Tarima/ }).first().click();
  await page.getByLabel('Altura sobre la tarima (m)', { exact: true }).fill('0.5');
  await page.getByLabel('Altura sobre la tarima (m)', { exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Luces', exact: true }).click();
  await page.getByRole('button', { name: 'Sección', exact: true }).click();
  const section = page.getByRole('img', { name: /Sección lateral/ });
  await expect(section).toContainText('Tarima · 1,2 m');
  await expect(section).toContainText('1,7 m'); // the riser's top: deck 1.2 m plus 0.5 m
  expect((await axe(page)).violations).toEqual([]);
});

test('the section draws the proscenium opening at the downstage edge, with its height', async ({ page }) => {
  await theatre(page);
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  const dlg = page.getByRole('dialog', { name: 'Ajustes del montaje' });
  await dlg.getByLabel('Altura de la boca (m)').fill('5');
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await page.getByRole('button', { name: 'Sección', exact: true }).click();
  await expect(page.getByRole('img', { name: /Sección lateral/ })).toContainText('Boca del proscenio · 5,0 m');
  // Switching the proscenium line off takes the opening out of the section too.
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  await dlg.getByRole('checkbox', { name: 'Boca del proscenio' }).uncheck();
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByRole('img', { name: /Sección lateral/ })).not.toContainText('Boca del proscenio');
});
