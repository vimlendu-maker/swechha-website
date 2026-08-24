# SEO programme — design

**Date:** 2026-08-24
**Status:** approved in chat, pending written review
**Scope owner ruling:** all four search intents in play (branded, category,
topical, donor/CSR); technical + metadata + migration recovery + new pages.

---

## 0. The governing constraint

**No creative copy is touched.** H1s, body prose and section headings stay
exactly as written. The editorial voice — "We keep the record", "Of one's own
free will", "Nothing grew here." — is the outcome of a documented decision
process and is the site's most distinctive asset. Every keyword-bearing change
in this programme lands in `<head>` or in structured data, never in the
reader's text.

This rules out, permanently and by instruction:

- rewriting any `<h1>`,
- promoting the homepage's context line to an `<h2>`,
- editing body copy, card titles, nav words or section headings.

`<title>` and `<meta name="description">` are not page content — they are the
SERP surface, invisible on the page — and they are where the keyword work goes.

## 1. The architectural fact everything else follows from

**35 of 37 servable URLs are not React pages.** They are pre-built static HTML
under `public/_pages/v3/`, mapped onto canonical routes by a `beforeFiles`
rewrite (`next.config.ts:21-23`, `design-routes.ts:142-196`). `app/layout.tsx`'s
`metadata` export never executes for them.

**And they are committed artefacts, not build output.** `npm run build` is
`next build` and nothing more. The generators (`scripts/build-*.mjs`) run on a
developer machine or in GitHub Actions, and their output is committed.

Two existing workflows already close the drift hole this would otherwise open:

- `.github/workflows/generated-current.yml` regenerates every page on every PR
  and push to `main` and **fails if the working tree moved**. A register edit
  that is not accompanied by regenerated HTML cannot merge.
- `.github/workflows/content-rebuild.yml` rebuilds and commits whenever
  `data/**` changes.

Consequence for this design: the SEO register belongs under `data/`, because
that is the directory whose changes already trigger a rebuild. No new
automation is required.

## 2. Findings that set the priority order

Evidence from a full static audit plus live checks against production on
2026-08-24.

### 2.1 The migration is mid-flight and this outranks everything else

`site:swechha.in` returns **only old WordPress URLs**. Not one of the 35 new
URLs surfaces. Of the ten Google currently ranks, **six return 404**:

| Indexed URL | Live status | Obvious target |
|---|---|---|
| `/contact-us/` | 404 | `/act` |
| `/blog` | 404 | `/stories` |
| `/project/` | 404 | `/work/projects` |
| `/project/yamuna-yatra-2/` | 404 | `/work/journeys/yamuna-yatra` |
| `/profile/` | 404 | `/about` |
| `/about-us/` | 404 | `/about` |
| `/donate/` | 404 | `/act` |

`docs/legacy/redirect-map.json` holds 1,240 captured URLs; 167 redirect and
1,073 are `to: null`. **The 1,073 are mostly correct** — 996 are WordPress
attachment pages and 53 are empty shells. The rulings in that map are sound.

The failure is **omission, not misjudgement**: `/blog`, `/project/`,
`/profile/`, `/about-us/` and `/donate/` are absent from the map entirely. The
map was built by crawling the old site's internal links, so it structurally
cannot contain URLs the old site had stopped linking to but Google still holds
— precisely the class that carries aged backlinks. `/contact-us/` is the one
exception: present, and deliberately ruled `to: null` with the reason "a title
and a breadcrumb; the real details are in the footer"
(`docs/legacy/redirect-map.json:1235`).

**Only Google Search Console's Pages report can produce the authoritative
list.** GSC is therefore an input to this programme, not merely its
measurement.

### 2.2 Production is indexable — risk closed

`https://swechha.in/robots.txt` serves `Allow: /` with the sitemap line. The
`SITE_INDEXABLE` gate (`lib/org.ts:82-84`, `app/robots.ts:12-14`) is satisfied
in the Vercel environment. No action needed.

### 2.3 The metadata baseline is good, and the gaps are additions

35/35 unique non-empty titles and descriptions, all within length limits,
enforced by a build gate (`scripts/lib/situation-shell.mjs:1803-1815`). Exactly
one `<h1>` per page. Zero heading-level skips. **100% alt coverage across 292
images.** Zero orphan routes. Zero JS-only navigation. This is a well-built
site; the work below is mostly addition.

Real gaps, in impact order:

