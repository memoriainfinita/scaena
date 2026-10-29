# Enlace con datos en la URL e importación de PDF/DXF

Fecha: 2026-10-29. Investigación cerrada antes de tiempo a petición del usuario: la parte 2 (importación) quedó **sin medir**; solo hay datos de registro npm y de documentación.

Laboratorio: `D:\DOCS\CODELAB\4_scratch\scaena-lab\enlace-importar` (`gen-show.mjs`, `bench.mjs`, `scale.mjs`, `browser-test.mjs`, `cs-test.mjs`, `make-samples.py`, `samples/sala.pdf`, `samples/sala.dxf`; resultados en `bench-result.json` y `browser-result.json`).

Aviso de método: los navegadores se midieron con el Firefox personal del usuario abierto (muchos procesos `firefox.exe` ajenos), así que **los tiempos en ms de compresión (1 a 4 ms) pueden estar afectados por competencia de CPU y no son fiables**. Los tamaños en bytes y los límites de URL no dependen de la CPU.

## 1. Enlace con el montaje en el fragmento (#...)

### 1.1 Límites de URL en navegadores

| Navegador | Medido (Playwright, headless, silenciado) | Documentado |
|---|---|---|
| Chromium 140 | `page.goto` con fragmento de 2.000.000 caracteres: funciona. Con 2.097.152: `ERR_ABORTED`. Asignar `location.hash` o `history.replaceState` con hasta 64.000.000 caracteres: funciona (navegación en el mismo documento, sin tope) | `kMaxURLChars = 2*1024*1024` (2.097.152), tope de URL entre procesos: https://chromium.googlesource.com/chromium/src/+/main/url/url_constants.h |
| Firefox 155 | `page.goto` con fragmento de 1.000.000: funciona. Con URL total de 1.048.576 o más: «Invalid url»; `location.hash` da error y `replaceState` «The operation is insecure». Tope de **1 MiB de URL completa**, también desde script | 1 MiB (1048576), `network.standard-url.max-length`: https://bugzilla.mozilla.org/show_bug.cgi?id=1135354 |
| Safari | **Sin verificar** (WebKit no está instalado en el Playwright de nona) | Blogs hablan de ~80.000 caracteres, sin fuente primaria. Un arreglo de WebKit de enero 2026 hace que el hash cuente en el límite: https://bugs.webkit.org/show_bug.cgi?id=305505 |

Otros puntos medidos: en ambos navegadores 100 KB, 256 KB y 1 MB de fragmento funcionan sin problema. Conclusión: para el navegador, el tope práctico es **~1 MiB de URL** (el mínimo de los dos medidos), 50 a 100 veces más que lo que necesita un montaje. Un fragmento no viaja al servidor: no le afectan los 413/414.

