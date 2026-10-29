# scaena — investigación previa

Fecha: 2026-10-29. Búsquedas web, lectura de READMEs y LICENSE, consultas con `gh`. Las descripciones de apps comerciales son las de sus propios sitios.

## Ridermaker por dentro (leído el 2026-10-29)

Páginas: precios, «Solución Ridermaker», «Buenas prácticas del rider técnico» (11 consejos) y la ayuda sobre bloques de la lista de canales. Cookies no esenciales rechazadas. No se creó cuenta ni se probó el editor guardando nada.

Planes:

| | Gratis | Pro (19 € al año) | Premium (29 € al año) |
|---|---|---|---|
| Proyectos guardados | 1 | 5 | Ilimitados |
| Favoritos | 5 | Ilimitados | Ilimitados |
| Elementos de sonido e iluminación | Más de 400 | Igual | Igual |
| Edición de elementos | Tamaño, rotación, voltear, capa, expandir | Igual | Igual |
| PDFs | Ilimitados | Igual | Igual |
| Enlaces públicos | Permanentes (los gratuitos) | Todos permanentes | Todos permanentes |
| Pie de página | 2.000 caracteres | 10.000 (pie y una página), con formato | Igual |
| Imágenes propias | — | 10 | 50 |
| Solo de pago | — | Columnas y colores propios en la lista de canales, lista de salidas, textos en escenario, imagen de fondo, leyenda de elementos, cuadrícula magnética, quitar el enlace del PDF, exportar canales a mesa | Igual |

- Exportación a mesa (de pago): X32, X Air, CL/QL, WING, dLive, Avantis, RIVAGE, Ui12/16. Carga solo nombres y colores de canal; no toca ecualización, dinámicas, mutes ni patch. Por USB en X32/M32, WING, RIVAGE y Ui12/16; por el editor de PC en CL/QL, dLive, Avantis y X Air/M Air
- Guardado en la nube con cuenta, edición desde cualquier dispositivo, duplicar y crear plantillas
- Un solo documento con plano, lista de canales, monitores, contactos y horarios
- Lista de canales en el PDF repartida en bloques (Auto, 1 a 4). Auto usa hasta 3 según el texto. Un texto que no cabe sale recortado con «…» en el PDF y en naranja con aviso en el editor. En el enlace compartido, una columna en móvil
- Formatos de PDF vertical y horizontal
- Declara «+152 países»
- Su propia web dice que la IA no sirve para esto: no es determinista, no usa elementos estándar y no permite reutilizar plantillas

Buenas prácticas que da (11 consejos):
1. Formas simples y poco color; debe entenderse impreso en blanco y negro y con poca luz
2. Monitores numerados con su mezcla, de izquierda a derecha y de delante atrás; dos cuñas, dos dibujos
3. Marcar cada toma de corriente en el plano; voltaje y enchufe si es fuera del país
4. Siempre visto desde el público
5. Plano y lista de canales deben coincidir
6. Orden de canales: batería (bombo, caja, hi-hat, toms de agudo a grave, overheads), bajo, guitarras, teclados, voces, sin huecos
7. Nombre corto por canal y su micro o DI; «Teclado x2» es ambiguo, mejor «Tecl 1 L» y «Tecl 1 R»
8. Pares estéreo en canal impar (15/16, no 16/17), porque muchas mesas no enlazan si el primero es par
9. Lista de salidas: cada mezcla, cuña o in-ear, mono o estéreo
10. Quién trae cada cosa; lo no estándar lo trae el artista; contacto técnico con nombre, teléfono y email. El texto de detalles viene desactivado por defecto al publicar el enlace
11. Enviar la última versión al menos una semana antes, con fecha; llevar copia impresa. La fecha sale en el PDF si va en el nombre del rider

## LXFree y otras apps de luces y producción (leído el 2026-10-29)

