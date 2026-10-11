# Lalit Shahane — Portfolio Website

A multi-page personal portfolio for Lalit Shahane, Product Experience & UX Transformation Leader.
Single-page app with hash routing, light and dark themes, no framework and no runtime dependencies.

## Pages

| Route | Page |
|---|---|
| `#home` | Hero, stats, selected work, autonomy-dial demo, leadership pillars, latest articles, career arc, photography teaser |
| `#work` | All case studies, filterable by AI experiences / Enterprise UX |
| `#case.<id>` | Case study detail: overview, five design phases (tabs), leadership, outcomes, takeaway |
| `#thinking` | All articles, with category filter and search |
| `#article.<id>` | Article with reading progress, takeaways, references, previous/next and related articles |
| `#journey` | Interactive career timeline (expand steps, milestones-only switch) |
| `#about` | Bio, current role, leadership pillars, education and credentials |
| `#photography` | Photo stories gallery, lightbox, "post a photo story" form (saved in the visitor's browser) |
| `#resume` | Résumé summary |

## Project structure

```
content/                 ← edit these to change what the site says
  site.json              page copy: hero, stats, section headings, about, résumé, footer
  profile.json           name, email, LinkedIn, location
  case-studies.json      the 5 case studies (order here = order on the site; first one is featured).
                         Each has: summary, metrics, discover/define/ideate/prototype/implement (+ optional evolve),
                         leadership (intro, actions, capabilities, lessons), outcomes, evidenceBase, pullQuote.
                         Confidential: keep product and people names out; use roles and generic names.
  articles.json          the 10 articles (AI and the Future of UX series)
  career.json            career timeline steps (isMilestone: true = teal milestone)
  leadership-pillars.json
  credentials.json
  photo-stories.json     imageUrl: "img/<file>" from assets/img, or null for a generated light study
assets/img/              images (portrait.jpg, tulsibaug.jpg)
src/
  head.html              <title>, meta description, Google Fonts
  styles.css             all styles; colour tokens for light and dark at the top
  layout.html            header, mobile menu, footer, modal shell
  app.js                 router, page templates and interactions
build.py                 builds dist/ from src/ + content/ (Python 3, no packages needed)
dist/                    generated output, do not edit by hand
  index.html             standalone site, deploy this folder
  preview.html           version used for the Claude artifact preview
```

## Build

```
python3 build.py
```

The build checks the content first (valid JSON, unique ids, image files exist) and stops with a
plain-language list of problems if anything is wrong.

## Publishing (GitHub Pages)

Every push to `main` runs `.github/workflows/deploy.yml`, which runs `build.py` and publishes `dist/`
to GitHub Pages. `dist/` is generated, so it is not committed.

One-time setup: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Editing on github.com (no download needed)

1. Open a file in `content/` (for example `content/site.json`) and click the pencil icon.
2. Change the text inside the quotes. Keep the commas, brackets and quotes as they are.
3. Click **Commit changes**. The site rebuilds and goes live in about a minute.
4. Check progress in the **Actions** tab. A red ✗ means the content check failed. Open the run
   to see the plain-language error (for example "invalid JSON at line 12"), fix it and commit again.

To add an image: open `assets/img/`, choose **Add file → Upload files**, then reference it as
`img/<file name>` in the content.

For anything bigger (new sections, design changes), ask Claude with the repository attached.

## Writing conventions in content

- `**double asterisks**` in `site.json` text become bold.
- In `site.json` stats, `{caseStudyCount}` and `{articleCount}` are filled in automatically.
- Ids (`"id"`) appear in URLs: lowercase letters, digits and hyphens only.
- Articles (`articles.json`) are a list of `sections`, each a `heading` plus `blocks`. Block types:
  `p` (text), `ul` / `ol` (items), `quote` (pull quote), `callout` (label + text),
  `table` (columns + rows), `cards` with style `zones` or `ladder` (label + text items).
  Article text supports `**bold**`, e.g. `**Name owners.** Literacy, guidelines…`.
- An article's `number` sets its place in the series; the Thinking page and home teaser follow that order.

## Theme

Colours are tokens at the top of `src/styles.css`: light values on `:root`, dark values in the two
dark blocks below it. Fonts: Bricolage Grotesque (display), Instrument Sans (body), JetBrains Mono (labels).
