# Swechha Website — Technical Design

**Date:** 2026-08-16
**Status:** Approved in brainstorming; pending user review
**Companion document:** [`2026-08-16-swechha-website-design.md`](./2026-08-16-swechha-website-design.md) (the product brief)

---

## Standard to judge against

Every design and technical decision is evaluated against one sentence:

> **"This feels like an organisation shaping the future."**

Not "this looks like a good NGO website." The visual personality must read
as **curious, fearless, human, environmental, contemporary,
action-oriented** — and warm. Restraint must never become coldness.

**Audiences**, served without complicating the experience: young people and
students; environmentalists and climate professionals; partners and funders;
journalists and media; schools and educators; policymakers and institutions;
volunteers and supporters; first-time visitors; existing Swechha
communities.

---

## Brand

Official guidelines exist and are authoritative:
`~/Desktop/SWECHHA MASTER/from Documents/Branding & Creative/Swechha logos/Swechha/swechha_logo guidelines.pdf`
(15 pages, dated May 2025). The full logo package alongside it provides EPS,
PDF, CDR, PNG and JPEG in primary and stacked lockups, with and without
tagline, plus single-colour black and white versions and a favicon.

**Mark:** a coral circle enclosing an ochre heart-shaped leaf.
**Wordmark:** SWECHHA, wide-tracked, teal.
**Tagline:** *Education. Environment. Enterprise.*

### Palette — taken from the guidelines, not invented

| Role | Hex | CMYK |
|---|---|---|
| Primary | `#4BA1A5` teal | 70 / 20 / 35 / 0 |
| Secondary | `#F05A66` coral | 0 / 80 / 50 / 0 |
| Secondary | `#D2C662` ochre | 20 / 15 / 75 / 0 |
| Preferred background | `#2B2D46` deep indigo | 85 / 80 / 45 / 45 |

This palette supersedes the neutral scheme previously proposed here. Coral
and ochre already supply the warmth the brand requires, and a deep indigo
ground is genuinely distinctive rather than template-like. Nothing in it is
stereotypical NGO green, so the brief's colour direction is satisfied by the
real brand rather than in spite of it.

Neutrals are derived to sit with these hues rather than chosen
independently. Every text/background pair is contrast-measured and reported
as a number.

### Logo usage rules — encoded, not left to memory

- White single-colour logo on backgrounds of 50% K or greater **and** on any
  of the logo colours; black single-colour below 50% K.
- Grayscale reproduction uses the black version unmodified.
- Minimum clear space of 4mm equivalent on all sides when set with other
  logos.
- Never recreate the wordmark by typing it from a font; the logo ships as
  artwork.
- Never restyle, recolour, stretch, squash, skew, re-proportion, enclose in
  a shape, or remove elements of the mark.

**Outstanding asset task:** vector sources exist as EPS and PDF, but the web
needs SVG. Conversion happens once at implementation and the result is
committed. The high-resolution transparent PNG (4163×4163) is an acceptable
fallback if conversion proves unreliable — it must never be re-traced by
hand, per the rules above.

### Typography — a recorded, deliberate deviation

The guidelines name **Raleway** (the typeface used in the logo) and
recommend **Merriweather** as a serif companion *in collaterals*. Both are
free and open, satisfying the licensing constraint.

The website will nonetheless use a **contemporary open pairing chosen to
harmonise with the mark**, not these two. Reasoning: both are among the most
widely used typefaces on the web and read as early-2010s; setting the entire
site in them works directly against "visually distinctive" and the standard
at the top of this document. The guidelines specify Raleway *for the logo*
— which ships as artwork and must never be retyped — and recommend
Merriweather *for print collateral beside the mark*, neither of which
constrains website body and heading type.

Approved by the brand owner (2026-08-16). Typefaces are bound to two CSS
variables, so reverting to the guideline pairing is a two-line change.

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
| Environmental Intelligence | **Core in the architecture from day one** — own content type, own top-level nav, homepage prominence. Launch content editorially written; live data feeds are a designed seam, deferred to Phase 2 |

---

## Architecture

### 1. Content pipeline

Content lives in `content/<type>/<slug>.md` — **six** directories, one per
content type: the brief's five (project, story, knowledge, film, campaign)
plus **briefing**, the Environmental Intelligence type described below. Each
file is YAML frontmatter plus a Markdown body.

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

