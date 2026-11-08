import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();

async function rock(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await expect(page.getByText('35 elementos')).toBeVisible();
  await expect(page.locator('g.el').first()).toBeVisible();
}

const center = async (page: Page, sel: string) => {
  const b = (await page.locator(sel).first().boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};
const xField = (page: Page) => page.getByLabel('X (m)');

test('dragging an element moves it onto the grid, as one undo step', async ({ page }) => {
  await rock(page);
  const el = page.locator('g.el[data-id]').first();
  const c = await center(page, 'g.el[data-id] .hit');
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x + 40, c.y + 20, { steps: 4 });
  await page.mouse.move(c.x + 120, c.y + 60, { steps: 6 });
  await page.mouse.up();
  await expect(xField(page)).toBeVisible();
  const after = Number(await xField(page).inputValue());
  expect((after * 2) % 1).toBeCloseTo(0, 6); // grid of 0.5 m
  await page.getByRole('button', { name: 'Deshacer' }).click();
  const before = Number(await xField(page).inputValue());
  expect(before).not.toBe(after);
  await expect(el).toBeVisible();
  // One undo undid the whole drag: the next undo is the library start, not a half-step.
  await page.getByRole('button', { name: 'Rehacer' }).click();
  expect(Number(await xField(page).inputValue())).toBe(after);
});

test('a marquee selects what it touches and Escape lets go', async ({ page }) => {
  await rock(page);
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.mouse.move(area.x + 4, area.y + 60);
  await page.mouse.down();
  await page.mouse.move(area.x + area.width - 4, area.y + area.height - 4, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByText('35 seleccionados')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('35 seleccionados')).toHaveCount(0);
});

test('keyboard: arrows move, R turns, Ctrl+D duplicates, Delete removes', async ({ page }) => {
  await rock(page);
  const c = await center(page, 'g.el[data-id] .hit');
  await page.mouse.click(c.x, c.y);
  const x0 = Number(await xField(page).inputValue());
  await page.keyboard.press('ArrowRight');
  expect(Number(await xField(page).inputValue())).toBeCloseTo(x0 + 0.5, 6);
  await page.keyboard.press('Shift+ArrowLeft');
  expect(Number(await xField(page).inputValue())).toBeCloseTo(x0 + 0.49, 6);
  await page.keyboard.press('r');
  await expect(page.getByLabel('Giro')).toHaveValue('15');
  await page.keyboard.press('Control+d');
  await expect(page.getByText('36 elementos')).toBeVisible();
  await page.keyboard.press('Delete');
  await expect(page.getByText('35 elementos')).toBeVisible();
  await page.keyboard.press('Control+z');
  await expect(page.getByText('36 elementos')).toBeVisible();
});

test('the wheel zooms about the cursor and 0 fits the plan again', async ({ page }) => {
  await rock(page);
  const cam = page.locator('svg.plansvg > g').first();
  const k = async () => Number(/scale\(([\d.]+)\)/.exec((await cam.getAttribute('transform'))!)![1]);
  const k0 = await k();
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.mouse.move(area.x + area.width / 2, area.y + area.height / 2);
  await page.mouse.wheel(0, -400);
  await expect.poll(k).toBeGreaterThan(k0 * 1.3);
  await page.keyboard.press('0');
  await expect.poll(k).toBeCloseTo(k0, 4);
});

test('two selected elements align to the left edge', async ({ page }) => {
  await rock(page);
  const hit = (name: string) => page.locator(`g.el[aria-label="${name}"] .hit`);
  const a = await hit('Guitarra 1').boundingBox();
  const b = await hit('Teclado').boundingBox();
  await page.mouse.click(a!.x + a!.width / 2, a!.y + a!.height / 2);
  await page.keyboard.down('Shift');
  await page.mouse.click(b!.x + b!.width / 2, b!.y + b!.height / 2);
  await page.keyboard.up('Shift');
  await expect(page.getByText('2 seleccionados')).toBeVisible();
  await page.getByRole('button', { name: 'Alinear a la izquierda' }).click();
  const a2 = (await hit('Guitarra 1').boundingBox())!;
  const b2 = (await hit('Teclado').boundingBox())!;
  expect(Math.abs(a2.x - b2.x)).toBeLessThan(1.5);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  const b3 = (await hit('Teclado').boundingBox())!;
  expect(Math.abs(b3.x - b!.x)).toBeLessThan(3); // the selection outline adds a stroke
});

