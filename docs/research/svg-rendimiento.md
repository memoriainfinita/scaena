# Rendimiento del plano SVG con cientos de elementos

Medido el 2026-10-29 en Firefox, con la máquina libre. Sustituye al informe parcial anterior, que se midió con otra sesión compitiendo por CPU y se descartó.

## Método

- Banco: `D:\DOCS\CODELAB\4_scratch\scaena-lab\svg-perf` (Vite 7 + Preact 10 + `@preact/signals` 2, pnpm; build de producción con `vite preview`). Código en `src/main.tsx`, conductor en `run.mjs`.
- Navegador: Firefox 1543 de Playwright 1.63 (el de nona), headless, viewport 1280x800, `media.volume_scale=0`. Equipo: i5-6500 (4 núcleos), Windows 10. No es el Firefox de uso diario.
- Carga de fondo: `run.mjs` mide la carga de CPU con `wmic` antes de cada medida (campo `cpuBefore` de los `.jsonl`). Pasada completa: entre 1 % y 19 %. Repeticiones: entre 5 % y 19 %. Pasada con ventana: entre 2 % y 18 %. El Firefox del usuario estaba cerrado y el otro agente parado.
- Elementos: 12 símbolos de 5 a 30 nodos (rect, circle, ellipse, line, path, polygon; unos 15 de media), etiqueta `<text>` por elemento, 25 % con rotación, cuadrícula de líneas cada 20 unidades en un `<path>`. Disposición en rejilla con holgura, todos dentro del viewport en el zoom inicial. Nodos SVG del DOM con símbolos clonados: 1927 (100), 5540 (300), 9319 (500), 18 660 (1000), 56 362 (3000).
- Pruebas por configuración, en una página nueva:
  - Arrastre de 1 elemento (círculo de 30 unidades), con zoom de ajuste y con zoom 4x (`dragZ`).
  - Zoom y pan del plano completo (1x a 4x, oscilando).
  - Seleccionar 100 elementos (tiempo hasta pintado, `sel`) y arrastrar esos 100 (`d100`).
  - Render inicial (`init`): mediana de 5 montajes, hasta que se pinta.
- Frames: bucle `requestAnimationFrame`, 8 de calentamiento, hasta 120 frames o 3 s. Se muestra fps (1000 / media del intervalo) y p95 del intervalo en ms. 60 fps es el tope del navegador. A 3000 elementos caben 36 a 51 frames en 3 s para zoom y arrastre.
- Umbral de «cómodo» (fijado por mí): arrastre con 55 fps o más y p95 de 33 ms o menos; zoom y pan 30 fps o más; seleccionar 100 hasta pintado 100 ms o menos; arrastrar 100 a 30 fps o más; render inicial 1 s o menos.
- Repetición: 3 pasadas completas para 9 configuraciones clave con 1000 y 3000 elementos. Dispersión entre pasadas: menos de 1 fps salvo `lod-dinamico` a 3000 (arrastre 49 a 58 fps), así que el resto de las cifras de la pasada única son estables a ese nivel.
- Datos crudos: `results/clean.jsonl` (23 configuraciones x 5 tamaños), `results/reps.jsonl` (3 repeticiones), `results/headed.jsonl` (con ventana); tablas en `results/*-tablas.txt`. Tablas completas de todas las configuraciones en `results/clean-tablas.txt`.

## Qué se compara

| Técnica | Variantes |
|---|---|
| Estado | Preact simple (re-render del plano entero), Preact con `memo`, señales por elemento (transform y clase enlazados) |
| Símbolo | nodos clonados en línea, `<use>` a `<g>` en `<defs>`, `<use>` a `<symbol>` |
| Zoom | `transform` en un grupo, `viewBox` del SVG, `transform` CSS del `<svg>` (con reasentado nítido al final), transform recalculado en cada elemento |
| Capas | todo en un SVG, o elementos arrastrados pasados a un segundo `<svg>` superpuesto con `will-change: transform` (y cuadrícula en un tercero) |
| `will-change` | en el grupo de zoom, en todos los elementos, solo en el arrastrado |
| Cuadrícula | un `<path>`, `<pattern>`, sin cuadrícula |
| Recorte por viewport | solo se montan los elementos que caen en pantalla (con margen) |
| Detalle | símbolo simple de 2 nodos (con o sin etiqueta), sin etiqueta, y dinámico: símbolo simple sin etiqueta cuando el elemento mide menos de 30 px en pantalla |

