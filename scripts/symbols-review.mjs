// Makes test-results/symbols-review.html, a page to mark every built-in symbol Bien / Mejorar / Rehacer: `node scripts/symbols-review.mjs test-results/symbols-review.html`.
import { writeFileSync } from 'node:fs';
const { ITEMS } = await import('../src/library/items.ts');
const { symbolSvg } = await import('../src/library/symbols.ts');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cats = {};
for (const i of ITEMS) (cats[i.category] ??= []).push(i);
const catName = { drums: 'Baterías', guitar: 'Guitarras', amp: 'Amplis', keys: 'Teclas', strings: 'Cuerdas', winds: 'Vientos', vocals: 'Voces', pa: 'PA', monitor: 'Monitores', desk: 'Mesas', rack: 'Racks', dj: 'DJ', person: 'Personas', furniture: 'Mobiliario', room: 'Sala', control: 'Control', video: 'Vídeo', light: 'Luminarias', effect: 'Efectos', scenery: 'Escenografía', power: 'Corriente' };
const card = (i) => `<article class="card" data-id="${i.id}">
<div class="sym">${symbolSvg(i.symbol, i.size.w, i.size.d, '')}</div>
<h3>${esc(i.name.es)}</h3>
<p class="meta">${i.id} · ${i.size.w} × ${i.size.d} mm</p>
<div class="opts" role="radiogroup" aria-label="Estado de ${esc(i.name.es)}">
<label><input type="radio" name="r-${i.id}" value="bien"> Bien</label>
<label><input type="radio" name="r-${i.id}" value="mejorar"> Mejorar</label>
<label><input type="radio" name="r-${i.id}" value="rehacer"> Rehacer</label>
</div>
<input class="note" type="text" placeholder="Qué falla o qué debería parecer" aria-label="Nota sobre ${esc(i.name.es)}">
</article>`;
const body = Object.entries(cats).map(([c, list]) => `<section><h2>${catName[c] ?? c} <span>${list.length}</span></h2><div class="grid">${list.map(card).join('')}</div></section>`).join('\n');
const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Símbolos de scaena</title>
<style>
:root{color-scheme:light dark;--line:rgba(128,128,128,.35);--accent:#0b6e78}
body{font:14px/1.4 system-ui,sans-serif;margin:0;padding:20px 24px 90px;max-width:1400px;margin-inline:auto}
h1{font-size:20px;margin:0 0 4px} p.lead{margin:0 0 18px;color:#666}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin:26px 0 10px;color:#666} h2 span{font-weight:400;opacity:.7}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.card{border:1px solid var(--line);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px}
.card.bien{border-color:#2e7d32}.card.mejorar{border-color:#b26a00}.card.rehacer{border-color:#b3261e}
.sym{background:#fff;border-radius:6px;height:150px;display:flex;align-items:center;justify-content:center;padding:8px}
.sym svg{max-width:100%;max-height:100%;width:auto;height:auto}
h3{font-size:14px;margin:0}.meta{margin:0;font-size:11px;color:#888}
.opts{display:flex;gap:10px;flex-wrap:wrap;font-size:13px}
.note{width:100%;box-sizing:border-box;padding:5px 7px;border:1px solid var(--line);border-radius:5px;background:transparent;color:inherit}
.bar{position:fixed;left:0;right:0;bottom:0;background:Canvas;border-top:1px solid var(--line);padding:10px 24px;display:flex;gap:14px;align-items:center}
button{padding:7px 14px;border-radius:6px;border:1px solid var(--accent);background:var(--accent);color:#fff;font-size:14px;cursor:pointer}
</style></head><body>
<h1>Símbolos de scaena</h1>
<p class="lead">${ITEMS.length} elementos tal como se dibujan hoy en el plano. Marca cada uno: Bien, Mejorar (el dibujo vale pero falta detalle) o Rehacer (no se entiende). Apunta en la nota qué debería parecer. Al acabar, «Copiar resultado» y pégamelo.</p>
${body}
<div class="bar"><span id="count"></span><button id="copy" type="button">Copiar resultado</button><span id="msg" role="status"></span></div>
<script>
const cards=[...document.querySelectorAll('.card')];
const update=()=>{const c={bien:0,mejorar:0,rehacer:0};for(const k of cards){const v=k.querySelector('input[type=radio]:checked')?.value;k.className='card'+(v?' '+v:'');if(v)c[v]++}document.getElementById('count').textContent='Bien '+c.bien+' · Mejorar '+c.mejorar+' · Rehacer '+c.rehacer+' · Sin marcar '+(cards.length-c.bien-c.mejorar-c.rehacer)};
document.addEventListener('change',update);update();
document.getElementById('copy').onclick=async()=>{const lines=cards.map(k=>{const v=k.querySelector('input[type=radio]:checked')?.value??'sin marcar';const n=k.querySelector('.note').value.trim();return k.dataset.id+' — '+v+(n?' — '+n:'')});const text=lines.join('\n');try{await navigator.clipboard.writeText(text);document.getElementById('msg').textContent='Copiado'}catch{document.getElementById('msg').textContent='No se pudo copiar';prompt('Copia esto',text)}};
</script></body></html>`;
import { mkdirSync } from 'node:fs';
mkdirSync('test-results', { recursive: true });
writeFileSync(process.argv[2] ?? 'test-results/symbols-review.html', html);
console.log('items', ITEMS.length);
