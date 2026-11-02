# Guía USITT 2025, sección 4: documentación del sistema de control

Fecha: 2026-11-02. Leída la sección 4 del PDF de la guía (páginas 31 a 38 del documento), descargado en esta sesión de https://cdn.prod.website-files.com/6837b6c2b0e0e207eec16acf/6968033f34d5c0cd53b56c6c_USITT%20-%20Lighting%20Documentation%20Recommended%20Practice%20(5)-compressed.pdf. Solo texto; las figuras no se rasterizaron. Las subsecciones 4.5 a 4.7 (listas de dispositivos, de direcciones IP, de puertos, paneles, alzado de racks) no se leyeron.

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

## Efecto en scaena

Ver `docs/design/modelo-2026-10-29.md`, entidad Conexión de señal. Propuestas pendientes de aceptación, no aplicadas:
- [PENDIENTE: puertos numerados por elemento]
- [PENDIENTE: ID de cable, tipo de conector, longitud, propósito y universo o VLAN en la conexión]
- [PENDIENTE: zonas con nombre y tramo desconocido como nube en el diagrama]
- [PENDIENTE: dirección IP, universo y dirección de inicio en los elementos de control]
- Coincide con lo aceptado: el color no sustituye a la etiqueta o al trazo (flujo de señal con color y trazo distintos por tipo)
