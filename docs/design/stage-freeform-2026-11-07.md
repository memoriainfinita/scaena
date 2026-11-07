# Free-form stage: points on the plan, reference lines and the proscenium opening (2026-11-07)

Closes three gaps noted on 2026-11-05: a free-form stage could only be edited as text, had no reference lines, and the side section did not draw the proscenium opening.

## Decisions

- **One frame for every shape.** `stageFrame(show)` (in `src/model/stage.ts`) gives `x0`, `x1`, `upstage`, `downstage`, `width`, `centre` and `opening` for a rectangle or a free-form plan. The plaster line goes along the lowest side (`downstage`, the largest y), the centre line through the middle of the bounding width, and the proscenium walls around that middle. The plan, the PDF drawing and the side section all read it, so a rectangle draws exactly as before.
- **Proscenium opening in the free-form shape.** `prosceniumWidth` (nullable) moved to the polygon variant of the stage shape. Old files without it open with `null`. Changing the points trims the opening to the new width; this also holds when the settings dialog is applied.
- **Opening height.** `stage.prosceniumHeight` (nullable, not negative, millimetres above the deck) is drawn in the side section as a wall from the opening up and a tick with the height, at the downstage edge. It follows the proscenium reference line: switching the line off hides it.
- **Edit on the plan.** A button in the inspector (nothing selected) turns the handles on; a rectangle first becomes a free-form plan with its four corners (one undo step). Each point has a handle, each side a small "+". Dragging snaps to the grid (Alt turns that off); the stage follows the pointer while dragging and the change is one undo step on release. Handles are focusable (`tabindex` in lowercase: Preact writes `tabIndex` on an SVG element as an attribute with capitals, which does not focus): arrows move by a grid step (Shift: ten), Delete removes (three points minimum), Enter on a "+" adds. Escape ends editing. A free-form plan has between 3 and 60 points, whole millimetres.
- **Size of the handles.** 28 px across (the "+" 24 px), kept at any zoom, for the 24 px minimum target of WCAG 2.2.

## Where

`src/model/stage.ts` (+ `stage.test.ts`), `src/app/stage-actions.ts`, `src/ui/PlanView.tsx` (`StageHandles`, the `vertex` interaction, `vertexDrag`), `src/ui/Editor.tsx` (button), `src/ui/Dialogs.tsx` (fields), `src/ui/Lights.tsx` (section), `src/document/plan-svg.ts`, `src/app/state.ts` (`stageShape`).

## Left out

No check that the plan does not cross itself, and no editing of a rectangle's corners without making it free-form first.
