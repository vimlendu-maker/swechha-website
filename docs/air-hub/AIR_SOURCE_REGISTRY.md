# /now/air — Source registry

One card per source the hub uses or deliberately does not. "Checked" is the date the source itself was fetched and
read for this registry.

### CPCB — CAAQMS live feed
- **Type:** primary observations (official). **Provides:** per-station, per-pollutant sub-indexes and CPCB's own station AQI.
- **Geography:** ~500 stations, ~260 cities. **Update:** hourly. **Method:** continuous analysers; CPCB NAQI.
- **URL:** `airquality.cpcb.gov.in/caaqms/rss_feed`. **Used for:** Delhi reading, national snapshot (first choice).
- **Limitations:** unreachable from GitHub runners and Vercel bom1; answers from Indian residential networks. Checked 26 Sep 2026 (200, 0.07 s from the owner's Mac).

### CPCB via data.gov.in — "Real time Air Quality Index from various locations"
- **Type:** official data, mirror. **Provides:** the same sub-indexes. **Update:** lags the live feed 4–10 h.
- **URL:** `api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69` (key required).
- **Limitations:** returning HTTP 502 to the pipeline since ~19:00 IST 25 Sep 2026. Carries no concentrations.

### CPCB — National Air Quality Index
- **Type:** official method. **Provides:** six categories, breakpoints, averaging periods (24 h; 8 h for CO and O₃), the worst-sub-index rule, the ≥3-pollutant rule, health statements.
- **URL:** `cpcb.gov.in/upload/national-air-quality-index/About_AQI.pdf`, `…/FINAL-REPORT_AQI_.pdf`. **Checked:** 26 Sep 2026.
- **Note:** CPCB names 101–200 "Moderately polluted"; its health table says "Moderate".

### CPCB — National Ambient Air Quality Standards, 2009
- **Type:** law (notified under the Air Act 1981). **Provides:** the twelve standards and the 98% compliance rule.
- **URL:** `cpcb.nic.in/uploads/National_Ambient_Air_Quality_Standards.pdf` (Gazette of India, Extraordinary, No. 217, 18 Nov 2009). **Checked:** 26 Sep 2026, all four pages read.
- **Limitations:** no revision found as of Sep 2026 (a 2021 announcement of a review only).

### WHO — Global Air Quality Guidelines, 2021
- **Type:** health-based recommendation; no legal force in India. **Provides:** Table 0.1 AQG levels; Table 0.2 short-period guidelines "that were not re-evaluated and remain valid".
- **URL:** `who.int/publications/i/item/9789240034228`; PDF via IRIS. Published 22 Sep 2021. **Checked:** 26 Sep 2026, tables read from the PDF.
- **Note:** 24-h and 8-h levels are the 99th percentile (3–4 exceedance days a year).

### CAQM — GRAP schedule
- **Type:** official policy. **Provides:** stage thresholds; advance invocation on IMD/IITM forecasts.
- **URL:** CAQM schedule PDF "(Revision: 21.11.2025)"; PIB releases 2192852 and 2215738 per stage. **Checked:** 26 Sep 2026.
- **Limitations:** no feed of orders; status is published case by case on `caqm.nic.in`. The hub states the schedule, never the status. (On 26 Sep 2026 the latest GRAP order listed was a 29 May 2026 revocation of Stage I.)

### CAQM via PIB — Delhi annual PM10 and PM2.5, 2018–2025
- **Type:** official data. **URL:** `pib.gov.in/PressReleasePage.aspx?PRID=2210935`, 2 Jan 2026. **Checked:** 26 Sep 2026 (browser).
- **Limitations:** "daily avg." to 31 December; station set not stated. A 31 Dec release (2210305) runs to 29 Dec and differs by 1 µg/m³.

### NCR Planning Board — constituent areas
- **Type:** official geography. **URL:** `ncrpb.nic.in/ncrconstituent.html`. **Checked:** 26 Sep 2026.
- **Provides:** NCT Delhi; 14 Haryana, 8 UP, 2 Rajasthan districts; ~55,083 km².

### IITM / IMD — Air Quality Early Warning System; Decision Support System
- **Type:** official forecast and modelled source contributions. **URL:** `ews.tropmet.res.in` (EWS), `/dss/` (DSS).
- **Limitations:** unreachable from here (public DNS returns a private address); no documented public data feed; DSS runs in winter (CEEW, 1 Oct 2025, secondary). **Linked, never restated.**

### SAFAR (IITM)
- **Status:** its homepage now says "For observations & forecast refer to … ews.tropmet.res.in". No dated shutdown notice found. No longer named as the official forecaster.

### WAQI
- **Type:** independent aggregator; forecast is WAQI's model on the US EPA scale. **Used for:** the forecast curve and the Tier-2 ordering check. Never a gate, never a reading.

### NASA FIRMS
- **Type:** satellite observations (MODIS 1 km, VIIRS 375 m). **Provides:** active fires and thermal anomalies within ~3 h.
- **Limitations:** "Different types of thermal anomalies are not currently attributed" — a detection is not a confirmed crop fire. Checked 26 Sep 2026.

### AQLI — EPIC, University of Chicago
- **Type:** modelled counterfactual. **2025 update** (28 Aug 2025), 2023 data: NCT of Delhi 8.2 years, India 3.5 years, against the WHO guideline.
- **Limitations:** satellite PM2.5 excluding dust and sea salt; an average-resident estimate, not an individual prediction.

### Jaganathan et al., *Lancet Planetary Health*, Dec 2024
- doi `10.1016/S2542-5196(24)00248-1`; difference-in-differences, 2009–2019. 3.8 M deaths (5.0%) vs NAAQS; 16.6 M (24.9%) vs WHO. Modelled. Checked via Europe PMC.

### Salvi et al., *Lung India*, 2021
- doi `10.4103/lungindia.lungindia_955_20`; PMC8509169. 29.4% airflow obstruction on spirometry; 39.8% vs 16.4% overweight or obese (Delhi vs Kottayam–Mysore). Counted. Checked via Europe PMC full text.

### TERI–ARAI, 2018; IIT Kanpur, 2016
- Government-commissioned apportionment studies (dispersion and receptor models). Seasonal averages; October not modelled (TERI–ARAI). See `data/apportionment-delhi.json` for tables and page numbers.

### PRANA / PIB — NCAP funding
- Released ₹16,423.56 cr, FY 2019-20 to 2025-26, 130 cities (PIB 2288316, 23 Jul 2026; PRANA homepage). No current utilisation total found. The hub's money band still shows an older released/spent pair; see the content audit.

### Not used, and why
- `app.cpcbccr.com` — looks like CPCB, serves Open-Meteo model data.
- Any hand-kept "current GRAP stage" — no feed; would go stale silently.
- A blended source-apportionment pie — no study supports a blend.
