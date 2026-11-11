# Group 1: light plot page and title block

Approved by the user on 2026-11-11, from the audit of 2026-11-09.

## What was missing

The PDF held one plan with every layer. The decision that each report is a preset of layers plus a scale was not built (`ReportConfig` was in the schema and nothing read it), luminaires showed no unit, channel or colour on the plan, and the plan page had no title block.

## What it does

- **Plan pages as reports.** A report of kind `lightPlan` in `show.reports` is one page of the rider: its `title`, `scale` (null fits the page) and `layerPreset` (layer ids). A show with none has one with the defaults: the layers of subject stage, lights, electrical, notes and background. Ids of layers the show no longer has are dropped. Several reports give several pages, so the same plan can be printed as lights only, or lights with the electrical layer. `src/document/plan-reports.ts`.
- **New section `lightPlan`** ("Light plot"), right after `plan`. It comes in on its own when the Lights module is on and there are luminaires, as the other light sections do; it can be switched off like any section. Files saved before have no `lightPlan` reports and keep their sections as they were.
- **`planSvg` takes the layers and the tags per call** (`layerIds`, `fixtureTags`); without them it draws the layers the show has visible, as before. The editor is unchanged.
- **Luminaire tag.** On the light plot every luminaire carries its unit number in a circle and, under it, channel and colour (`12 / L201`), instead of its name. It is placed by the same `placeTexts` as the other labels (a text block with `above`, the height it has over its last line), so it avoids elements and other texts, gets a leader line when it lands far, and can be moved by hand (`labelAt`). A luminaire with no unit shows an en dash.
- **Title block** under every plan page (the stage plan and each light plot): logo, production, venue, author, date, revision, sheet title and scale, from `titleBlock`, `show.date` and `show.revision`. It is a Typst table, so it is text in the PDF. It takes 14 mm of the page height before the scale is fitted, so a plan that used to fit at 1:97 may now fit at 1:107. A scale the user asked for that no longer fits is reported in the warnings, as before.
- **Document view.** With the section on, each page has a group "Light plot N": title, scale and the layers it draws. "Add a light plot page" adds another; "Remove" drops it. Editing the default page writes it into the show.

## Decisions

- A separate section, not several reports inside `plan`: it keeps templates and section order working, and the general plan is not mixed with the light plot.
- The tag shows the unit in a circle and the channel under it, so it is not mistaken for the magic sheet, which puts the channel inside the circle.
- Plan pages are always landscape, as the stage plan already was, so `ReportConfig.landscape` and `columns` are not used by the light plot.

## Not done

- Columns and orientation of the other reports (`ReportConfig.columns`, `landscape`): only the plan pages use a report, with title, scale and layers.
- The title block cells are plain table cells (no header row); the PDF check passes.
- The tag shows nothing about the beam, accessories or wattage.