Comprobado a 100 elementos que cada variante hace lo que dice (el elemento se mueve al cambiar la vista, `<use>` y símbolos se dibujan, los elementos levantados están en el `<svg>` superpuesto y no en el principal, el recorte reduce nodos de 1927 a 836, y `<symbol>` mide distinto por su viewport de 40x40).

## Números

Formato: fps / p95 en ms. Pasada completa, una medida por celda salvo donde se indica.

### Arrastre de 1 elemento (zoom de ajuste)

| Variante | 100 | 300 | 500 | 1000 | 3000 |
|---|---|---|---|---|---|
| Preact simple | 58 / 25 | 51 / 33 | 31 / 50 | 17 / 83 | 5 / 284 |
| Preact `memo` | 60 / 17 | 60 / 17 | 59 / 19 | 37 / 50 | 12 / 184 |
| Señales | 60 / 17 | 60 / 17 | 58 / 17 | 40 / 50 | 12 / 184 |
| Señales + `<use>` | 60 / 17 | 60 / 17 | 58 / 19 | 40 / 50 | 12 / 167 |
| Señales + `<use>` de `<symbol>` | 60 / 17 | 60 / 17 | 41 / 50 | 21 / 67 | 6 / 300 |
| Señales + capas | 60 / 17 | 60 / 17 | 59 / 17 | 53 / 33 | 17 / 67 |
| Señales + detalle dinámico | 60 / 17 | 60 / 17 | 60 / 17 | 60 / 17 | 59 / 17 |
| Señales + `<use>` + capas + detalle dinámico | 60 / 17 | 60 / 17 | 60 / 17 | 60 / 17 | 60 / 17 |

### Zoom y pan del plano completo

| Variante | 100 | 300 | 500 | 1000 | 3000 |
|---|---|---|---|---|---|
| Preact simple | 46 / 38 | 34 / 50 | 26 / 67 | 14 / 100 | 4 / 384 |
| Preact `memo` | 49 / 33 | 44 / 38 | 39 / 50 | 24 / 100 | 13 / 167 |
| Señales, grupo con `transform` | 50 / 33 | 44 / 41 | 39 / 50 | 24 / 100 | 14 / 150 |
| Señales + `viewBox` | 53 / 33 | 25 / 67 | 20 / 67 | 10 / 167 | 2 / 517 |
| Señales + `transform` CSS del `<svg>` | 55 / 33 | 54 / 33 | 45 / 36 | 29 / 67 | 17 / 133 |
| Señales + zoom por elemento | 59 / 22 | 50 / 33 | 40 / 50 | 25 / 83 | 10 / 133 |
| Señales + recorte por viewport | 47 / 50 | 34 / 50 | 26 / 83 | 20 / 117 | 7 / 350 |
| Señales + detalle dinámico | 52 / 33 | 42 / 50 | 35 / 55 | 28 / 67 | 17 / 83 |
| Señales + `<use>` + capas + detalle dinámico | sin medir | sin medir | sin medir | 30 / 67 | 20 / 67 |
| Lo anterior + `transform` CSS | sin medir | sin medir | sin medir | 32 / 50 | 23 / 50 |

Las dos últimas filas son la mediana de 3 repeticiones; el resto es pasada única.

### Seleccionar 100 hasta pintado (ms) y arrastrar esos 100 (fps / p95)

| Variante | sel 1000 | sel 3000 | arrastrar 100: 300 | 500 | 1000 | 3000 |
|---|---|---|---|---|---|---|
| Preact simple | 101 | 315 | 25 / 50 | 16 / 67 | 9 / 117 | 3 / 367 |
| Señales | 72 | 193 | 35 / 33 | 23 / 50 | 12 / 83 | 4 / 234 |
| Señales + capas | 68 | 192 | 60 / 17 | 58 / 17 | 37 / 33 | 13 / 83 |
| Señales + detalle dinámico | 18 | 43 | 60 / 17 | 60 / 17 | 60 / 19 | 26 / 50 |
| Señales + `<use>` + capas + detalle dinámico (3 rep.) | 28 | 36 | 60 / 17 | 60 / 17 | 60 / 17 | 58 / 17 |

### Render inicial (ms, mediana)

| Variante | 100 | 300 | 500 | 1000 | 3000 |
|---|---|---|---|---|---|
| Señales, nodos clonados | 57 | 115 | 193 | 354 | 1112 |
| Señales + `<use>` de `<g>` | 64 | 100 | 138 | 294 | 847 |
| Señales + detalle dinámico | 48 | 36 | 40 | 77 | 211 |

