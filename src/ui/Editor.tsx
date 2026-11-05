import { useMemo, useState } from 'preact/hooks';
import { issues } from '../app/issues.ts';
import { setLayerDim, tool, type ToolId } from '../app/plan-actions.ts';
import { addFromLibrary, dialog, goHome, renameShow, selection, session, setElementField, setLayerFlag, view, VIEWS, type ViewId } from '../app/state.ts';
import { formatNumber, lang, t, type Key } from '../i18n/index.ts';
import { itemById, searchItems } from '../library/items.ts';
import { symbolSvg } from '../library/symbols.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { IconBackground, IconConnect, IconEye, IconLock, IconMeasure, IconPan, IconRedo, IconSelect, IconText, IconUndo, Logo } from './icons.tsx';
import { InputsView, OutputsView } from './Audio.tsx';
import { ComputerPanel, ConnectionsPanel } from './Computer.tsx';
import { LightsView, LuminairePanel } from './Lights.tsx';
import { Ico, PlanView } from './PlanView.tsx';

const VIEW_NEEDS: Partial<Record<ViewId, 'audio' | 'lights' | 'document'>> = { inputs: 'audio', outputs: 'audio', lights: 'lights', document: 'document' };

export function Editor() {
  const s = session.value!;
  return (
    <div class="editor">
      <TopBar />
      <Tabs show={s.show.value} />
      <div class="body">
        <Toolbar />
        <Library />
        <main class="canvas" aria-label={t('canvas.label')}>
          <MainView show={s.show.value} />
        </main>
        <Inspector show={s.show.value} />
      </div>
      <StatusBar show={s.show.value} />
    </div>
  );
}

function TopBar() {
  const s = session.value!;
  return (
    <header class="topbar">
      <button type="button" class="logo" aria-label={t('top.home')} title={t('top.home')} onClick={() => void goHome()}>
        <Logo />
      </button>
      <span class="sep" />
      <input class="input name" aria-label={t('top.name')} value={s.show.value.name} onChange={(e) => renameShow((e.currentTarget as HTMLInputElement).value)} />
      <span class="muted" role="status">
        {s.saving.value ? t('top.saving') : t('top.saved')}
      </span>
      <span class="grow" />
      <button type="button" class="btn icon" aria-label={t('top.undo')} title={`${t('top.undo')} (Ctrl+Z)`} disabled={!s.canUndo.value} onClick={() => s.undo()}>
        <IconUndo />
      </button>
      <button type="button" class="btn icon" aria-label={t('top.redo')} title={`${t('top.redo')} (Ctrl+Mayús+Z)`} disabled={!s.canRedo.value} onClick={() => s.redo()}>
        <IconRedo />
      </button>
      <button type="button" class="btn" disabled title={t('export.soon')}>
        {t('top.revisions')}
      </button>
      <button type="button" class="btn" onClick={() => (dialog.value = 'issues')} aria-label={`${t('top.issues')} · ${t('issues.count', { n: issues.value.length })}`}>
        {t('top.issues')}
        <span class="count">{issues.value.length}</span>
      </button>
      <button type="button" class="btn" onClick={() => (dialog.value = 'settings')}>
        {t('top.settings')}
      </button>
      <button type="button" class="btn" onClick={() => (dialog.value = 'app')}>
        {t('top.app')}
      </button>
      <button type="button" class="btn primary" onClick={() => (dialog.value = 'export')}>
        {t('top.export')}
      </button>
    </header>
  );
}

function Tabs({ show }: { show: Show }) {
  const visible = VIEWS.filter((v) => {
    const need = VIEW_NEEDS[v];
    return !need || show.modules.includes(need);
  });
  return (
    <nav class="tabs" aria-label={t('views.label')}>
      {visible.map((v) => (
        <button key={v} type="button" class="tab" aria-current={view.value === v ? 'page' : undefined} onClick={() => (view.value = v)}>
          {t(`view.${v}` as Key)}
        </button>
      ))}
      <span class="grow" />
      <span class="chips">
        {show.modules.map((m) => (
          <span class="chip" key={m}>
            {t(`module.${m}` as Key)}
          </span>
        ))}
      </span>
    </nav>
  );
}

