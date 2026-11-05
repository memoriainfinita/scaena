---
created: 2026-11-05
step: 1
status: hecho
---

# Paso 1 — repositorio, herramientas y despliegue

Heredado de compositio, con las versiones de su `package.json` (pnpm 11.1.1, Vite 8.3.5, TypeScript 6.0.3, Vitest 5.0.5, Playwright 1.63.0, Preact 11.0.1, `@preact/signals` 2.11.3, valibot 1.5.0).

- Scripts: `dev`, `build` (typecheck más Vite), `preview` en el puerto 4184, `lint`, `test`, `e2e`
- CSP estricta en un `<meta>` (`build/csp.ts`): `script-src 'self' 'wasm-unsafe-eval'` para Typst, `img-src` con `blob:` y `data:`, `worker-src` con `blob:`. Sin cabeceras de aislamiento: Typst no usa hilos
- Playwright solo en Firefox, silenciado, con el tema claro u oscuro por la preferencia del propio Firefox; el proyecto `app-light` repite las pruebas de accesibilidad (`@a11y`)
- CI en GitHub Actions con cada acción fijada a commit; despliegue a Pages al empujar a `main` solo si todo pasa
- Sin service worker todavía: va en el paso 4 con la caché versionada del `.wasm`
- Base relativa (`./`): funciona bajo `/scaena/` y en cualquier ruta

Hecho: lint, 1 prueba unitaria, build y 2 pruebas e2e (axe sin violaciones) pasan en local. La CI no se ha ejecutado: el repositorio no está en GitHub.
