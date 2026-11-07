// Takes the screenshots of the user guide into docs/guide/img: `pnpm build` first, then `node scripts/screenshots.mjs`.
// Firefox, silent, light theme, Spanish. It starts its own preview server on port 4185 and stops it at the end.
import { firefox } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { preview } from 'vite';

mkdirSync('docs/guide/img', { recursive: true });
const server = await preview({ preview: { port: 4185, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
const base = 'http://127.0.0.1:4185/';
const browser = await firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0', 'layout.css.prefers-color-scheme.content-override': 1 } });

const shot = async (page, name) => {
  await page.mouse.move(5, 5);
  await page.screenshot({ path: `docs/guide/img/${name}.png` });
  console.log('wrote', name);
};

async function fresh(size = { width: 1440, height: 860 }) {
  const ctx = await browser.newContext({ locale: 'es-ES', viewport: size, hasTouch: size.width < 600 });
  const page = await ctx.newPage();
  await page.goto(base);
  return page;
}
const pick = async (page, pkg) => {
  await page.getByRole('button', { name: pkg }).click();
  await page.locator('svg.plansvg').waitFor();
};

try {
  // Start
  let page = await fresh();
  await shot(page, 'inicio');
  await pick(page, /Banda de rock/);
  await shot(page, 'editor');
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('guitarra');
  await shot(page, 'biblioteca');
  await page.getByRole('searchbox', { name: 'Buscar en la biblioteca' }).fill('');
  await page.keyboard.press('Control+a');
  await shot(page, 'seleccion');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Medir' }).click();
  const area = (await page.locator('svg.plansvg').boundingBox());
  await page.mouse.click(area.x + 330, area.y + 330);
  await page.mouse.click(area.x + 560, area.y + 330);
  await shot(page, 'medir');
  await page.getByRole('button', { name: 'Seleccionar', exact: true }).click();

  // Sound
  await page.getByRole('button', { name: 'Entradas', exact: true }).click();
  await shot(page, 'entradas');
  await page.getByRole('button', { name: 'Salidas', exact: true }).click();
  await page.getByLabel('Mesa de mezclas', { exact: true }).fill('Behringer X32');
  await page.getByLabel('Mesa de mezclas', { exact: true }).press('Tab');
  await shot(page, 'salidas');
  await page.close();

  // Lights and electrical
  page = await fresh();
  await pick(page, /Teatro con micros/);
  await page.getByRole('button', { name: 'Luces', exact: true }).click();
  for (const n of [1, 2, 3]) {
    await page.getByLabel(`Modelo · Recorte ${n}`, { exact: true }).selectOption({ label: 'ETC Source Four 19°' });
    await page.getByLabel(`Circuito · Recorte ${n}`, { exact: true }).fill(String(n === 3 ? 2 : 1));
    await page.getByLabel(`Circuito · Recorte ${n}`, { exact: true }).press('Tab');
  }
  await page.getByRole('button', { name: 'Numerar instrumentos' }).click();
  await shot(page, 'luces-instrumentos');
  await page.getByRole('button', { name: 'Montajes', exact: true }).click();
  await page.getByLabel('Altura sobre la tarima (m) · Vara 1', { exact: true }).fill('5.5');
  await page.getByLabel('Altura sobre la tarima (m) · Vara 1', { exact: true }).press('Tab');
  await shot(page, 'luces-montajes');
  await page.getByRole('button', { name: 'Eléctrica', exact: true }).click();
  await shot(page, 'luces-electrica');
  await page.getByRole('button', { name: 'Sección', exact: true }).click();
  await shot(page, 'luces-seccion');

  // Computers and connections
  await page.getByRole('button', { name: 'Plano', exact: true }).click();
  await page.locator('g.el[aria-label="Ordenador de sonido"]').click();
  await shot(page, 'ordenador');
  await page.getByRole('button', { name: /^Avisos/ }).click();
  await shot(page, 'avisos');
  await page.keyboard.press('Escape');

  // Production
  await page.getByRole('button', { name: 'Ajustes del montaje' }).click();
  await page.getByRole('dialog', { name: 'Ajustes del montaje' }).getByRole('checkbox', { name: 'Producción' }).check();
  await shot(page, 'ajustes-montaje');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await page.getByRole('button', { name: 'Producción', exact: true }).click();
  await page.getByRole('button', { name: 'Horario del día' }).click();
  for (const [what, time] of [['Carga', '14:00'], ['Prueba de sonido', '17:00'], ['Puertas', '20:00'], ['Show', '21:00']]) {
    await page.getByRole('button', { name: `+ ${what}` }).click();
    // A new row has no time yet, so it sorts last.
    const n = await page.getByLabel(/^Hora · \d+$/).count();
    await page.getByLabel(`Hora · ${n}`, { exact: true }).fill(time);
    await page.getByLabel(`Hora · ${n}`, { exact: true }).press('Tab');
  }
  await shot(page, 'produccion-horario');
  await page.getByRole('button', { name: 'Hospitalidad', exact: true }).click();
  await page.getByLabel('Camerinos', { exact: true }).fill('2');
  await page.getByLabel('Camerinos', { exact: true }).press('Tab');
  await shot(page, 'produccion-hospitalidad');

  // Document
  await page.getByRole('button', { name: 'Documento', exact: true }).click();
  await page.getByRole('img', { name: 'Página 1' }).waitFor({ timeout: 90000 });
  await shot(page, 'documento');
  await page.getByRole('button', { name: 'Informes', exact: true }).click();
  await page.getByRole('button', { name: 'Lista de instrumentos' }).click();
  await shot(page, 'informes');

  // Delivering
  await page.getByRole('button', { name: 'Exportar' }).click();
  await shot(page, 'exportar');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Revisiones' }).click();
  await page.getByLabel('Nota de la revisión').fill('Primera entrega');
  await page.getByRole('button', { name: 'Guardar revisión' }).click();
  await page.getByText('Revisión 1 guardada.').waitFor();
  await shot(page, 'revisiones');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Plano', exact: true }).click();
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await page.getByLabel('Elegir un PDF o un DXF').setInputFiles('e2e/fixtures/sala.dxf');
  await page.locator('svg.plansvg image').waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'Fondo PDF o DXF' }).click();
  await shot(page, 'fondo');
  await page.close();

  // Phone
  page = await fresh({ width: 390, height: 844 });
  await pick(page, /Banda de rock/);
  await shot(page, 'movil-plano');
  await page.getByRole('button', { name: 'Biblioteca', exact: true }).click();
  await shot(page, 'movil-biblioteca');
  await page.close();
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
