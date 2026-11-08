# Symbols

Every library icon is one SVG file: `symbols/<category>/<item id>.svg`.

- The folder is the item's category (`mic`, `light`, `pa`, …); the file name is the library item id, so there is no key, map or coordinate table. Open any file in an editor to see the symbol.
- Each file is a single even-odd `<path>` with `viewBox="0 0 w h"`; the proportions are the drawing's own. The app fits it inside the item's real footprint, so the size on the plan comes from the item (`w`, `d` in `src/library/items*.ts`), not from the SVG.
- An item without a file draws its hand-made top-view symbol.
- `src/library/icons/<category>.json` and `src/library/icon-index.json` are generated from the folders. After adding or editing a file run `pnpm symbols`; a unit test fails if they are out of date.
- A new item that exists for its icon: add the SVG, add its line in `src/library/items-icons.ts` (id, category, names es/en, real size in mm), run `pnpm symbols`. Two items must not share a drawing.
- `docs/design/icons-catalog.md` lists every item and whether it has a symbol: `python scripts/build-catalog.py`.

How the first 678 were produced (GPT sheets, cut and traced) is archived in `archive/symbol-ingest/`; the prompts that worked are in `symbols-gpt-batches-2026-11-07.md` and `symbols-gpt-batches-2026-11-08.md`.
