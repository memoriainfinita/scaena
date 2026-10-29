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
