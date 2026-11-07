import { startStageEdit, stageEdit, stopStageEdit } from '../app/stage-actions.ts';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { issues } from '../app/issues.ts';
import { createLayer, moveCustomLayer, moveCustomLayerTo, moveToLayer, removeCustomLayer, renameCustomLayer, setLayerDim, tool, type ToolId } from '../app/plan-actions.ts';
import { activeLayer, dragLayer, inspectorPane, libraryPane, type Pane, addFromLibrary, dialog, goHome, sheet, renameShow, selection, session, setElementField, setElementType, setLayerFlag, view, VIEWS, type ViewId } from '../app/state.ts';
import { formatNumber, lang, t, type Key } from '../i18n/index.ts';
import { CATEGORY_ORDER, ITEMS, isCustomItem, itemById, searchItems } from '../library/items.ts';
import { iconKeyOf, iconThumb, iconsVersion, loadAllIcons } from '../library/icons.ts';
import { symbolSvg } from '../library/symbols.ts';
import type { PlanElement, Show } from '../model/schema.ts';
import { IconBackground, IconConnect, IconEye, IconLock, IconMeasure, IconPan, IconRedo, IconSelect, IconText, IconUndo, Logo } from './icons.tsx';
import { InputsView, OutputsView } from './Audio.tsx';
import { ComputerPanel, ConnectionsPanel } from './Computer.tsx';
import { DocumentView } from './Document.tsx';
import { ProductionView } from './Production.tsx';
import { ReportsView } from './Reports.tsx';
import { RackPanel } from './Rack.tsx';
import { isLevel, levelHeight } from '../model/levels.ts';
import { stagePosition } from '../model/position.ts';
import { RACK_ITEM } from '../model/racks.ts';
import { LightsView, LuminairePanel } from './Lights.tsx';
import { Ico, LIBRARY_DRAG, PlanView } from './PlanView.tsx';

const VIEW_NEEDS: Partial<Record<ViewId, 'audio' | 'lights' | 'document' | 'production'>> = { inputs: 'audio', outputs: 'audio', lights: 'lights', production: 'production', document: 'document' };

export function Editor() {
  const s = session.value!;
  // The tools, the library and the inspector belong to the plan; the other views have their own tables and forms.
  const onPlan = view.value === 'plan';
  return (
    <div class="editor">
      <button
        type="button"
        class="skip"
        onClick={() => {
          const target = document.querySelector<HTMLElement>('main.canvas g.el[data-id][tabindex="0"], main.canvas [data-first-focus]') ?? document.querySelector<HTMLElement>('main.canvas');
          target?.focus();
        }}
      >
        {t('skip.canvas')}
      </button>
      <TopBar />
      <Tabs show={s.show.value} />
      <div class="body">
        {onPlan && <Toolbar />}
        {onPlan && <Library />}
        <main class="canvas" aria-label={t('canvas.label')} tabIndex={-1}>
          <MainView show={s.show.value} />
        </main>
        {onPlan && <Inspector show={s.show.value} />}
        {onPlan && <div class="fabs">
          <button type="button" class="fab" aria-pressed={sheet.value === 'library'} onClick={() => (sheet.value = sheet.value === 'library' ? null : 'library')}>
            {t('library.title')}
          </button>
          <button type="button" class="fab" aria-pressed={sheet.value === 'inspector'} onClick={() => (sheet.value = sheet.value === 'inspector' ? null : 'inspector')}>
            {t('inspector.title')}
            {selection.value.length > 0 && <span class="count">{selection.value.length}</span>}
          </button>
        </div>}
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
      <button type="button" class="btn icon" aria-label={t('top.redo')} title={`${t('top.redo')} (Ctrl+${t('key.shift')}+Z)`} disabled={!s.canRedo.value} onClick={() => s.redo()}>
        <IconRedo />
      </button>
      <button type="button" class="btn desk-only" onClick={() => (dialog.value = 'revisions')}>
        {t('top.revisions')}
      </button>
      <button type="button" class="btn desk-only" onClick={() => (dialog.value = 'issues')} aria-label={`${t('top.issues')} · ${t('issues.count', { n: issues.value.length })}`}>
        {t('top.issues')}
        <span class="count">{issues.value.length}</span>
      </button>
      <button type="button" class="btn desk-only" onClick={() => (dialog.value = 'settings')}>
        {t('top.settings')}
      </button>
      <button type="button" class="btn desk-only" onClick={() => (dialog.value = 'app')}>
        {t('top.app')}
      </button>
      <button type="button" class="btn primary desk-only" onClick={() => (dialog.value = 'export')}>
        {t('top.export')}
      </button>
      <button type="button" class="btn mobile-only" aria-label={t('menu.title')} title={t('menu.title')} onClick={() => (dialog.value = 'menu')}>
        ⋯
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
    { id: 'background', key: 'tool.background', icon: <IconBackground />, enabled: true },
  ];
  return (
    <div class="toolbar" role="toolbar" aria-label={t('tools.label')} aria-orientation="vertical">
      {tools.map((x) => (
        <button key={x.id} type="button" class="tool" aria-pressed={tool.value === x.id} aria-label={t(x.key)} title={x.enabled ? t(x.key) : `${t(x.key)} · ${t('export.soon')}`} disabled={!x.enabled} onClick={() => (x.id === 'background' ? (dialog.value = 'background') : (tool.value = x.id))}>
          {x.icon}
        </button>
      ))}
    </div>
  );
}

