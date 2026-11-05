# Rendimiento del plano en la aplicación (2026-11-05)

Medido con `scripts/perf.mjs` sobre la compilación de producción servida con `vite preview`, de una en una, con las ventanas silenciadas (Firefox 155 con volumen 0 y Chrome estable con `--mute-audio`), ventana de 1440 × 860, la máquina sin otra carga. Sustituye al informe de `svg-zoom-gesto-chrome.md` para lo que importa a la aplicación terminada: aquel medía bancos de pruebas, este mide la aplicación.

## Método

- Se genera un `.scaena` con N elementos (diez tipos repetidos, rotados, con etiqueta uno de cada tres) sobre un escenario de 60 × 40 m, se abre por la pantalla de inicio y se espera al primer dibujo.
- **Zoom:** 90 eventos de rueda, uno por fotograma, 45 acercando y 45 alejando alrededor del centro del plano.
- **Arrastre:** pulsar un elemento y moverlo en 60 pasos, uno por fotograma, con los eventos de puntero que envía el ratón.
- Se cuentan fotogramas con `requestAnimationFrame` (se descartan los dos primeros): fps, mediana y percentil 95 del tiempo de fotograma.
- Las cifras de Chrome incluyen la memoria JS tras la prueba (Firefox no la ofrece).

## Resultados finales

fps medios (mediana del fotograma en milisegundos entre paréntesis):

| Elementos | Firefox zoom | Firefox arrastre | Chrome zoom | Chrome arrastre | Apertura Firefox | Apertura Chrome | Memoria JS Chrome |
|---|---|---|---|---|---|---|---|
| 30 | 56 (16,6) | 61 | 56 (17,6) | 57 | 296 ms | 140 ms | 7 MB |
| 100 | 52 (16,6) | 59 | 57 (17,5) | 57 | 386 ms | 169 ms | 6 MB |
| 200 | 61 (16,6) | 60 | 56 (17,6) | 57 | 400 ms | 191 ms | 8 MB |
| 300 | 57 (16,6) | 57 | 56 (17,6) | 53 | 411 ms | 220 ms | 7 MB |
| 1.000 | 54 (16,6) | 23 (33,2) | 38 (17,9) | 39 (17,6) | 1,1 s | 452 ms | 12 MB |
| 3.000 | 35 (16,7) | 17 (49,5) | 11 (70,1) | 13 (52,3) | 1,7 s | 1,4 s | 18 MB |

Un rider real tiene entre 15 y 150 elementos: ahí los dos navegadores van a 60 fotogramas por segundo. Un plano de luces grande de 500 a 1.000 instrumentos se mueve con fluidez en el zoom (36 a 54 fps) y con más esfuerzo en el arrastre en Firefox (23 fps). A 3.000 elementos, que no es un caso de rider, se puede trabajar pero con tirones (11 a 35 fps según el navegador y la operación).

## Qué se encontró y se cambió

1. **`vector-effect: non-scaling-stroke` es el gran coste en Firefox.** Es lo que hace que las líneas de los símbolos tengan 1,5 px aunque se haga zoom. Con 200 elementos y trazo que no escala, el zoom iba a 19 fps; con 3.000, a 1 fps (845 ms por fotograma). El detalle simple del paso 5 también lo usaba en su caja y no ayudaba. Las cajas simples ahora son un relleno gris sin trazo.
2. **El cambio de detalle ya no vuelve a pintar nada.** Antes cada elemento leía la señal del gesto y se renderizaba de nuevo al empezar y al acabar (2.700 componentes). Ahora cada elemento lleva siempre sus dos dibujos (el detallado y la caja) y una clase `gesture` en el SVG decide cuál se ve: un solo cambio de estilo. Con 3.000 elementos pasó de 845 a 244 ms por fotograma, y con las cajas sin trazo, a 33.
3. **Solo en planos grandes.** El cambio de detalle se aplica a partir de 150 elementos dibujados (`LOD_MIN`); por debajo se ve siempre el detalle completo, que va a 60 fps. Se midió: con 100 elementos el zoom va a 57 fps con todo el detalle; con 200, sin el cambio, a 19 fps en Firefox.
4. **También al arrastrar** en planos grandes (con el elemento arrastrado conservando su detalle). Con 3.000 elementos el arrastre pasó de 6 a 17 fps en Firefox.
5. **Cajas de selección ocultas durante el gesto** (`.hit`): en Firefox, con 3.000 elementos, el zoom pasó de 22 a 35 fps.

## Lo que no se resolvió

- Con 1.000 elementos el arrastre en Firefox queda en 23 fps y a 3.000, en 17 (Firefox) y 13 (Chrome): lo que cuesta es repintar todo el SVG por cada movimiento. La técnica de la capa aparte del informe anterior no se pudo aplicar con ganancia porque el elemento arrastrado ya va en su propio grupo; haría falta rasterizar la capa quieta mientras se arrastra, que no se ha intentado.
- El zoom de Chrome a 3.000 elementos (11 fps) es muy inferior al de aquel banco (56 fps), que usaba figuras planas sin la estructura de grupos anidados de cada elemento. No se ha aplanado el dibujo.
- No se ha medido en un móvil ni con un montaje de verdad grande.

## Peso de la aplicación

Compilación de producción (`pnpm build`), sin contar el compilador de Typst:

| Pieza | Sin comprimir | Comprimido | Cuándo se usa |
|---|---|---|---|
| JS de la aplicación | 324 KB | 102 KB | siempre |
| CSS | 23 KB | 5 KB | siempre |
| pdf-lib | 420 KB | 176 KB | al hacer el primer PDF (carga diferida; antes iba en el JS principal, que pesaba 744 KB) |
| pdf.js (módulo y worker) | 428 KB y 1,26 MB | 129 KB y unos 300 KB | al importar un fondo y para la vista previa del documento |
| Fuentes de pantalla (woff2) | unos 0,5 MB | | las del idioma en uso |
| Fuentes del PDF (TTF) | 0,78 MB | | al compilar el primer PDF |
| Compilador de Typst | 28,3 MB | 10,9 MB | al compilar el primer PDF; el service worker lo guarda en el primer uso y no al instalar |

La instalación precachea todo menos Typst (unos 2,8 MB en disco, menos de 1 MB por la red), de modo que importar un fondo o hacer la vista previa funcionan sin conexión desde el principio; el primer PDF necesita red una vez para bajar el compilador.
