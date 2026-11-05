# Importar PDF y DXF como fondo: medición con muestras sintéticas

Medido el 2026-11-05 con la máquina libre. Cierra la parte «sin medir» de la sección 2 de `enlace-e-importacion.md`. Lab: `D:\DOCS\CODELAB\4_scratch\scaena-lab\enlace-importar`, script `test-import.mjs`; resultados en `import-firefox.json` e `import-chromium.json`.

## Método

- Muestras: `samples/sala.pdf` (8,5 KB, una página de 640 × 440 pt, solo vectores) y `samples/sala.dxf` (45 KB), generadas por `make-samples.py`: sala de 30 × 20 m con muros, escenario, columnas, butacas, 300 líneas finas, 2 arcos y 2 textos. No son planos reales.
- Navegadores sin ventana: Firefox 155.0 de Playwright 1.63 (volumen 0) y Chrome 156.0.8078.80 (`--mute-audio`).
- Página servida con una CSP estricta: `default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'`. Sin `wasm-unsafe-eval`.
- pdf.js: `pdfjs-dist` 6.4.299, `pdf.min.mjs` cargado con `import()` y `pdf.worker.min.mjs` como worker. Se mide import, apertura del documento y render a canvas de 1600 px y de 4000 px de ancho; se comprueba que hay píxeles oscuros.
- DXF: `dxf-parser` 1.1.2 y `dxf` 5.3.1 se ejecutaron en Node, no en el navegador. El navegador dibuja las entidades analizadas sobre un canvas de 1600 px.

## Resultados

Peso de lo que cargaría el navegador (bytes):

| Archivo | Sin comprimir | gzip | brotli |
|---|---|---|---|
| `pdf.min.mjs` | 458.904 | 132.108 | 109.477 |
| `pdf.worker.min.mjs` | 1.264.342 | 375.659 | 307.591 |

pdf.js en el navegador:

| Medida | Firefox 155 | Chrome 156 |
|---|---|---|
| Import de `pdf.min.mjs` | 112 ms | 42 ms |
| Abrir el documento y la página | 219 ms | 120 ms |
| Render a 1600 px | 139 ms | 32 ms |
| Render a 4000 px (segundo render) | 43 ms | 2 ms |
| Píxeles oscuros a 1600 px | 62.955 | 62.873 |
| Errores y violaciones de CSP | ninguno | ninguno |
| Memoria JS tras todo | no disponible | 52 MB |

DXF:

| Medida | Resultado |
|---|---|
| `dxf-parser` en Node | 4,9 ms; 375 entidades (300 LINE, 63 LWPOLYLINE, 8 CIRCLE, 2 ARC, 2 TEXT) |
| `dxf` 5.3.1 en Node (`toSVG`) | 35,9 ms; SVG de 43.418 bytes |
| Dibujar en canvas, Firefox | 19 ms; 373 entidades dibujadas y 2 textos |
| Dibujar en canvas, Chrome | 56 ms; igual |

## Lectura

- pdf.js funciona con una CSP estricta (script y worker del propio origen, sin `wasm-unsafe-eval`) en los dos navegadores, y rasteriza el plano de muestra de forma correcta: los píxeles oscuros coinciden entre navegadores.
- El coste de peso está en el worker: 1,26 MB sin comprimir y unos 308 a 376 KB comprimidos, más 109 a 132 KB del módulo principal. Se cargaría solo al importar.
- El render del segundo tamaño sale mucho más rápido porque ya hay fuentes y operadores en caché; no es una comparación entre resoluciones.
- Los dos parsers DXF leen sin errores el DXF de muestra. `dxf-parser` es unas siete veces más rápido que `dxf` en esta muestra.
- Dibujar entidades LINE, LWPOLYLINE, CIRCLE, ARC y TEXT sobre canvas es trivial y rápido; el texto se pinta sin tipografía fiel.

## Límites

- Muestras sintéticas, pequeñas y solo con vectores. No se ejercitó ninguna imagen incrustada (JPEG2000 y JBIG2 son los casos que piden `wasm-unsafe-eval`), ni PDF de varias páginas, ni PDF escaneados, ni DXF con bloques, capas, splines, hatching, espacio papel o dimensiones.
- La CSP probada no incluye `wasm-unsafe-eval`; falta probar con ella cuando haya imágenes.
- El análisis del DXF se midió en Node; el tiempo en el navegador no se midió.
- DXF real: ninguno todavía. [PENDIENTE: pedir uno al usuario]

## Muestra real: plano de iluminación (2026-11-05)

PDF aportado por el usuario («Salto o caída», plano genérico reducido): AutoCAD 2022, A3 apaisado (1191 × 842 pt), 6.114 trazos vectoriales, 4 imágenes, texto seleccionable. Copia en el banco: `samples/teatro.pdf` (el script acepta `PDF=ruta`). Misma CSP estricta, sin errores.

| Medida | Firefox 155 | Chrome 156 |
|---|---|---|
| Abrir documento y página | 247 ms | 119 ms |
| Render a 1600 px | 274 ms | 218 ms |
| Render a 4000 px (segundo) | 138 ms | 43 ms |
| Memoria JS | no disponible | 60 MB |

Contenido útil para el diseño: vista cenital con varas, calles y suelo; cada aparato con canal, filtro y ángulo; leyenda con recuento por posición (varas, suelo, calles, sala); alturas de las calles; escala gráfica y cajetín; símbolos propios del autor, no USITT.
- No se midió la memoria en Firefox ni con documentos grandes.
- El puerto 4190 está bloqueado por Firefox (la navegación falla con «interrupted by another navigation»); usar otro puerto en los bancos.
