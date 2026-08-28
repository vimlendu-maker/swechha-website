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
- Fonts are Fraunces (display, `--font-display`) and Instrument Sans (body,
  `--font-body`), loaded via `next/font/google` in `app/layout.tsx` — **not**
  Geist Sans/Mono (the `create-next-app` default, since replaced).

## Logo assets

`public/brand/*.svg` are generated (and committed — they're not built at
deploy time) by `scripts/prepare-brand-assets.mjs`, which shells out to the
`pdftocairo` binary (part of Poppler) and reads source PDFs from a hardcoded
path under the repo owner's Desktop. That script only runs on that one
machine; if the source logo files move or the machine changes, update the
`SRC` constant there before rerunning it.

## Architecture

- **Next.js 16, App Router only.** Routes/layouts live under `app/`. Read
  `node_modules/next/dist/docs/01-app/` (getting-started, guides,
  api-reference) before using any App Router API — this Next.js version has
  breaking changes vs. older conventions, per `AGENTS.md`.
- **Routes today:** `/` (homepage), `/stories` (archive), `/stories/[slug]`
  (detail), plus `app/sitemap.ts` and `app/robots.ts`. `redirects.ts` /
  `next.config.ts` carry 301s from old WordPress URLs, populated during
  content migration — empty for now.
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
- `docs/SHARE-CARD-STANDARD.md` — how every page's `og:image`/`twitter:image`
  is derived from its own hero photograph, why AD-27.49's one-brand-card ruling
  was reversed, and the ten pages that legitimately still fall back.
- `.superpowers/sdd/2026-08-16-foundation-and-story-vertical/` — the
  task-by-task briefs, reports, and per-commit review diffs from the build
  that produced the current codebase.
