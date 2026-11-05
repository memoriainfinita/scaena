# Cierre del grupo B: magic sheet con disposición propia y plan de varas

Origen: `modelo-2026-10-29.md:145` («Magic sheet, con disposición propia, independiente del plano»). Revisión del 2026-11-05: el magic sheet construido copiaba las posiciones del plano y no había pruebas del plan de varas más allá de una.

## Magic sheet

- `show.magicLayout`: registro `id de luminaria -> {x, y}` en milímetros, vacío por defecto. Sin entrada, el instrumento usa su posición del plano.
- Con alguna entrada, el dibujo omite las líneas y nombres de las posiciones de colgado (ya no corresponden a donde se ven los instrumentos). El contorno del escenario se mantiene.
- Pestaña Magic sheet: cada instrumento es un botón enfocable. Se arrastra con el ratón o se mueve con flechas (100 mm; Mayús 500 mm; Alt 20 mm). Cada movimiento es un paso de deshacer. Posiciones redondeadas a 10 mm.
- Botón «Restablecer disposición», desactivado si no hay entradas.
- El PDF usa la misma función y por tanto la misma disposición.
- Las entradas de luminarias borradas se ignoran al dibujar.

## Plan de varas

- Orden dentro de una posición: de izquierda a derecha visto desde el público si la posición es horizontal; de arriba abajo del plano si es más vertical que horizontal (torres laterales).
- Pruebas: totales de peso y potencia, orden, filas del informe, y e2e del informe en la pestaña Informes.
