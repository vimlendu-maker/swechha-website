# /now/air — Phase 0 audit

Audited 26 September 2026 against `origin/main` at `153a7934`, in an isolated worktree. Method: the generator and
every data file it reads were read in full; the built page's visible text was extracted and every factual claim
inventoried (see `AIR_CONTENT_AUDIT.md`); the pipeline was traced from fetch to publish; the head, JSON-LD, links and
sitemap were read off the built file; and the page was rendered headless at 1280 px and at a true 375 px.

## 1. What exists

`/now/air` is not a Next.js page. It is `public/_pages/v3/situation-air.html`, a static file written by
`scripts/build-situation-air.mjs` (≈2,500 lines) from committed JSON, and rewritten onto the route by
`design-routes.ts` ahead of the filesystem. The `app/` lane serves only the API routes.

| Layer | Where | What it does |
|---|---|---|
| Delhi fetch | `scripts/fetch-air.mjs` | CPCB CAAQMS XML feed first (keyless, gated: ≥300 stations nationally, ≥35 Delhi, per-station check against CPCB's own AQI), data.gov.in mirror second. Transport ladder fetch → curl → `/api/relay`. One source per run, named in `served_by`. Writes `data/air-delhi.json`. |
| National fetch | `scripts/fetch-india.mjs` | Same sources; ~260 cities, ~500 stations. Writes `data/air-india.json`. |
| Shared rules | `scripts/lib/air-rules.mjs`, `lib/air.ts` | Stuck-channel test (2% relative), off-scale test, and — new — the station-level suspect-gas rule. |
| History | `scripts/lib/air-history.mjs`, `data/air-history/*.ndjson` | Every observation, deduplicated, with CPCB's later revisions kept as an audit trail. Delhi from 25 Aug 2026. |
| Exports | `scripts/build-data-exports.mjs` → `public/data/air/` | Monthly hourly CSV, per-station CSV, revisions JSON, daily CSV. CC BY 4.0. |
| Cross-check | `scripts/verify-air-crosscheck.mjs` | Our city means against CPCB's own daily bulletin, ~245 cities, tripping outside 0.85–1.15 (last: 1.003, 241 matched). |
| Live route | `app/api/air`, `app/api/ward` | Server-side read of CPCB for the page's chip and the monitor picker; never repaints a reading. |
| Cadence | `.github/workflows/air-hourly.yml` driven by cron-job.org → `/api/cron/air` | Hourly, 05:04–23:04 IST; publishes a new observation at once, otherwise at most every 30 min (Vercel Hobby's 100-deploys/day cap). |
| Page | `scripts/build-situation-air.mjs` | Eight bands: reading + national panel, strip, people, how the number is made, sources, trend, geography, money, act. |

Related pages already built and good: `/now/air/india` (every city), `/record/air` and its month pages (the hourly
archive), and eleven `/learn` explainers — `cpcb-aqi`, `delhi-aqi`, `pm25`, `pm10`, `grap`, `source-apportionment`,
`stubble-burning`, `delhi-air-pollution`, `measured-vs-modelled`, `air-quality-apps-disagree`, `reporting-floor`.

## 2. What is excellent — keep it

The page already does most of what the v2 brief asks for, and does it more rigorously than the brief assumes:

- **Measured vs modelled is a design element**, not a footnote: solid rule = counted, dotted = modelled, a legend,
  and a "Three of those four figures are models" paragraph.
- **Two clocks, never mixed**: CPCB's observation time (IST wall-clock text, never converted) and Swechha's check
  time (UTC). Timestamps are parsed by field, not `Date.parse`, so the page is right on a UTC runner and an IST laptop.
- **An error is not a zero**: an empty feed is fatal; a failed run leaves the previous file; absent cells are drawn
  as absence; "unmeasured, not clean".
- **The worst monitor is named, and the mean sits beside it** (owner's ruling AD-42C). Every city row carries its
  monitor count, because a city with one monitor is "measured less, not better".
- **Source apportionment is shown as disagreement**: two government studies side by side, no blended average, no pie,
  each with the study's own caveats ("a floor, not an estimate"; "they cannot describe a bad day").
- **FIRMS is handled correctly**: "A detection is a thermal anomaly, not a confirmed crop fire"; VIIRS satellites
  "must not be added".
- **Regression and sanity gates** refuse a feed that moves backwards, a stuck channel, an off-scale sub-index.
- **Performance**: no map library, no CDN, no third-party request at load; the station map is inline SVG.

## 3. What was wrong — found in this audit

Ranked by harm. "Fixed" means fixed on this branch; see `AIR_CHANGELOG.md`.

| # | Defect | Evidence | Status |
|---|---|---|---|
| 1 | **A green "Live" chip over a day-old reading.** The chip is a build artefact; when every source failed, nothing rebuilt and nothing demoted it. The client could only upgrade. | 26 Sep: last observation 19:00 IST 25 Sep; page still Live. Breaks the site's own ruling AD-42 B-4. | Fixed — the page checks its own age on load |
| 2 | **The live pipeline has been dark for ~25 hours.** Every hourly run "succeeds" having fetched nothing: CAAQMS times out from GitHub runners (known), the relay answers 502, and the data.gov.in mirror now answers 502 too. | `gh run view` of 26 Sep 14:16 UTC. CAAQMS answers in 0.07 s from the owner's Mac. | **Not fixed — owner action, see §6** |
| 3 | **"Above 100 is above the law." / "CPCB safe limit 100. Limit broken."** CPCB never calls 100 safe; NAAQS 2009 lets 24-h values exceed on 2% of days a year (never two running). | Gazette of India No. 217, 18 Nov 2009, read in full. | Fixed |
| 4 | **The hero and the national panel gave Delhi two numbers for one station and hour** — 154 (an NO₂ channel) in the hero, 58 in the panel, "ranked 143". | AD-42E's suspect rule was applied to the table, never to the hero. | Fixed — hero discloses the doubt and names the worst corroborated monitor |
| 5 | **The national fallback ranked a suspect city on that one station's particulate, not the city's.** Delhi fell to 58 (143rd) while Wazirpur read 134; the "worst monitor" sat below the mean. | Replayed on live CPCB, 26 Sep 20:00 IST: Delhi now 117 (Wazirpur), 17th. | Fixed, with a regression test |
| 6 | **The PM2.5 card printed NO₂'s concentration** ("134 µg/m³ at North Campus") against the PM2.5 standard; North Campus has no PM2.5 sensor. | `gov.impliedConc` is the governing pollutant's. | Fixed — each card quotes the highest monitor for that pollutant |
| 7 | **"The feed returns concentrations and no index, so the number is computed here"** — the reverse of the truth, left over from before AD-42. "Station concentrations: Measured" in the same table. | `fetch-air.mjs`, `lib/air.ts` headers. | Fixed |
| 8 | **The "airshed" was four whole states**: Agra, Vrindavan and Sawai Madhopur were "its own airshed". | `fetch-india.mjs` `NCR_STATES`. | Fixed — NCR Planning Board's district list |
| 9 | **An index multiplier on /now**: "1.5× the limit". The site's own ruling D-15.3 forbids it. | `build-intelligence.mjs`. | Fixed |
| 10 | "then averaged across Delhi's monitors" in the AQI explainer, under a worst-monitor headline. | Band `measured`. | Fixed |
| 11 | Stale "true once" copy: "One square" over 32 days; "eight years old" (now 9.6); "a fivefold spread" (3.9×, and an index ratio); "industry stays put" beside 30→22. | Claims inventory. | Fixed — each now read off the data |
| 12 | Unsupported: "the readings stay above the limit all twelve months"; "over the limit most of the year"; "all three numbers are the government's own" (one is Dalberg's). | Claims inventory. | Fixed — cut, per the subtract rule |
| 13 | WAQI's forecast captioned "PM2.5 daily mean" with no unit — it is on the US EPA index scale. | `air-crosscheck.json` `forecast.model`. | Fixed |
| 14 | `fires-nw-india.json`, `attention-delhi-air.json`, `coverage-delhi-air.json` last fetched 22 Aug, labelled "Daily". | git dates; no workflow runs their fetchers. | Label fixed; refresh wiring open |
| 15 | The page named no NCR town, although the national feed has held all of them since AD-43. | `air-india.json`. | Fixed — Delhi-NCR tab |
| 16 | Nothing on the page stated India's standards beside WHO's, or GRAP, although `data/grap.json` exists. | — | Fixed — "The rules that apply" band |

## 4. What is reusable — and was reused

`data/grap.json` (schedule with PIB sources), the learn explainers (linked, not duplicated), `recordDatasetJsonLd`
(distribution checked on disk), `faqJsonLd` (visible-only rule), `stateRollup`, the tab component, `.p-tbl`,
`.p-hole`, the `p-kd` evidence rule, `air-history` for the record, and the regression/sanity gates. No new route,
no new dependency, no new workflow, no client-side rendering of readings.

## 5. What must not change

The owner's worst-monitor rule (AD-42C) and "never publish the rank without the mean beside it"; AD-27.6-A (nothing
repaints a reading); the four state words (AD-05 R4 — so "stale" is shown as Periodic plus a stated age, not a fifth
chip); the copy standard's two regimes (the `/now` pages keep every citation); subtract before rewriting; "the
schedule, not the status" for GRAP.

## 6. Owner actions outside this branch

1. **Restore the air feed.** From this Mac CAAQMS answers; from GitHub and Vercel it does not, and the mirror is
   returning 502. Options in order of effort: run `npm run data:air` here and push (a one-off), check whether the
   `DATA_GOV_IN_KEY` has been rate-limited or revoked (the mirror's 502 began with no code change), or give the relay a
   non-bom1 region. `docs/AIR-HEARTBEAT-RUNBOOK.md` is the runbook.
2. The homepage and `/now` carry the same build-time chip as `/now/air` and need the same client-side age check.
3. Wire `fetch-fires`, the Delhi attention fetch and the Delhi coverage fetch into a workflow, or retire those tabs.
