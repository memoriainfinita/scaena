// Application state: signals over the show's history. The model itself stays plain data (src/model).
import { signal } from '@preact/signals';
import { lang, resolveLang, type Lang } from '../i18n/index.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { regionByCode } from '../library/regions.ts';
import { History } from '../model/history.ts';
import { translatePackageText } from '../library/translate.ts';
import { addChannel } from '../model/audio.ts';
import { emptyLuminaire } from '../model/lights.ts';
import { UnsupportedFormat } from '../model/migrate.ts';
import { newShow } from '../model/new.ts';
import { addElement, emptyComputer, freeSpot, updateElement } from '../model/ops.ts';
import type { Module, PlanElement, Show } from '../model/schema.ts';
import { packShow, unpackShow } from '../model/archive.ts';
import { setCustomSource } from '../library/custom.ts';
import { itemById } from '../library/items.ts';
import { autosave, getLastShow, listShows, openLibrary, readRevisionData, readShow, saveRevisionData, saveShow, setLastShow } from './storage.ts';

export type ViewId = 'plan' | 'inputs' | 'outputs' | 'lights' | 'production' | 'reports' | 'document';
export const VIEWS: readonly ViewId[] = ['plan', 'inputs', 'outputs', 'lights', 'production', 'reports', 'document'];
export type Dialog = 'customItem' | 'settings' | 'export' | 'app' | 'help' | 'issues' | 'background' | 'revisions' | 'menu' | null;
export type Theme = 'auto' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  lang: 'auto' | Lang;
  /** What a new show starts with; each show can change them afterwards. */
  units: Show['units'];
  paper: Show['paper'];
  region: string;
}

const SETTINGS_KEY = 'scaena:settings';
const DEFAULT_SETTINGS: Settings = { theme: 'auto', lang: 'auto', units: 'metric', paper: 'A4', region: 'ES' };

function readSettings(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<Settings>;
    return {
      theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'auto',
      lang: raw.lang === 'es' || raw.lang === 'en' ? raw.lang : 'auto',
      units: raw.units === 'imperial' ? 'imperial' : 'metric',
      paper: raw.paper === 'A3' || raw.paper === 'Letter' || raw.paper === 'Tabloid' ? raw.paper : 'A4',
      region: typeof raw.region === 'string' && regionByCode(raw.region) ? raw.region : 'ES',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const settings = signal<Settings>(readSettings());

export function applySettings(next: Settings): void {
  settings.value = next;
  lang.value = resolveLang(next.lang, globalThis.navigator?.languages ?? []);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // Private mode or blocked storage: the settings apply for this session only.
  }
}
lang.value = resolveLang(settings.value.lang, globalThis.navigator?.languages ?? []);

/** One open show with its history and its place in the local library. */
export class Session {
  readonly show;
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly saving = signal(false);
  private readonly history: History<Show>;
  private readonly saver;

  constructor(
    initial: Show,
    readonly id: string,
    private readonly db: Promise<IDBDatabase> | null,
    private readonly images: Record<string, Uint8Array> = {},
  ) {
    this.history = new History(initial);
    this.show = signal(initial);
    this.saver = autosave(
      async () => {
        if (!this.db) return;
        try {
          this.saving.value = true;
          const db = await this.db;
          await saveShow(db, this.id, this.show.value, this.images);
          await setLastShow(db, this.id);
        } finally {
          this.saving.value = false;
        }
      },
      () => !this.db,
    );
  }

  private sync(): void {
    this.show.value = this.history.state;
    this.canUndo.value = this.history.canUndo;
    this.canRedo.value = this.history.canRedo;
    this.saver.schedule();
  }

  /** Apply a change as one undo step. */
  commit(fn: (s: Show) => Show): void {
    this.history.set(fn(this.history.state));
    this.sync();
  }

  group<R>(fn: () => R): R {
    const r = this.history.group(fn);
    this.sync();
    return r;
  }

  undo(): void {
    if (this.history.undo()) this.sync();
  }
  redo(): void {
    if (this.history.redo()) this.sync();
  }
  flush(): Promise<void> {
    return this.saver.flush();
  }
  /** The `.scaena` bytes of the current state: only the images the show still uses. */
  toFile(): Uint8Array {
    const show = this.show.value;
    const used = new Set([show.stage.background?.file, show.titleBlock.logo].filter((f): f is string => !!f));
    return packShow(show, Object.fromEntries(Object.entries(this.images).filter(([name]) => used.has(name))));
  }

  /** True when this browser keeps a local library, which revisions need. */
  get canKeepRevisions(): boolean {
    return this.db !== null;
  }
  async storeRevision(n: number, data: Uint8Array): Promise<void> {
    if (!this.db) throw new Error('no local library');
    await saveRevisionData(await this.db, this.id, n, data);
  }
  async loadRevision(n: number): Promise<Uint8Array | undefined> {
    return this.db ? readRevisionData(await this.db, this.id, n) : undefined;
  }

  private readonly urls = new Map<string, string>();
  /** Keeps an imported image with the show; it is saved with it. Images stay until export so undo can bring one back. */
  addImage(name: string, bytes: Uint8Array): void {
    this.images[name] = bytes;
  }
  /** Every image kept with the show, by name. */
  allImages(): Record<string, Uint8Array> {
    return this.images;
  }
  imageBytes(name: string): Uint8Array | undefined {
    return this.images[name];
  }
  /** A blob URL for an image of the show, made once and kept for the session. */
  imageUrl(name: string): string | null {
    const cached = this.urls.get(name);
    if (cached) return cached;
    const bytes = this.images[name];
    if (!bytes) return null;
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'image/png' }));
    this.urls.set(name, url);
    return url;
  }
}

