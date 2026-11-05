---
created: 2026-11-05
step: 4
status: hecho
lienzo: https://claude.ai/artifact/9F6wmehcaXabPTsqcVQS2J
---

# Paso 4 — armazón de la interfaz

Entrega la aplicación navegable de punta a punta con el montaje real detrás: el plano interactivo es el paso 5, aquí solo hay un dibujo de solo lectura para que el armazón tenga algo que mostrar.

## Alcance

- Estado de la app con señales sobre `History<Show>`: montaje abierto, selección, vista activa, diálogos, ajustes del usuario (tema, idioma, papel, unidades por defecto)
- Pantalla de inicio: paquetes, montaje vacío, recientes (IndexedDB), abrir `.scaena`, importar (deshabilitado hasta el paso 10)
- Editor: barra superior (nombre, guardado, deshacer, rehacer, Exportar), pestañas de vista, barra de herramientas vertical (sin comportamiento todavía), biblioteca con búsqueda y símbolos reales, inspector con Propiedades y capas con mostrar y bloquear, barra de estado
- Ajustes del montaje: módulos, región, papel, unidades
- Menú de exportar: `.scaena` funcional (guardar copia); los demás formatos quedan para el paso 12
- Español e inglés con una sola tabla de claves; temas claro y oscuro según el sistema con selector manual; hoja del plano siempre blanca
- Service worker propio: precaché versionada del shell, CSP también como cabecera, actualización que espera a que el usuario acepte; el `.wasm` de Typst se cachea al primer uso (paso 11)
- Manifiesto de PWA
- Teclado: todo es un `button`, `a` o campo; orden de tabulación del lienzo; Ctrl+Z y Ctrl+Mayús+Z; `?` abre los atajos

## Decisiones

- Tipografía: Inter y JetBrains Mono, como dice la decisión 7 (el lienzo usó IBM Plex por prueba). Cambiar es una línea de CSS
- Sin framework de estilos: un solo CSS con variables
- Al reabrir, entra en el último montaje (decisión 6)
- Los textos de ayuda van en tooltip, no junto a los controles (regla de mykl); el lienzo los mostraba en algunos paneles y aquí se omiten

## Pruebas

- Unitarias: estado (abrir, deshacer, capas), claves de i18n idénticas en los dos idiomas, lógica del service worker
- E2E en Firefox: crear desde un paquete, ver 17 canales en la barra de estado, deshacer, cambiar idioma y tema, exportar `.scaena`, axe en claro y oscuro en inicio y editor

## Hecho (2026-11-05)

Código en `src/app/state.ts`, `src/i18n/`, `src/ui/` y `src/sw/`; 68 pruebas unitarias y 13 de navegador pasan, con axe sin violaciones en claro y oscuro. Capturas en `docs/design/img/paso-4-editor-*.png`.

- Estado: `Session` (historial, autoguardado en IndexedDB, exportar `.scaena`), ajustes en `localStorage` con respaldo si no hay almacenamiento, reabrir el último montaje al arrancar
- Inicio con los 7 paquetes y montaje vacío, recientes, abrir `.scaena` con error visible si el archivo no vale o es de una versión más nueva
- Editor: barra superior, pestañas según los módulos activos, barra de herramientas (solo «Seleccionar» activa), biblioteca con búsqueda sin acentos y símbolos reales, plano de solo lectura con selección por clic y teclado, inspector con etiqueta, quién lo aporta, notas, posición y giro, capas con mostrar y bloquear, vista de entradas como tabla, barra de estado
- Diálogos con foco atrapado, Escape y retorno del foco: ajustes del montaje (módulos, escenario, región con tensión propuesta marcada, papel, unidades, idioma), exportar (`.scaena` funcional, los demás deshabilitados), ajustes de la app (tema e idioma) y atajos
- Service worker con precaché versionada, caché del `.wasm` de Typst al primer uso, CSP como cabecera y actualización que espera a que el usuario acepte; la app carga sin conexión (probado en Firefox)
- Manifiesto de PWA con icono SVG

## Diferencias respecto al lienzo y pendientes

- Tipografía: Inter y JetBrains Mono (decisión 7), no IBM Plex del lienzo
- Revisiones, importar fondo y los demás formatos de exportación quedan deshabilitados con su tooltip hasta sus pasos (10 y 12)
- El plano aún no se arrastra, no hace zoom ni tiene herramientas: es el paso 5
- Las vistas Salidas, Luces, Informes y Documento muestran un aviso de que llegan más adelante
- Sin iconos PNG en el manifiesto: instalar como app en algunos navegadores pide uno; se resuelve en el paso 14
- Pendiente de verificar en Chrome y en el móvil (paso 14)