| App | Qué es | Condiciones |
|-----|--------|-------------|
| LXFree (claudeheintzdesign.com) | Dibuja el plano de luces y edita los datos pegados a cada objeto gráfico; los informes salen de enlazar gráficos, datos y bases de propiedades. Nativo de Mac | Gratis solo para uso no comercial; no dice si el código es abierto. En Windows y Linux, el hermano LXPlan (antes LXFree para Java) necesita Java. Un foro la describe con limitaciones serias para planos grandes; sin campo de selección de grupo (fuentes antiguas) |
| LuminaPlot (luminaplot.com) | Editor en navegador: 210 equipos de 19 fabricantes, autoparcheo DMX con comprobación de conflictos, truss y rigging con límite de carga, peso por posición frente a luz, consumo por fase frente a magnetotérmicos, audio (PA, subs, cuñas, IEM, input list), cortinas, «Pocket companion» móvil para comprobar hookup, parche y potencia en la sala | Gratis: 2 plots de hasta 100 equipos y exportación con marca de agua. Pro desde 11,25 €/mes: colaboración en vivo, MVR, builder de rider, enlaces siempre al día. Exporta PDF (plot, instrument schedule, magic sheet, parche, potencia, listas por posición, cargas), PNG, SVG y CSV. El mismo motor dibuja en pantalla y en el PDF. Cada edición se refleja en el dispositivo antes de llegar al servidor. Enlaces con QR en el cajetín |
| Setplot (setplot.app) | Teatro: barras, varas y escalas sobre el plano de planta; se orienta cada foco arrastrando su punto de enfoque, y el haz se actualiza en plano y vista 3D. «Looks» por escena con fundidos previsualizables. Avisa de direcciones duplicadas y asigna la siguiente libre | Gratis sin cuenta para dibujar; con cuenta gratuita guarda y exporta. Hasta 3 producciones activas. MVR de pago. Exporta plano (PDF, PNG, SVG), channel hookup, hanging schedule, parche, magic sheet y sección; hookup también en CSV. El plano lleva un crédito de Setplot |
| Enchantent LX Plot (enchantent.com.au) | Hoja horizontal o vertical, escala y tamaño de escenario en metros, equipos y truss a escala con alineación magnética, líneas de referencia del teatro (centro, plaster, proscenio), medidas desde el centro o la esquina, fondo de sala que se arrastra, escala y bloquea, cajetín, autonumeración, regla desde el centro (I/D) y proscenio (US/DS) | Gratis; no declara licencia. Dice que el resultado es «aproximado, para planificar». Es de una empresa de alquiler de Perth |
| Drafty (drafty-app.com) | CAD en navegador para luces, sonido y vídeo con símbolos USITT/ABTT, capas automáticas, leyenda que se construye al dibujar, base de datos viva. Conjuntos: símbolos de altavoz, autonumeración, flujo de señal, truss y barras, Lineset Scheduler, Rack Builder, Smart Section, Database Manager, 30 plates, escenografía. Interfaz deliberadamente mínima. Importa PDF y DXF | De pago: 20 a 40 USD al mes, prueba de 30 días, sin plan gratuito. Funciona sin conexión tras cargar; guardar e imprimir piden red. Exporta PDF, PNG, JPG, CSV y `.drafty`; parche para ETC Eos, grandMA, ChamSys y CSV. Guarda en Google Drive con OAuth. Recomienda Chrome, Safari en desuso, Firefox previsto |
| Stage Tech Pro (stagetechpro.online) | Stage plot, input list, patch sheet y show file de mesa en una app; plantillas; rider completo a PDF en un clic | Solo vi una ficha de producto; sin verificar |

| Stage Plot Designer de Boss Radio (bossradioatx.com) | Web de 2014 de Boss Radio Music Services. Campos de banda, sala y fecha; escenario con Upstage y Downstage; unos 50 elementos (instrumentos, amplis, baterías, monitores, soportes, teclados, percusión, vientos, flightcases, luces, DI, truss); por elemento: girar, voltear en X e Y, restablecer, quitar; lista de entradas de 32 canales; notas; imprimir o PDF y modo captura | No dice si funciona sin conexión, cómo guarda ni su licencia; enlaza un bote de propinas |
| TecRider (tecrider.com) | Lienzo con categorías (guitarra y bajo, amplis, pedales, batería, teclas, voces, PA y DJ, metales, equipo de escenario, personas, cables), iconos propios subidos, lista de entradas en tabla (canal, instrumento, efectos o ajustes, comentarios) rellenada a mano, setlist (número, título, comentario, duración y total), guías y plantillas (setlist, input list, envío a salas, rider frente a stage plot) | Gratis el diseñador, la lista y el PDF; enlaces para compartir. De pago: más de 500 iconos extra, plots ilimitados, iconos con IA, logo propio; 0,99 USD por 2 días, 15 USD al año o 19 USD de por vida; anuncios en el plan gratuito. Solo en inglés. Declara más de 160.000 usuarios y 4,1/5 |

De TecRider y Boss Radio:
- El setlist con duración total acompaña al rider en TecRider
- En ambos la lista de canales se escribe a mano: no se genera desde el plano
- Boss Radio ofrece un «modo captura» para sacar el plano limpio
- TecRider solo está en inglés y financia el plan gratuito con anuncios