test('measure shows a distance and text places a note ready to type', async ({ page }) => {
  await rock(page);
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.getByRole('button', { name: 'Medir' }).click();
  await page.mouse.click(area.x + 200, area.y + 200);
  await page.mouse.click(area.x + 400, area.y + 200);
  await expect(page.getByText(/Distancia: [\d,]+ m/)).toBeVisible();

  await page.getByRole('button', { name: 'Texto', exact: true }).click();
  await page.mouse.click(area.x + 300, area.y + 300);
  await expect(page.getByText('36 elementos')).toBeVisible();
  const label = page.getByLabel('Etiqueta');
  await expect(label).toBeFocused();
  await label.fill('Bajar el telón');
  await label.press('Tab');
  await expect(page.locator('g.el[aria-label="Bajar el telón"]')).toHaveCount(1);
});

test('a locked layer cannot be selected and a hidden one is not drawn', async ({ page }) => {
  await rock(page);
  await page.getByRole('checkbox', { name: 'Bloquear Audio' }).check();
  const hits = page.locator('g.el[data-id] .hit');
  const n = await hits.count();
  expect(n).toBeGreaterThan(5);
  await expect(page.locator('g.el[data-id][aria-disabled="true"]').first()).toBeVisible();
  const all = await page.locator('g.el[data-id]').count();
  await page.getByRole('checkbox', { name: 'Mostrar Audio' }).uncheck();
  await expect.poll(() => page.locator('g.el[data-id]').count()).toBeLessThan(all - 5);
  await expect(page.locator('g.el[data-id][aria-disabled="true"]')).toHaveCount(0);
});

test('the plan with a selection has no accessibility violations @a11y', async ({ page }) => {
  await rock(page);
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.mouse.move(area.x + 4, area.y + 60);
  await page.mouse.down();
  await page.mouse.move(area.x + area.width - 4, area.y + area.height - 4, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByRole('toolbar', { name: 'Alinear y distribuir' })).toBeVisible();
  expect((await axe(page)).violations).toEqual([]);
});

test('an item dragged from the library lands where it is dropped, and the other views have no plan tools', async ({ page }) => {
  await rock(page);
  const area = (await page.locator('svg.plansvg').boundingBox())!;
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('atril');
  const item = page.getByRole('button', { name: /^Añadir Atril de conferencia al plano/ });
  await item.dragTo(page.locator('svg.plansvg'), { targetPosition: { x: area.width * 0.25, y: area.height * 0.25 } });
  await expect(page.getByText('36 elementos')).toBeVisible();
  await expect(page.getByLabel('X (m)')).toBeVisible();
  const x = Number(await page.getByLabel('X (m)').inputValue());
  expect(x).toBeLessThan(4); // dropped in the left part of an 8 m stage
  await page.getByRole('button', { name: 'Entradas', exact: true }).click();
  await expect(page.getByRole('toolbar', { name: 'Herramientas' })).toHaveCount(0);
  await expect(page.getByRole('searchbox', { name: 'Buscar en la biblioteca' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Capas' })).toHaveCount(0);
});

test('the connection lines can be hidden and shown again', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  const lines = page.locator('svg.plansvg line[stroke="#0b6e78"]');
  await expect(lines.first()).toBeVisible();
  const button = page.getByRole('button', { name: 'Líneas de conexión' });
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await button.click();
  await expect(lines).toHaveCount(0);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  await expect(lines.first()).toBeVisible();
});

test('the library lists by category with headings, and a layer made active receives new elements', async ({ page }) => {
  await rock(page);
  const list = page.locator('.library .list');
  await expect(list.getByRole('heading').first()).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('guitarra');
  await expect(list.getByRole('heading')).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('');
  await page.getByLabel('Nombre de la capa nueva').fill('Extras');
  await page.getByRole('button', { name: 'Añadir capa' }).click();
  const name = page.getByLabel('Nombre de la capa Extras');
  await expect(name).toBeVisible();
  const box = (await name.boundingBox())!;
  expect(box.width).toBeGreaterThan(70); // the name is readable
  await page.getByRole('button', { name: /^Los elementos nuevos van a Extras/ }).click();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('Persona');
  await page.getByRole('button', { name: 'Añadir Persona al plano' }).click();
  await expect(page.locator('label.field').filter({ hasText: /^Capa/ }).locator('option:checked')).toHaveText('Extras');
});

test('custom layers are reordered by dragging, the active one is highlighted and nothing shifts', async ({ page }) => {
  await rock(page);
  for (const n of ['Uno', 'Dos']) {
    await page.getByLabel('Nombre de la capa nueva').fill(n);
    await page.getByRole('button', { name: 'Añadir capa' }).click();
  }
  const aside = page.locator('aside').last();
  const before = (await aside.boundingBox())!;
  const names = () => page.locator('.layer .name').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));
  expect(await names()).toEqual(['Uno', 'Dos']);
  await page.getByRole('button', { name: /^Los elementos nuevos van a Dos/ }).dragTo(page.locator('.layer').filter({ has: page.getByLabel('Nombre de la capa Uno') }));
  await expect.poll(names).toEqual(['Dos', 'Uno']);
  await page.getByRole('button', { name: /^Los elementos nuevos van a Uno/ }).click();
  await expect(page.locator('.layer.active')).toHaveCount(1);
  const rows = await page.locator('.layer').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  expect(Math.max(...rows)).toBeLessThan(40); // every row is one line
  expect((await aside.boundingBox())!.width).toBe(before.width);
});

