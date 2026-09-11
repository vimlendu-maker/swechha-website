# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

This is Swechha's rebuilt marketing/content site: a static, statically-typed
Next.js app that replaces `swechha.in`'s old WordPress+Elementor install.
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4. Content
(stories today; five more types are scaffolded but empty — see below) is
authored as Markdown with YAML frontmatter under `content/`, Zod-validated
at build time, and rendered into fully static routes. There is no database
and no server-side rendering per request — every route is prerendered
(`○`/`●` in the build output, never `ƒ`).

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build (also where content validation runs —
  see below)
- `npm run start` — serve the production build (run `build` first)
- `npm run lint` — ESLint via the flat config in `eslint.config.mjs`
- `npm test` — run the Vitest suite once (`vitest run`); `npm run test:watch`
  for watch mode. Tests live beside the code they cover as `*.test.ts`
  (`lib/content/*.test.ts`, `lib/brand.test.ts`) — there is no separate
  `tests/` directory.

## The content pipeline

Content lives as Markdown files under `content/<type>/<slug>.md` — one
directory per content type, one file per entry. The **six content types**
(all singular, matching their directory name) are declared in
`lib/content/types.ts`'s `CONTENT_TYPES`: `project`, `story`, `knowledge`,
`film`, `campaign`, `briefing`. Only `story` has real content and a schema
today (`content/story/*.md`, `lib/content/schemas.ts`'s `storySchema`); the
other five directories exist only as `.gitkeep` placeholders for future work.

- **Slug** is derived from the filename, not from frontmatter
  (`delhi-air-victory.md` → slug `delhi-air-victory`).
- **Frontmatter is Zod-validated** (`lib/content/schemas.ts`) against a
  `z.strictObject` schema — unknown or misspelled keys are a build failure,
  not a silently-ignored typo. **Malformed content fails the build**, with a
  `ContentError` naming the file and the offending field
  (`lib/content/load.ts`).
- **Dates must be quoted in frontmatter** — `date: '2024-08-12'`, not
  `date: 2024-08-12`. An unquoted date is valid YAML but parses to a JS
  `Date` object, not a string, which then fails the schema's `YYYY-MM-DD`
  string check.
- **Relations** (`related.<type>: [slug, ...]` in frontmatter) are resolved
  by slug across types at build time (`lib/content/relations.ts`). A
  relation pointing at a slug that doesn't exist under that type's directory
  fails the build; the `related` object itself is a `z.strictObject`, so a
  typo'd or wrong-case key (e.g. `stories:` instead of `story:`) fails too,
  rather than silently resolving to nothing.
- **Adding a new content type** is one line in `lib/content/index.ts`'s
  `TYPES` map (type → schema) — that map is the single source everything
  else (`buildIndex`, the relation-validation universe, each type's loaded
  entries) derives from, so a type can't be wired into some of those and not
  others.
- The content module caches its parsed/validated result in memory. In
  production that's once per process; **in development the cache is
  bypassed on every request** (`process.env.NODE_ENV === 'development'`) so
  editing a Markdown file is visible on the next reload without restarting
  `next dev` — `content/**/*.md` isn't part of Next's module graph, so
  nothing else would invalidate it.
- Rendered story bodies go through `marked` (`lib/markdown.ts`) with **no
  HTML sanitisation** — deliberate, because content is Git-reviewed, not
  user-submitted. See that file's comment for the two conditions (a CMS/
  web-authoring layer, or bulk-importing the old WordPress bodies) under
  which a sanitiser becomes mandatory before merging further.

## Styling

**★ THIS SECTION GOVERNS THE `app/` LANE, WHICH IS NOT THE ONE THE PUBLIC SEES.**
Everything below — Tailwind, `@theme inline`, Fraunces, Instrument Sans, the
teal/coral palette — is real and correct for the routes `app/` still owns
(`/explore`, `/work/campaigns/<slug>`, `/keystatic`, the API routes,
`sitemap.ts`, `robots.ts`). It governs **none of the 148 pages a reader
actually loads.** Those are the generated files under `public/_pages/v3/`,
which carry their own CSS and their own type system — see **The served lane's
styling** at the end of this section. Reading these bullets as site-wide styling
guidance is the same mistake the Architecture section's ★ warns about, arriving
by a different door, and it has been made.