Lo que no hace ninguna de las gratuitas: juntar audio, luces y rider en un solo modelo de datos con licencia libre. Las que reúnen más (LuminaPlot, Drafty) son de pago o tienen límites.

Piezas que aparecen aquí y no estaban en el alcance de scaena:
- Magic sheet: esquema para programar luces (LuminaPlot, Setplot, Lightwright)
- Sección lateral del montaje (Setplot, Drafty; RP-2 lo define como el segundo documento junto al plano)
- Enfoque arrastrando el punto de mira de cada foco
- Líneas de referencia del teatro (centro, plaster, proscenio) y reglas desde el centro
- Carga de truss y peso por posición, y consumo por fase frente a magnetotérmicos
- Lineset Scheduler (plan de varas) y Rack Builder (rack de equipos) de Drafty
- Flujo de señal (Drafty)
- QR en el cajetín que lleva al enlace de la última versión (LuminaPlot)
- Consulta en el móvil del hookup, parche y potencia (LuminaPlot Pocket companion)
- Looks por escena con fundidos (Setplot)
- Importar PDF o DXF de una sala (Drafty)

## Apps gratuitas

| App | Qué ofrece | Límites declarados |
|-----|------------|--------------------|
| Ridermaker (ridermaker.com) | Stage plot arrastrando instrumentos, amplis, micros, personas; guardar, compartir, favoritos, elementos propios, texto | 5 favoritos en cuenta gratuita; ilimitados en Pro/Premium (prueba de 7 días) |
| Stage Plot Pro (stageplotpro.org) | Más de 200 iconos, input list automática, monitores, PDF del rider | Sin verificar |
| TecRider (tecrider.com) | Más de 500 iconos, input list numerada, monitores, alimentación, PDF | Sin verificar |
| Stageplot (stage-plot.app) | Sin cuenta, rider guardado en el navegador, input list editable, PDF | Sin verificar |
| StageBuilder Pro (stagebuilderpro.com) | Plot editable en la nube, PDF, listas de entrada y salida, enlaces de solo lectura, exportación de escena a mesas Behringer/Midas y Yamaha (marcada como prototipo) | Plan gratuito: un plot; la IA es de pago |
| My Music Rider (ainastudios.org) | Stage plot e input list | Gratis hasta 2 shows |
| Techrider.live | Exportación a mesa, asistente con IA | Lo personal gratis; la colaboración, de pago |

## Código abierto

| Repo | Licencia | Notas |
|------|----------|-------|
| SoundDocs/sounddocs | AGPL-3.0 (LICENSE leído) | 42 estrellas, 512 commits, último push 2026-06-15. Stage plot, patch sheets, mic plots para teatro y corporativo, rider, comunicaciones, pixel map, run of show, analizador de audio. React, TypeScript, Vite, Tailwind, jsPDF. Requiere Supabase (autenticación, base de datos). No menciona luces |
| diceben/stageplot-generator | MIT para el código (LICENSE leído); las imágenes de `stageplot-assets/` quedan excluidas | En alemán, v0.1.0-beta.31, 240 commits, push 2026-10-07. Sin conexión, Pages, routing con stageboxes Behringer y Allen & Heath, diseñador de batería con 93 modelos de micro, hasta 16 mezclas de monitores, PDF/PNG/enlaces de solo lectura. HTML, CSS y JS sin framework; Playwright. Vende paquetes de objetos; Supabase opcional |
| Chiunownow/StagePlotPirate | MIT | 12 estrellas. Librería de símbolos para draw.io portados de StagePlotPro, un software descontinuado. Origen de los símbolos por revisar |
| rikdewit/Miked.live | Sin LICENSE en la raíz; GitHub no detecta licencia | Sin cuenta, input list automática, vista 3D isométrica, PDF. Next.js, Three.js, Supabase, Vercel |
| jackdpage/pylux | GPL-3.0 | 8 estrellas, sin cambios desde 2021. Plano de luces en Python |
| pjf1822/stage-plots, allengrind/StagePlot, masalto17/stageplot | Sin licencia declarada | No reutilizables |
| petesimple/stageplot | MIT | 2 estrellas |
| cdslipp/lost-the-plot | AGPL-3.0 | 0 estrellas |
| iAmBalanceAR/Stage-Plot-Tool | — | 404; ya no existe o es privado |
| axelboi1234/Stage-Plot-Tool-and-Music-Rig-Designer | Sin licencia declarada | Cadenas de señal y stage plot |

