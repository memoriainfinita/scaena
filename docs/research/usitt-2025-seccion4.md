# Guía USITT 2025, sección 4: documentación del sistema de control

Fecha: 2026-11-02. Leída la sección 4 del PDF de la guía (páginas 31 a 38 del documento), descargado en esta sesión de https://cdn.prod.website-files.com/6837b6c2b0e0e207eec16acf/6968033f34d5c0cd53b56c6c_USITT%20-%20Lighting%20Documentation%20Recommended%20Practice%20(5)-compressed.pdf. Solo texto; las figuras no se rasterizaron. Las subsecciones 4.5 a 4.8 se leyeron el 2026-11-08 (páginas 49 a 59 del PDF, descargado de nuevo de la misma URL).

## Qué documentar (4.2.1)

- Dispositivos de control: mesas de luces, servidores de medios, ordenadores, controladores arquitectónicos
- Equipos controlados: luminarias y efectos que necesitan señal de control
- Infraestructura: dimmers, paneles de relés, drivers LED, racks, conmutadores, routers, hubs, paneles de parcheo, puntos de acceso inalámbricos, pasarelas y nodos DMX, splitters, transmisores DMX inalámbricos, tomas Ethernet y DMX
- Control por DMX512-A, Ethernet, inalámbrico, MIDI y timecode SMPTE

## Diagrama de sistema (4.4)

- Al menos un diagrama de sistema en la documentación
- Sin fondo de arquitectura ni escenografía
- Dispositivos agrupados por ubicación (cabina, lado izquierdo, lado derecho), separados por líneas finas discontinuas o encerrados en formas, cada zona con nombre
- Un tramo desconocido se dibuja como una nube etiquetada
- Se divide en varios dibujos si no cabe en una hoja; puntos de corte lógicos: salas o plantas, paso de red permanente a red del montaje, cambio de tecnología (DMX a Ethernet), paso de la red a las luminarias
- Las luminarias pueden ir en un diagrama aparte, en orden de conexión, con terminador al final de una línea DMX

## Símbolos del diagrama (4.4.2)

- Los puertos de entrada y salida se muestran con número o gráfico cuando hay más de uno, y coinciden con los del aparato real
- Distintos tipos de puerto llevan etiqueta o gráfico distinto
- Los paneles de parcheo permiten conexiones por ambos lados
- Un aparato con puertos delante y detrás puede mostrar las dos vistas
- No hace falta mostrar los puertos con un solo puerto o con cableado fijo en una caja

## Campos obligatorios por símbolo (4.4.2.1)

- Identificador del dispositivo
- Fabricante y modelo, o nombre descriptivo (por ejemplo «pasarela DMX de 2 puertos»)
- Direcciones: DMX512-A con universo y dirección de inicio; IPv4 con dirección y máscara (admite notación CIDR); IPv6 con dirección y prefijo

## Cables (4.4.3)

- Líneas que llegan en ángulo recto al perímetro del símbolo, más finas que las del símbolo, con esquinas redondeadas opcionales
- Cruces en ángulo recto, con salto semicircular o interrupción de línea
- Cada tipo de cable se identifica con etiqueta o tipo de línea; el color puede añadirse pero no sustituirlos; cada tipo con ejemplo y definición en la leyenda
- Información opcional: número de cable, tipo de conector, longitud, propósito especial («respaldo», «troncal»), VLAN, universo DMX o protocolo, especificaciones, origen y destino, número de puerto

## Listas de dispositivos (4.5)

- Al menos una lista de dispositivos junto al diagrama de sistema; mínimo: columna de ID del dispositivo y columna de fabricante y modelo o nombre descriptivo
- Tipos habituales: lista de dispositivos (ID y ubicación), lista de direcciones IP (4.5.2), lista de control de luminarias (4.5.3), lista de paneles de parcheo (4.5.4), lista de puertos de cada switch (4.5.5) y lista de paneles de potencia (4.5.7)
- Lista de control de luminarias (4.5.3): posición y número de unidad, tipo de instrumento y canal de control; opcionales: modo o personalidad con el número de canales DMX entre paréntesis, dirección de inicio, universo, protocolo (DMX, sACN, Art-Net), máscara de subred, método de asignación de IP, tipo de cable, VLAN, sincronía, prioridad y dirección de puerto Art-Net
- Campos por tipo de equipo (4.5.6): para todos, ID, tipo o nombre, fabricante y modelo, número de serie y ubicación; para IP, nombre de host, configuración (DHCP, estática, automática), dirección, máscara, puerta de enlace y MAC; además routers, switches (puertos, VLAN, enlaces, fibra o cobre), Wi-Fi (SSID, canal, contraseñas entregadas cifradas) y DMX inalámbrico (TX o RX, universo, frecuencia)

## Control junto al diseño de luces (4.6)

- En sistemas pequeños, la documentación de control puede ir en el plano de luces, la sección, el instrument schedule y el channel hookup
- Los equipos de red en o junto a una posición de luces (tomas de red, pasarelas DMX, splitters, switches) van en el plano con su ID; si no van en la vara, con una nota de dónde están («en pared», «sobre la eléctrica»); los remotos, con un símbolo de llamada con ID y ubicación
- Los equipos de red colgados en una vara llevan ID, no número de instrumento, y no van en el instrument schedule
- En el instrument schedule y el channel hookup cabe añadir el modo de la luminaria y su huella DMX en el nombre o en una columna

## Dibujos de detalle (4.7) y archivos de configuración (4.8)

- Alzado de rack (4.7.1): unidades de rack numeradas como en el rack real, o desde 1 arriba si no lo están; equipos como rectángulos del tamaño de sus unidades o en alzado; etiqueta dentro o al lado; siempre el ID; nombre y número del rack y de la sala; varios racks en una sala, numerados de izquierda a derecha mirando el frente
- Cajas DIN (4.7.2) y detalle de montaje de un equipo (4.7.3) cuando hagan falta
- Copias de los archivos de configuración de cada equipo de red, con una lista de cuál es el vigente (4.8)

## Comparado con scaena (2026-11-08)

- Ya cubierto: IP del elemento (`ip`), universo y dirección de cada luminaria, conector y longitud de cada conexión, constructor de racks contado desde arriba (como 4.7.1), channel hookup e instrument schedule
- Falta, como propuesta del 2026-11-08 sin aceptar: lista de direcciones IP (informe con elemento, función e IP, sacada de los elementos que la tienen); modo DMX y número de canales de cada luminaria, como columna en el instrument schedule y el hookup (4.5.3 y 4.6.2); protocolo de control por luminaria o universo (DMX, sACN, Art-Net); nombre del rack en el alzado
- Fuera, por ser de instalación fija y no de un rider: paneles de parcheo, listas de puertos de switch, VLAN, routers, Wi-Fi y contraseñas, cajas DIN, archivos de configuración

## Efecto en scaena

Ver `docs/design/modelo-2026-10-29.md`, entidad Conexión de señal. Propuestas pendientes de aceptación, no aplicadas:
- [PENDIENTE: puertos numerados por elemento]
- Conector y longitud en la conexión: hechos (grupo C y longitud estimada del 2026-11-08). [PENDIENTE: ID de cable, propósito y universo o VLAN en la conexión]
- [PENDIENTE: zonas con nombre y tramo desconocido como nube en el diagrama]
- Dirección IP en los elementos y universo y dirección de inicio en las luminarias: hechos (grupo C y paso 8)
- Coincide con lo aceptado: el color no sustituye a la etiqueta o al trazo (flujo de señal con color y trazo distintos por tipo)
