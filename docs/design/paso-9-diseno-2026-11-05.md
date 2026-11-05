# Paso 9 · Validadores y avisos

Estado: hecho (2026-11-05). Captura: img/paso-9-avisos.png

## Qué entrega

Las reglas de `validadores-2026-11-02.md` como funciones puras sobre el modelo (`src/validate/rules.ts`), con su motivo en texto, marcas en las filas y en el plano, y un panel global que lleva al elemento. Los avisos nunca impiden exportar.

## Reglas (18)

| Regla | Gravedad | Dónde |
|---|---|---|
| `stereoPairOdd` par estéreo que empieza en canal par | aviso | canal |
| `channelUnnamed` canal sin nombre corto o sin micro (dice cuál falta) | aviso | canal |
| `channelGaps` huecos en la numeración | consejo | lista |
| `danglingSource` canal o salida que apunta a un elemento que ya no está | error | canal, salida |
| `sourceWithoutChannel` elemento que sugiere canales y no tiene ninguno | aviso | elemento |
| `monitorOrder` cuñas no numeradas de izquierda a derecha y de delante atrás | consejo | salida |
| `wedgeMismatch` cuña pedida sin dibujo, o dibujada sin pedir | aviso | salida, elemento |
| `unmarkedSupplier` elemento no estándar sin quién lo aporta | consejo | elemento |
| `outletUnmarked` toma de corriente sin marcar | aviso | elemento |
| `dmxOverlap` misma dirección en el mismo universo | error | elemento |
| `dimmerOverload` dimmer por encima de su máximo | error | dimmer |
| `unitsDuplicated` unidad repetida (la regla «posiciones mal numeradas») | aviso | elemento |
| `phaseBreaker` fase por encima de su magnetotérmico | error | fase |
| `mountOverload` peso por encima de la carga máxima | error | montaje |
| `luminaireMissing` datos que faltan en una luminaria (modelo, montaje, canal) | aviso | elemento |
| `noContact` sin contacto con nombre, teléfono y correo | aviso | documento |
| `noDate` sin fecha de versión | aviso | documento |
| `programOs` programa que no existe para el sistema del ordenador | aviso | elemento |

Interpretaciones que conviene confirmar al revisar:
- «Plano y lista no coinciden» se ha partido en dos: `danglingSource` (error, el dato roto) y `sourceWithoutChannel` (aviso, algo que parece faltar).
- «Posiciones mal numeradas» se entiende como unidades repetidas entre luminarias.
- `dmxOverlap` compara direcciones iniciales: sin el número de canales de DMX de cada modelo no se puede saber la huella; solo salta con la misma dirección.
- «Texto que no cabe en la lista de canales» queda para el paso 11, porque depende de la composición del documento.
- Se añadió el elemento «Toma de corriente» a la biblioteca para que `outletUnmarked` tenga a qué aplicarse.
- Las reglas de luces solo corren con el módulo de Luces activo; las de audio con el de Audio; las de documento con el de Documento.

## Decisiones

1. **El motivo siempre en texto.** Cada aviso tiene su frase en es y en en (`issue.<regla>`); la forma de la marca (círculo, triángulo, cuadrado) y la letra distinguen la gravedad sin depender del color.
2. **Marcas.** En la fila de canales, de salidas y de instrumentos (con la frase como nombre accesible y tooltip) y sobre el elemento en el plano (insignia arriba a la derecha, oculta durante el zoom).
3. **Panel global.** Botón «Avisos N» en la barra superior; diálogo con filtro por gravedad y «Ir al aviso», que abre la vista y selecciona el elemento, el montaje o la pestaña que toca.
4. **Nunca bloquean.** Exportar sigue igual con avisos; el diálogo lo dice.
5. **Fase y magnetotérmico.** La pestaña Eléctrica ganó una columna para el magnetotérmico de cada fase; hasta entonces no había dónde indicarlo.

## Pendiente

Silenciar un aviso concreto (el documento de reglas lo deja abierto), y reglas del flujo de señal (conexión sin destino, tipos incompatibles).

## Pruebas

Una prueba por regla (21 en `rules.test.ts`), una de conjunto (todas las reglas tienen gravedad; sin errores en el paquete de rock) y e2e: diálogo, filtro, «Ir al aviso», marca en fila, exportar con avisos, axe.