Ningún repo revisado pasa de 42 estrellas.

## Luces

- Software propietario: SoftPlot (demo gratuita), Drafty, StageTools (iPad, suscripción), Vectorworks Spotlight
- Abierto: Pylux, sin mantenimiento desde 2021. Open Lighting Console es de control, no de planos
- GDTF (DIN SPEC 15800, v1.2): describe equipos. XML abierto, sin royalties
- MVR (DIN SPEC 15801, v1.6): contenedor de escena que lleva GDTF, patch y posiciones. Creados por MA Lighting, Robe y Vectorworks
- Flujo habitual: diseño en CAD, selección de modo GDTF por equipo, exportación MVR, importación en mesa o previsualización
- Referencia: gdtf-share.com

## Símbolos de luces

- USITT RP-2 (2006), Recommended Practice for Theatrical Lighting Design Graphics. Copia en stagelightingprimer.com, no oficial
- RP-2 define símbolos genéricos sin fabricante y es política de USITT no especificar fabricantes. Cubre light plot y sección, numeración de posiciones y luminarias, escalas e información por luminaria
- El texto extraído del PDF no contiene aviso de copyright ni de permisos
- ANSI E1.27 es de cables de datos, no de símbolos
- Símbolos gratis o baratos hallados, sin licencia libre declarada: stencils de Graffletopia, DWG/DXF de Modelbox y Cue1; SoftSymbols (Vectorworks, más de 3.700 símbolos, comercial)

## Iconos de escenario

- No hay conjunto CC0 de iconos de stage plot
- Phosphor tiene un micro de escenario con licencia MIT
- Los símbolos de StagePlotPro, vía StagePlotPirate, vienen de un producto comercial

## Exportación a mesas

| Mesa | Formato | Estado |
|------|---------|--------|
| Behringer X32 / M32 | Escena `.scn`, texto ASCII, más de 2000 entradas. Nombre de canal en `/ch/NN/config "Nombre" ...` | Documentado. Herramientas abiertas: pmaillot/X32-Behringer, phierceweb/x32scene |
| Midas MR / Behringer X Air | Mismo formato de escena que X Air | Según un conversor de terceros |
| Behringer Wing | `.snap` | Formato distinto; sin documentar aquí |
| Allen & Heath dLive | CSV de Director: nombre, color, patch, preamp (V2.0). Campos: Enabled, Name, Color, Source, Socket, Gain, Pad, Phantom y otros | Nombres de más de 8 caracteres se recortan; sin ä, ö, é, ß (según dlive-midi-tools) |
| Allen & Heath Avantis | CSV con secciones entre corchetes: Version, Channels, Outputs, Virtual Soundcheck | Filas con nombre, color, tipo y número de socket, ganancia, PAD, +48V |
| Allen & Heath SQ | Sin CSV de nombres en la documentación hallada. Nombres y colores van en escenas y shows | Petición en el foro de A&H sin respuesta confirmada |
| Yamaha CL / QL | CSV desde CL/QL Editor 4.0.0: nombres, colores, iconos, patch de entrada y salida. Formato corto (Editor 4.0.x) y normal (Editor 4.1); comentarios en la línea 3 | Colores con abreviaturas (BL, OR, YE, PU, CY, MG, RD, GN, BK); sin notación = apagado; comas del nombre entre comillas dobles y comillas dobles duplicadas |
| Yamaha (conversión) | Console File Converter entre PM5D, M7CL, LS9, CL/QL, RIVAGE PM | — |

## Generar el PDF nosotros en lugar de imprimir (2026-10-29)

El usuario descarta el método de lumina (diálogo de impresión del navegador): se hizo por rápido y sencillo y scaena quiere algo mejor. Búsquedas y consultas, sin pruebas locales todavía.

