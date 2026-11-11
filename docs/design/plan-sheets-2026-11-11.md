# Plan sheets (2026-11-11)

A rider can hold any number of plan pages. Each page is a report (`ReportConfig`) with its own title, scale, layers and luminaire-tag checkbox, so the plan can be split by category (sound, lights, power) or combined.

## Model

- Two kinds use the same mechanism: `plan` (stage plan) and `lightPlan` (light plot). `ReportConfig.tags` is new and optional; unset takes the default of the kind (`lightPlan` tags luminaires, `plan` does not).
- Defaults apply when a sheet names no layers: `plan` draws the layers visible in the editor, `lightPlan` the stage, lights, electrical, notes and background layers.
- A show with no reports of a kind has one implicit sheet. For `plan` it carries `document.planScale`, so files made before this change print the same page. Editing or adding a sheet writes the implicit one out first. Once a show has `plan` reports, `document.planScale` is no longer read; the field stays in the schema for old files.

## Document

- Sheets print where their section is (`plan`, `lightPlan`); they are not ordered freely between sections.
- Each sheet is a landscape page with its title block and, when it does not fit, a legend page. The legend lists only the symbols of the layers the sheet draws.
- Without a title, the heading is the name of the kind, numbered from the second sheet on ("Plano del escenario", "Plano del escenario 2").
- Files in the Typst bundle are `/<kind>-<n>.svg` and `/<kind>-<n>-legend.svg`. The scale warning is emitted per sheet.

## Interface

One `PlanSheets` panel serves both sections: a group per sheet (title, scale, tags, layers, remove) and an add button. It replaces the single scale select and the light-plot-only panel.
