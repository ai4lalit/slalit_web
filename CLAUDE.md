# Working on this project

Portfolio site for Lalit Shahane. See README.md for structure.

## How to make changes

- Text and data changes go in `content/*.json`. Never hard-code copy in `src/app.js` when a content file can hold it; if new copy is needed, add a field to `content/site.json` and read it via `S.<path>` with `md()`.
- Styling goes in `src/styles.css`. Every colour must be a token defined on bare `:root` (light) and redefined in BOTH dark blocks (`@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and `:root[data-theme="dark"]`).
- New images go in `assets/img/` and are referenced as `img/<name>`.
- After any change: run `python3 build.py`, then republish `dist/preview.html` to the existing preview artifact with `files` `img/*` from `dist/img/`.
- Commit each round of changes with a short message describing what changed on the site.

## Constraints

- Routes are hash-based (`#page` or `#page.<id>`); ids must be lowercase/digits/hyphens.
- The preview runs in a sandbox: no external images (only files in assets/img), no `window.print`, no `alert/confirm`, mailto links are a convenience only. Keep copy buttons for email.
- Do not publish testimonials, read counts or metrics unless the owner confirms they are real.
- Keep the page working at 390px wide with no horizontal scroll, and check both themes.
