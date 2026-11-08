# Plot labels that do not collide

Approved by the user on 2026-11-08. Texts written on the plan covered each other: on the theatre example "Calle izquierda" hid "PC 1" and "Fresnel 2" sat on the connector text "inalámbrico".

## What gets placed

`src/plan/labels.ts`, a pure module with no DOM.

| Text | Natural place | Other slots, in order |
| --- | --- | --- |
| Element label | below the element | above, right, left; the same slots shifted sideways; the same again further out (five more rings) |
| Mount name | left of the mount, at its middle | right of it; above its top end; below its bottom end; then, for a bar, above and below each end, and for an upright, each side at a quarter and three quarters |
| Connector text | above the middle of the line | below it, then to each side; the same at 35, 65, 25, 75, 15 and 85 % of the line; the same again further from it |

Texts cannot be placed on: other texts already placed, or element bodies (every drawn element, textboxes and dimension lines included, and the text of a dimension). An element label ignores a solid that contains its element whole (a drum kit on a riser), otherwise it could never find a free slot. Mount names and connector texts ignore nothing, because elements are drawn over them and would hide them. Slots that leave the printable plan area weigh as much as covering a text, because the PDF clips them.

Two texts side by side prefer more than a word space between them (0.6 em), so that two labels do not read as one phrase. A slot's distance from its natural place only breaks ties: not covering anything comes first.

The first free slot wins. If none is free, the slot with the least weighted overlap wins: a text is never dropped, since a rider that loses information is worse than one with two things touching. The PDF writes every text after every element for the same reason: on a landscape A4 at about 1:110 a full stage has no room to keep each text off the elements, and such a text must show over them, not under.

Order: mount names first (fewest good slots), then element labels (they should keep their natural place), then connector texts (they can slide along the line). Inside each group the order is by id, so the result does not depend on the order of the input and adding an element only moves what it really disturbs.

## Text size

Text is measured by estimate, from a small table of character widths for Inter. Neither unit tests nor the PDF worker have a DOM, and a DOM measurement would make screen and paper disagree.

## Same algorithm, not the same result

Both renderers call the same `plotTexts`, but each passes its own sizes: the editor draws text at a fixed size in plan millimetres, the PDF at a size in paper millimetres divided by the print scale. At a scale where the paper text is larger than the screen text the two can legitimately choose different slots. Each one is free of collisions at its own size. Forcing identical slots would overlap at one of the two sizes.

Each renderer also tells it what it really draws: the editor shows mount names only with the lights layer visible, the PDF always.

## Editor

Placement runs once per change of the show (`useMemo` on `show` and the language), not on every render, and reaches `PlanEl` as two numbers so its `memo` still holds. While dragging, labels travel with their element; placement reruns when the drag is committed. Grid buckets keep each lookup local: 1000 tightly packed elements took about 170 ms on the development machine (2026-11-08).

## Not done

- A manual offset per element. It needs a field in `src/model/schema.ts`, a migration and a handle in the editor; left for later.
- Avoiding connection lines themselves and the bars of mounts. Only connector texts and mount names are avoided.
- Leader lines from a label pushed to an outer ring to its element. In dense plans some labels end up nearer another element than their own (on the 2026-11-08 examples, 4 to 6 per plan on screen, 2 to 5 on paper).
- In the editor labels still sit under elements drawn later, and mount and connector texts under all elements; only the PDF writes texts last.
