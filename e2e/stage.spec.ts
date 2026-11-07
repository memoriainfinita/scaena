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

const points = async (page: Page) => (await page.locator('svg.plansvg polygon').first().getAttribute('points'))!.split(' ');

test('the points of the stage are edited on the plan: drag, arrows, add, remove, undo @a11y', async ({ page }) => {
  await rock(page);
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar los puntos del escenario' }).click();
  // A rectangle becomes a free-form stage with its four corners, each with a handle and a "+" on its side.
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(4);
  await expect(page.locator('svg.plansvg g[data-mid]')).toHaveCount(4);
  expect(await points(page)).toEqual(['0,0', '8000,0', '8000,5000', '0,5000']);
  expect((await axe(page)).violations).toEqual([]);

  // Dragging a handle moves that corner, snapped to the grid, in one undo step.
  const h = (await page.locator('svg.plansvg g[data-vtx="2"] circle').boundingBox())!;
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(h.x + h.width / 2 - 60, h.y + h.height / 2 - 40, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => (await points(page))[2]).not.toBe('8000,5000');
  expect(await points(page)).toHaveLength(4);

  // Arrows move the focused point by a grid step; Shift by ten.
  await page.locator('svg.plansvg g[data-vtx="0"]').focus();
  await page.keyboard.press('ArrowRight');
  const px = async () => Number((await points(page))[0]!.split(',')[0]);
  await expect.poll(px).toBeGreaterThan(0);
  const x1 = await px();
  await page.keyboard.press('Shift+ArrowRight');
  await expect.poll(px).toBe(x1 * 11); // the grid step once, then ten more

  // The "+" on a side adds a point in its middle; Delete takes a point away, never below three.
  await page.locator('svg.plansvg g[data-mid="0"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(5);
  await page.locator('svg.plansvg g[data-vtx="1"]').focus();
  await page.keyboard.press('Delete');
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(4);
  await page.locator('svg.plansvg g[data-vtx="1"]').focus();
  await page.keyboard.press('Delete');
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(3);
  await page.locator('svg.plansvg g[data-vtx="1"]').focus();
  await page.keyboard.press('Delete');
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(3);

  // Undo walks back one change at a time.
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+z'); // the second delete, which did nothing, left no step: this is the first one
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(5);

  // Escape ends the editing; the stage stays as it is.
  await page.keyboard.press('Escape');
  await expect(page.locator('svg.plansvg g[data-vtx]')).toHaveCount(0);
  await expect(page.locator('svg.plansvg polygon').first()).toBeVisible();
});

test('reference lines and the proscenium follow a free-form stage', async ({ page }) => {
  await rock(page);
  const dlg = await openSettings(page);
  await dlg.getByRole('checkbox', { name: 'Escenario de forma libre' }).check();
  await dlg.getByLabel(/^Puntos/).fill('0; 0\n8; 0\n8; 3\n5; 6\n0; 3');
  // The reference lines can be switched on and off for a free-form stage too.
  await expect(dlg.getByRole('checkbox', { name: /Eje central/ })).toBeEnabled();
  await dlg.getByLabel('Ancho del proscenio (m)').fill('4');
  await dlg.getByLabel('Altura de la boca (m)').fill('5');
  await dlg.getByRole('button', { name: 'Aplicar' }).click();
  // Plaster line at the lowest side (6 m), proscenium walls either side of a 4 m opening, centre line at 4 m.
  const lines = await page.locator('svg.plansvg line').evaluateAll((els) => els.map((e) => [e.getAttribute('x1'), e.getAttribute('y1'), e.getAttribute('x2'), e.getAttribute('y2')].join(' ')));
  expect(lines).toContain('-300 6000 8300 6000');
  expect(lines).toContain('4000 0 4000 6300');
  expect(lines).toContain('-300 6000 2000 6000');
  expect(lines).toContain('6000 6000 8300 6000');
});
