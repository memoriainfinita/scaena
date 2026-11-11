# Group 4: leftovers, record and version (2026-11-11)

- **Start screen.** "Import a PDF or DXF as background" was disabled for good. It now starts an empty show and opens the background dialog. The old tooltip is gone.
- **Leftover texts.** `view.soon` and `export.soon` are removed with the code that was the only user of each: the fallback of `MainView` (all seven views are handled) and the `enabled` flag of the tools (all are enabled). The `.placeholder` style goes too.
- **`state.ts`.** The doc comments of `addFromLibrary` and `activeLayer` were stacked above `Pane`; each is back on what it describes.
- **Main region.** Its accessible name was "Stage plan" in every view. It is now the name of the open view, and the plan keeps "Stage plan".
- **`scripts/live-check.mjs` and `scripts/live-look.mjs`.** They look for "Page 1" with `exact`, so a 10-page or longer PDF no longer matches "Page 10" too.
- **Version.** There was no tag and no release, while the CHANGELOG said 0.1.0 was published on 2026-11-05. The CHANGELOG now has one `0.1.0 (2026-11-11)` section, the first public version: what was added since 2026-11-05, then the first complete version. The tag `v0.1.0` and the GitHub release are made on the commit that carries this, when the user decides to publish.
