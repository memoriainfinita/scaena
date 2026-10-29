# Rendimiento del plano SVG con cientos de elementos

Medido el 2026-10-29. Resultado parcial: la batería completa no terminó. Lo no medido está marcado «sin verificar».

## Método

- Banco: `D:\DOCS\CODELAB\4_scratch\scaena-lab\svg-perf` (Vite + Preact 10 + `@preact/signals`, pnpm, build de producción servida con `vite preview`). Código en `src/main.tsx`, conductor en `run.mjs`.
- Navegador: Firefox 1543 de Playwright 1.63 (el de nona), headless, viewport 1280x800, `media.volume_scale=0`. Es el Firefox parcheado de Playwright, no el Firefox de uso diario. Equipo: i5-6500 (4 núcleos), Windows 10.
- Elementos: 12 símbolos con 5 a 30 nodos (rect, circle, ellipse, line, path, polygon), de media unos 15 nodos; etiqueta `<text>` por elemento; 25 % con rotación; cuadrícula de líneas cada 20 unidades en un solo `<path>`. Todos los elementos dentro del viewport en el zoom inicial (peor caso, sin recorte). Con 3000 elementos el DOM tiene 56 362 nodos SVG.
- Frames: bucle `requestAnimationFrame`, 8 frames de calentamiento, hasta 120 frames o 3 s. «fps» = 1000 / media del intervalo entre frames; «med» y «p95» son del intervalo. Con 3000 elementos solo caben 4 a 25 frames en 3 s.
- `jsMs`: tiempo de JS hasta que Preact termina de renderizar (microtarea). El resto del intervalo es estilo, layout y pintado, que no se puede separar con esta técnica.
- Pruebas: arrastre de 1 elemento (círculo de 30 unidades), zoom y pan del plano completo (zoom 1x a 4x), arrastre con zoom 4x, selección de 100 (tiempo hasta pintado) y arrastre de los 100 seleccionados, render inicial (mediana de 5 montajes; el primero, frío, aparte).
- Umbral de «cómodo» que se aplica aquí (fijado por mí, no por el usuario): arrastre con mediana de 17 ms y p95 de 33 ms o menos; zoom/pan 30 fps o más; selección de 100 hasta pintado 100 ms o menos; render inicial 1 s o menos.

## Contaminación de las medidas

- Otra sesión ejecutaba a la vez bancos de Typst (`node bench/run.mjs firefox|chrome ...`, `bench/sizes.mjs`) con Firefox y Chrome, además del Firefox y otras aplicaciones del usuario. La carga de CPU medida con `wmic` estuvo entre 55 % y 97 % mientras esperaba, y no logré una ventana por debajo de 20 %.
- Todas las cifras de abajo se midieron sin control de carga: están contaminadas en una cantidad desconocida. La carga en el momento de las pruebas con 1000 y 3000 elementos no se registró.
- Ejemplo del ruido: con la página en reposo (300 elementos, nada cambiando) salieron 49 y 58 fps, con 10 % y 27 % de frames lentos.
- Conclusión práctica: los órdenes de magnitud (3000 elementos inutilizable, 1000 incómodo) son sólidos; las diferencias de menos de ±30 % entre variantes con 100 elementos no lo son.
- Se descartó una tanda completa que se colgó en la variante 7 (`viewBox`) por la misma contaminación: `results/aborted-contaminated.jsonl`.

## Números

### Preact simple frente a señales (1 elemento arrastrado, zoom, selección de 100; 3000 elementos, headless)

| Variante | Arrastre 1 | Zoom/pan | Seleccionar 100 hasta pintado | Arrastrar 100 | Render inicial (mediana) |
|---|---|---|---|---|---|
| Preact simple | 1,65 fps (med 505 ms, JS 340 ms) | 1,24 fps (med 870 ms, JS 411 ms) | 646 ms | 1,78 fps | 2263 ms (frío 1911) |
| Señales por elemento | 8,14 fps (med 117 ms, p95 184 ms, JS 0,2 ms) | 3,94 fps (med 209 ms) | 312 ms (JS 5 ms) | 2,85 fps (med 317 ms) | 1600 ms (frío 1874) |

Con señales el coste de JS desaparece (0,2 ms); lo que queda es pintado de Firefox.

### Señales, 1000 elementos (headless y con ventana)

| Modo | Arrastre 1 | Zoom/pan | Arrastrar 100 | Render inicial |
|---|---|---|---|---|
| headless | 23,8 fps | 18,0 fps | 8,2 fps | 519 ms |
| con ventana | 29,8 fps | 15,8 fps | 8,8 fps | 415 ms |

Con ventana (WebRender normal) es similar a headless, hasta un 25 % mejor en arrastre.

### 100 elementos (carga alta de CPU externa)

