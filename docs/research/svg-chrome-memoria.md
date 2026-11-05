# Plano SVG en Chrome y memoria

Medido el 2026-11-05 con la máquina libre (CPU antes de cada medida entre 2 % y 19 %, sin Firefox ni Chrome del usuario abiertos). Complementa `svg-rendimiento.md` (Firefox, 2026-10-29).

## Método

- Mismo banco: `D:\DOCS\CODELAB\4_scratch\scaena-lab\svg-perf` (Vite 7, Preact 10, `@preact/signals` 2), build de producción servido desde el propio script. Conductor nuevo: `run-chrome.mjs`.
- Navegador: Chrome 156.0.8078.80 instalado, lanzado con Playwright 1.63 (el de nona), `--mute-audio`, viewport 1280x800. Una pasada sin ventana y otra con ventana visible (1000 y 3000 elementos). Equipo: i5-6500, Windows 10.
- Cuatro configuraciones: Preact `memo`; señales con `<use>`; combinación de `<use>`, capas y detalle dinámico; señales con `<use>`, recorte por viewport y detalle dinámico. Tamaños: 300, 1000 y 3000 elementos. Una medida por celda, sin repeticiones.
- Memoria: `JSHeapUsedSize` y nodos del DOM por CDP tras forzar recolección de basura, antes y después de las pruebas; y suma del conjunto de trabajo (`WorkingSet64`) de los procesos de Chrome menos su valor antes de cargar la página. La segunda cifra es ruidosa: incluye procesos auxiliares.
- Datos crudos: `results/chrome.jsonl` (sin ventana) y `results/chrome-headed.jsonl` (con ventana), en el directorio del banco.

## Números

Formato: fps de arrastre / fps de zoom / fps de arrastrar 100 / render inicial en ms. Firefox, de `svg-rendimiento.md` (no hay Firefox para la combinación con capas).

| n | Configuración | Firefox | Chrome sin ventana |
|---|---|---|---|
| 300 | Preact `memo` | 60 / 44 / 29 / 98 | 60 / 23 / 20 / 91 |
| 300 | señales + `<use>` | 60 / 44 / 35 / 100 | 60 / 23 / 20 / 57 |
| 300 | `<use>` + capas + detalle | sin dato | 60 / 26 / 60 / 32 |
| 300 | `<use>` + recorte + detalle | 60 / 38 / 60 / 49 | 60 / 26 / 60 / 16 |
| 1000 | Preact `memo` | 37 / 24 / 11 / 344 | 60 / 8 / 18 / 205 |
| 1000 | señales + `<use>` | 40 / 24 / 12 / 294 | 60 / 8 / 19 / 168 |
| 1000 | `<use>` + capas + detalle | sin dato | 60 / 18 / 60 / 44 |
| 1000 | `<use>` + recorte + detalle | 60 / 35 / 60 / 80 | 60 / 18 / 60 / 52 |
| 3000 | Preact `memo` | 12 / 13 / 4 / 1039 | 20 / 1,3 / 14 / 623 |
| 3000 | señales + `<use>` | 12 / 13 / 4 / 847 | 20 / 1,3 / 15 / 503 |
| 3000 | `<use>` + capas + detalle | sin dato | 60 / 13 / 60 / 140 |
| 3000 | `<use>` + recorte + detalle | 58 / 26 / 25 / 226 | 60 / 21 / 58 / 134 |

Con ventana (1000 y 3000): arrastre y zoom iguales a la pasada sin ventana, salvo arrastre con 1000 en las dos primeras configuraciones (48 a 50 fps) y con 3000 (14 a 15 fps). No es un artefacto de la falta de GPU en modo sin ventana.

Memoria tras todas las pruebas (JS heap / nodos): 300 elementos, 3 a 4 MB; 1000, 5 a 7 MB; 3000, 12 a 17 MB. Conjunto de trabajo añadido: entre 78 y 312 MB, menor con las configuraciones de capas y detalle (unos 130 MB con 3000) que con las simples (280 a 310 MB).

## Lectura

- El arrastre y el render inicial van mejor en Chrome que en Firefox.
- El zoom y el desplazamiento del plano completo van peor en Chrome: con 300 elementos, 23 a 26 fps (Firefox, 38 a 44); con 1000, 8 fps sin técnicas y 18 con detalle dinámico (Firefox, 24 y 35); con 3000, 1,3 fps sin técnicas y 21 como mejor caso (Firefox, 13 y 26).
- Con el umbral de «cómodo» fijado en `svg-rendimiento.md` (zoom y pan de 30 fps o más), Chrome no lo alcanza ni con 300 elementos. A 1000 elementos con las técnicas, el zoom se queda en 18 fps. Lo aceptado para Firefox («1000 sin reservas, 3000 aceptable») no vale tal cual en Chrome para el zoom; sí para el arrastre.
- Las técnicas elegidas siguen siendo las correctas en Chrome: sin ellas, 3000 elementos son inusables (zoom de 1,3 fps).
- El heap de JavaScript no es un problema (17 MB con 3000).

## Límites

- Una medida por celda, sin repeticiones, y un solo equipo.
- No se probaron otras técnicas de zoom en Chrome (por ejemplo, reducir más el detalle mientras dura el gesto, o dejar de pintar las etiquetas). Son hipótesis para el plan por pasos, no resultados.
- Sin medir: planos más densos que los sintéticos, Safari y navegadores móviles.
- La suma del conjunto de trabajo mezcla procesos de Chrome; usar solo como orden de magnitud.
