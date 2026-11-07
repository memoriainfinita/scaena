# El plano del escenario

## Poner elementos

![Buscar en la biblioteca](../img/biblioteca.png)

Busca en la biblioteca (sin importar los acentos) y pulsa el elemento: aparece en el primer hueco libre del escenario, seleccionado. Arrástralo para colocarlo; se ajusta a la cuadrícula (**Alt** al arrastrar la desactiva). En el inspector puedes escribir la etiqueta, quién lo aporta (banda, sala, alquiler), notas, posición y giro.

## Seleccionar y editar varios a la vez

![Todo seleccionado, con la barra de acciones](../img/seleccion.png)

- Pulsa un elemento; **Mayús** + pulsar añade o quita. Arrastra sobre el fondo para un **recuadro de selección**; **Ctrl+A** selecciona todo.
- La barra de arriba gira, voltea, duplica, agrupa, borra y alinea o distribuye lo seleccionado (alinear pide dos elementos, distribuir tres).
- Un grupo se mueve y se selecciona como uno. **Ctrl+G** agrupa y **Ctrl+Mayús+G** desagrupa.
- Las **capas** (a la derecha) se pueden mostrar, atenuar y bloquear. Un elemento en una capa bloqueada no se puede tocar.

## Medir y escribir en el plano

![Medir entre dos puntos](../img/medir.png)

La herramienta **Medir** da la distancia entre dos puntos (en metros, o en pies si el montaje es imperial). Tras medir, **Fijar como cota** la deja en el plano como una cota en la capa Anotaciones: lee su longitud, se mueve como cualquier elemento, sale en el PDF y se deshace. La herramienta **Texto** coloca una nota y deja la etiqueta lista para escribir.

## Un plano de la sala de fondo

![Fondo importado y su configuración](../img/fondo.png)

Con la herramienta **Fondo PDF o DXF** importas el plano de la sala. El PDF se convierte en imagen en tu navegador y el DXF se dibuja en líneas; hasta 25 MB. Luego:

1. **Calibrar la escala:** pulsa dos puntos del plano que estén a una distancia conocida y escribe esa distancia. El fondo se reescala alrededor del primer punto.
2. Ajusta la **opacidad** y, si quieres, **bloquéalo**.

El fondo se guarda dentro del archivo del montaje.

## El escenario

En **Ajustes del montaje → Escenario**: ancho y fondo, un **ancho de proscenio** opcional (vacío, sin proscenio; la línea se dibuja como dos paredes con la boca en medio) y las **líneas de referencia** que se muestran (eje central, línea de proscenio, boca del proscenio). La **altura de la tarima** es la del escenario sobre el suelo de la sala (cuenta en la sección lateral). Las zonas elevadas dentro del escenario son elementos **Tarima** y **Plataforma** de la biblioteca, cada uno con su altura en el inspector. Para un escenario de forma irregular, marca **Escenario de forma libre** y escribe los puntos, uno por línea como `x; y` en metros (al menos tres). Un escenario de forma libre no tiene líneas de referencia.

## Mover la vista

Rueda del ratón para acercar, **Espacio** + arrastrar (o la herramienta Mano) para desplazar, **0** para encajar el plano. En el móvil: dos dedos. Ver [Atajos](atajos.md).

## Capas propias

Bajo la lista de capas, escribe un nombre y pulsa **Añadir capa** para crear una capa tuya (hasta 20). Se puede renombrar, subir o bajar (las de arriba se dibujan sobre las de abajo) y quitar; al quitarla, sus elementos vuelven a la capa de su tipo. Para pasar un elemento a una capa, elígela en el campo **Capa** del inspector.

## Elementos propios

**Crear elemento propio** (arriba de la biblioteca) toma un dibujo SVG de hasta 200 KB y pide nombre, tamaño real, altura, peso, potencia y capa. El dibujo se reconstruye solo con formas, trazados, grupos y colores lisos: el texto, las imágenes, los degradados, los enlaces, los estilos y los scripts se omiten (el diálogo dice cuántas partes), y los trazos se redibujan a 1,5 px. El elemento vive en el montaje y viaja en el archivo `.scaena`; sale el primero en las búsquedas de la biblioteca y solo se puede borrar cuando ya no está en el plano.
