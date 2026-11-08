// The light plot lists: instruments, mounts, electrical load and the side section.
import { useEffect, useRef, useState } from 'preact/hooks';
import { magicSheet } from '../document/magic-svg.ts';
import { addNote, lightsTab, removeNote, setNote, addressDmx, numberUnits, resetMagic, selectElement, setMagicPos, addMountRow, removeMountRow, setBreaker, setDimmerMaxW, setElementNumber, setLuminaire, setLuminaireModel, setMount, setFocusPoint, setPhase, type LightsTab } from '../app/lights-actions.ts';
import { modesOfLuminaire, slotsOf } from '../model/dmx.ts';
import { selection } from '../app/state.ts';
import { IssueMark } from './IssueMark.tsx';
import { formatNumber, lang, t, type Key } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { FIXTURES, OFL_FIXTURES, fixtureById } from '../library/models.ts';
import type { FixtureModel } from '../library/types.ts';
import { levels } from '../model/levels.ts';
import { cableText } from '../reports/reports.ts';
import { circuitLoads, defaultFocus, dimmerLoads, luminaires, magicPosition, mountList, mountStats, phaseLoads } from '../model/lights.ts';
import type { Mount, PlanElement, Show } from '../model/schema.ts';

const name = (el: PlanElement): string => el.label || itemById(el.type.id)?.name[lang.value] || el.type.id;
const MOUNT_KINDS: Mount['kind'][] = ['bar', 'pipe', 'truss', 'boom', 'floor'];
const kg = (v: number) => `${formatNumber(Math.round(v * 10) / 10, lang.value, 1)} kg`;
const kw = (w: number) => `${formatNumber(w / 1000, lang.value, 2)} kW`;
const mountName = (show: Show, id: string | null): string => (id && show.mounts[id]?.name) || t('lights.unmounted');

export function NumCell({ value, label, onCommit, step = 1, scale = 1, min = 0 }: { value: number | null; label: string; onCommit: (v: number | null) => void; step?: number; scale?: number; min?: number }) {
  return (
    <input
      class="input cell mono"
      type="number"
      min={min}
      step={step}
      aria-label={label}
      value={value === null ? '' : Math.round((value / scale) * 1000) / 1000}
      onChange={(e) => {
        const raw = (e.currentTarget as HTMLInputElement).value;
        const v = Number(raw);
        onCommit(raw === '' || !Number.isFinite(v) || v < min ? null : v * scale);
      }}
    />
  );
}

const byName = (lang: string) => (a: FixtureModel, b: FixtureModel) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, lang);
let theatreCache: [string, FixtureModel[]] | null = null;
const SORTED_THEATRE = (lang: string): FixtureModel[] => (theatreCache?.[0] === lang ? theatreCache[1] : (theatreCache = [lang, [...FIXTURES].sort(byName(lang))])[1]);
let oflCache: [string, [string, FixtureModel[]][]] | null = null;
function oflGroups(lang: string): [string, FixtureModel[]][] {
  if (oflCache?.[0] === lang) return oflCache[1];
  const by = new Map<string, FixtureModel[]>();
  for (const f of [...OFL_FIXTURES].sort(byName(lang))) by.set(f.brand, [...(by.get(f.brand) ?? []), f]);
  oflCache = [lang, [...by.entries()].sort((a, b) => a[0].localeCompare(b[0], lang))];
  return oflCache[1];
}

