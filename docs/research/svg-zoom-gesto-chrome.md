# Detalle simple durante el gesto de zoom (Chrome)

Medido el 2026-11-05 con la máquina libre. Cierra la idea abierta de `svg-chrome-memoria.md`: en Chrome el zoom del plano completo rendía 18 fps con 1000 elementos.

## Método

- Mismo banco (`scaena-lab\svg-perf`) y mismo runner (`run-chrome.mjs`), Chrome 156.0.8078.80 sin ventana y con `--mute-audio`, viewport 1280x800. Una medida por celda.
- Variante nueva `lod=5`: además de la regla de `lod=4` (símbolo de 2 nodos y sin etiqueta bajo 30 px), todos los elementos se dibujan simples y sin etiqueta mientras dura el gesto (`view.s` falso) y vuelven al símbolo completo al asentar (`view.s` verdadero).
- Se compara con las dos configuraciones de mejor zoom de la tanda anterior: `<use>` + capas + detalle dinámico, y `<use>` + recorte + detalle dinámico.
- Datos crudos: `results/chrome-gesto.jsonl` en el banco.

## Resultados

fps de zoom y milisegundos en asentar la vista final nítida:

| n | `<use>` + capas + detalle dinámico | `<use>` + recorte + detalle dinámico | Capas + detalle en gesto | Recorte + detalle en gesto |
|---|---|---|---|---|
| 300 | 26 fps · 103 ms | 26 fps · 186 ms | 57 fps · 35 ms | 57 fps · 35 ms |
| 1000 | 18 fps · 190 ms | 19 fps · 114 ms | 57 fps · 36 ms | 57 fps · 35 ms |
| 3000 | 11 fps · 160 ms | 15 fps · 106 ms | 56 fps · 35 ms | 50 fps · 141 ms |

El arrastre y el arrastre de 100 elementos se mantienen en unos 57 fps en todas las celdas. Memoria JS igual que antes (16 a 19 MB con 3000).

## Lectura

- Bajar el detalle mientras dura el gesto resuelve el zoom en Chrome: con 1000 elementos pasa de 18 a 57 fps y con 3000, de 11 a 56 (capas) o 50 (recorte). Se supera el umbral de 30 fps fijado en `svg-rendimiento.md` con holgura.
- Asentar la vista tarda unos 35 ms en la mayoría de los casos, por debajo de un fotograma doble. La excepción es el recorte con 3000 elementos (141 ms).
- La combinación de capas y detalle en gesto es la más estable. Es la que se adopta para el paso 5.
- El 57 es el techo del banco (la medida de arrastre da lo mismo), no una caída.

## Límites

- Una medida por celda, sin repeticiones, un solo equipo, solo Chrome en esta tanda (Firefox ya cumplía sin esto).
- Sintético: el símbolo simple es un rectángulo y un círculo, y las etiquetas son una línea de texto. Con planos reales hay que confirmar que el salto entre símbolo completo y simple al empezar y terminar el gesto no se nota.
- «Gesto» es el zoom y el desplazamiento con rueda o pinza; hay que definir en el paso 5 cuándo se considera asentado (tiempo sin eventos).