/** Items drawn before "see all": about 780 buttons with icons would slow the page and the accessibility checks. */
const LIBRARY_PAGE = 60;
const LIBRARY_CATEGORIES = [...new Set([...CATEGORY_ORDER, ...ITEMS.map((i) => i.category)])].filter((c) => ITEMS.some((i) => i.category === c));

function Library() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [more, setMore] = useState(false);
  const found = useMemo(() => searchItems(query, lang.value).filter((i) => !cat || i.category === cat), [query, cat, lang.value]);
  const items = more ? found : found.slice(0, LIBRARY_PAGE);
  const l = lang.value;
  void iconsVersion.value; // redraw the thumbnails as sheets arrive
  useEffect(() => {
    void loadAllIcons();
  }, []);
  return (
    <aside class={`library${sheet.value === 'library' ? ' open' : ''}`} aria-label={t('library.title')} style={`--pane-w:${libraryPane.width.value}px`}>
      <PaneSplit pane={libraryPane} side="right" />
      <button type="button" class="sheet-close" onClick={() => (sheet.value = null)}>
        {t('sheet.close')}
      </button>
      <div class="search">
        <input class="input" style="width:100%" type="search" aria-label={t('library.search')} placeholder={t('library.search')} value={query} onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)} />
      </div>
      <div class="search">
        <select class="input" style="width:100%" aria-label={t('library.category')} value={cat} onChange={(e) => setCat((e.currentTarget as HTMLSelectElement).value)}>
          <option value="">{t('library.cat.all')}</option>
          {LIBRARY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`library.cat.${c}`)}
            </option>
          ))}
        </select>
      </div>
      <button type="button" class="btn" style="margin:0 8px 8px" onClick={() => (dialog.value = 'customItem')}>
        {t('custom.new')}
      </button>
      <div class="list">
        {found.length === 0 && <p class="muted" style="grid-column:1/-1">{t('library.none', { query })}</p>}
        {items.map((i, n) => {
          const group = isCustomItem(i) ? 'custom' : i.category;
          const head = !query.trim() && !cat && (n === 0 || group !== (isCustomItem(items[n - 1]!) ? 'custom' : items[n - 1]!.category));
          return (
          <>
          {head && <h3 class="lib-head" key={`h-${group}`}>{t(`library.cat.${group}` as Key)}</h3>}
          <button key={i.id} type="button" class="lib-item" title={t('library.add', { name: i.name[l] })} aria-label={t('library.add', { name: i.name[l] })} draggable onDragStart={(e) => {
            e.dataTransfer?.setData(LIBRARY_DRAG, i.id);
            if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
          }} onClick={() => addFromLibrary(i.id)}>
            <span class="sym" aria-hidden="true" dangerouslySetInnerHTML={{ __html: (iconKeyOf(i.id) && iconThumb(iconKeyOf(i.id)!, '')) || symbolSvg(i.symbol, i.size.w, i.size.d, '') }} />
            <span>{i.name[l]}</span>
          </button>
          </>
          );
        })}
        {found.length > LIBRARY_PAGE && (
          <button type="button" class="btn" style="grid-column:1/-1" onClick={() => setMore(!more)}>
            {more ? t('library.fewer') : t('library.all', { n: found.length })}
          </button>
        )}
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
  if (v === 'document') return <DocumentView show={show} />;
  if (v === 'reports') return <ReportsView show={show} />;
  if (v === 'production') return <ProductionView show={show} />;
  return (
    <div class="placeholder">
      <strong>{t(`view.${v}` as Key)}</strong>
      <span class="muted">{t('view.soon')}</span>
    </div>
  );
}