| Variante | Arrastre 1 fps | Zoom/pan fps | Zoom: asentar al final | Arrastre con zoom 4x fps | Selección 100 hasta pintado | Arrastrar 100 fps | Inicial |
|---|---|---|---|---|---|---|---|
| Preact simple | 56,6 | 32,7 | 49 ms | 49,4 | 46 ms | 26,5 | 60 ms |
| Preact + memo | 55,8 | 38,4 | 39 ms | 58,5 | 32 ms | 19,2 | 59 ms |
| Señales | 43,2 | 32,3 | 49 ms | 50,7 | 30 ms | 24,6 | 100 ms |
| Señales + `<use>` de `<g>` en defs | 42,1 | 45,2 | 38 ms | 59,9 | 19 ms | 43,3 | 93 ms |
| Señales + `<use>` de `<symbol>` | 51,8 | 35,4 | 34 ms | 59,9 | 26 ms | 36,1 | 75 ms |
| Preact + `<use>` | 59,9 | 40,9 | 33 ms | 55,3 | 21 ms | 27,9 | 47 ms |
| Señales + zoom por `viewBox` | 59,2 | 23,0 (med 33 ms, p95 117 ms) | 258 ms | 49,1 | 36 ms | 22,3 | 51 ms |

A 100 elementos las diferencias están dentro del ruido salvo dos: `<use>` mejora el arrastre de 100 seleccionados (43 y 36 fps frente a 25 y 27) y el zoom por `viewBox` es peor que el grupo con `transform` (23 frente a 32 fps, con asentamiento de 258 ms).

### Pruebas puntuales con 3000 elementos

- Arrastre con zoom 4x (solo ~1/16 de los elementos visibles): sin medir con 3000. Con 100, sin diferencia respecto al zoom 1x.

## Sin verificar (no se llegaron a medir)

- 300 elementos en cualquier variante (solo un par de lecturas en reposo).
- Variantes de `will-change` (grupo, elementos, arrastre), `capas` (cuadrícula y arrastre en SVG separados), zoom por transformación CSS del contenedor, zoom por elemento, cuadrícula con `pattern` o sin ella, y simplificación del símbolo o quitar etiquetas (`lod=1..3`). Están implementadas en el banco (`run.mjs`, nombres de configuración) y no tienen número válido.
- `<use>` y nodos clonados a 1000 y 3000 elementos.
- Que cada variante aplica realmente su efecto (comprobación de que el transform o `<use>` cambia lo dibujado): el banco muestra símbolos visibles en señales y capas con captura, y no en el resto.
- Firefox de uso diario (versión de usuario), GPU real, memoria, Chrome, recorte por viewport hecho por la aplicación, cambio dinámico de nivel de detalle, ruta PDF.
- Repeticiones: cada cifra es una sola pasada.

## Conclusión

- Con el SVG tal como está planteado (símbolos de ~15 nodos con etiqueta, todos visibles), 3000 elementos son inutilizables en este equipo con Firefox: 1 a 8 fps al arrastrar, 1 a 4 fps al hacer zoom, 1,6 a 2,3 s de render inicial.
- 1000 elementos (~19 000 nodos) quedan por debajo del umbral cómodo: unos 24 a 30 fps al arrastrar, 16 a 18 al hacer zoom, 8 al mover 100 a la vez. Medido con carga externa.
- 100 elementos están cerca de cómodos (45 a 60 fps en arrastre y zoom, selección de 100 en 20 a 46 ms) incluso con la CPU ocupada por otros procesos. El techo cómodo está entre 100 y 1000 elementos, probablemente en 300 a 500: sin medir, no se puede afinar más.
- El estado reactivo cambia mucho: con Preact sin memo y 3000 elementos el JS ocupa 340 a 410 ms por frame; con señales por elemento es 0,2 ms. Por encima de unos cientos de elementos, el cuello de botella pasa a ser el pintado de Firefox, que crece con el número de nodos visibles.
- Un plano de escenario realista (decenas a pocos cientos de elementos de 5 a 30 nodos) cabe dentro de la zona cómoda; los 1000 a 3000 elementos del peor caso necesitan recortar nodos pintados.

## Recomendación

- Estado por elemento con `@preact/signals` (transform y clase enlazados a señales), no re-render del plano entero por cada movimiento. Medido.
- Zoom y pan con `transform` en un grupo, no con `viewBox`. Medido solo a 100 elementos.
- Símbolos con `<use>` a un `<g>` definido en `<defs>` para la biblioteca: mejor en arrastrar 100 seleccionados y menos nodos en el DOM. Medido solo a 100 elementos y con carga externa; repetir a 1000.
- Para pasar de unos cientos de elementos: recorte por viewport hecho por la app (solo montar los elementos visibles) y nivel de detalle por zoom (símbolo simple y sin etiqueta cuando son pequeños). Sin medir: probar con el banco (`lod=1..3`) antes de decidirlo.
- `will-change`, capas separadas y zoom por transformación CSS: sin dato, no adoptar nada sin medir.
- Repetir la batería con la CPU libre (`node run.mjs results/pass1.jsonl 300,1000,3000` con `REPS=3`) antes de fijar el techo en el diseño.

## Qué se hizo en la máquina

- Carpeta nueva `D:\DOCS\CODELAB\4_scratch\scaena-lab\svg-perf`, con `pnpm-workspace.yaml` (`allowBuilds: esbuild: true`, para que pnpm 11 ejecute el postinstall de esbuild). Sin git ni commits; no se tocó nada fuera de esa carpeta salvo este informe.
- Navegador silenciado con `media.volume_scale=0` (el banco no reproduce audio). Dos pruebas de contraste se hicieron con ventana visible (1000 y 3000 elementos), unos segundos cada una.
- Servidor Vite (`vite preview`, puerto 4173) y conductor `run.mjs` terminados al acabar; puerto 4173 libre. El Firefox y los bancos de la otra sesión no se tocaron.
