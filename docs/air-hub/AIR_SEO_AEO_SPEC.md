# /now/air — SEO and AEO spec

## What the data says

Search Console (`data/seo/search-performance.json`, four snapshots 8–21 Sep 2026): `/now/air` ~220 impressions,
position ~8.7; `/now/air/india` ~290 impressions, position ~13.4. The only air query with measured impressions is
**"cpcb aqi"** (119 impressions, position ~6.2). There is no measured volume yet for "Delhi AQI" at this domain —
the site's own SEO baseline notes it ranks on brand and legacy URLs, and that non-brand reach is a backlinks problem,
not a copy problem. So this round does not chase keywords; it makes the page answer the questions precisely and makes
the answers extractable.

## Head

| Field | Was | Now |
|---|---|---|
| title | Delhi air quality and AQI today, from CPCB — Swechha | **Delhi AQI today and air quality across NCR, from CPCB — Swechha** |
| description | …read hourly against CPCB's own limit, with the worst monitor named… | **Delhi's AQI read hourly from CPCB, worst monitor named and the mean beside it; NCR towns, India's air standards against WHO's, and the GRAP schedule.** (149 chars; register requires 140–158) |
| canonical | `https://swechha.in/now/air` | unchanged |
| og/twitter | derived from the hero photograph | unchanged (derived) |

The title promises only what the page has: CPCB readings, NCR towns. It does not say "forecast" or "live GRAP status",
because the page has neither as a reading.

## Structured data

| Block | Status |
|---|---|
| BreadcrumbList | unchanged |
| Dataset | **enriched** — `measurementTechnique`, `variableMeasured`, `spatialCoverage`, and `distribution` for the daily CSV and the current month's hourly CSV (dropped if the file is absent) |
| FAQPage | **new** — built from the Questions band's own strings; a test asserts every question is a visible h3, word for word |
| Article / DefinedTerm | not added: the hub is not an article, and the glossary lives in `/learn` |

## AEO test set

Each question checked against the built page for: direct answer, date, context, source, uncertainty.

| # | Question | Where answered | Date | Source | Caveat |
|---|---|---|---|---|---|
| 1 | What is Delhi's AQI today? | Q1 + hero | observation time | CPCB | worst monitor vs mean; hours-old reading ≠ now |
| 2 | What is Delhi's PM2.5 today? | PM2.5 card | the hour above | CPCB sub-index | implied, tilde; highest monitor named |
| 3 | Why is Delhi polluted today? | Q6 + sources band | study years | TERI-ARAI, IITK | seasonal averages cannot describe a day; **no live source split published here** |
| 4 | What causes Delhi air pollution? | Q6 + sources | 2016, 2018 | named studies | the studies disagree |
| 5 | How much does stubble burning contribute? | sources "The split" + "Farm fires now" | 2016–17 monitoring | TERI-ARAI | 4% is a floor; detections are not confirmed crop fires |
| 6 | What is GRAP? | GRAP tab + Q5 | revised 21 Nov 2025 | CAQM via PIB | schedule, not status |
| 7 | Is GRAP active? | Q5 | — | — | **the page cannot say**; it says who can |
| 8 | Health effects of PM2.5? | people band + PM2.5 card | study years | Lancet Planet Health, Lung India, AQLI | three of four are models |
| 9 | Is Delhi's air improving? | Q8 | record start | — | **the page cannot say yet**; says what a trend needs |
| 10 | Delhi vs Mumbai? | Q7 + `/now/air/india` | snapshot time | CPCB | worst monitor favours well-monitored cities |
| 11 | India's air-quality standards? | standards tab + Q4 | 2009 | Gazette | law, with the 98% rule |
| 12 | WHO PM2.5 guideline? | standards tab + Q4 | 2021 | WHO | not law in India |

Three questions (3, 7, 9) are answered honestly as "not from here". That is the design: an answer engine quoting
"Swechha says the source split for today is X" would be quoting something Swechha never measured.

## Quotability

The hero's **Copy this reading** produces: *"Delhi's worst-reading CPCB monitor, North Campus, read AQI 154 (Moderately
Polluted; governing pollutant NO2, 24-hour average) at 19:00 IST, 25 September 2026. The mean of all 44 Delhi monitors
was 75. The governing channel is not corroborated by the same station's particulates (58). An AQI is an index, not a
concentration, and one monitor's reading is not a personal exposure. Source: Central Pollution Control Board, compiled
by Swechha, https://swechha.in/now/air"* — built at build time from the same fields the hero prints.

## Not done, and why

- No keyword-stuffed headings; the h2s keep the house voice.
- No `/now/air/*` landing pages per keyword (see `AIR_PAGE_IA_V2.md`).
- No invisible FAQ, no fake `dateModified`.
- `/now/air/india` still has thin internal linking; fix belongs in the shared footer (separate PR).