function Toolbar() {
  const tools: { id: ToolId; key: Key; icon: preact.JSX.Element; enabled: boolean }[] = [
    { id: 'select', key: 'tool.select', icon: <IconSelect />, enabled: true },
    { id: 'pan', key: 'tool.pan', icon: <IconPan />, enabled: true },
    { id: 'connect', key: 'tool.connect', icon: <IconConnect />, enabled: true },
    { id: 'text', key: 'tool.text', icon: <IconText />, enabled: true },
    { id: 'measure', key: 'tool.measure', icon: <IconMeasure />, enabled: true },
    { id: 'background', key: 'tool.background', icon: <IconBackground />, enabled: false },
  ];
  return (
    <div class="toolbar" role="toolbar" aria-label={t('tools.label')} aria-orientation="vertical">
      {tools.map((x) => (
        <button key={x.id} type="button" class="tool" aria-pressed={tool.value === x.id} aria-label={t(x.key)} title={x.enabled ? t(x.key) : `${t(x.key)} · ${t('export.soon')}`} disabled={!x.enabled} onClick={() => (tool.value = x.id)}>
          {x.icon}
        </button>
      ))}
    </div>
  );
}

function Library() {
  const [query, setQuery] = useState('');
  const items = useMemo(() => searchItems(query), [query]);
  const l = lang.value;
  return (
    <aside class="library" aria-label={t('library.title')}>
      <div class="search">
        <input class="input" style="width:100%" type="search" aria-label={t('library.search')} placeholder={t('library.search')} value={query} onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)} />
      </div>
      <div class="list">
        {items.length === 0 && <p class="muted" style="grid-column:1/-1">{t('library.none', { query })}</p>}
        {items.map((i) => (
          <button key={i.id} type="button" class="lib-item" title={t('library.add', { name: i.name[l] })} aria-label={t('library.add', { name: i.name[l] })} onClick={() => addFromLibrary(i.id)}>
            <span class="sym" aria-hidden="true" dangerouslySetInnerHTML={{ __html: symbolSvg(i.symbol, i.size.w, i.size.d, '') }} />
            <span>{i.name[l]}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function MainView({ show }: { show: Show }) {
  const v = view.value;
  if (v === 'plan') return <PlanView key={session.value!.id} show={show} />;
  if (v === 'inputs') return <InputsView show={show} />;
  if (v === 'outputs') return <OutputsView show={show} />;
  if (v === 'lights') return <LightsView show={show} />;
  return (
    <div class="placeholder">
      <strong>{t(`view.${v}` as Key)}</strong>
      <span class="muted">{t('view.soon')}</span>
    </div>
  );
}

const DEFAULT_LAYER_IDS = new Set(['l-stage', 'l-audio', 'l-lights', 'l-electrical', 'l-control', 'l-notes', 'l-background']);

function Inspector({ show }: { show: Show }) {
  const sel = selection.value[0];
  const el = sel ? show.elements[sel] : undefined;
  const it = el ? itemById(el.type.id) : undefined;
  return (
    <aside class="inspector" aria-label={t('inspector.title')}>
      {el && it ? (
        <>
          <div class="panel">
            <h2>{t('inspector.title')}</h2>
            <strong style="font-size:15px">{it.name[lang.value]}</strong>
            <label class="field">
              {t('inspector.label')}
              <input class="input" data-label-field value={el.label} onChange={(e) => setElementField(el.id, { label: (e.currentTarget as HTMLInputElement).value })} />
            </label>
            <label class="field">
              {t('inspector.supplied')}
              <select class="input" value={el.suppliedBy} onChange={(e) => setElementField(el.id, { suppliedBy: (e.currentTarget as HTMLSelectElement).value as PlanElement['suppliedBy'] })}>
                {(['unset', 'band', 'venue', 'rental'] as const).map((o) => (
                  <option key={o} value={o}>
                    {t(`supplied.${o}` as Key)}
                  </option>
                ))}
              </select>
            </label>
            <label class="field">
              {t('inspector.notes')}
              <textarea class="input" rows={3} value={el.notes} onChange={(e) => setElementField(el.id, { notes: (e.currentTarget as HTMLTextAreaElement).value })} />
            </label>
          </div>
          <div class="panel">
            <h2>{t('inspector.position')}</h2>
            <div class="grid2">
              <NumberField label="X (m)" value={el.x / 1000} onCommit={(v) => setElementField(el.id, { x: Math.round(v * 1000) })} />
              <NumberField label="Y (m)" value={el.y / 1000} onCommit={(v) => setElementField(el.id, { y: Math.round(v * 1000) })} />
              <NumberField label={t('inspector.rotation')} value={el.rotation} step={5} onCommit={(v) => setElementField(el.id, { rotation: v })} />
            </div>
          </div>
          {el.computer && <ComputerPanel el={el} c={el.computer} />}
          {el.luminaire && <LuminairePanel el={el} show={show} />}
          <ConnectionsPanel show={show} el={el} />
        </>
      ) : (
        <div class="panel">
          <h2>{t('inspector.title')}</h2>
          <strong>{t('inspector.none')}</strong>
          <span class="muted">{t('inspector.none.text')}</span>
        </div>
      )}
      <div class="panel" style="flex:1">
        <h2>{t('layers.title')}</h2>
        {show.layers.map((l) => {
          const name = DEFAULT_LAYER_IDS.has(l.id) ? t(`layer.${l.subject}` as Key) : l.name;
          return (
            <div class="layer" key={l.id}>
              <span class="swatch" aria-hidden="true" />
              <span style="flex:1">{name}</span>
              <label>
                <input type="checkbox" aria-label={t('layers.show', { name })} checked={l.visible} onChange={(e) => setLayerFlag(l.id, 'visible', (e.currentTarget as HTMLInputElement).checked)} />
                <IconEye />
              </label>
              <label>
                <input type="checkbox" aria-label={t('layers.dim', { name })} checked={(l.dim ?? 0) > 0} onChange={(e) => setLayerDim(l.id, (e.currentTarget as HTMLInputElement).checked ? 0.6 : 0)} />
                <Ico name="dim" />
              </label>
              <label>
                <input type="checkbox" aria-label={t('layers.lock', { name })} checked={l.locked} onChange={(e) => setLayerFlag(l.id, 'locked', (e.currentTarget as HTMLInputElement).checked)} />
                <IconLock />
              </label>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function NumberField({ label, value, step = 0.01, onCommit }: { label: string; value: number; step?: number; onCommit: (v: number) => void }) {
  return (
    <label class="field">
      {label}
      <input class="input mono" type="number" step={step} value={Math.round(value * 1000) / 1000} onChange={(e) => {
        const v = Number((e.currentTarget as HTMLInputElement).value);
        if (Number.isFinite(v)) onCommit(v);
      }} />
    </label>
  );
}

function StatusBar({ show }: { show: Show }) {
  return (
    <footer class="statusbar">
      <span>{t('status.elements', { n: Object.keys(show.elements).length })}</span>
      <span>{t('status.channels', { n: Object.keys(show.channels).length })}</span>
      {selection.value.length > 0 && <span role="status">{t('plan.selected', { n: selection.value.length })}</span>}
      <span class="grow" />
      <span>{t('status.paper', { paper: show.paper })}</span>
      <span>
        {formatNumber(show.region.voltage)} V · {show.region.code}
      </span>
    </footer>
  );
}
