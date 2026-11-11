# Group 3: numbers and units (2026-11-11)

## What was wrong

- Documents wrote decimals with a point in Spanish ("19.13 A"): reports and the PDF turned numbers into text with `String`, while the screen already used `Intl`.
- The count by mount printed " / 250" when the weight was unknown.
- Imperial units were half done: plan dimensions and the scale bar changed, but the inspector, mounts, dialogs, tables, warnings and the PDF stayed in metres and kilograms.
- Print scales were fixed at 1:25, 1:50, 1:100 and 1:200.
- A radio link was a cable with an estimated length.

## Design

1. **One module for units** (`src/model/units.ts`). Everything stays stored in millimetres and kilograms. The module turns stored values into text (`lengthText`, `lengthValue`, `weightValue`, `numberText`) and into the numbers of form fields (`lengthScale`, `weightScale`). `inUnits` rewrites a metric label such as "Height (m)" for the show's units. The inspector, mount table, stage settings, background, connections, custom items, warnings, reports and PDF all use it. In imperial, fields are edited in decimal feet and pounds; texts read feet and inches.
2. **Numbers in the language of the document.** Reports, CSV and PDF write numbers with `Intl` ("19,13" in Spanish, "19.13" in English). The CSV is quoted and comma-separated, so a decimal comma does not break it.
3. **Mount count.** A mount with a capacity and no stated weight reads "— / 250".
4. **Imperial print scales.** An imperial show offers the architectural scales: ½″, ¼″, ⅛″ and 1/16″ to the foot (1:24, 1:48, 1:96, 1:192). The scale is still stored as the N of 1:N. Title block, scale bar and warnings write it in the show's units, and a scale a sheet already has is kept in the list.
5. **Wireless links.** `Connection.wireless` (optional). A wireless link has no length, is not routed (drawn straight and dotted), is not in the cable list and is left out of `cableTooLong`. The Cables column of the lists shows its connector or "Wireless". The theatre, conference and showcase examples mark their headset links.

## Not done

- Files saved before this change keep their headset links as cables; the checkbox in the connection panel turns them into wireless ones. Nothing guesses from the connector text.
- The stage settings dialog edits lengths in the units the show had when it opened; changing the unit there takes effect when applied.