### 1a. Environmental Intelligence — the BRIEFING type — SUPERSEDED 2026-08-17

> **This entire section (1a) is superseded.** The project owner corrected the
> architecture against `Swechha-Website-IA-Environmental-Intelligence-Revised.md`
> (the authoritative source) and
> [`2026-08-17-swechha-design-system-v1.md`](./2026-08-17-swechha-design-system-v1.md)
> §0. There is no `BRIEFING` content type. Environmental Intelligence is a
> **property of `CAMPAIGN`**, which becomes `CAMPAIGN / SITUATION` — one
> content type carrying a lifecycle (`active`/`monitoring`/`achieved`/
> `archived`), severity, live-data fields, and source references. NOW is a
> curated surface over active Situations, not an archive of a separate type.
> The section below is left in place as a historical record of the prior
> (incorrect) model — do not implement against it.

The brief defers Environmental Intelligence to Phase 2; the project
instruction makes it central. These are reconciled by separating the
**pillar** from the **machinery**.

The pillar ships in MVP. The machinery does not.

**BRIEFING** is a sixth content type: a short, human-written piece situating
a current environmental development — a policy change, a research finding, a
pollution event, a climate development in India or globally — and connecting
it to Swechha's work and to something the reader can do.

Its frontmatter mirrors the structure of the brief's own Part 13 "Swechha
NOW" example, but authored rather than generated:

```yaml
title:        string, required
date:         ISO date, required
summary:      string, required
topic:        enum (air, water, waste, climate, biodiversity, policy)
whatHappened:      string, required
whyItMatters:      string, required
whatSwechhaIsDoing: string, required
whatYouCanDo:      string, required
sources:      [{ label, url, publishedAt }]   # required, min 1
related:      { projects, stories, knowledge, films, campaigns }
```

`sources` is **required with at least one entry** and rendered visibly. An
organisation commenting on current environmental affairs without attribution
loses the credibility the site exists to establish. The schema makes an
unsourced briefing impossible to publish.

**The IA consequence.** NOW stops being "recent posts" — a bucket with no
reason to exist — and becomes the Environmental Intelligence pillar:
*what is happening in the environmental world, and what Swechha is doing
about it*. This is the brief's north star sentence made structural:

> Something is happening. I understand it now. I know what I can do. And
> Swechha can help me do it.

**The Phase 2 seam.** A briefing may later carry an optional `liveData`
block (source id, metric, thresholds). Nothing renders it in MVP. When the
data pipeline is built in Phase 2, it populates an existing type inside an
existing pillar with existing editorial review — rather than requiring a new
content type, a new navigation entry, and a homepage redesign.

**Visual treatment — decided by the project owner, 2026-08-16.**

The NOW banner is built with **WebGL / GPU-rendered visuals via Canvas UI**
(`canvasui.dev`, `DavidHDev/canvas-ui`). This is the owner's ruling, made
after the trade-offs below were put to them and overruled.

Implementation constraints established by research, not preference:

- **three.js is not required and should not be added.** Canvas UI has no npm
  dependencies beyond React — it is raw WebGL2. Adding three.js (357 KB min /
  85 KB gzip for the module build alone, plus a 376 KB / 99 KB core) would
  ship an engine Canvas UI does not use.
- **Use WebGL-overlay components, not HTML-in-canvas ones.** Several Canvas UI
  components (Liquid among them) depend on Chrome's experimental
  `canvas-draw-element` flag via `drawElementImage()`/`requestPaint()` — off by
  default, unstandardised. They degrade gracefully, but the effect would be
  invisible to nearly every visitor. Each component's docs page states which
  it is; check before choosing.
- **Distribution is copy-in** (`npx shadcn@latest add @canvas-ui/<name>-react`),
  which places the source in `components/canvasui/`. The code then belongs to
  this repo, so the project's youth (created 2026-07-16) carries far less
  maintenance risk than a package dependency would.
- **Licence is MIT + Commons Clause** (`NOASSERTION` on GitHub) — not OSI open
  source. It permits any personal or commercial use and forbids reselling the
  components. Fine for this site; recorded so it is a conscious choice.
- Canvas UI already respects `prefers-reduced-motion`, caps device pixel ratio
  at 2, and idle-pauses rendering when a simulation settles.

