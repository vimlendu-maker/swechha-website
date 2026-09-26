# /now/air — Content and scientific audit

Every factual claim on `/now/air` and `/now/air/india` was inventoried from the built page's visible text, 26 Sep
2026 (the reading of 19:00 IST, 25 Sep). Load-bearing figures were checked against the primary source **by fetching
it**, not from memory or a secondary report. A research agent did a first pass; each figure below that changed the
page was then re-read independently from the source, per this repo's rule on agent research.

Key: **K** keep · **C** change · **R** remove. Evidence types follow `AIR_DATA_ARCHITECTURE.md`.

## Standards and the index

| Claim (was) | Source | Type | Verified | Action | Why |
|---|---|---|---|---|---|
| "CPCB safe limit 100. Limit broken." | CPCB NAQI 2014 | Standard + editorial | — | **C** → "AQI 100 is NO₂'s 24-hour standard, 80 µg/m³. Over it." | CPCB never says "safe"; "broken" is a compliance finding one hour cannot make |
| "AQI 100 … exactly the 24-hour standards India set for itself" | NAQI breakpoints vs NAAQS | Official | Gazette No. 217, 18 Nov 2009; CPCB About_AQI | **K** | Arithmetic is right for all eight pollutants (8-h for O₃, CO) |
| "Above 100 is above the law." | — | Editorial | NAAQS note: "complied with 98% of the time in a year … not on two consecutive days" | **C** → over the standard at that monitor; breach is judged across days | Legal gloss the numbers do not carry |
| "then averaged across Delhi's monitors" | — | — | contradicts `city_reading.scope` | **C** | Headline is the worst monitor |
| "The feed returns concentrations and no index … computed here" | — | — | `fetch-air.mjs`, `lib/air.ts`: feed is sub-indexes | **C** → "CPCB's own sub-indexes, never recomputed" | Reverse of the truth |
| "Station concentrations — Measured" | — | Calculated | concBasis `implied-from-subindex` | **C** → Calculated | — |
| "Published limit, 100 — CPCB, NAAQS 2009" | NAQI 2014 | — | — | **C** → "CPCB NAQI 2014, set at each pollutant's NAAQS 2009 short-term standard" | Misattributed |
| PM2.5 card "134 µg/m³ at North Campus" | — | Calculated | North Campus reports no PM2.5 | **C** → highest PM2.5 monitor, named | It was NO₂ |
| "…today" in three cards | — | — | AD-05 R1 | **C** → "in the hour above" | Static page cannot know the day |

## The reading

| Claim | Verified | Action |
|---|---|---|
| Hero 154, NO₂, North Campus — no caveat | national table flags the same channel suspect | **C** — doubt line added; number kept (owner rule AD-42C, B-3) |
| "Averaged across all 44, Delhi reads 75, which is the figure CPCB itself publishes" | our mean is unweighted; cross-check ratio 1.003 | **C** → "an average across stations is how CPCB makes the city figure it publishes" |
| "Delhi's row beside them" (not rendered) | — | **C** — row now rendered |
| National Delhi row 58, 143rd | worst monitor below its own mean | **C** — fetch-india fix; next fetch reads ~117 |
| "4 of the next 12 are its neighbours … It is an airshed." (Agra, Vrindavan, Sawai Madhopur) | NCRPB district list | **C** → NCR count from `data/ncr.json`; "Air does not stop at the city limit" |
| "Computed from 500 stations … every pollutant included" | stuck and suspect channels set aside | **C** |
| "a fivefold spread" | 154/39 = 3.9, and an index ratio | **C** → "39 to 154" |

## Health

