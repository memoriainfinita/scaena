import { describe, expect, test } from 'vitest';
import { en } from './en.ts';
import { es } from './es.ts';
import { resolveLang, t } from './index.ts';

describe('messages', () => {
  test('both languages have exactly the same keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  test('plural messages have both forms in both languages, and placeholders match', () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(es) as (keyof typeof es)[]) {
      const a = es[key] as string | { one: string; other: string };
      const b = en[key] as string | { one: string; other: string };
      expect(typeof a, key).toBe(typeof b);
      if (typeof a === 'string' && typeof b === 'string') expect(vars(a), key).toEqual(vars(b));
      else if (typeof a !== 'string' && typeof b !== 'string') {
        expect(vars(a.other), key).toEqual(vars(b.other));
        expect(vars(a.one), key).toEqual(vars(b.one));
      }
    }
  });

  test('every layer subject and module has a name', () => {
    for (const s of ['stage', 'audio', 'lights', 'electrical', 'control', 'notes', 'background', 'custom']) expect(es).toHaveProperty(`layer.${s}`);
    for (const m of ['audio', 'lights', 'computers', 'video', 'room', 'power', 'document', 'production']) expect(es).toHaveProperty(`module.${m}`);
  });
});

describe('t', () => {
  test('fills variables and picks the plural form', () => {
    expect(t('status.channels', { n: 1 }, 'es')).toBe('1 canal');
    expect(t('status.channels', { n: 17 }, 'es')).toBe('17 canales');
    expect(t('status.channels', { n: 1 }, 'en')).toBe('1 channel');
    expect(t('library.none', { query: 'x' }, 'en')).toBe('No results for “x”');
  });

  test('resolves the language from the browser list, English by default', () => {
    expect(resolveLang('auto', ['fr-FR', 'es-MX'])).toBe('es');
    expect(resolveLang('auto', ['fr'])).toBe('en');
    expect(resolveLang('en', ['es'])).toBe('en');
  });
});
