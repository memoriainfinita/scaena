import { expect, test, type Page } from '@playwright/test';

async function rock(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('35 elementos')).toBeVisible();
  await expect(page.locator('g.el').first()).toBeVisible();
}

// WCAG 2.1.1 and 2.1.4: the plan's window-level keys must not take the keys of a focused control.

test('Space and Enter activate a focused toolbar button', async ({ page }) => {
  await rock(page);
  const tool = page.locator('.toolbar .tool').nth(2);
  await tool.focus();
  await page.keyboard.press('Space');
  await expect(tool).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.toolbar .tool').first().click();
  await expect(tool).toHaveAttribute('aria-pressed', 'false');
  await tool.focus();
  await page.keyboard.press('Enter');
  await expect(tool).toHaveAttribute('aria-pressed', 'true');
});

test('Space adds a library item and toggles a layer checkbox', async ({ page }) => {
  await rock(page);
  await page.locator('.lib-item').first().focus();
  await page.keyboard.press('Space');
  await expect(page.getByText('36 elementos')).toBeVisible();
  const eye = page.locator('.layer input[type=checkbox]').first();
  await eye.focus();
  const was = await eye.isChecked();
  await page.keyboard.press('Space');
  expect(await eye.isChecked()).toBe(!was);
});

test('a single-character shortcut acts on the canvas but not on a focused control', async ({ page }) => {
  await rock(page);
  const undo = page.getByRole('button', { name: 'Deshacer' });
  await expect(undo).toBeDisabled();
  // Focus on a toolbar button: R does not rotate.
  await page.locator('g.el[data-id]').first().focus(); // focusing an element selects it
  await page.locator('.toolbar .tool').first().focus();
  await page.keyboard.press('r');
  await expect(undo).toBeDisabled();
  // Focus on the plan element: R rotates the selection.
  await page.locator('g.el[data-id]').first().focus();
  await page.keyboard.press('r');
  await expect(undo).toBeEnabled();
});

test('arrow keys on a focused panel separator resize it and do not move the selection', async ({ page }) => {
  await rock(page);
  await page.locator('g.el[data-id]').first().focus(); // focusing an element selects it
  const undo = page.getByRole('button', { name: 'Deshacer' });
  await expect(undo).toBeDisabled();
  await page.getByRole('separator').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(undo).toBeDisabled();
});

test('the "?" shortcut opens the help from the canvas, not from a focused button', async ({ page }) => {
  await rock(page);
  await page.locator('.toolbar .tool').first().focus();
  await page.keyboard.press('?');
  await expect(page.getByRole('heading', { name: 'Atajos de teclado' })).toHaveCount(0);
  await page.locator('g.el[data-id]').first().focus();
  await page.keyboard.press('?');
  await expect(page.getByRole('heading', { name: 'Atajos de teclado' })).toBeVisible();
});
