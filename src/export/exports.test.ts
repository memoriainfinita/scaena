import { describe, expect, test } from 'vitest';
import { baseName, fileWord, planSvgFile } from './exports.ts';
import { newShow } from '../model/new.ts';

describe('file names', () => {
  test('a show name becomes letters, digits and dashes', () => {
    expect(baseName(' Banda de rock! ')).toBe('Banda-de-rock');
    expect(baseName('???')).toBe('rider');
  });

  test('the word that tells the files of a show apart follows its language', () => {
    expect([fileWord({ lang: 'es' }, 'plot'), fileWord({ lang: 'es' }, 'lists'), fileWord({ lang: 'es' }, 'daysheet')]).toEqual(['plano', 'listas', 'hoja-de-ruta']);
    expect([fileWord({ lang: 'en' }, 'plot'), fileWord({ lang: 'en' }, 'lists'), fileWord({ lang: 'en' }, 'daysheet')]).toEqual(['plot', 'lists', 'day-sheet']);
  });

  test('the plot SVG of an English show is named in English', () => {
    const show = { ...newShow('Rock night'), lang: 'en' as const };
    expect(planSvgFile(show, {}).name).toBe('Rock-night-plot.svg');
    expect(planSvgFile({ ...show, lang: 'es' as const }, {}).name).toBe('Rock-night-plano.svg');
  });
});
