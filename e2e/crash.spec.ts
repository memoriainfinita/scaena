import { expect, test } from '@playwright/test';

test('an error while drawing shows the error screen with a way out, not a blank page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('35 elementos')).toBeVisible();
  // Make the next draw throw: the status bar and the inspector format numbers.
  await page.evaluate(() => {
    const boom = () => {
      throw new Error('boom de prueba');
    };
    Number.prototype.toFixed = boom;
    Intl.NumberFormat = boom as never;
    Number.prototype.toLocaleString = boom;
  });
  await page.keyboard.press('Control+a'); // selects everything: the inspector and the status bar draw again
  const crashed = page.getByRole('alert').filter({ hasText: 'Algo ha fallado' });
  await expect(crashed).toBeVisible();
  await expect(page.getByRole('button', { name: 'Descargar una copia (.scaena)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recargar scaena' })).toBeVisible();
  await page.getByText('Detalle técnico').click();
  await expect(page.locator('pre')).toContainText(/\w+/); // the technical detail is there for whoever reports it
});
