import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { applySettings, applyShowSettings, dialog, session, settings, type Settings } from '../app/state.ts';
import { goToIssue, issues, issueText } from '../app/issues.ts';
import { lang, t, type Key } from '../i18n/index.ts';
import { SEVERITIES, type Severity } from '../validate/rules.ts';
import { BackgroundDialog } from './Background.tsx';
import { RevisionsDialog } from './Revisions.tsx';
import { csvZipFile, baseName, planPdfFile, planPngFile, planSvgFile, riderPdfFile, saveFile, type OutFile } from '../export/exports.ts';
import { saveAsTemplate } from '../app/library-actions.ts';
import { inputsAsText } from '../reports/reports.ts';
import { REGIONS, regionByCode } from '../library/regions.ts';
import { Paper, type Module } from '../model/schema.ts';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** A modal: focus moves in and stays in, Escape closes it, and focus returns to what opened it. */
export function Modal({ title, onClose, children, footer, menu = false }: { title: string; onClose: () => void; children: ComponentChildren; footer?: ComponentChildren; menu?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => opener?.focus?.();
  }, []);
  // If the focus was lost (a button that was clicked is gone after an update), Escape must still close the dialog.
  useEffect(() => {
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onDocKey);
    return () => document.removeEventListener('keydown', onDocKey);
  }, [onClose]);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !ref.current) return;
    const nodes = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (nodes.length === 0) return;
    const first = nodes[0]!;
    const last = nodes[nodes.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  return (
    <div class="scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class={`dialog${menu ? ' menu' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref} onKeyDown={onKey}>
        <header>
          <h1>{title}</h1>
          <button type="button" class="btn icon" aria-label={t('settings.close')} onClick={onClose}>
            ×
          </button>
        </header>
        <div class="content">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>
  );
}

export function Dialogs() {
  const d = dialog.value;
  const close = () => (dialog.value = null);
  if (d === 'settings' && session.value) return <ShowSettingsDialog onClose={close} />;
  if (d === 'export' && session.value) return <ExportDialog onClose={close} />;
  if (d === 'app') return <AppDialog onClose={close} />;
  if (d === 'help') return <HelpDialog onClose={close} />;
  if (d === 'issues' && session.value) return <IssuesDialog onClose={close} />;
  if (d === 'background' && session.value) return <BackgroundDialog onClose={close} />;
  if (d === 'revisions' && session.value) return <RevisionsDialog onClose={close} />;
  return null;
}

const ALL_MODULES: Module[] = ['audio', 'lights', 'computers', 'video', 'room', 'power', 'document', 'production'];

