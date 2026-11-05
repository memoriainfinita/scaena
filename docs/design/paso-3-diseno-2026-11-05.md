---
created: 2026-11-05
step: 3
status: hecho (primera tanda)
---

# Paso 3 — biblioteca de elementos y símbolos

Código en `src/library/`; 27 pruebas unitarias nuevas (49 en total).

- `types.ts`: elemento de biblioteca (id, versión, categoría, capa por defecto, nombres es/en, etiquetas, tamaño real en mm, peso y potencia, símbolo, canales sugeridos), modelo de luminaria, modelo de audio, región, conector y paquete
- `symbols.ts`: 46 símbolos propios dibujados desde cero en vista cenital, en función del tamaño real (mm), con el frente hacia +y marcado con la línea gruesa; trazo de 1,5 px que no escala con el zoom, relleno blanco, legibles en blanco y negro. Hoja de contactos rasterizada y revisada a ojo: `docs/design/img/simbolos-2026-11-05.png` (se regenera con `simbolos-sheet.mjs`)
- `items.ts`: 49 elementos (batería de 5 piezas y reducida, amplis, teclado, piano, contrabajo, voces, diadema, persona, PA, sub, cuña, in-ear, mesa, stagebox, rack, DI, mesa de DJ, tarima, silla, atril, mesa, flightcase, atril de conferencia, zona de público, FOH, acceso, portátil, mesa de vídeo, pantalla, proyector, telón, escalera, plataforma, 9 tipos de luminaria y 3 efectos). Tamaños típicos; peso y potencia vacíos en los tipos genéricos sin ficha. Búsqueda sin acentos y en los dos idiomas
- `models.ts`: 29 luminarias con la URL de la ficha (las 16 de `luminarias-teatro.md` desglosadas por ángulo, más 4 genéricas marcadas como estimación) y 28 modelos de audio (12 micros con su tipo, 3 DI, 2 in-ear, mesas, stageboxes e inalámbricos). El peso del Source Four Fresnel queda vacío. El fantasma sale del tipo de micro
- `regions.ts`: 15 países más «otra» con tensión por defecto (México, Colombia, Brasil, EE. UU. y Canadá marcados «por confirmar») y los 7 conectores de la lista corta, con Socapex sin corriente
- `packages.ts` y `apply.ts`: los 7 paquetes y `showFromPackage`, que construye un montaje válido con sus elementos en su capa, sus canales (17, 12, 4, 3, 9, 12 y 4) y sus salidas. Solo teatro lleva luces; ningún paquete fija mesa

Decisiones de esta tanda:
- El rock queda en 17 canales: la lista del paquete suma 17, aunque el documento dice «unos 20»
- El hi-hat usa el C414 XLII porque el C451 se omitió; el micro de mesa y el de atril de conferencia usan texto libre o el e 835

Pendiente del paso (no bloquea el 4): símbolos de vista lateral para la sección, más fabricantes de luminarias si se piden, cifras de mesas por completar, importación de la OFL al construir, saneado de SVG propios del usuario.