1. **20 of 35 titles are a bare label plus " — Swechha"**, under 25 rendered
   characters: `Now`, `Impact`, `Events`, `The work`, `Projects`, `Campaigns`,
   `Publications`, `Bridge the Gap`, `Delhi's air`, `India's heat`, and ten
   more. They spend most of the SERP title budget on the brand and carry no
   query term — no "Delhi", "NGO", "school", "volunteer".
2. **`og:image` is root-relative on all 35 pages**
   (`scripts/lib/situation-shell.mjs:1859`, `scripts/lib/work-shell.mjs:2203`);
   `og:url` and `twitter:image` are absent.
3. **`BreadcrumbList.item` is root-relative on 21 pages**, against Google's
   absolute-URL requirement.
4. **No `WebSite` + `SearchAction`** anywhere, despite a real `/search` page.
   No `Organization` node on `/about`. No `Article` on the five essays, though
   author, ISO date and word count sit unused in `content/essay/_index.json`.
   No `BreadcrumbList` on 14 URLs that should have one.
5. **Sitemap `lastModified` is a build timestamp.** All 35 `<lastmod>` values
   in production fall inside one 19-second window, because `app/sitemap.ts:32-37`
   stats file mtime and the generators rewrite every file on every run. This is
   the exact failure that file's own comment warns against.
6. **`/search` is indexable and in the sitemap**; **`/explore` is live,
   indexable, empty and orphaned** — zero inbound internal links, a content
   grid that renders zero children, and a self-referencing canonical.
7. **281 of 292 images carry no `width`/`height`** → CLS on every page. 24 MB
   of unoptimised JPEG, no `srcset`, no WebP, no LCP preload.
8. **`lang="en"` contradicts `og:locale="en_IN"`** on all 35 pages.

### 2.4 One recorded decision this programme contests

`scripts/lib/situation-shell.mjs:1832-1837` states the relative `og:image` is
deliberate: an absolute value "baked in at build time advertises the preview
host on every preview deploy", and "scrapers resolve a relative og:image
against the document URL."

**The first half no longer applies.** Generation does not happen on preview
deploys — the HTML is committed and identical on every deploy (§1). The stated
hazard cannot occur.

**The second half is a factual claim about third-party crawlers that this repo
has never verified**, and the Open Graph protocol specifies a URL. Support for
relative values is inconsistent across consumers. This design does not assert
that share cards are currently broken; it treats conformance as cheap
insurance and requires empirical confirmation (§6).

The same file already prescribes the fix: "If a later pass wants absolute
values they come from SITE_ORIGIN at build time, never from a literal."

## 3. Architecture

### 3.1 The register

**`data/seo/pages.json`** — one entry per canonical route:

```
"/work/projects": {
  "title": "...",
  "description": "...",
  "ogType": "website"
}
```

JSON rather than TypeScript because the generators are `.mjs` scripts running
outside the Next build and cannot import TS. This matches how
`data/org-jsonld.json` and `data/work/onward.json` already work, and it puts
the register in the directory `content-rebuild.yml` already watches.

It absorbs and replaces:

- `scripts/lib/situation-shell.mjs`'s `DESCRIPTIONS` map (13 routes),
- the per-page title literals passed from `scripts/build-work-pages.mjs`,
- the standalone generators' local title/description literals.

It resolves a live drift: `situation-shell.mjs:1829` and the shipped
`about.html:10` currently carry **two different descriptions for `/about`**,
because the about generator overrides the shared register.

### 3.2 Where the invariants live

`scripts/verify-final.mjs` is already a 604-line acceptance gate over the built
HTML with named checks, and `generated-current.yml` already runs it. SEO
invariants go **there**, over the built output — because the built output is
what ships — rather than in a parallel Vitest file that would only test the
register in isolation.

Checks to add:

- exactly one register entry per `designRoutes()` route; no missing, no orphans
- titles unique and <= 60 rendered characters
- **no thin title**: after stripping the ` — Swechha` suffix, the remainder
  must be >= 15 rendered characters and must contain at least one term from an
  allow-list of query words (`Delhi`, `India`, `NGO`, `environmental`,
  `school`, `volunteer`, `river`, `Yamuna`, `climate`, `air`, `forest`,
  `farm`, `donate`, `report` …). A length floor alone would pass
  "Publications — Swechha"; the term requirement is what actually catches the
  twenty. The allow-list lives beside the check and is extended, not
  circumvented, when a page legitimately needs a new term.
- descriptions unique, 140–158 characters (the existing rule, kept)
- every `og:image`, `og:url` and `BreadcrumbList.item` absolute
- `<html lang>` agrees with `og:locale`
- every routed page carries a canonical, and it matches its route

A small Vitest file covers the register loader itself; the HTML-level
guarantees stay in `verify-final.mjs` where the existing gates are.

