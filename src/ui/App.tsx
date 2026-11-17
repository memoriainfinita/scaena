import { effect, signal } from '@preact/signals';
import { useEffect, useErrorBoundary } from 'preact/hooks';
import { dialog, session, settings } from '../app/state.ts';
import { baseName, saveFile } from '../export/exports.ts';
import { t } from '../i18n/index.ts';
import { Dialogs } from './Dialogs.tsx';
import { Editor } from './Editor.tsx';
import { Start } from './Start.tsx';

/** Set by the service worker registration when a new version is waiting. */
export const updateReady = signal<(() => void) | null>(null);

// Theme: the system's unless the user chose one.
effect(() => {
  const theme = settings.value.theme;
  if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = theme;
});

const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/** What the person sees when the interface throws: the show is in the local library, and a copy can be taken out. */
function Crashed({ error }: { error: unknown }) {
  const s = session.value;
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const copy = () => {
    try {
      if (s) saveFile({ name: `${baseName(s.show.value.name)}.scaena`, bytes: s.toFile(), mime: 'application/zip' });
    } catch {
      // The copy kept in this browser is untouched; the reload below opens it.
    }
  };
  return (
    <main id="main" class="pad" tabindex={-1}>
      <div role="alert">
        <h1>{t('error.title')}</h1>
        <p>{t('error.body')}</p>
      </div>
      <div class="row">
        {s && (
          <button type="button" class="btn" onClick={copy}>
            {t('error.download')}
          </button>
        )}
        <button type="button" class="btn primary" onClick={() => location.reload()}>
          {t('error.reload')}
        </button>
      </div>
      <details>
        <summary>{t('error.detail')}</summary>
        <pre>{detail}</pre>
      </details>
    </main>
  );
}

export function App() {
  const [error] = useErrorBoundary();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = session.value;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !isTyping(e.target) && s && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
      } else if (mod && !isTyping(e.target) && s && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        s.redo();
      } else if (e.key === '?' && !isTyping(e.target) && !dialog.value && !(e.target instanceof Element && e.target.closest('button, a[href], summary, [role="tab"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="slider"], [role="radio"], [role="option"], [role="listbox"]'))) {
        // WCAG 2.1.4: a single-character shortcut is not active while a control has focus (the menu has a button for the same help).
        dialog.value = 'help';
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const apply = updateReady.value;
  if (error) return <Crashed error={error} />;
  return (
    <>
      {session.value ? <Editor /> : <Start />}
      <Dialogs />
      {session.value && session.value.trimmed.value > 0 && (
        <div class="toast upper" role="status">
          <span>{t('notice.trimmed', { n: session.value.trimmed.value })}</span>
          <button type="button" class="btn" onClick={() => (session.value!.trimmed.value = 0)}>
            {t('notice.ok')}
          </button>
        </div>
      )}
      {apply && (
        <div class="toast" role="status">
          <span>{t('update.available')}</span>
          <button type="button" class="btn primary" onClick={apply}>
            {t('update.apply')}
          </button>
        </div>
      )}
    </>
  );
}
