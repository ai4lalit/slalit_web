# Lalit Shahane — Portfolio Website

A multi-page personal portfolio for Lalit Shahane, Product Experience & UX Transformation Leader.
Single-page app with hash routing, light and dark themes, no framework and no runtime dependencies.

## Pages

| Route | Page |
|---|---|
| `#home` | Hero, stats, selected work, autonomy-dial demo, leadership pillars, latest essays, career arc, photography teaser |
| `#work` | All case studies, filterable by AI experiences / Enterprise UX |
| `#case.<id>` | Case study detail: overview, five design phases (tabs), leadership, outcomes, takeaway |
| `#thinking` | All essays, with category filter and search |
| `#article.<id>` | Essay with reading progress, takeaways, tags, related essays |
| `#journey` | Interactive career timeline (expand steps, milestones-only switch) |
| `#about` | Bio, current role, leadership pillars, education and credentials |
| `#photography` | Photo stories gallery, lightbox, "post a photo story" form (saved in the visitor's browser) |
| `#resume` | Résumé summary |
| `#contact` | Contact details and a form that prepares an email |

## Project structure

```
content/                 ← edit these to change what the site says
  site.json              page copy: hero, stats, section headings, about, résumé, contact, footer
  profile.json           name, email, LinkedIn, location
  case-studies.json      the 5 case studies (order here = order on the site)
  articles.json          the 10 essays
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

## Deploy

Upload the `dist/` folder (`index.html` + `img/`) to any static host: Netlify, Vercel, GitHub Pages,
Cloudflare Pages, S3. No server is needed.

## Writing conventions in content

- `**double asterisks**` in `site.json` text become bold.
- In `site.json` stats, `{caseStudyCount}` and `{articleCount}` are filled in automatically.
- Ids (`"id"`) appear in URLs: lowercase letters, digits and hyphens only.
- Bullet points written as `Label: text` in essays render with the label in bold.

## Theme

Colours are tokens at the top of `src/styles.css`: light values on `:root`, dark values in the two
dark blocks below it. Fonts: Bricolage Grotesque (display), Instrument Sans (body), JetBrains Mono (labels).