/** The table row keeps its select small (theatre list and the chosen model); the inspector offers the whole Open Fixture Library. */
function ModelSelect({ el, label, cls = 'input cell', full = false }: { el: PlanElement; label: string; cls?: string; full?: boolean }) {
  const cur = el.luminaire?.modelId ?? '';
  const chosen = cur.startsWith('ofl.') ? fixtureById(cur) : undefined;
  return (
    <select class={cls} aria-label={label} value={cur} onChange={(e) => setLuminaireModel(el.id, (e.currentTarget as HTMLSelectElement).value)}>
      <option value="">{t('lights.none')}</option>
      <optgroup label={t('lights.group.theatre')}>
        {SORTED_THEATRE(lang.value).map((f) => (
          <option key={f.id} value={f.id}>
            {f.brand} {f.model}
            {f.estimate ? ' ≈' : ''}
          </option>
        ))}
      </optgroup>
      {!full && chosen && (
        <option value={chosen.id}>
          {chosen.brand} {chosen.model}
        </option>
      )}
      {(full ? oflGroups(lang.value) : []).map(([brand, list]) => (
        <optgroup key={brand} label={`${brand} · OFL`}>
          {list.map((f) => (
            <option key={f.id} value={f.id}>
              {f.brand} {f.model}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function MountSelect({ show, el, label, cls = 'input cell' }: { show: Show; el: PlanElement; label: string; cls?: string }) {
  return (
    <select class={cls} aria-label={label} value={el.luminaire?.mountId ?? ''} onChange={(e) => setLuminaire(el.id, { mountId: (e.currentTarget as HTMLSelectElement).value || null })}>
      <option value="">{t('lights.unmounted')}</option>
      {mountList(show).map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}

export function LightsView({ show }: { show: Show }) {
  const tab = lightsTab.value;
  const tabs: LightsTab[] = ['instruments', 'mounts', 'electrical', 'section', 'magic', 'worknotes'];
  return (
    <div class="scroll">
      <nav class="subtabs" aria-label={t('lights.tabs')}>
        {tabs.map((x) => (
          <button key={x} type="button" class="chipbtn" aria-current={tab === x ? 'page' : undefined} aria-pressed={tab === x} onClick={() => (lightsTab.value = x)}>
            {t(`lights.tab.${x}` as Key)}
          </button>
        ))}
      </nav>
      {tab === 'instruments' && <Instruments show={show} />}
      {tab === 'mounts' && <Mounts show={show} />}
      {tab === 'electrical' && <Electrical show={show} />}
      {tab === 'section' && <Section show={show} />}
      {tab === 'magic' && <MagicSheetView show={show} />}
      {tab === 'worknotes' && <WorkNotes show={show} />}
    </div>
  );
}

function Instruments({ show }: { show: Show }) {
  const rows = luminaires(show).sort((a, b) => (a.luminaire!.unit ?? Infinity) - (b.luminaire!.unit ?? Infinity) || a.id.localeCompare(b.id, 'en', { numeric: true }));
  const sel = new Set(selection.value);
  return (
    <>
      <div class="listbar">
        <button type="button" class="btn" disabled={rows.length === 0} onClick={() => numberUnits()}>
          {t('lights.number')}
        </button>
        <button type="button" class="btn" disabled={!rows.some((e) => slotsOf(e.luminaire!) !== null)} onClick={() => addressDmx()}>
          {t('lights.address')}
        </button>
      </div>
      {rows.length === 0 ? (
        <p class="muted pad">{t('lights.empty')}</p>
      ) : (
        <table class="list editable wide">
          <thead>
            <tr>
              <th>{t('table.unit')}</th>
              <th>{t('table.element')}</th>
              <th>{t('table.model')}</th>
              <th>{t('table.mount')}</th>
              <th>{t('table.ch')}</th>
              <th>{t('table.dimmer')}</th>
              <th>{t('table.circuit')}</th>
              <th>{t('table.universe')}</th>
              <th>{t('table.address')}</th>
              <th>{t('table.dmxMode')}</th>
              <th>{t('table.color')}</th>
              <th>{t('table.power')}</th>
              <th>{t('connections.title')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((el) => {
              const l = el.luminaire!;
              const n = name(el);
              const tag = (k: Key) => `${t(k)} · ${n}`;
              return (
                <tr key={el.id} class={sel.has(el.id) ? 'sel' : undefined} onFocusIn={() => selectElement(el.id)}>
                  <td>
                    <NumCell value={l.unit} label={tag('table.unit')} onCommit={(v) => setLuminaire(el.id, { unit: v })} />
                  </td>
                  <td class="elname">
                    <IssueMark refKey={`element:${el.id}`} />
                    {n}
                  </td>
                  <td>
                    <ModelSelect el={el} label={tag('table.model')} />
                  </td>
                  <td>
                    <MountSelect show={show} el={el} label={tag('table.mount')} />
                  </td>
                  <td>
                    <NumCell value={l.channel} label={tag('table.ch')} onCommit={(v) => setLuminaire(el.id, { channel: v })} />
                  </td>
                  <td>
                    <NumCell value={l.dimmer} label={tag('table.dimmer')} onCommit={(v) => setLuminaire(el.id, { dimmer: v })} />
                  </td>
                  <td>
                    <NumCell value={l.circuit} label={tag('table.circuit')} onCommit={(v) => setLuminaire(el.id, { circuit: v })} />
                  </td>
                  <td>
                    <NumCell value={l.universe} label={tag('table.universe')} onCommit={(v) => setLuminaire(el.id, { universe: v })} />
                  </td>
                  <td>
                    <NumCell value={l.address} label={tag('table.address')} onCommit={(v) => setLuminaire(el.id, { address: v })} />
                  </td>
                  <td>
                    {modesOfLuminaire(l).length > 0 ? (
                      <select class="input cell" aria-label={tag('table.dmxMode')} value={l.dmxMode} onChange={(e) => setLuminaire(el.id, { dmxMode: (e.currentTarget as HTMLSelectElement).value })}>
                        {modesOfLuminaire(l).map(([m, n]) => (
                          <option key={m} value={m}>
                            {m} ({n})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <NumCell value={l.dmxSlots} label={tag('table.dmxMode')} onCommit={(v) => setLuminaire(el.id, { dmxSlots: v !== null && v >= 1 && v <= 512 ? Math.floor(v) : null })} />
                    )}
                  </td>
                  <td>
                    <input class="input cell" aria-label={tag('table.color')} value={l.color} maxLength={40} onChange={(e) => setLuminaire(el.id, { color: (e.currentTarget as HTMLInputElement).value })} />
                  </td>
                  <td>
                    <NumCell value={el.powerW} label={tag('table.power')} onCommit={(v) => setElementNumber(el.id, 'powerW', v)} />
                  </td>
                  <td class="cabletext">{cableText(show, el.id, ['lightControl', 'network'], lang.value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <MountCount show={show} />
    </>
  );
}

/** Count, weight and power per mount: what a rigger reads before hanging. */
function MountCount({ show }: { show: Show }) {
  const stats = mountStats(show);
  if (stats.length === 0) return null;
  return (
    <section class="counts" aria-labelledby="count-title">
      <h2 id="count-title">{t('lights.count')}</h2>
      <ul>
        {stats.map((s) => (
          <li key={s.mountId ?? 'none'}>
            <strong>{mountName(show, s.mountId)}</strong> · {t('lights.instruments', { n: s.count })} · {kg(s.weightKg)} · {kw(s.powerW)}
            {s.overloaded && (
              <span class="warn" role="note">
                {' '}
                <span aria-hidden="true">⚠ </span>
                {t('lights.overload')} ({kg(s.maxLoadKg ?? 0)})
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Mounts({ show }: { show: Show }) {
  const rows = mountList(show);
  const stats = new Map(mountStats(show).map((s) => [s.mountId, s]));
  return (
    <>
      <div class="listbar">
        <button type="button" class="btn" onClick={() => addMountRow(t('mount.default', { n: rows.length + 1 }))}>
          {t('mount.add')}
        </button>
      </div>
      {rows.length === 0 ? (
        <p class="muted pad">{t('mount.none')}</p>
      ) : (
        <table class="list editable wide">
          <thead>
            <tr>
              <th>{t('mount.name')}</th>
              <th>{t('table.kind')}</th>
              <th>{t('mount.x1')}</th>
              <th>{t('mount.y1')}</th>
              <th>{t('mount.x2')}</th>
              <th>{t('mount.y2')}</th>
              <th>{t('mount.height')}</th>
              <th>{t('mount.maxLoad')}</th>
              <th>{t('lights.count')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const tag = (k: Key) => `${t(k)} · ${m.name}`;
              const st = stats.get(m.id);
              return (
                <tr key={m.id}>
                  <td>
                    <input class="input cell" aria-label={`${t('mount.name')} · ${m.name}`} value={m.name} maxLength={80} onChange={(e) => setMount(m.id, { name: (e.currentTarget as HTMLInputElement).value })} />
                  </td>
                  <td>
                    <select class="input cell" aria-label={tag('table.kind')} value={m.kind} onChange={(e) => setMount(m.id, { kind: (e.currentTarget as HTMLSelectElement).value as Mount['kind'] })}>
                      {MOUNT_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {t(`mount.kind.${k}` as Key)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <NumCell value={m.from.x} scale={1000} step={0.1} min={-1000} label={tag('mount.x1')} onCommit={(v) => v !== null && setMount(m.id, { from: { ...m.from, x: v } })} />
                  </td>
                  <td>
                    <NumCell value={m.from.y} scale={1000} step={0.1} min={-1000} label={tag('mount.y1')} onCommit={(v) => v !== null && setMount(m.id, { from: { ...m.from, y: v } })} />
                  </td>
                  <td>
                    <NumCell value={m.to.x} scale={1000} step={0.1} min={-1000} label={tag('mount.x2')} onCommit={(v) => v !== null && setMount(m.id, { to: { ...m.to, x: v } })} />
                  </td>
                  <td>
                    <NumCell value={m.to.y} scale={1000} step={0.1} min={-1000} label={tag('mount.y2')} onCommit={(v) => v !== null && setMount(m.id, { to: { ...m.to, y: v } })} />
                  </td>
                  <td>
                    <NumCell value={m.heightMm} scale={1000} step={0.1} label={tag('mount.height')} onCommit={(v) => setMount(m.id, { heightMm: v ?? 0 })} />
                  </td>
                  <td>
                    <NumCell value={m.maxLoadKg} step={5} label={tag('mount.maxLoad')} onCommit={(v) => setMount(m.id, { maxLoadKg: v })} />
                  </td>
                  <td>
                    {st ? `${t('lights.instruments', { n: st.count })} · ${kg(st.weightKg)}` : ''}
                    {st?.overloaded && (
                      <span class="warn" role="note">
                        {' '}
                        <span aria-hidden="true">⚠ </span>
                        {t('lights.overload')}
                      </span>
                    )}
                  </td>
                  <td>
                    <button type="button" class="pbtn" aria-label={t('mount.remove', { name: m.name })} title={t('mount.remove', { name: m.name })} onClick={() => removeMountRow(m.id)}>
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

function Electrical({ show }: { show: Show }) {
  const circuits = circuitLoads(show);
  const dimmers = dimmerLoads(show);
  const phases = phaseLoads(show);
  const total = phases.reduce((a, p) => a + p.powerW, 0);
  return (
    <div class="electrical">
      <p class="muted pad">{t('elec.region', { voltage: formatNumber(show.region.voltage, lang.value) })}</p>
      {circuits.length === 0 && dimmers.length === 0 && <p class="muted pad">{t('elec.empty')}</p>}
      {circuits.length > 0 && (
        <table class="list editable narrow">
          <caption>{t('elec.circuits')}</caption>
          <thead>
            <tr>
              <th>{t('table.circuit')}</th>
              <th>{t('lights.instruments', { n: 2 }).replace(/^\S+\s*/, '')}</th>
              <th>{t('table.power')}</th>
              <th>{t('elec.amps')}</th>
              <th>{t('elec.phase')}</th>
            </tr>
          </thead>
          <tbody>
            {circuits.map((c) => (
              <tr key={c.circuit}>
                <td class="mono num">{c.circuit}</td>
                <td class="mono num">{c.count}</td>
                <td class="mono num">{formatNumber(c.powerW, lang.value)}</td>
                <td class="mono num">{formatNumber(c.amps, lang.value, 2)}</td>
                <td>
                  <select class="input cell" aria-label={`${t('elec.phase')} · ${t('table.circuit')} ${c.circuit}`} value={c.phase === null ? '' : String(c.phase)} onChange={(e) => setPhase(c.circuit, (e.currentTarget as HTMLSelectElement).value ? Number((e.currentTarget as HTMLSelectElement).value) : null)}>
                    <option value="">{t('elec.nophase')}</option>
                    {[1, 2, 3].map((p) => (
                      <option key={p} value={p}>
                        L{p}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {dimmers.length > 0 && (
        <table class="list editable narrow">
          <caption>{t('elec.dimmers')}</caption>
          <thead>
            <tr>
              <th>{t('table.dimmer')}</th>
              <th>{t('lights.instruments', { n: 2 }).replace(/^\S+\s*/, '')}</th>
              <th>{t('table.power')}</th>
              <th>{t('elec.maxW')}</th>
            </tr>
          </thead>
          <tbody>
            {dimmers.map((d) => (
              <tr key={d.dimmer}>
                <td class="mono num">{d.dimmer}</td>
                <td class="mono num">{d.count}</td>
                <td class="mono num">{formatNumber(d.powerW, lang.value)}</td>
                <td>
                  <NumCell value={d.maxW} step={100} label={`${t('elec.maxW')} · ${t('table.dimmer')} ${d.dimmer}`} onCommit={(v) => setDimmerMaxW(d.dimmer, v)} />
                  {d.overloaded && (
                    <span class="warn" role="note">
                      <span aria-hidden="true">⚠ </span>
                      {t('lights.overloadDimmer')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {phases.length > 0 && (
        <table class="list narrow">
          <caption>{t('elec.phases')}</caption>
          <thead>
            <tr>
              <th>{t('elec.phase')}</th>
              <th>{t('table.power')}</th>
              <th>{t('elec.amps')}</th>
              <th>{t('elec.breaker')}</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((p) => (
              <tr key={p.phase ?? 'none'}>
                <td>{p.phase === null ? t('elec.nophase') : `L${p.phase}`}</td>
                <td class="mono num">{formatNumber(p.powerW, lang.value)}</td>
                <td class="mono num">{formatNumber(p.amps, lang.value, 2)}</td>
                <td>
                  {p.phase !== null && (
                    <NumCell value={show.electrical.phases.find((x) => x.name === `L${p.phase}`)?.breakerA ?? null} step={1} label={`${t('elec.breaker')} · L${p.phase}`} onCommit={(v) => setBreaker(p.phase!, v)} />
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <th>{t('elec.total')}</th>
              <th class="mono num">{formatNumber(total, lang.value)}</th>
              <th class="mono num">{formatNumber(Math.round((total / Math.max(1, show.region.voltage)) * 100) / 100, lang.value, 2)}</th>
              <th />
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

/** The magic sheet: instruments dragged (or moved with the arrow keys) to where the board operator wants to find them. */
function MagicSheetView({ show }: { show: Show }) {
  const box = useRef<HTMLDivElement>(null);
  const focusId = useRef<string | null>(null);
  const drag = useRef<{ id: string; g: SVGGElement; from: { x: number; y: number }; base: { x: number; y: number }; moved: boolean } | null>(null);
  const sheet = magicSheet(show, show.lang, { interactive: { label: (ch) => t('magic.item', { ch }) } });
  const arranged = Object.keys(show.magicLayout).length > 0;
  useEffect(() => {
    if (!focusId.current) return;
    box.current?.querySelector<SVGGElement>(`g.mi[data-id="${CSS.escape(focusId.current)}"]`)?.focus();
    focusId.current = null;
  });
  const toSheet = (ev: PointerEvent) => {
    const svg = box.current!.querySelector('svg')!;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  };
  const el = (id: string) => show.elements[id];
  const onDown = (ev: PointerEvent) => {
    const g = (ev.target as Element).closest<SVGGElement>('g.mi');
    const id = g?.dataset.id;
    if (!g || !id || !el(id) || ev.button !== 0) return;
    drag.current = { id, g, from: toSheet(ev), base: magicPosition(show, el(id)!), moved: false };
    g.classList.add('drag');
    box.current!.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toSheet(ev);
    d.moved = true;
    d.g.setAttribute('transform', `translate(${p.x - d.from.x} ${p.y - d.from.y})`);
  };
  const onUp = (ev: PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    d.g.classList.remove('drag');
    d.g.removeAttribute('transform');
    if (!d.moved) return;
    const p = toSheet(ev);
    focusId.current = d.id;
    setMagicPos(d.id, { x: d.base.x + p.x - d.from.x, y: d.base.y + p.y - d.from.y });
  };
  const onKey = (ev: KeyboardEvent) => {
    const id = (ev.target as Element).closest<SVGGElement>('g.mi')?.dataset.id;
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
    if (!id || !dir || !el(id)) return;
    ev.preventDefault();
    const step = ev.shiftKey ? 500 : ev.altKey ? 20 : 100;
    const b = magicPosition(show, el(id)!);
    focusId.current = id;
    setMagicPos(id, { x: b.x + dir[0]! * step, y: b.y + dir[1]! * step });
  };
  return (
    <section class="pad" aria-labelledby="ms-title">
      <h2 id="ms-title" class="sect-h">
        {t('magic.title')}
      </h2>
      {sheet ? (
        <>
          <div class="row">
            <button type="button" class="btn" disabled={!arranged} onClick={() => resetMagic()}>
              {t('magic.reset')}
            </button>
          </div>
          <div ref={box} class="magic" role="group" aria-label={t('magic.alt', { n: sheet.count })} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey} dangerouslySetInnerHTML={{ __html: sheet.svg }} />
        </>
      ) : (
        <p class="muted">{t('magic.empty')}</p>
      )}
    </section>
  );
}

function WorkNotes({ show }: { show: Show }) {
  const [text, setText] = useState('');
  const sel = selection.value[0];
  const selected = sel && show.elements[sel] ? show.elements[sel] : undefined;
  const add = (e: Event) => {
    e.preventDefault();
    if (!text.trim()) return;
    addNote(text.trim(), selected?.luminaire ? selected.id : null);
    setText('');
  };
  return (
    <section aria-labelledby="wn-title" class="pad">
      <h2 id="wn-title" class="sect-h">
        {t('worknotes.title')}
      </h2>
      <form class="row" onSubmit={add}>
        <label class="field grow">
          {t('worknotes.new')}
          <input class="input" value={text} maxLength={2000} onInput={(e) => setText((e.currentTarget as HTMLInputElement).value)} />
        </label>
        <button type="submit" class="btn primary" disabled={!text.trim()}>
          {t('worknotes.add')}
        </button>
      </form>
      {selected?.luminaire && <p class="muted">{t('worknotes.tie', { name: name(selected) })}</p>}
      {show.workNotes.length === 0 ? (
        <p class="muted">{t('worknotes.empty')}</p>
      ) : (
        <ul class="notelist">
          {show.workNotes.map((n) => (
            <li key={n.id}>
              <label class="mod">
                <input type="checkbox" checked={n.done} onChange={() => setNote(n.id, { done: !n.done })} aria-label={t('worknotes.done', { text: n.text })} />
                <span style={n.done ? 'text-decoration:line-through' : undefined}>{n.text}</span>
              </label>
              {n.refId && show.elements[n.refId] && (
                <button type="button" class="chipbtn" onClick={() => selectElement(n.refId!)}>
                  {name(show.elements[n.refId]!)}
                </button>
              )}
              <button type="button" class="btn" aria-label={t('worknotes.remove', { text: n.text })} onClick={() => removeNote(n.id)}>
                {t('worknotes.removeShort')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Section({ show }: { show: Show }) {
  const sh = show.stage.shape;
  const depth = sh.kind === 'rect' ? sh.depth : Math.max(...sh.points.map((p) => p.y));
  const opening = show.stage.referenceLines.proscenium ? (show.stage.prosceniumHeight ?? 0) : 0; // height of the proscenium opening above the deck
  const mounts = mountList(show);
  const lum = luminaires(show);
  const deck = show.stage.height; // mount heights are measured from the stage deck
  const raised = levels(show);
  const top = deck + Math.max(4000, opening, ...mounts.map((m) => m.heightMm), ...raised.map((l) => l.heightMm)) + 800;
  const W = 900;
  const H = 360;
  const pad = 50;
  const sx = (W - 2 * pad) / depth;
  const sz = (H - 2 * pad) / top;
  const X = (y: number) => pad + y * sx;
  const Z = (z: number) => H - pad - z * sz;
  const mountY = (m: Mount) => (m.from.y + m.to.y) / 2;
  return (
    <figure class="sect">
      <h2 class="sect-h">{t('section.title')}</h2>
      <svg viewBox={`0 0 ${W} ${H}`} class="flowsvg" role="img" aria-label={t('section.alt', { n: mounts.length })}>
        <line x1={pad - 20} y1={Z(0)} x2={W - pad + 20} y2={Z(0)} class="fl main" />
        {deck > 0 && <rect x={X(0)} y={Z(deck)} width={X(depth) - X(0)} height={Z(0) - Z(deck)} class="flbox desk" />}
        {deck > 0 && (
          <text x={X(depth / 2)} y={(Z(0) + Z(deck)) / 2 + 4} text-anchor="middle" class="fltext">
            {t('section.deck')} · {formatNumber(deck / 1000, lang.value, 1)} m
          </text>
        )}
        {raised.map((l) => (
          <g key={l.element.id}>
            <rect x={X(l.from)} y={Z(deck + l.heightMm)} width={Math.max(2, X(l.to) - X(l.from))} height={Math.max(1, Z(deck) - Z(deck + l.heightMm))} class="flbox desk" />
            <text x={(X(l.from) + X(l.to)) / 2} y={Z(deck + l.heightMm) - 4} text-anchor="middle" class="fltext">
              {formatNumber((deck + l.heightMm) / 1000, lang.value, 1)} m
            </text>
          </g>
        ))}
        {opening > 0 && (
          <g>
            <line x1={X(depth)} y1={Z(deck + opening)} x2={X(depth)} y2={Z(top)} class="fl main" />
            <line x1={X(depth) - 12} y1={Z(deck + opening)} x2={X(depth) + 12} y2={Z(deck + opening)} class="fl main" />
            <text x={X(depth) - 8} y={Z(deck + opening) - 6} text-anchor="end" class="fltext">
              {t('section.proscenium')} · {formatNumber(opening / 1000, lang.value, 1)} m
            </text>
          </g>
        )}
        <text x={pad - 20} y={Z(0) + 18} class="fltext">
          {t('section.floor')}
        </text>
        <text x={pad} y={20} class="flowhead">
          {t('section.back')}
        </text>
        <text x={W - pad} y={20} text-anchor="end" class="flowhead">
          {t('section.front')}
        </text>
        {mounts.map((m) => {
          const x = X(mountY(m));
          const z = Z(deck + m.heightMm);
          const here = lum.filter((e) => e.luminaire!.mountId === m.id);
          return (
            <g key={m.id}>
              <line x1={x} y1={z} x2={x} y2={Z(deck)} class="fl ret" />
              <rect x={x - 22} y={z - 3} width="44" height="6" class="flbox desk" />
              {here.map((e, i) => (
                <circle key={e.id} cx={x - 18 + (i % 4) * 12} cy={z + 14 + Math.floor(i / 4) * 12} r="4.5" class="dot" />
              ))}
              <text x={x} y={z - 12} text-anchor="middle" class="flbox-t">
                {m.name} · {m.heightMm > 0 ? `${formatNumber(m.heightMm / 1000, lang.value, 1)} m` : t('section.noHeight')}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/** Inspector section for a luminaire. */
export function LuminairePanel({ el, show }: { el: PlanElement; show: Show }) {
  const l = el.luminaire!;
  const f = l.modelId ? fixtureById(l.modelId) : undefined;
  return (
    <div class="panel">
      <h2>{t('lights.title')}</h2>
      <label class="field">
        {t('table.model')}
        <ModelSelect el={el} label={t('table.model')} cls="input" full />
      </label>
      {f?.estimate && <span class="muted">{t('lights.estimate')}</span>}
      {f?.community && (
        <span class="muted">
          {t('lights.community')}{' '}
          <a href={f.source} target="_blank" rel="noopener noreferrer">
            Open Fixture Library
          </a>
        </span>
      )}
      <label class="field">
        {t('table.mount')}
        <MountSelect show={show} el={el} label={t('table.mount')} cls="input" />
      </label>
      <div class="grid2">
        <label class="field">
          {t('table.unit')}
          <NumCell value={l.unit} label={t('table.unit')} onCommit={(v) => setLuminaire(el.id, { unit: v })} />
        </label>
        <label class="field">
          {t('table.ch')}
          <NumCell value={l.channel} label={t('table.ch')} onCommit={(v) => setLuminaire(el.id, { channel: v })} />
        </label>
        <label class="field">
          {t('table.dimmer')}
          <NumCell value={l.dimmer} label={t('table.dimmer')} onCommit={(v) => setLuminaire(el.id, { dimmer: v })} />
        </label>
        <label class="field">
          {t('table.circuit')}
          <NumCell value={l.circuit} label={t('table.circuit')} onCommit={(v) => setLuminaire(el.id, { circuit: v })} />
        </label>
        <label class="field">
          {t('table.weight')}
          <NumCell value={el.weightKg} step={0.1} label={t('table.weight')} onCommit={(v) => setElementNumber(el.id, 'weightKg', v)} />
        </label>
        <label class="field">
          {t('table.power')}
          <NumCell value={el.powerW} label={t('table.power')} onCommit={(v) => setElementNumber(el.id, 'powerW', v)} />
        </label>
      </div>
      <fieldset class="field" style="border:0;padding:0;margin:0">
        <legend>{t('focus.title')}</legend>
        {l.focus ? (
          <div class="grid2">
            <label class="field">
              X (m)
              <NumCell value={l.focus.x} scale={1000} step={0.1} min={-1000} label={`${t('focus.title')} X (m)`} onCommit={(v) => setFocusPoint(el.id, { x: v ?? 0, y: l.focus!.y })} />
            </label>
            <label class="field">
              Y (m)
              <NumCell value={l.focus.y} scale={1000} step={0.1} min={-1000} label={`${t('focus.title')} Y (m)`} onCommit={(v) => setFocusPoint(el.id, { x: l.focus!.x, y: v ?? 0 })} />
            </label>
            <button type="button" class="btn" onClick={() => setFocusPoint(el.id, null)}>
              {t('focus.clear')}
            </button>
          </div>
        ) : (
          <button type="button" class="btn" onClick={() => setFocusPoint(el.id, defaultFocus(show))}>
            {t('focus.set')}
          </button>
        )}
      </fieldset>
      <label class="field">
        {t('table.color')}
        <input class="input" value={l.color} maxLength={40} onChange={(e) => setLuminaire(el.id, { color: (e.currentTarget as HTMLInputElement).value })} />
      </label>
    </div>
  );
}
