import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function start(page: Page, pkg: RegExp) {
  await page.goto('/');
  await page.getByRole('button', { name: pkg }).click();
}

const downloaded = async (page: Page, click: () => Promise<void>) => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90_000 }), click()]);
  return { name: dl.suggestedFilename(), bytes: readFileSync((await dl.path())!) };
};

test('the reports view lists a report as a table and downloads it as CSV @a11y', async ({ page }) => {
  await start(page, /Teatro con micros/);
  await page.getByRole('button', { name: 'Informes', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Informes' })).toBeVisible();
  await page.getByRole('button', { name: 'Lista de instrumentos' }).click();
  await expect(page.getByRole('table')).toContainText('Fresnel 1');
  expect((await axe(page)).violations).toEqual([]);
  const f = await downloaded(page, () => page.getByRole('button', { name: 'Descargar CSV' }).click());
  expect(f.name).toBe('Teatro-con-micros-de-diadema-instruments.csv');
  expect(f.bytes.subarray(0, 3).toString('hex')).toBe('efbbbf'); // byte-order mark
  expect(f.bytes.toString('utf8')).toContain('Fresnel 1');
});

test('the export menu gives the plan as SVG and PNG and the lists as a zip of CSVs @a11y', async ({ page }) => {
  await start(page, /Banda de rock/);
  await page.getByRole('button', { name: 'Exportar' }).click();
  expect((await axe(page)).violations).toEqual([]);

  const svg = await downloaded(page, () => page.getByRole('button', { name: /Plano en SVG/ }).click());
  expect(svg.name).toBe('Banda-de-rock-plano.svg');
  const text = svg.bytes.toString('utf8');
  expect(text).toMatch(/^<svg [^>]*width="[\d.]+mm" height="[\d.]+mm"/);
  expect(text).toContain('Guitarra 1');

  const png = await downloaded(page, () => page.getByRole('button', { name: /Plano en PNG/ }).click());
  expect(png.bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.bytes.length).toBeGreaterThan(5000);

  const zip = await downloaded(page, () => page.getByRole('button', { name: /Listas en CSV/ }).click());
  expect(zip.name).toBe('Banda-de-rock-listas.zip');
  expect(zip.bytes.subarray(0, 2).toString()).toBe('PK');
  expect(zip.bytes.includes(Buffer.from('inputs.csv'))).toBe(true);
});

test('the plan alone and the whole rider come out as PDFs', async ({ page }) => {
  test.setTimeout(150_000);
  await start(page, /Banda de rock/);
  await page.getByRole('button', { name: 'Exportar' }).click();
  const plan = await downloaded(page, () => page.getByRole('button', { name: /Plano en PDF/ }).click());
  expect(plan.name).toBe('Banda-de-rock-plano.pdf');
  expect(plan.bytes.subarray(0, 5).toString()).toBe('%PDF-');
  const rider = await downloaded(page, () => page.getByRole('button', { name: /Rider en PDF/ }).click());
  expect(rider.name).toBe('Banda-de-rock.pdf');
  expect(rider.bytes.length).toBeGreaterThan(plan.bytes.length);
});

test('revisions: save two, read what changed, compare, restore and undo, and make the update sheet @a11y', async ({ page }) => {
  test.setTimeout(150_000);
  await start(page, /Banda de rock/);
  await page.getByRole('button', { name: 'Revisiones' }).click();
  const dlg = page.getByRole('dialog', { name: 'Revisiones' });
  await dlg.getByLabel('Nota de la revisión').fill('Primera');
  await dlg.getByRole('button', { name: 'Guardar revisión' }).click();
  await expect(dlg.getByText('Revisión 1 guardada.')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('Persona');
  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  await expect(page.getByText('36 elementos')).toBeVisible();
  await page.getByRole('button', { name: 'Revisiones' }).click();
  await dlg.getByLabel('Nota de la revisión').fill('Con una persona más');
  await dlg.getByRole('button', { name: 'Guardar revisión' }).click();
  await expect(dlg.getByText('Revisión 2 guardada.')).toBeVisible();
  await expect(dlg.getByText(/Añadido: Persona/)).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);

  await dlg.getByRole('listitem').filter({ hasText: 'Revisión 1' }).getByRole('button', { name: 'Comparar con el actual' }).click();
  await expect(dlg.getByRole('region', { name: /Cambios desde la revisión 1/ })).toContainText('Añadido: Persona');

  await dlg.getByRole('combobox', { name: /^Desde/ }).selectOption('1');
  await dlg.getByRole('combobox', { name: /^Hasta/ }).selectOption('2');
  await dlg.getByRole('button', { name: 'Comparar', exact: true }).click();
  await expect(dlg.getByRole('region', { name: 'Cambios de la revisión 1 a la 2' })).toContainText('Añadido: Persona');
  await dlg.getByRole('combobox', { name: /^Desde/ }).selectOption('2');
  await dlg.getByRole('combobox', { name: /^Hasta/ }).selectOption('1');
  await dlg.getByRole('button', { name: 'Comparar', exact: true }).click();
  await expect(dlg.getByRole('region', { name: 'Cambios de la revisión 2 a la 1' })).toContainText(/Quitado: Persona/);
  await dlg.getByRole('combobox', { name: /^Hasta/ }).selectOption('current');
  await dlg.getByRole('combobox', { name: /^Desde/ }).selectOption('1');
  await dlg.getByRole('button', { name: 'Comparar', exact: true }).click();
  await expect(dlg.getByRole('region', { name: 'Cambios de la revisión 1 al estado actual' })).toContainText('Añadido: Persona');

  await dlg.getByRole('listitem').filter({ hasText: 'Revisión 1' }).getByRole('button', { name: 'Restaurar' }).click();
  await expect(dlg.getByText(/Revisión 1 restaurada/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('35 elementos')).toBeVisible();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByText('36 elementos')).toBeVisible();

  await page.getByRole('button', { name: 'Revisiones' }).click();
  const sheet = await downloaded(page, () => dlg.getByRole('listitem').filter({ hasText: 'Revisión 2' }).getByRole('button', { name: 'Hoja de actualización' }).click());
  expect(sheet.name).toBe('Banda-de-rock-rev2.pdf');
  expect(sheet.bytes.subarray(0, 5).toString()).toBe('%PDF-');
});

test('the local library: duplicate, own templates, and a confirmed delete', async ({ page }) => {
  await start(page, /Cantautor/);
  await page.getByRole('button', { name: 'Exportar' }).click();
  await page.getByRole('button', { name: /Guardar como plantilla propia/ }).click();
  await expect(page.getByText('Plantilla guardada en este navegador.')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Inicio' }).click();

  const library = page.locator('.side-card', { has: page.getByRole('heading', { name: 'Recientes' }) });
  await expect(library).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mis plantillas' })).toBeVisible();
  await library.getByRole('button', { name: /^Duplicar Cantautor/ }).click();
  await expect(library.getByText('Cantautor o dúo acústico (copia)')).toBeVisible();

  // Deleting asks twice: the first click arms it.
  const del = library.getByRole('button', { name: /^Eliminar Cantautor o dúo acústico \(copia\)/ });
  await del.click();
  await expect(library.getByText('Cantautor o dúo acústico (copia)')).toBeVisible();
  await library.getByRole('button', { name: /^Confirmar: eliminar Cantautor o dúo acústico \(copia\)/ }).click();
  await expect(library.getByText('Cantautor o dúo acústico (copia)')).toHaveCount(0);

  // A show from the template opens ready to use.
  await page.locator('.side-card', { has: page.getByRole('heading', { name: 'Mis plantillas' }) }).getByRole('button', { name: /Cantautor/ }).first().click();
  await expect(page.getByText('4 canales')).toBeVisible();
});

test('the plan is exported as a DXF that CAD programs can read', async ({ page }) => {
  await start(page, /Banda de rock/);
  await page.getByRole('button', { name: 'Exportar' }).click();
  const dxf = await downloaded(page, () => page.getByRole('button', { name: /Plano en DXF/ }).click());
  expect(dxf.name).toBe('Banda-de-rock-plano.dxf');
  const text = dxf.bytes.toString('latin1');
  expect(text.startsWith('  0' + String.fromCharCode(13, 10) + 'SECTION')).toBe(true);
  expect(text).toContain('AC1009');
  expect(text).toContain('STAGE-OUTLINE');
  expect(text.split(String.fromCharCode(10) + 'LINE' + String.fromCharCode(13)).length - 1).toBeGreaterThan(100);
  expect(text.trimEnd().endsWith('EOF')).toBe(true);
});
