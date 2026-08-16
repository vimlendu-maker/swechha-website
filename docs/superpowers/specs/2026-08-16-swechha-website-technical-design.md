# Swechha Website — Technical Design

**Date:** 2026-08-16
**Status:** Approved in brainstorming; pending user review
**Companion document:** [`2026-08-16-swechha-website-design.md`](./2026-08-16-swechha-website-design.md) (the product brief)

---

## Purpose

The product brief decides *what* to build and *why*. This document decides
*how*: the content pipeline, the design system, routing, the first
implementation slice, and how we verify any of it works.

Where this document and the brief disagree, the disagreement is deliberate
and recorded under [Deviations from the brief](#deviations-from-the-brief).

---

## Context

`~/swechha-website` is an unmodified `create-next-app` scaffold:
Next.js 16.3.1, React 19.2.8, TypeScript, Tailwind CSS v4, ESLint flat
config. Nothing in `app/` beyond generated starter content. No test runner.

The live site is `swechha.in` — WordPress 6.9.1, built with Elementor,
metadata by AIOSEO. Its REST API is publicly readable without
authentication.

### Old-site inventory (measured 2026-08-16)

| Endpoint | Count |
|---|---|
| `posts` | 146 |
| `pages` | 19 |
| `media` | 2,832 |
| `categories` | 5 |
| `tags` | 8 |
| Custom post types | none relevant (`envira`, `soliloquy` are gallery plugins) |

**The old site has no content model.** All 146 items are undifferentiated
`post`s. Nothing in WordPress distinguishes a Project from a Story from a
Film, so the brief's five-type taxonomy cannot be derived mechanically —
assigning types is editorial work requiring knowledge of the content.
Bodies are Elementor-generated markup and need cleaning, not conversion.

165 URLs require redirects to satisfy the brief's success criterion #9
(zero broken links).

A second, richer content source exists locally at
`~/Desktop/SWECHHA MASTER/`: 593 files under `Swechha Projects` and 688
images overall, with folder names that map onto the PROJECT type (Tree
Compendium, PVR Nest, IGES-LCF, GIZ Infographics, Empower, Alumni
Micro-grants, Monsoon Wooding, Swechha Podcasts). Mostly `.docx`/`.pptx`/
`.xlsx`, so extraction is real work.

### Decisions taken during brainstorming

| Decision | Choice |
|---|---|
| Build order | Foundation first, against sample content; audit runs alongside |
| Photography | Sourced from the WordPress media library |
| Authors | Solo for now — no non-technical authoring layer required yet |
| Relations | Explicit slugs in frontmatter, validated at build time |
| First slice | Foundation + STORY end-to-end |
| Typefaces | Free/open, self-hosted only |
| Search | Local static index now; Algolia deferred behind an interface |

---

## Architecture

### 1. Content pipeline

Content lives in `content/<type>/<slug>.md` — five directories, one per
content type. Each file is YAML frontmatter plus a Markdown body.

A single module, `lib/content/`, owns the entire load path. Page components
never touch the filesystem and never parse anything.

**Load sequence, executed at build time only:**

1. **Read and parse.** All files under `content/` are read and split into
   frontmatter and body. No runtime filesystem access; every page is
   statically generated.
2. **Validate per type.** Each type has a Zod schema. A missing `title`, a
   malformed date, a CAMPAIGN `status` outside its enum — the build fails
   naming the file and the field. TypeScript types are inferred from the schemas, so
   schema and types cannot drift.
3. **Resolve relations.** After every file is loaded, a second pass walks
   each entry's `related` map and checks every slug resolves to a real entry
   *of the declared type*. An unresolved slug fails the build naming both
   files. A typo cannot reach production as a dead link.
4. **Emit the search index.** One further pass writes a static JSON index of
   title, summary, type, tags, and slug.

**Public interface:**

```
getAll<Type>()          -> Entry[]      (sorted, newest first)
get<Type>BySlug(slug)   -> Entry | null
getRelated(entry)       -> Entry[]      (resolved, typed)
searchContent(query)    -> Entry[]
```

`searchContent` is the seam. It filters the static index client-side today;
swapping in Algolia later changes this one module and nothing else.

**Why this shape:** one entry point, one failure mode. Publishing is "push
Markdown," but publishing *broken* Markdown is impossible — the build stops
first.

### 2. Design system

Tokens are CSS custom properties declared in `app/globals.css` through
Tailwind v4's `@theme inline`. There is no `tailwind.config.ts` and none
will be added; v4 is CSS-first and the scaffold already follows this.

**Typography.** Two self-hosted open typefaces loaded via
`next/font/local` — a distinctive serif for headlines, a clean grotesque for
body. Self-hosting removes the third-party font CDN request and eliminates
layout shift. Each face is bound to a single CSS variable, so replacing the
headline face later is a one-line change.

Scale per the brief (48 / 36 / 24 / 20 / 14), expressed with `clamp()` so
375px and 1440px both resolve sensibly without a breakpoint stack. Line
height 1.3 for headlines, 1.6 for body.

**Colour.** Near-black, off-white, three grays. Two accents — one warm, one
cool — reserved for navigation state and emphasis. No green in the chrome,
per the brief's explicit "environmental without stereotypical green."
Contrast ratios for every text/background pair will be measured and
reported as numbers, not asserted.

**Spacing.** 8px base scale.

**Motion.** Navigation and hover transitions only, entirely within a
`prefers-reduced-motion` guard.

**Components** — deliberately few, per the brief's trade-off #4: layout
shell, navigation (with mobile treatment), content card, tag, button, prose
wrapper for rendered Markdown, newsletter form.

**Known gap:** there is no usable Swechha logo asset. The only file found is
a 2020 JPEG (`~/Desktop/SWECHHA MASTER/swechha website/swechha site logo.jpg`).
A vector original is needed; this is flagged, not solved.

### 3. Routing

Routes follow the brief's Part 15 sitemap.

```
app/
  layout.tsx                  root shell: fonts, nav, footer, base metadata
  page.tsx                    homepage
  stories/page.tsx            archive
  stories/[slug]/page.tsx     detail
  work/, explore/,
  campaigns/, films/          archive + [slug] pair each
  about/, act/, impact/,
  search/                     static pages
  sitemap.ts, robots.ts       generated from the content accessors
```

Every content route uses `generateStaticParams` and `generateMetadata`. The
entire site is static HTML at build time, which is what makes success
criterion #1 — faster than the old WordPress site — a property of the
architecture rather than something tuned for later.

**Next.js 16 specifics, verified against `node_modules/next/dist/docs/`:**

- `params` is a `Promise` and must be awaited.
- `PageProps<'/stories/[slug]'>` and `LayoutProps<'/'>` are globally
  available generated helpers and must not be imported or hand-written.
- `sitemap.ts` and `robots.ts` file conventions exist as used above.

**Built from the start, not retrofitted:** `sitemap.ts` and `robots.ts`
derive from the same content accessors, so the sitemap cannot go stale.
`next.config.ts` reads a redirect map from a single `redirects.ts` module,
empty initially. Once the mechanism exists, migrating 165 URLs is data
entry rather than engineering.

**Out of this slice:** `/impact` and the `/about/*` sub-pages. They are
static prose with no content-type machinery and are cheap to add once the
shell exists.

### 4. First slice — the STORY vertical

STORY is built end-to-end to prove the whole vertical before it is
replicated four times.

**Frontmatter schema:**

```yaml
title:       string, required
summary:     string, required
author:      string, required
date:        ISO date, required
heroImage:   { src: string, alt: string }   # alt REQUIRED
tags:        string[]
featured:    boolean, default false
related:     { projects: [], knowledge: [], films: [], campaigns: [] }
```

The slug is **derived from the filename** and is not a frontmatter field —
one source of truth, so the two cannot disagree.

`heroImage.alt` being schema-required means accessibility is enforced by the
build rather than left to discipline.

**Deliverables:** the archive at `/stories` (responsive card grid, newest
first); the detail template following the brief's Part 14 Example 1
structure (hero, byline, prose body, related-content block, newsletter
signup); and 3–4 real Markdown entries so the pipeline is exercised against
genuine content rather than lorem ipsum.

When this renders correctly, the remaining four types are schema and
template work with no unknowns remaining.

### 5. Verification

No heavyweight test framework. A content site's failure modes are content
failures, and the build already catches those.

- **The build is the primary test.** Zod validation plus relation resolution
  mean a failing `npm run build` is a real signal: bad frontmatter, dead
  relation, or missing alt text all stop it.
- **Vitest over the content layer only.** Parsing, validation, and relation
  resolution are pure functions worth testing directly — including failure
  cases: does a dead slug actually throw, and is the message useful?
- **Manual browser verification** for anything visual, at 375px and 1440px,
  performed and reported by the implementer rather than delegated to the
  user.
- **Lighthouse scores and contrast ratios reported as measured numbers.**
  No claim of "accessible" or "fast" without the figure that supports it.

---

## Deviations from the brief

| Brief says | This design does | Why |
|---|---|---|
| Algolia for search | Static build-time index, searched client-side, behind a `searchContent` seam | ~165 items does not warrant a paid SaaS dependency, API keys, or a sync step that can silently drift. The seam keeps the upgrade contained. |
| Fonts incl. Söhne, GT Sectra | Free/open self-hosted faces only | Those are commercially licensed (~£200–500+ for web). Headline face is a single swappable token if a budget appears. |
| Week 1–2 discovery, then build | Foundation first; discovery runs alongside | Real content drops into a structure already proven end-to-end, rather than a structure guessed at from an inventory. |

---

## Risks

1. **WordPress media quality.** 2,832 items, but resolution is unknown. If
   the library is already-compressed low-resolution JPEGs, it cannot carry
   the brief's full-bleed photography direction, and originals will be
   needed from whoever shot them. To be checked, and reported honestly
   rather than designed around.
2. **Content typing is unautomatable.** Assigning 146 undifferentiated posts
   across five types requires editorial judgement about the content. This is
   the largest single unestimated cost in the project.
3. **Elementor markup.** Post bodies are page-builder div-soup. Conversion to
   clean Markdown will need per-post attention, not a batch script.
4. **No logo asset.** See Design system above.

---

## Out of scope

Everything the brief assigns to Phase 2+: live environmental data, the
"Swechha NOW" dynamic system, AI-assisted publishing, interactive maps,
complex data visualisation, community features, user accounts, and a
visual-editor CMS.
