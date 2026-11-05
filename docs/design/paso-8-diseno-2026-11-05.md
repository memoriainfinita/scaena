# Paso 8 · Luces

Estado: hecho (2026-11-05). Capturas: img/paso-8-instrumentos.png, paso-8-electrica.png, paso-8-seccion.png y paso-8-plano.png

## Qué entrega

El módulo de Luces: instrumentos con su modelo, montaje, numeración, canales, dimmers y circuitos; montajes (varas, tubos, truss, calles laterales y suelo) con altura y carga máxima; carga eléctrica por circuito, dimmer y fase; y una sección lateral.

## Decisiones

1. **Cuatro secciones dentro de la vista Luces**: Instrumentos, Montajes, Eléctrica y Sección.
2. **Instrumentos.** Tabla editable con unidad, elemento, modelo, montaje, canal, dimmer, circuito, universo, dirección, color y potencia. «Numerar instrumentos» da unidades de 1 a n por montaje (en el orden en que se crearon) y luego de izquierda a derecha y de atrás adelante; los que no cuelgan de nada van al final. El mismo contenido está en el inspector al seleccionar una luminaria.
3. **Modelo.** Campo nuevo y opcional `luminaire.modelId` (compatible con los archivos del paso 2: el valor por defecto es vacío). Elegir un modelo copia su peso y su potencia del catálogo cuando los tiene; si no los tiene, se conservan los del usuario. Los modelos genéricos llevan «≈» y el aviso «valor genérico estimado».
4. **Montajes.** Se crean con «Añadir montaje» como una vara a lo ancho del escenario y se editan en tabla: nombre, tipo, extremos, altura y carga máxima. Quitar un montaje deja sus instrumentos en el plano, sin montaje. Los paquetes con luces traen una «Vara 1» sin altura ni carga (no se inventan datos).
5. **Recuento por montaje** bajo la tabla de instrumentos: cuántos, peso y potencia, y una nota con icono y texto cuando el peso supera la carga máxima indicada. Los pesos vacíos cuentan como cero: no se avisa de lo que no se sabe.
6. **Eléctrica.** Circuitos (instrumentos, vatios, amperios a la tensión de la región y fase L1 a L3 elegible), dimmers (con máximo editable y nota si se supera) y total por fase. Sin fase asignada se agrupa aparte.
7. **Sección lateral.** Profundidad en horizontal (fondo a público) y altura en vertical; cada montaje a su altura con sus instrumentos como puntos. Altura 0 se dice «sin altura».
8. **En el plano**, los montajes se dibujan como líneas gruesas con su nombre (trazo distinto para truss y suelo), bajo los instrumentos y solo si la capa de Luces está visible.

## Fuera de alcance (pasos 11 y 12)

Leyenda, cajetín, magic sheet, ángulos de foco dibujados y los informes tipo Lightwright. Los datos que necesitan (modelo, unidad, canal, dimmer, circuito, color) ya se guardan.

## Pruebas

Unitarias: montajes, numeración, modelos, carga por montaje, circuito, fase y dimmer, paquetes con luces. e2e en Firefox: tabla de instrumentos, aviso de carga, sección, eléctrica y fases, instrumento nuevo desde la biblioteca; axe en claro y oscuro.