| Claim (was) | Primary source (fetched) | Action |
|---|---|---|
| "1.5 million deaths a year … against the WHO guideline" | Jaganathan et al., *Lancet Planet Health* 8(12):e987, Dec 2024 (doi 10.1016/S2542-5196(24)00248-1): 16.6 M deaths 2009–2019, 24.9% | **C** → 16.6 M over 2009–2019, "about 1.5 million a year" as a derivation |
| "5.0% of all mortality … Same study, same deaths." | same: 3.8 M deaths 2009–2019, 5.0% | **C** → 3.8 M, "same study, same years" |
| "the same harm counts twice over" | — | **C** → "the same air counts as 3.8 million deaths against one and 16.6 million against the other" |
| "29.4% of Delhi adolescents aged 13–17 … asthma or airflow obstruction" | Salvi et al., *Lung India* 38(5):408, 2021 (PMC8509169): 29.4% on spirometry; ages 13–14 and 16–17; 3,157 students | **C** |
| "strongest association was obesity … 39.8% overweight against 16.4%" | full text: "overweight and obesity … 39.8% and 16.4%", Delhi vs Kottayam–Mysore | **C** |
| "8.2 years … lost in Delhi-NCR" | AQLI 2025 update: "National Capital Territory (NCT) of Delhi … 8.2 years longer", 2023 data | **C** → NCT of Delhi; counterfactual, not a personal forecast |
| "Nearly twice the toll of childhood and maternal malnutrition" | AQLI: said of "the region's most polluted countries" (South Asia) | **C** → attributed to South Asia |
| "Three of those four figures are models" | — | **K** |

## Sources, fires, forecast

| Claim | Verified | Action |
|---|---|---|
| TERI-ARAI 2018 split, winter/summer | Exec summary Table E.2; funded by Dept of Heavy Industry; "did not include the month of October" | **K** (page already correct) |
| "the only complete split anyone has published" | contradicted by DSS in the same band | **C** |
| "industry stays put" | table: 30 → 22 | **C** — computed |
| "whose last measurement is eight years old" | Feb 2017 | **C** — computed from the study |
| "The width of each line … the two studies, and the six sites" | bars are IITK only | **C** |
| Lead "works backwards … emissions inventory" | mixes receptor and dispersion models | **C** |
| FIRMS: "A detection is a thermal anomaly, not a confirmed crop fire" | NASA FIRMS FAQ: types "not currently attributed" | **K** |
| Fire figures dated 22 Aug under "Farm fires now" | not refreshed | **K**, labelled "as dated"; refresh is open work |
| Forecast "PM2.5 daily mean" | WAQI, US EPA scale | **C** — scale named, "A forecast, not an observation" |
| "India's official forecaster is SAFAR" | SAFAR homepage: "For observations & forecast refer to … ews.tropmet.res.in" | **C** → IITM/IMD Air Quality Early Warning System |
| GRAP stages 201/301/401/>450 | CAQM schedule, "Revision: 21.11.2025"; "invoked in advance" on IMD/IITM forecasts | **K**, now on the hub with the advance-invocation clause |
| (new) Delhi annual PM2.5 2018–2025 | PIB release 2210935, 2 Jan 2026, CAQM "daily avg." table | **added** |

## Attention, money, act

| Claim | Action | Why |
|---|---|---|
| "Searches peak every November at 39,084 … 10.8× swing" | **C** | Pageviews, not searches; peak and floor are two specific months, now named |
| "readings stay above the limit all twelve months" | **R** | Unsupported by a 32-day record |
| "all three numbers are the government's own" | **C** | Damage figure is Dalberg / Clean Air Fund / CII |
| ₹13,415 cr released; ₹9,929 cr spent | **K, flagged** | A newer official release figure exists (₹16,423.56 cr to FY 2025-26, PIB 2288316) but no matching utilisation figure; updating one side would break the 74%. Needs an as-of date and a same-date pair |
| "The cost of inaction is more than the action" (heading) | **K, flagged** | Owner's reinstated hook; its own "What this is not" caveat stands beneath it |
| "over the limit most of the year" | **R** | Unsupported |

## /now/air/india

"in the order they were read" → "worst first"; "Nothing is excluded" → names the two things set aside; "the whole of the
national real-time network" → "reported in this hour"; "the same reading taken apart — forty-four monitors" → monitor
count read off the data. **C** on all four.

## /now

"1.5× the limit" → "over AQI 100". **C** (D-15.3: no index multipliers).

## Still open

- `/learn/delhi-aqi` says the governing pollutant is "in Delhi, almost always PM2.5" — true of winter, not of
  September. Soften in the learn data.
- The station map's headline pair uses the suspect NO₂ channel ("154 and 66, 3.9 km apart").
- "Your air is your nearest monitor's" overgeneralises; the next line shows a 14.8 km worst gap.
- The India Post pincode claim (562 offices, no coordinates) is unlinked and undated.