| Opción | Estado hallado |
|--------|----------------|
| Typst (typst/typst, Apache-2.0, 56.871 estrellas, v0.15.1 del 2026-07-17, activo hoy) | Motor de composición con salida a PDF. Etiquetado por defecto desde 0.14 (octubre de 2025); PDF/UA-1 y PDF/A 1b a 4f, PDF 1.4 a 2.0. Figuras con `alt`; el idioma del texto se fija en el documento; las comprobaciones de PDF/UA-1 exigen título, jerarquía de encabezados y texto alternativo. Las funciones de celdas de tabla (`table-summary`, `header-cell`, `data-cell`) están tras la bandera `a11y-extras`, sin API final y no disponibles en la web app. PDF/UA-2 sin soporte |
| Typst en el navegador: `@myriaddreamin/typst.ts` 0.7.0 (typst.ts, Apache-2.0, 1.247 estrellas, actualizado 2026-06-29) y `typst-wasm` 1.0.0 (MIT, 2026-07-17) | Compilador WebAssembly; el paquete web del compilador pesa unos 28 MB sin comprimir, `typst-wasm` unos 24 MB con sus fuentes aparte. No encontré documentación sobre exportación a PDF de typst.ts ni cifras de arranque. Funciona sin servidor y puede cachearse en una PWA |
| krilla (Rust, MIT o Apache-2.0) | Biblioteca gráfica para PDF con etiquetado y PDF/UA-1 y PDF/A; es la base del PDF de Typst. No hace maquetación (saltos de página, tablas). No hallé soporte para WebAssembly |
| pdfmake | Beta 0.3.0 con PDF/A y PDF/UA, marcada como no apta para producción |
| jsPDF | Una solicitud de cambios añade el modo PDF/UA-1; no consta que esté publicada |
| pdf-lib | Sin mención de etiquetado en lo hallado; habría que construir el árbol de estructura a mano (inferencia mía) |
| Imprimir desde el navegador | Chrome etiqueta desde 2020 y Firefox desde la versión 150, pero Firefox no escribe `/Lang` en la prueba; no controlas márgenes, fuentes ni saltos de página entre navegadores |

Prueba con el CLI de Typst 0.15.1 (2026-10-29)

Descargado `typst-x86_64-pc-windows-msvc.zip` (22.463.684 bytes) de la versión v0.15.1 de typst/typst; el SHA-256 coincide con el que da GitHub (`19ce3551…f6736`). Mismo contenido que la prueba de Chrome y Firefox: título, idioma `es`, encabezados, figura con el plano en SVG y texto alternativo, tabla con cabecera, lista. Compilado con `--pdf-standard ua-1` y sin él. Sin avisos ni errores. Inspección con pypdf.

| Comprobación | Typst | Chrome | Firefox |
|--------------|-------|--------|---------|
| `/Lang` | Sí (`es`) | Sí | No |
| Título y `DisplayDocTitle` | Sí | Sí | Sí |
| Marcadores | Sí | Sí | Sí |
| Encabezados | H1 y H2 con su título (`/T`) | H1, H2 | H1, H2 |
| Figura con `/Alt` | Sí | Sí | Sí |
| Tabla | Table, THead, TBody, TR, TH, TD; cada TH lleva `/Scope /Column` | Table, TR, TH, TD; sin THead ni TBody ni Scope | Igual que Chrome |
| Lista | L, LI, Lbl, LBody | L, LI, Lbl | L |
| Identificador PDF/UA | Sí (`pdfuaid:part` 1) con la opción `ua-1`; sin ella, no | No | No |
| Fuentes | Subconjuntos TrueType embebidos | Igual | Igual |
| Dibujo | Vectorial, sin imágenes; elementos decorativos marcados como artefactos | Vectorial | Vectorial |
| Versión PDF | 1.7 | — | — |

Límites:
- Sigue sin pasar por un validador PDF/UA externo
- El CLI no es el compilador en el navegador: arranque, peso comprimido y comportamiento de `typst.ts` o `typst-wasm` siguen sin medir
- La prueba usó Arial del sistema. En el navegador no hay fuentes del sistema: hay que empaquetar fuentes con licencia abierta
- Solo español con una tabla sencilla; sin probar tablas con celdas combinadas, varias páginas ni el plano real

## Prueba: Typst dentro del navegador (2026-10-29)

Montaje: `@myriaddreamin/typst.ts` 0.7.0 con su compilador WebAssembly (`all-in-one-lite`), instalado con pnpm en una carpeta de pruebas fuera del proyecto; servidor local estático sin cabeceras COOP ni COEP, como Pages. Mismo documento que la prueba del CLI, con el SVG del plano cargado en memoria. Navegadores: el integrado de la app (Chromium 152) y Firefox 155 de Playwright.

| Medida | Resultado |
|--------|-----------|
| Compilador `.wasm` | 28.325.178 bytes; comprimido, 10.733.195 con gzip y 7.216.543 con brotli |
| Biblioteca JS (`all-in-one-lite.bundle.js`) | 211.268 bytes |
| Fuentes de prueba | Arial del sistema, 1.036.584 y 980.756 bytes; no son definitivas |
| Primer PDF, con carga del compilador y fuentes | 856 ms en Chromium y 720 ms en Firefox, en local sin red |
| PDF siguientes | 10 a 15 ms en Chromium y 15 a 21 ms en Firefox |
| Aislamiento entre orígenes y `SharedArrayBuffer` | Ninguno de los dos disponible; funciona igual sin hilos |
| Tamaño del PDF | 49.502 bytes en ambos navegadores |
| Memoria del JS | 6 MB en Chromium (no incluye la memoria de WebAssembly) |

