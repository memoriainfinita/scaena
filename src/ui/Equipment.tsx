// The equipment view: every element of the plan and every connection in tables that edit in place, and the video signals on their own.
import { connFilter, equipFilter, equipTab, setConnFilter, setEquipFilter, type EquipTab } from '../app/equipment-actions.ts';
import { dropConnection, setComputerOutput, setConnection } from '../app/computer-actions.ts';
import { selectElement } from '../app/lights-actions.ts';
import { DEFAULT_LAYER_IDS, selection, setElementField } from '../app/state.ts';
import { lang, t, type Key } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { connectionRows, equipmentRows, EQUIPMENT_SORTS, videoRows, type ElementText } from '../model/equipment.ts';
import { estimateCableMm, SIGNALS } from '../model/connections.ts';
import type { Connection, PlanElement, Show } from '../model/schema.ts';
import { inUnits, lengthScale } from '../model/units.ts';
import { Cell } from './Audio.tsx';
import { CABLES, CONNECTORS, elementName } from './Computer.tsx';
import { IssueMark } from './IssueMark.tsx';
import { NumCell } from './Lights.tsx';
import { LIMITS } from '../model/limits.ts';

const TABS: EquipTab[] = ['elements', 'connections', 'video'];
const SUPPLIERS = ['unset', 'band', 'venue', 'rental'] as const;

const textOf = (el: PlanElement): ElementText => {
  const item = itemById(el.type.id);
  return { name: elementName(el), type: item?.name[lang.value] ?? el.type.id, category: item?.category ?? '' };
};

export function EquipmentView({ show }: { show: Show }) {
  const tab = equipTab.value;
  return (
    <div class="scroll">
      <nav class="subtabs" aria-label={t('equip.tabs')}>
        {TABS.map((x) => (
          <button key={x} type="button" class="chipbtn" aria-pressed={tab === x} aria-current={tab === x ? 'page' : undefined} onClick={() => (equipTab.value = x)}>
            {t(`equip.tab.${x}` as Key)}
          </button>
        ))}
      </nav>
      {tab === 'elements' && <Elements show={show} />}
      {tab === 'connections' && <Connections show={show} />}
      {tab === 'video' && <Video show={show} />}
    </div>
  );
}

