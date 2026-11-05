import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function rock(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('16 elementos')).toBeVisible();
}

const openSettings = async (page: Page) => {
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  return page.getByRole('dialog', { name: 'Ajustes del montaje' });
};

test('a measured distance is kept as a dimension that reads its length and can be undone', async ({ page }) => {
  await rock(page);
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.getByRole('button', { name: 'Medir' }).click();
  await page.mouse.click(area.x + 200, area.y + 200);
  await page.mouse.click(area.x + 400, area.y + 200);
  await page.getByRole('button', { name: 'Fijar como cota' }).click();
  await expect(page.getByText('17 elementos')).toBeVisible();
  const dim = page.locator('g.el[aria-label="Cota"]');
  await expect(dim).toHaveCount(1);
  await expect(dim.locator('text')).toHaveText(/^[\d,]+ m$/);
  await page.keyboard.press('Control+z');
  await expect(page.getByText('16 elementos')).toBeVisible();
});

test('the stage takes a proscenium opening and the reference lines can be hidden', async ({ page }) => {
  await rock(page);
  const walls = page.locator('svg.plansvg g[aria-hidden="true"] line[stroke-width="4"]');
  await expect(walls).toHaveCount(2); // the rock package comes with a 6 m opening in an 8 m stage
  await expect(walls.first()).toHaveAttribute('x2', '1000');
  const dlg = await openSettings(page);
  await dlg.getByLabel('Ancho del proscenio (m)').fill('4');
  await dlg.getByRole('checkbox', { name: 'Eje central' }).uncheck();
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await expect(walls.first()).toHaveAttribute('x2', '2000');
  await expect(page.locator('svg.plansvg line[stroke-dasharray="14 6 2 6"]')).toHaveCount(1); // only the plaster line is left
  const again = await openSettings(page);
  await again.getByLabel('Ancho del proscenio (m)').fill('');
  await again.getByRole('button', { name: 'Aplicar' }).click();
  await expect(walls).toHaveCount(1); // no opening: one line across
});

test('a free-form stage is drawn from its points, and bad points are flagged @a11y', async ({ page }) => {
  await rock(page);
  const dlg = await openSettings(page);
  await dlg.getByRole('checkbox', { name: 'Escenario de forma libre' }).check();
  const points = dlg.getByLabel(/^Puntos/);
  await points.fill('0; 0\n6; 0\n6; 4\n3; 6\n0; 4');
  expect((await axe(page)).violations).toEqual([]);
  await points.fill('0; 0\n6; 0');
  await expect(dlg.getByRole('status')).toContainText('al menos tres puntos');
  await points.fill('0; 0\n6; 0\n6; 4\n3; 6\n0; 4');
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('svg.plansvg polygon')).toHaveCount(1);
  await expect(page.locator('svg.plansvg polygon')).toHaveAttribute('points', '0,0 6000,0 6000,4000 3000,6000 0,4000');
});