- **Tailwind CSS v4, CSS-first config — there is no `tailwind.config.ts` and
  none should be added.** All design tokens (colors, fonts, heading-size
  scale) are declared in `app/globals.css` via `@theme inline`, sourced from
  CSS custom properties on `:root`.
- **Anything styled by element/tag name (not a class) must live in
  `@layer base`.** Tailwind's cascade layers are `theme, base, components,
  utilities` in that declared order — a layer declared later always beats an
  earlier one regardless of selector specificity, so an *unlayered* bare
  rule like `h1 { font-size: … }` would beat every Tailwind utility
  (`text-xs` included) site-wide. This was a real, shipped bug on this
  branch (fixed at `ab7080e`) and the `@layer base` rules in `globals.css`
  carry a comment explaining it — don't remove element-name rules from that
  layer. The same hazard applies to **inline `style={}` props**, which beat
  every layer including utilities; prefer a real utility (a `@theme` token
  or an arbitrary-value class) over `style={}` for anything a class could
  express instead (see `components/content-card.tsx`'s `text-h3` for the
  pattern).
- **Brand palette** (`app/globals.css`): teal `#4BA1A5`, coral `#F05A66`,
  ochre `#D2C662`, indigo `#2B2D46` — exact values from the May 2025
  guidelines, never approximate. **Brand teal must never be used as text**
  (2.88:1 contrast on paper, fails WCAG AA at every text size); use
  `--teal-ink` / the `text-teal-ink` utility (5.58:1) for teal text instead,
  and keep brand teal itself for the logo and non-text fills only — `.text-teal`
  (as opposed to `.text-teal-ink`) must not appear anywhere in this codebase.
  Coral splits differently: brand coral passes the 3:1 large-text bar but
  fails 4.5:1 body text, so it's fine for display headings ≥24px but body
  text should use `--coral-ink` (`text-coral-ink`) instead.
- Fonts in this lane are **three**, not two, all loaded via `next/font/google`
  in `app/layout.tsx`: Fraunces (display), Instrument Sans (body) and **Archivo**
  (`--font-archivo`, which `globals.css` binds to `--font-caps`) — and **not**
  Geist Sans/Mono, the `create-next-app` default, since replaced. Archivo is
  here because the design language is Archivo at a narrowed `wdth`; that is the
  one font this lane shares with the served pages.

### The served lane's styling

The 148 pages a reader loads are generated by `scripts/build-*.mjs` and none of
the above applies to them. Measured on this commit, not asserted:

- **Type is Archivo + Newsreader — 148 of 148 files each.** Fraunces and
  Instrument Sans appear in **0**. Served `body` is
  `font:400 var(--t-body)/1.6 Newsreader,Georgia,'Times New Roman',serif`;
  display is variable Archivo (`font-stretch:62% 125%`). Never load a third
  family into a served page.
- **The type scale is tokens, not Tailwind utilities:** `--t-d1`, `--t-d2`,
  `--t-h2`, `--t-lead`, `--t-body`, `--t-cap`, `--t-micro`, `--t-num`,
  `--t-readout`. The classes that use them (`.d1`, `.d2`, `.h2`, `.lead`,
  `.lbl`, `.cap`) already exist — **grep the served CSS before inventing one.**
  There is no `.d3`; adding one adds a step to the type scale.
- **Colour is grounds and ink, not the brand palette.** `--ground` / `--ground-2`
  / `--paper` / `--paper-2` for band backgrounds, `--fg*` on dark and `--ink*` on
  paper, `--rule` / `--hair` for rules, `--mustard` for the one interactive hue.
  The teal/coral/ochre/indigo hexes above appear in **0 served files**. Hue
  carries meaning in this lane — see
  `docs/design/BRANDING-2026-08-21-frozen-language.md` §3.1 before using any.
