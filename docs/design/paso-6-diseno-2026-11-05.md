# Paso 6 · Audio

Estado: hecho (2026-11-05). Capturas: img/paso-6-entradas.png y paso-6-salidas.png

## Qué entrega

Las vistas Entradas y Salidas dejan de ser una tabla de lectura y pasan a ser las listas de trabajo del técnico de sonido: se editan en la propia tabla, se reordenan, se emparejan en estéreo y se enlazan con el plano. Un flujo de señal sencillo cierra el circuito fuentes, mesa y salidas.

## Decisiones

1. **Edición en la propia tabla.** Cada celda es un campo; el cambio se confirma al salir de la celda y es un paso de deshacer. Sin diálogos intermedios.
2. **Micro o DI con sugerencias.** El campo ofrece los modelos de la biblioteca (marca y modelo) y también acepta texto libre. El modelo se guarda por su identificador; el texto libre, tal cual. Al elegir un modelo, el fantasma se pone según su tipo (condensador sí, dinámico no), y el usuario puede cambiarlo.
3. **Orden.** Los canales se numeran de 1 a n sin huecos. Subir y bajar intercambian números. «Ordenar por instrumento» agrupa por la categoría del elemento de origen (batería, guitarras, teclas, voces…) y mantiene el orden previo dentro de cada grupo.
4. **Pares estéreo.** Se eligen desde un canal y el otro queda emparejado a la vez; cambiar o quitar uno libera al otro.
5. **Fuente.** Cada canal y cada salida pueden apuntar a un elemento del plano. Quitar el elemento ya borraba su canal (paso 2); aquí se elige o se cambia.
6. **Selección sincronizada.** Al pulsar o enfocar una fila se selecciona su elemento en el plano, y al seleccionar un elemento se resaltan sus filas.
7. **Salidas.** Tipo (cuña, in-ear, principal, envío), estéreo, aux, elemento y notas, con el mismo comportamiento de numerar y reordenar.
8. **Flujo de señal.** Un diagrama de tres columnas: fuentes agrupadas por elemento, mesa (su modelo se escribe en el propio diagrama) y salidas agrupadas por tipo. El color acompaña siempre a un texto en la línea, nunca lo sustituye, y las líneas distinguen micros y DI, retornos y principal también por el trazo.
9. **Quién aporta.** Ya está en el inspector (paso 4); aquí se añade la columna de la fuente.

## Fuera de alcance

Patch de stageboxes con puertos concretos y su numeración física (queda como lista de notas en la fila hasta que haya datos reales de uso), importar listas de otros programas.

## Cómo se prueba

- Unitarias: añadir, quitar con renumerado, mover, pares estéreo simétricos, orden por instrumento, fantasma al elegir modelo.
- e2e en Firefox: editar nombre y deshacer, añadir y quitar canal, emparejar, selección sincronizada con el plano, añadir salida, flujo visible, axe en claro y oscuro.
- A ojo: captura de Entradas y de Salidas con el flujo.
