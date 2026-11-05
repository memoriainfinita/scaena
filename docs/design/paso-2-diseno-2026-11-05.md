---
created: 2026-11-05
step: 2
status: hecho
---

# Paso 2 — modelo de datos y formato `.scaena`

Código en `src/model/` y `src/app/storage.ts`; 22 pruebas unitarias.

- `schema.ts`: esquema valibot del montaje (formato 1). Mm, kg y W; posiciones x, y, z; capas con materia; elementos con `computer` y `luminaire` opcionales; canales, salidas, conexiones por tipo de señal, posiciones de montaje, eléctrica, contactos, horario, cajetín, informes, revisiones y ajustes de vista. Los elementos de sala (público, FOH, accesos) son elementos de biblioteca, no una entidad aparte
- `ids.ts`: ids secuenciales por prefijo (`e1`, `ch1`); el contador vive en el montaje
- `migrate.ts`: `loadShow` lleva cualquier archivo al formato actual y lo valida; un archivo de formato más nuevo lanza `UnsupportedFormat` y nunca se adivina. Lista de migraciones vacía mientras solo hay un formato
- `ops.ts`: operaciones puras (añadir, actualizar, mover, quitar con sus canales, salidas y conexiones, módulos)
- `history.ts`: deshacer y rehacer sobre estados inmutables, 200 pasos, gestos agrupados con `group`, `reset` al abrir otro montaje
- `archive.ts`: `.scaena` como zip (fflate 0.8.3) con `show.json` e `images/`; límites de tamaño y de número de archivos y nombres sin `..`
- `revisions.ts`: instantánea gzip de todo el montaje por revisión; `saveRevision` sube el número
- `src/app/storage.ts`: biblioteca local en IndexedDB (montajes, imágenes, revisiones, último abierto) y autosave con espera; un montaje que no se pudo leer se devuelve como error y el autosave se bloquea para no pisarlo

Pendiente para pasos posteriores: los tipos de la biblioteca (`TypeRef`) se resuelven en el paso 3; el estado reactivo con `@preact/signals` se monta en el paso 4 sobre `History`.
