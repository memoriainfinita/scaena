# Typst en el navegador: medidas (2026-10-29)

Informe parcial. El usuario pidió cerrar con lo medido hasta ahora. Lo pendiente está marcado «sin verificar».
Laboratorio: `scaena-lab\typst` (resultados en `out/`, scripts en `bench/`). No se instaló Java ni Docker. Se instalaron con pnpm, solo en el laboratorio: `@myriaddreamin/typst.ts` y `typst-ts-web-compiler` 0.7.0 y 0.8.0-rc3, y `esbuild` 0.28.2. Se descargaron además las fuentes Inter 4.1 y JetBrains Mono 2.304 (zips de GitHub) y el zip de `typst.ts` en `main`.

## Condiciones de la medida

- Documento: 3 páginas A4 (verificado con pypdf), tabla de 40 filas, SVG de 24 grupos, fuentes Inter (Regular, Medium, Bold) y JetBrains Mono. El texto cambia en cada iteración (versión en tabla, SVG y pie), porque el fallo es por versión de documento.
- Compilación en un worker con `typst.ts` (`createTypstCompiler`). Memoria medida como `WebAssembly.Memory.buffer.byteLength` del worker, leído al enganchar `WebAssembly.instantiate`. `performance.memory` no existe en workers de Chrome (salió `null`), así que no hay heap JS.
- Navegadores: Firefox del Playwright de nona (1.63, firefox-1543, headless, volumen 0) y Chrome del sistema (`channel: 'chrome'`, `--mute-audio`). El Chromium de Playwright no está instalado, así que «Chromium» es Chrome estable. La versión exacta de Chrome y de Firefox: sin anotar.
- Navegadores cerrados en `finally` y servidor local matado. Quedan procesos `firefox.exe` en la máquina, pero ninguno es del laboratorio (ninguno lleva `ms-playwright` en su línea de comandos; son el Firefox del usuario).
- **Competencia por CPU, afecta a los tiempos**: durante las tres primeras tandas (Chrome 0.7.0, Firefox 0.7.0 y rc3) corrían a la vez la extracción del zip de `main`, la compresión brotli de los `.wasm` y la subsetización de fuentes. Los tiempos de Chrome (mediana 268 y 182 ms) están inflados frente a los de Firefox (93 y 92 ms); no comparar navegadores con ellos. Además, una cadena en segundo plano se lanzó dos veces, así que las tandas «Firefox 1100» y «recycle50» pudieron solaparse con otro navegador. Los tiempos son indicativos; las cifras de memoria no dependen de la CPU.

## 1. Fuga de memoria y versión de typst.ts

Hechos (GitHub API, `Myriad-Dreamin/typst.ts`):
- Última estable en npm: 0.7.0 (2026-06-01). Candidata: 0.8.0-rc3 (2026-06-29). Etiquetas: v0.7.0 = `0501ced2`, v0.8.0-rc3 = `e1974e56`.
- El arreglo es la PR #895 «fix(compiler): add evict_cache to web compiler», fusionada el 2026-10-29 00:48 UTC como `404730ff`. Añade `TypstCompiler.evictCache(maxAge)`. **Ninguna versión publicada en npm lo contiene.** Solo está en `main`.
- `main` ya incluye también `d58db0f0` «add PDF standards support for web compiler» (2026-07-03) y Typst 0.15.1 (`acea8387`, 2026-08-31). rc3 usa Typst 0.15.0-rc.1 según su nota de versión.
- `reset()` no sirve: solo libera el VFS (texto de la PR).
- Fuentes: https://github.com/Myriad-Dreamin/typst.ts/pull/895 · https://github.com/Myriad-Dreamin/typst.ts/releases

Medidas (compilaciones consecutivas, documento distinto cada vez):

| Navegador | Versión | Compilaciones | Memoria wasm | Resultado |
|-----------|---------|---------------|--------------|-----------|
| Chrome | 0.7.0 | 300 de 300 | 19 → 1321 MB | sin fallo |
| Firefox | 0.7.0 | 300 de 300 | 19 → 1321 MB | sin fallo |
| Chrome | 0.8.0-rc3 | 300 de 300 | 19 → 1323 MB | sin fallo |
| Firefox | 0.8.0-rc3 | 300 de 300 | 19 → 1323 MB | sin fallo |
| Firefox | 0.7.0 | 986 completadas | 19 → 4094 MB | `unreachable executed` en la 987 |

