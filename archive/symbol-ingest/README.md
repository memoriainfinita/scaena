# Symbol ingest (archived 2026-11-08)

How the first 678 symbols were made. This is history; the symbols themselves now live in `symbols/<category>/<id>.svg` and are the only source the app uses. See `docs/design/symbols.md`.

- `symbol-sheets/` — the GPT sheets (PNG, 116 MB). **Not in git** (ignored); kept on the author's machine only.
- `symbol-traces/` — the traced vector paths per sheet (JSON).
- `symbol-manifest.json` — key, sheet, name, size of every kept icon.
- `scripts/` — cut, trace, selection and build scripts. Paths inside them point to the old layout (`assets/…`, `scripts/symbols/…`); move the folders back before running them.

New sheets (67 onwards) are ingested once, written straight to `symbols/<category>/`, and their material is added here.
