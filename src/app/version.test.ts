import { expect, test } from 'vitest';
import { appVersion } from './version.ts';

test('the version comes from package.json', () => {
  expect(appVersion()).toMatch(/^\d+\.\d+\.\d+$/);
});
