# Paso 7 · Ordenadores, vídeo y red

Estado: hecho (2026-11-05). Captura: img/paso-7-ordenador.png

## Qué entrega

El ordenador pasa a ser un elemento con contenido (sistema, funciones, programas, licencia, salidas) y los elementos se pueden unir con cables de audio, vídeo, control de luces o red que se ven en el plano.

## Decisiones

1. **Ordenador.** Al añadir un portátil se crea con la función «sonido». Sus datos están en el inspector: funciones (al menos una, la última queda bloqueada), sistema operativo, programas con «para qué», licencia, llave física y salidas (señal, conector, nota).
2. **Catálogo de programas** (`src/library/programs.ts`, 63 programas del informe `software-ordenadores.md`): solo nombre, sistemas y categoría, sin versiones. El campo de programa sugiere por las funciones del ordenador y admite texto libre.
3. **Aviso suave de compatibilidad.** Si el sistema indicado no tiene un programa del catálogo, sale una nota («QLab solo existe para macOS») con icono y texto. Sistema sin indicar, programa fuera del catálogo o sistema desconocido en el catálogo: sin aviso, porque un aviso equivocado es peor que ninguno.
4. **Conexiones.** Herramienta «Cable o conexión»: se elige el tipo de señal, se pulsa el origen y luego el destino. Se rechazan enlaces a uno mismo y repetidos (mismo par y señal). Cada conexión tiene conector (por defecto el habitual de su señal), longitud y se borra desde el inspector de cualquiera de sus extremos.
5. **Dibujo.** Línea de centro a centro bajo los símbolos. Cada señal tiene color y trazo distintos (continuo, rayas, raya y punto, puntos) y el nombre del conector como texto: el color nunca va solo. Mientras se arrastra un elemento, sus líneas se ocultan hasta soltarlo. Durante el zoom no se dibuja el texto.
6. **Colocación.** Los elementos nuevos ya no se apilan en el centro: se colocan en el primer hueco libre a la derecha y debajo.
7. **Capa «Control y vídeo».** Ya existía; las conexiones se ven cuando sus dos extremos están en capas visibles.

## Fuera de alcance

Aviso de longitud máxima de cable por conector, patch de red con direcciones IP, comprobación de que el tipo de señal tiene sentido entre dos elementos.

## Pruebas

Unitarias: conexiones (alta, rechazos, edición, borrado al quitar un elemento), catálogo y avisos, hueco libre. e2e en Firefox: panel de ordenador, aviso de sistema, última función bloqueada, conexión creada, editada y deshecha, axe en claro y oscuro.
