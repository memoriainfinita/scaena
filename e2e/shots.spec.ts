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
