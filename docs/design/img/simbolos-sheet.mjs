import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const base = 'file:///D:/DOCS/CODELAB/0_draft/scaena/src/library/';
const { ITEMS } = await import(base + 'items.ts');
const { symbolSvg } = await import(base + 'symbols.ts');
const cells = ITEMS.map((i) => {
  const k = 130 / Math.max(i.size.w, i.size.d);
  const w = Math.max(24, i.size.w * k), h = Math.max(24, i.size.d * k);
  return `<div class="c"><div class="s" style="width:${w}px;height:${h}px">${symbolSvg(i.symbol, i.size.w, i.size.d, i.name.es).replace('<svg ', `<svg width="${w}" height="${h}" `)}</div><span>${i.id}</span></div>`;
}).join('');
const html = `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:10px sans-serif}.g{display:grid;grid-template-columns:repeat(8,170px);gap:8px;padding:8px}.c{height:170px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid #ddd;gap:6px}</style><div class=g>${cells}</div>`;
writeFileSync('sheet.html', html);
const { firefox } = createRequire('D:/DOCS/CODELAB/0_draft/scaena/package.json')('@playwright/test');
const b = await firefox.launch({ headless: true, firefoxUserPrefs: { 'media.volume_scale': '0.0' } });
const p = await b.newPage({ viewport: { width: 1420, height: 900 } });
await p.goto('file:///D:/DOCS/CODELAB/4_scratch/scaena-lab/simbolos/sheet.html');
await p.screenshot({ path: 'sheet.png', fullPage: true });
await b.close();
console.log(ITEMS.length, 'items');
