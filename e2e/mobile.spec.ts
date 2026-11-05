import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function rock(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.locator('g.el').first()).toBeVisible();
}

/** Two fingers as pointer events: the same thing a touch screen sends, without needing a touch driver. */
async function pinch(page: Page, from: number, to: number) {
  await page.evaluate(
    ([a, b]) => {
      const svg = document.querySelector('svg.plansvg')!;
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const fire = (type: string, id: number, x: number) => svg.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: id === 1, clientX: x, clientY: cy, button: 0, bubbles: true }));
      fire('pointerdown', 1, cx - a / 2);
      fire('pointerdown', 2, cx + a / 2);
      const steps = 6;
      for (let i = 1; i <= steps; i++) {
        const w = a + ((b - a) * i) / steps;
        fire('pointermove', 1, cx - w / 2);
        fire('pointermove', 2, cx + w / 2);
      }
      fire('pointerup', 2, cx + b / 2);
      fire('pointerup', 1, cx - b / 2);
    },
    [from, to] as const,
  );
}

test('on a phone the tabs sit at the bottom and the plan fills the screen @a11y', async ({ page }) => {
  await rock(page);
  const tabs = (await page.getByRole('navigation', { name: 'Vistas' }).boundingBox())!;
  expect(tabs.y + tabs.height).toBeGreaterThan(844 - 2);
  expect(tabs.width).toBeGreaterThan(380);
  const plan = (await page.locator('svg.plansvg').boundingBox())!;
  expect(plan.width).toBeGreaterThan(380);
  expect(plan.height).toBeGreaterThan(400);
  // The sheets are closed and out of reach until asked for.
  await expect(page.getByRole('searchbox', { name: 'Buscar en la biblioteca' })).toBeHidden();
  expect((await axe(page)).violations).toEqual([]);
});

test('the library is a sheet: open it, add an element, and it closes on its own button', async ({ page }) => {
  await rock(page);
  await page.getByRole('button', { name: 'Biblioteca', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Buscar en la biblioteca' })).toBeVisible();
  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  await expect(page.getByText('15 elementos')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar el panel' }).first().click();
  await expect(page.getByRole('searchbox', { name: 'Buscar en la biblioteca' })).toBeHidden();
});

test('tapping an element selects it, the inspector sheet shows it, and tapping the background lets go @a11y', async ({ page }) => {
  await rock(page);
  const hit = (await page.locator('g.el[data-id] .hit').first().boundingBox())!;
  await page.touchscreen.tap(hit.x + hit.width / 2, hit.y + hit.height / 2);
  await expect(page.getByText('1 seleccionado', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Inspector/ }).click();
  await expect(page.getByRole('heading', { name: 'Inspector' })).toBeVisible();
  await expect(page.getByLabel('X (m)')).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
  await page.getByRole('button', { name: 'Cerrar el panel' }).last().click();
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.touchscreen.tap(area.x + 8, area.y + area.height * 0.5);
  await expect(page.getByText('1 seleccionado', { exact: true })).toHaveCount(0);
});

test('two fingers zoom the plan about their centre, and the view stays put when they lift', async ({ page }) => {
  await rock(page);
  const cam = page.locator('svg.plansvg > g').first();
  const k = async () => Number(/scale\(([\d.]+)\)/.exec((await cam.getAttribute('transform'))!)![1]);
  const k0 = await k();
  await pinch(page, 60, 180);
  await expect.poll(k).toBeGreaterThan(k0 * 2.5);
  await expect.poll(k).toBeLessThan(k0 * 3.5);
  await pinch(page, 180, 60);
  await expect.poll(k).toBeCloseTo(k0, 1);
});

test('the menu holds what does not fit the top bar @a11y', async ({ page }) => {
  await rock(page);
  await expect(page.getByRole('button', { name: 'Exportar' })).toBeHidden();
  await page.getByRole('button', { name: 'Menú' }).click();
  const dlg = page.getByRole('dialog', { name: 'Menú' });
  await expect(dlg).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
  await dlg.getByRole('button', { name: 'Exportar' }).click();
  await expect(page.getByRole('dialog', { name: 'Exportar' })).toBeVisible();
});

test('the start screen and the document view fit a phone without sideways scrolling', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Nuevo montaje' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Documento', exact: true }).click();
  await expect(page.getByLabel('Plantilla')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('the app is installable: icons, maskable icon and a standalone manifest', async ({ page, request }) => {
  await page.goto('/');
  const manifest = await (await request.get('manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  const sizes = manifest.icons.map((i: { sizes: string; purpose: string }) => `${i.sizes}:${i.purpose}`);
  expect(sizes).toEqual(expect.arrayContaining(['192x192:any', '512x512:any', '512x512:maskable']));
  for (const icon of manifest.icons as { src: string }[]) expect((await request.get(icon.src)).ok()).toBe(true);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});
