# scaena — validadores

Estado: reunidos el 2026-11-02 desde `state.md` y las buenas prácticas de Ridermaker (`docs/investigacion.md`). La gravedad es propuesta, sin confirmar. Cada regla es una función pura sobre el modelo, y el aviso lleva motivo en texto, no solo color (decisión de interfaz 4).

Gravedades: error (el documento sería incorrecto), aviso (probable fallo), consejo (mejora).

## Audio

| Regla | Origen | Gravedad |
|---|---|---|
| Par estéreo que empieza en canal par | Ridermaker, consejo 8 | aviso |
| Canal sin nombre corto ni micro o DI | Ridermaker, consejo 7 | aviso |
| Huecos en la numeración de canales | Ridermaker, consejo 6 | consejo |
| Plano y lista de canales no coinciden | Ridermaker, consejo 5 | error |
| Monitores no numerados de izquierda a derecha y de delante atrás | Ridermaker, consejo 2 | consejo |
| Cuña pedida sin dibujo, o dibujo sin cuña pedida | Ridermaker, consejo 2 | aviso |
| Texto que no cabe en la lista de canales | Ridermaker, bloques de la lista | aviso |
| Elemento no estándar sin marca de quién lo aporta | Ridermaker, consejo 10 | consejo |

## Plano

| Regla | Origen | Gravedad |
|---|---|---|
| Toma de corriente sin marcar | Ridermaker, consejo 3 | aviso |
| Plano no visto desde el público | Ridermaker, consejo 4 | error |
| Plano ilegible en escala de grises | Ridermaker, consejo 1 | consejo |

## Luces y eléctrica

| Regla | Origen | Gravedad |
|---|---|---|
| Patch con direcciones solapadas | state.md, validación al editar | error |
| Circuito o dimmer sobrecargado | state.md, validación al editar | error |
| Posiciones mal numeradas | state.md, validación al editar | aviso |
| Consumo por fase superior al magnetotérmico | state.md, infraestructura eléctrica | error |
| Peso por posición superior a la carga máxima | state.md, carga de truss | error |
| Datos que faltan en una luminaria | state.md, validación al editar | aviso |

## Documento

| Regla | Origen | Gravedad |
|---|---|---|
| Sin contacto técnico con nombre, teléfono y correo | Ridermaker, consejo 10 | aviso |
| Sin fecha de versión | Ridermaker, consejo 11 | aviso |
| Programa que solo existe en otro sistema operativo | acordado el 2026-11-02 | aviso |

## Pendientes

- [PENDIENTE: confirmar gravedades]
- [PENDIENTE: reglas del flujo de señal (conexión sin destino, tipos de señal incompatibles)]
- [PENDIENTE: cómo se silencia un aviso concreto en un montaje]