- El crecimiento es lineal: unos 4,3 MB por compilación con este documento (iteración 50: 220 MB; 100: 426; 200: 838; 300: 1321). El límite de 4 GiB de wasm32 se alcanza hacia la compilación 987.
- Las versiones 0.7.0 y rc3 tienen la misma fuga. La cifra «~100 compilaciones» de la PR corresponde a un documento que crece 40 MB por versión; el nuestro, mucho más ligero, aguanta unas 980. Un rider con más páginas o imágenes se acercará al caso de la PR. El fallo se reproduce también en Firefox (solo medido en Firefox con 0.7.0; en Chrome no se llevó hasta el fallo).
- Mitigación sin parchear, medida: recrear el worker cada 50 compilaciones (`recycleEvery=50`). Memoria máxima 222 MB, 300 de 300 en Chrome y Firefox. Coste: cada reinicio tarda 250 a 700 ms (la primera carga, 1,4 a 3,4 s, incluye descargar y compilar el wasm). Sin la caché de Pages tardaría más.
- Tiempos por compilación, solo indicativos (ver competencia por CPU): Firefox mediana 93 ms (p95 163 ms) con 0.7.0 y 92 ms (p95 167 ms) con rc3; primera compilación 255 y 313 ms. Chrome mediana 268 ms (p95 610) con 0.7.0 y 182 ms (p95 731) con rc3, con CPU compartida. El tiempo no empeora con la fuga (mediana de las últimas 30 ≈ 84 ms en Firefox).

**No medido: `main` con `evictCache`.** La compilación de `main` no se terminó. Hay Rust 1.98.1 y `wasm32-unknown-unknown`, pero falta `wasm-pack` y `wasm-opt`, y `wasm-bindgen` CLI es 0.2.129 frente al 0.2.118 que fija el `Cargo.lock` (habría que instalar el exacto en la carpeta del laboratorio con `cargo install --root`). Además la extracción del zip en Windows fue extremadamente lenta (4700 de 11 671 archivos en 25 minutos) y se abandonó. Receta, sin verificar: `cargo build --release --target wasm32-unknown-unknown -p typst-ts-web-compiler --no-default-features --features web,misc`, luego `wasm-bindgen --target web`, según `packages/compiler/package.json` de `main`. La prueba de `evictCache(1)` y de la opción de estándar PDF (`ua-1`) quedan **sin verificar**. La PR afirma, medido en Node, 224 → 286 MB tras 200 compilaciones con `evictCache(1)` y misma velocidad (84 ms); es una afirmación del autor, no nuestra.

Recomendación para el punto 1:
- Ahora: `@myriaddreamin/typst.ts` y `typst-ts-web-compiler` **0.7.0**, con reciclado del worker cada 50 compilaciones (o menos si los documentos son grandes). Es estable, publicada y la mitigación está medida. 0.8.0-rc3 no aporta nada frente a la fuga y es candidata.
- Cuando salga una versión publicada con #895 (probablemente 0.8.0), pasar a ella con `evictCache(1)` tras cada compilación, y dejar el reciclado como red de seguridad. Si se necesita PDF/UA antes, compilar `main` propio (sin verificar) y medirlo con esta misma batería (`bench/run.mjs`).

## 2. El `.wasm` en GitHub Pages

Tamaños medidos (Node `zlib`):

| Archivo | Bruto | gzip 6 | gzip 9 | brotli 11 |
|---------|-------|--------|--------|-----------|
| 0.7.0 `typst_ts_web_compiler_bg.wasm` | 28 325 178 | 10 859 138 | 10 839 742 | 7 099 357 |
| 0.8.0-rc3 | 30 156 049 | 11 045 978 | 11 024 270 | 7 607 777 |

