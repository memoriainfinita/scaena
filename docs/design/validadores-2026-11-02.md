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

Retiradas el 2026-11-02 (aceptado por el usuario):
- «Plano no visto desde el público»: el plano se dibuja siempre desde el público, la regla no puede fallar
- «Plano ilegible en escala de grises»: pasa a ser la vista previa en grises, que el usuario mira a mano (ya aceptada)

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

- Gravedades aceptadas por el usuario el 2026-11-02 ("ok" a la propuesta, con las dos retiradas arriba)
- Reglas del flujo de señal: `connectionMismatch` (grupo C, `grupo-c-2026-11-06.md`)
- Silenciar un aviso concreto: lista `muted` del montaje (grupo C)

## Después de construirlo

Implementados el 2026-11-05 en `src/validate/rules.ts`: 18 reglas, cada una con su prueba (el detalle de cada una, las interpretaciones que conviene confirmar y lo que quedó fuera está en `paso-9-diseno-2026-11-05.md`). «Texto que no cabe» se resolvió como aviso de palabras demasiado largas en el panel del documento (paso 11). Se añadió una regla, `timeFormat` (hora mal escrita), en el paso 13. El grupo C (2026-11-06) añadió `duplicatePatch`, `connectionMismatch`, `cableTooLong` e `ipDuplicate` y el silenciado de avisos. En total, 23 reglas en `src/validate/rules.ts`.
