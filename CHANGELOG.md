# Changelog

## Unreleased

- **Plot:** labels, mount names and connector texts place themselves so they do not collide, on screen and in the PDF, with a leader line when a label lands far from its element; any element label can be dragged to where you want it; venue DXF import draws ellipses, splines, curved polylines, scaled and mirrored blocks, rotated and aligned text, and leaves out hidden layers and paper space; the symbol legend goes beside the plan when that prints it larger; free-form stage with draggable points, proscenium, reference lines and permanent dimensions; venue background moved with the mouse; plot export to DXF; view toggles for labels, outlines and connection lines; resizable library and inspector panels; elements resized from the inspector; "swap for another of the same kind".
- **Library:** 775 line-art symbols, one SVG per item in `symbols/<category>/`, with a category filter; own layers and own items (SVG cleaned by a closed list); 653 fixtures from the Open Fixture Library with their DMX modes; dragging from the library to the plot; placing an element with suggested channels creates them; typical power for everything that plugs in; datasheet sizes with their source for the most-used items.
- **Sound:** monitor mixes (who each output is for and how much of each channel it asks for), in a grid, the PDF and the outputs report; the patch comes from the cables (input port and lines on each audio cable; what is typed wins and a difference is flagged); Patch and Position columns, cables in the input and instrument lists, number wedges.
- **Lights:** control protocol per universe (DMX, sACN, Art-Net) with its network number and stage output; DMX mode and channels per fixture, overlaps found by range, consecutive addressing, DMX and IP address reports and a document section; aim by dragging with the beam wedge, work notes, equipment count, summary sheet, bar plan, magic sheet with its own layout, rack builder.
- **Production:** schedule counted back from the curfew.
- **Documents:** channel list in landscape and in blocks, logo on the cover, own document templates, comparing two revisions, cables report, power table, Greek and Cyrillic in the PDF.
- **Warnings:** 34 rules (`channelNotCabled`, `outputNotCabled`, `dmxChainLong`, `networkLoop`, `universeRepeated`, `dmxBeyond`, `duplicatePatch`, `connectionMismatch`, `cableTooLong`, `ipDuplicate`, `stageCrossing`, `portTaken`, `portRange`, `patchMismatch`, `cableLinesShort` added); any warning can be muted.
- **Lights as RP-2 symbols:** a view toggle that draws luminaires as top-view outlines on the plot and in the PDF; on in the theatre example; the DXF always uses them.
- **Examples:** a full showcase that uses every feature, checked by a test so it stays complete, with a venue plan, a logo and two saved revisions; the 7 packages rewritten with complete data (cables, PA, desk, power, production, mixes, DMX addresses and universes, IPs); the rock band's keyboard goes through a stereo DI, the hi-hat has a small-diaphragm condenser and the DMX runs as one chain.
- **Interface:** app defaults and grid settings; phone in landscape with a view rail.

## 0.1.0 (published 2026-11-05)

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