function Elements({ show }: { show: Show }) {
  const f = equipFilter.value;
  const rows = equipmentRows(show, f, textOf, lang.value);
  const sel = new Set(selection.value);
  const categories = [...new Set(Object.values(show.elements).map((e) => itemById(e.type.id)?.category ?? ''))].filter(Boolean).sort();
  const layerName = (l: Show['layers'][number]) => (DEFAULT_LAYER_IDS.has(l.id) ? t(`layer.${l.subject}` as Key) : l.name);
  return (
    <>
      <div class="listbar">
        <label class="field-inline">
          <span>{t('equip.search')}</span>
          <input class="input" type="search" value={f.query} onInput={(e) => setEquipFilter({ query: (e.currentTarget as HTMLInputElement).value })} />
        </label>
        <label class="field-inline">
          <span>{t('equip.layer')}</span>
          <select class="input" value={f.layerId} onChange={(e) => setEquipFilter({ layerId: (e.currentTarget as HTMLSelectElement).value })}>
            <option value="">{t('equip.all')}</option>
            {show.layers.map((l) => (
              <option key={l.id} value={l.id}>
                {layerName(l)}
              </option>
            ))}
          </select>
        </label>
        <label class="field-inline">
          <span>{t('equip.category')}</span>
          <select class="input" value={f.category} onChange={(e) => setEquipFilter({ category: (e.currentTarget as HTMLSelectElement).value })}>
            <option value="">{t('equip.all')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {t(`library.cat.${c}` as Key)}
              </option>
            ))}
          </select>
        </label>
        <label class="field-inline">
          <span>{t('equip.supplied')}</span>
          <select class="input" value={f.suppliedBy} onChange={(e) => setEquipFilter({ suppliedBy: (e.currentTarget as HTMLSelectElement).value })}>
            <option value="">{t('equip.all')}</option>
            {SUPPLIERS.map((o) => (
              <option key={o} value={o}>
                {t(`supplied.${o}` as Key)}
              </option>
            ))}
          </select>
        </label>
        <label class="field-inline">
          <span>{t('equip.sort')}</span>
          <select class="input" value={f.sort} onChange={(e) => setEquipFilter({ sort: (e.currentTarget as HTMLSelectElement).value as (typeof EQUIPMENT_SORTS)[number] })}>
            {EQUIPMENT_SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`equip.sort.${s}` as Key)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {Object.keys(show.elements).length === 0 ? (
        <p class="muted pad">{t('equip.empty')}</p>
      ) : rows.length === 0 ? (
        <p class="muted pad" role="status">
          {t('equip.noMatch')}
        </p>
      ) : (
        <table class="list editable wide equip-el">
          <thead>
            <tr>
              <th>{t('equip.col.name')}</th>
              <th>{t('equip.col.type')}</th>
              <th>{t('equip.layer')}</th>
              <th>{t('equip.supplied')}</th>
              <th>{t('table.weight')}</th>
              <th>{t('table.power')}</th>
              <th>{t('elec.phase')}</th>
              <th>{t('equip.col.ip')}</th>
              <th>{t('equip.col.ports')}</th>
              <th>{t('table.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((el) => {
              const n = elementName(el);
              const tag = (k: Key) => `${t(k)} · ${n}`;
              return (
                <tr key={el.id} class={sel.has(el.id) ? 'sel' : undefined} onFocusIn={() => selectElement(el.id)}>
                  <td class="elname">
                    <IssueMark refKey={`element:${el.id}`} />
                    <Cell value={el.label} label={tag('equip.col.name')} max={LIMITS.label} placeholder={textOf(el).type} onCommit={(v) => setElementField(el.id, { label: v })} />
                  </td>
                  <td>{textOf(el).type}</td>
                  <td>
                    <select class="input cell" aria-label={tag('equip.layer')} value={el.layerId} onChange={(e) => setElementField(el.id, { layerId: (e.currentTarget as HTMLSelectElement).value })}>
                      {show.layers.map((l) => (
                        <option key={l.id} value={l.id}>
                          {layerName(l)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select class="input cell" aria-label={tag('equip.supplied')} value={el.suppliedBy} onChange={(e) => setElementField(el.id, { suppliedBy: (e.currentTarget as HTMLSelectElement).value as PlanElement['suppliedBy'] })}>
                      {SUPPLIERS.map((o) => (
                        <option key={o} value={o}>
                          {t(`supplied.${o}` as Key)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <NumCell value={el.weightKg} label={tag('table.weight')} step={0.1} onCommit={(v) => setElementField(el.id, { weightKg: v })} />
                  </td>
                  <td>
                    <NumCell value={el.powerW} label={tag('table.power')} onCommit={(v) => setElementField(el.id, { powerW: v })} />
                  </td>
                  <td>
                    <select class="input cell" aria-label={tag('elec.phase')} value={el.phase === null ? '' : String(el.phase)} onChange={(e) => setElementField(el.id, { phase: (e.currentTarget as HTMLSelectElement).value ? Number((e.currentTarget as HTMLSelectElement).value) : null })}>
                      <option value="">{t('elec.nophase')}</option>
                      {[1, 2, 3].map((p) => (
                        <option key={p} value={String(p)}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Cell value={el.ip} label={tag('equip.col.ip')} max={45} mono onCommit={(v) => setElementField(el.id, { ip: v })} />
                  </td>
                  <td class="mono num">{el.ports.length || ''}</td>
                  <td>
                    <Cell value={el.notes} label={tag('table.notes')} max={LIMITS.notes} onCommit={(v) => setElementField(el.id, { notes: v })} />
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

/** The two ports of a connection that its elements declare: a select per end, or nothing when the element has none. */
function PortSelect({ el, value, label, onPick }: { el: PlanElement | undefined; value: string | null; label: string; onPick: (id: string | null) => void }) {
  if (!el || el.ports.length === 0) return null;
  return (
    <select class="input cell" aria-label={label} value={value ?? ''} onChange={(e) => onPick((e.currentTarget as HTMLSelectElement).value || null)}>
      <option value="">{t('connections.noPort')}</option>
      {el.ports.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} · {t(`ports.dir.${p.dir}` as Key)} · {p.channels}
        </option>
      ))}
    </select>
  );
}

function LengthCell({ show, c, label }: { show: Show; c: Connection; label: string }) {
  const est = estimateCableMm(show, c);
  const scale = lengthScale(show.units);
  return (
    <input
      class="input cell mono"
      type="number"
      min="0"
      step="0.5"
      disabled={!!c.wireless}
      aria-label={label}
      placeholder={c.lengthMm === null && est !== null ? `≈ ${Math.round((est / scale) * 10) / 10}` : ''}
      title={c.lengthMm === null ? t('connections.estimate') : undefined}
      value={c.lengthMm === null ? '' : Math.round((c.lengthMm / scale) * 1000) / 1000}
      onChange={(e) => {
        const raw = (e.currentTarget as HTMLInputElement).value;
        const v = Number(raw);
        setConnection(c.id, { lengthMm: raw === '' || !Number.isFinite(v) || v < 0 ? null : Math.round(v * scale) });
      }}
    />
  );
}

function ConnectorList() {
  return (
    <>
      {SIGNALS.map((s) => (
        <datalist key={s} id={`equip-cables-${s}`}>
          {CABLES[s].map((x) => (
            <option key={x} value={x} />
          ))}
        </datalist>
      ))}
    </>
  );
}

/** The cells every connection row shares; `full` adds the signal and the channels. */
function ConnectionRow({ show, c, full }: { show: Show; c: Connection; full: boolean }) {
  const from = show.elements[c.from];
  const to = show.elements[c.to];
  const twins = Object.values(show.connections).filter((o) => o.from === c.from && o.to === c.to).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  const n = `${elementName(from)} → ${elementName(to)}` + (twins.length > 1 ? ` · ${twins.findIndex((o) => o.id === c.id) + 1}` : '');
  const tag = (k: Key) => `${t(k)} · ${n}`;
  const sel = new Set(selection.value);
  return (
    <tr key={c.id} class={sel.has(c.from) || sel.has(c.to) ? 'sel' : undefined} onFocusIn={() => selectElement(c.from)}>
      <td class="elname">
        {elementName(from)}
        <PortSelect el={from} value={c.fromPortId} label={t('connections.portAt', { name: elementName(from) }) + ` · ${n}`} onPick={(id) => setConnection(c.id, { fromPortId: id })} />
      </td>
      <td class="elname">
        {elementName(to)}
        <PortSelect el={to} value={c.toPortId} label={t('connections.portAt', { name: elementName(to) }) + ` · ${n}`} onPick={(id) => setConnection(c.id, { toPortId: id })} />
      </td>
      {full && (
        <td>
          <select class="input cell" aria-label={tag('equip.signal')} value={c.signal} onChange={(e) => setConnection(c.id, { signal: (e.currentTarget as HTMLSelectElement).value as Connection['signal'] })}>
            {SIGNALS.map((s) => (
              <option key={s} value={s}>
                {t(`signal.${s}` as Key)}
              </option>
            ))}
          </select>
        </td>
      )}
      <td>
        <input class="input cell" list={`equip-cables-${c.signal}`} aria-label={tag('connections.connector')} value={c.connector} maxLength={40} onChange={(e) => setConnection(c.id, { connector: (e.currentTarget as HTMLInputElement).value })} />
      </td>
      {full && (
        <td>
          {c.signal === 'audio' || c.signal === 'usb' ? (
            <>
              <input
                class="input cell mono"
                type="number"
                min="1"
                max="512"
                step="1"
                aria-label={tag('connections.channels')}
                value={c.channels ?? c.lines}
                onChange={(e) => {
                  const v = Math.floor(Number((e.currentTarget as HTMLInputElement).value));
                  if (Number.isFinite(v) && v >= 1 && v <= 512) setConnection(c.id, { channels: v, lines: Math.min(v, 64) });
                }}
              />
              <label class="check">
                <input type="checkbox" checked={c.stereo} aria-label={tag('connections.stereo')} onChange={(e) => setConnection(c.id, { stereo: (e.currentTarget as HTMLInputElement).checked })} />
                {t('connections.stereo')}
              </label>
            </>
          ) : null}
        </td>
      )}
      <td>
        {c.signal === 'video' && <Cell value={c.format} label={tag('connections.format')} max={40} placeholder="1920x1080 50p" title={t('connections.format.tip')} onCommit={(v) => setConnection(c.id, { format: v })} />}
      </td>
      <td>
        <LengthCell show={show} c={c} label={`${inUnits(t('connections.length'), show.units)} · ${n}`} />
      </td>
      <td>
        <input type="checkbox" checked={!!c.wireless} aria-label={tag('connections.wireless')} onChange={(e) => setConnection(c.id, { wireless: (e.currentTarget as HTMLInputElement).checked })} />
      </td>
      <td>
        <Cell value={c.label} label={tag('table.notes')} max={80} onCommit={(v) => setConnection(c.id, { label: v })} />
      </td>
      <td class="rowbtns">
        <button type="button" class="pbtn" aria-label={t('connections.remove', { name: n })} title={t('connections.remove', { name: n })} onClick={() => dropConnection(c.id)}>
          ✕
        </button>
      </td>
    </tr>
  );
}

function ConnectionHead({ full }: { full: boolean }) {
  return (
    <thead>
      <tr>
        <th>{t('equip.col.from')}</th>
        <th>{t('equip.col.to')}</th>
        {full && <th>{t('equip.signal')}</th>}
        <th>{t('connections.connector')}</th>
        {full && <th>{t('connections.channels')}</th>}
        <th title={t('connections.format.tip')}>{t('connections.format')}</th>
        <th>{inUnits(t('connections.length'), 'metric')}</th>
        <th>{t('connections.wireless')}</th>
        <th>{t('table.notes')}</th>
        <th />
      </tr>
    </thead>
  );
}

function Connections({ show }: { show: Show }) {
  const f = connFilter.value;
  const rows = connectionRows(show, f, elementName, lang.value);
  return (
    <>
      <div class="listbar">
        <label class="field-inline">
          <span>{t('equip.search')}</span>
          <input class="input" type="search" value={f.query} onInput={(e) => setConnFilter({ query: (e.currentTarget as HTMLInputElement).value })} />
        </label>
        <label class="field-inline">
          <span>{t('equip.signal')}</span>
          <select class="input" value={f.signal} onChange={(e) => setConnFilter({ signal: (e.currentTarget as HTMLSelectElement).value })}>
            <option value="">{t('equip.all')}</option>
            {SIGNALS.map((s) => (
              <option key={s} value={s}>
                {t(`signal.${s}` as Key)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {Object.keys(show.connections).length === 0 ? (
        <p class="muted pad">{t('equip.noConnections')}</p>
      ) : rows.length === 0 ? (
        <p class="muted pad" role="status">
          {t('equip.noMatch')}
        </p>
      ) : (
        <table class="list editable wide">
          <ConnectionHead full />
          <tbody>
            {rows.map((c) => (
              <ConnectionRow key={c.id} show={show} c={c} full />
            ))}
          </tbody>
        </table>
      )}
      <ConnectorList />
    </>
  );
}

function Video({ show }: { show: Show }) {
  const { links, outputs } = videoRows(show, elementName, lang.value);
  const sel = new Set(selection.value);
  return (
    <>
      <h2 class="pad">{t('equip.video.links')}</h2>
      {links.length === 0 ? (
        <p class="muted pad">{t('equip.video.none')}</p>
      ) : (
        <table class="list editable wide">
          <ConnectionHead full={false} />
          <tbody>
            {links.map((c) => (
              <ConnectionRow key={c.id} show={show} c={c} full={false} />
            ))}
          </tbody>
        </table>
      )}
      <h2 class="pad">{t('equip.video.outputs')}</h2>
      {outputs.length === 0 ? (
        <p class="muted pad">{t('equip.video.noOutputs')}</p>
      ) : (
        <table class="list editable wide">
          <thead>
            <tr>
              <th>{t('equip.col.name')}</th>
              <th>{t('equip.col.output')}</th>
              <th>{t('equip.col.note')}</th>
            </tr>
          </thead>
          <tbody>
            {outputs.map(({ element, index, output }) => {
              const n = `${elementName(element)} · ${index + 1}`;
              return (
                <tr key={`${element.id}-${index}`} class={sel.has(element.id) ? 'sel' : undefined} onFocusIn={() => selectElement(element.id)}>
                  <td class="elname">{elementName(element)}</td>
                  <td>
                    <select class="input cell" aria-label={`${t('equip.col.output')} · ${n}`} value={output.connector} onChange={(e) => setComputerOutput(element.id, index, { connector: (e.currentTarget as HTMLSelectElement).value as (typeof CONNECTORS)[number] })}>
                      {CONNECTORS.map((c) => (
                        <option key={c} value={c}>
                          {t(`connector.${c}` as Key)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Cell value={output.note} label={`${t('equip.col.note')} · ${n}`} max={200} onCommit={(v) => setComputerOutput(element.id, index, { note: v })} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <ConnectorList />
    </>
  );
}
