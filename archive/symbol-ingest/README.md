# Symbol ingest (archived 2026-11-08)

How the first 678 symbols were made. This is history; the symbols themselves now live in `symbols/<category>/<id>.svg` and are the only source the app uses. See `docs/design/symbols.md`.

- `symbol-sheets/` — the GPT sheets (PNG, 116 MB). **Not in git** (ignored); kept on the author's machine only.
- `symbol-traces/` — the traced vector paths per sheet (JSON).
- `symbol-manifest.json` — key, sheet, name, size of every kept icon.
- `scripts/` — cut, trace, selection and build scripts. Paths inside them point to the old layout (`assets/…`, `scripts/symbols/…`); move the folders back before running them.

New sheets (67 onwards) are ingested once, written straight to `symbols/<category>/`, and their material is added here.

Round 3 (sheets 67 to 74, 2026-11-08) went through `cut.py` and `trace.py` the same way (sheet 69 needed `--ops "m4+5"` to join the duo) and `scripts/ingest-round3.py` wrote the SVGs to `symbols/` and the new item lines to `src/library/items-icons.ts` directly. It holds the cut-number to item-id table of those sheets.
