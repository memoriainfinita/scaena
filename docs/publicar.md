# Publicar scaena

Estado a 2026-11-05: **publicado** en https://memoriainfinita.github.io/scaena/ (repositorio público https://github.com/memoriainfinita/scaena, Pages desde GitHub Actions).

## Cómo está montado

- `.github/workflows/ci.yml`: en cada push o pull request pasa lint, pruebas, compilación, pruebas de navegador en Firefox (escritorio, tema claro y ventana de teléfono) y la comprobación de estructura del PDF; en un push a `main` sube `dist/` a Pages con las acciones fijadas a un commit. También se puede lanzar a mano (`workflow_dispatch`), pero entonces **no despliega**: el despliegue exige un push.
- Un push que solo toca `**.md` o `docs/**` no lanza la CI (y un commit vacío tampoco). Para redesplegar hace falta cambiar algo que no sea documentación.
- Base relativa (`./`): funciona bajo `/scaena/` y en cualquier otra ruta.
- Cabecera de seguridad: la política de contenido va en una `<meta>` (Pages no deja poner cabeceras) y el service worker la añade además como cabecera, con `frame-ancestors 'none'`.
- Sin CDN, fuentes remotas ni analítica.

## Lo que se comprobó con el sitio real

`node scripts/live-check.mjs` (Firefox, silenciado): abre un montaje, genera el PDF y lo genera otra vez sin conexión. El 2026-11-05: primer PDF en 4,4 s, sin conexión en 2,4 s, sin errores de consola. El compilador (`typst/0.7.0/compiler.wasm`, 28,3 MB) se sirve como `application/wasm` con `Cache-Control: max-age=600`.

Además, `node scripts/live-sweep.mjs` recorre los 7 paquetes en español e inglés con todas sus vistas: sin errores de consola, sin peticiones fallidas ni textos de un idioma en el otro (2026-11-05). `node scripts/live-look.mjs` saca capturas para mirarlas. El repositorio tiene descripción, enlace a la web y temas, y no contiene datos personales (los commits van con el correo anónimo de GitHub).

## Incidencias del primer despliegue

- La primera ejecución de la CI falló en una prueba de móvil que usaba el toque de Playwright: en Firefox de Linux no genera los mismos eventos de puntero. Ahora la prueba envía los eventos directamente.
- Los dos primeros despliegues a Pages terminaron en «error» o «cancelled» sin descripción (el primero se quedó diez minutos en `deploy-pages`). Lo resolvió un push nuevo; no se ha vuelto a ver.

## Después

- Cada cambio en `main` redespliega. Los usuarios ven un aviso con «Actualizar»; nunca se recarga solo.
- Versión: cambiar `version` en `package.json`, anotar el cambio en `CHANGELOG.md` y regenerar `THIRD-PARTY-NOTICES.md` si cambian las dependencias.
- Sin comprobar todavía: Chrome conservando el `.wasm` entre visitas con el sitio real, un móvil real y Safari.
- Pendientes antes de decir «1.0»: PDF/UA con veraPDF cuando el compilador publique `ua-1`, cirílico y griego en el PDF, y lo que quede en el TODO de `state.md`.
