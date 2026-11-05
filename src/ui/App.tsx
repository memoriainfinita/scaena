import { effect, signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { dialog, session, settings } from '../app/state.ts';
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

export function App() {
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
      } else if (e.key === '?' && !isTyping(e.target) && !dialog.value) {
        dialog.value = 'help';
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const apply = updateReady.value;
  return (
    <>
      {session.value ? <Editor /> : <Start />}
      <Dialogs />
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
