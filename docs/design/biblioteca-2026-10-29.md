# scaena — biblioteca de elementos y símbolos

Estado: lista de contenido propuesta el 2026-10-29. El usuario decidió las dos preguntas abiertas (escenografía básica y pantallas y proyectores: sí) y no objetó el resto. Detalle de campos y esquemas sin escribir.

## Definición de un elemento

- Identidad: id estable, versión, categoría, nombre en español e inglés, etiquetas de búsqueda
- Símbolo SVG en vista cenital, con `<title>` y `<desc>` como texto alternativo
- Símbolo opcional en vista lateral, para la sección
- Tamaño real: largo, ancho y alto en mm
- Peso y potencia
- Canales sugeridos (audio): nombre, micro o DI sugerido, pie, fantasma
- Variantes, por ejemplo una batería de 4 o de 5 piezas
- Al colocar un elemento con canales sugeridos, la lista de canales se rellena en el orden estándar (batería, bajo, guitarras, teclados, voces)

## Símbolos

- Dibujados por nosotros en SVG, con la misma licencia que el código (GPL-3.0)
- Un solo estilo: formas simples, trazo grueso, legibles en blanco y negro, frente marcado con línea más gruesa (RP-2)
- Luminarias: símbolos genéricos según la convención de RP-2; no se usan símbolos de fabricantes
- Sin logos de marcas; el nombre comercial de un equipo puede aparecer como texto
- Ningún SVG se entrega sin rasterizarlo y mirarlo; herramientas en `4_scratch\svg-lab`
- Láminas de RP-2: resuelto en `docs/research/simbolos-rp2-audio.md` (sin licencia de reproducción; se dibuja de cero siguiendo la convención)

## Datos de luminarias

- Fuente: Open Fixture Library (MIT)
- Importación al construir, no en tiempo de ejecución; copia versionada en el repositorio y atribución en «Acerca de»
- Campos: fabricante, modelo, categoría, dimensiones, peso, potencia, conectores, lámpara, ángulos de lente, modos DMX con su número de canales
- Cada equipo concreto se asocia a un símbolo genérico por categoría y lente
- El usuario puede crear luminarias propias con peso, potencia y tamaño
- La OFL se centra en equipos DMX y LED; los convencionales de teatro pueden estar poco representados
- Peso de la OFL: medido en `docs/research/ofl.md` (el subconjunto usado pesa 25 KB en brotli)

## Audio

- Sin datos abiertos reutilizables hallados
- Catálogo propio de tipos genéricos: dinámico, condensador, DI y similares
- Marca y modelo como texto libre
- Lista corta de modelos habituales escrita por nosotros
- Contenido de la lista: `docs/research/audio-modelos.md`

## Elementos propios del usuario

- Importación de un SVG, con tamaño y categoría, y opcionalmente canales
- Se guardan en el archivo `.scaena` y en una biblioteca local
- El SVG importado se sanea (sin scripts), por la CSP estricta

## Paquetes por tipo de espectáculo

- Un paquete es un conjunto de plantillas y una selección de elementos
- Ejemplos: banda de rock, jazz, DJ, conferencia, teatro con micros de diadema
- Datos del repositorio, abiertos y sin pago
- Lista definitiva: `docs/design/paquetes-2026-11-02.md` (7 paquetes)

## Versionado

- El archivo `.scaena` guarda una copia de la definición de cada elemento que usa, además de su id y versión
- Así un archivo se abre igual aunque la biblioteca cambie
- Coste: más peso por archivo

## Categorías iniciales

### Audio
- Baterías y percusión
- Guitarras y bajos
- Amplis
- Teclas
- Cuerdas
- Vientos
- Voces y micros, con sus soportes
- Audio de sala: PA, subs, cuñas, IEM, mesas, stageboxes, DI, racks
- DJ
- Personas
- Cables y tomas de corriente
- Mobiliario de escenario: tarimas, sillas, atriles, mesas, flightcases

### Luces
- Convencionales: elipsoidal, fresnel, PAR, scoop, tira, seguidor
- LED y automáticas, de la OFL
- Efectos: humo, haze, estroboscopio, blinder
- Posiciones de montaje: barra, vara, truss, boom, escalera

### Escenografía básica (aceptada 2026-10-29)
- Telones, patas, escaleras y plataformas como formas simples
- Motivo: RP-2 pide que el plano de luces lleve el masking y los obstáculos

### Audiovisual (aceptado 2026-10-29)
- Pantallas y proyectores como formas simples, sin cálculo de píxeles

## Después de construirlo

Cifras de lo construido: 48 símbolos dibujados (más el cuadro de texto y la toma de corriente, añadidos después), 51 elementos, 29 luminarias y 28 modelos de audio con fuente, 16 regiones eléctricas, 7 paquetes y un catálogo de 62 programas. Los textos de los paquetes se traducen al inglés en `src/library/translate.ts`. Los símbolos se ven en `docs/design/img/simbolos-2026-11-05.png`.
