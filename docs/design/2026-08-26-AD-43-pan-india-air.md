# AD-43 — "All 268 cities" led back to Delhi. `/now/air/india` is the page it promised

**Status: SHIPPED.** One new route (`/now/air/india`), two dead-end links
repointed on `/now/air`, one false claim removed, and one shared function so two pages cannot
disagree about a count they both read out of one file. 38 built pages.

## 0. Every number in this document is a reading, not a constant

"268" is in the title because that is what the broken link said on the morning
it was reported. Nothing on the page is typed: the count, the hour, the
above-the-limit total, the state roll-up and the ranking all come off
`data/air-india.json`, which refreshes hourly. This work rebased onto AD-44 —
which moved the feed from the data.gov.in mirror to CPCB's own CAAQMS endpoint —
and the same page rebuilt itself to **266 cities, 44 above the limit, observed
26-08-2026 12:00**, with every gate passing and no edit to the generator. That is
the design working. If a figure quoted below does not match the live page,
the live page is right.

## 1. What was reported

> "When I click on ALL 268 cities, it should show pan India AQI detail,
> currently it doesnt and takes to delhi only."

Correct, and it was not one link. **Two** links on `/now/air` carried a national
figure and both pointed back into the same page:

| Link | Read | Went to | What that band opens on |
|---|---|---|---|
| Under the "India, right now" panel | "All 268 cities →" | `#geography` | **The map** tab — Delhi's 44 monitors |
| Summary strip, cell 3 | "2nd / In India / of 268 cities" | `#geography` | the same |

The `#geography` band has three tabs and the third is called "India". It held
**two paragraphs and no figures**: the airshed sentence and the above-the-limit
count. So a reader who clicked the national number landed on a drawing of Delhi,
and if they found the India tab anyway there was nothing in it to look a city up
in.

Meanwhile `data/air-india.json` has held **all 268 cities** — name, state, worst
monitor, city mean, station count, governing pollutant, band, coordinates —
since the feed was first read. Eight of them were published. The other 260 were
on disk, in the repo, fetched hourly by `air-hourly.yml`, and reachable from
nowhere on the site.

## 2. What was built

**`/now/air/india` — "Every city CPCB measures"** (`scripts/build-air-india.mjs`
→ `public/_pages/v3/air-india.html`). Four bands:

1. **Masthead** — the snapshot hour, and four figures: cities reporting, stations
   behind them, how many above AQI 100, how many read "Good". Type only, no
   photograph: there is no photograph of 268 cities, and a Delhi haze hero at the
   top of the national page would repeat the exact confusion the page ends.
2. **The table**, in two tabs.
   - *Every city* — all 268 rows: rank, city, state, **worst monitor AQI**,
     **city mean**, band, governing pollutant when it is not particulate, station
     count. A find-a-city box, an above-the-limit filter and a worst-first / A–Z
     order.
   - *By state* — 31 rows: cities in the feed, how many above the limit, the
     worst city and its reading.
3. **How to read a rank** — the four things that decide whether a row means what
   it looks like it means, and three named holes.
4. **Onward** — back to `/now/air`, and to `/now`.

**On `/now/air`:** both national links now open `/now/air/india`, a third opens
it from the foot of the India tab, and that tab gained the state roll-up — where the 43 sit, 12 of 31
states — under the airshed paragraph it already had.

## 3. The two numbers, and why both are on every row

This is the load-bearing decision of the page. `aqi` in the dataset is a city's
**worst station**; `meanAqi` is the average across its stations, which is the
figure **CPCB itself publishes** for that city. Against CPCB's own published
numbers the worst-monitor ranking runs about **25 per cent higher**.

A city with forty monitors has forty chances to produce a high reading and a city
with one has one, so this ranking **penalises the well-measured city**. 206 of the
268 are a single station wearing a city's name.

So the caveat is not a footnote under the table — it *is* the table. Every row
carries the worst, the mean and the station count side by side, and a build gate
fails the page if any row loses its mean column. Delhi's row reads **171 · 96 ·
44 stations**, which is the whole argument in one line.

## 4. The false claim this found

`/now/air`'s India tab ended: *"Computed from 504 stations on CPCB's scale, **CO
excluded**."*

`scripts/fetch-india.mjs` line 79 says the opposite, in capitals: *"NOTHING IS
EXCLUDED. CO and Pb were dropped on the reading that the feed published
concentrations in an unstated unit. It publishes sub-indexes, so every pollutant
it reports is already on one scale and belongs in the max."* `EXCLUDED = []`. On
the current snapshot **40 of the 268 cities are governed by CO**.

The sentence was true before that change and was never updated. It now reads
"every pollutant it publishes included," which is what the fetcher does.

## 5. One roll-up, two pages

`stateRollup(cities, limit)` is in `scripts/lib/situation-shell.mjs`, not in
either generator, because **both** the new page's *By state* tab and `/now/air`'s
India tab render it. Two copies of that reduction is how the two pages come to
disagree about how many states are above the limit while reading one file — the
drift `NAT` was rewritten to end (AD-28).

