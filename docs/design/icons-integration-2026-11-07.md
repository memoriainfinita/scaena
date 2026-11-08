> **Superseded 2026-11-08:** the data layout below (sheet chunks, `icon-map.ts`, manifest) was replaced by one SVG per item in `symbols/<category>/`; see `symbols.md`. The pipeline now lives in `archive/symbol-ingest/`.

# Icon library integration (2026-11-07)

How the 678 traced icons become library symbols. Decisions already taken with the user are listed as such; the rest are recommendations to be reviewed.

## Provenance

The icons were drawn by GPT (sheets of 8 to 12, see `symbols-gpt-batches-2026-11-07.md`), cut and traced to vector paths with the scripts in `scripts/symbols/`, and are published under the same license as the code (GPL-3.0). The source sheets are not in git (`assets/symbol-sheets/`); the traced paths are (`assets/symbol-traces/`), so the data can be rebuilt without the sheets.

The icons in the viewers reviewed by the user: round-head and drawn-face figures were removed, duplicates were resolved, 23 were redone. The selection is `scripts/symbols/selection.json` (kept ids, drawing-order permutations, icons without a list entry) and the result is `assets/symbol-manifest.json`.

## Decided with the user

- Icons are line drawings (outlines kept as outlines). Silhouettes were tried and rejected.
- Each icon is an upright pictogram. When an element rotates on the plan the icon stays upright and the element keeps a thin footprint outline that rotates with it. Lights are the exception: the icon turns with the aim.
- Left-handed instruments are drawn by flipping the icon (`flipX`).
- Every kept icon becomes a library item; existing item ids do not change (they are stored in users' files).
- People are faceless line-art figures (sheets 56 to 63).

## Data

- `scripts/symbols/build-icons.py` writes `src/library/icons/<sheet>.json` with only the kept icons: `{ "<key>": [w, h, "<path>"] }`, path in the icon's own pixel units, drawn with `fill-rule="evenodd"` and no stroke.
- Each file is a separate chunk (`import.meta.glob`), so nothing loads until needed. All chunks are in the service worker's precache (they are ordinary files of `dist/`), so the app and the PDF export work offline.
- `src/library/icon-map.ts` joins items to icon keys: `ICON_OF[itemId] = iconKey`. Items with no icon keep their drawn top-view symbol, so nothing breaks while the catalogue is extended.
- `loadIcons(keys)` resolves when the chunks for those keys are ready. The plan asks for the icons of the elements it shows, the library panel for the visible items, and the PDF and DXF exports await the icons of the show before building their SVG.

## Drawing

- Per element: the footprint (rectangle `w` by `d` of the item, thin, with the thick front line), then the icon fitted into it keeping its aspect ratio (contain, about 90% of the footprint). Below the existing detail threshold (about 30 px) only the grey box is drawn, as now.
- One path per icon type goes in `<defs>` and each element references it with `<use>`, in the plan and in the PDF SVG, so the DOM and the Typst input stay small.
- To check on Typst: `<use>` and `fill-rule="evenodd"` in its SVG import. If it fails, paths are inlined for the PDF only.
- `printStrokes` rewrites non-scaling strokes; icon paths have no stroke, so they pass through untouched (covered by a test).
- DXF keeps drawing the footprint and the label only, as now.

## Items

- Existing ids map by hand where the icon was renamed or redone (people: `person.standing` to sheet 58, `guitar.electric` to 56-05, and so on). The table is in `scripts/symbols/item-map.json`.
- New ids follow the proposed ids of the sheet lists. `person2.*` and `person3.*` were working prefixes of the GPT iteration: the final prefix is `person.`, with the role after it. Where two variants of a concept were both kept, the second gets the suffix `-2`.
- New categories added to the union: `mic`, `safety`, `site`, `production`, `machinery`, `rigging`, `network`. The rest of the planned groups (conference, world, orchestral, pedals, comms) reuse existing categories (`site`, `drums`/`strings`, `guitar`, `control`). Each category has an `es`/`en` label (`library.cat.*`) and the library panel has a category selector. `safety`, `site`, `production`, `machinery`, `rigging` and `network` count as supplied by the standard in the unmarked-supplier rule.
- `size.h` comes from a per-category default (in `build-items.py`). Sizes `w` by `d` are the centimetres of the sheet lists; eight icons without a list entry have sizes set by hand there. Spanish names are in `scripts/symbols/names_es_1..3.py` (written by Claude, for the user to review). Generated items use `symbol: 'generic'` as a fallback; the icon is what is drawn.
- Ids: normalized proposed id; `person2.*`/`person3.*` become `person.*`; collisions get `-2`, `-3` and a `(2)` in the name. Musicians use layer `audio`, other people `stage`.
- `scripts/symbols/build-items.py` regenerates `items-icons.ts` and `icon-map.ts` from the manifest and `item-map.json`; run `build-manifest.py` and `build-icons.py` first when icons change.
- Items without a real footprint (flat signs, stickers) use their drawn size.

## Order of work

1. Pipeline in the repository (done): scripts, traces, selection, manifest.
2. Vertical slice: the 111 existing items. Render path in the plan, the PDF and the library panel, with tests.
3. The rest of the catalogue (done: 572 generated items, category selector). Pending checks: full e2e in Firefox and Chrome, offline PDF with icons, performance with about 780 items, DXF.
4. Optional PNG images for library and user items (resize to 512 px, re-encode to strip metadata, size caps); the DXF keeps drawing only the box and the label.

## Open points for the user

- Trade dress: the user reviewed the icons on 2026-11-07 and found none that shows a brand, only shapes based on real instruments (Stratocaster-like, Telecaster-like, Precision-like, Leslie, Hammond, Rhodes styles). Nothing removed; the `symbols.ts` rule of no brand shapes stays.
- The icon for `effect.co2` is missing (the CO2 jet was never drawn); that item keeps its top-view symbol.
