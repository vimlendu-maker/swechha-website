# Learn, Record, Journal and Schools — the standard

**Date:** 2026-09-08 · **Status:** built and routed · **Lane:** 2 (built pages)

Read this before adding a page to any of the four sections. The rules below are
generator-enforced; a page that breaks one does not get written.

## Where they live

| Section | Routes | Generator | Data |
|---|---|---|---|
| Learn | `/learn`, `/learn/<slug>` | `scripts/build-learn.mjs` | `data/learn/index.json`, `data/learn/articles/*.json` |
| Record | `/record`, `/record/air`, `/record/air/<YYYY>/<MM>`, `/use-the-data` | `scripts/build-record.mjs` | `data/air-history/*.ndjson` |
| Journal | `/journal`, `/journal/<slug>` | `scripts/build-journal.mjs` | `data/journal/articles/*.json` |
| Schools | `/schools` | `scripts/build-schools.mjs` | `data/schools.json` + `data/work/**` |

Article, month and Journal routes are **derived from the built files** in
`design-routes.ts`, so a new one needs no edit there.

**`data/work/onward.json` has a generated shadow: `data/work-links.json`.** It
is written by `build:work`, which reads onward.json and records every route the
WORK pages are allowed to link to. Editing onward.json and *not* re-running
`build:work` leaves the manifest five entries stale — the local build stays
green, every gate passes, and CI's `generated-current` fails on the diff. It
caught exactly that on PR #88. **After touching onward.json, run the whole CI
loop, not just your own generator**, and run it twice: the second pass must
change nothing.

## The one rule that separates Learn from Journal

**A Learn figure is a REFERENCE. A Journal figure is a SNAPSHOT.** They are
opposites and both are gated.

- An explainer must never go stale, so it addresses the live dataset by path —
  `{"file":"air-delhi.json","path":["limits","PM2.5","h24"]}` — and the build
  resolves it. A reference that will not resolve stops the build; a resolved
  value that does not reach the rendered page stops it too; and a reference into
  a **live hourly field** is refused outright, because an evergreen page states
  the standard and not the hour. The volatile paths are listed per file in
  `VOLATILE` in the generator.
- A dated article must never move, so every figure is typed with the
  observation stamp it was true at, the source that published it, and a
  `counted` / `measured` / `modelled` basis. A `ref` in a Journal figure is
  refused: a number that updates under a published date falsifies the record.

**A dotted path cannot address a key containing a dot.** `limits.PM2.5.h24`
splits into four segments and finds nothing. Pass an array.

## Learn — the other required parts

Every article needs a direct answer, an explanation, a standard band, a
`cannot` list, a lead photograph (the share card is derived from it), at least
one primary source with an absolute URL and a named publisher, and **two
related articles** — and something must relate back to it, so nothing is an
orphan inside the section. Every category must hold at least one article.

Learn is in the **situations copy regime**, not the everywhere-else one
(`docs/design/2026-08-23-COPY-STANDARD.md`): sources, authorities and
methodology notes stay, because they are the subject.

## Journal — the approval gate

`publish_state: "published"` **and** a named `approved_by` or there is no page,
no route and no URL. This is the rule `data/climate-events/` already runs on.
`known` and `uncertain` are both required and both rendered; an article with an
empty `uncertain` does not build. Five types, declared per article and shown as
a chip: reporting, analysis, news, education, record.

`scripts/propose-journal.mjs` is the trend-to-draft half. Six first-party
triggers, no API key, `--dry-run` to look without writing. It writes a dossier
of numbers, links and sources and **no prose**, never creates an article, and
never overwrites a dossier a reviewer may have annotated.

## Record — one page per month, never one per reading

The material is the hourly store, which keeps each observation as first seen
plus every later re-read. A day with no reading says so; it is never a zero.
Month pages are a real `<table>` with a caption and scoped headers, because a
record a researcher cannot parse is not one. They are **exempt from the SEO
register** (like the disaster pages) because the set grows on its own — they
pass their own title and description to `assemble()`, which applies the same
140–158 gate, and `fitDesc()` picks a closing clause that fits whatever the
month's name costs.

Because the record reads hourly data it is in the **air-hourly and data-refresh
build loops**, not only `generated-current.yml`.

## Schools — not a seventh programme page

The six programmes have finished pages under `/work/**`. Every row on
`/schools` reads that item's own JSON and links to it; nothing is restated. No
cumulative total (overlapping cohorts over unaligned periods — the naive sum is
computed and asserted absent), no price, no school named that `data/work/**`
does not name, and no quote block until an attributable testimonial exists.

## Two traps this build hit, both worth copying the fix for

- **`/record` was already the analytics tracker's public path.**
  `analyticsRewrites()` is spread into `beforeFiles` ahead of `designRoutes()`,
  so the page answered 200 with a JavaScript file and was unreachable at its own
  URL — not a 404, and nothing in the build noticed. The tracker moved to
  `/ledger`; `lib/analytics.test.ts` now derives the collision check from the
  route map so it cannot recur.
- **`.cap` was corrected for `.paper` and never for `.paper-2`.** It defaults to
  `--fg-3`, the dim ink for a dark ground, so every muted caption on a paper-2
  band shipped at about 2.5:1. Fixed at `design/home.html:127`, in place, no
  line added — the CSS ranges above line 3033 are extracted by absolute line
  number.

## Verifying a change here

```
npm run build:learn && npm run build:schools && npm run build:record && npm run build:journal
npm run build:search && npm run build:social-cards && npm run verify:seo
npm run verify:final -- --no-build && npm test
```

Contrast is **not** gated by the build. It was measured in a browser over every
text node at 375×635 and is clean today; a new component needs the same check
by hand until that sweep is automated.
