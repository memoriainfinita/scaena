import { defineConfig } from '@playwright/test';

// The same tests in Chrome (the installed one, muted), for what only Chrome shows: `pnpm e2e:chrome` after `pnpm build`.
// Firefox stays the main target; this is a second opinion, not part of CI.
const base = { channel: 'chrome' as const, launchOptions: { args: ['--mute-audio'] }, locale: 'es-ES', baseURL: 'http://127.0.0.1:4184/' };

export default defineConfig({
  testDir: 'e2e',
  reporter: 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'chrome', testIgnore: /(mobile|landscape)\.spec|shots\.spec/, use: base },
    { name: 'chrome-mobile', testMatch: /(mobile|landscape)\.spec/, use: { ...base, viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: [{ command: 'pnpm preview --host 127.0.0.1', url: 'http://127.0.0.1:4184/', reuseExistingServer: true }],
});
