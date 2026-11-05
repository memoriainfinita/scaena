import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default defineConfig([
  { ignores: ['dist/**', 'vendor/**', '.archive/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**', 'build/**', '*.config.*', 'e2e/**'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Tests build shows step by step with `let [show, id] = ...`; the destructuring reads better than splitting it.
    files: ['**/*.test.ts'],
    rules: { 'prefer-const': ['error', { destructuring: 'all' }] },
  },
  {
    files: ['src/sw/sw.ts'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
]);
