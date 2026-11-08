# Changelog

## Unreleased

- **Plot:** free-form stage with draggable points, proscenium, reference lines and permanent dimensions; venue background moved with the mouse; plot export to DXF; view toggles for labels, outlines and connection lines; resizable library and inspector panels; elements resized from the inspector; "swap for another of the same kind".
- **Library:** 775 line-art symbols, one SVG per item in `symbols/<category>/`, with a category filter; own layers and own items (SVG cleaned by a closed list); 652 fixtures from the Open Fixture Library; dragging from the library to the plot; placing an element with suggested channels creates them; typical power for everything that plugs in.
- **Sound:** Patch and Position columns, cables in the input and instrument lists, number wedges.
- **Lights:** aim by dragging with the beam wedge, work notes, equipment count, summary sheet, bar plan, magic sheet with its own layout, rack builder.
- **Production:** schedule counted back from the curfew.
- **Documents:** channel list in landscape and in blocks, logo on the cover, own document templates, comparing two revisions, cables report, power table, Greek and Cyrillic in the PDF.
- **Warnings:** 23 rules (`duplicatePatch`, `connectionMismatch`, `cableTooLong`, `ipDuplicate` added); any warning can be muted.
- **Examples:** the 7 packages rewritten with complete data (cables, PA, desk, power, production).
- **Interface:** app defaults and grid settings; phone in landscape with a view rail.

First complete version.

- **Plot:** interactive 2D plan (camera, selection, drag with grid snap, align and distribute, groups, layers with dim and lock, measure, text), cables between elements, venue plan background from PDF or DXF with two-point calibration.
- **Library:** 48 symbols drawn for scaena, 29 lighting models and 28 audio models with sources, 7 show packages, 16 electrical regions, 62 programs.
- **Sound:** inputs and outputs edited in place, stereo pairs, phantom power by microphone type, order by instrument, signal flow.
- **Lights:** instruments, mounts, numbering, circuits, dimmers and phases with limits, side section.
- **Production:** setlist, day and build schedules, hospitality, contract, day sheet.
- **Documents:** rider PDF compiled in the browser with Typst (tagged, fonts embedded, print scale with scale bar), 9 reports with CSV, plot as PDF, SVG and PNG, input list as text.
- **Revisions** with comparison, restore and a one-page update sheet; local library with duplicates and own templates.
- **Warnings:** 18 validation rules with their reason in words, marks on rows and the plot, never blocking.
- **Interface:** Spanish and English, light and dark, keyboard access (skip link, Tab through plot elements), works on a phone (bottom tabs, sheets, two-finger gestures), installable, works offline.
- **Quality:** unit tests, Firefox end-to-end tests (also phone-sized and Chrome), axe on every view and dialog in both themes, a minimal structure check of the generated PDF in CI.
