// Takes the screenshots of the user guide: `pnpm build` first, then `node scripts/screenshots.mjs [en|es]` (default en). English goes to docs/guide/img, Spanish to docs/guide/es/img.
// Firefox, silent, light theme. It starts its own preview server on port 4185 and stops it at the end.
import { firefox } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { preview } from 'vite';

const LANG = process.argv[2] === 'es' ? 'es' : 'en';
const OUT = LANG === 'en' ? 'docs/guide/img' : 'docs/guide/es/img';
mkdirSync(OUT, { recursive: true });
const server = await preview({ preview: { port: 4185, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
const base = 'http://127.0.0.1:4185/';
const browser = await firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0', 'layout.css.prefers-color-scheme.content-override': 1 } });

const L = (es, en) => (LANG === 'en' ? en : es);

const shot = async (page, name) => {
  await page.mouse.move(5, 5);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('wrote', name);
};

async function fresh(size = { width: 1440, height: 860 }) {
  const ctx = await browser.newContext({ locale: LANG === 'en' ? 'en-GB' : 'es-ES', viewport: size, hasTouch: size.width < 600 });
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
  await pick(page, new RegExp(L('Banda de rock', 'Rock band')));
  await shot(page, 'editor');
  await page.getByRole('searchbox', { name: L('Buscar en la biblioteca', 'Search the library') }).fill(L('guitarra', 'guitar'));
  await shot(page, 'biblioteca');
  await page.getByRole('searchbox', { name: L('Buscar en la biblioteca', 'Search the library') }).fill('');
  await page.keyboard.press('Control+a');
  await shot(page, 'seleccion');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: L('Medir', 'Measure') }).click();
  const area = (await page.locator('svg.plansvg').boundingBox());
  await page.mouse.click(area.x + 330, area.y + 330);
  await page.mouse.click(area.x + 560, area.y + 330);
  await shot(page, 'medir');
  await page.getByRole('button', { name: L('Seleccionar', 'Select'), exact: true }).click();

  // Sound
  await page.getByRole('button', { name: L('Entradas', 'Inputs'), exact: true }).click();
  await shot(page, 'entradas');
  await page.getByRole('button', { name: L('Salidas', 'Outputs'), exact: true }).click();
  await page.getByLabel(L('Mesa de mezclas', 'Mixing desk'), { exact: true }).fill('Behringer X32');
  await page.getByLabel(L('Mesa de mezclas', 'Mixing desk'), { exact: true }).press('Tab');
  await shot(page, 'salidas');
  await page.close();

  // Lights and electrical
  page = await fresh();
  await pick(page, new RegExp(L('Teatro con micros', 'Theatre with headset')));
  await page.getByRole('button', { name: L('Luces', 'Lights'), exact: true }).click();
  await page.getByRole('button', { name: L('Numerar instrumentos', 'Number the instruments') }).click();
  await shot(page, 'luces-instrumentos');
  await page.getByRole('button', { name: L('Montajes', 'Mounts'), exact: true }).click();
  await page.getByLabel(L('Altura sobre la tarima (m) · Vara 1', 'Height above the stage (m) · Bar 1'), { exact: true }).fill('5.5');
  await page.getByLabel(L('Altura sobre la tarima (m) · Vara 1', 'Height above the stage (m) · Bar 1'), { exact: true }).press('Tab');
  await shot(page, 'luces-montajes');
  await page.getByRole('button', { name: L('Eléctrica', 'Electrical'), exact: true }).click();
  await shot(page, 'luces-electrica');
  await page.getByRole('button', { name: L('Sección', 'Section'), exact: true }).click();
  await shot(page, 'luces-seccion');

  // Computers and connections
  await page.getByRole('button', { name: L('Plano', 'Plan'), exact: true }).click();
  await page.locator(`g.el[aria-label="${L('Ordenador de sonido', 'Sound computer')}"]`).click();
  await shot(page, 'ordenador');
  await page.getByRole('button', { name: new RegExp('^' + L('Avisos', 'Warnings')) }).click();
  await shot(page, 'avisos');
  await page.keyboard.press('Escape');

  // Production
  await page.getByRole('button', { name: L('Ajustes del montaje', 'Show settings') }).click();
  await page.getByRole('dialog', { name: L('Ajustes del montaje', 'Show settings') }).getByRole('checkbox', { name: L('Producción', 'Production') }).check();
  await shot(page, 'ajustes-montaje');
  await page.getByRole('button', { name: L('Aplicar', 'Apply') }).click();
  await page.getByRole('button', { name: L('Producción', 'Production'), exact: true }).click();
  await page.getByRole('button', { name: L('Horario del día', 'Day schedule') }).click();
  await shot(page, 'produccion-horario');
  await page.getByRole('button', { name: L('Hospitalidad', 'Hospitality'), exact: true }).click();
  await page.getByLabel(L('Camerinos', 'Dressing rooms'), { exact: true }).fill('2');
  await page.getByLabel(L('Camerinos', 'Dressing rooms'), { exact: true }).press('Tab');
  await shot(page, 'produccion-hospitalidad');

  // Document
  await page.getByRole('button', { name: L('Documento', 'Document'), exact: true }).click();
  await page.getByRole('img', { name: L('Página 1', 'Page 1') }).waitFor({ timeout: 90000 });
  await shot(page, 'documento');
  await page.getByRole('button', { name: L('Informes', 'Reports'), exact: true }).click();
  await page.getByRole('button', { name: L('Lista de instrumentos', 'Instrument schedule') }).click();
  await shot(page, 'informes');

  // Delivering
  await page.getByRole('button', { name: L('Exportar', 'Export') }).click();
  await shot(page, 'exportar');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: L('Revisiones', 'Revisions') }).click();
  await page.getByLabel(L('Nota de la revisión', 'Revision note')).fill(L('Primera entrega', 'First delivery'));
  await page.getByRole('button', { name: L('Guardar revisión', 'Save revision') }).click();
  await page.getByText(L('Revisión 1 guardada.', 'Revision 1 saved.')).waitFor();
  await shot(page, 'revisiones');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: L('Plano', 'Plan'), exact: true }).click();
  await page.getByRole('button', { name: L('Fondo PDF o DXF', 'PDF or DXF background') }).click();
  await page.getByLabel(L('Elegir un PDF o un DXF', 'Choose a PDF or a DXF')).setInputFiles('e2e/fixtures/sala.dxf');
  await page.locator('svg.plansvg image').waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: L('Fondo PDF o DXF', 'PDF or DXF background') }).click();
  await shot(page, 'fondo');
  await page.close();

  // Phone
  page = await fresh({ width: 390, height: 844 });
  await pick(page, new RegExp(L('Banda de rock', 'Rock band')));
  await shot(page, 'movil-plano');
  await page.getByRole('button', { name: L('Biblioteca', 'Library'), exact: true }).click();
  await shot(page, 'movil-biblioteca');
  await page.close();
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