function ShowSettingsDialog({ onClose }: { onClose: () => void }) {
  const show = session.value!.show.value;
  const rect = show.stage.shape.kind === 'rect' ? show.stage.shape : null;
  const [modules, setModules] = useState<Module[]>(show.modules);
  const [regionCode, setRegionCode] = useState(show.region.code);
  const [voltage, setVoltage] = useState(show.region.voltage);
  const [paper, setPaper] = useState(show.paper);
  const [units, setUnits] = useState(show.units);
  const [docLang, setDocLang] = useState(show.lang);
  const [w, setW] = useState((rect?.width ?? 8000) / 1000);
  const [dpt, setD] = useState((rect?.depth ?? 5000) / 1000);
  const region = regionByCode(regionCode);
  const toggle = (m: Module) => setModules((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  const apply = () => {
    applyShowSettings({ modules, regionCode, voltage, paper, units, lang: docLang, stageWidthM: w, stageDepthM: dpt });
    onClose();
  };
  return (
    <Modal
      title={t('settings.title')}
      onClose={onClose}
      footer={
        <>
          <button type="button" class="btn" onClick={onClose}>
            {t('settings.cancel')}
          </button>
          <button type="button" class="btn primary" onClick={apply}>
            {t('settings.apply')}
          </button>
        </>
      }
    >
      <fieldset style="border:0;padding:0;margin:0">
        <legend style="font-weight:600;margin-bottom:8px">{t('settings.modules')}</legend>
        <div class="mods">
          {ALL_MODULES.map((m) => (
            <label class="mod" key={m} title={t(`module.${m}.hint` as Key)}>
              <input type="checkbox" checked={modules.includes(m)} onChange={() => toggle(m)} />
              {t(`module.${m}` as Key)}
            </label>
          ))}
        </div>
      </fieldset>
      {rect && (
        <fieldset style="border:0;padding:0;margin:0">
          <legend style="font-weight:600;margin-bottom:8px">{t('settings.stage')}</legend>
          <div class="grid2">
            <label class="field">
              {t('settings.stage.width')}
              <input class="input mono" type="number" min="1" step="0.1" value={w} onChange={(e) => setW(Math.max(1, Number((e.currentTarget as HTMLInputElement).value) || 1))} />
            </label>
            <label class="field">
              {t('settings.stage.depth')}
              <input class="input mono" type="number" min="1" step="0.1" value={dpt} onChange={(e) => setD(Math.max(1, Number((e.currentTarget as HTMLInputElement).value) || 1))} />
            </label>
          </div>
        </fieldset>
      )}
      <div class="grid2">
        <label class="field">
          {t('settings.region')}
          <select
            class="input"
            value={regionCode}
            onChange={(e) => {
              const code = (e.currentTarget as HTMLSelectElement).value;
              setRegionCode(code);
              const r = regionByCode(code);
              if (r) setVoltage(r.voltage);
            }}
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name[lang.value]}
              </option>
            ))}
          </select>
        </label>
        <label class="field" title={region?.toConfirm ? t('settings.voltage.confirm') : undefined}>
          {t('settings.voltage')}
          {region?.toConfirm ? ' *' : ''}
          <input class="input mono" type="number" min="1" max="1000" value={voltage} onChange={(e) => setVoltage(Number((e.currentTarget as HTMLInputElement).value) || region?.voltage || 230)} />
        </label>
        <label class="field">
          {t('settings.paper')}
          <select class="input" value={paper} onChange={(e) => setPaper((e.currentTarget as HTMLSelectElement).value as typeof paper)}>
            {Paper.options.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          {t('settings.units')}
          <select class="input" value={units} onChange={(e) => setUnits((e.currentTarget as HTMLSelectElement).value as typeof units)}>
            <option value="metric">{t('settings.units.metric')}</option>
            <option value="imperial">{t('settings.units.imperial')}</option>
          </select>
        </label>
        <label class="field">
          {t('settings.lang')}
          <select class="input" value={docLang} onChange={(e) => setDocLang((e.currentTarget as HTMLSelectElement).value as typeof docLang)}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
    </Modal>
  );
}

