# Publicar scaena

Estado a 2026-11-05: **no publicado**. El repositorio es local (rama `main`, sin remoto). Publicar es una decisión del usuario y no se ha hecho.

## Qué hay preparado

- `.github/workflows/ci.yml`: en cada push o pull request pasa lint, pruebas, compilación, pruebas de navegador en Firefox y la comprobación de estructura del PDF; en un push a `main` sube `dist/` a GitHub Pages con las acciones fijadas a un commit.
- Base relativa (`./`): funciona en `https://usuario.github.io/scaena/` y en cualquier otra ruta.
- Cabecera de seguridad: la política de contenido va en una `<meta>` (Pages no deja poner cabeceras) y el service worker la añade además como cabecera, con `frame-ancestors 'none'`.
- Sin dependencias de servidor ni de terceros en tiempo de ejecución: no hay CDN, fuentes remotas ni analítica.

## Pasos

1. Crear el repositorio en GitHub (público, para Pages gratuito) y subir `main`:
   ```bash
   git remote add origin https://github.com/<usuario>/scaena.git
   git push -u origin main
   ```
   (Según las notas de la máquina, `git push` va fuera del sandbox y con tiempo límite.)
2. En Settings → Pages elegir **GitHub Actions** como origen.
3. Esperar al primer despliegue y abrir la URL.

## Qué comprobar tras el primer despliegue

- Que el service worker se registra y la aplicación abre sin conexión (herramientas de desarrollo → Application).
- **El primer PDF con https real:** la descarga del compilador (28 MB, unos 11 MB con gzip; Pages no ofrece brotli) y su guardado por el service worker. En Firefox con `http://127.0.0.1` está comprobado, con Pages real no.
- Que `typst/<versión>/compiler.wasm` se sirve como `application/wasm`.
- Que Chrome conserva el `.wasm` en la caché del service worker entre visitas (el informe de mediciones encontró que no lo hacía en la caché HTTP).

## Después

- Cada cambio en `main` redespliega. Los usuarios ven un aviso con «Actualizar»; nunca se recarga solo.
- Versión: cambiar `version` en `package.json`, anotar el cambio en `CHANGELOG.md` y regenerar `THIRD-PARTY-NOTICES.md` si cambian las dependencias.
- Pendientes conocidos antes de decir que es «1.0»: probar en un móvil real y en Safari, validación PDF/UA con veraPDF cuando el compilador publique la opción `ua-1`, cirílico y griego en el PDF, y lo que quede en la sección «Pendiente» de `state.md`.