Sin verificar: la barra de direcciones, pegar a mano y abrir desde otra aplicación. Windows limita la línea de comandos de CreateProcess a 32.767 caracteres (https://devblogs.microsoft.com/oldnewthing/20031210-00/?p=41553); una cita secundaria habla de ~2048 para ShellExecute. Un clic en un enlace dentro de una aplicación de escritorio podría cortarse ahí. Hay que probarlo con un enlace de 10 KB en el WhatsApp o correo reales. Android e iOS: sin buscar.

### 1.2 Límites donde se pega el enlace

| Plataforma | Dato | Fuente / estado |
|---|---|---|
| Telegram | Mensaje de 0 a 4096 caracteres tras el análisis de entidades; pie de foto 1024 | Bot API, https://core.telegram.org/bots/api (leído en `sendMessageDraft` y pies de foto; el apartado `sendMessage` no llegué a leerlo). Si el cliente trocea o rechaza un enlace largo: **sin verificar** |
| WhatsApp | API de empresa: 4096 caracteres de texto. App de consumo: se repite 65.536, sin fuente oficial | Meta/proveedores (https://developers.cm.com/messaging/docs/whatsapp-text-message); 65.536 solo en contadores de terceros. Si se hace clicable un enlace de varios KB o cuántos caracteres de URL admite: **sin verificar** |
| Correo | RFC 5322: líneas de 998 máximo (recomendado 78); el cliente pliega líneas largas y se pueden romper enlaces. Outlook de escritorio: tope 2084 de URL, subido a 8192 en la compilación 16116; sobre ~11.000 no es clicable. Safe Links añade caracteres antes de truncar | Fuentes secundarias (Microsoft Q&A, Neowin): https://learn.microsoft.com/en-us/answers/questions/5790802/restriction-on-outlook-as-how-many-characters-can ; https://www.neowin.net/amp/you-can-now-send-much-longer-links-with-microsoft-outlook-thanks-to-bug-fix/. Gmail: **sin verificar** (no encontré documentación) |
| Acortadores | Bit.ly: ~2048 caracteres (cita de 2011, https://habr.com/en/articles/117881, desactualizada); página oficial no accesible (403). TinyURL e is.gd: no encontré límite. Si conservan el `#`: **sin verificar** | Además un acortador es un servidor que ve el montaje: contradice «sin servidor» y la privacidad (contactos y horarios). Descartado |

Resumen operativo: el límite que manda no es el navegador sino el mensajero y el correo. Con 4096 (Telegram y WhatsApp empresa) y 8192 (Outlook actualizado) como referencias fiables, y ~2000 como marca clásica de compatibilidad.

### 1.3 Tamaño de un montaje realista

`show.json` sintético con el modelo de `modelo-2026-10-29.md`: 40 canales, 30 luminarias, 12 salidas, 6 contactos, 8 horarios, setlist de 14, rider de 5 secciones, 4 posiciones de montaje, 4 revisiones, magic sheet. Reproducible con semilla. Pesimista: posiciones x,y aleatorias al milímetro (con rejilla de 250 mm baja ~6 a 8 %). Los textos libres y los vocabularios son de mi generador, no de datos reales de un usuario.

JSON sin comprimir: 50 elementos 28,6 KB (ids cortos) o 42,9 KB (UUID); 100 elementos 36,4 KB o 54,8 KB; 150 elementos 44,9 KB o 66,6 KB.

**Medido en navegador con `CompressionStream` + base64url** (100 elementos, ida y vuelta correcta en ambos):

| Caso | JSON | deflate-raw | base64url | gzip (base64url) |
|---|---|---|---|---|
| Chromium 140, ids cortos | 36.390 | 7.164 | **9.552** | 9.576 |
| Firefox 155, ids cortos | 36.390 | 7.294 | **9.726** | 9.750 |
| Chromium 140, UUID | 54.847 | 14.058 | **18.744** | 18.768 |
| Firefox 155, UUID | 54.847 | 14.189 | **18.919** | 18.943 |

`deflate-raw` gana a `deflate` y `gzip` por 6 y 18 bytes (cabeceras); sirve cualquiera.

**Efecto del id**: un UUID v4 son ~16 bytes incompresibles por entidad. Con UUID el enlace es el doble (18,7 KB frente a 9,6 KB a 100 elementos). Con ids secuenciales por entidad (base 36), mucho menor. Esta es la decisión que más pesa.

**Alternativas** (mismo montaje, bytes comprimidos, node; multiplicar por 4/3 para base64url). Con vocabulario justo, sin trampas:

| Variante (150 el., ids cortos) | bytes |
|---|---|
| JSON + deflate nivel 9 | 8.087 |
| JSON columnar sin valores por defecto + deflate | 7.225 (−11 %) |
| MessagePack / CBOR + deflate | 8.231 / 8.081 (no ganan) |
| JSON + brotli q11 | 6.677 (−17 %) |
| JSON columnar + brotli q11 | 6.254 (−23 %) |
| JSON + zstd 19 | 7.377 |
| Deflate con diccionario (fflate) construido solo con claves y vocabulario de biblioteca | 8.314 (peor) |
| Columnar + deflate con diccionario | 6.359 (−12 % sobre columnar sin diccionario, a costa de código) |

Un primer diccionario hecho con otro montaje del mismo generador daba −31 %; era trampa (compartía vocabulario con los datos de prueba). Lo desestimo: no está demostrado que un diccionario honesto aporte algo.

- **Brotli**: `CompressionStream('brotli')` existe en Firefox 155 pero **no** en Chromium 140 (medido); Safari **sin verificar**. En WebAssembly (`brotli-wasm` 3.0.1, Apache-2.0): 1,06 MB el `.wasm`, ~0,50 MB con gzip, para ahorrar ~17 a 23 % (1,5 a 2 KB). No compensa: cabe sin él.
- **zstd wasm** (`@bokuweb/zstd-wasm`, MIT): `.wasm` de 252 KB (80 KB con gzip), ahorra ~9 % sobre deflate. No compensa. Su soporte de diccionarios no lo probé.
- **base64url**: 4/3 de la longitud binaria. Un alfabeto de ~81 caracteres válidos en fragmento daría ~6 % menos, pero caracteres como `)`, `'`, `,` o `.` rompen la detección de enlaces en mensajeros. No merece la pena (reducción de caracteres con Unicode, tipo Base32768: no clicable ni estable al copiar; sin verificar).

### 1.4 Cuánto cabe (deflate nativo + base64url, ×1,02 por el medido; columnas = elementos / canales / luminarias)

| Montaje | ids cortos | ids cortos + rejilla | UUID |
|---|---|---|---|
| 50 / 40 / 30 | 8,2 KB | 7,8 KB | 15,7 KB |
| 100 / 40 / 30 | 9,6 KB | 9,0 KB | 18,9 KB |
| 150 / 40 / 30 | 11,0 KB | 10,1 KB | 21,9 KB |
| 300 / 64 / 60 | 16,9 KB | 15,2 KB | 37,6 KB |
| 500 / 96 / 100 | 24,7 KB | 21,8 KB | 57,4 KB |
| 1000 / 128 / 200 | 42,4 KB | 36,7 KB | 100,2 KB |
| 2000 / 256 / 400 | 79,2 KB | 67,1 KB | 192,8 KB |

(1 KB = 1000 caracteres de enlace.) Marginal: ~25 a 30 caracteres por elemento adicional con ids cortos.

**Máximo que cabe**:
- Límite del navegador (1 MiB, Firefox): el enlace de 2000 elementos (79 KB) usa el 8 %. Nunca es el cuello de botella.
- Límite de 4096 caracteres (Telegram, WhatsApp empresa): ni el montaje mínimo de la prueba (50 elementos, 8,2 KB) cabe. Pegado como texto, **ningún montaje realista cabe en 4096**; solo cabría un esqueleto sin textos, y no medí cuánto.
- Límite de 8192 (Outlook actualizado): cabe, y solo justo, un montaje de ~40 a 50 elementos con ids cortos y sin textos largos.
- Mensajero sin tope duro documentado: montajes de 150 elementos (11 KB) son plausibles, pero la clicabilidad es **sin verificar**.

Dentro de lo medido: el enlace funciona de forma garantizada solo para uso entre navegadores (copiar y pegar en una barra de direcciones, marcador, código QR no), y de forma incierta por mensajería.

### 1.5 Qué hacer cuando no cabe

1. **Enlace solo con ids cortos secuenciales** (decisión del modelo, no del enlace): en la ruta de exportación a enlace, serializar con ids de entidad secuenciales y mapear al cargar.
2. **Referencias, no copias**: la biblioteca va en la app, el enlace guarda `tipo@versión`. Las definiciones copiadas de `.scaena` (mi prueba con 40 definiciones: 155 KB de JSON, 19,4 KB comprimidos con UUID) no entran en el enlace.
3. **Excluir lo que no cabe por diseño**: imágenes importadas, logo, elementos propios con SVG y fondos. El enlace dice «incompleto: faltan N imágenes» y ofrece el `.scaena`.
4. **Medir al generar**: mostrar el tamaño del enlace y avisar por tramos (4096, 8192, 1 MiB) con el motivo; ofrecer entonces «Descargar .scaena» como vía principal (decidido ya: Compartir = `.scaena`, PDF, PNG y enlace).
5. **Opciones de recorte** (casilla en el diálogo): sin rider largo, sin contactos (ya previsto), sin revisiones.
6. Si se quiere compresión adicional, columnar + deflate (−11 %) es barata; brotli/zstd wasm no.
7. Un alojamiento de fragmentos (pastebin) o acortador: descartado por «sin servidor».

## 2. Importar PDF o DXF como fondo

**Sin medir en este estudio.** Hay un PDF y un DXF de ejemplo (sala 30×20 m, ~430 entidades, `samples/sala.pdf` 8,5 KB y `samples/sala.dxf` 45 KB), pero la instalación de `pdfjs-dist` por pnpm se atascó (35 MB, mucho tiempo) y se cortó. Nada de lo siguiente se probó en navegador; los datos son del registro npm (`npm view`) y de documentación.

| Biblioteca | Licencia | Compatible con GPL-3.0 | Peso | Última publicación | Notas |
|---|---|---|---|---|---|
| pdfjs-dist 6.4.299 (https://github.com/mozilla/pdf.js) | Apache-2.0 | Sí (con GPL-3.0, no con GPL-2.0) | 34,9 MB descomprimidos en npm; el peso útil en el navegador (núcleo + worker + wasm de JPX) **sin medir** | 2026-10-03 | Mantenimiento de Mozilla. Hace falta worker y `wasm-unsafe-eval` para JPEG2000/imágenes; con la CSP estricta de scaena hay que abrir `worker-src` y esa directiva (sin verificar la configuración exacta). Rasteriza a canvas sin servidor |
| dxf-parser 1.1.2 | MIT | Sí | 193 KB | 2022-06-16 | Parser; parado desde 2022. Ni lo probé |
| dxf 5.3.1 (skymakerolof) | MIT | Sí | 535 KB | 2025-09-01 | Parser y `toSVG`; **sin probar**, ni su cobertura de entidades |
| dxf-viewer 1.0.50 (vagran) | MPL-2.0 | Sí (la MPL 2.0 permite combinar con GPL-3.0 por su cláusula de licencia secundaria; sin consultar fuente, cuidar la atribución) | 903 KB + three.js | 2026-10-17 | WebGL con three.js. Basado en dxf-parser. Limitaciones documentadas: sin espacio papel ni layouts, sin curvas spline en polilíneas, sin patrones de línea, texto sin estilos, solo dimensiones lineales, sin hatching sólido. Un solo mantenedor, con ayuda de IA. Fuente: https://cdn.jsdelivr.net/npm/dxf-viewer@1.0.49/README.md |
| three-dxf 1.3.1 | MIT | Sí | 388 KB | 2022-06-27 | Inactivo |
| @tarikjabiri/dxf 2.9.0 | MIT | Sí | 430 KB | 2026-09-15 | Es un **escritor** de DXF, no sirve para leer |
| dxf-json 0.14.1 | GPL-3.0 | Sí | 867 KB | 2026-07-01 | Parser; mantenimiento reciente; sin probar |
| mupdf 1.28.1 | AGPL-3.0-or-later | Sí en principio (AGPL con GPL-3.0 se puede combinar), pero **arrastra copyleft de red** y 14 MB. Descartado | 14,3 MB | 2026-09-06 | |
| @mlightcad/libredwg-web 0.8.2 | GPL-3.0 | Sí | 12,4 MB | 2026-10-22 | Lee DWG; pesado. Solo si se pide DWG; fuera del alcance |

### Rasterizar o mantener vectores

- **Un fondo es referencia visual**, no geometría que se edita: no se ajusta ni se mide sobre sus líneas (la medición usa la escala calibrada por el usuario). Rasterizar basta.
- Ventajas de rasterizar: un único tipo de dato (imagen) para PDF y DXF; el `.scaena` ya admite imágenes; el PDF final del rider la incrusta sin más; no se carga ni se ejecuta código del archivo ajeno en el editor.
- Desventajas: pérdida de nitidez al ampliar mucho; hay que elegir resolución (peso del `.scaena`, y el enlace no la llevaría de todos modos).
- Mantener vectores solo aporta nitidez a cualquier zoom, a costa de convertir a SVG (DXF) y de sanear. Un SVG ajeno es una superficie de ataque; con CSP estricta se puede pintar como `<img>` (los scripts no se ejecutan), pero no lo probé.

### Recomendación (provisional, sin medir)

1. **PDF**: pdf.js (Apache-2.0, mantenimiento sólido) en un worker, cargado solo al importar, rasterizando una página a canvas y guardando WebP o PNG en el `.scaena`. Calibrar escala pidiendo al usuario dos puntos y una distancia real. Antes de decidir: medir el peso real de `pdf.min.mjs`, el worker y los `.wasm`, y comprobar la CSP en Firefox y Chromium.
2. **DXF**: rasterizar también, para mantener un único formato de fondo. Dibujar las entidades 2D (líneas, polilíneas, círculos, arcos, texto, bloques) sobre canvas a partir de un parser MIT ligero (`dxf` 5.3.1 o `dxf-parser`, a elegir probando con DXF reales). `dxf-viewer` (MPL-2.0, WebGL, 903 KB + three.js) cubre más, pero añade three.js y WebGL a una app SVG/Preact para algo que solo es un fondo. Lo dejo como plan B si el parser ligero falla con archivos reales.
3. DWG: fuera (pedir al usuario que guarde como DXF o PDF).
4. En ambos casos: tratar el archivo como no fiable (límites de tamaño y de entidades, importación en worker, sin ejecutar nada).

## 3. Pendiente / sin verificar

- Safari: límite de URL y soporte de `CompressionStream` (WebKit no medido).
- Barra de direcciones y apertura desde apps (clic en WhatsApp, Telegram, Gmail, Outlook) con enlaces de 5 a 20 KB.
- Límites reales de bit.ly, TinyURL, is.gd y conservación del fragmento.
- Texto exacto de `sendMessage` en la Bot API; tope real del consumidor de WhatsApp; clipping de Gmail.
- Diccionario de compresión honesto con datos reales de usuarios (mis datos son sintéticos y optimistas en vocabulario).
- Todo de la parte 2: tamaño real en navegador de pdf.js, comportamiento con la CSP, calidad de los parsers DXF y rasterizado de `samples/`.
- Procesos: al cortar, quedan en la lista varios `node.exe`/`sh.exe`/`bash.exe` cuyo origen no pude confirmar (no pude matarlos: la acción fue denegada). Los navegadores de Playwright se cerraron (comprobado: ningún proceso con `ms-playwright`).