El PDF generado en el navegador coincide con el del CLI: idioma `es`, título, marcadores, H1 y H2, figura con `/Alt`, tabla con THead, TBody y `Scope`, lista, fuentes embebidas, dibujo vectorial.

Diferencias y límites:
- El PDF no lleva marca PDF/UA-1 (sin `pdfuaid`) y falta `DisplayDocTitle`: `typst.ts` 0.7.0 no expone la opción de estándar en su API TypeScript. El código fuente de `typst.ts` en Rust tiene `pdf_standard` y `pdf_tags`, pero no está en el paquete 0.7.0; hay candidatas 0.8.0 (rc1 a rc3, de junio de 2026) sin revisar
- `typst-wasm` 1.0.0 (MIT, 42 estrellas, push de 2026-07-24) sí tiene `pdfStandards`, pero pide una configuración con Vite y módulos núcleo pasados a mano, y su documentación lo llama «muy experimental». No probado
- Se desconoce la versión de Typst que lleva el `.wasm` de `typst.ts` 0.7.0
- No medido: tiempo de descarga real desde Pages, si Pages comprime el `.wasm`, ni el comportamiento con el plano real, varias páginas o fuentes abiertas
- Sin validador PDF/UA externo

### PDF/UA-1 desde el navegador: candidatas 0.8.0 y typst-wasm (2026-10-29)

Instalados con pnpm, versiones fijadas, en carpetas de pruebas fuera del proyecto: `@myriaddreamin/typst.ts` y `@myriaddreamin/typst-ts-web-compiler` 0.8.0-rc3 (publicadas el 2026-06-29), y `typst-wasm` 1.0.0 con `@typst-wasm/fonts` 1.0.0. No se ejecutó en el navegador: la comprobación era de la API declarada.

| Paquete | ¿Se puede pedir PDF/UA-1 desde TypeScript? |
|---------|---------------------------------------------|
| typst.ts 0.7.0 | No |
| typst.ts 0.8.0-rc3 | No: sin ninguna opción de estándar ni de etiquetas en sus declaraciones; `.wasm` de 30.156.049 bytes |
| typst.ts, rama `main` (consultada por la API de GitHub) | El código Rust del compilador web tiene `pdf_standard` y `pdf_tags` (ausentes en v0.7.0 y v0.8.0-rc3), pero el contenedor TypeScript de `main` no los menciona |
| typst-wasm 1.0.0 | No: `PdfStandard` es solo `'v17' \| 'a2b' \| 'a3b'` (PDF 1.7, PDF/A-2b, PDF/A-3b); sin `ua-1`. Motor de 22.795.811 bytes |

Otros hallazgos:
- typst-wasm: su motor con hilos (worker) exige aislamiento entre orígenes (COOP `same-origin` y COEP `require-corp`) y `SharedArrayBuffer`; en Pages haría falta el service worker con cabeceras que ya usa compositio. La alternativa JSPI no lo pide pero depende de que el navegador la soporte (no comprobado en Firefox). Sus fuentes incluyen Libertinus Serif, New Computer Modern y DejaVu Sans Mono
- typst.ts, rama `main`, commit de 2026-10-29: el compilador web nunca libera la caché de `comemo`; una página que recompila crece entre 40 y 350 MB por versión del documento y falla con `RuntimeError: unreachable` tras unos 100 compilados de un documento pequeño o unos 13 de uno grande. El arreglo (`evictCache`) está solo en `main`. Importa para exportar muchos PDF en una sesión

Rutas para declarar PDF/UA-1:
- Compilar nuestro propio `.wasm` de Typst con `pdf_standards` en `ua-1`, partiendo del código de `typst.ts` en `main`
- Aceptar el PDF etiquetado sin declaración de conformidad, que ya lleva idioma, título, marcadores, tablas con cabecera y texto alternativo

## Catálogos de equipos y símbolos de fabricantes (2026-10-29)

Datos de equipos (especificaciones):