- **Every photograph is black and white.** `class="duo"` (a luminance matrix
  plus a warm tone ramp) appears 225 times; selective colour is retired and
  `filter:url(#sig…)` appears **0** times, so the `signal` field on
  `heroImageSchema` is dead surface. Do not build on it.
- **Each page carries its own `<style>`**, composed from the generator's own
  `pageCss` plus `SHARED_PAGE_CSS` in `scripts/lib/situation-shell.mjs`. There is
  no shared stylesheet to edit, and scoping new CSS to one section is what stops
  it regressing the other 147.

## Logo assets

`public/brand/*.svg` are generated (and committed — they're not built at
deploy time) by `scripts/prepare-brand-assets.mjs`, which shells out to the
`pdftocairo` binary (part of Poppler) and reads source PDFs from a hardcoded
path under the repo owner's Desktop. That script only runs on that one
machine; if the source logo files move or the machine changes, update the
`SRC` constant there before rerunning it.

## Architecture

- **★ THIS SITE SERVES TWO LANES, AND THE ONE THE PUBLIC SEES IS NOT `app/`.**
  Read this before changing anything a reader looks at. **93 committed HTML
  files under `public/_pages/`** are generated by the 27 `scripts/build-*.mjs`
  programs from `data/`, and `design-routes.ts` rewrites them onto the
  canonical routes in `next.config.ts`'s **`beforeFiles`** — ahead of the
  filesystem, deliberately, and that file says why. So for every contested
  route the built HTML wins and the `app/` page of the same name is **shadowed
  dead code**. Editing `app/page.tsx` to change the homepage ships nothing.
  `designRoutePaths()` is the list of what is mapped; `/explore` and
  `/work/campaigns/<slug>` are the routes deliberately left on real app pages.
- **Next.js 16, App Router only** for the routes that are not shadowed.
  Routes/layouts live under `app/`. Read `node_modules/next/dist/docs/01-app/`
  (getting-started, guides, api-reference) before using any App Router API —
  this Next.js version has breaking changes vs. older conventions, per
  `AGENTS.md`.
- **Routes today:** 93 served pages, not three. The static lane covers `/`,
  `/about`, `/act`, `/farm`, `/impact`, `/now` and its six situations plus
  `/now/air/india`, 15 WORK pages, `/stories` and five essays, `/learn`,
  `/record`, `/journal`, `/schools`, `/search`, `/publications`, `/posters`,
  `/use-the-data`, `/healthy-cities`, and one page per published climate
  event. `app/` still owns `/explore`, `/work/campaigns/<slug>`, `/keystatic`,
  the API routes, `app/sitemap.ts` and `app/robots.ts`.
- **A nav word, a built file and a route are one change.** Any two without the
  third is a defect — it has happened five times (`Work`, `Impact`, `Farm`,
  `Act`, and the sitemap advertising unbuilt routes while omitting built
  ones), and each time a link worked perfectly and delivered the reader to
  nothing. `lib/route-invariant.test.ts` now checks this on every push and PR
  via `npm test` in `generated-current.yml`.
- **Redirects are populated, not empty.** `redirects.ts` exports
  `legacyRedirects` (built from the WordPress URL table) and `movedRedirects`.
  Every legacy URL costs two hops and that is a settled ruling, not a defect —
  see `lib/legacy-redirects.ts` and its test before "fixing" it.
- **Typed route props.** Pages/layouts type their props with the generated
  `PageProps<...>`/`LayoutProps<...>` helpers rather than hand-written props
  interfaces. These types are generated into `.next/types` — regenerate by
  running `dev`/`build` if they seem stale.