El primer montaje en frío cuesta lo mismo que la mediana (1101 ms a 3000 con clonados, 852 ms con `<use>`).

### Arrastre con zoom 4x

Todas las variantes con señales dan 59 a 60 fps desde 100 hasta 3000 elementos, también sin recorte propio. Preact simple da 58 / 59 / 44 / 25 / 8 fps de 100 a 3000. Firefox no pinta lo que queda fuera de pantalla.

### Repeticiones (mediana de 3, 3000 elementos)

| Variante | Arrastre | Zoom | Seleccionar 100 | Arrastrar 100 | Inicial |
|---|---|---|---|---|---|
| Preact simple | 5 fps | 4 fps | 311 ms | 3 fps | 1094 ms |
| Señales | 12 fps | 13 fps | 204 ms | 4 fps | 1087 ms |
| Señales + capas | 17 fps | 13 fps | 194 ms | 13 fps | 1105 ms |
| Señales + `transform` CSS | 12 fps | 17 fps | 192 ms | 4 fps | 1144 ms |
| Señales + recorte | 12 fps | 7 fps | 196 ms | 4 fps | 1126 ms |
| Señales + detalle dinámico | 54 fps | 16 fps | 40 ms | 25 fps | 214 ms |
| Señales + `<use>` + capas + detalle dinámico | 60 fps | 20 fps | 36 ms | 58 fps | 212 ms |

### Con ventana (una pasada, mismas pruebas)

Igual que headless dentro de la dispersión: señales a 1000, 36 fps de arrastre y 20 de zoom; a 3000, 12 y 9. La combinación final (`<use>` + capas + detalle dinámico) a 3000: 60 fps de arrastre, 15 de zoom, 53 fps arrastrando 100.

## Lo que se aprende

- Estado: con Preact simple el coste es JS (en la medida con contaminación, 340 ms por frame a 3000); con `memo` o con señales desaparece y queda el pintado de Firefox. `memo` y señales son equivalentes en estas pruebas (37 frente a 40 fps de arrastre a 1000; 12 frente a 12 a 3000).
- Mover un elemento cuesta lo que pinta Firefox del SVG entero, no el JS. Crece con los nodos visibles: 1 elemento arrastrado da 60 fps a 500 elementos (9300 nodos), 40 a 1000 y 12 a 3000.
- `viewBox` para el zoom es lo peor (10 fps a 1000, 2 fps a 3000). `transform` de un grupo es la base. El `transform` CSS del contenedor mejora el zoom un 20 % (29 frente a 24 fps a 1000; 17 frente a 14 a 3000), pero deja un reasentado nítido al final: 180 a 210 ms a 1000 y 480 ms a 3000, frente a 50 y 320 ms sin él.
- Zoom por elemento: sin ventaja (10 frente a 14 fps a 3000).
- `<use>` de un `<g>`: el arrastre no cambia, el DOM baja de 56 362 a 9206 nodos y el render inicial un 20 a 25 % (847 frente a 1112 ms a 3000). `<use>` de `<symbol>` es peor (6 frente a 12 fps de arrastre a 3000).
- `will-change`: sin efecto en el grupo ni en todos los elementos; en solo el elemento arrastrado empeora a 1000 (33 frente a 40 fps).
- Capas separadas (elementos arrastrados en un segundo `<svg>` con `will-change`): es lo que más ayuda al mover una selección: 100 elementos a 1000 pasan de 12 a 37 fps, a 500 de 23 a 58. Arrastrar 1 elemento mejora algo (40 a 53 a 1000; 12 a 17 a 3000).
- Cuadrícula: `<pattern>` o sin cuadrícula no cambia el arrastre; sin cuadrícula el zoom mejora algo a 100 a 500 (59 frente a 50 fps a 100; 47 frente a 39 a 500) y nada a 3000.
- Recorte por viewport propio: no ayuda en arrastre (Firefox ya no pinta lo que está fuera) y empeora el zoom (7 frente a 13 fps a 3000) por montar y desmontar nodos cada frame.
- Detalle: es la técnica con más efecto. Un símbolo simple sin etiqueta cuando el elemento mide menos de 30 px baja los nodos a 12 003 a 3000 y da 54 a 59 fps de arrastre y 25 fps arrastrando 100. Quitar solo las etiquetas apenas cambia nada (14 frente a 12 fps de arrastre a 3000): lo caro son los nodos del símbolo, no el texto. El coste del detalle dinámico es el zoom: al cruzar el umbral se redibujan todos los elementos (p95 de 80 ms a 3000).

