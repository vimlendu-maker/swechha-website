# /now/air — Data and methodology change log

Newest first. Each entry states what changed, why, and what a reader would see differently.

## 2026-09-26 — Air hub v2, first increment

**Freshness**
- The page now checks its own age on load. Past three hours (the fetch job's own `STALE_HOURS`) the Live chip is
  demoted to Periodic and the age is stated: "This reading is N hours old." Before this, a build-time Live chip
  survived any pipeline outage. Enforces the existing ruling that LIVE drops to PERIODIC after three hours.

**Method**
- National ranking: the suspect-gas rule is applied per station, and a city is ranked on its worst figure that its
  own station corroborates. Previously a suspect worst station handed the city to *that station's* particulate
  (Delhi 58, 143rd, while Wazirpur read 134). Rule moved to `scripts/lib/air-rules.mjs`, self-tested on import.
- The hero keeps the worst monitor's figure and now says when its governing channel is uncorroborated, naming the
  worst monitor with the channel set aside.
- NCR neighbour count reads the NCR Planning Board's district list instead of four whole states.

**Wording (no figure changed unless stated)**
- "CPCB safe limit 100. Limit broken." → the governing pollutant's own standard, window and unit, "Over it."
- "Above 100 is above the law." → over the standard at that monitor; breach judged across days (NAAQS 98% rule).
- Method table: concentrations are Calculated; AQI 100 attributed to NAQI 2014; the false "feed returns
  concentrations" note replaced.
- Health figures corrected to their sources: Lancet 16.6 M / 3.8 M deaths over 2009–2019; Lung India ages and
  comparison; AQLI to the NCT of Delhi.
- Forecast: scale named (US EPA); official forecaster now the IITM/IMD Early Warning System.
- `/now` card: "1.5× the limit" → "over AQI 100".
- `/now/air/india`: four overstated sentences corrected.

**New reference data**
- `data/air-standards.json` — NAAQS 2009 beside WHO 2021 (Tables 0.1 and 0.2), per window.
- `data/ncr.json` — NCR districts and the CPCB city names in each.
- `data/air-annual-delhi.json` — CAQM's annual PM10/PM2.5, 2018–2025.

**New on the page**
- Band "The rules that apply" (standards; GRAP schedule with a comparison, not a status).
- Tab "Delhi-NCR"; tab "Year by year"; band "Questions, answered" with FAQPage markup from the same strings.
- "Copy this reading, with its source."
- Dataset markup gains technique, variables and CSV distributions.

**Gates**
- `lib/air-hub.test.ts` (21 checks); `verify-final` band count 9 → 11; a replay case for the cross-station fallback.
