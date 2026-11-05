// Screenshots for the design docs. Only runs with SHOTS=<step>, e.g. `SHOTS=5 pnpm e2e e2e/shots.spec.ts --project=app`.
import { expect, test } from '@playwright/test';

const step = process.env.SHOTS;

test.skip(!step, 'set SHOTS=<step> to take the screenshots');

for (const theme of ['light', 'dark'] as const) {
  test(`plan with a selection, ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 860 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Ajustes de la aplicación' }).click();
    await page.getByRole('combobox', { name: /^Tema/ }).selectOption(theme);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /Banda de rock/ }).click();
    await expect(page.getByText('14 elementos')).toBeVisible();
    await page.keyboard.press('Control+a');
    await page.mouse.move(700, 400);
    await page.screenshot({ path: `docs/design/img/paso-${step}-plano-${theme}.png` });
  });
}

for (const [view, tab] of [['entradas', 'Entradas'], ['salidas', 'Salidas']] as const) {
  test(`audio view ${view}`, async ({ page }) => {
    test.skip(step !== '6');
    await page.setViewportSize({ width: 1440, height: 860 });
    await page.goto('/');
    await page.getByRole('button', { name: /Banda de rock/ }).click();
    await page.getByRole('button', { name: tab, exact: true }).click();
    await page.mouse.move(700, 700);
    await page.screenshot({ path: `docs/design/img/paso-6-${view}.png` });
  });
}

test('computer and connection', async ({ page }) => {
  test.skip(step !== '7');
  await page.setViewportSize({ width: 1440, height: 860 });
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  const search = page.getByRole('searchbox', { name: 'Buscar en la biblioteca' });
  await search.fill('portátil');
  await page.getByRole('button', { name: /Añadir Ordenador portátil/ }).click();
  await page.getByRole('combobox', { name: 'Nombre del programa' }).fill('QLab');
  await page.getByRole('button', { name: 'Añadir programa' }).click();
  await page.getByLabel('Sistema operativo').selectOption('windows');
  await search.fill('proyector');
  await page.getByRole('button', { name: /Añadir Proyector/ }).click();
  await page.getByRole('button', { name: 'Cable o conexión' }).click();
  const els = page.locator('g.el[data-id] .hit');
  const n = await els.count();
  const a = (await els.nth(n - 2).boundingBox())!;
  const b = (await els.nth(n - 1).boundingBox())!;
  await page.mouse.click(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.getByRole('button', { name: 'Seleccionar', exact: true }).click();
  await page.getByRole('button', { name: /Añadir/ }).first().focus();
  await page.mouse.click(a.x + a.width / 2, a.y + a.height / 2);
  await page.screenshot({ path: 'docs/design/img/paso-7-ordenador.png' });
});

for (const [name, tab] of [['instrumentos', 'Instrumentos'], ['electrica', 'Eléctrica'], ['seccion', 'Sección']] as const) {
  test(`lights ${name}`, async ({ page }) => {
    test.skip(step !== '8');
    await page.setViewportSize({ width: 1440, height: 860 });
    await page.goto('/');
    await page.getByRole('button', { name: /Teatro con micros/ }).click();
    await page.getByRole('button', { name: 'Luces', exact: true }).click();
    for (const n of [1, 2, 3]) {
      await page.getByLabel(`Modelo · Recorte ${n}`, { exact: true }).selectOption({ label: 'ETC Source Four 19°' });
      await page.getByLabel(`Circuito · Recorte ${n}`, { exact: true }).fill(String(n === 3 ? 2 : 1));
      await page.getByLabel(`Circuito · Recorte ${n}`, { exact: true }).press('Tab');
    }
    await page.getByRole('button', { name: 'Numerar instrumentos' }).click();
    await page.getByRole('button', { name: tab, exact: true }).click();
    await page.mouse.move(700, 800);
    await page.screenshot({ path: `docs/design/img/paso-8-${name}.png` });
  });
}

test('lights plan', async ({ page }) => {
  test.skip(step !== '8');
  await page.setViewportSize({ width: 1440, height: 860 });
  await page.goto('/');
  await page.getByRole('button', { name: /Teatro con micros/ }).click();
  await page.mouse.move(700, 800);
  await page.screenshot({ path: 'docs/design/img/paso-8-plano.png' });
});

test('issues dialog', async ({ page }) => {
  test.skip(step !== '9');
  await page.setViewportSize({ width: 1440, height: 860 });
  await page.goto('/');
  await page.getByRole('button', { name: /Teatro con micros/ }).click();
  await page.getByRole('button', { name: /^Avisos/ }).click();
  await page.screenshot({ path: 'docs/design/img/paso-9-avisos.png' });
});

test('background', async ({ page }) => {
  test.skip(step !== '10');
  await page.setViewportSize({ width: 1440, height: 860 });
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await page.getByLabel('Elegir un PDF o un DXF').setInputFiles('e2e/fixtures/sala.dxf');
  await expect(page.locator('svg.plansvg image')).toHaveCount(1, { timeout: 20000 });
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await page.screenshot({ path: 'docs/design/img/paso-10-fondo.png' });
});
