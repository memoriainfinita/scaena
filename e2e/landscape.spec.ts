import { expect, test, type Page } from '@playwright/test';

// Phones turned sideways: 844x390 and 915x412 are common sizes; both use the compact layout (views on a rail, sheets from the right).
const noSideways = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// The plan is fitted to what is free, so turning the phone refits it and the desk never hides under the zoom bar or the buttons.
test('turning the phone refits the plan, clear of the floating controls, until it is moved by hand', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.locator('svg.plansvg').waitFor();
  const clear = async () => {
    const top = await page.evaluate(() => {
      const tops = [...document.querySelectorAll('.planbar.bottom, .fabs')].map((e) => e.getBoundingClientRect().top);
      return Math.min(...tops);
    });
    const desk = await page.locator('svg.plansvg g[data-id]').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)));
    return { top, desk };
  };
  const portrait = await clear();
  expect(portrait.desk).toBeLessThanOrEqual(portrait.top + 1);
  const wide = async () => (await page.locator('svg.plansvg g[data-id]').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().right)) - Math.min(...els.map((e) => e.getBoundingClientRect().left))));
  const wPortrait = await wide();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(async () => { const c = await clear(); return c.desk <= c.top + 1; }).toBe(true);
  expect(await wide()).toBeLessThan(844 - 100); // fitted in the new size, not left at the portrait zoom
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => Math.abs((await wide()) - wPortrait)).toBeLessThan(4); // and back to the same fit
  // After the user moves the view, turning the phone does not take it away from them.
  await page.getByRole('button', { name: /Acercar/ }).click();
  const zoomed = await wide();
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(400);
  expect(await wide()).toBeGreaterThan(zoomed * 0.5);
});

test('on a phone the document settings and the preview scroll as one page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Documento', exact: true }).click();
  const controls = page.getByRole('complementary', { name: /Ajustes del documento/ });
  await expect(controls).toBeVisible();
  const box = (await controls.boundingBox())!;
  const scrollable = await controls.evaluate((e) => e.scrollHeight - e.clientHeight);
  expect(scrollable).toBeLessThanOrEqual(1); // no scroll of its own inside the page
  expect(box.height).toBeGreaterThan(300);
});

for (const size of [{ width: 844, height: 390 }, { width: 915, height: 412 }]) {
  test(`landscape ${size.width}x${size.height}: the plan has room, the sheets fit and nothing scrolls sideways`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/');
    await page.getByRole('button', { name: /Banda de rock/ }).click();
    const plan = await page.locator('svg.plansvg').boundingBox();
    expect(plan!.height).toBeGreaterThan(size.height * 0.75);
    expect(await noSideways(page)).toBe(true);

    await page.getByRole('button', { name: 'Biblioteca', exact: true }).click();
    const lib = page.getByRole('complementary', { name: 'Biblioteca' });
    await expect(lib).toBeVisible();
    // The sheet slides in; measure once it has settled.
    await expect.poll(async () => (await lib.boundingBox())!.x + (await lib.boundingBox())!.width).toBeLessThanOrEqual(size.width + 1);
    const box = (await lib.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(39);
    expect(box.y + box.height).toBeLessThanOrEqual(size.height + 1);
    await page.screenshot({ path: `test-results/land/library-${size.width}.png` });
    await lib.getByRole('button', { name: 'Cerrar' }).click();

    await page.getByRole('button', { name: 'Inspector', exact: true }).click();
    const insp = page.getByRole('complementary', { name: 'Inspector' });
    await expect(insp).toBeVisible();
    await expect.poll(async () => (await insp.boundingBox())!.x + (await insp.boundingBox())!.width).toBeLessThanOrEqual(size.width + 1);
    await insp.getByRole('button', { name: 'Cerrar' }).click();

    for (const view of ['Entradas', 'Documento']) {
      await page.getByRole('button', { name: view, exact: true }).click();
      expect(await noSideways(page)).toBe(true);
      await page.screenshot({ path: `test-results/land/${view}-${size.width}.png` });
    }
  });
}
