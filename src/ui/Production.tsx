// The production view: the setlist, the schedules of the day and of the build, hospitality, contract and the event facts.
import { useState } from 'preact/hooks';
import { addSlotRow, addSongRow, moveSongRow, prodTab, removeSlotRow, removeSongRow, setContract, setEvent, setHospitality, setSlot, setSong, setSongLength, type ProdTab } from '../app/production-actions.ts';
import { daySheetFile, saveFile } from '../export/exports.ts';
import { lang, t, type Key } from '../i18n/index.ts';
import { prodStrings } from '../document/strings.ts';
import { formatDuration, isClock, MILESTONES, setlistTotal, sortedSlots } from '../model/production.ts';
import type { Show } from '../model/schema.ts';

const TABS: ProdTab[] = ['setlist', 'schedule', 'build', 'hospitality', 'contract', 'event'];

export function ProductionView({ show }: { show: Show }) {
  const tab = prodTab.value;
  return (
    <div class="scroll">
      <nav class="subtabs" aria-label={t('prod.tabs')}>
        {TABS.map((x) => (
          <button key={x} type="button" class="chipbtn" aria-pressed={tab === x} aria-current={tab === x ? 'page' : undefined} onClick={() => (prodTab.value = x)}>
            {t(`prod.tab.${x}` as Key)}
          </button>
        ))}
      </nav>
      {tab === 'setlist' && <Setlist show={show} />}
      {tab === 'schedule' && <Schedule show={show} kind="day" />}
      {tab === 'build' && <Schedule show={show} kind="build" />}
      {tab === 'hospitality' && <HospitalityForm show={show} />}
      {tab === 'contract' && <ContractForm show={show} />}
      {tab === 'event' && <EventForm show={show} />}
    </div>
  );
}

