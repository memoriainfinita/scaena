# scaena — historia

Lo que salió de `state.md` y por qué.

### 2026-10-29 — Imprimir desde el navegador descartado como método de PDF
Se había usado en lumina (diálogo de impresión, sin librería) por rápido y sencillo. El usuario lo descartó para scaena. Además, en la prueba Firefox no escribía el idioma del documento y ni Chrome ni Firefox escribían THead, TBody ni Scope en las tablas. Sustituido por Typst en el navegador (`docs/investigacion.md`).

### 2026-10-29 — QR en el cajetín retirado
La propuesta era un QR que llevara al enlace de la última versión. Sin servidor ni cuentas no hay última versión a la que apuntar: un enlace con los datos en la URL es una instantánea de esa revisión. Retirado del alcance.

### 2026-10-29 — Exportación a mesa fuera del alcance por ahora
El usuario la dejó fuera. Ridermaker la cobra en Pro y Premium (X32, X Air, CL/QL, WING, dLive, Avantis, RIVAGE, Ui12/16). Las columnas del CSV de Yamaha dejaron de hacer falta.

### 2026-10-29 — Propuestas B descartadas
Rider bilingüe, comparar y fusionar versiones, enlace con datos en el fragmento de la URL, importar y exportar CSV y XLSX, modo tablet, plantillas de ejemplo, comprobación visual del PDF y esquema de archivo versionado. Ninguna entra como función de cara al usuario. Consulta en móvil y «looks» por escena con fundidos quedaron fuera aparte.

### 2026-10-29 — PDF/UA-1 sin declarar por ahora
Ni typst.ts 0.7.0 y 0.8.0-rc3 ni typst-wasm 1.0.0 exponen el estándar; solo el código Rust de typst.ts en `main`. El usuario aceptó PDF etiquetado sin declaración. Se activa `ua-1` cuando una versión publicada lo exponga.

### 2026-10-29 — Enlace con datos en la URL descartado
Venía de mi propuesta inicial («Hará» y «Compartir») y quedó aceptado sin que el usuario lo hubiera pedido; el estado se contradecía (las propuestas B ya lo descartaban). Medido: el navegador admite URL muy largas, pero WhatsApp y Telegram cortan en 4096 y Outlook en 8192, y un montaje normal no cabe. Se comparte con `.scaena`, PDF y PNG. Datos en `docs/research/enlace-e-importacion.md`.

### 2026-10-29 — Símbolos propios y catálogo de luminarias de teatro
RP-2 es de USITT (no de ESTA), con copyright de 2006 y sin licencia de reproducción; USITT publicó una guía nueva en 2025. Decidido dibujar los símbolos de cero siguiendo la convención, sin calcar las láminas. La Open Fixture Library (652 equipos, MIT) casi no tiene luminarias de teatro, así que se escribirá un catálogo propio de 20 a 40 fichas con la URL del fabricante en cada cifra, más valores típicos marcados como estimación.

### 2026-10-29 — SVG y Typst medidos con la máquina libre
SVG: con señales, `<use>`, zoom en grupo con `transform`, capa aparte para lo arrastrado y detalle dinámico, 1000 elementos van sin reservas y 3000 son aceptables. Typst: reciclar el worker cada 50 compilaciones contiene la fuga (222 MB frente a 1321); service worker obligatorio por el `.wasm` de 11,1 MB en gzip. Una primera tanda salió contaminada por CPU compartida y se descartó.
