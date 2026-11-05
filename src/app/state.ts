// Application state: signals over the show's history. The model itself stays plain data (src/model).
import { signal } from '@preact/signals';
import { lang, resolveLang, type Lang } from '../i18n/index.ts';
import { showFromPackage } from '../library/apply.ts';
import { packageById } from '../library/packages.ts';
import { regionByCode } from '../library/regions.ts';
import { History } from '../model/history.ts';
import { UnsupportedFormat } from '../model/migrate.ts';
import { newShow } from '../model/new.ts';
import { addElement, emptyComputer, freeSpot, updateElement } from '../model/ops.ts';
import type { Module, PlanElement, Show } from '../model/schema.ts';
import { packShow, unpackShow } from '../model/archive.ts';
import { itemById } from '../library/items.ts';
import { autosave, getLastShow, listShows, openLibrary, readShow, saveShow, setLastShow } from './storage.ts';

export type ViewId = 'plan' | 'inputs' | 'outputs' | 'lights' | 'reports' | 'document';
export const VIEWS: readonly ViewId[] = ['plan', 'inputs', 'outputs', 'lights', 'reports', 'document'];
export type Dialog = 'settings' | 'export' | 'app' | 'help' | null;
export type Theme = 'auto' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  lang: 'auto' | Lang;
}

const SETTINGS_KEY = 'scaena:settings';
const DEFAULT_SETTINGS: Settings = { theme: 'auto', lang: 'auto' };

function readSettings(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<Settings>;
    return {
      theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'auto',
      lang: raw.lang === 'es' || raw.lang === 'en' ? raw.lang : 'auto',
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
  /** The `.scaena` bytes of the current state. */
  toFile(): Uint8Array {
    return packShow(this.show.value, this.images);
  }
}

export const session = signal<Session | null>(null);
export const view = signal<ViewId>('plan');
export const selection = signal<string[]>([]);
export const dialog = signal<Dialog>(null);
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
  open(showFromPackage(pkg, name, lang.value));
}

export function startEmpty(name: string, modules: Module[] = ['audio', 'document']): void {
  open({ ...newShow(name, modules), lang: lang.value });
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

export function addFromLibrary(itemId: string): string | null {
  const s = session.value;
  const item = itemById(itemId);
  if (!s || !item) return null;
  let created: PlanElement | null = null;
  s.commit((show) => {
    const layer = show.layers.find((l) => l.subject === item.layer);
    if (!layer) return show;
    const [next, el] = addElement(show, {
      type: { id: item.id, version: item.version },
      ...freeSpot(show, show.stage.shape.kind === 'rect' ? show.stage.shape.width / 2 : 0, show.stage.shape.kind === 'rect' ? show.stage.shape.depth / 2 : 0),
      layerId: layer.id,
      computer: item.symbol === 'laptop' ? emptyComputer() : null,
    });
    created = el;
    return next;
  });
  const c = created as PlanElement | null;
  if (c) selection.value = [c.id];
  return c?.id ?? null;
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
      stage: shape.kind === 'rect' ? { ...show.stage, shape: { ...shape, width: Math.round(p.stageWidthM * 1000), depth: Math.round(p.stageDepthM * 1000) } } : show.stage,
    };
  });
}
