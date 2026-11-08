// The document view: choose what goes in the rider, see it compiled to PDF, download it.
import { useEffect, useRef, useState } from 'preact/hooks';
import { addContact, removeContact, removeLogo, setContactHidden, setDate, setLogo, setRevisionNumber, setTitleBlock, updateContact } from '../app/document-data-actions.ts';
import { applyDocTemplate, deleteDocTemplate, docTemplates, MAX_TEMPLATES, saveDocTemplate } from '../app/doc-templates.ts';
import { setInputsLayout, setPaper, setPlanLegend, setPlanScale, setTemplate, toggleSection } from '../app/document-actions.ts';
import { session } from '../app/state.ts';
import { openPdf } from '../background/pdf.ts';
import { compilePdf, fixPdf } from '../document/compile.ts';
import { ALL_SECTIONS, effectiveSections, TEMPLATES } from '../document/sections.ts';
import { loadShowIcons } from '../library/show-icons.ts';
import { buildDocument, type DocWarning } from '../document/typst-source.ts';
import { t, type Key } from '../i18n/index.ts';
import { Paper, type Show } from '../model/schema.ts';

interface Result {
  pdf: Uint8Array;
  pages: string[];
  warnings: DocWarning[];
  ms: number;
}

const SCALES = [25, 50, 100, 200];
const blocksOf = (v: string): Show['document']['inputs']['blocks'] => (v === '1' ? 1 : v === '2' ? 2 : v === '3' ? 3 : v === '4' ? 4 : 'auto');
const fileName = (name: string) => `${name.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'rider'}.pdf`;

