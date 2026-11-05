import { issuesByRef, issueText, worst } from '../app/issues.ts';
import { t, type Key } from '../i18n/index.ts';

/** A small badge for a row: the shape and the letter differ by severity, and the reason is its name and tooltip. */
export function IssueMark({ refKey }: { refKey: string }) {
  const list = issuesByRef.value.get(refKey);
  if (!list || list.length === 0) return null;
  const sev = worst(list)!;
  const text = list.map(issueText).join(' ');
  return (
    <span class={`imark ${sev}`} role="img" aria-label={`${t(`severity.${sev}` as Key)}: ${text}`} title={text}>
      {sev === 'tip' ? 'i' : '!'}
    </span>
  );
}