export const session = signal<Session | null>(null);
setCustomSource(() => session.value?.show.value.customItems ?? {});
export const view = signal<ViewId>('plan');
export const selection = signal<string[]>([]);
export const dialog = signal<Dialog>(null);
/** On a narrow screen the library and the inspector are sheets over the plan; at most one is open. */
export const sheet = signal<'library' | 'inspector' | null>(null);
export const recents = signal<{ id: string; name: string; updated: number }[]>([]);
export const startError = signal<string | null>(null);

let dbPromise: Promise<IDBDatabase> | null = null;
/** The local library, or null when this browser has none (private mode): the app then works without saving. */
export function library(): Promise<IDBDatabase> | null {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === 'undefined') return null;
  dbPromise = openLibrary();
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}
/** For tests: use a given database promise, or none. */
export function setLibrary(p: Promise<IDBDatabase> | null): void {
  dbPromise = p;
}

const newId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function open(show: Show, id = newId(), images: Record<string, Uint8Array> = {}): Session {
  const s = new Session(show, id, library(), images);
  session.value = s;
  selection.value = [];
  view.value = 'plan';
  dialog.value = null;
  startError.value = null;
  s.commit((x) => x); // no-op: keeps the first save scheduled
  void s.flush().catch(() => undefined);
  return s;
}

export function startFromPackage(pkgId: string, name: string): void {
  const pkg = packageById(pkgId);
  if (!pkg) throw new Error(`unknown package ${pkgId}`);
  open(withDefaults(showFromPackage(pkg, name, lang.value)));
}

/** A new show starts with the units, paper and region chosen in the app settings. */
function withDefaults(show: Show): Show {
  const d = settings.value;
  const region = regionByCode(d.region);
  return {
    ...show,
    units: d.units,
    paper: d.paper,
    region: region && region.code !== show.region.code ? { code: region.code, voltage: region.voltage, plug: region.plugs.join(', ') } : show.region,
  };
}

export function startEmpty(name: string, modules: Module[] = ['audio', 'document']): void {
  open(withDefaults({ ...newShow(name, modules), lang: lang.value }));
}

export function openFileBytes(bytes: Uint8Array): void {
  try {
    const { show, images } = unpackShow(bytes);
    open(show, undefined, images);
  } catch (e) {
    startError.value = e instanceof UnsupportedFormat ? 'newer' : e instanceof Error ? e.message : String(e);
  }
}

export async function openStored(id: string): Promise<void> {
  const db = library();
  if (!db) return;
  const r = await readShow(await db, id);
  if (!r) return;
  if (!r.ok) {
    startError.value = 'newer';
    return;
  }
  open(r.show, id, r.images);
}

export async function refreshRecents(): Promise<void> {
  const db = library();
  if (!db) return;
  try {
    recents.value = (await listShows(await db)).slice(0, 8);
  } catch {
    recents.value = [];
  }
}

/** On start: reopen the last show if there is one (decision 6). */
export async function reopenLast(): Promise<boolean> {
  const db = library();
  if (!db) return false;
  try {
    const d = await db;
    const id = await getLastShow(d);
    if (!id) return false;
    const r = await readShow(d, id);
    if (!r?.ok) return false;
    open(r.show, id, r.images);
    return true;
  } catch {
    return false;
  }
}

export async function goHome(): Promise<void> {
  const s = session.value;
  if (s) await s.flush().catch(() => undefined);
  session.value = null;
  selection.value = [];
  await refreshRecents();
}

// ---- edits used by the shell ----

/**
 * Places a library item: where the user dropped it, or in the first free spot near the middle of the stage. An item that
 * comes with suggested channels (a drum kit, a vocal mic) also adds them to the input list, tied to it, in the same undo step.
 */
