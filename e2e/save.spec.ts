// What is saved, when, and what the top bar says about it.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
const status = (page: Page) => page.locator('.topbar [data-save]');

async function emptyShow(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Montaje vacío/ }).click();
  await expect(status(page)).toHaveAttribute('data-save', 'saved');
}

test('a change reads «Sin guardar» until it is written, and survives a reload made at once', async ({ page }) => {
  await emptyShow(page);
  const name = page.getByRole('textbox', { name: 'Nombre del montaje' });
  await name.fill('Nombre cambiado');
  await name.press('Tab');
  // Well inside the autosave delay: before, the top bar already said «Guardado» and the reload lost the name.
  await expect(status(page)).toHaveText('Sin guardar');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Nombre del montaje' })).toHaveValue('Nombre cambiado');
  await expect(status(page)).toHaveText('Guardado');
});

test('the label field stops at the limit of the file @a11y', async ({ page }) => {
  await emptyShow(page);
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('Persona');
  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  const label = page.locator('[data-label-field]');
  await label.fill('Dejar libre este pasillo. '.repeat(30)); // 780 characters
  await label.press('Tab');
  expect((await label.inputValue()).length).toBe(500);
  await expect(status(page)).toHaveText('Guardado');
  await page.reload();
  await expect(page.locator('g.el')).toHaveCount(1);
});

test('a show stored with a text over the limit opens cut, and says so @a11y', async ({ page }) => {
  await emptyShow(page);
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('Persona');
  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  await expect(status(page)).toHaveText('Guardado');
  // What a version without the limits left in the library: the label of the element, 900 characters long.
  await page.evaluate(
    () =>
      new Promise<void>((done, fail) => {
        const req = indexedDB.open('scaena');
        req.onerror = () => fail(req.error);
        req.onsuccess = () => {
          const tx = req.result.transaction('shows', 'readwrite');
          const store = tx.objectStore('shows');
          const all = store.getAll();
          all.onsuccess = () => {
            const record = all.result[0] as { data: { elements: Record<string, { label: string }> } };
            for (const el of Object.values(record.data.elements)) el.label = 'x'.repeat(900);
            store.put(record);
          };
          tx.oncomplete = () => done();
          tx.onerror = () => fail(tx.error);
        };
      }),
  );
  await page.reload();
  // Before, the show did not come back and opening it by hand said it was «de una versión más nueva».
  await expect(page.locator('g.el')).toHaveCount(1);
  await expect(page.getByText('Se ha recortado 1 valor que superaba el límite del archivo. Revisa los textos largos.')).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
  await page.locator('g.el').focus();
  expect((await page.locator('[data-label-field]').inputValue()).length).toBe(500);
  await page.getByRole('button', { name: 'Entendido' }).click();
  await expect(page.getByText(/Se ha recortado/)).toHaveCount(0);
});

test('a second tab with the same show: the one that saves later is told and does not erase the other', async ({ page, context }) => {
  await emptyShow(page);
  const other = await context.newPage();
  await other.goto('/'); // reopens the last show: the same one
  const otherName = other.getByRole('textbox', { name: 'Nombre del montaje' });
  await expect(otherName).toBeVisible();
  await otherName.fill('Desde la otra');
  await otherName.press('Tab');
  await expect(status(other)).toHaveText('Guardado');

  const name = page.getByRole('textbox', { name: 'Nombre del montaje' });
  await name.fill('Desde la primera');
  await name.press('Tab');
  await expect(page.locator('.topbar [data-save="error"]')).toContainText('otra pestaña');
  // Nothing was written over it: a reload brings back what the other tab saved.
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Nombre del montaje' })).toHaveValue('Desde la otra');
});