export function DocumentView({ show }: { show: Show }) {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [first, setFirst] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grey, setGrey] = useState(false);
  const token = useRef(0);
  const urls = useRef<string[]>([]);
  const sections = effectiveSections(show);

  // Recompile a moment after the last change; a result that arrives after a newer change is dropped.
  useEffect(() => {
    const mine = ++token.current;
    const timer = window.setTimeout(async () => {
      setBusy(true);
      setError(null);
      try {
        const t0 = performance.now();
        await loadShowIcons(show);
        const built = buildDocument(show, session.value?.allImages() ?? {});
        const pdf = await fixPdf(await compilePdf(built.source, built.files));
        if (mine !== token.current) return;
        const doc = await openPdf(pdf);
        const pages: string[] = [];
        for (let i = 1; i <= doc.pages; i++) {
          const r = await doc.render(i, 1400);
          pages.push(URL.createObjectURL(new Blob([r.png as BlobPart], { type: 'image/png' })));
        }
        doc.destroy();
        if (mine !== token.current) {
          pages.forEach((u) => URL.revokeObjectURL(u));
          return;
        }
        urls.current.forEach((u) => URL.revokeObjectURL(u));
        urls.current = pages;
        setResult({ pdf, pages, warnings: built.warnings, ms: Math.round(performance.now() - t0) });
        setFirst(false);
      } catch (e) {
        if (mine === token.current) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mine === token.current) setBusy(false);
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [show]);

  useEffect(
    () => () => {
      token.current++;
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([result.pdf as BlobPart], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName(show.name);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div class="docview">
      <aside class="doccontrols" aria-label={t('doc.settings')}>
        <label class="field">
          {t('doc.template')}
          <select class="input" value={show.document.template} onChange={(e) => setTemplate((e.currentTarget as HTMLSelectElement).value as (typeof TEMPLATES)[number])}>
            {TEMPLATES.map((x) => (
              <option key={x} value={x}>
                {t(`tpl.${x}` as Key)}
              </option>
            ))}
          </select>
        </label>
        <OwnTemplates />
        <fieldset class="checks col">
          <legend>{t('doc.sections')}</legend>
          {ALL_SECTIONS.map((s) => (
            <label key={s}>
              <input type="checkbox" checked={sections.includes(s)} onChange={(e) => toggleSection(s, (e.currentTarget as HTMLInputElement).checked)} />
              {t(`sec.${s}` as Key)}
            </label>
          ))}
        </fieldset>
        <label class="field">
          {t('doc.paper')}
          <select class="input" value={show.paper} onChange={(e) => setPaper((e.currentTarget as HTMLSelectElement).value as Show['paper'])}>
            {Paper.options.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          {t('doc.scale')}
          <select class="input" value={show.document.planScale ?? ''} onChange={(e) => setPlanScale((e.currentTarget as HTMLSelectElement).value ? Number((e.currentTarget as HTMLSelectElement).value) : null)}>
            <option value="">{t('doc.scale.fit')}</option>
            {SCALES.map((n) => (
              <option key={n} value={n}>
                1:{n}
              </option>
            ))}
          </select>
        </label>
        <label class="check">
          <input type="checkbox" checked={show.document.planLegend !== false} onChange={(e) => setPlanLegend((e.currentTarget as HTMLInputElement).checked)} />
          {t('doc.legend')}
        </label>
        {sections.includes('inputs') && (
          <>
            <label class="field">
              {t('doc.inputsOrient')}
              <select class="input" value={show.document.inputs.landscape ? 'landscape' : 'portrait'} onChange={(e) => setInputsLayout({ landscape: (e.currentTarget as HTMLSelectElement).value === 'landscape' })}>
                <option value="portrait">{t('doc.orient.portrait')}</option>
                <option value="landscape">{t('doc.orient.landscape')}</option>
              </select>
            </label>
            <label class="field">
              {t('doc.inputsBlocks')}
              <select class="input" value={String(show.document.inputs.blocks)} onChange={(e) => setInputsLayout({ blocks: blocksOf((e.currentTarget as HTMLSelectElement).value) })}>
                <option value="auto">{t('doc.blocks.auto')}</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <DocData show={show} />
        <label class="check">
          <input type="checkbox" checked={grey} onChange={(e) => setGrey((e.currentTarget as HTMLInputElement).checked)} />
          {t('doc.grey')}
        </label>
        <button type="button" class="btn primary" disabled={!result || busy} onClick={download}>
          {t('doc.download')}
        </button>
        <p class="muted" role="status">
          {busy ? (first ? t('doc.preparing') : t('doc.compiling')) : result ? t('doc.ready', { n: result.pages.length, ms: result.ms }) : ''}
        </p>
        {error && (
          <p class="warn" role="alert">
            <span aria-hidden="true">⚠ </span>
            {t('doc.error', { detail: error })}
          </p>
        )}
        {result && result.warnings.length > 0 && (
          <section aria-labelledby="docwarn">
            <h2 id="docwarn">{t('doc.warnings')}</h2>
            <ul class="docwarns">
              {result.warnings.map((w, i) => (
                <li key={i} class="warn">
                  <span aria-hidden="true">⚠ </span>
                  {w.kind === 'scale' ? t('doc.warn.scale', { text: w.text }) : t('doc.warn.overflow', { text: w.text })}
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
      <div class={`docpages${grey ? ' grey' : ''}`} aria-busy={busy} role="region" aria-label={t('doc.preview')} tabIndex={0}>
        {sections.length === 0 && <p class="muted pad">{t('doc.none')}</p>}
        {result?.pages.map((u, i) => (
          <img key={u} src={u} alt={t('doc.page', { n: i + 1 })} />
        ))}
      </div>
    </div>
  );
}

/** The user's own document templates: save the layout under a name, apply a saved one, delete it. */
function OwnTemplates() {
  const list = docTemplates.value;
  const [name, setName] = useState('');
  const [pick, setPick] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const full = list.length >= MAX_TEMPLATES && !list.some((x) => x.name.toLowerCase() === name.trim().toLowerCase());
  const chosen = list.find((x) => x.id === pick) ?? list[0];
  return (
    <details class="docdata">
      <summary>{t('doc.own')}</summary>
      <div class="stackS">
        <form
          class="sub"
          onSubmit={(e) => {
            e.preventDefault();
            if (saveDocTemplate(name)) {
              setSaved(t('doc.own.saved', { name: name.trim() }));
              setName('');
            }
          }}
        >
          <label class="field" style="flex:1">
            {t('doc.own.name')}
            <input class="input" value={name} maxLength={60} onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)} />
          </label>
          <button type="submit" class="btn" disabled={!name.trim() || full} style="align-self:flex-end">
            {t('doc.own.save')}
          </button>
        </form>
        {full && (
          <p class="warn" role="note">
            {t('doc.own.full')}
          </p>
        )}
        <p class="muted" role="status">
          {saved}
        </p>
        {list.length > 0 && (
          <div class="sub">
            <label class="field" style="flex:1">
              {t('doc.own.pick')}
              <select class="input" value={chosen?.id ?? ''} onChange={(e) => setPick((e.currentTarget as HTMLSelectElement).value)}>
                {list.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" class="btn" style="align-self:flex-end" onClick={() => chosen && applyDocTemplate(chosen.id)}>
              {t('doc.own.apply')}
            </button>
            <button type="button" class="btn" style="align-self:flex-end" onClick={() => chosen && deleteDocTemplate(chosen.id)}>
              {t('doc.own.delete')}
            </button>
          </div>
        )}
      </div>
    </details>
  );
}

/** The facts the cover, contacts and schedule print. */
function DocData({ show }: { show: Show }) {
  const tb = show.titleBlock;
  const [logoBad, setLogoBad] = useState(false);
  return (
    <details class="docdata">
      <summary>{t('data.title')}</summary>
      <div class="stackS">
        <label class="field">
          {t('data.production')}
          <input class="input" value={tb.production} maxLength={120} onChange={(e) => setTitleBlock({ production: (e.currentTarget as HTMLInputElement).value })} />
        </label>
        <label class="field">
          {t('data.venue')}
          <input class="input" value={tb.venue} maxLength={120} onChange={(e) => setTitleBlock({ venue: (e.currentTarget as HTMLInputElement).value })} />
        </label>
        <label class="field">
          {t('data.author')}
          <input class="input" value={tb.author} maxLength={120} onChange={(e) => setTitleBlock({ author: (e.currentTarget as HTMLInputElement).value })} />
        </label>
        <label class="field">
          {t('data.logo')}
          <input
            class="input"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={async (e) => {
              const input = e.currentTarget as HTMLInputElement;
              const file = input.files?.[0];
              input.value = '';
              if (file) setLogoBad(!setLogo(new Uint8Array(await file.arrayBuffer())));
            }}
          />
          {logoBad && (
            <span class="warn" role="alert">
              {t('data.logoBad')}
            </span>
          )}
        </label>
        {tb.logo && (
          <button type="button" class="btn" onClick={() => removeLogo()}>
            {t('data.logoRemove')}
          </button>
        )}
        <div class="grid2">
          <label class="field">
            {t('data.date')}
            <input class="input" type="date" value={show.date} onChange={(e) => setDate((e.currentTarget as HTMLInputElement).value)} />
          </label>
          <label class="field">
            {t('data.revision')}
            <input class="input mono" type="number" min="1" step="1" value={show.revision} onChange={(e) => setRevisionNumber(Number((e.currentTarget as HTMLInputElement).value) || 1)} />
          </label>
        </div>
        <h3>{t('data.contacts')}</h3>
        {show.contacts.map((c, i) => {
          const n = i + 1;
          const tag = (k: Key) => `${t(k)} · ${n}`;
          return (
            <fieldset class="card" key={c.id}>
              <legend>{t('data.contact', { n })}</legend>
              <input class="input" aria-label={tag('contact.role')} value={c.role} maxLength={80} onChange={(e) => updateContact(c.id, { role: (e.currentTarget as HTMLInputElement).value })} />
              <input class="input" aria-label={tag('contact.name')} value={c.name} maxLength={120} onChange={(e) => updateContact(c.id, { name: (e.currentTarget as HTMLInputElement).value })} />
              <input class="input" aria-label={tag('contact.phone')} type="tel" value={c.phone} maxLength={60} onChange={(e) => updateContact(c.id, { phone: (e.currentTarget as HTMLInputElement).value })} />
              <label class="check">
                <input type="checkbox" checked={c.hidden.includes('phone')} onChange={(e) => setContactHidden(c.id, 'phone', (e.currentTarget as HTMLInputElement).checked)} aria-label={tag('contact.hidePhone')} />
                {t('contact.hidePhone')}
              </label>
              <input class="input" aria-label={tag('contact.email')} type="email" value={c.email} maxLength={120} onChange={(e) => updateContact(c.id, { email: (e.currentTarget as HTMLInputElement).value })} />
              <label class="check">
                <input type="checkbox" checked={c.hidden.includes('email')} onChange={(e) => setContactHidden(c.id, 'email', (e.currentTarget as HTMLInputElement).checked)} aria-label={tag('contact.hideEmail')} />
                {t('contact.hideEmail')}
              </label>
              <button type="button" class="btn" onClick={() => removeContact(c.id)}>
                {t('contact.remove', { n })}
              </button>
            </fieldset>
          );
        })}
        <button type="button" class="btn" onClick={() => addContact()}>
          {t('data.addContact')}
        </button>
      </div>
    </details>
  );
}
