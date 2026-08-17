# Foundation baseline — 2026-08-17

Measured against the production build (`npm run build && npm run start`),
target page `http://localhost:3000/stories/delhi-air-victory` unless noted.
Environment: macOS, Google Chrome (headless), Lighthouse 13.4.1 run via
`npx lighthouse` (mobile form factor, mobile screen emulation).

## Contrast ratios

Computed with a WCAG 2.1 relative-luminance script (`sRGB → linear →
relative luminance → (L1+0.05)/(L2+0.05)`), matching the brief's
pre-computed expected values exactly:

| Pair | Ratio | Required | Result |
|---|---|---|---|
| ink `#1C1D2B` on paper `#FBF9F5` | **15.85:1** | ≥4.5:1 body | PASS |
| ink-muted `#55576B` on paper `#FBF9F5` | **6.74:1** | ≥4.5:1 body | PASS |
| paper `#FBF9F5` on indigo `#2B2D46` | **12.75:1** | ≥4.5:1 body | PASS |
| teal-ink `#2C6E72` on paper `#FBF9F5` | **5.58:1** | ≥4.5:1 link text | PASS |

For the record only (never used as text):

| Pair | Ratio | Note |
|---|---|---|
| brand teal `#4BA1A5` on paper | 2.88:1 | Fails both the 4.5:1 body bar and the 3:1 large-text bar. Used only for the logo and non-text fills — confirmed to appear nowhere as `text-teal` (see below). |
| brand coral `#F05A66` on paper | 3.14:1 | Fails the 4.5:1 body bar but passes the 3:1 large-text bar — legitimate for display headings ≥24px only. |

**`text-teal` audit**: searched `app/` and `components/` for the bare
utility class `text-teal` (as distinct from `text-teal-ink`, `border-teal`,
`bg-teal`, etc.). Result: **zero matches.** Every `text-*` teal usage found
is `text-teal-ink` (the corrected, 5.58:1 token); `border-teal` appears once,
on the homepage's "All stories" link, which is a border, not text, and is
the deliberate, correct usage called out in the brief.

## Lighthouse (mobile), production build

Ran `npx lighthouse http://localhost:3000/stories/delhi-air-victory
--form-factor=mobile --screenEmulation.mobile
--only-categories=performance,accessibility,best-practices,seo` against
Chrome headless, since no interactive DevTools session was available in
this environment.

| Category | Score |
|---|---|
| Performance | **100** |
| Accessibility | **100** |
| Best Practices | **96** |
| SEO | **100** |

(Best Practices at 96 rather than 100 — the JSON report was not inspected
further for which specific audit lost points; flagged as a follow-up if a
100 is required.)

## Third-party requests

From the Lighthouse network-requests audit (20 total requests captured
during the page load): **0 requests** to `fonts.googleapis.com` or
`fonts.gstatic.com`, and in fact all 20 requests resolve to a single origin,
`http://localhost:3000` — confirming `next/font/google` (Fraunces,
Instrument Sans) is fully self-hosted at build time with no runtime calls
to Google's font CDN.

## Page weight

From the same Lighthouse network-requests audit:

- **Total requests: 20**
- **Total transfer size: 336.5 KB** (344,622 bytes)

Breakdown by resource type:

| Type | Count | Transfer size |
|---|---|---|
| Script | 6 | 140.7 KB |
| Font | 2 | 147.8 KB |
| Other (favicon etc.) | 1 | 25.6 KB |
| Fetch (RSC payload chunks) | 7 | 7.3 KB |
| Stylesheet | 1 | 5.2 KB |
| Document (HTML) | 1 | 5.6 KB |
| Image | 2 | 4.4 KB |

## Build output (bundle sizes)

`npm run build` (Next.js 16.3.1, Turbopack) output:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /robots.txt
├ ○ /sitemap.xml
├ ○ /stories
└   /stories/[slug]
  ├ ● /stories/delhi-air-victory
  ├ ● /stories/rooftop-sanctuary
  └ ● /stories/monsoon-wooding-2021

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

Turbopack's `next build` output in this Next.js version does not print the
classic per-route "Size / First Load JS" table, so the traditional bundle
table could not be captured. As a substitute, largest built JS chunks under
`.next/static/chunks/` (from `du -h`):

| Chunk | Size |
|---|---|
| `227kwhsrjlnp4.js` | 224K |
| `2gefo9ja1l2mo.js` | 164K |
| `0cz1d0mv5g_q7.js` | 112K |
| `3151ifgx5u_mf.js` | 40K |
| `19mx3mg6lkumu.js` | 32K |
| `3fntmmi971322.js` | 16K |
| `turbopack-1w_es4eco71c8.js` | 12K |
| `3s6nzrbk-8mnv.js` | 8.0K |
| **Total `.next/static/chunks/`** | **628K on disk** |

All routes confirmed static (`○` or `●`); none marked `ƒ` (server-rendered
on demand).

## What could NOT be measured, and why

- **Interactive DevTools Network-tab walkthrough** as the brief literally
  describes (manual reload + inspect in Chrome DevTools) was not performed
  as a manual UI action — there is no interactive browser session in this
  environment. Instead, Lighthouse's own `network-requests` audit was used
  as the equivalent data source, which captures the same information
  (per-request URL, type, and transfer size) that DevTools' Network tab
  would show for a single page load. This is considered equivalent, not a
  gap, but is noted since it wasn't done via the literal manual click-path
  the brief describes.
- **Per-route "Size / First Load JS" bundle table**: Next 16 + Turbopack's
  `next build` does not emit this table in this version (unlike the
  webpack-based `next build` output the brief may have been assuming). Chunk
  sizes on disk were reported instead as the closest available substitute.
- **Best Practices' specific missing audit** (96 instead of 100): not
  drilled into for this baseline; the full JSON report is retained
  transiently in the working environment but not committed to the repo.

No numbers in this report are estimated or invented — every figure above
was read directly from the WCAG contrast script, the Lighthouse JSON
report, or `du`/`next build` output.