| Fuente | Qué ofrece | Licencia y estado |
|--------|------------|-------------------|
| Open Fixture Library (OpenLightingProject/open-fixture-library) | Definiciones JSON con esquema. 137 fabricantes, entre ellos ETC, Robe, Martin, Chauvet Professional, Elation, Clay Paky, American DJ y Showtec. Cada equipo lleva categorías, canales y modos, y un bloque `physical`: dimensiones (mm), peso (kg), potencia (W), conector DMX, lámpara y lúmenes, ángulos de lente. Ejemplo ETC ColorSource PAR: 203 × 310 × 240 mm, 3,77 kg, 90 W | MIT (LICENSE leído, copyright 2017 Florian y Felix Edelmann), 270 estrellas, último push 2026-10-28. Sin verificar que los datos de equipos tengan términos distintos al código. No trae iconos ni símbolos |
| GDTF Share (gdtf-share.com) | Archivo `.gdtf`: ZIP con XML, geometría 3D (glTF o 3DS) e imágenes PNG. Alojado por VPLT; especificación DIN SPEC 15800 descargable gratis. Los fabricantes suben y moderan sus archivos | Cuenta gratuita para descargar. No encontré los términos de uso; la página de condiciones no se pudo leer. GDTF está fuera del alcance |

Símbolos de fabricantes:
- ETC: símbolos de la serie Source Four dentro de la biblioteca de Vectorworks; un usuario avisa de que algunos solo actualizan datos y no la geometría
- Martin: biblioteca gratuita de símbolos Vectorworks Spotlight, para versiones de 2008 a 2012
- Stardraw (stardraw.com): biblioteca de ETC con 728 símbolos de 306 productos en vistas de bloque, pictórica, rack y planta. «All rights reserved»; donde faltan datos del fabricante usa símbolos simplificados o genéricos
- SoftSymbols (Field Template): comercial, más de 3.700 símbolos, 75 USD
- Stenciltown: conjunto gratuito de luces automatizadas para OmniGraffle; licencia sin verificar
- Wikimedia Commons: una consulta a su API no devolvió símbolos de iluminación escénica; no se revisó a mano
- Robe, Chauvet y Elation: sin resultados de símbolos propios

Lo que se desprende:
- Los símbolos reconocidos en todo el mundo para luminarias son los genéricos de RP-2 (elipsoidal, fresnel, PAR, scoop, tira, cabeza móvil). Los símbolos con forma de producto concreto viven en bibliotecas CAD propietarias de Vectorworks, Stardraw o SoftSymbols
- No encontré ningún conjunto abierto de símbolos de luces ni de iconos de audio con licencia reutilizable
- Para audio no hay estándar equivalente a RP-2 en lo hallado; USITT tiene símbolos de dibujo de sonido en Graffletopia, con licencia sin verificar
- Términos de uso de las imágenes de producto de fabricantes de audio (Shure, Sennheiser): no se encontraron; hay que mirar el kit de prensa de cada uno
- Línea de trabajo a decidir: símbolos dibujados por nosotros siguiendo la convención de RP-2 y, para especificaciones de equipo, partir de la Open Fixture Library

## Hospitalidad y contrato (2026-10-29)

Fuentes: guía de NACA (2015), guía de Stagent, plantillas de Music NSW y riders reales. Variedad de detalle; sin plantilla autoritativa.

- Camerino: número de habitaciones (camerino, oficina de producción, catering), mobiliario, temperatura, espejos, toallas, privado y con llave desde la carga hasta la descarga
- Catering: número de comidas, restricciones dietéticas, horarios, acceso a cocina si hay chef propio
- Comida tras el show y bus stock (lista aparte entregada en el bus): opcionales y negociables
- Transporte, alojamiento y transporte local
- Suministros de camerino: aseo, bebidas, aperitivos; bebidas frías
- Compensación en efectivo en lugar de suministros, con un corredor sin coste para el artista (ejemplo real de 300 USD)

## Hoja del día (day sheet) y avance (2026-10-29)

- Hitos: carga (load-in), prueba de sonido, comida, puertas, teloneros, cambio de escenario, show, descarga, toque de queda (curfew) y fin de camerino
- Ancla de la planificación: carga y toque de queda, con las puertas de pivote; el calendario se construye hacia atrás desde el toque de queda
- La prueba de sonido termina antes de las puertas; con varios artistas, se hace en orden inverso a su actuación
- Regla práctica citada: añadir un 50 % al tiempo previsto de carga
- El avance (advance) cubre: hora y duración del show, toque de queda, carga, equipo de cabina y enlaces, plazo de lista de invitados, viaje y hotel, teléfono de contacto en sala y pago
- Pendiente de fuente: aparcamiento y plantillas concretas de day sheet