- **Path alias:** `@/*` maps to the repo root (`tsconfig.json`).
- **Linting:** `eslint.config.mjs` is a flat config composing
  `eslint-config-next`'s `core-web-vitals` and `typescript` rule sets — don't
  add a legacy `.eslintrc`.

## Active Situation pages (`/now/climate-event/<slug>`)

**Read `docs/ACTIVE-SITUATION-STANDARD.md` before building, editing or
reviewing one.** The band order, what each band may contain, the four evidence
words, the imagery licence rule and the black-and-white treatment are all
settled and generator-enforced — a new event needs its data, not a layout
instruction. These pages are generated by `scripts/build-climate-disaster-pages.mjs`
from `data/climate-events/**`; they are not Next.js routes and not part of the
Markdown content pipeline described above.

## Share cards (`og:image` / `twitter:image`)

**Every page's share image is that page's own lead photograph, never the
logo** — read `docs/SHARE-CARD-STANDARD.md` before touching any `og:*` or
`twitter:*` tag. It is derived from the rendered markup, not declared per
generator: `scripts/lib/social-image.mjs` runs at the four points where built
HTML is written to disk, and `lib/social.ts`'s `shareCard()` does the same job
for the App Router routes. Two rules are easy to break and both are gated:

- **Never hand-write an `openGraph` object in a route.** Next.js merges
  `metadata` shallowly per top-level key, so a page-level `openGraph` REPLACES
  the layout's and silently drops `og:site_name`/`og:locale`/`og:type` on that
  route. Always spread `shareCard(...)`.
- `npm run verify:seo` re-derives each built page's card and fails if the head
  disagrees; `npm run build:social-cards` is the fix (`--check` to preview).

## Further reading

- `docs/superpowers/specs/2026-08-16-swechha-website-design.md` and
  `2026-08-16-swechha-website-technical-design.md` — the approved design and
  technical specs (old-site audit, content model, migration constraints).
- `docs/superpowers/plans/2026-08-16-foundation-and-story-vertical.md` — the
  implementation plan for the foundation + story vertical build.
- `docs/superpowers/reports/2026-08-16-foundation-baseline.md` — the
  measured performance/Lighthouse baseline for this build.
- `docs/ACTIVE-SITUATION-STANDARD.md` — the content wireframe and standard for
  active-situation event pages, with the per-band data contract.
- `docs/SEARCH-CONSOLE-API.md` — what the Search Console API can and cannot do
  (there is no API for "Request Indexing", URL Inspection is read-only, and the
  Indexing API is restricted to `JobPosting`/`BroadcastEvent` — all three
  verified against Google's docs), the three sanctioned calls that are wired,
  and the six setup steps, four of which need a Google account.
- `docs/KNOWLEDGE-SECTIONS-STANDARD.md` — the standard for `/learn`, `/record`,
  `/journal` and `/schools`: where each lives, the one rule that separates a
  Learn figure (a REFERENCE into the live dataset) from a Journal figure (a
  SNAPSHOT with its observation stamp), the Journal's approval gate, and the two
  traps this build hit — `/record` colliding with the analytics tracker's own
  path, and `.cap` never having been corrected for a `paper-2` ground.
- `docs/SHARE-CARD-STANDARD.md` — how every page's `og:image`/`twitter:image`
  is derived from its own hero photograph, why AD-27.49's one-brand-card ruling
  was reversed, and the ten pages that legitimately still fall back.
- `docs/LASTMOD-MERGE-DRIVER.md` — why `data/seo/lastmod.json` has a custom
  key-wise merge driver, why neither `union` nor `ours` is a substitute, and the
  reason it matters: a conflicted PR has no `refs/pull/N/merge`, so
  `generated-current.yml` silently cannot run at all on exactly the PRs it
  exists to check. Read it before re-testing the driver — a two-route test is a
  false pass.
- `.superpowers/sdd/2026-08-16-foundation-and-story-vertical/` — the
  task-by-task briefs, reports, and per-commit review diffs from the build
  that produced the current codebase.