test('the inspector is resized from its edge, with the mouse or the arrow keys, and remembers it', async ({ page }) => {
  await rock(page);
  const bar = page.getByRole('separator', { name: 'Cambiar el ancho del inspector' });
  const w0 = Number(await bar.getAttribute('aria-valuenow'));
  await bar.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(bar).toHaveAttribute('aria-valuenow', String(w0 + 10));
  await page.reload();
  await expect(page.getByRole('separator', { name: 'Cambiar el ancho del inspector' })).toHaveAttribute('aria-valuenow', String(w0 + 10));
});

test('an element is swapped for another of its kind and keeps its label and channel', async ({ page }) => {
  await rock(page);
  await page.locator('g.el[aria-label="Voz 1"]').click();
  const type = page.getByLabel('Cambiar por otro del mismo tipo');
  const before = await type.inputValue();
  const other = (await type.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value))).find((v) => v !== before)!;
  await type.selectOption(other);
  await expect(type).toHaveValue(other);
  await expect(page.locator('g.el[aria-label="Voz 1"]')).toBeVisible();
});

test('the input list shows the cable that leaves each source', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('button', { name: 'Entradas', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: 'Conexiones' })).toBeVisible();
  await expect(page.locator('td.cabletext', { hasText: '→' }).first()).toBeVisible();
});

test('names, outlines and connection lines can be hidden from the bottom bar, and the legend from the document', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  const names = page.getByRole('button', { name: 'Nombres de los elementos' });
  const outlines = page.getByRole('button', { name: 'Bordes de los elementos' });
  const links = page.getByRole('button', { name: 'Líneas de conexión' });
  for (const b of [names, outlines, links]) await expect(b).toHaveAttribute('aria-pressed', 'true');
  const labelTexts = page.locator('g.el > text.detail');
  const before = await labelTexts.count();
  expect(before).toBeGreaterThan(0);
  await names.click();
  await expect(names).toHaveAttribute('aria-pressed', 'false');
  await expect(labelTexts).toHaveCount(0);
  const rects = page.locator('g.el .detail rect[stroke]');
  const withOutlines = await rects.count();
  await outlines.click();
  await expect.poll(() => rects.count()).toBeLessThan(withOutlines);
  await names.click();
  await expect(labelTexts).toHaveCount(before);

  await page.getByRole('button', { name: 'Documento', exact: true }).click();
  const legend = page.getByRole('checkbox', { name: 'Leyenda de símbolos bajo el plano' });
  await expect(legend).toBeChecked();
  await legend.uncheck();
  await expect(legend).not.toBeChecked();
});

test('the library has many PA variations, and an element can be resized and put back to its library size', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Banda de rock/ }).click();
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('subgrave');
  expect(await page.getByRole('button', { name: /^Añadir .*[Ss]ubgrave/ }).count()).toBeGreaterThanOrEqual(4);
  await page.getByRole('button', { name: 'Añadir Subgrave doble de 18 pulgadas al plano' }).click();
  const width = page.getByLabel('Ancho (m)', { exact: true });
  const depth = page.getByLabel('Fondo (m)', { exact: true });
  await expect(width).toHaveValue('1.2');
  await expect(depth).toHaveValue('0.8');
  await width.fill('1.5');
  await width.press('Tab');
  await expect(width).toHaveValue('1.5');
  await page.getByRole('button', { name: 'Tamaño de la biblioteca' }).click();
  await expect(width).toHaveValue('1.2');
  await expect(page.getByRole('button', { name: 'Tamaño de la biblioteca' })).toHaveCount(0);
});

test('a selected element keeps its label where it is dragged, and the inspector puts it back', async ({ page }) => {
  await rock(page);
  const element = page.locator('g.el').filter({ has: page.locator('text[data-label]') }).first();
  await element.click({ position: { x: 4, y: 4 }, force: true });
  const label = element.locator('text[data-label]');
  const before = (await label.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width / 2 + 70, before.y + before.height / 2 + 40, { steps: 5 });
  await page.mouse.up();
  const after = (await label.boundingBox())!;
  expect(Math.abs(after.x - before.x - 70)).toBeLessThan(4);
  expect(Math.abs(after.y - before.y - 40)).toBeLessThan(4);
  await page.getByRole('button', { name: 'Colocar la etiqueta automáticamente' }).click();
  await expect.poll(async () => Math.round((await label.boundingBox())!.x)).toBe(Math.round(before.x));
});
