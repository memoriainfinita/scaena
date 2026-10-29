# Typst en el navegador: medidas (2026-10-29, tandas limpias)

Laboratorio: `scaena-lab\typst` (scripts en `bench/`, resultados en `out-clean/`, `out-fonts/`). Las medidas se repitieron con la máquina libre: antes de cada tanda se registró la carga de CPU y los navegadores abiertos, y las tandas fueron secuenciales, sin solaparse.

Instalado, solo dentro del laboratorio y con pnpm: `@myriaddreamin/typst.ts` y `@myriaddreamin/typst-ts-web-compiler` 0.7.0 y 0.8.0-rc3, `esbuild` 0.28.2 y `pdf-lib` 1.17.1. Se descargaron además las fuentes Inter 4.1 y JetBrains Mono 2.304 y el zip de `typst.ts` en `main` (extraído solo en parte, no se usó). Java y Docker: no instalados. Python (global, ya presente): fontTools 4.66.0, pypdf 6.12.2 y PyMuPDF; no se instaló nada.

## Condiciones

- Documento de prueba: 3 páginas A4 (verificado), tabla de 40 filas, SVG de 24 grupos, línea con caracteres latinos (Ñ, Ł, Ž, ç, ü, €). Cambia en cada iteración, porque la fuga es por versión de documento.
- Compilador en un worker. Memoria = `WebAssembly.Memory.buffer.byteLength` del worker (`performance.memory` no existe en workers de Chrome).
- Navegadores: Firefox del Playwright de nona (1.63, firefox-1543, headless, volumen 0) y Chrome del sistema (`channel: 'chrome'`, `--mute-audio`). El Chromium de Playwright no está instalado, así que «Chromium» es Chrome estable; versiones exactas sin anotar.
- Carga de CPU previa (media de 5 s con `Get-Counter`): 0 % y 0 navegadores abiertos antes de cada tanda (la lectura parece redondeada a 0; el contador pudo no resolver la carga residual). Las tandas anteriores, con CPU compartida, se descartan.
- Al terminar no quedan procesos de navegador ni de node.

## 1. Fuga de memoria y versión

Disponibilidad de la corrección (comprobado de nuevo hoy en npm y GitHub):
- npm: `latest` = 0.7.0 (2026-06-01) y `rc` = 0.8.0-rc3 (2026-06-29). Releases de GitHub: la última es v0.8.0-rc3. **No hay versión publicada con `evictCache`.**
- La corrección es la PR #895 (`404730ff`, 2026-10-29), solo en `main`: https://github.com/Myriad-Dreamin/typst.ts/pull/895. `main` incluye también soporte de estándares PDF en el compilador web (`d58db0f0`) y Typst 0.15.1. No se compiló `main`, según lo pedido.

300 compilaciones consecutivas (tandas limpias, texto distinto en cada una):

| Navegador | Versión | Reciclado del worker | Mediana | p95 | Primera | Memoria wasm | Arranque (init) |
|-----------|---------|----------------------|---------|-----|---------|--------------|-----------------|
| Firefox | 0.7.0 | no | 62 ms | 75 ms | 103 ms | 19 → 1321 MB | 1451 ms |
| Firefox | 0.7.0 | cada 50 | 67 ms | 83 ms | 101 ms | 19 → 222 MB (máx.) | 1410 ms, luego 374-413 ms por reinicio |
| Chrome | 0.7.0 | no | 141 ms | 500 ms | 427 ms | 19 → 1321 MB | 1077 ms |
| Chrome | 0.7.0 | cada 50 | 85 ms | 147 ms | 351 ms | 19 → 222 MB (máx.) | 1033 ms, luego 191-198 ms por reinicio |
| Firefox | 0.8.0-rc3 | no | 61 ms | 75 ms | 101 ms | 19 → 1323 MB | 1452 ms |
| Chrome | 0.8.0-rc3 | no | 115 ms | 516 ms | 328 ms | 19 → 1323 MB | 1058 ms |

- Las 300 compilaciones terminaron sin error en las seis tandas.
- La fuga es lineal, unos 4,3 MB por compilación con este documento, y es idéntica en 0.7.0 y 0.8.0-rc3 y en los dos navegadores. Hasta el fallo se midió una vez (tanda previa con otra carga de CPU, solo memoria): Firefox con 0.7.0 completó 986 compilaciones y falló en la 987 con `unreachable executed` a 4094 MB (el tope de 4 GiB de wasm32). Un documento más pesado agota la memoria antes (la PR habla de unas 100 compilaciones con documentos que crecen 40 MB por versión).
- En Chrome la fuga también cuesta tiempo: con la memoria creciendo la mediana sube de 85 a 141 ms y el p95 de 147 a 500 ms respecto al reciclado. En Firefox el tiempo apenas cambia.
- Reciclar el worker cada 50 compilaciones cuesta 190-410 ms por reinicio (el wasm ya está en caché del navegador) y mantiene el pico en 222 MB, en ambos navegadores.
- **No medido: `evictCache`** (sigue sin versión publicada). La PR afirma, medido en Node: 224 → 286 MB tras 200 compilaciones con `evictCache(1)`, a 84 ms. Es afirmación del autor, no nuestra.