function ExportDialog({ onClose }: { onClose: () => void }) {
  const s = session.value!;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const show = () => s.show.value;

  const run = async (key: string, job: () => Promise<OutFile | null> | OutFile | null) => {
    setBusy(key);
    setError(null);
    setDone(null);
    try {
      const f = await job();
      if (f) {
        saveFile(f);
        setDone(f.name);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const items: { key: string; label: Key; tip?: Key; job: () => Promise<OutFile | null> | OutFile | null }[] = [
    { key: 'scaena', label: 'export.scaena', tip: 'export.scaena.tip', job: () => ({ name: `${baseName(show().name)}.scaena`, bytes: s.toFile(), mime: 'application/zip' }) },
    { key: 'pdf', label: 'export.pdf', tip: 'export.pdf.tip', job: () => riderPdfFile(show(), s.allImages()) },
    { key: 'planpdf', label: 'export.planpdf', job: () => planPdfFile(show(), s.allImages()) },
    { key: 'svg', label: 'export.svg', job: () => planSvgFile(show(), s.allImages()) },
    { key: 'png', label: 'export.png', job: () => planPngFile(show(), s.allImages()) },
    { key: 'csv', label: 'export.csv', tip: 'export.csv.tip', job: () => csvZipFile(show()) },
  ];

  return (
    <Modal title={t('export.title')} onClose={onClose} menu>
      <div style="display:flex;flex-direction:column;gap:2px;margin:-8px">
        {items.map((i) => (
          <button key={i.key} type="button" class="menu-item" disabled={busy !== null} onClick={() => void run(i.key, i.job)}>
            <strong>{t(i.label)}</strong>
            <span class="muted">{busy === i.key ? t('export.working') : i.tip ? t(i.tip) : ''}</span>
          </button>
        ))}
        <button
          type="button"
          class="menu-item"
          disabled={busy !== null}
          onClick={() => {
            const text = inputsAsText(show());
            void navigator.clipboard.writeText(text).then(
              () => setDone(t('export.copied')),
              () => setError(t('export.copyFailed')),
            );
          }}
        >
          <strong>{t('export.text')}</strong>
          <span class="muted">{t('export.text.tip')}</span>
        </button>
        <button
          type="button"
          class="menu-item"
          disabled={busy !== null || !s.canKeepRevisions}
          onClick={() => {
            void saveAsTemplate().then(
              (ok) => (ok ? setDone(t('export.templateSaved')) : setError(t('export.noLibrary'))),
              (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
            );
          }}
        >
          <strong>{t('export.template')}</strong>
          <span class="muted">{t('export.template.tip')}</span>
        </button>
        {done && (
          <p role="status" style="margin:8px 12px 0">
            {done}
          </p>
        )}
        {error && (
          <p class="warn" role="alert" style="margin:8px 12px 0">
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        )}
        <p class="muted" style="margin:8px 12px 4px">
          {t('export.local')}
        </p>
      </div>
    </Modal>
  );
}

function AppDialog({ onClose }: { onClose: () => void }) {
  const cur = settings.value;
  const set = (patch: Partial<Settings>) => applySettings({ ...cur, ...patch });
  return (
    <Modal title={t('app.title')} onClose={onClose}>
      <div class="grid2">
        <label class="field">
          {t('app.theme')}
          <select class="input" value={cur.theme} onChange={(e) => set({ theme: (e.currentTarget as HTMLSelectElement).value as Settings['theme'] })}>
            <option value="auto">{t('app.theme.auto')}</option>
            <option value="light">{t('app.theme.light')}</option>
            <option value="dark">{t('app.theme.dark')}</option>
          </select>
        </label>
        <label class="field">
          {t('app.lang')}
          <select class="input" value={cur.lang} onChange={(e) => set({ lang: (e.currentTarget as HTMLSelectElement).value as Settings['lang'] })}>
            <option value="auto">{t('app.theme.auto')}</option>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
    </Modal>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  const rows: [string, Key][] = [
    ['Ctrl + Z', 'help.undo'],
    ['Ctrl + Mayús + Z', 'help.redo'],
    ['← ↑ → ↓', 'help.move'],
    ['R', 'help.rotate'],
    ['F', 'help.flip'],
    ['Ctrl + D', 'help.duplicate'],
    ['Ctrl + G', 'help.group'],
    ['Supr', 'help.delete'],
    ['Ctrl + A', 'help.selectAll'],
    ['0', 'help.fit'],
    ['+ −', 'help.zoom'],
    ['Espacio', 'help.pan'],
    ['Alt', 'help.noAlign'],
    ['?', 'help.help'],
    ['Esc', 'help.close'],
  ];
  return (
    <Modal title={t('help.title')} onClose={onClose}>
      <table class="list">
        <tbody>
          {rows.map(([k, label]) => (
            <tr key={k}>
              <td>
                <kbd>{k}</kbd>
              </td>
              <td>{t(label)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

function IssuesDialog({ onClose }: { onClose: () => void }) {
  const [shown, setShown] = useState<Set<Severity>>(new Set(SEVERITIES));
  const all = issues.value;
  const list = all.filter((i) => shown.has(i.severity));
  const toggle = (s: Severity) =>
    setShown((cur) => {
      const next = new Set(cur);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  return (
    <Modal title={t('issues.title')} onClose={onClose} footer={<span class="muted">{t('issues.note')}</span>}>
      <fieldset class="issues-filter">
        <legend>{t('issues.filter')}</legend>
        {SEVERITIES.map((s) => (
          <label key={s}>
            <input type="checkbox" checked={shown.has(s)} onChange={() => toggle(s)} />
            {t(`severity.${s}` as Key)} ({all.filter((i) => i.severity === s).length})
          </label>
        ))}
      </fieldset>
      {all.length === 0 ? (
        <p>{t('issues.none')}</p>
      ) : (
        <ul class="issues-list">
          {list.map((i) => (
            <li key={i.key}>
              <span class={`imark ${i.severity}`} aria-hidden="true">
                {i.severity === 'tip' ? 'i' : '!'}
              </span>
              <p>
                <strong>{t(`severity.${i.severity}` as Key)}.</strong> {issueText(i)}
              </p>
              <button type="button" class="btn" onClick={() => goToIssue(i)}>
                {t('issues.go')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