## Conclusión

Sobre el plano de prueba (símbolos de unos 15 nodos con etiqueta, todos a la vista, disposición uniforme), en este equipo y con el umbral de arriba:

| Configuración | Techo cómodo (todas las pruebas) | Qué falla por encima |
|---|---|---|
| Preact simple | 100 elementos (300 en un arrastre suelto) | arrastrar 100 baja de 30 fps desde 300 |
| Señales o `memo`, nodos clonados | 300 a 500 | a 500 arrastrar 100 da 23 fps; a 1000 el arrastre da 40 fps con p95 de 50 ms y el zoom 24 fps |
| Señales + `<use>` + capas | unos 500 | a 1000 el zoom da 24 fps; a 3000 el arrastre da 12 a 17 fps |
| Señales + `<use>` + capas + detalle dinámico | 1000 sin reservas; 3000 aceptable | a 3000 el zoom da 20 a 23 fps y el reasentado 60 a 80 ms; el resto cumple (arrastre 60 fps, 100 elementos 58 fps, selección 36 ms, inicial 212 ms) |

- El techo cómodo real sin técnicas especiales está en 300 a 500 elementos; con la combinación final sube a unos 1000, y 3000 es utilizable con el zoom algo por debajo de 30 fps.
- Con detalle dinámico, el número de elementos en detalle completo en pantalla queda limitado por el tamaño de la pantalla (unos 280 elementos de 30 px o más en el plano de prueba): esa es la razón del salto. [Inferido, no medido: en un plano denso, con muchos elementos agrupados y a más de 30 px, el detalle dinámico no ayudaría.]

## Recomendación

1. Estado con señales por elemento (o `memo`; equivalentes en lo medido). No renderizar el plano entero por cada movimiento.
2. Símbolos con `<use>` a un `<g>` en `<defs>` (no a `<symbol>`).
3. Zoom y pan con `transform` en un grupo; no `viewBox`. El `transform` CSS del contenedor suma un 20 % de zoom a cambio de un reasentado de hasta unos 500 ms a 3000: opcional.
4. Al arrastrar o mover una selección, pasar esos elementos a un `<svg>` superpuesto con `will-change: transform`; es la mejora más grande para seleccionar y mover varios.
5. Nivel de detalle por zoom: bajo unos 30 px en pantalla dibujar un símbolo simplificado (2 nodos) sin etiqueta. Es lo que permite pasar de 500 a 3000 elementos. Sin medir: umbral óptimo y suavizado del cambio para que el zoom no tenga el salto de 60 a 80 ms.
6. No usar: `viewBox` para zoom, recorte por viewport propio, `will-change` en los elementos, ni `<symbol>`.
7. El PDF no depende de nada de esto: sigue usando la misma función de dibujo con el detalle completo y sin capas.

## Sin verificar

- Memoria: no medida.
- Firefox de uso diario (versión y GPU): se midió el Firefox de Playwright; con ventana salió igual que headless, pero es la misma build.
- Chrome y Safari: sin medir.
- Planos densos (elementos agrupados o solapados) y símbolos más complejos que 30 nodos: sin medir; el plano de prueba es una rejilla uniforme.
- Umbral de detalle distinto de 30 px, y detalle dinámico con más de dos niveles: sin medir.
- Texto con fuentes reales empaquetadas (se usó la fuente serif por defecto), sombras o filtros SVG, degradados, imágenes de fondo: sin medir.
- Interacción real (arrastre con ratón o tacto, hit-testing, eventos): se movió el elemento por código, no con eventos de puntero.
- Tiempo de exportar el plano al PDF con Typst: no es parte de esta medida.
- Impacto de `will-change` en uso de memoria de GPU: sin medir.

## Qué se hizo en la máquina

- Carpeta nueva `D:\DOCS\CODELAB\4_scratch\scaena-lab\svg-perf` (con `pnpm-workspace.yaml` que permite el postinstall de esbuild). Sin git ni commits. Fuera de ahí solo este informe.
- Firefox de Playwright silenciado con `media.volume_scale=0`; el banco no reproduce audio. La pasada con ventana abrió ventanas visibles durante unos minutos.
- Procesos propios (`vite preview` en el puerto 4173, `run.mjs` y sus Firefox) terminados al acabar; puerto 4173 libre.