Nothing is averaged. CPCB measures cities, not states; a state row carries counts
and its single worst city. The number of cities in the feed is beside the count
above the limit on every row, because **"3 of 3" and "3 of 40" are different
findings and must not read alike**.

## 6. Rulings

- **R-1.** A link that states a national figure may not resolve to a Delhi view.
  Both did. An in-page anchor is not a destination when the band it opens
  answers a different question.
- **R-2.** The national page ranks on the worst monitor and prints the city mean
  beside it on every row. Neither number may appear without the other, and the
  station count travels with them.
- **R-3.** No state averages, ever. Counts and a named worst city, or nothing.
- **R-4.** The page reads complete with JavaScript off. All 268 rows are in the
  served markup, in rank order; the script only filters and reorders, and a gate
  fails the build if any row is born hidden.
- **R-5.** `/now/air/india` is a **child of a situation, not a seventh
  situation.** It is not in `FAMILY`, carries no `rel="license"` or Dataset
  block, and is routed from `designRoutes()`'s own map rather than from
  `SITUATIONS` — that constant is cross-checked against `FAMILY` and would
  correctly fail the build.

## 7. Gates

`scripts/build-air-india.mjs` refuses to write on any of these:

- every city in the dataset reaches the page as a row, and every city is named;
- the masthead count equals the row count;
- the rows marked above the limit equal `totals.above_limit` — **counted inside
  the city tbody only**, because the by-state table reuses the same red cell and
  counting the document counted those twelve too;
- the snapshot hour is printed;
- no row is born hidden;
- every row carries a mean;
- each flagged row carries its stated reason, not just a mark;
- no dead or prototype href; it links back to `/now/air` and `/now`.

## 7a. The gate that caught the CSS leak, and the const it produced

The state-roll-up rules were first written into Air's `PAGE_CSS`, on the
reasoning that `.p-rank` and `.p-nr` already live there. That reasoning is
wrong, and `generated-current.yml` proved it in ninety seconds.

**`PAGE_CSS` is not this page's stylesheet.** `situation-shell.mjs` lifts it
whole, as raw text, and exports it as `SITUATION_CSS` — which every other
generator in the repo then ships. Twelve lines written for one tab of one page
landed in `about.html`, `farm.html`, `impact.html`, `act.html`, all six
situations, every WORK page and every essay, and moved roughly thirty lastmod
hashes with them. `npm run build:situations` locally could not show it, because
the pages that changed are built by ten other scripts.

The shell's own extraction note already says what to do, in those words: *"Move
it out of PAGE_CSS and into Air's own document assembly."* So the rules are now
`AIR_ONLY_CSS`, a separate const concatenated into Air's head beside `PAGE_CSS`.
Verified: `.p-nsr` appears in `situation-air.html` and nowhere else, and all five
sibling situation pages plus `/now` are byte-identical to `main` after a full
regeneration.

**The rule this leaves behind:** anything added to `PAGE_CSS` in
`build-situation-air.mjs` is **site-wide**; anything added to `AIR_ONLY_CSS` is
**this page only**. That distinction is invisible from inside either block, which
is why both now carry a comment saying which one they are — and why the check
that catches a mistake here is a CI job that rebuilds all thirty-odd pages, not a
local build of the seven you were thinking about.

## 8. Wiring

- `data/seo/pages.json` — `/now/air/india`, with the `indexName` the breadcrumb
  and the search index both read.
- `design-routes.ts` — in the main map, not `SITUATIONS` (R-5).
- `package.json` — `build:air-india`, folded into **`build:situations`**. That is
  deliberate and it is why no workflow file changed: all four CI workflows
  (`air-hourly`, `data-refresh`, `content-rebuild`, `generated-current`) already
  run `build:situations`, so the page rebuilds with the hourly feed by
  construction rather than by somebody remembering to add it to four lists.
- `scripts/verify-final.mjs` — registered in `NOT_FINAL` with its reason. The
  twelve checks there are situation-specific (the crumb's "N of 6 situations",
  the five-sibling rail, the four-word state vocabulary) and this is not one of
  the six.
- `npm run build:search` — the index is derived from the built pages' own
  `rel=canonical`, so the page joined it with no edit. 37 → 38 pages.

## 9. Found in passing, NOT fixed

**`build:posters` is in none of the four CI build lists.** `air-hourly.yml`,
`data-refresh.yml`, `content-rebuild.yml` and `generated-current.yml` all iterate
`work about impact farm act stories publications search essays` — `posters` is
absent from every one. So `posters.html` (AD-42) is never rebuilt or checked in
CI, and `generated-current.yml` cannot notice if the committed copy drifts from
what its generator emits.

It is left alone here deliberately: adding it turns a workflow red the moment the
committed file and the generator disagree, and finding out whether they do is its
own change, not a rider on this one.
