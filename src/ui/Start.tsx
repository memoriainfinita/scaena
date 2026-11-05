import { useEffect, useRef, useState } from 'preact/hooks';
import { deleteStored, duplicateStored, refreshLibrary, shows, startFromTemplate, templates } from '../app/library-actions.ts';
import { openFileBytes, openStored, refreshRecents, startEmpty, startError, startFromPackage, dialog } from '../app/state.ts';
import { lang, t } from '../i18n/index.ts';
import { PACKAGES } from '../library/packages.ts';
import type { Key } from '../i18n/index.ts';
import { Logo } from './icons.tsx';

export function Start() {
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void refreshRecents();
    void refreshLibrary();
  }, []);
  const [armed, setArmed] = useState<string | null>(null);
  const [all, setAll] = useState(false);

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
            {shows.value.length === 0 ? (
              <span class="muted">{t('start.recent.none')}</span>
            ) : (
              (all ? shows.value : shows.value.slice(0, 8)).map((x) => (
                <div class="libraryrow" key={x.id}>
                  <button type="button" class="recent" onClick={() => void openStored(x.id)}>
                    <strong>{x.name}</strong>
                    <span class="muted">{new Date(x.updated).toLocaleString(document.documentElement.lang)}</span>
                  </button>
                  <button type="button" class="pbtn" aria-label={t('library.duplicate', { name: x.name })} title={t('library.duplicate', { name: x.name })} onClick={() => void duplicateStored(x.id, t('library.copySuffix'))}>
                    ⧉
                  </button>
                  <button type="button" class="pbtn" aria-label={armed === x.id ? t('library.confirmDelete', { name: x.name }) : t('library.delete', { name: x.name })} title={armed === x.id ? t('library.confirmDelete', { name: x.name }) : t('library.delete', { name: x.name })} onClick={() => (armed === x.id ? (setArmed(null), void deleteStored(x.id)) : setArmed(x.id))}>
                    {armed === x.id ? '!' : '✕'}
                  </button>
                </div>
              ))
            )}
            {shows.value.length > 8 && (
              <button type="button" class="btn" onClick={() => setAll(!all)}>
                {all ? t('library.fewer') : t('library.all', { n: shows.value.length })}
              </button>
            )}
          </div>
          {templates.value.length > 0 && (
            <div class="side-card">
              <h2>{t('start.templates')}</h2>
              {templates.value.map((x) => (
                <div class="libraryrow" key={x.id}>
                  <button type="button" class="recent" onClick={() => void startFromTemplate(x.id)}>
                    <strong>{x.name}</strong>
                    <span class="muted">{t('start.template.use')}</span>
                  </button>
                  <button type="button" class="pbtn" aria-label={armed === x.id ? t('library.confirmDelete', { name: x.name }) : t('library.delete', { name: x.name })} title={armed === x.id ? t('library.confirmDelete', { name: x.name }) : t('library.delete', { name: x.name })} onClick={() => (armed === x.id ? (setArmed(null), void deleteStored(x.id)) : setArmed(x.id))}>
                    {armed === x.id ? '!' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          )}
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