**Scheduling:** the NOW/BRIEFING pillar is its own implementation plan,
following the foundation + STORY plan. The WebGL treatment is built there.

**What is explicitly NOT in MVP:** live API feeds, automated detection of
developments, AI-drafted updates, and the auto-updating homepage banner.
Rationale: live data on a public homepage is a credibility surface, not a
technical convenience. A stale feed, a wrong reading, or a silent fetch
failure damages the organisation on the exact page a funder or journalist
lands on. Doing it responsibly requires source vetting, caching and
staleness rules, visible failure states, and an editorial review step —
which is the infrastructure the brief's Part 8 correctly says does not yet
exist.

### 2. Design system

Tokens are CSS custom properties declared in `app/globals.css` through
Tailwind v4's `@theme inline`. There is no `tailwind.config.ts` and none
will be added; v4 is CSS-first and the scaffold already follows this.

**Typography.** Two self-hosted open typefaces loaded via
`next/font/local`, selected per the Brand section above. Self-hosting
removes the third-party font CDN request and eliminates layout shift. Each
face is bound to a single CSS variable, so replacing either is a one-line
change.

Scale per the brief (48 / 36 / 24 / 20 / 14), expressed with `clamp()` so
375px and 1440px both resolve sensibly without a breakpoint stack. Line
height 1.3 for headlines, 1.6 for body.

**Colour.** The brand palette, per the Brand section above. Accents carry
emphasis and navigation state, never decoration. Contrast ratios for every
text/background pair are measured and reported as numbers, not asserted.

**Spacing.** 8px base scale.

**Motion.** Navigation and hover transitions only, entirely within a
`prefers-reduced-motion` guard.

**Components** — deliberately few, per the brief's trade-off #4: layout
shell, navigation (with mobile treatment), content card, tag, button, prose
wrapper for rendered Markdown, newsletter form, briefing block.

**How the design system gets made.** The token list above is a schematic,
not a design. The actual visual system — typeface pairing, the specific
warm palette, hierarchy, image treatment, motion — is produced using the
installed design skills (`frontend-design`, the taste and UI/UX skills)
rather than assembled from defaults, and judged against the standard at the
top of this document. Defaults are what make a site look templated; that is
the one outcome the brief rules out.

**Known gap:** there is no usable Swechha logo asset. The only file found is
a 2020 JPEG (`~/Desktop/SWECHHA MASTER/swechha website/swechha site logo.jpg`).
A vector original is needed; this is flagged, not solved.

### 3. Routing

Routes follow the brief's Part 15 sitemap.

```
app/
  layout.tsx                  root shell: fonts, nav, footer, base metadata
  page.tsx                    homepage
  now/page.tsx                Environmental Intelligence pillar
  now/[slug]/page.tsx         briefing detail
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

When this renders correctly, the remaining five types are schema and
template work with no unknowns remaining. **BRIEFING is built second**, not
last — it is a core pillar, and its structured multi-field shape is the one
most likely to surface a limitation in the pipeline.

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
| Environmental Intelligence is Phase 2, five content types | ~~Core pillar in MVP as a sixth type (BRIEFING) under a re-purposed NOW~~ **SUPERSEDED 2026-08-17 — see §1a and the design system v1**: Environmental Intelligence is a property of `CAMPAIGN` (→ `CAMPAIGN/SITUATION`), not a separate type; automated data still Phase 2 | The project instruction makes it central. The brief's Part 8 reasons all concern the *machinery* (feeds, detection, automation), not the *editorial pillar*. Shipping the pillar costs content effort, not infrastructure, and gives NOW a reason to exist. |
| Solo authoring assumed | Git + Markdown retained, but validation messages written for a human and the structure kept Decap-CMS-compatible | Project principle 11 requires a non-technical team can maintain it. A visual editing layer can be added later without a content migration. |

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
4. ~~No logo asset.~~ **Resolved 2026-08-16.** A complete logo package and
   official May 2025 brand guidelines were located at
   `~/Desktop/SWECHHA MASTER/from Documents/Branding & Creative/Swechha logos/`.
   See the Brand section. Remaining task is EPS/PDF → SVG conversion.

---

## Out of scope

Everything the brief assigns to Phase 2+: live environmental data, the
"Swechha NOW" dynamic system, AI-assisted publishing, interactive maps,
complex data visualisation, community features, user accounts, and a
visual-editor CMS.
