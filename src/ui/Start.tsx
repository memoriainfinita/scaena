import { useEffect, useRef } from 'preact/hooks';
import { openFileBytes, openStored, recents, refreshRecents, startEmpty, startError, startFromPackage, dialog } from '../app/state.ts';
import { lang, t } from '../i18n/index.ts';
import { PACKAGES } from '../library/packages.ts';
import type { Key } from '../i18n/index.ts';
import { Logo } from './icons.tsx';

export function Start() {
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void refreshRecents();
  }, []);

  const onFile = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    openFileBytes(new Uint8Array(await file.arrayBuffer()));
  };

  const err = startError.value;
  return (
    <div class="start">
      <header class="start-bar">
        <span class="logo">
          <Logo size={26} />
          {t('app.name')}
        </span>
        <span class="grow" />
        <span class="muted">{t('start.local')}</span>
        <button class="btn" type="button" onClick={() => (dialog.value = 'app')}>
          {t('top.app')}
        </button>
      </header>
      <main class="start-main">
        <section aria-labelledby="start-title">
          <h1 id="start-title">{t('start.title')}</h1>
          <p class="muted" style="font-size:15px;margin:0">
            {t('start.intro')}
          </p>
          <div class="pkg-grid">
            {PACKAGES.map((p) => (
              <button key={p.id} type="button" class="pkg" onClick={() => startFromPackage(p.id, t(`pkg.${p.id}` as Key))}>
                <strong>{t(`pkg.${p.id}` as Key)}</strong>
                <span class="muted">{p.description[lang.value]}</span>
                <span class="mods">{p.modules.map((m) => t(`module.${m}` as Key)).join(', ')}</span>
              </button>
            ))}
            <button type="button" class="pkg dashed" onClick={() => startEmpty(t('top.untitled'))}>
              <strong>{t('start.empty')}</strong>
              <span class="muted">{t('start.empty.text')}</span>
            </button>
          </div>
        </section>
        <aside>
          <div class="side-card">
            <h2>{t('start.recent')}</h2>
            {recents.value.length === 0 ? (
              <span class="muted">{t('start.recent.none')}</span>
            ) : (
              recents.value.map((r) => (
                <button key={r.id} type="button" class="recent" onClick={() => void openStored(r.id)}>
                  <strong>{r.name}</strong>
                  <span class="muted">{new Date(r.updated).toLocaleString(document.documentElement.lang)}</span>
                </button>
              ))
            )}
          </div>
          <div class="side-card">
            <h2>{t('start.openOrImport')}</h2>
            <input ref={fileInput} type="file" accept=".scaena" class="sr-only" tabIndex={-1} aria-hidden="true" onChange={onFile} />
            <button type="button" class="btn primary" style="height:40px;justify-content:center" onClick={() => fileInput.current?.click()}>
              {t('start.open')}
            </button>
            <button type="button" class="btn" style="height:40px;justify-content:center" disabled title={t('start.import.tip')}>
              {t('start.import')}
            </button>
            {err && (
              <p class="alert" role="alert" style="margin:0">
                {err === 'newer' ? t('start.error.newer') : t('start.error.read', { reason: err })}
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