## Estándares de símbolos: cierre (2026-10-29)

- RP-2 sigue sin fuente oficial hallada de permiso de reproducción; ESTA publica estándares en tsp.esta.org y los vende en la tienda de ANSI, pero la búsqueda no mostró que RP-2 esté entre ellos
- ISO: no hay norma para símbolos de luces de escenario. DIN 15560-6 (símbolos gráficos de luminarias de estudio y escenario en planos de iluminación) figura como retirada. ISO 10284 es de cine; ISO 14617 es de diagramas en general
- Decisión práctica: RP-2 como guía de forma y notación, símbolos dibujados por nosotros

## Prueba: PDF etiquetado desde Chrome (2026-10-29)

Montaje: HTML con `lang`, `<title>`, h1/h2, SVG con `role="img"`, `<title>` y `<desc>`, tabla con `<th scope>` y `<caption>`, lista. Playwright 1.63 con Chrome 156 en Windows, `page.pdf({ tagged: true, outline: true })`. Inspección con pypdf.

| Comprobación | Resultado |
|--------------|-----------|
| `/Lang` y `/MarkInfo` | Sí (`es`, Marked) |
| Título del documento y `DisplayDocTitle` | Sí |
| Marcadores (outline) | Sí |
| Árbol de estructura | Document, H1, H2, Figure, Caption, Table (TR, TH, TD), L, LI, Lbl |
| Texto alternativo de la figura | Sí: `/Alt` toma el `<title>` y el `<desc>` del SVG |
| Fuentes | Subconjuntos TrueType embebidos (Arial) |
| Dibujo | Vectorial: sin imágenes, 267 operadores de trazado; el texto del SVG se extrae como texto |
| Sin etiquetar (`tagged: false`) | Sin `/Lang`, `/MarkInfo` ni árbol, y sin marcadores |

Mismo HTML impreso con Firefox (`--version` 158.0.1, BiDi informa 159.0) por `browsingContext.print` de WebDriver BiDi, en headless:

| Comprobación | Chrome | Firefox |
|--------------|--------|---------|
| `/MarkInfo` y árbol de estructura | Sí | Sí: H1, H2, Figure, Caption, Table (TH, TD), L |
| Texto alternativo de la figura | Sí | Sí: `/Alt` con `<title>` y `<desc>` |
| Título y marcadores | Sí | Sí |
| `/Lang` | Sí (`es`) | No, aunque el HTML lleva `lang="es"` |
| Fuentes | Subconjuntos embebidos | Subconjuntos embebidos |
| Dibujo | Vectorial | Vectorial, sin imágenes |

Falta de `/Lang` en Firefox: un lector de pantalla no sabría en qué idioma leer el PDF.

Lo que dicen las fuentes sobre el diálogo de impresión:
- Chrome genera PDF etiquetado desde «Guardar como PDF» desde la versión 85 (2020); también en headless con `--print-to-pdf` y `--export-tagged-pdf`. Una fuente advierte de que no garantiza PDF/UA: depende del HTML de origen
- Firefox genera PDF etiquetado desde su motor de accesibilidad y Skia SkPDF; el trabajo se resolvió para Firefox 150 (error 1657973). Está detrás de la preferencia `accessibility.tagged_pdf_output.enabled`, y la documentación no dice su valor por defecto ni si «Guardar como PDF» difiere de otros destinos. La documentación no menciona `/Lang`. En mi prueba con Firefox 159 la salida llevaba etiquetas

Límites de la prueba:
- Solo validación estructural con pypdf. No se ha pasado un validador PDF/UA (veraPDF no está instalado)
- Tablas sin THead/TBody y sin atributo Scope en el árbol
- `page.pdf` de Playwright y `browsingContext.print` de BiDi no existen para el usuario final. [PENDIENTE: comprobar que el diálogo «Guardar como PDF» de Chrome y el de Firefox producen el mismo PDF que estas llamadas]
- [PENDIENTE: ¿cómo se añade `/Lang` al PDF de Firefox? Opciones por evaluar: retocar el PDF tras generarlo, o generar el PDF propio en lugar de imprimir]
- Solo español e inglés con Arial; sin probar otros alfabetos ni fuentes propias

## Pendiente

- [PENDIENTE: columnas exactas del CSV de Yamaha CL/QL; se obtienen exportando un CSV desde CL/QL Editor y mirando la cabecera]
- [PENDIENTE: permiso de ESTA para reproducir RP-2]
- [PENDIENTE: estándar ISO equivalente a RP-2; dos búsquedas sin resultado]
