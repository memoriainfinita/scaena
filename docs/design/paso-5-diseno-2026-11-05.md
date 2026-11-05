# Paso 5 · Plano 2D interactivo

Estado: hecho (2026-11-05). Captura: img/paso-5-plano-claro.png y paso-5-plano-oscuro.png

## Qué entrega

El plano deja de ser un dibujo y pasa a ser un lienzo de trabajo: se mueve, gira y alinea lo que hay, se hace zoom y se mide, todo con ratón y con teclado. Cada gesto es un paso de deshacer.

## Decisiones

1. **El lienzo ocupa toda la zona central.** La hoja de papel con su proporción es cosa del PDF (paso 11). Aquí el dibujo va sobre una superficie clara fija (los símbolos son en blanco y negro) con cuadrícula opcional.
2. **Cámara propia.** Una señal `{x, y, k}` (traslación en píxeles y píxeles por milímetro). El zoom y el desplazamiento solo cambian el atributo `transform` de un grupo; los elementos no se vuelven a pintar. Es la técnica medida en Chrome (`docs/research/svg-zoom-gesto-chrome.md`).
3. **Detalle simple durante el gesto.** Mientras dura la rueda (y 140 ms después) cada elemento se dibuja como un rectángulo de su tamaño real, sin símbolo ni etiqueta. Al terminar vuelve el detalle completo.
4. **Arrastre en capa aparte.** Al empezar a arrastrar, lo seleccionado pasa a un grupo con su propio `transform`; el resto no se toca. El gesto termina en un único paso de deshacer.
5. **Ajuste a la cuadrícula.** El arrastre ajusta la posición del elemento que se agarra (no el gesto del ratón), de modo que los elementos caen en la cuadrícula. `Alt` desactiva el ajuste. Cuadrícula de `view.gridMm`, activable en la barra del plano.
6. **Selección.** Clic, `Mayús`+clic (añadir o quitar), recuadro de selección y `Ctrl+A`. Un elemento agrupado selecciona a todo su grupo. Las capas bloqueadas no se seleccionan ni se arrastran; las ocultas no se dibujan.
7. **Operaciones en el modelo** (`src/model/ops.ts`, puras y con pruebas): `rotateElements`, `flipElements`, `duplicateElements`, `groupElements`, `ungroupElements`, `alignElements`, `distributeElements`.
8. **Teclado.** Tab recorre los elementos y enfocar uno lo selecciona; flechas mueven un paso de cuadrícula (`Mayús`: 10 mm); `R` gira 15° (`Mayús`+`R` al revés); `F` voltea en horizontal (`Mayús`+`F` en vertical); `Ctrl+D` duplica; `Ctrl+G` agrupa y `Ctrl+Mayús+G` desagrupa; `Supr` borra; `Enter` abre el inspector en la etiqueta; `Esc` suelta la selección y la herramienta; `0` encaja el plano; `+` y `-` zoom.
9. **Herramientas.** Seleccionar, Mano (también `Espacio` y botón central), Medir (dos clics, la medida es temporal y no se guarda) y Texto (un clic coloca una nota de texto y deja la etiqueta lista para escribir). Conectar y Fondo siguen apagadas hasta sus pasos (6/7 y 10).
10. **Alinear y distribuir.** Con dos o más elementos seleccionados aparece una barra con alinear a izquierda, centro, derecha, arriba, medio, abajo, y distribuir en horizontal o vertical.
11. **Cotas permanentes y polígono libre del escenario** no entran aquí: el modelo todavía no guarda cotas y el escenario se edita desde Ajustes. Quedan anotados en `state.md` para el paso 12 (informes), donde hacen falta.

## Fuera de alcance de este paso

Sala completa con accesos y líneas de referencia (paso 7), conectores (6 y 7), fondo de plano (10), vista previa de impresión (11).

## Cómo se prueba

- Unitarias: cada operación del modelo (giro, volteo, duplicado, grupos, alineado, distribución) y la geometría (cajas rotadas, ajuste, encaje).
- e2e en Firefox: arrastrar un elemento y deshacerlo de una vez, selección por recuadro, teclado (flechas, R, Ctrl+D, Supr), zoom con la rueda, alinear, medir, texto, capa bloqueada, axe en claro y oscuro.
- A ojo: captura del plano con selección y barra de alinear.
- Chrome: medición del zoom con 300 y 1.000 elementos (misma sonda del informe), cuando la máquina esté libre.
