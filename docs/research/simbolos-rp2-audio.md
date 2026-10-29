# Símbolos de luces (RP-2) y de audio: permisos, fuentes y lista a dibujar

Fecha: 2026-10-29. Descargas en `D:\DOCS\CODELAB\4_scratch\scaena-lab\rp2\` (datos no confiables; solo se abrieron con PyMuPDF). Lo no comprobado va marcado «sin verificar».

## 0. Correcciones a la premisa

- RP-2 no es de ESTA ni es ANSI E1.15. Es de USITT («USITT RP-2, Recommended Practice for Theatrical Lighting Design Graphics», 2006). ANSI E1.15 es, según una búsqueda, la práctica de los pies/bases de foco («boom and base», árboles de luces); no es de símbolos. Fuente débil, **sin verificar** en la tienda de ANSI. Consecuencia: ESTA no tiene nada que conceder sobre RP-2; el titular de los derechos es USITT.
- RP-2 ya no es el documento vigente. USITT publicó en febrero de 2025 (noticia del 10-abr-2025) la «Lighting Documentation Recommended Practice» (60 págs.), que dice textualmente que sustituye a todos los documentos anteriores, incluidos los de «Theatrical Lighting Design Graphics», y añade LED, automáticas, redes y control. Conviene citar esta como guía principal y RP-2 como antecedente.
- Para audio sí hay documento de USITT: «USITT/TSDCA Sound Documentation Recommended Practice» (abril de 2022, aprobado; sustituye a los estándares de USITT de 2008). Dice que no es una colección completa de símbolos.

## 1. Láminas de símbolos de RP-2 leídas

Se leyó el PDF de stagelightingprimer.com (879.433 bytes, 9 págs.). Las páginas 4 a 9 son imágenes incrustadas (PyMuPDF las rasteriza bien a 130 dpi; no hizo falta pdftoppm ni pdf.js). Las páginas 1 a 3 son texto. Lo mismo para la guía de 2025 (PDF de 5.734.359 bytes, 48 págs. de texto más imágenes; símbolos en las págs. 19 a 20 de 60, figura 3.1.4.0.4).

Fuentes:
- RP-2 (2006), copia no oficial: https://www.stagelightingprimer.com/USITT_Lighting_Design_Graphics.pdf
- Guía 2025: https://cdn.prod.website-files.com/6837b6c2b0e0e207eec16acf/6968033f34d5c0cd53b56c6c_USITT%20-%20Lighting%20Documentation%20Recommended%20Practice%20(5)-compressed.pdf (enlazada desde https://www.usitt.org/news/lighting-design-technology-commission-releases-updated-lighting-documentation-recommended)
- Sonido 2022: https://tsdca.org/app/uploads/USITT-TSDCA-Sound-Documentation-Recommendations_April_2022_APPROVED.pdf (vía https://soundgirls.org/usitt-tsdca-sound-documentation-recommended-practice/)

## 2. Permiso de uso: qué se sabe

- RP-2 lleva «© 2006» en cada página, sin condiciones de reproducción ni licencia. La guía 2025 no trae aviso de copyright en el texto del PDF; el pie del sitio dice «© 2025 USITT. All rights reserved.». El PDF de sonido no trae copyright ni licencia en el texto.
- No hallé política de reimpresión ni de licencia de USITT para sus Recommended Practices. Un borrador de 2000 de RP-2 (resultado de búsqueda, no abierto) llevaba un aviso de © USITT que permite duplicarlo solo para desarrollar la práctica y prohíbe duplicarlo con lucro: **sin verificar**, y es un borrador antiguo.
- El propio texto de RP-2 y de la guía 2025 invita a usar los símbolos: son «generic symbols», «presented as a guideline», el diseñador puede crear símbolos nuevos o variar los existentes si los explica en la leyenda, y se permiten símbolos de programas de dibujo o propios. La guía 2025 añade que los símbolos son «unique para cada tipo» y deben ir en la leyenda. Es una invitación a la convención, no una licencia sobre los dibujos.
- Postura práctica (no es asesoría legal, **sin verificar** con un jurista): lo copiable es el texto y los dibujos concretos de las láminas; las convenciones (forma general de un elipsoidal, hexágono para circuito, círculo para canal, frente más grueso) son prácticas de uso común y funcionales. Por tanto: dibujar de cero a partir de las descripciones de este informe, sin trazar sobre las láminas, sin incluir imágenes de ellas en el repositorio ni el texto de RP-2. Citar el documento como referencia. Para quedar cubiertos del todo, escribir a USITT (usitt.org) pidiendo confirmación por escrito; no lo he hecho.
- Precedentes de software: no hallé declaraciones de permiso de USITT ni de ESTA a ningún programa. Vectorworks/SoftSymbols (Field Template, comercial), Drafty (afirma símbolos «USITT/ABTT»), LXFree, LuminaPlot y similares usan símbolos «al estilo RP-2» sin que haya constancia de licencia (**sin verificar** acuerdos privados). Pylux (GPL-3.0, https://github.com/jackdpage/pylux) tiene un repositorio de contenido con carpeta `symbol` (https://github.com/jackdpage/pylux-content); el repositorio no declara licencia (la API devuelve 404 de licencia), así que no se puede reutilizar sin pedir permiso. El contenido de TheaterDesign (SourceForge) no se revisó.
- Las 'USITT sound graphic standards' de Graffletopia (https://www.graffletopia.com/stencils/1447, autor CurtisCraig, 2015, 8 KB, 287 descargas) no declaran licencia; derivan de USITT. No usar.
- Las bibliotecas de fabricantes (ETC, Martin en Vectorworks, Modelbox, Cue1, Stardraw) son de otros: la guía 2025 incluye una figura con «Graphic provided courtesy of ETC», lo que confirma que no son libres.

## 3. Audio: estándares y símbolos abiertos

- No hay estándar con láminas de símbolos de audio equivalente a RP-2. El documento USITT/TSDCA 2022 (sección 1.12 y 2.1) solo da reglas: micro y altavoz pueden representarse como bloque de dispositivo o con símbolo pictórico (opcional); pone siempre marca y modelo, uso y número o letra únicos; el altavoz activo (autoalimentado) lleva un pequeño triángulo; el amplificador se dibuja como bloque con triángulos por canal opcionales; la señal inalámbrica con rayo u onda; el conector multipin con símbolo arquitectónico. Para planos remite a símbolos de las bibliotecas de CAD y a los de fabricantes (descargas gratuitas), y si no existen, dibujar uno al tamaño real o mayor (nunca menor). Todos los símbolos van en la leyenda. En la figura 1.12.1 se ve: micro = círculo con número unido por línea a una línea de señal; monitor/cuña = trapecio con cuadrado en el lado estrecho (triángulo dentro si es activo), número en círculo.
- Stage plots de uso común (bandas): no hay símbolo normalizado; cada herramienta usa los suyos. Hallazgos: HiveMind StagePlot Creator (propietario); Wild Goose Festival (PDF con iconos, «feel free to use/draw your own», sin licencia declarada); Schematex (https://github.com/SchemaTex/SchemaTex, AGPL-3.0, genera diagramas de stage plot en SVG; incompatible con una mezcla simple si se quisiera copiar, y su alcance de uso de iconos **sin verificar**); Phosphor «microphone-stage» (MIT, ya anotado en investigación.md); SVG Repo y similares, licencias variables. No hay conjunto CC0 de iconos de stage plot confirmado.
- Conclusión: dibujar los propios, con la convención del documento de 2022 (círculo numerado para micros, trapecio para altavoces y cuñas, triángulo de activo) y formas cenitales simples reconocibles para el resto (batería, ampli, teclas, mesa, DI, persona). Sin logos.

## 4. Convención de dibujo común (RP-2 y guía 2025)

- Frente: línea más gruesa, o sombreado (RP-2 §6.0). La guía 2025 fija: perímetro de luminarias y accesorios en trazo grueso; posiciones de colgado en medio; detalles interiores, líneas de cota y de llamada en fino; escenografía y arquitectura en gris o menos opacidad. Color: negro para la mayoría; color solo junto a otra distinción (peso, tipo de línea) por accesibilidad; debe leerse impreso en blanco y negro.
- Símbolos a escala aproximada del aparato y colocados en su punto real de colgado. Separación por defecto entre focos fijos: 18 pulgadas (45 cm). Es costumbre orientarlos a 90° respecto de la posición, o hacia el punto de enfoque.
- El ángulo del haz o la longitud focal se indica en el símbolo (RP-2: se marca el frente con formas distintas; ver lista).
- Unidad y canal: ver sección 6.

## 5. Lista de símbolos de luminaria de RP-2 (para dibujar)

Todos son vista cenital con la luz apuntando hacia un extremo (el frente, a la derecha o a la izquierda según la lámina) y la línea de la barra pasando por el eje. Dimensiones de las láminas en pulgadas.

### 5.1 Elipsoidales (ERS), §6.1

Silueta común: cuerpo con parte trasera (cámara de lámpara) redondeada y cuello, y tubo de lente delante. En todas, el ángulo se marca con un glifo en la boca del tubo de lente:
- 5°, 10°, 15° (§6.1.6, versiones largas y estrechas, enhanced): sin glifo, tubos largos.
- 19° o 20°: dos diagonales cruzadas (aspa) en la boca.
- 26° a 30°: una diagonal.
- 36° a 40°: boca lisa.
- 50°: boca en V (ángulo abierto hacia delante).
- 70°: líneas verticales cortas (reja), 90°: escalón pequeño.
En RP-2 las rejillas de 3 a 5 líneas horizontales en la boca marcan los haces estrechos de los modelos de 3,5" (12° y 18°: tres líneas).

Familias (§6.1.1 a 6.1.10): 3,5" (5x5 a 3,5x12; radial y axial), 4,5" caja (50, 40, 30, 4,5x6,5, zoom «Z»), 4,5" redondo (4,5x6,5 o 50°), 6" redondo (6x9, 6x12, 6x16, 6x22), 6" caja (50, 40, 30, 20, zoom), 8" redondo (8x9, 8x10, 8x11, 8x13, zoom), 8" caja (10°), 10" (10x12), 10" caja (10°), «enhanced ERS» (5° a 90°). Variantes radial (cuerpo con curva) y axial (forma de embudo) se distinguen por la silueta trasera.

### 5.2 Variaciones de ERS (§6.1.11, accesorios dentro del propio símbolo)
- Zoom: letra «Z» en el cuerpo.
- Con plantilla o gobo: punto relleno, triángulo relleno o letra «T».
- Con iris: círculo vacío o letra «I».
- Con rotador de gobo: círculo con triángulo y flecha, o letra «R».
- Con doble rotador: dos flechas circulares, o «RR».

### 5.3 Fresnel (§6.2)
Cuerpo trapezoidal con una lente convexa al frente (arco hacia el frente): 3", 6", 8", 12" y Fresnel de haz ovalado (lente más estrecha).

### 5.4 PAR (§6.3)
Cuerpo redondeado con un frente plano: MR-16 («birdie»), PAR 38, 46, 56, 64 (tamaño creciente); PAR axial o mejorado (forma de embudo con frente en V) y PAR de enfoque variable («Z»). Designación de haz como glifo en el frente: XWFL (escalón), WFL (V), MFL (frente liso), NSP (una diagonal), VNSP (aspa). Orientación del eje de lámpara: flecha doble, vertical, horizontal o inclinada, dentro del cuerpo; se usa para marcar dónde cae el haz o la orientación del filamento. Para varios PAR o axial vale la designación del PAR 64.

### 5.5 Proyectores de haz (§6.4)
Cuerpo en cuña con lente curva: 10", 12", 16" y «enhanced».

### 5.6 Reflectores elipsoidales de inundación o scoop (§6.5)
Cubo con frente curvo ancho: 10", 12", 14", 18".

### 5.7 Ciclorama (§6.6)
- T-3: rectángulos de 1, 2 y 3 circuitos, 4 circuitos, 6 y 9 luces (la dimensión aproximada crece con el número de luces); la dirección de enfoque se indica con una flecha.
- Cicloramas de celdas: 1, 2, 3 y 4 celdas en fila, 4 celdas en cuadrícula 2x2; el símbolo respeta tamaño y forma reales.

### 5.8 Tiras (§6.7)
- Tira con perfil de caja y extremos recortados: MR-16, R40/PAR 38 (mismo símbolo; marcar lámpara en la leyenda), PAR 56, PAR 64. El largo depende del número de lámparas: medir el equipo.
- Montaje: colgada en la barra (con garras en un lado) o en trunnion (suelo, con barras en los extremos).
- Fluorescentes: rectángulos largos con líneas interiores por tubo (6 pies 1 tubo, 5 pies 3 tubos, 4 pies 2 tubos); opción 2 rectángulo con rótulo «T-10 2 tubos 2 circuitos».

### 5.9 Automáticas (§6.8)
- Cuerpo fijo con espejo móvil: rectángulo largo con óvalo.
- Yugo móvil: cuerpo con letra «Y»; incluye un círculo discontinuo que marca el radio de giro y la cabeza dentro (ejemplo con 19° mejorado).
- Cabeza móvil wash: cabeza con lente en D; cabeza móvil spot: octágono, con círculo discontinuo; triángulo de «punto de referencia cero» fijado por el diseñador.
- Espejo móvil externo: cuerpo ERS con un círculo unido por un cuello.
- La guía 2025 usa para automáticas un círculo con el cuerpo dentro y círculos discontinuos para el giro.

### 5.10 Prácticos y especiales (§6.9)
Triángulo = luminaria práctica; proyector de diapositivas de 35 mm = cuadrado con círculo y saliente. Efectos especiales: tamaño y forma reales.

### 5.11 Seguidor (§6.10)
Cuerpo largo y estrecho con cabeza ensanchada y chaflán; notación del «boomerang» con lista de colores, 1 el más alejado del operador.

### 5.12 Circuitería (§6.11)
Bifurcadores («two-fers»): focos unidos con línea gruesa entre sí y puntos negros en las uniones; cruce con salto. Hexágono para circuitos y círculo para canal van unidos por línea corta.

### 5.13 Pies y bases (booms, §6.12)
Vista cenital: base de suelo (cuadrado alrededor del foco), pie con base circular (círculo grande con un punto central y cruz), montaje con brida (círculo con anillo interior). Los focos de la columna se rayan o sombrean en vista cenital. En la lateral (opción 1 y opción 2) se numeran del foco superior al inferior, con cotas verticales; opción 1: ortogonal; opción 2: en diagonal.

### 5.14 Accesorios (§6.13)
Portafiltros: barn door de 2 y 4 hojas, scroller (dos versiones: con carretes y simple), top hat (cuadrado), half hat (triángulo), mezclador CYM (cuerpo con «CYM»), douser o shutter (hachuras diagonales), línea de visión (círculo cuarteado blanco y negro), punto de anclaje (círculo con cruz).

### 5.15 Arco y LED (§6.15, 6.16; guía 2025)
- Estroboscopio: cuerpo con una banda negra al frente y triángulo de peligro con rayo; HMI Fresnel: Fresnel con banda negra gruesa al frente.
- LED: la silueta de la luz (ERS, PAR o tira) con puntos dentro; cada punto es un color distinto (3, 4 o 7).
- Guía 2025: ERS LED, PAR LED por lente (10°, 20°, 30° redondo; 10x20, 10x30, 15x35 oval), LED tape (líneas verticales con nota de dirección y distancia entre tiras), LED batten (tira con celdas), 750 W cap, glass gobo.

### 5.16 Efectos y otros (guía 2025 §3.1.4)
Humo: cuadrado con rótulo; haze: cuadrado menor; proyector (cabeza cuadrada con soporte); estrobo; scoop.

### 5.17 Máquina de escenas (§6.17)
Lente, película, disco y cabeza: cuatro piezas apiladas.

## 6. Marcado del frente, color, unidad y canal (para el motor de símbolos)

- Frente: trazo más grueso en el lado de la salida del haz (RP-2 sugiere además sombreado). El perímetro del símbolo siempre en trazo grueso.
- Color: no va en el símbolo; se anota como texto (código del fabricante de filtros, p. ej. «R21», «L161», «G890»; en la leyenda: R = Rosco, L = Lee, G = Gam). El filtro se escribe junto al foco; con scroller, también la notación del scroller. Con LED con varios colores, puntos dentro del símbolo.
- Número de unidad («instrument number»): entero único, dentro o junto al cuerpo (en el eje central, sobre el foco). Si se inserta un foco entre otros: 3A, 3B. Tiras multicircuito: letra más número por circuito (A1, A2, A3). Varios canales por unidad: 23.1, 23.2, 23.3. Posiciones perpendiculares a la línea central: de izquierda a derecha del escenario; verticales y paralelas a la línea central: de arriba abajo y de proscenio hacia el fondo; FOH: del más cercano al plaster line; cajas laterales: desde la línea central. Posiciones sin proscenio: números en un eje y letras en el otro.
- Canal: círculo con el número, unido por una línea corta al símbolo. La guía 2025 permite elipse si el número es de tres dígitos.
- Circuito o dimmer: hexágono (en RP-2, «Circuit & Dimmer») unido al símbolo. Dimmer separado (parche en la casa): rectángulo. Tres variantes de notación: dimmer por circuito (hexágono y círculo), control con parche duro y blando (hexágono, rectángulo, círculo) y control sin parche (hexágono y círculo).
- Otras notas del foco: enfoque («puppy», «kitty»), color, designación de haz, accesorio de gobo (punto negro, T), vataje, rotación del eje de PAR (flecha). Dirección de enfoque en tiras. La guía 2025 añade dirección DMX/universo/dirección en un recuadro («Uni/Addr»).
- Dimensiones: texto en cuatro tamaños según la guía; cotas y llamadas en fino. Línea central (trazo-punto), plaster line (trazos), enmascarado y telones (medio), arquitectura (grueso), escenografía (fino).

## 7. Qué dibujar en scaena (resumen de prioridad)

Luces (nivel 1, convencionales): ERS (con 7 anchos de haz y zoom), ERS con accesorios (gobo, iris, rotador), Fresnel (3, 6, 8, 12), PAR (MR16, 38, 46, 56, 64 y con designación), scoop (10 a 18), proyector de haz, ciclorama (1 a 4 celdas), tira (4 largos), seguidor, estrobo, práctico, proyector, humo, haze, blinder, truss/barra/pie/base/escalera (posiciones), accesorios (barn door, scroller, top hat, half hat, douser, CYM, línea de visión, punto de anclaje), contenedores de notación (círculo de canal, hexágono de circuito, rectángulo de dimmer, círculo de número de unidad).
Luces (nivel 2, LED y automáticas): cabeza móvil spot, wash, yugo, espejo móvil; LED PAR (por lente), LED tira/batten/tape.
Audio (nivel 1): micro con soporte, DI, caja de escenario, mesa, PA (tops, subs), cuña activa y pasiva, IEM, ampli de guitarra, ampli de bajo, batería (3 variantes), teclado, persona, tarima, rack, flightcase, silla, atril, toma de corriente, cable.

## 8. Pendientes

- Escribir a USITT para confirmar por escrito el uso de la convención y de formas derivadas (no hecho; sin verificar el criterio de USITT).
- Verificar ANSI E1.15 en la tienda de ANSI (la premisa podría venir de otra confusión).
- Leer la sección 4 de la guía 2025 (símbolos de diagrama de sistema: red, DMX, nodos) si se dibujan; no se rasterizó.
- Medir tamaños reales: las láminas de RP-2 no llevan cotas más allá de los diámetros de lente en pulgadas; los largos son de las láminas a ojo.
- Los glifos de las láminas fueron leídos a 110-130 dpi; confirmar los detalles finos (p. ej. 70° y 90°) al dibujarlos, comparando con los modelos reales.