## 4. Workstreams, in execution order

**W0 — Search Console (owner task, unblocks W5).** Verify `swechha.in` via DNS
TXT, submit `sitemap.xml`, export the Pages report. Cannot be done by an agent:
it needs the owner's Google account and DNS access. Deliverable from this side
is a runbook, not code.

**W1 — Register + gates.** Create `data/seo/pages.json` seeded from current
shipped values (a pure refactor: byte-identical HTML output, proving the
register is wired correctly before any value changes). Add the
`verify-final.mjs` checks. Rewire the generators to read it.

**W2 — Head conformance.** Absolute `og:image` and `og:url` derived from
`SITE_URL`; add `twitter:image`; absolute `BreadcrumbList.item`;
`lang="en-IN"`. One shared head emitter used by both shells.

**W3 — Titles and descriptions.** Rewrite the 20 thin titles in the register to
carry query terms and location. `<head>` only — no page text changes.

**W4 — Structured data.** `WebSite` + `SearchAction`; `Organization` on
`/about`; `Article` on the five essays (author, `datePublished`, `wordCount`
from `content/essay/_index.json`) plus `og:type=article` and `<time datetime>`;
`BreadcrumbList` on the 14 pages missing it. Respects the standing rulings that
strike phone and street address — locality-level markup only, and
`scripts/build-hero.mjs:512`'s build gate against a reappearing `telephone`
stays.

**W5 — Migration recovery.** Reconcile the legacy map against GSC's real list;
re-point recoverable URLs. **Blocked on W0 and on an owner ruling for
`/contact-us/`** (§5).

**W6 — Index hygiene.** `noindex, follow` on `/search` and drop it from the
sitemap; resolve `/explore`. Sitemap `lastModified` derived from a content-hash
register so a rebuild that changes nothing stops resetting all 35 dates.

**W7 — CWV, cheap half.** `width`/`height` on images (kills CLS) and
`fetchpriority="high"` plus a preload on each page's LCP image. The pattern
already exists in `scripts/build-stories-page.mjs`, whose output is the one
correctly-sized page.

**W8 — New pages.** Contact and partnerships routes, for the donor/CSR intent
that currently has nothing to rank. Needs owner-supplied facts; new content,
not a rewrite of existing content.

### 4.1 What the first implementation plan covers

W1–W4, W6 and W7 — everything unblocked, and a coherent single pass over the
generators and the head emitters.

**W5 and W8 do not enter that plan.** W5 is blocked on W0 (owner) and on the
`/contact-us/` ruling (§5); W8 is new content requiring owner-supplied facts,
and is a content project rather than a metadata pass. Each gets its own plan
when its blocker clears. Folding either into the first plan would produce a
plan that cannot be executed to completion.

## 5. Decisions still open — owner

1. **`/contact-us/` → `/act`.** Overrides a recorded ruling. It is one of ten
   pages Google ranks, under "Partnerships, Volunteering and Internships" —
   high commercial intent. Recommendation: re-point, and record it as a new
   decision superseding the old on the grounds that the original ruling
   weighed reader value and did not weigh accumulated link equity.
2. **The other six 404ing URLs.** No ruling conflict; recommendation is to
   re-point all six now rather than wait for the full GSC list, since they are
   confirmed indexed today.
3. **`/explore`** — `noindex` (reversible, keeps scaffold) or delete
   (cleanest). Recommendation: `noindex`.

## 6. Verification

- `npm test`, `npm run lint`, `npm run build` clean.
- `npm run verify:final` passes with the new checks.
- `generated-current.yml` green — proves register and committed HTML agree.
- W1 asserted as a **byte-identical diff** on `public/_pages/v3/**` before any
  value changes.
- Live re-check of the seven legacy URLs after W5: 308 to a 200, not to a 404.
- **Owner-run, needs their logins:** Facebook Sharing Debugger and LinkedIn
  Post Inspector before and after W2, to settle §2.4's unverified claim; Google
  Rich Results Test on one essay, one situation and `/about` after W4.

## 7. Out of scope

- **Full image pipeline** — WebP/AVIF conversion and `srcset` across 24 MB of
  photography. A real project, not a metadata pass, and it collides with this
  repo's EXIF-rotation history: stripping orientation without rotating pixels
  previously shipped seven photos rotated 90°. Any conversion must apply
  `exif_transpose` and be gated on more than dimensions.
- **Self-hosting Archivo and Newsreader** to remove the render-blocking Google
  Fonts request. Worth doing; independent of everything here.
- **Any change to reader-facing copy** (§0).
