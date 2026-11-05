// The revisions dialog: save the state as a revision, see what changed, restore one, make the update sheet.
import { useState } from 'preact/hooks';
import { compareWithCurrent, restoreRevision, saveCurrentRevision } from '../app/revisions-actions.ts';
import { session } from '../app/state.ts';
import { baseName, saveFile, updateSheetFile } from '../export/exports.ts';
import { t } from '../i18n/index.ts';
import { noChangesText } from '../model/diff.ts';
import { lang } from '../i18n/index.ts';
import type { RevisionMeta } from '../model/schema.ts';
import { Modal } from './Dialogs.tsx';

export function RevisionsDialog({ onClose }: { onClose: () => void }) {
  const s = session.value!;
  const show = s.show.value;
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [diff, setDiff] = useState<{ n: number; lines: string[] } | null>(null);
  const list = [...show.revisions].sort((a, b) => b.number - a.number);

  const guard = async (job: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await job();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    guard(async () => {
      const meta = await saveCurrentRevision(note);
      setNote('');
      setInfo(t('rev.saved', { n: meta.number }));
    });
  const compare = (n: number) =>
    guard(async () => {
      const lines = await compareWithCurrent(n);
      if (lines === null) throw new Error(t('rev.missing'));
      setDiff({ n, lines });
    });
  const restore = (n: number) =>
    guard(async () => {
      if (!(await restoreRevision(n))) throw new Error(t('rev.missing'));
      setInfo(t('rev.restored', { n }));
    });
  const sheet = (r: RevisionMeta) =>
    guard(async () => {
      const f = await updateSheetFile(show, r);
      saveFile(f);
      setInfo(f.name);
    });
  void baseName;

  return (
    <Modal title={t('rev.title')} onClose={onClose}>
      <div class="stack">
        {!s.canKeepRevisions && (
          <p class="warn" role="note">
            <span aria-hidden="true">⚠ </span>
            {t('rev.nolibrary')}
          </p>
        )}
        <form
          class="sub"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label class="field" style="flex:1">
            {t('rev.note')}
            <input class="input" value={note} maxLength={500} onInput={(e) => setNote((e.currentTarget as HTMLInputElement).value)} />
          </label>
          <button type="submit" class="btn primary" disabled={busy || !s.canKeepRevisions} style="align-self:flex-end">
            {t('rev.save')}
          </button>
        </form>
        {busy && (
          <p class="muted" role="status">
            {t('export.working')}
          </p>
        )}
        {info && <p role="status">{info}</p>}
        {error && (
          <p class="warn" role="alert">
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        )}
        {list.length === 0 ? (
          <p class="muted">{t('rev.none')}</p>
        ) : (
          <ul class="issues-list">
            {list.map((r) => (
              <li key={r.number}>
                <div style="flex:1">
                  <strong>
                    {t('rev.number', { n: r.number })} · {r.date}
                  </strong>
                  {r.note && <p>{r.note}</p>}
                  {r.changes.length > 0 && (
                    <ul class="plainlist">
                      {r.changes.map((c, i) => (
                        <li key={i} style="border:0;padding:0">
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  {diff?.n === r.number && (
                    <div class="diff" role="region" aria-label={t('rev.diff', { n: r.number })}>
                      <strong>{t('rev.diff', { n: r.number })}</strong>
                      {diff.lines.length === 0 ? <p>{noChangesText(lang.value)}</p> : <ul class="plainlist">{diff.lines.map((l, i) => <li key={i} style="border:0;padding:0">{l}</li>)}</ul>}
                    </div>
                  )}
                </div>
                <div class="stackS">
                  <button type="button" class="btn" disabled={busy} onClick={() => void compare(r.number)}>
                    {t('rev.compare')}
                  </button>
                  <button type="button" class="btn" disabled={busy} onClick={() => void restore(r.number)}>
                    {t('rev.restore')}
                  </button>
                  <button type="button" class="btn" disabled={busy} onClick={() => void sheet(r)}>
                    {t('rev.sheet')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