Recomendación: `typst.ts` 0.7.0 (estable) con reciclado del worker cada 50 compilaciones. Pasar a la primera versión publicada con #895 y `evictCache(1)` tras cada compilación, conservando el reciclado como red de seguridad. 0.8.0-rc3 no resuelve la fuga.

## 2. El `.wasm` en GitHub Pages

Tamaños (Node `zlib`): 0.7.0 pesa 28 325 178 bytes y 0.8.0-rc3, 30 156 049. Con gzip 6: 10 859 138 y 11 045 978; con gzip 9: 10 839 742 y 11 024 270; con brotli 11: 7 099 357 y 7 607 777.

Pages, medido con `curl -I` sobre un `.wasm` ya publicado (https://myriad-dreamin.github.io/typst.ts/cookery/internal/typst_ts_renderer_bg.wasm): `application/wasm`, comprime con gzip (1 059 617 → 362 408 bytes), no ofrece brotli, `Cache-Control: max-age=600`. Las cabeceras no se pueden cambiar. Si Pages comprime `.ttf`: sin verificar.

Primera carga con red simulada, medida desde un servidor local que sirve gzip como Pages (`bench/server.mjs`, limita ancho de banda y latencia; versión 0.7.0, cinco fuentes en latín extendido). «Primer PDF» = desde el inicio de la navegación hasta recibir el primer PDF compilado:

| Navegador | Red | Visita 1, sin caché | Visita 2, con service worker | Visita 2, solo caché HTTP |
|-----------|-----|---------------------|------------------------------|---------------------------|
| Firefox | 10 Mbit/s, 40 ms | 10,6 s (11,11 MB servidos) | 0,93 s | 0,59 s |
| Firefox | 1,6 Mbit/s, 150 ms («3G») | 57,6 s | 1,9 s | no medido |
| Chrome | 10 Mbit/s, 40 ms | 10,4 s | 0,72 s | **9,3 s** (volvió a descargar 10,4 MB) |
| Chrome | 1,6 Mbit/s, 150 ms | 57,6 s | 1,7 s | no medido |

- La descarga total es de 11,11 MB con gzip (wasm + fuentes + página + worker). La visita 2 con service worker descargó 0,74 MB: son las fuentes en latín extendido, que mi precarga no incluyó por error (precargó las fuentes completas); con la precarga correcta la visita 2 no usa red. El `compile` es de 90 ms en Firefox y 340 ms en Chrome tras arrancar.
- **Hallazgo:** Chrome no conservó el `.wasm` en la caché HTTP entre visitas (volvió a descargar 10,4 MB con `max-age=600`), mientras que Firefox sí. Por eso un service worker con caché propia (Cache Storage) es necesario y no un lujo: con él la segunda visita baja de 10 s a menos de 1 s en 10 Mbit/s y de 58 s a menos de 2 s en 3G.
- Prueba realizada con el origen `http://127.0.0.1`; el comportamiento de caché en Pages (https) real: sin verificar.
- Recomendación: `.wasm` con hash en el nombre, service worker con caché primero para wasm, worker y fuentes, y precarga del conjunto exacto tras el primer PDF (o durante la instalación del service worker, avisando al usuario de unos 11 MB en la primera visita).

## 3. Fuentes

Subconjuntos con `fontTools.subset` (rasgos OpenType conservados: todos). Pesos en bytes, TTF sin comprimir:

| Fuente | Completa | Latín | Latín extendido |
|--------|----------|-------|-----------------|
| Inter Regular 4.1 | 411 640 | 103 692 | 179 100 |
| Inter Medium | 417 300 | 105 472 | 181 712 |
| Inter Bold | 420 428 | 105 696 | 182 656 |
| JetBrains Mono Regular 2.304 | 273 900 | 91 892 | 115 112 |
| JetBrains Mono Bold | 277 828 | 94 608 | 117 792 |
| InterVariable | 879 708 | | |
| JetBrainsMono[wght] | 303 144 | | |

Con gzip (nivel 9): Inter Regular completa 200 540, latín 46 349, latín extendido 79 985; JetBrains Mono Regular completa 129 749, latín 43 508, latín extendido 52 585. El juego Inter (R, M, B) + JetBrains Mono (R, B) en latín extendido son 0,81 MB en bruto. Ambas fuentes son OFL; hay que incluir sus textos de licencia.

Compilado y comprobado en Firefox (3 páginas, fuentes incrustadas, página 1 renderizada con PyMuPDF y revisada a ojo):
- Completas: correcto. Tamaño del PDF 94 748 bytes.
- **Latín** (U+0020-007E, U+00A0-00FF y signos): sale bien, **pero Ł, ł y Ž aparecen como hueco en blanco, sin error ni aviso**. Insuficiente para polaco, checo, etc.
- **Latín extendido** (añade U+0100-024F, U+1E00-1EFF, U+2C60-2C7F, U+A720-A7FF): correcto, con Ł, ł, Ž y la negrita real; 92 782 bytes.
- **Variables** (`InterVariable.ttf`, `JetBrainsMono[wght].ttf`): Typst las carga con nombre de familia «Inter Variable» y la letra sale, pero **ignora el eje de peso**: la negrita y el título salen en peso normal. No usar variables para el PDF.
- No hay cursiva: la plantilla debe empaquetar Inter Italic si la usa (en la prueba solo se cargó el romano y la cursiva sale recta).
- Cirílico, griego y vietnamita: Inter completa los incluye; los subconjuntos no. Sin verificar el comportamiento fuera de latín.

Recomendación: empaquetar Inter (Regular, Medium, Bold y, si hace falta, Italic) y JetBrains Mono (Regular, Bold) en latín extendido, y ofrecer las completas como paquete opcional de alfabetos.

## 4. PDF/UA y la comprobación en CI

- Typst 0.15 (0.7.0 y rc3) no escribe `DisplayDocTitle` ni `/Tabs /S`, y no declara `pdfuaid:part`. Sí escribe `Marked`, `StructTreeRoot`, `Lang`, título (Info y XMP), fuentes incrustadas, `Figure` con `/Alt`, `THead` con `TH`.
- **Corrección en el PDF de prueba, comprobada.** Typst no lo permite desde el documento, pero se corrige después de compilar con `bench/fix_pdf.py` (pypdf) o `bench/fix-pdf-lib.mjs` (pdf-lib 1.17.1, utilizable en el navegador): pone `DisplayDocTitle` en `true` y `/Tabs /S` en cada página. El PDF corregido sigue con 3 páginas, título y texto intactos, y pasa `check_pdf.py` (`BASICO_OK: True`, salida 0; el original sale 1). Tamaños: 92 782 → 86 247 (pypdf) y 86 552 (pdf-lib), por reescribir sin los objetos innecesarios. No añade la declaración PDF/UA-1 a propósito: no conviene declarar conformidad sin validarla.
- `bench/check_pdf.py` (Python + pypdf) comprueba: `Marked`, `StructTreeRoot`, `Lang`, `DisplayDocTitle`, título, fuentes incrustadas, `Figure` sin `/Alt`, `TH`, saltos de encabezado, `Tabs=S`; informa de si declara PDF/UA-1. No valida PDF/UA-1: detecta regresiones.
- Validador PDF/UA: veraPDF necesita Java (repositorio https://github.com/veraPDF/veraPDF-apps, GPL-3.0). Sin una declaración `pdfuaid:part=1` falla por identificación, por diseño. Los runners `ubuntu-24.04` de GitHub traen Java 8, 11, 17 (predeterminado), 21 y 25 (https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md), así que en CI veraPDF no pide instalar Java (instalarlo en el job: sin probar). `ubuntu-latest` pasa a 26.04 en noviembre de 2026; conviene fijar `ubuntu-24.04`.
- Alternativas sin Java, **sin verificar** (solo búsqueda): imagen Docker `verapdf/cli` (51 MB, https://hub.docker.com/r/verapdf/cli; Docker no está instalado aquí); `pdf_oxide` (Rust, `pdf-oxide validate --pdfua`, versión 0.3.x, https://pdf.oxide.fyi/docs/compliance/pdf-ua); `pdfua` (Python, prototipo, https://pypi.org/project/pdfua/). PAC es solo Windows y con interfaz.
- Recomendación: en CI, `check_pdf.py` sobre el PDF corregido en cada cambio; veraPDF en el runner de GitHub, informativo, cuando haya un PDF con `ua-1`. Para declarar PDF/UA-1 hace falta el estándar en el compilador (`main`, sin verificar) o aceptar el PDF etiquetado sin declaración.

## Pendiente, sin verificar

- `evictCache` y la opción `ua-1` (no hay versión publicada; `main` sin compilar).
- Llegar al fallo en Chrome y con 0.8.0-rc3 (solo se llevó a 300; el fallo a las 987 es de Firefox con 0.7.0 en una tanda anterior).
- Caché en Pages real (https) y compresión de `.ttf` allí; precarga corregida con las fuentes de latín extendido.
- Fuera de latín: cirílico y griego con subconjuntos; Inter Italic.
- veraPDF en CI, `pdf_oxide`, `pdfua`.
- Versiones exactas de Chrome y Firefox.
