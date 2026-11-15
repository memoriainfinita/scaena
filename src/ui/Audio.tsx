// The audio lists: inputs and outputs are edited in place, and the signal flow draws the whole chain.
import { addChannelRow, addOutputRow, moveChannelRow, moveOutputRow, moveOutputToDesk, sendChannelToDesk, setChannelDeskPatch, numberWedgeOutputs, pairChannel, removeChannelRow, removeOutputRow, selectSource, setChannel, setChannelMic, setDeskModel, setDeskShowFile, setMix, setOutput, sortByInstrument } from '../app/audio-actions.ts';
import { selection } from '../app/state.ts';
import { IssueMark } from './IssueMark.tsx';
import { currentDesk, DeskBar, deskLabel } from './Desks.tsx';
import { lang, t, type Key } from '../i18n/index.ts';
import { itemById } from '../library/items.ts';
import { AUDIO, audioLabel } from '../library/models.ts';
import { channelList, mixOutputs, outputList, wedgesInOrder } from '../model/audio.ts';
import { channelOn, desksOf, mainDeskId, outputsOnDesk } from '../model/desks.ts';
import { patchAnalysis } from '../model/patch.ts';
import { stagePosition } from '../model/position.ts';
import { cableText } from '../reports/reports.ts';
import type { InputChannel, MixLevel, Output, PlanElement, Show } from '../model/schema.ts';

const elementName = (el: PlanElement): string => el.label || itemById(el.type.id)?.name[lang.value] || el.type.id;