Comportamiento real de Pages, medido con `curl -I` sobre un `.wasm` ya publicado (https://myriad-dreamin.github.io/typst.ts/cookery/internal/typst_ts_renderer_bg.wasm, 1 059 617 bytes):
- `Content-Type: application/wasm`, y **sí comprime con gzip**: con `Accept-Encoding: br, gzip` devolvió `Content-Encoding: gzip` y 362 408 bytes (un 34 %). No ofrece brotli.
- `Cache-Control: max-age=600` (10 minutos) y `ETag` débil con compresión. No se pueden cambiar las cabeceras en Pages.
- Por extrapolación (sin verificar, no se publicó nada): nuestro `.wasm` bajaría ≈ 10,9 MB con gzip en Pages. Comprimirlo con brotli antes y servirlo como `.wasm.br` exigiría descomprimir en JS; no probado.
- Fuentes `.ttf`: si Pages las comprime, **sin verificar** (no encontré un `.ttf` ya publicado en github.io para probar).

Caché: con `max-age=600` el navegador revalida cada 10 min. El `.wasm` no cambia entre despliegues si el nombre lleva hash en el nombre de archivo; con hash la revalidación es un 304 barato. Recomendación (sin probar): nombre con hash de contenido y service worker (el de la PWA que ya se planea) con estrategia «caché primero» para el `.wasm` y las fuentes, de modo que solo la primera visita descargue ~11 MB.

**Primera carga con red lenta simulada: no medida.** Preparé `bench/server.mjs` (limita ancho de banda y latencia, sirve gzip como Pages) pero no se ejecutó. Sin verificar. Cálculo teórico, no medición: 10,9 MB a 1,6 Mbit/s (3G rápido) ≈ 55 s; a 10 Mbit/s ≈ 9 s. Tiempos de arranque medidos en local, sin red: inicialización 1,3 a 2,5 s (descarga local, compilación del wasm y carga de 4 fuentes) en las tandas con CPU libre y hasta 3,4 s en las más cargadas.

## 3. Fuentes abiertas (licencia OFL)

Medido con `fontTools.subset` 4.66.0 (Python global, no se instaló nada) sobre los TTF estáticos. Typst acepta TTF/OTF, no woff2, así que el peso que cuenta es el TTF (más gzip si el servidor lo aplica). Typst ya subconjunta las fuentes dentro del PDF.

| Fuente | Completa | Latín | Latín extendido | Latín mínimo de rasgos* |
|--------|----------|-------|-----------------|--------------------------|
| Inter Regular 4.1 | 411 640 (gzip 200 540) | 103 692 (gzip 46 349) | 179 100 (gzip 79 985) | 54 740 |
| Inter Medium | 417 300 | 105 472 | 181 712 | 55 400 |
| Inter Bold | 420 428 | 105 696 | 182 656 | 55 840 |
| JetBrains Mono Regular 2.304 | 273 900 (gzip 129 749) | 91 892 (gzip 43 508) | 115 112 (gzip 52 585) | 77 132 |
| JetBrains Mono Bold | 277 828 | 94 608 | 117 792 | 79 520 |

\* Rasgos conservados: `kern, liga, calt, ccmp, locl, mark, mkmk` (en lugar de todos).

Rangos usados: Latín = U+0020-007E, U+00A0-00FF, U+0131, U+0152-0153, comillas y rayas tipográficas, €, ™, flechas y similares. Latín extendido añade U+0100-024F, U+1E00-1EFF, U+2C60-2C7F, U+A720-A7FF.
- Inter Regular, Medium y Bold + JetBrains Mono Regular, en latín: ≈ 405 KB en bruto (≈ 185 KB con gzip). Con latín extendido: ≈ 650 KB en bruto. Es poco frente a los 11 MB del `.wasm`.
- Licencias: las dos están bajo OFL (el zip de Inter lleva `LICENSE.txt` y el de JetBrains Mono `OFL.txt`); hay que incluir el texto de la licencia con las fuentes.
- Comprobado en Typst: Inter y JetBrains Mono completas, cargadas desde bytes con `loadFonts(..., {assets:false})`, compilan bien y quedan incrustadas (con subconjunto) en el PDF. **Sin verificar**: que Typst renderice bien las versiones subconjuntadas (no se compiló con ellas), las variables (`InterVariable.ttf`, 879 708 bytes) y Cirílico/Griego/Vietnamita (Inter completa los cubre; el subconjunto no). Otras OFL (Noto Sans, Atkinson Hyperlegible): sin medir.
- Recomendación: empaquetar Inter (Regular, Medium, Bold, más cursiva si se usa) y JetBrains Mono (Regular, Bold) en subconjunto de latín extendido (Europa occidental y central), con las fuentes completas como paquete opcional para otros alfabetos. Compilar la plantilla con el subconjunto antes de fijarlo (pendiente).

## 4. Validador PDF/UA y comprobación en CI

- Salida de nuestro PDF (0.7.0, igual que rc3): 3 páginas, `MarkInfo/Marked`, `StructTreeRoot`, `Lang=es`, título en Info y en XMP, fuentes incrustadas, `Figure` con `/Alt`, `THead` con `TH` y `Scope`. Falta `DisplayDocTitle` en `ViewerPreferences`, no declara `pdfuaid:part`, y las páginas no llevan `/Tabs /S`. Se midió con `bench/check_pdf.py` (pypdf 6.12.2).
- veraPDF es la referencia (Java; instalador oficial https://software.verapdf.org/rel/verapdf-installer.zip según su web; repositorio `veraPDF/veraPDF-apps`, GPL-3.0, push 2026-10-27; la web advertía de estar caída temporalmente). Sin una declaración `pdfuaid:part=1`, veraPDF falla por identificación, por diseño; no sirve para el PDF actual.
- Sin Java, alternativas encontradas por búsqueda, **todas sin verificar**:
  - Imagen de Docker `verapdf/cli` (51 MB, Java dentro del contenedor): https://hub.docker.com/r/verapdf/cli. Docker no está instalado en esta máquina; no se instaló.
  - `pdfix/validate-pdf-verapdf` (Docker, también Java por dentro): https://hub.docker.com/r/pdfix/validate-pdf-verapdf
  - `pdf_oxide` (Rust, con CLI `pdf-oxide validate --pdfua`, versión 0.3.x): https://pdf.oxide.fyi/docs/compliance/pdf-ua; licencia y rigor sin comprobar, es joven.
  - `pdfua` (Python, requiere pikepdf, sin JVM): https://pypi.org/project/pdfua/; se describe como prototipo, no sustituye a veraPDF.
  - PAC: solo Windows y con interfaz; no apto para CI.
- **CI**: los runners `ubuntu-24.04` de GitHub traen Java 8, 11, 17 (predeterminado), 21 y 25 (imagen 20261026.354.1, https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md). Se puede ejecutar veraPDF allí sin instalar Java; instalar veraPDF en el job es lo único pendiente (sin probar). Aviso del propio repositorio: `ubuntu-latest` pasa a Ubuntu 26.04 en noviembre de 2026 (conviene fijar `ubuntu-24.04`).
- Comprobación mínima sin Java, automatizable ahora: `bench/check_pdf.py` (Python + pypdf, ya disponible; sale con código 1 si falla). Comprueba `Marked`, `StructTreeRoot`, `Lang`, `DisplayDocTitle`, título, fuentes incrustadas, `Figure` sin `/Alt`, `TH`, saltos de encabezado y `Tabs=S`. No valida PDF/UA-1; sirve para detectar regresiones. Con el PDF actual devuelve fallo por `DisplayDocTitle` y `Tabs`.
- Recomendación: en CI, (a) `check_pdf.py` en cada cambio; (b) veraPDF en el runner de GitHub solo cuando haya un PDF que declare `ua-1`, en modo informativo al principio. Declarar PDF/UA-1 exige el estándar en el compilador (rama `main`, sin verificar) o aceptar el PDF etiquetado sin declaración.

## Pendiente, sin verificar

- `main` con `evictCache`: plateau de memoria y tiempo; opción `ua-1` desde el wasm de `main`.
- Firefox: 0.8.0-rc3 hasta el fallo; Chrome: llegar al fallo con 0.7.0 (solo se llegó a 300).
- Tiempo de primera carga con red limitada (servidor listo, sin ejecutar) y si Pages comprime `.ttf`.
- Compilar con fuentes subconjuntadas, variables y otros alfabetos.
- Tiempos de Chrome con CPU libre.
- Probar veraPDF en CI, `pdf_oxide` y `pdfua`.
- Los scripts quedan en `scaena-lab\typst\bench` (`worker.mjs`, `run.mjs`, `build.mjs`, `server.mjs`, `check_pdf.py`) y los datos en `...\typst\out\summary.log` y `*.json`. El zip de `main` está parcialmente extraído en `...\typst\src-main` (incompleto).