export function addFromLibrary(itemId: string, at?: { x: number; y: number }): string | null {
  const s = session.value;
  const item = itemById(itemId);
  if (!s || !item) return null;
  let created: PlanElement | null = null;
  s.commit((show) => {
    const layer = show.layers.find((l) => l.subject === item.layer);
    if (!layer) return show;
    const [next, el] = addElement(show, {
      type: { id: item.id, version: item.version },
      ...(at ? snapPoint(show, at) : freeSpot(show, show.stage.shape.kind === 'rect' ? show.stage.shape.width / 2 : 0, show.stage.shape.kind === 'rect' ? show.stage.shape.depth / 2 : 0)),
      layerId: layer.id,
      ...(item.id === 'power.outlet' ? { label: [show.region.voltage ? `${show.region.voltage} V` : '', show.region.plug].filter(Boolean).join(' · ') } : {}),
      computer: item.symbol === 'laptop' ? emptyComputer() : null,
      luminaire: item.layer === 'lights' && item.category === 'light' ? emptyLuminaire() : null,
    });
    created = el;
    let out = next;
    if (show.modules.includes('audio')) {
      for (const sc of item.suggestedChannels ?? []) {
        [out] = addChannel(out, { shortName: translatePackageText(sc.name, show.lang).slice(0, 16), mic: translatePackageText(sc.mic, show.lang), stand: translatePackageText(sc.stand, show.lang), phantom: sc.phantom, sourceElementId: el.id });
      }
    }
    return out;
  });
  const c = created as PlanElement | null;
  if (c) selection.value = [c.id];
  return c?.id ?? null;
}

function snapPoint(show: Show, p: { x: number; y: number }): { x: number; y: number } {
  const step = show.view.grid ? show.view.gridMm : 10;
  return { x: Math.round(p.x / step) * step, y: Math.round(p.y / step) * step };
}

export function setElementField(id: string, patch: Partial<Omit<PlanElement, 'id'>>): void {
  session.value?.commit((show) => updateElement(show, id, patch));
}

export function setLayerFlag(layerId: string, flag: 'visible' | 'locked', value: boolean): void {
  session.value?.commit((show) => ({ ...show, layers: show.layers.map((l) => (l.id === layerId ? { ...l, [flag]: value } : l)) }));
}

export function renameShow(name: string): void {
  session.value?.commit((show) => ({ ...show, name: name.slice(0, 120) }));
}

export interface ShowSettings {
  modules: Module[];
  regionCode: string;
  voltage: number;
  paper: Show['paper'];
  units: Show['units'];
  lang: Show['lang'];
  stageWidthM: number;
  stageDepthM: number;
  /** Height of the stage deck above the hall floor, in metres. */
  stageHeightM?: number;
  /** Free-form floor plan in metres; when it has three or more points the stage becomes a polygon, else a rectangle. */
  stagePolygonM?: { x: number; y: number }[] | null;
  /** Width of the proscenium opening in metres, or null for none. */
  prosceniumM?: number | null;
  /** Height of the proscenium opening above the deck in metres, or null when not set; drawn in the side section. */
  prosceniumHeightM?: number | null;
  referenceLines?: Show['stage']['referenceLines'];
  gridMm?: number;
}

function stageShape(shape: Show['stage']['shape'], p: ShowSettings): Show['stage']['shape'] {
  const poly = p.stagePolygonM;
  const opening = (width: number): number | null => (p.prosceniumM === undefined ? (shape.prosceniumWidth === null ? null : Math.min(width, shape.prosceniumWidth)) : p.prosceniumM === null ? null : Math.min(width, Math.round(p.prosceniumM * 1000)));
  if (poly && poly.length >= 3) {
    const points = poly.map((q) => ({ x: Math.round(q.x * 1000), y: Math.round(q.y * 1000) }));
    return { kind: 'polygon', points, prosceniumWidth: opening(Math.max(...points.map((q) => q.x)) - Math.min(...points.map((q) => q.x))) };
  }
  const width = Math.round(p.stageWidthM * 1000);
  const depth = Math.round(p.stageDepthM * 1000);
  return { kind: 'rect', width, depth, prosceniumWidth: opening(width) };
}

export function applyShowSettings(p: ShowSettings): void {
  session.value?.commit((show) => {
    const region = regionByCode(p.regionCode);
    const shape = show.stage.shape;
    return {
      ...show,
      modules: p.modules,
      paper: p.paper,
      units: p.units,
      lang: p.lang,
      region: { code: p.regionCode, voltage: p.voltage, plug: show.region.code === p.regionCode ? show.region.plug : (region?.plugs.join(', ') ?? '') },
      stage: {
        ...show.stage,
        shape: stageShape(shape, p),
        height: p.stageHeightM === undefined ? show.stage.height : Math.max(0, Math.round(p.stageHeightM * 1000)),
        prosceniumHeight: p.prosceniumHeightM === undefined ? show.stage.prosceniumHeight : p.prosceniumHeightM === null ? null : Math.max(0, Math.round(p.prosceniumHeightM * 1000)),
        referenceLines: p.referenceLines ?? show.stage.referenceLines,
      },
      view: p.gridMm ? { ...show.view, gridMm: Math.max(10, Math.round(p.gridMm)) } : show.view,
    };
  });
}
