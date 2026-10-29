# Open Fixture Library (OFL): peso, licencia y cobertura

Fecha: 2026-10-29. Clon superficial en `D:\DOCS\CODELAB\4_scratch\scaena-lab\ofl` (último commit del clon: 2026-10-28). Scripts en el scratchpad de la sesión, no en el proyecto.

## 1. Tamaño del conjunto

- Fabricantes: 137 (`fixtures/manufacturers.json`; los 137 tienen carpeta con equipos).
- Archivos de equipo en `fixtures/*/*.json`: 665. De ellos, 13 son redirecciones (`redirectTo`, sin datos): **652 equipos reales**. Todos los porcentajes de abajo usan 652.
- Autores distintos en `meta.authors`: 289.

## 2. Peso en disco

| Medida | Bytes |
|---|---|
| `fixtures/` en bruto (suma de tamaños de archivo, `du -sb`) | 7 481 740 (7,5 MB) |
| tar + gzip -9 | 599 835 (586 KB) |
| tar + brotli q11 | 303 116 (296 KB) |

Subconjunto que usamos, un solo JSON minificado (fabricante, modelo, categorías, `physical` con dimensiones, peso, potencia, conector DMX, lámpara y lente, y modos con nombre y número de canales; sin canales detallados ni enlaces ni metadatos):

| Medida | Bytes |
|---|---|
| bruto | 224 572 (219 KB) |
| brotli q11 | 25 752 (25 KB) |

Notas:
- El subconjunto lleva el slug del fabricante en cada equipo; la tabla slug a nombre añadiría unos pocos KB en bruto (sin medir).
- El número de canales por modo es el largo de la lista `channels`. Los modos con `insert: matrixChannels` (equipos de matriz o píxeles) cuentan el bloque insertado como 0, así que su cifra queda corta. Para esos modos hay que expandir la matriz al importar. Sin verificar cuántos modos afecta.
- Conclusión: el subconjunto cabe sobrado en el repositorio y en el cliente (25 KB comprimido). Incluso el JSON completo (296 KB en brotli) sería asumible, pero no hace falta.

## 3. Campos físicos rellenos (de 652)

| Campo | Equipos | % |
|---|---|---|
| peso (`weight`) | 618 | 94,8 |
| potencia (`power`) | 613 | 94,0 |
| dimensiones (`dimensions`) | 625 | 95,9 |
| lente (`lens`) | 422 | 64,7 |
| lente con ángulos (`degreesMinMax`) | 419 | 64,3 |
| lámpara (`bulb`) | 570 | 87,4 |
| conector DMX (`DMXconnector`) | 593 | 91,0 |
| peso + potencia + dimensiones a la vez | 605 | 92,8 |

Los 30 equipos sin lente en ángulos son sobre todo barras, máquinas y paneles, donde la lente no aplica. Sin verificar la corrección de cada cifra: los datos son aportados por voluntarios (ver sección 4).

## 4. Licencia y atribución

Revisado: `LICENSE`, `README.md`, `docs/CONTRIBUTING.md`, `docs/fixture-format.md`, `AGENTS.md`, `AI_POLICY.md`, `package.json` y `ui/pages/about/index.vue` del clon.

- `LICENSE`: MIT, «Copyright (c) 2017 Florian & Felix Edelmann». `package.json`: `"license": "MIT"`.
- No hay ningún archivo, aviso ni texto que dé un término distinto para los datos de `fixtures/`. Ningún `LICENSE` propio en `fixtures/`, ni CC0 ni ODbL. Las búsquedas de «licen», «copyright», «public domain», «attribution» en README y CONTRIBUTING no dan resultados. La página «About» del sitio dice solo que el código es MIT.
- Consecuencia: los datos quedan bajo el MIT del repositorio, por defecto. Es una inferencia, no una declaración expresa para los datos. La OFL no aclara qué cubre el MIT respecto a las definiciones aportadas por 289 autores. Marcar como **sin verificar** si hace falta certeza jurídica; se puede abrir una pregunta en el repositorio de la OFL.
- Atribución que exige el MIT: conservar el aviso de copyright y el texto de permiso «in all copies or substantial portions of the Software». Propuesta mínima: copiar el `LICENSE` de la OFL junto a los datos importados y citar «Open Fixture Library, © 2017 Florian & Felix Edelmann, MIT, https://github.com/OpenLightingProject/open-fixture-library» en «Acerca de». El MIT no exige nombrar a los 289 autores individuales; conservar `meta.authors` en la copia es opcional y de buena práctica (cuesta unos KB; el subconjunto no los incluye).
- Los datos físicos (peso, potencia, dimensiones) son hechos técnicos de los fabricantes. Marcas y nombres de modelo: usarlos como texto, sin logos (ya recogido en `biblioteca-2026-10-29.md`).
- `AI_POLICY.md` regula contribuciones a la OFL con IA; no afecta a usar los datos.