function Setlist({ show }: { show: Show }) {
  const [bad, setBad] = useState<string | null>(null);
  return (
    <>
      <div class="listbar">
        <button type="button" class="btn" onClick={() => addSongRow()}>
          {t('prod.addSong')}
        </button>
        <span class="muted" role="status">
          {t('prod.total', { value: formatDuration(setlistTotal(show)) })}
        </span>
      </div>
      {show.setlist.length === 0 ? (
        <p class="muted pad">{t('prod.setlist.empty')}</p>
      ) : (
        <table class="list editable">
          <thead>
            <tr>
              <th>{t('table.number')}</th>
              <th>{t('prod.songTitle')}</th>
              <th>{t('prod.comment')}</th>
              <th>{t('prod.duration')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {show.setlist.map((x, i) => {
              const n = i + 1;
              const tag = (k: Key) => `${t(k)} · ${n}`;
              return (
                <tr key={x.id}>
                  <td class="mono num">{n}</td>
                  <td>
                    <input class="input cell" aria-label={tag('prod.songTitle')} value={x.title} maxLength={160} onChange={(e) => setSong(x.id, { title: (e.currentTarget as HTMLInputElement).value })} />
                  </td>
                  <td>
                    <input class="input cell" aria-label={tag('prod.comment')} value={x.comment} maxLength={200} onChange={(e) => setSong(x.id, { comment: (e.currentTarget as HTMLInputElement).value })} />
                  </td>
                  <td>
                    <input
                      class="input cell mono"
                      style="max-width:90px"
                      aria-label={tag('prod.duration')}
                      aria-invalid={bad === x.id}
                      defaultValue={x.seconds ? formatDuration(x.seconds) : ''}
                      key={`${x.id}-${x.seconds}`}
                      onChange={(e) => setBad(setSongLength(x.id, (e.currentTarget as HTMLInputElement).value) ? null : x.id)}
                    />
                    {bad === x.id && (
                      <span class="warn" role="alert">
                        <span aria-hidden="true">⚠ </span>
                        {t('prod.duration.bad')}
                      </span>
                    )}
                  </td>
                  <td class="rowbtns">
                    <button type="button" class="pbtn" aria-label={`${t('table.up')} · ${n}`} title={t('table.up')} disabled={i === 0} onClick={() => moveSongRow(x.id, -1)}>
                      ↑
                    </button>
                    <button type="button" class="pbtn" aria-label={`${t('table.down')} · ${n}`} title={t('table.down')} disabled={i === show.setlist.length - 1} onClick={() => moveSongRow(x.id, 1)}>
                      ↓
                    </button>
                    <button type="button" class="pbtn" aria-label={`${t('table.remove')} · ${n}`} title={t('table.remove')} onClick={() => removeSongRow(x.id)}>
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

function Schedule({ show, kind }: { show: Show; kind: 'day' | 'build' }) {
  const P = prodStrings(lang.value);
  const rows = sortedSlots(show, kind);
  return (
    <>
      <div class="listbar">
        <button type="button" class="btn" onClick={() => addSlotRow(kind)}>
          {t('prod.addSlot')}
        </button>
      </div>
      {kind === 'day' && (
        <div class="subtabs" role="group" aria-label={t('prod.milestones')}>
          {MILESTONES.map((m) => (
            <button key={m} type="button" class="chipbtn" onClick={() => addSlotRow('day', P.milestones[m])}>
              + {P.milestones[m]}
            </button>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <p class="muted pad">{t('prod.schedule.empty')}</p>
      ) : (
        <table class="list editable">
          <thead>
            <tr>
              <th>{t('slot.time')}</th>
              <th>{t('slot.what')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((x, i) => {
              const n = i + 1;
              const invalid = x.time.trim() !== '' && !isClock(x.time);
              return (
                <tr key={x.id}>
                  <td>
                    <input class="input cell mono" style="max-width:90px" aria-label={`${t('slot.time')} · ${n}`} aria-invalid={invalid} value={x.time} maxLength={10} onChange={(e) => setSlot(x.id, { time: (e.currentTarget as HTMLInputElement).value })} />
                    {invalid && (
                      <span class="warn" role="note">
                        <span aria-hidden="true">⚠ </span>
                        {t('prod.time.bad')}
                      </span>
                    )}
                  </td>
                  <td>
                    <input class="input cell" aria-label={`${t('slot.what')} · ${n}`} value={x.what} maxLength={200} onChange={(e) => setSlot(x.id, { what: (e.currentTarget as HTMLInputElement).value })} />
                  </td>
                  <td class="rowbtns">
                    <button type="button" class="pbtn" aria-label={t('slot.remove', { n })} title={t('slot.remove', { n })} onClick={() => removeSlotRow(x.id)}>
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

function Text({ label, value, onCommit, rows, max = 300 }: { label: string; value: string; onCommit: (v: string) => void; rows?: number; max?: number }) {
  return (
    <label class="field">
      {label}
      {rows ? (
        <textarea class="input" rows={rows} maxLength={max} value={value} onChange={(e) => onCommit((e.currentTarget as HTMLTextAreaElement).value)} />
      ) : (
        <input class="input" maxLength={max} value={value} onChange={(e) => onCommit((e.currentTarget as HTMLInputElement).value)} />
      )}
    </label>
  );
}

function Count({ label, value, onCommit }: { label: string; value: number | null; onCommit: (v: number | null) => void }) {
  return (
    <label class="field">
      {label}
      <input
        class="input mono"
        type="number"
        min="0"
        step="1"
        value={value ?? ''}
        onChange={(e) => {
          const raw = (e.currentTarget as HTMLInputElement).value;
          const v = Number(raw);
          onCommit(raw === '' || !Number.isFinite(v) || v < 0 ? null : Math.round(v));
        }}
      />
    </label>
  );
}

function HospitalityForm({ show }: { show: Show }) {
  const h = show.hospitality;
  const P = prodStrings(lang.value);
  return (
    <div class="form">
      <Count label={P.dressingRooms} value={h.dressingRooms} onCommit={(v) => setHospitality({ dressingRooms: v })} />
      <Text label={P.dressingNotes} value={h.dressingNotes} rows={3} onCommit={(v) => setHospitality({ dressingNotes: v })} />
      <Count label={P.meals} value={h.meals} onCommit={(v) => setHospitality({ meals: v })} />
      <Text label={P.dietary} value={h.dietary} onCommit={(v) => setHospitality({ dietary: v })} />
      <Text label={P.cateringNotes} value={h.cateringNotes} rows={2} onCommit={(v) => setHospitality({ cateringNotes: v })} />
      <label class="check">
        <input type="checkbox" checked={h.afterShowMeal} onChange={(e) => setHospitality({ afterShowMeal: (e.currentTarget as HTMLInputElement).checked })} />
        {P.afterShowMeal}
      </label>
      <label class="check">
        <input type="checkbox" checked={h.busStock} onChange={(e) => setHospitality({ busStock: (e.currentTarget as HTMLInputElement).checked })} />
        {P.busStock}
      </label>
      <Text label={P.supplies} value={h.supplies} rows={2} onCommit={(v) => setHospitality({ supplies: v })} />
      <Text label={P.transport} value={h.transport} rows={2} onCommit={(v) => setHospitality({ transport: v })} />
      <Text label={P.lodging} value={h.lodging} rows={2} onCommit={(v) => setHospitality({ lodging: v })} />
      <Text label={P.localTransport} value={h.localTransport} onCommit={(v) => setHospitality({ localTransport: v })} />
      <label class="check">
        <input type="checkbox" checked={h.cashInstead} onChange={(e) => setHospitality({ cashInstead: (e.currentTarget as HTMLInputElement).checked })} />
        {P.cashInstead}
      </label>
      {h.cashInstead && <Text label={P.cashAmount} value={h.cashAmount} max={60} onCommit={(v) => setHospitality({ cashAmount: v })} />}
    </div>
  );
}

function ContractForm({ show }: { show: Show }) {
  const c = show.contract;
  const P = prodStrings(lang.value);
  return (
    <div class="form">
      <Text label={P.fee} value={c.fee} max={120} onCommit={(v) => setContract({ fee: v })} />
      <Text label={P.deposit} value={c.deposit} max={120} onCommit={(v) => setContract({ deposit: v })} />
      <Text label={P.payment} value={c.payment} rows={2} onCommit={(v) => setContract({ payment: v })} />
      <Text label={P.cancellation} value={c.cancellation} rows={3} max={500} onCommit={(v) => setContract({ cancellation: v })} />
      <Text label={P.insurance} value={c.insurance} rows={2} onCommit={(v) => setContract({ insurance: v })} />
      <Count label={`${P.setLength} (${P.minutes})`} value={c.setLengthMin} onCommit={(v) => setContract({ setLengthMin: v })} />
      <Text label={P.crew} value={c.crew} rows={2} onCommit={(v) => setContract({ crew: v })} />
      <Text label={P.other} value={c.other} rows={4} max={2000} onCommit={(v) => setContract({ other: v })} />
    </div>
  );
}

function EventForm({ show }: { show: Show }) {
  const e = show.event;
  const P = prodStrings(lang.value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheet = async () => {
    setBusy(true);
    setError(null);
    try {
      saveFile(await daySheetFile(show));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div class="form">
      <Text label={P.venueAddress} value={e.venueAddress} rows={2} onCommit={(v) => setEvent({ venueAddress: v })} />
      <Text label={P.parking} value={e.parking} onCommit={(v) => setEvent({ parking: v })} />
      <Text label={t('prod.eventNotes')} value={e.notes} rows={4} max={2000} onCommit={(v) => setEvent({ notes: v })} />
      <div class="sub wrap">
        <button type="button" class="btn primary" disabled={busy} onClick={() => void sheet()}>
          {t('prod.daysheet')}
        </button>
        {busy && (
          <span class="muted" role="status">
            {t('export.working')}
          </span>
        )}
      </div>
      {error && (
        <p class="warn" role="alert">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}
