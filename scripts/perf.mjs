// Measures the plan with many elements: time to open a show and frames per second while zooming and while a pan runs.
// One browser at a time, muted. Needs `pnpm build` and a running `pnpm preview` (port 4184).
//   node scripts/perf.mjs firefox 300 1000 3000
//   node scripts/perf.mjs chrome 300 1000 3000
import { chromium, firefox } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { strToU8, zipSync } from 'fflate';

const [kind = 'firefox', ...counts] = process.argv.slice(2);
const sizes = counts.length ? counts.map(Number) : [300, 1000, 3000];
const ITEMS = ['kit.drums5', 'amp.guitar', 'amp.bass', 'keys.keyboard', 'vocals.mic-stand', 'monitor.wedge', 'person.person', 'rack.stagebox', 'light.ellipsoidal', 'light.par'];

const LAYERS = [
  ['l-stage', 'stage'],
  ['l-audio', 'audio'],
  ['l-lights', 'lights'],
  ['l-electrical', 'electrical'],
  ['l-control', 'control'],
  ['l-notes', 'notes'],
  ['l-background', 'background'],
].map(([id, subject]) => ({ id, name: subject, subject }));

/** A show as the file holds it: only what has no default. The app fills in the rest when it opens it. */
function makeShow(n) {
  const cols = Math.ceil(Math.sqrt(n * 1.5));
  const rows = Math.ceil(n / cols);
  const elements = {};
  for (let i = 0; i < n; i++) {
    const id = 'e' + (i + 1);
    const type = ITEMS[i % ITEMS.length];
    elements[id] = { id, type: { id: type, version: 1 }, x: 600 + (i % cols) * (58000 / cols), y: 600 + Math.floor(i / cols) * (38000 / rows), layerId: type.startsWith('light') ? 'l-lights' : 'l-audio', label: i % 3 === 0 ? 'E' + i : '', rotation: (i * 15) % 360 };
  }
  return { formatVersion: 1, name: 'Prueba ' + n, lang: 'es', modules: ['audio', 'lights'], region: { code: 'ES', voltage: 230, plug: '' }, stage: { shape: { kind: 'rect', width: 60000, depth: 40000 } }, layers: LAYERS, elements, counters: { e: n } };
}

const packShow = (show) => zipSync({ 'show.json': strToU8(JSON.stringify(show)) });

const launch = () => (kind === 'chrome' ? chromium.launch({ channel: 'chrome', args: ['--mute-audio'] }) : firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0' } }));

const browser = await launch();
const results = [];
for (const n of sizes) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 860 }, locale: 'es-ES' });
  await page.goto('http://127.0.0.1:4184/');
  const bytes = Buffer.from(packShow(makeShow(n)));
  const t0 = Date.now();
  await page.locator('input[type=file]').setInputFiles({ name: 'prueba.scaena', mimeType: 'application/zip', buffer: bytes });
  await page.locator('svg.plansvg').waitFor({ timeout: 60000 });
  await page.locator('g.el').first().waitFor({ timeout: 60000 });
  const openMs = Date.now() - t0;
  const drawn = await page.locator('g.el[data-id]').count();

  const frames = await page.evaluate(async () => {
    const svg = document.querySelector('svg.plansvg');
    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const run = (steps, fn) =>
      new Promise((resolve) => {
        const times = [];
        let last = performance.now();
        let i = 0;
        const tick = (now) => {
          times.push(now - last);
          last = now;
          if (i >= steps) return resolve(times);
          fn(i++);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    const stats = (times) => {
      const s = [...times.slice(2)].sort((a, b) => a - b);
      const sum = s.reduce((a, b) => a + b, 0);
      return { fps: Math.round((s.length / sum) * 1000), median: Math.round(s[Math.floor(s.length / 2)] * 10) / 10, p95: Math.round(s[Math.floor(s.length * 0.95)] * 10) / 10 };
    };
    const zoom = await run(90, (i) => svg.dispatchEvent(new WheelEvent('wheel', { deltaY: i < 45 ? -90 : 90, clientX: cx, clientY: cy, bubbles: true, cancelable: true })));
    // A drag of one element: pointer events from press to release, the way the mouse sends them.
    const el = document.querySelector('g.el[data-id] .hit');
    const b = el.getBoundingClientRect();
    const x0 = b.left + b.width / 2;
    const y0 = b.top + b.height / 2;
    const ev = (type, x, y) => svg.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'mouse', clientX: x, clientY: y, button: 0, buttons: 1, bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, pointerType: 'mouse', clientX: x0, clientY: y0, button: 0, buttons: 1, bubbles: true }));
    const drag = await run(60, (i) => ev('pointermove', x0 + i * 3, y0 + i * 2));
    ev('pointerup', x0 + 180, y0 + 120);
    return { zoom: stats(zoom), drag: stats(drag) };
  });
  const heap = await page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null));
  results.push({ n, drawn, openMs, ...frames, heapMB: heap });
  console.log(JSON.stringify(results[results.length - 1]));
  await page.close();
}
await browser.close();
mkdirSync('test-results', { recursive: true });
writeFileSync(`test-results/perf-${kind}.json`, JSON.stringify(results, null, 2));
