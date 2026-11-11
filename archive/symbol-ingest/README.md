# Symbol ingest (archived 2026-11-08)

How the first 678 symbols were made. This is history; the symbols themselves now live in `symbols/<category>/<id>.svg` and are the only source the app uses. See `docs/design/symbols.md`.

- `symbol-sheets/` — the GPT sheets (PNG, 116 MB). **Not in git** (ignored); kept on the author's machine only.
- `symbol-traces/` — the traced vector paths per sheet (JSON).
- `symbol-manifest.json` — key, sheet, name, size of every kept icon.
- `scripts/` — cut, trace, selection and build scripts. Paths inside them point to the old layout (`assets/…`, `scripts/symbols/…`); move the folders back before running them.

New sheets (67 onwards) are ingested once, written straight to `symbols/<category>/`, and their material is added here.

Round 3 (sheets 67 to 74, 2026-11-08) went through `cut.py` and `trace.py` the same way (sheet 69 needed `--ops "m4+5"` to join the duo) and `scripts/ingest-round3.py` wrote the SVGs to `symbols/` and the new item lines to `src/library/items-icons.ts` directly. It holds the cut-number to item-id table of those sheets.

Round 4 (sheets 75 to 81, 2026-11-11) went through `cut.py` and `trace.py` again, run from a scratch folder with the old layout (`assets/symbol-sheets/`, `.work/symbols/`, `scripts/symbols/`). Hand fixes: the rain machine of sheet 75 was re-cut by hand from the sheet (box 10,528 to 445,992) because its drops are separate small shapes that the cutter drops as noise; sheet 77 left out the rebab bow (cut 13); sheet 80 was traced with `eps 1.3` because the amp grille made the default trace 35 KB. `scripts/ingest-round4.py` holds the cut-number to item-id table and the new item lines; it takes the traces folder as its argument.
