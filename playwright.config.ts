import { defineConfig, devices } from '@playwright/test';

// End-to-end tests in Firefox, muted, against the production build (`pnpm build` first).
// Playwright's colorScheme emulation does not reach Firefox; its own pref does (0 dark, 1 light).
const firefox = (theme: 0 | 1 = 0) => ({
  ...devices['Desktop Firefox'],
  launchOptions: { firefoxUserPrefs: { 'media.volume_scale': '0.0', 'layout.css.prefers-color-scheme.content-override': theme } },
});

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'app', use: { ...firefox(), locale: 'es-ES', baseURL: 'http://127.0.0.1:4184/' } },
    { name: 'app-light', grep: /@a11y/, use: { ...firefox(1), locale: 'es-ES', baseURL: 'http://127.0.0.1:4184/' } },
  ],
  webServer: [{ command: 'pnpm preview --host 127.0.0.1', url: 'http://127.0.0.1:4184/', reuseExistingServer: !process.env.CI }],
});
