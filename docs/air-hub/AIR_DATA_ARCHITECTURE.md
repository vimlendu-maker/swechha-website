# /now/air — Data and evidence architecture

## Principle

Every figure on the page is read from a committed file at build time; nothing is fetched by the reader's browser
except the chip's liveness check. A figure is either a **reading** (fetched on a cadence, stamped with CPCB's
observation time) or **reference** data (committed by hand with a source per row, changed only when the source
changes). Nothing is typed into the generator that a data file could hold.

## Sources in use

| Dataset | File | Fetched by | Cadence | Evidence type | Provenance fields |
|---|---|---|---|---|---|
| Delhi station sub-indexes | `data/air-delhi.json` | `fetch-air.mjs` | hourly, 05–23 IST | Official data (CPCB sub-indexes, as published) | `source{name,served_by,url}`, `time{cpcb_observed_ist, swechha_checked_utc}`, `check`, `crosscheck`, `derivation` |
| National city snapshot | `data/air-india.json` | `fetch-india.mjs` | hourly | Official data, selected (worst monitor) + calculated (mean) | same, plus `method`, `caveats` |
| Hourly archive | `data/air-history/*.ndjson` | both fetchers | per observation | Official data | `obs`, `first_seen`, `revisions[]` |
| Cross-check verdict | `data/air-crosscheck-verdicts.json` | `verify-air-crosscheck.mjs` | ≤ 6-hourly | Calculated (our means vs CPCB bulletin) | `ran`, `tier1`, `tier2` |
| WAQI panel + forecast | `data/air-crosscheck.json` | `fetch-crosscheck.mjs` | with cross-check | Forecast (WAQI model, US EPA scale) | `forecast.model`, `fetched` |
| Farm fires | `data/fires-nw-india.json` | `fetch-fires.mjs` | **not scheduled** (last 22 Aug) | Observed by satellite (thermal anomalies) | `fetched`, `window` |
| Attention | `data/attention-delhi-air.json` | `fetch-attention.mjs` | **not scheduled** | Counted (Wikipedia pageviews) | `source`, `fetched` |
| News register | `data/coverage-delhi-air.json` | `fetch-coverage.mjs` | **not scheduled** | Reported | `register.items[].publisher/published/link` |
| Apportionment | `data/apportionment-delhi.json` | by hand | per study | Modelled / study finding | per study: title, report no, commissioned by, table, page, caveats |
| **Standards** | `data/air-standards.json` — new | by hand | on re-notification | Official data (NAAQS) + guideline (WHO) | instrument, URL, retrieved, compliance note, `who.verified` gate |
| **GRAP schedule** | `data/grap.json` | by hand | on CAQM revision | Official data (policy) | per stage `source` → PIB release |
| **NCR districts** | `data/ncr.json` — new | by hand | on NCRPB change | Official data (geography) + Swechha mapping | NCRPB URL, retrieved |

## Evidence vocabulary on the page

The page keeps its two-mark rule (solid = measured/counted, dotted = modelled) because it is part of the frozen design
language, and names the other kinds in words where they occur rather than inventing eight badges:

| Brief's label | How the page says it |
|---|---|
| OBSERVED / OFFICIAL DATA | "Measured", "CPCB's own sub-indexes, never recomputed" |
| MODELLED | dotted rule + "Modelled, not measured" |
| FORECAST | "A forecast, not an observation." + source and scale |
| ESTIMATED / STUDY FINDING | the study, its year and "Modelled" on the figure |
| CALCULATED BY SWECHHA | "Calculated" in the method table; tilde on implied concentrations |
| INFERRED | "Set that channel aside…" — the doubt line states the inference and its basis |
| REPORTED | "Most recent order, as reported"; "A headline is evidence that something was said, not that it is true." |
| EDITORIAL | the band leads and the "What this is not" notes, which never carry a figure of their own |

## Freshness states

The site has four state words (AD-05 R4), so the brief's four freshness states map onto them plus a stated age:

| Brief | Condition | What the reader sees |
|---|---|---|
| LIVE | observation ≤ 3 h old at build, and at read time | green **Live** chip |
| RECENT | — | merged into Live: CPCB publishes hourly and the mirror lags up to 10 h, so a separate band would flicker |
| STALE | observation > 3 h old at read time | chip demoted to **Periodic** on load, and "This reading is N hours old. No newer one has reached us from CPCB since." |
| UNAVAILABLE | no source answers | the fetch writes nothing (exit 75); the page keeps its last reading, which then goes STALE as above. A national snapshot > 48 h old fails the build. |

The 3-hour bound is `STALE_HOURS` in `fetch-air.mjs` and `lib/air.ts`; the page reads it from `data-stale-hours`, and
`lib/air-hub.test.ts` fails if the two ever differ.

## Failure handling

- **No silent substitution.** One source per run, named in `served_by`; the page's method table names CPCB.
- **Stale is never shown as current** — see above.
- **A suspect channel is flagged, not deleted, not ranked.** Rule in `scripts/lib/air-rules.mjs`
  (`gasUncorroborated`, `rankableFigure`), self-tested on import, used by the national fold and the hero.
- **Missing is not zero**: standards cells say "none set", NCR districts with no monitor are named, absent pollutants
  are listed.

## Time

All Indian readings are IST wall-clock text from CPCB, never converted; Swechha's own clocks are UTC ISO. The page's
observation instant for the age check is computed as IST − 5 h 30 m by field, never by `Date.parse` on a local string.

## Machine-readable layer

Already exists and is kept: `/api/air` (live reading JSON, `s-maxage=300`), `public/data/air/*.csv|json` (archive),
`public/data/index.json` (catalogue). The Dataset block on `/now/air` now names the daily and current-month CSVs as
`distribution`, dropped automatically if a file is not on disk.

**Not built, deliberately:** `/api/air/{ncr,india,forecast,grap,sources}`. The data behind them is either already in
the CSVs, not a reading (GRAP, sources — committed JSON is the API), or does not exist (an official forecast feed).
An endpoint with nothing live behind it is a promise the pipeline cannot keep.

## Next data work, in order

1. Restore the Delhi feed (owner — `AIR_PAGE_AUDIT.md` §6).
2. Schedule `fetch-fires`, the Delhi attention and coverage fetchers, or retire those tabs.
3. **IITM Early Warning System** as the official forecast, once a stable, documented endpoint is confirmed; until then
   it is linked, never scraped.
4. **Meteorology** (wind, boundary-layer height) from a keyless model API, labelled Modelled, for a "why today" panel.
   Not built now: without it the page cannot honestly explain a particular day, and it says so.
5. A CAQM order watcher (`data/document-watch.json` already watches documents) so GRAP status could one day be read,
   not asserted.
