# Publishing scaena

As of 2026-11-05: **published** at https://memoriainfinita.github.io/scaena/ (public repository https://github.com/memoriainfinita/scaena, Pages from GitHub Actions).

## How it is set up

- `.github/workflows/ci.yml`: on every push or pull request it runs lint, unit tests, the build, the browser tests in Firefox (desktop, light theme and a phone-sized window) and the structure check of the PDF; on a push to `main` it uploads `dist/` to Pages, with the actions pinned to a commit. It can also be started by hand (`workflow_dispatch`), but then it **does not deploy**: deploying needs a push.
- A push that only touches `**.md` or `docs/**` does not start the CI (nor does an empty commit). To redeploy, change something that is not documentation.
- Relative base (`./`): works under `/scaena/` and under any other path.
- Security header: the content policy sits in a `<meta>` (Pages does not allow headers) and the service worker also adds it as a header, with `frame-ancestors 'none'`.
- No CDN, remote fonts or analytics.

## What was checked against the real site

`node scripts/live-check.mjs` (Firefox, muted): opens a show, makes the PDF and makes it again offline. On 2026-11-05: first PDF in 4.4 s, offline in 2.4 s, no console errors. The compiler (`typst/0.7.0/compiler.wasm`, 28.3 MB) is served as `application/wasm` with `Cache-Control: max-age=600`.

`node scripts/live-sweep.mjs` goes through the 7 packages in Spanish and English with all their views: no console errors, failed requests or text of one language in the other (2026-11-05). `node scripts/live-look.mjs` takes screenshots to look at. The repository has a description, a link to the site and topics, and holds no personal data (commits use GitHub's anonymous email).

## Incidents of the first deployment

- The first CI run failed in a phone test that used Playwright's tap: in Firefox on Linux it does not produce the same pointer events. The test now sends the events directly.
- The first two deployments to Pages ended in "error" or "cancelled" without a description (the first sat ten minutes in `deploy-pages`). A new push fixed it; it has not been seen again.

## Afterwards

- Every change on `main` redeploys. Users see a notice with "Update"; the page never reloads by itself.
- Version: change `version` in `package.json`, note the change in `CHANGELOG.md` and regenerate `THIRD-PARTY-NOTICES.md` if the dependencies change.
- Not yet checked: Chrome keeping the `.wasm` between visits on the real site, a real phone and Safari.
- Open before saying "1.0": PDF/UA with veraPDF once the compiler publishes `ua-1`, Cyrillic and Greek in the PDF, and whatever is left in the TODO of `state.md`.
