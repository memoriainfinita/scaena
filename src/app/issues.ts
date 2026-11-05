// The findings of the validators for the open show, their text, and where each one leads.
import { computed } from '@preact/signals';
import { lang, t, type Key } from '../i18n/index.ts';
import { validate, type Issue, type Severity } from '../validate/rules.ts';
import { lightsTab } from './lights-actions.ts';
import { prodTab } from './production-actions.ts';
import { dialog, selection, session, view } from './state.ts';

/** Recomputed whenever the show changes: every rule is a pure pass over the model. */
export const issues = computed<Issue[]>(() => (session.value ? validate(session.value.show.value) : []));

/** The findings that point at one thing, by `kind:id`. */
export const issuesByRef = computed(() => {
  const map = new Map<string, Issue[]>();
  for (const i of issues.value) {
    const k = `${i.ref.kind}:${i.ref.id}`;
    map.set(k, [...(map.get(k) ?? []), i]);
  }
  return map;
});

const RANK: Record<Severity, number> = { error: 0, warning: 1, tip: 2 };
export const worst = (list: Issue[]): Severity | null => (list.length === 0 ? null : list.reduce((a, i) => (RANK[i.severity] < RANK[a] ? i.severity : a), list[0]!.severity));

/** The finding in words, in the interface language. */
export function issueText(i: Issue): string {
  const key = `issue.${i.rule}${i.rule === 'wedgeMismatch' ? `.${i.vars.side}` : ''}` as Key;
  const items = (i.list ?? []).map((x) => (i.rule === 'programOs' ? t(`os.${x}` as Key) : t(`issue.field.${x}` as Key)));
  const list = new Intl.ListFormat(lang.value, { style: 'long', type: 'conjunction' }).format(items);
  return t(key, { ...i.vars, list });
}

/** Opens the place where the finding can be fixed and selects what it is about. */
export function goToIssue(i: Issue): void {
  const s = session.value;
  if (!s) return;
  const show = s.show.peek();
  const { kind, id } = i.ref;
  if (kind === 'element') {
    view.value = 'plan';
    if (show.elements[id]) selection.value = [id];
  } else if (kind === 'channel') {
    view.value = 'inputs';
    const src = show.channels[id]?.sourceElementId;
    if (src && show.elements[src]) selection.value = [src];
  } else if (kind === 'output') {
    view.value = 'outputs';
    const src = show.outputs[id]?.sourceElementId;
    if (src && show.elements[src]) selection.value = [src];
  } else if (kind === 'mount') {
    view.value = 'lights';
    lightsTab.value = 'mounts';
  } else if (kind === 'dimmer' || kind === 'phase') {
    view.value = 'lights';
    lightsTab.value = 'electrical';
  } else {
    if (id === 'schedule') {
      view.value = 'production';
      prodTab.value = 'schedule';
    } else view.value = id === 'channels' ? 'inputs' : 'document';
  }
  dialog.value = null;
}