const DEFAULT_LAYER_IDS = new Set(['l-stage', 'l-audio', 'l-lights', 'l-electrical', 'l-control', 'l-notes', 'l-background']);

/** The edge of a side panel: drag it, or focus it and use the arrow keys (Shift for bigger steps). */
function PaneSplit({ pane, side }: { pane: Pane; side: 'left' | 'right' }) {
  const grow = side === 'left' ? -1 : 1; // the inspector grows when its edge goes left, the library when its edge goes right
  return (
    <div
      class={`split ${side}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={t(side === 'left' ? 'inspector.resize' : 'library.resize')}
      aria-valuemin={pane.min}
      aria-valuemax={pane.max}
      aria-valuenow={pane.width.value}
      tabIndex={0}
      title={t(side === 'left' ? 'inspector.resize' : 'library.resize')}
      onPointerDown={(e) => {
        const bar = e.currentTarget as HTMLElement;
        bar.setPointerCapture(e.pointerId);
        const x0 = e.clientX;
        const w0 = pane.width.value;
        const move = (m: PointerEvent) => pane.set(w0 + grow * (m.clientX - x0));
        const up = () => {
          bar.removeEventListener('pointermove', move);
          bar.removeEventListener('pointerup', up);
        };
        bar.addEventListener('pointermove', move);
        bar.addEventListener('pointerup', up);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          pane.set(pane.width.value + dir * grow * (e.shiftKey ? 40 : 10));
        }
      }}
    />
  );
}

function Inspector({ show }: { show: Show }) {
  const sel = selection.value[0];
  const el = sel ? show.elements[sel] : undefined;
  const it = el ? itemById(el.type.id) : undefined;
  return (
    <aside class={`inspector${sheet.value === 'inspector' ? ' open' : ''}`} aria-label={t('inspector.title')} style={`--pane-w:${inspectorPane.width.value}px`}>
      <PaneSplit pane={inspectorPane} side="left" />
      <button type="button" class="sheet-close" onClick={() => (sheet.value = null)}>
        {t('sheet.close')}
      </button>
      {el && it ? (
        <>
          <div class="panel">
            <h2>{t('inspector.title')}</h2>
            <strong style="font-size:15px">{it.name[lang.value]}</strong>
            <label class="field">
              {t('inspector.type')}
              <select class="input" value={it.id} onChange={(e) => setElementType(selection.value, (e.currentTarget as HTMLSelectElement).value)}>
                {searchItems('', lang.value)
                  .filter((i) => i.category === it.category)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name[lang.value]}
                    </option>
                  ))}
              </select>
            </label>
            <label class="field">
              {t('inspector.label')}
              <input class="input" data-label-field value={el.label} onChange={(e) => setElementField(el.id, { label: (e.currentTarget as HTMLInputElement).value })} />
            </label>
            <label class="field">
              {t('inspector.layer')}
              <select class="input" value={el.layerId} onChange={(e) => moveToLayer(selection.value, (e.currentTarget as HTMLSelectElement).value)}>
                {show.layers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {DEFAULT_LAYER_IDS.has(l.id) ? t(`layer.${l.subject}` as Key) : l.name}
                  </option>
                ))}
              </select>
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
              <span class="muted mono" style="align-self:end">
                {t('inspector.zone', { code: stagePosition(show, el) })}
              </span>
              {isLevel(el) &&<NumberField label={t('inspector.height')} value={levelHeight(el) / 1000} step={0.1} onCommit={(v) => setElementField(el.id, { height: Math.max(0, Math.round(v * 1000)) })} />}
            </div>
          </div>
          {el.type.id === RACK_ITEM && <RackPanel el={el} />}
          {el.computer && <ComputerPanel el={el} c={el.computer} />}
          {el.luminaire && <LuminairePanel el={el} show={show} />}
          <ConnectionsPanel show={show} el={el} />
        </>
      ) : (
        <div class="panel">
          <h2>{t('inspector.title')}</h2>
          <strong>{t('inspector.none')}</strong>
          <span class="muted">{t('inspector.none.text')}</span>
          <button type="button" class="btn" aria-pressed={stageEdit.value} title={t('stage.edit.tip')} onClick={() => (stageEdit.value ? stopStageEdit() : startStageEdit())}>
            {stageEdit.value ? t('stage.editDone') : t('stage.edit')}
          </button>
        </div>
      )}
      <div class="panel" style="flex:1">
        <h2>{t('layers.title')}</h2>
        {show.layers.map((l, at) => {
          const name = DEFAULT_LAYER_IDS.has(l.id) ? t(`layer.${l.subject}` as Key) : l.name;
          const custom = l.subject === 'custom';
          const active = activeLayer.value === l.id;
          const pick = () => (activeLayer.value = active ? null : l.id);
          return (
            <div
              class={`layer${custom ? ' custom' : ''}${active ? ' active' : ''}`}
              key={l.id}
              onDragOver={custom || dragLayer.value ? (e) => dragLayer.value && e.preventDefault() : undefined}
              onDrop={(e) => {
                e.preventDefault();
                if (dragLayer.value) moveCustomLayerTo(dragLayer.value, at);
                dragLayer.value = null;
              }}
            >
              <button
                type="button"
                class={custom ? 'grip' : 'swatch'}
                aria-pressed={active}
                aria-label={t('layers.active', { name })}
                title={custom ? t('layers.grip', { name }) : t('layers.active', { name })}
                draggable={custom}
                onDragStart={custom ? (e) => {
                  dragLayer.value = l.id;
                  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
                } : undefined}
                onDragEnd={() => (dragLayer.value = null)}
                onClick={pick}
                onKeyDown={custom ? (e) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveCustomLayer(l.id, e.key === 'ArrowUp' ? -1 : 1);
                  }
                } : undefined}
              >
                {custom ? '⠿' : ''}
              </button>
              {custom ? (
                <input class="input name" aria-label={t('layers.rename', { name })} title={name} value={l.name} maxLength={80} onChange={(e) => renameCustomLayer(l.id, (e.currentTarget as HTMLInputElement).value)} />
              ) : (
                <span onClick={pick}>{name}</span>
              )}
              <label title={t('layers.show', { name })}>
                <input type="checkbox" aria-label={t('layers.show', { name })} checked={l.visible} onChange={(e) => setLayerFlag(l.id, 'visible', (e.currentTarget as HTMLInputElement).checked)} />
                <IconEye />
              </label>
              <label title={t('layers.dim', { name })}>
                <input type="checkbox" aria-label={t('layers.dim', { name })} checked={(l.dim ?? 0) > 0} onChange={(e) => setLayerDim(l.id, (e.currentTarget as HTMLInputElement).checked ? 0.6 : 0)} />
                <Ico name="dim" />
              </label>
              <label title={t('layers.lock', { name })}>
                <input type="checkbox" aria-label={t('layers.lock', { name })} checked={l.locked} onChange={(e) => setLayerFlag(l.id, 'locked', (e.currentTarget as HTMLInputElement).checked)} />
                <IconLock />
              </label>
              {custom && (
                <button type="button" class="btn mini" aria-label={t('layers.remove', { name })} title={t('layers.remove', { name })} onClick={() => removeCustomLayer(l.id)}>
                  ×
                </button>
              )}
            </div>
          );
        })}
        <NewLayer />
      </div>
    </aside>
  );
}

function NewLayer() {
  const [name, setName] = useState('');
  return (
    <form
      class="row"
      onSubmit={(e) => {
        e.preventDefault();
        if (createLayer(name)) setName('');
      }}
    >
      <input class="input" style="flex:1;min-width:0" aria-label={t('layers.newName')} value={name} maxLength={80} onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)} />
      <button type="submit" class="btn" disabled={!name.trim()}>
        {t('layers.add')}
      </button>
    </form>
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
