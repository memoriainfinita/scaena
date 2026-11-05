import { describe, expect, test } from 'vitest';
import { PACKAGES } from './packages.ts';
import { showFromPackage } from './apply.ts';
import { translatableTexts, translatePackageText } from './translate.ts';

const known = new Set(translatableTexts());
const covered = (text: string) => !text || known.has(text) || known.has(text.replace(/ \d+$/, '')) || /^\d+$/.test(text);

describe('package texts in English', () => {
  test('numbered names keep their number', () => {
    expect(translatePackageText('Voz 2', 'en')).toBe('Vocal 2');
    expect(translatePackageText('Actor 8', 'en')).toBe('Actor 8');
    expect(translatePackageText('Voz 2', 'es')).toBe('Voz 2');
    expect(translatePackageText('algo que escribió el usuario', 'en')).toBe('algo que escribió el usuario');
  });

  test('every label, channel name, stand and program use in the packages has an English text', () => {
    const missing: string[] = [];
    for (const p of PACKAGES) {
      const show = showFromPackage(p, 'x', 'es');
      const texts = [
        ...Object.values(show.elements).flatMap((e) => [e.label, ...(e.computer?.programs.map((pr) => pr.use) ?? [])]),
        ...Object.values(show.channels).flatMap((c) => [c.shortName, c.stand, c.mic.includes('.') ? '' : c.mic]),
      ];
      for (const t of texts) if (!covered(t)) missing.push(`${p.id}: ${t}`);
    }
    expect(missing.join('\n')).toBe('');
  });

  test('a show made in English has no Spanish names left in what the packages wrote', () => {
    for (const p of PACKAGES) {
      const show = showFromPackage(p, 'x', 'en');
      const words = [...Object.values(show.elements).map((e) => e.label), ...Object.values(show.channels).flatMap((c) => [c.shortName, c.stand])];
      expect(words.filter((w) => /\b(Voz|Cuña|Batería|Guitarra|Pie corto|Bombo|Caja|Mesa|Diadema|Telón|Pata)\b/.test(w))).toEqual([]);
    }
  });
});
