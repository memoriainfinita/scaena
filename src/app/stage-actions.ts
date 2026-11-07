// Editing the free-form stage point by point on the plan. Each change is one undo step.
import { signal } from '@preact/signals';
import { insertStagePoint, moveStagePoint, removeStagePoint, toFreeForm } from '../model/stage.ts';
import { session } from './state.ts';

/** True while the points of the stage are shown as handles on the plan. */
export const stageEdit = signal(false);

/** Shows the handles. A rectangular stage first becomes a free-form one with the same four corners. */
export function startStageEdit(): void {
  const s = session.value;
  if (!s) return;
  s.commit(toFreeForm);
  stageEdit.value = true;
}
export const stopStageEdit = (): void => {
  stageEdit.value = false;
};
export const moveStagePointTo = (index: number, x: number, y: number): void => session.value?.commit((show) => moveStagePoint(show, index, x, y));
export const addStagePointAfter = (index: number): void => session.value?.commit((show) => insertStagePoint(show, index));
export const deleteStagePoint = (index: number): void => session.value?.commit((show) => removeStagePoint(show, index));
