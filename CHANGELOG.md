# Changelog

## Unreleased

Changes after 0.1.0 (2026-11-12). The file format is now version 2; version 1 files open and are migrated.

### Added

- **Several desks:** each with its own channel numbers, patch and outputs, a selector in Inputs and Outputs, and one table per desk in the PDF and the reports.
- **Ports:** inputs and outputs of desks, stageboxes, interfaces, network gear, projectors, screens and cameras, filled from the library with typical values (marked as such); cables name the port at each end and carry several channels, stereo pairs, and USB signals; six new warnings. Several cables between the same two elements, drawn side by side, with a tip for identical ones.
- **Equipment view:** elements, connections and video in tables that edit in place, with filters and sorting; a Video section in the PDF; video links carry a format.
- **Inputs:** kind of source (microphone, DI, line, computer or player, other); show notes; a list type (setlist, run of show, programme) by package.
- **Plot:** handles to resize and to turn the selected element; webcam, tripods and selfie stick, and cleaner empty stands (853 symbols).
- **Lights and desks:** accessories and a focus note per instrument (printed in the focus chart); the console of a desk can be linked to its drawing on the plot.
- **Revisions travel:** the `.scaena` file and a duplicate carry the copy of every revision.
- **Saving:** the top bar says what the save is doing (unsaved, saving, saved, error with its reason and a retry, or no local library); the show is saved when the tab is left; a show with a value over a limit of the format is cut when saved and says so; a second tab with the same show is told instead of overwriting the first one; images the show no longer uses are not kept.
- **Error screen:** an interface error shows a page with a copy of the show to download and a reload button, instead of a blank page.
- **Warnings:** 41 rules.

### Fixed

- Space and the arrow keys on a focused button, checkbox or panel edge are no longer taken by the plot; single-character shortcuts act only with focus on the plot (WCAG 2.1.1 and 2.1.4).
- Deleting an element that owns channels renumbers the rest, frees their stereo partner and removes them from the monitor mixes.
- A turned text note is turned in the PDF too.
- Warnings name library elements in the interface language (they were always Spanish).
- The setlist table is headed «N.º», not «Canal»; the circuit and dimmer tables of the PDF say how many instruments and which units, instead of a mislabelled count.
- A focus point sitting over the selected element's own handles can be grabbed; the DXF keeps hidden layers frozen instead of switched on.
- The revision comparison names changes to contacts, schedule, setlist, hospitality, contract, notes, title block and the rest of the document.
- Dragging a luminaire's aim point is one undo step.
- Exported file names follow the language of the show.
- On a free-form stage, the first free spot, the default aim point and a new bar use the real bounds of the stage instead of a stand-in rectangle.
- The unused `view.greyscale` and circuit `dimmerId` fields are gone from the format; files that still carry them open.

## 0.1.0 (2026-11-12)

First public version: the first complete version of 2026-11-05 and everything added since.

### Added since 2026-11-05

- **Plot:** cables go around the elements in right angles (or straight, from the bottom bar), texts keep clear of cables and bars and have a white edge in the PDF, and the editor and the PDF share one scene; labels, mount names and connector texts place themselves so they do not collide, on screen and in the PDF, with a leader line when a label lands far from its element; any element label can be dragged to where you want it; venue DXF import draws ellipses, splines, curved polylines, scaled and mirrored blocks, rotated and aligned text, and leaves out hidden layers and paper space; the symbol legend goes beside the plan when that prints it larger; free-form stage with draggable points, proscenium, reference lines and permanent dimensions; venue background moved with the mouse; plot export to DXF; view toggles for labels, outlines and connection lines; resizable library and inspector panels; elements resized from the inspector; "swap for another of the same kind".
- **Library:** 843 line-art symbols, one SVG per item in `symbols/<category>/`, with a category filter; own layers and own items (SVG cleaned by a closed list); 653 fixtures from the Open Fixture Library with their DMX modes; dragging from the library to the plot; placing an element with suggested channels creates them; typical power for everything that plugs in; datasheet sizes with their source for 120 items, the rest estimated by kind of object (heights included).
- **Sound:** monitor mixes (who each output is for and how much of each channel it asks for), in a grid, the PDF and the outputs report; the patch comes from the cables (input port and lines on each audio cable; what is typed wins and a difference is flagged); Patch and Position columns, cables in the input and instrument lists, number wedges.
- **Lights:** control protocol per universe (DMX, sACN, Art-Net) with its network number and stage output; DMX mode and channels per fixture, overlaps found by range, consecutive addressing, DMX and IP address reports and a document section; aim by dragging with the beam wedge, work notes, equipment count, summary sheet, bar plan, magic sheet with its own layout, rack builder.
- **Production:** schedule counted back from the curfew.
- **Documents:** any number of plan pages, stage plan or light plot, each with its own layers, scale, title and luminaire tags (a tag per luminaire: unit, channel, colour) (unit, channel, colour), and a title block under every plan page; channel list in landscape and in blocks, logo on the cover, own document templates, comparing two revisions, cables report, power table, Greek and Cyrillic in the PDF.
- **Units and numbers:** feet and pounds everywhere in imperial shows (inspector, mounts, dialogs, warnings, tables, PDF) with the architectural print scales; numbers written in the language of the document (decimal comma in Spanish); wireless links, drawn dotted and left out of the cable list and cable lengths.
- **Warnings:** 34 rules (`channelNotCabled`, `outputNotCabled`, `dmxChainLong`, `networkLoop`, `universeRepeated`, `dmxBeyond`, `duplicatePatch`, `connectionMismatch`, `cableTooLong`, `ipDuplicate`, `stageCrossing`, `portTaken`, `portRange`, `patchMismatch`, `cableLinesShort` added); any warning can be muted.
- **Lights as RP-2 symbols:** a view toggle that draws luminaires as top-view outlines on the plot and in the PDF; on in the theatre example; the DXF always uses them.
- **Examples:** a full showcase that uses every feature, checked by a test so it stays complete, with a venue plan, a logo and two saved revisions; the 7 packages rewritten with complete data (cables, PA, desk, power, production, mixes, DMX addresses and universes, IPs); the rock band's keyboard goes through a stereo DI, the hi-hat has a small-diaphragm condenser and the DMX runs as one chain.
- **Interface:** the start screen imports a PDF or DXF as the background of a new show, and the main region is named after the view that is open; app defaults and grid settings; phone in landscape with a view rail.

### First complete version (2026-11-05)

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
