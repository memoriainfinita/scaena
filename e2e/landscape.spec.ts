import { expect, test, type Page } from '@playwright/test';

// Phones turned sideways: 844x390 and 915x412 are common sizes; both use the compact layout (views on a rail, sheets from the right).
const noSideways = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

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