## 5. Cobertura

### Categorías de la OFL (17; un equipo puede tener varias)

La OFL no tiene categorías de teatro convencional. Recuento sobre 652 equipos:

Color Changer 517, Moving Head 157, Dimmer 114, Strobe 66, Pixel Bar 44, Effect 36, Blinder 34, Laser 24, Flower 20, Smoke 18, Hazer 17, Scanner 17, Matrix 12, Other 11, Stand 10, Fan 5, Barrel Scanner 1.

«Dimmer» es la categoría donde caen los equipos controlados por intensidad (convencionales o LED de una sola fuente). No distingue ellipsoidal, fresnel, PAR o scoop: ese dato solo se deduce del nombre del modelo y de la lente.

### Por fabricante (equipos reales)

Mayores: American DJ 43, Cameo 43, Eurolite 43, Stairville 37, Chauvet DJ 29, Showtec 26, Martin 24, Elation 20, ETC 16, Generic 16, Litegear 13, Robe 11, Chauvet Professional 10, ARRI 8, Clay Paky 7.

Fabricantes pedidos:

| Fabricante | En la OFL | Equipos |
|---|---|---|
| ETC | sí | 16 |
| Robert Juliat | sí | 1 (613SX) |
| Martin | sí | 24 |
| Chauvet DJ | sí | 29 |
| Chauvet Professional | sí | 10 |
| ARRI | sí | 8 |
| Prolights | sí | 5 |
| Clay Paky | sí | 7 |
| Altman | no | 0 |
| Strand | no | 0 |
| Selecon | no | 0 |
| Rosco, Mole-Richardson, Vari-Lite, High End | no | 0 |

Búsqueda por slug de carpeta; un fabricante podría estar bajo otro nombre (sin verificar tras una revisión manual de la lista de 137).

### Equipos concretos pedidos

- **ETC Source Four (elipsoidal)**: solo las variantes LED y derivadas. Source Four LED Series 2 (Daylight HD, Lustr, Tungsten HD), Series 3 (Daylight HDR, Lustr X8), Source 4WRD Color II, y 6 fos/4 (paneles). ETC Source Four tradicional de lámpara: **no está**. Ejemplo de datos: Series 2 Daylight HD trae dimensiones 338x615x631 mm, 8,3 kg, 248 W, lente 5-90 grados.
- **Fresnel**: 0 coincidencias por nombre. Sin verificar equipos fresnel con otro nombre comercial (por ejemplo Arri, Hive o Cameo con lente fresnel).
- **PAR 64 / PAR 56**: solo LED: Chauvet LED PAR 64 TRI-B, SlimPAR 64 y 64 RGBA, Stairville LED PAR 56 y 64, Lightmaxx LED Par 56 y 64 COB, Flash Professional, Eyourlife, Stairville Z120M. Total unos 12 por nombre. Los PAR de lámpara incandescente (PAR 64 CP62 y similares): no están. Sí aparece «PAR 56» de Stairville, a revisar si es de lámpara.
- **Scoop**: ninguno (la única coincidencia es Cyclone RGB II, otra cosa). Tira de cicloramas/asimétricos: no hay un dato claro.
- **Altman, Strand, Selecon**: ninguno.
- **Robert Juliat 613SX**: sí, perfil tungsteno 1000 W, 330x415x565 mm, 11 kg, lente 28-54 grados, con enlaces a la ficha del fabricante. Es el único convencional de un fabricante teatral clásico.
- **Seguidor**: ninguno. Un resultado dudoso por nombre (HSL 40W Beam Spot Light RGBW) no es seguidor.
- **Martin, Chauvet, etc.**: son casi todos LED o móviles. Martin 15 Moving Head + 22 Color Changer; Chauvet DJ sobre todo Color Changer y efectos.

### Convencionales reales con lámpara de tungsteno o similar