function sourceOptions(show: Show): { id: string; name: string }[] {
  return Object.values(show.elements)
    .filter((e) => itemById(e.type.id)?.layer !== 'notes')
    .map((e) => ({ id: e.id, name: elementName(e) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang.value));
}

export function Cell({ value, label, onCommit, list, max, mono, placeholder, title }: { value: string; label: string; onCommit: (v: string) => void; list?: string; max?: number; mono?: boolean; placeholder?: string; title?: string }) {
  return <input class={`input cell${mono ? ' mono' : ''}`} aria-label={label} list={list} maxLength={max} value={value} placeholder={placeholder} title={title} onChange={(e) => onCommit((e.currentTarget as HTMLInputElement).value)} />;
}

function RowButtons({ row, onUp, onDown, onRemove, first, last }: { row: string; onUp: () => void; onDown: () => void; onRemove: () => void; first: boolean; last: boolean }) {
  const tag = (k: Key) => `${t(k)} · ${row}`;
  return (
    <td class="rowbtns">
      <button type="button" class="pbtn" aria-label={tag('table.up')} title={t('table.up')} disabled={first} onClick={onUp}>
        ↑
      </button>
      <button type="button" class="pbtn" aria-label={tag('table.down')} title={t('table.down')} disabled={last} onClick={onDown}>
        ↓
      </button>
      <button type="button" class="pbtn" aria-label={tag('table.remove')} title={t('table.remove')} onClick={onRemove}>
        ✕
      </button>
    </td>
  );
}

export function InputsView({ show }: { show: Show }) {
  const multi = desksOf(show).length > 1;
  const desk = currentDesk(show);
  const all = channelList(show);
  // With several desks the list follows the chosen one: the sources it receives by their number there, then the rest.
  const rows = multi
    ? [...all].sort((a, b) => (channelOn(show, a, desk.id)?.number ?? Infinity) - (channelOn(show, b, desk.id)?.number ?? Infinity) || a.number - b.number)
    : all;
  const sel = new Set(selection.value);
  const sources = sourceOptions(show);
  return (
    <div class="scroll">
      <DeskBar show={show} />
      <div class="listbar">
        <button type="button" class="btn" onClick={() => addChannelRow(multi ? desk.id : undefined)}>
          {t('inputs.add')}
        </button>
        <button type="button" class="btn" onClick={() => sortByInstrument()} disabled={rows.length < 2 || (multi && desk.id !== mainDeskId(show))}>
          {t('inputs.sort')}
        </button>
      </div>
      <datalist id="mic-models">
        {AUDIO.filter((a) => a.kind === 'mic' || a.kind === 'di').map((a) => (
          <option key={a.id} value={`${a.brand} ${a.model}`} />
        ))}
      </datalist>
      {rows.length === 0 ? (
        <p class="muted pad">{t('inputs.empty')}</p>
      ) : (
        <table class="list editable">
          <thead>
            <tr>
              <th>{t('table.number')}</th>
              {multi && <th title={t('table.onDesk.tip')}>{t('table.onDesk')}</th>}
              <th>{t('table.name')}</th>
              <th title={t('table.mic.tip')}>{t('table.mic')}</th>
              <th title={t('table.stand.tip')}>{t('table.stand')}</th>
              <th>{t('table.patch')}</th>
              <th>{t('table.phantom')}</th>
              <th>{t('table.pair')}</th>
              <th>{t('table.source')}</th>
              <th>{t('table.position')}</th>
              <th>{t('table.notes')}</th>
              <th>{t('connections.title')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <ChannelRow key={c.id} show={show} c={c} i={i} count={rows.length} rows={rows} sources={sources} deskId={multi ? desk.id : null} selected={!!c.sourceElementId && sel.has(c.sourceElementId)} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ChannelRow({ show, c, i, count, rows, sources, selected, deskId }: { show: Show; c: InputChannel; i: number; count: number; rows: InputChannel[]; sources: { id: string; name: string }[]; selected: boolean; deskId: string | null }) {
  const row = t('inputs.row', { n: c.number });
  const tag = (k: Key) => `${t(k)} · ${row}`;
  const src = c.sourceElementId ? show.elements[c.sourceElementId] : undefined;
  // On a desk of several: the number and patch the source has there, or nothing when it is not sent.
  const at = deskId ? channelOn(show, c, deskId) : { number: c.number, patch: c.patch };
  const onMain = deskId === null || deskId === mainDeskId(show);
  return (
    <tr class={[selected ? 'sel' : '', at ? '' : 'unsent'].filter(Boolean).join(' ') || undefined} onFocusIn={() => selectSource(c.sourceElementId)}>
      <td class="mono num">
        <IssueMark refKey={`channel:${c.id}`} />
        {deskId && !onMain && at ? (
          <input
            class="input cell mono"
            type="number"
            min={1}
            step={1}
            aria-label={tag('table.number')}
            title={t('table.deskNumber.tip')}
            value={at.number}
            onChange={(e) => {
              const n = Math.floor(Number((e.currentTarget as HTMLInputElement).value));
              if (n >= 1) sendChannelToDesk(c.id, deskId, n);
            }}
          />
        ) : at ? (
          at.number
        ) : (
          '—'
        )}
      </td>
      {deskId && (
        <td class="center">
          <input type="checkbox" aria-label={tag('table.onDesk')} title={t('table.onDesk.tip')} checked={!!at} onChange={(e) => sendChannelToDesk(c.id, deskId, (e.currentTarget as HTMLInputElement).checked ? undefined : null)} />
        </td>
      )}
      <td>
        <Cell value={c.shortName} label={tag('table.name')} max={16} onCommit={(v) => setChannel(c.id, { shortName: v })} />
      </td>
      <td>
        <Cell value={audioLabel(c.mic)} label={tag('table.mic')} list="mic-models" max={80} onCommit={(v) => setChannelMic(c.id, v)} />
      </td>
      <td>
        <Cell value={c.stand} label={tag('table.stand')} max={80} onCommit={(v) => setChannel(c.id, { stand: v })} />
      </td>
      <td>
        <Cell
          value={at?.patch ?? ''}
          label={tag('table.patch')}
          max={24}
          mono
          placeholder={onMain ? patchAnalysis(show).derived.get(c.id) : undefined}
          title={onMain && !c.patch && patchAnalysis(show).derived.has(c.id) ? t('inputs.patchDerived') : undefined}
          onCommit={(v) => (deskId && at ? setChannelDeskPatch(c.id, deskId, v) : setChannel(c.id, { patch: v }))}
        />
      </td>
      <td class="center">
        <input type="checkbox" aria-label={tag('table.phantom')} checked={c.phantom} onChange={(e) => setChannel(c.id, { phantom: (e.currentTarget as HTMLInputElement).checked })} />
      </td>
      <td>
        <select class="input cell" aria-label={tag('table.pair')} value={c.stereoPairWith ?? ''} onChange={(e) => pairChannel(c.id, (e.currentTarget as HTMLSelectElement).value || null)}>
          <option value="">{t('table.none')}</option>
          {rows
            .filter((o) => o.id !== c.id)
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.number} · {o.shortName}
              </option>
            ))}
        </select>
      </td>
      <td>
        <select class="input cell" aria-label={tag('table.source')} value={c.sourceElementId ?? ''} onChange={(e) => setChannel(c.id, { sourceElementId: (e.currentTarget as HTMLSelectElement).value || null })}>
          <option value="">{t('table.none')}</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </td>
      <td class="mono">{src ? stagePosition(show, src) : ''}</td>
      <td>
        <Cell value={c.notes} label={tag('table.notes')} onCommit={(v) => setChannel(c.id, { notes: v })} />
      </td>
      <td class="cabletext">{src ? cableText(show, src.id, ['audio'], lang.value) : ''}</td>
      <RowButtons row={row} first={i === 0 || !onMain} last={i === count - 1 || !onMain} onUp={() => moveChannelRow(c.id, -1)} onDown={() => moveChannelRow(c.id, 1)} onRemove={() => removeChannelRow(c.id)} />
    </tr>
  );
}

const KINDS: Output['kind'][] = ['wedge', 'iem', 'main', 'send'];

export function OutputsView({ show }: { show: Show }) {
  const desks = desksOf(show);
  const multi = desks.length > 1;
  const desk = currentDesk(show);
  const rows = multi ? outputsOnDesk(show, desk.id) : outputList(show);
  const sel = new Set(selection.value);
  const sources = sourceOptions(show);
  return (
    <div class="scroll">
      <DeskBar show={show} />
      <div class="listbar">
        <button type="button" class="btn" onClick={() => addOutputRow('wedge', multi ? desk.id : undefined)}>
          {t('outputs.add')}
        </button>
        <button type="button" class="btn" onClick={() => numberWedgeOutputs()} disabled={wedgesInOrder(show)}>
          {t('outputs.numberWedges')}
        </button>
      </div>
      {rows.length === 0 ? (
        <p class="muted pad">{t('outputs.empty')}</p>
      ) : (
        <table class="list editable">
          <thead>
            <tr>
              <th>{t('table.outNumber')}</th>
              {multi && <th title={t('table.desk.tip')}>{t('table.desk')}</th>}
              <th title={t('table.kind.tip')}>{t('table.kind')}</th>
              <th title={t('table.stereo.tip')}>{t('table.stereo')}</th>
              <th title={t('table.aux.tip')}>{t('table.aux')}</th>
              <th>{t('table.source')}</th>
              <th title={t('table.who.tip')}>{t('table.who')}</th>
              <th>{t('table.notes')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((o, i) => {
              const row = t('outputs.row', { n: o.number });
              const tag = (k: Key) => `${t(k)} · ${row}`;
              return (
                <tr key={o.id} class={o.sourceElementId && sel.has(o.sourceElementId) ? 'sel' : undefined} onFocusIn={() => selectSource(o.sourceElementId)}>
                  <td class="mono num">
                    <IssueMark refKey={`output:${o.id}`} />
                    {o.number}
                  </td>
                  {multi && (
                    <td>
                      <select class="input cell" aria-label={tag('table.desk')} value={desk.id} onChange={(e) => moveOutputToDesk(o.id, (e.currentTarget as HTMLSelectElement).value)}>
                        {desks.map((d) => (
                          <option key={d.id} value={d.id}>
                            {deskLabel(d)}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td>
                    <select class="input cell" aria-label={tag('table.kind')} value={o.kind} onChange={(e) => setOutput(o.id, { kind: (e.currentTarget as HTMLSelectElement).value as Output['kind'] })}>
                      {KINDS.map((k) => (
                        <option key={k} value={k}>
                          {t(`out.kind.${k}` as Key)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td class="center">
                    <input type="checkbox" aria-label={tag('table.stereo')} checked={o.stereo} onChange={(e) => setOutput(o.id, { stereo: (e.currentTarget as HTMLInputElement).checked })} />
                  </td>
                  <td>
                    <Cell value={o.aux} label={tag('table.aux')} max={40} mono onCommit={(v) => setOutput(o.id, { aux: v })} />
                  </td>
                  <td>
                    <select class="input cell" aria-label={tag('table.source')} value={o.sourceElementId ?? ''} onChange={(e) => setOutput(o.id, { sourceElementId: (e.currentTarget as HTMLSelectElement).value || null })}>
                      <option value="">{t('table.none')}</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Cell value={o.who} label={tag('table.who')} max={80} onCommit={(v) => setOutput(o.id, { who: v })} />
                  </td>
                  <td>
                    <Cell value={o.notes} label={tag('table.notes')} onCommit={(v) => setOutput(o.id, { notes: v })} />
                  </td>
                  <RowButtons row={row} first={i === 0} last={i === rows.length - 1} onUp={() => moveOutputRow(o.id, -1)} onDown={() => moveOutputRow(o.id, 1)} onRemove={() => removeOutputRow(o.id)} />
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <MixMatrix show={show} />
      <FlowDiagram show={show} />
    </div>
  );
}

const MIX_LEVELS: MixLevel[] = ['low', 'normal', 'high'];

/** One column per monitor mix and one row per channel: the mixes are read across, like the sends of a desk. */
function MixMatrix({ show }: { show: Show }) {
  const outs = mixOutputs(show);
  const channels = channelList(show);
  if (outs.length === 0 || channels.length === 0) return null;
  const titleOf = (o: Output) => o.who || t('outputs.row', { n: o.number });
  return (
    <section class="mixes" aria-labelledby="mixes-title">
      <h3 id="mixes-title">{t('mix.title')}</h3>
      <div class="mixes-scroll">
        <table class="list editable">
          <thead>
            <tr>
              <th scope="col">{t('mix.channel')}</th>
              {outs.map((o) => (
                <th key={o.id} scope="col">
                  <span class="mono">{o.number}</span> {titleOf(o)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => {
              const name = c.shortName || t('mix.channel') + ' ' + c.number;
              return (
                <tr key={c.id}>
                  <th scope="row">
                    <span class="mono">{c.number}</span> {c.shortName}
                  </th>
                  {outs.map((o) => (
                    <td key={o.id}>
                      <select class={`input cell${o.mix[c.id] ? ' on' : ''}`} aria-label={`${name} · ${titleOf(o)}`} value={o.mix[c.id] ?? ''} onChange={(e) => setMix(o.id, c.id, ((e.currentTarget as HTMLSelectElement).value || null) as MixLevel | null)}>
                        <option value="">–</option>
                        {MIX_LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {t(`mix.${l}` as Key)}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface Box {
  label: string;
  count: number;
}

/** Fuentes → mesa → salidas. Every line has a text label; the stroke differs too, so colour is never the only cue. */
export function FlowDiagram({ show }: { show: Show }) {
  const channels = channelList(show);
  const outputs = outputList(show);
  const sources = new Map<string, Box>();
  for (const c of channels) {
    const key = c.sourceElementId ?? '';
    const el = c.sourceElementId ? show.elements[c.sourceElementId] : undefined;
    const box = sources.get(key) ?? { label: el ? elementName(el) : t('flow.noSource'), count: 0 };
    box.count++;
    sources.set(key, box);
  }
  const left = [...sources.values()];
  const kinds = KINDS.map((k) => ({ kind: k, count: outputs.filter((o) => o.kind === k).length })).filter((k) => k.count > 0);
  const rowH = 46;
  const n = Math.max(left.length, kinds.length, 1);
  const H = n * rowH + 24;
  const deskY = H / 2;
  const yOf = (i: number, len: number) => (H - len * rowH) / 2 + i * rowH + rowH / 2;
  const W = 900;
  const line = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`;
  const desk = show.desk.model || t('flow.desk');
  return (
    <section class="flow" aria-labelledby="flow-title">
      <div class="listbar">
        <h2 id="flow-title">{t('flow.title')}</h2>
        <label class="field inline">
          {t('flow.desk')}
          <input class="input" placeholder={t('flow.deskHint')} value={show.desk.model} maxLength={80} onChange={(e) => setDeskModel((e.currentTarget as HTMLInputElement).value)} />
        </label>
        <label class="field inline">
          {t('flow.showFile')}
          <input class="input" value={show.desk.showFile} maxLength={120} onChange={(e) => setDeskShowFile((e.currentTarget as HTMLInputElement).value)} />
        </label>
      </div>
      {left.length === 0 && kinds.length === 0 ? (
        <p class="muted pad">{t('flow.empty')}</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} class="flowsvg" role="img" aria-label={t('flow.title')}>
          <text x="0" y="12" class="flowhead">
            {t('flow.sources')}
          </text>
          <text x={W} y="12" text-anchor="end" class="flowhead">
            {t('flow.outputs')}
          </text>
          {left.map((b, i) => {
            const y = yOf(i, left.length);
            return (
              <g key={`s${i}`}>
                <path d={line(250, y, 360, deskY)} class="fl mic" />
                <rect x="0" y={y - 17} width="250" height="34" rx="6" class="flbox" />
                <text x="10" y={y + 4} class="flbox-t">
                  {b.label} · {t('status.channels', { n: b.count })}
                </text>
              </g>
            );
          })}
          {left.length > 0 && (
            <text x="355" y={deskY - 38} text-anchor="end" class="fltext halo">
              {t('flow.mics')}
            </text>
          )}
          <rect x="360" y={deskY - 30} width="180" height="60" rx="8" class="flbox desk" />
          <text x="450" y={deskY + 4} text-anchor="middle" class="flbox-t strong">
            {desk}
          </text>
          {kinds.map((k, i) => {
            const y = yOf(i, kinds.length);
            const cls = k.kind === 'main' ? 'main' : 'ret';
            return (
              <g key={k.kind}>
                <path d={line(540, deskY, 650, y)} class={`fl ${cls}`} />
                <text x="595" y={(y + deskY) / 2 - 4} text-anchor="middle" class="fltext">
                  {k.kind === 'main' ? t('flow.main') : t('flow.returns')}
                </text>
                <rect x="650" y={y - 17} width="250" height="34" rx="6" class="flbox" />
                <text x="660" y={y + 4} class="flbox-t">
                  {t(`out.kind.${k.kind}` as Key)} · {t('status.outputs', { n: k.count })}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </section>
  );
}
