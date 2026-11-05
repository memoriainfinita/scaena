# Contributing

- **pnpm only**; the lockfile is versioned. Dependencies are pinned to exact versions.
- Every change passes `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm e2e` (see the README for the other scripts). `pnpm e2e:chrome` is a second opinion in Chrome.
- **Design before code.** Each part has a design document in `docs/design/` (`paso-N-diseno-<date>.md`), written before the code and updated with what was and was not done. Measurements go in `docs/research/`. `state.md` is the current state and what is open; what happened lives in `state-history.md`.
- **Tests with the code:** a unit test for each pure operation and rule, an end-to-end test (Firefox) for each thing a person can do, and axe on every screen. `e2e/a11y-all.spec.ts` covers every view and dialog.
- **Texts:** every visible string is in `src/i18n/es.ts` and `en.ts` with the same keys (a test enforces it); the printed document has its own words in `src/document/strings.ts`. Help for a control goes in its tooltip, not beside it.
- **Accessibility:** the reason for anything coloured is also written, controls reach 24 px (WCAG 2.2), and the plot works with the keyboard alone. In JSX over SVG use lowercase attribute names (`tabindex`).
- **Guide:** when the interface changes, rerun `node scripts/screenshots.mjs` and update `docs/guide/` (English first, Spanish in `docs/guide/es/`; a test checks links and images); `node scripts/readme-shots.mjs` regenerates the README's English screenshots.
- **Library data** (symbols, models, programs) is drawn or written from scratch under the same license as the code, with the source URL of each datasheet figure: no brand logos, no copied standards.