Con búsqueda en `physical.bulb.type`: ADB Europe 105 (tungsteno-halógeno), Robert Juliat 613SX (T19), Ignition Strip Blinder X (halógena), Martin Mania SCX500 (halógena MR16), más equipos de descarga (HMI, MSD, MSR) que son móviles o seguidores de gama alta, p. ej. Griven Kolorado 4000 (HMI). Los 50 equipos con categoría solo «Dimmer» incluyen LED de teatro con lente (Ignition Teatro LED Spot 100 PC/FR, Varytec LED Theater Spot 100/250, DTS Scena LED 150, Showtec Performer 2500, Hive Wasp/Bumble Bee/Hornet, Cameo TS 100 WW, Chauvet EVE P-100 WW, Fovitec 600XB). Estos sirven como PC/perfil LED, pero no como los convencionales de lámpara.

### Categorías del plano de luces completo

| Categoría | Datos en OFL | Estado |
|---|---|---|
| Elipsoidal / perfil | Source Four LED (5), Robert Juliat 613SX, Robin T1 Profile (móvil), Varytec/Ignition LED teatro | parcial, sobre todo LED; sin Source Four de lámpara ni Altman, Strand, Selecon |
| Fresnel | ninguno encontrado | sin datos |
| PAR | ~12 LED; ninguno de lámpara (PAR 64 CP) | parcial solo LED |
| Scoop / ciclorama | ninguno | sin datos |
| Tira / batten | algunas barras LED (Pixel Bar 44) | LED sí; tira de lámpara no |
| Seguidor | ninguno | sin datos |
| Blinder | 34 (Blinder) | cubierto, sobre todo LED y halógeno |
| Estroboscopio | 66 (Strobe) | cubierto |
| Humo | 18 (Smoke) | cubierto |
| Haze | 17 (Hazer) | cubierto |

Huecos reales: fresnel, scoop, seguidor, y los convencionales de lámpara (elipsoidal, PAR, tira) de los fabricantes de teatro.

## 6. Cómo cubrir los huecos sin inventar cifras

Propuesta: catálogo propio mínimo, `luminarias-teatro.json`, de equipos concretos que no estén en la OFL, con la misma forma que el subconjunto de la OFL, más un campo `source` obligatorio.

Reglas:
1. Cada cifra (dimensiones, peso, potencia, lámpara, ángulo de lente) lleva su `source` con URL de la ficha técnica del fabricante o de una hoja de datos oficial, más fecha de consulta. Sin URL, el campo queda vacío (null) y la interfaz muestra «sin dato»; no se rellena con medias ni estimaciones.
2. El símbolo de cada equipo es el genérico de RP-2 por categoría (elipsoidal, fresnel, PAR, scoop, tira, seguidor); los datos reales solo afectan a tamaño, peso, potencia y lente.
3. Un equipo se añade solo tras leer la ficha y copiar los números. Prueba de revisión: un script que rechace cualquier registro con una cifra sin `source`.
4. Los datos de la OFL conservan su `link.manual` y `productPage` cuando existan; reutilizar esos enlaces como fuente, tras abrirlos, ya sirve de primera lista. Ejemplo ya presente: Robert Juliat 613SX tiene en la propia OFL la ficha `https://www.robertjuliat.com/Product_Specifications/Fiches_EN/Standard/DSEN045_613SX.pdf` (enlace leído en el JSON; no abierto desde esta sesión, sin verificar que siga vivo).
5. Si el usuario necesita un equipo que falta, existe ya la luminaria propia (peso, potencia, tamaño); esa vía no necesita fuente porque el dato es suyo.

Lista de arranque, solo nombres de producto (sin cifras, a rellenar desde la ficha del fabricante; URLs por localizar, sin verificar):
- ETC Source Four 19, 26 y 36 grados, fresnel Source Four, PAR EA.
- Robert Juliat Alexandra (seguidor) y Victor (seguidor), 600SX/613SX ya cubierto.
- Altman 6x9 y 6x12 elipsoidales, Altman PAR 64 y Fresnel 6 pulgadas.
- Strand/Selecon: Pacific y Rama (fresnel o PC), o Selecon SPX; revisar disponibilidad.
- Scoop: modelos de 12 y 16 pulgadas de Altman u otro.

Estos nombres son una propuesta de alcance de memoria, no una verificación de existencia ni de catálogo vigente; la lista definitiva sale de las fichas.

## 7. Decisiones que quedan al usuario

- Si basta con un subconjunto de 25 KB importado en la compilación, o conservar el JSON completo para que cada archivo `.scaena` se abra siempre igual (ya decidido: copia de la definición por elemento usado).
- Qué equipos de teatro entran en el catálogo propio y a qué fabricantes se les piden fichas.
- Si se consulta a la OFL por la licencia expresa de los datos (sección 4).
