import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('loads the app and has no accessibility violations @a11y', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'scaena' })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});
