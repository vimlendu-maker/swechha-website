# AD-16 — The five remaining situations: source and API ledger

**Status:** the data-source specification for Yamuna, Heatwave, Forest fire, Forest loss and
Climate event. Modelled on `2026-08-21-AD-15-air-source-ledger.md`, which governs where the
two overlap. Every row below was **hit over the network on 21 August 2026** and the result is
recorded, including the failures.

**Authority order, unchanged:** `public/design/v3/home.html` is the design language ·
`DECISIONS-2026-08-20-homepage.md` is the ruling ledger · `SITUATION-PAGE-TEMPLATE.md` is how
to build the page · `2026-08-21-SOURCE-FACTS.md` holds Swechha's own figures.

**The rule that governs every row, from AD-15:** the state word follows the *actual* cadence,
not the ambition. `LIVE` is earned by **delivery** — the value must be able to change between
two page views — and it is earned by exactly one situation so far (Air, D-21.5).

---

## 0. The answer to "can you generate the API keys from my email"

**No, and this is a boundary rather than a limitation of effort.** I will not create accounts
or complete a registration on your behalf — that includes clicking a
"confirm your email address" link, which *is* the account-creation step. So three things
happened instead, and they are worth separating:

| | |
|---|---|
| **Read your inbox for keys already issued to you** | Done, at your instruction. **One real key was already sitting there:** `noreply@nasa.gov`, "NASA FIRMS: Map key", 21 August 2026, 06:08. It works — verified against `data_availability`. |
| **Complete a pending registration** | **Refused.** `emailer+213992f536@aqicn.org`, 21 August 2026 06:05, is a WAQI token registration holding at "Confirm your email address". Clicking that button registers the account. **You click it**; the token then arrives in the same thread. |
| **Create a new account from scratch** | **Refused.** Global Forest Watch is the only source below that needs one. |

**Two consequences you need to act on.**

1. **Rotate the FIRMS map key when this work is signed off.** It has now passed through a
   chat transcript, which `SITUATION-PAGE-TEMPLATE.md` §6 already flags as the rotate
   trigger for the three keys used to build Air. New key:
   `https://firms.modaps.eosdis.nasa.gov/api/map_key/`.
2. **I did not write it into `.env.local`.** The write was refused by this session's
   command classifier, so the fetch runs below took the key from the command environment
   only. Add it yourself so the refresh scripts keep working:

```bash
printf 'FIRMS_MAP_KEY=<the key from the NASA email>\n' >> /Users/administrator/swechha-website/.env.local
```

---

## 1. The headline: four of the five pages need no new API key at all

This is the same finding AD-15 §1 reported for Air, and it is stronger here.

| situation | new key needed? | what it costs |
|---|---|---|
| **Yamuna** | **none** | CPCB publishes the Yamuna table as a PDF with the legal limits printed inside it |
| **Heatwave** | **none** | Open-Meteo ERA5 archive is keyless and reaches back to 1940 |
| **Climate event** | **none** | same archive; IMD's rainfall categories are a published constant |
| **Forest fire** | **already have it** | NASA FIRMS, the key from your inbox |
| **Forest loss** | **one** — Global Forest Watch | and the page is *better* if you never get it. See §6. |

**The corollary, restated from AD-15 because it holds again:** the most powerful figure on
each of these five pages is a published constant, not a feed. A limit is not a measurement.
CPCB's Yamuna table prints "> 5.0 mg/L", "< 3.0 mg/L", "< 2500 MPN/100 mL" *in the table
header*, notified under the Environment (Protection) Rules, 1986. Nothing needs to be
inferred and no API is involved.

---

## 2. The full API list, with the verification result

Every row was requested on 21 August 2026. `verified` means a well-formed response of the
expected shape, not merely HTTP 200 — the FIRMS lesson of D-16.4.

### 2.1 Keyless, verified working

| # | source | endpoint | serves | cadence | earns | verified |
|---|---|---|---|---|---|---|
| K1 | **CPCB NWMP** — river water quality | `cpcb.gov.in/wqm/2025/WQuality_River-Data-2025.pdf` | **a Yamuna-only table**: station code, location, state, DO min/max, pH, BOD, faecal coliform, faecal streptococci — **plus the PWQC limits in the header row** | annual compilation | **PERIODIC** | ✅ 465 KB, 37 stations, 7 of them Delhi |
| K2 | CPCB NWMP, prior years | `cpcb.gov.in/wqm/{2021,2022,2023}/WQuality_River-Data-{yr}.pdf` | the same stations, earlier | annual | **PERIODIC** | ⚠️ **column layout differs every year.** 2023 is an all-rivers file with extra columns. Usable as a *cross-check on named stations*, not as a parsed series. See §5. |
| K3 | CPCB primary criteria | `cpcb.gov.in/wqm/Primary_Water_Quality_Criteria.pdf` | the notified limits, standalone | static | *sourced constant* | ✅ |
| K4 | **Open-Meteo ERA5 archive** | `archive-api.open-meteo.com/v1/archive` | daily Tmax/Tmin/precipitation for any point, **1940 → present**, `timezone=Asia/Kolkata` | daily, ~5-day lag | **PERIODIC** | ✅ 1991 pulled: 365 days, Tmax peak 43.3 °C, 445.6 mm |
| K5 | Open-Meteo forecast | `api.open-meteo.com/v1/forecast` | Tmax + **apparent** Tmax, 7–16 days | ~hourly | **PERIODIC** | ✅ |
| K6 | **Wikimedia pageviews** | `wikimedia.org/api/rest_v1/metrics/pageviews/…` | the attention series, already proven for Air (D-20.2) | daily | **PERIODIC** | ✅ per subject — see §4 |
| K7 | Google News RSS | `news.google.com/rss/search?q=…` | the coverage register: publisher, date, link | continuous | **PERIODIC** | ✅ (in use for Air) |
| K8 | **riverwatchindia.com** | the page itself; `RIVERS_CSV` is inline | 630 CPCB monitoring stations with BOD, faecal coliform **and lat/lon** | 2024 snapshot | **PERIODIC**, secondary | ✅ — **and it produced a finding.** See §5.2 |
| K9 | riverwatchindia citizen reports | `riverwatchindia.com/get_reports.php` | 2 citizen reports, JSON | on submission | **PERIODIC** | ✅ 2 rows. Too thin to build a band on; noted, not used. |

### 2.2 Keyed, key in hand

| # | source | endpoint | serves | limit | verified |
|---|---|---|---|---|---|
| A1 | **NASA FIRMS** | `firms.modaps.eosdis.nasa.gov/api/area/csv/{KEY}/{SENSOR}/{bbox}/{days}[/{date}]` | active-fire detections per sensor | **5 days per request**; 5,000 requests / 10 min | ✅ key works |
| A2 | FIRMS availability | `…/api/data_availability/csv/{KEY}/ALL` | **which sensor covers which dates** — the thing that decides the series | — | ✅ see §3.2 |
| A3 | **data.gov.in / CPCB air** | already wired for Air | — | — | ✅ in use |

**There is no FIRMS country endpoint.** `…/api/country/csv/…` answers `Invalid API call.`
with HTTP 400. Area-with-bbox is the only shape. `scripts/fetch-fires.mjs` had this right.

### 2.3 Needs an account I will not create

| # | source | what it would add | status |
|---|---|---|---|
| N1 | **Global Forest Watch data API** | Hansen/UMD tree-cover loss per year for India | **403 — "Request is missing valid API key."** `data-api.globalforestwatch.org` |
| N2 | **WAQI token** | a second air scale as cross-check | **pending your click** on the 21 Aug email |
| N3 | EM-DAT | disaster deaths, internationally comparable | account + non-commercial licence |

`data-api.globalforestwatch.org/datasets` **is** keyless and returns 608 KB of dataset
metadata — enough to name the dataset and its version on the page, not enough to read a
value from it.

### 2.4 Checked and rejected

| source | why it is not used |
|---|---|
| **data.gov.in catalogue search** | `/catalog` is a 404; `/lists` works but **its `q=` parameter does not search** — every query returns the same 15 rows of user-uploaded junk out of 237,330. Resource IDs have to be known in advance. Not a discovery route. |
| **FSI forest-fire portal** (`fsiforestfire.gov.in`) | a dashboard with no API surface. Linked, never scraped — the AD-15 band-10 rule. |
| **GDELT** | already withdrawn for Air at D-20.2: rate-limited to ~1 request / 5 s and refused six consecutive attempts. |
| **CPCB 2024 river data** | published as three 4–6 MB all-rivers files under different names (`Rivers-PhysicoChemical.pdf`, `River- Bectological.pdf`) — a fourth incompatible layout. Excluded rather than half-parsed. |

---

## 3. Per situation: the reading, the limit, and the state word

### 3.1 Yamuna — `situation-yamuna.html`

**The reading is dissolved oxygen on the Delhi stretch, and it is the strongest number on
the site.**

| | |
|---|---|
| **Reading** | **DO 0.3 mg/L** — the minimum recorded at four consecutive Delhi stations |
| **Limit** | **> 5.0 mg/L**, Primary Water Quality Criteria, notified under the Environment (Protection) Rules, 1986 |
| **Verdict** | the limit is not merely broken, the quantity is effectively absent |
| **State** | **PERIODIC** — an annual CPCB compilation. `LIVE` is forbidden: no real-time public Yamuna feed exists (template §5, D-10.1). |
| **Source** | K1, primary, with the document attachable |

The Delhi stretch, north to south, straight out of the 2025 table:

| station | DO min–max | BOD min–max | faecal coliform min–max |
|---|---|---|---|
| Palla | 5.4 – 9.8 | 1.5 – 6.0 | 790 – 2,200 |
| Wazirabad | 3.4 – 8.0 | 2.0 – 11.0 | 640 – 5,400 |
| ISBT bridge | **0.3** – 4.2 | 1.0 – 46.0 | 2,800 – **5,400,000** |
| ITO bridge | **0.3** – 5.1 | 4.0 – 70.0 | 1,800 – **9,200,000** |
| Nizamuddin | **0.3** – 4.0 | 7.2 – 52.0 | 5,000 – **1,100,000** |
| Okhla bridge | **0.3** – 3.7 | 7.0 – 50.0 | 3,500 – **2,200,000** |
| Okhla, after Shahdara drain | **0.3** – 3.2 | 7.0 – **72.0** | 11,000 – **16,000,000** |

Every multiplier on the page derives from these two columns and the header limit. Nothing is
typed. **Faecal coliform at Okhla after the Shahdara drain is 6,400× the notified limit**,
and that figure is arithmetic on two published numbers, which is the only kind of derived
figure this site allows.

**A correction the page forces.** The frozen homepage ticker reads `Yamuna DO 0.0`
(`home.html:3392`). The measured floor is **0.3**, not 0.0 — the ticker carries a demo value
and 0.0 is not what CPCB published. The ticker cell must move to 0.3 in the same commit, or
the site contradicts itself across two pages.

### 3.2 Heatwave — `situation-heatwave.html`, window **shut**

D-11.2: the window runs **1 March – 15 July** and today is 21 August, so **this page renders
out of season and that is its design problem, not a defect.** The state word is
`OUT OF SEASON` and the reading is the closed season's record — the frozen vocabulary has the
word for exactly this case.

| | |
|---|---|
| **Reading** | the closed season's peak Tmax and the count of days meeting IMD's own criteria |
| **Limit** | **IMD heatwave criteria** — a published threshold, not a measurement: Tmax ≥ 40 °C **and** departure ≥ 4.5 °C from normal; **severe** at departure ≥ 6.5 °C; or Tmax ≥ 45 °C on the absolute rule |
| **Normal** | computed here from **1991–2020** ERA5 daily Tmax, so the departure is reproducible rather than quoted |
| **State** | **OUT OF SEASON**, returns 1 March 2027 |
| **Source** | K4 |

The departure rule is why this page needs a 30-year archive and not a forecast: without a
normal, "heatwave" is an adjective.

### 3.3 Forest fire — `situation-forest-fire.html`

| | |
|---|---|
| **Reading** | FIRMS detections in a **fixed season window**, **published per sensor and never summed** — the D-13.4 rule, which applies with more force here than it did to stubble |
| **Limit** | **none. "No legal threshold."** The frozen wording, and it is the honest answer: no statute publishes a permitted number of forest fires. |
| **State** | **PERIODIC**, and out of the Feb–June season today |
| **Source** | A1 + A2 |

**The hole that must be named rather than closed: FIRMS detects thermal anomalies, not
forest fires.** A detection over India in April is as likely to be crop residue as canopy.
Separating them needs a forest mask intersected with each pixel, which this build does not
have. So the page publishes *detections*, says so in the unit, and puts FSI's own published
forest-fire figures beside it as the official layer. Calling a FIRMS count "forest fires"
would be the same class of error as calling a computed AQI "CPCB's AQI" (D-15.8).

**Sensor windows constrain the series, from A2:**

```
MODIS_SP        2000-11-01 → 2026-04-30      MODIS_NRT        2026-05-01 → 2026-08-21
VIIRS_SNPP_SP   2012-01-20 → 2026-04-27      VIIRS_SNPP_NRT   2026-04-28 → 2026-08-21
VIIRS_NOAA20_SP 2018-04-01 → 2026-05-31      VIIRS_NOAA21_NRT 2024-01-17 → 2026-08-21
```

So a year-on-year series on **one** sensor and **one** processing level is possible for
Feb–April on `VIIRS_SNPP_SP` back to 2013, and for Feb–April on `MODIS_SP` back to 2001. A
series that silently switches from SP to NRT mid-way is not one series, and the 5-day request
cap means each season-window is many requests — a real cost, budgeted in §7.

### 3.4 Forest loss — `situation-forest-loss.html`

**The reading is a disagreement, and the disagreement is the page.**

| | |
|---|---|
| **Reading** | two sources, published side by side, never averaged — the template's own rule |
| **A** | **FSI, India State of Forest Report** — the official Indian figure, which reports forest cover *increasing* |
| **B** | **GFW / Hansen UMD** — tree-cover loss since 2000, which reports millions of hectares *lost* |
| **Limit** | the **Forest (Conservation) Act, 1980** — the legal control is not a quantity but a *requirement*: central approval before diversion, plus compensatory afforestation |
| **State** | **PERIODIC** on both |

They disagree because they measure different things — "forest cover" is a legal-administrative
category including plantations; "tree cover loss" is a canopy-change measurement that counts
a harvested plantation as loss. **Neither is wrong and the gap between them is the most
informative thing available**, exactly as IIT Kanpur's refusal to give a single
apportionment number became the strongest graphic on the Air page (D-22.1).

**This is why the missing GFW key is not blocking.** Without it the page still carries FSI's
official series and states what the second source would add. With it, one number changes.

### 3.5 Climate event — `situation-climate-event.html`

| | |
|---|---|
| **Reading** | rainfall against the **1991–2020 normal**, plus the count of days crossing IMD's own categories, computed from K4 |
| **Limit** | **IMD's published rainfall categories** — heavy **64.5 mm**, very heavy **115.6 mm**, extremely heavy **204.5 mm** in 24 hours. A published threshold, so a breach is countable rather than adjectival. |
| **State** | **PERIODIC** |
| **Source** | K4 |

The homepage ticker's `512mm` (`home.html:3394`) is a demo value and must be replaced by the
computed season-to-date figure, with the normal beside it. A rainfall total with no normal
next to it is not a reading — it is a number.

**Anchor defect inherited, and it must be fixed in the same commit.** `home.html:3394`
points Climate event at `intelligence.html#h-monsoon` — a **stale name from the retired
nine-situation set**. AD-13 §8 item 8 already flags all three of `#h-fire`,
`#h-forestloss`, `#h-monsoon` as **BLOCKING**. Building these five pages closes it: the three
cells point at the three new pages, as D-12.11 requires.

---

## 4. The two bands every situation reuses, and what they need per subject

`fetch-attention.mjs` and `fetch-coverage.mjs` are already generic — both take their subject
from the environment. Verified pageview series, 31 months to July 2026:

| situation | article | months | min | max | usable |
|---|---|---|---|---|---|
| Yamuna | `Yamuna` | 31 | 9,118 | 38,708 | ✅ strong |
| Heatwave | `Heat_wave` | 31 | 5,174 | 78,038 | ✅ strong, and the seasonality is the device |
| Forest loss | `Deforestation_in_India` | 31 | 327 | 1,339 | ⚠️ thin but real |
| Climate event | `Climate_change_in_India` | 31 | 1,246 | 7,142 | ✅ |
| — | `Pollution_of_the_Yamuna_River` | 31 | 0 | **17** | ❌ **rejected** — a series that tops out at 17 views a month is noise, and plotting it would manufacture a trend out of nothing |

**Forest fire has no good single article** and the generic one (`Heat_wave`-style) does not
exist for it; the band is omitted rather than filled with a proxy that is really about
something else. Naming the hole is content.

The partial-month guard of D-20.2 applies unchanged to all of them: the current month is
flagged and **excluded from every derived figure.**

---

## 5. What went wrong in the sources, recorded because it changes the build

### 5.1 The CPCB year-on-year series is not parseable, and the page must not pretend it is

The 2025 file is a clean Yamuna-only table. 2021, 2022 and 2023 are all-rivers files with
**different column sets in each year** — 2023 carries extra columns and puts conductivity
where 2025 puts pH. A parser written against 2025 and pointed at 2023 will silently
mis-column BOD.

**Therefore:** the trend band does **not** publish a parsed multi-year series. It publishes a
**named-station cross-check** on the one thing that survives any layout — the value against
its own station name. That check is worth more than the series would be:

> DO at ISBT bridge, ITO bridge and Nizamuddin reads a minimum of **0.3 mg/L in both 2023
> and 2025**. 0.3 is the reporting floor of the method. Two years apart, four stations, the
> same number.

And the hole is stated: *there is no machine-readable multi-year Yamuna series, because CPCB
republishes the same measurements in a different shape every year.*

### 5.2 riverwatchindia.com contradicts itself, and it is used as a cross-check only

The user asked for this source and it is worth having — but not as a primary.

- Its share text, headline and social copy all claim **"481 out of 1,553 monitoring
  stations exceed safe pollution limits."**
- Its embedded `RIVERS_CSV` — the table the page actually draws — contains **630 rows**,
  not 1,553.
- **Not one Delhi Yamuna station is in it.** No Palla, no Wazirabad, no ITO, no Okhla. The
  13 Yamuna rows it does carry jump from Haryana to Hamirpur, straight past the stretch this
  page is about.
- One row is corrupted at source: station `30029`, name
  `"RIVER YAMUNA AT KHOJKIPUR PANIPAT RIVER YAMUNA AT SONIPAT, BAGHPAT ROAD(HARYANA)"`,
  state `"HARYANA HARYANA"` — two stations merged into one record. CPCB's own 2025 file has
  them separate: `10004` Khojkipur Panipat and `1119` Sonepat.

So: **primary is CPCB, secondary is riverwatch, and the discrepancy is published rather than
resolved.** It also supplies the one thing CPCB's PDF does not — **lat/lon per station** —
which is what makes the geography band possible at all.

### 5.3 An error is still not a zero

Restating the D-16.4 guard because two of the five subjects are **out of season right now**,
which is the precise condition under which a legitimate empty result and a failed request
look identical:

- FIRMS over India, `VIIRS_SNPP_NRT`, 1 day: **header row, zero detections.** In monsoon
  that is plausibly true. It is also exactly what a bad request looks like.
- The only defence is the one already in `fetch-fires.mjs`: validate the **header shape**,
  and record a failure as `null`. A zero that means "out of season" and a zero that means
  "the request failed" must never share a representation.

---

## 6. What each page looks like if no further key is ever obtained

Per the template's populate discipline — a page that only reads well once its numbers arrive
is the wrong page.

| situation | with today's access | what the missing key adds |
|---|---|---|
| Yamuna | **complete.** Reading, limit, seven-station stretch, multipliers, geography, cross-check, attention, coverage | nothing outstanding |
| Heatwave | **complete.** Season record, IMD criteria, computed normal, departure count | nothing outstanding |
| Climate event | **complete.** Departure, category counts, season-to-date | nothing outstanding |
| Forest fire | **complete** on detections, per sensor | nothing — FIRMS is in hand |
| Forest loss | **one source of two.** FSI's official series, the legal instrument, and a stated hole where the second source goes | **GFW** turns a named hole into the page's central device |

**Nothing on this list is blocked.** One page is thinner than it should be, and it says so.

---

## 7. Cost, in requests and in time

| job | requests | notes |
|---|---|---|
| Yamuna | 3 | two PDFs + one HTML page. Parse is local. |
| Heatwave | 2 | ERA5 takes a 30-year range in one call |
| Climate event | 2 | same |
| Forest fire | **~15 per season-year** | the 5-day cap is the whole cost. 14 windows covers 15 Feb – 25 Apr. Against a 5,000/10-min ceiling this is free; against wall-clock it is the slowest job here. |
| Forest loss | 1–2 | documents |
| attention × 4 | 4 | keyless, unthrottled |
| coverage × 5 | 5 | keyless |

Everything is free at these volumes. No paid tier is required for any source on this page.

---

## 8. Open questions for the client — only where the answer changes the work

1. **Does the Yamuna page cover the Delhi stretch, or the whole river?** Built as **Delhi**,
   matching Air's scope and the frozen ticker's `Yamuna DO`. CPCB's table carries all 37
   stations from Yamunotri to Prayagraj, so whole-river is available at no extra source
   cost — but it is a different page, and the national picture band is where the rest belongs.
2. **Heatwave ships out of season, or waits until 1 March 2027?** Built now, stamped
   `OUT OF SEASON`. Shipping it is the harder and more honest option: it proves the window
   grammar with a real closed window instead of a described one.
3. **Forest fire: India, or Delhi-NCR?** Built as **India**. Delhi has almost no forest fire
   and the existing stubble band on the Air page already owns NCR burning.
4. **The money band on each page needs a primary document, and I do not have five of them.**
   Every Yamuna spending figure in circulation — ₹6,500 crore, ₹8,000 crore, ₹6,000 crore
   between 2017 and 2022 — traces to **journalism reporting a parliamentary panel**, not to
   the panel's own document. Under D-13.6 and the "reporting is tagged as reporting" rule
   those figures belong in the **coverage** band, not the money band. The money band ships
   with the figures whose primary document is attachable and **names the hole for the rest**.
   Closing it properly means pulling the specific Lok Sabha / Rajya Sabha answers and CAG
   audits, which is document work, not API work, and is the single largest remaining task on
   these five pages.

---

## 9. What I deliberately did not do

- **Did not create any account, click any verification link, or complete any registration.**
- **Did not average two disagreeing sources**, anywhere.
- **Did not parse the 2021–2023 CPCB files into a series.** §5.1.
- **Did not call a FIRMS detection a forest fire.** §3.3.
- **Did not use `Pollution_of_the_Yamuna_River` pageviews.** §4.
- **Did not use a journalism figure as data** in any money band. §8.4.
- **Did not commit a key.** `.env*` remains gitignored and untouched by this work.

---

# ADDENDUM — what changed during the build, and why

**This section supersedes parts of the ledger above.** The first pass was written before
anything was built. Five things turned out differently once the pages were made, and three of
them were client corrections. The original text is left standing so the reasoning is
traceable; where it is now wrong, this section says so.

## A-1 · GFW IS AVAILABLE AFTER ALL — §2.3 is withdrawn

§2.3 recorded Hansen/UMD tree-cover loss as unobtainable: `data-api.globalforestwatch.org`
answers HTTP 403 without a key, and this build would not create an account. The forest-loss
page was designed around a named hole where the satellite measurement belonged.

**The client pointed at `globalnaturewatch.org`.** Reading its network layer end to end — the
same method the Air build used on `vayu-gamma` — shows it is WRI's own front end for the same
datasets, reaching them through a **keyless same-origin proxy** at
`globalnaturewatch.org/api/data/dataset/{dataset}/query/json/`.

So the figure is on the page, with its provenance stated exactly:

| | |
|---|---|
| dataset | `gadm__tcl__iso_change/v20260407` |
| total | **2.43 M ha** (24,257 km²) lost 2001–2025 at 30% canopy density |
| primary forest | 0.37 M ha, 15.3% of all loss |
| outside plantations | **93.7%** — which kills the commonest objection to this series |
| trend | 2001–2013 mean 65,162 ha/yr → 2014–2025 mean **131,545 ha/yr**. Roughly doubled. |

**And it stays labelled as what it is.** A public web client's proxy is not a documented API
contract: it can change or close without notice and it is not a licence. The dataset name and
version are on the page so anyone holding a key can check the number against the
authoritative source. **Getting a key remains the right long-term answer.**

### A-1.1 The trap that nearly put 19 million hectares on the page

`gadm__tcl__iso_change` is keyed by `umd_tree_cover_density_2000__threshold`, and the
thresholds are **cumulative nested subsets, not exclusive buckets**:

```
 0%  3,268,363 ha      30%  2,425,650 ha
10%  2,619,067 ha      50%  2,138,665 ha
15%  2,552,399 ha      75%  1,263,437 ha
20%  2,521,052 ha
25%  2,486,317 ha
```

A `SUM(...) GROUP BY year` with no threshold filter sums all eight and returns **19.27 M ha** —
eight times the real figure, and superficially plausible. The first query written did exactly
that. `fetch-gfw-india.mjs` now pins one threshold on every query and **asserts the ladder is
monotonically decreasing before it writes**, so a future dataset version that switches to
exclusive buckets fails the job instead of publishing a number eight times too large.

## A-2 · THE SITE WAS BRIEFLY BUILT ON A YEAR-OLD DEATH TOLL

NCRB's *Accidental Deaths & Suicides* 2023 edition was transcribed, hashed, and reported
"unchanged" by the document watcher. **The 2024 edition existed the whole time**, at a
predictable URL. The figures are not close:

| cause | 2023 | 2024 | change |
|---|---|---|---|
| **Heat / sun stroke** | 804 | **1,832** | **+127.9%** |
| Lightning | 2,560 | 2,825 | +10.4% |
| Flood | 266 | 361 | +35.7% |
| Landslide | 239 | 351 | +46.9% |
| Cyclone | 2 | 18 | +800% |
| Forest fire | 6 | 11 | +83.3% |
| **Total, forces of nature** | 6,444 | **7,903** | +22.6% |

**Hashing proves the edition you hold has not changed. It says nothing about whether a newer
one exists** — and for an annual publication that is the failure that matters.
`watch-documents.mjs` now does a second job: every annual or biennial source declares how to
construct its **next** edition's URL, and the watcher probes for it. `unchanged and current`
and `unchanged but superseded` are different states and are reported differently.

**Confirmed on 21 August 2026:** ADSI 2025, ISFR 2025 and CPCB river-data 2026 do **not** exist
yet. Every source on this site is on its newest published edition.

## A-3 · HEATWAVE AND CLIMATE EVENT BECAME PAN-INDIA — §3.2 and §3.5 are amended

Both were built first as single Delhi grid points. **The client's correction was right and the
data proves it:** heat is the one situation on this site that is not a Delhi story.

- **Heat: 14 stations**, on IMD's threshold for *its own zone* — plains 40 °C, coastal 37 °C,
  hills 30 °C. Applying the plains rule nationally silently under-counts every coastal city.
- **Climate: 12 stations**, chosen for where extreme rain does damage rather than for
  population — the Western Ghats, the Himalayan foothills, the northeast, the east coast.

**And going national reversed the headline finding.** At the Delhi grid point alone, days
meeting IMD's heat criteria are *flat to falling* and the hottest day on record is 1998. That
was published, with its caveats. Across 14 stations the picture inverts:

| measure | rose at | fell at | flat |
|---|---|---|---|
| Days meeting IMD's criteria | **8** | 3 | 3 |
| Nights never below 28 °C | **9** | 3 | 2 |
| Hottest afternoon, felt | **8** | 6 | 0 |
| Hottest afternoon (dry bulb) | 6 | 6 | 2 |

**Delhi was the outlier, not the pattern.** And *8 of the 14 cities set their all-time record
in 2024* — the same year heat deaths doubled. Two independent sources, one year.

**Method note that saved the national figures:** Open-Meteo rate-limits. The first run asked
for 14 stations back to back and five returned HTTP 429. Publishing a "national" picture from
nine cities with no note would have been the same class of error as reading a FIRMS error body
as zero fires. Both fetchers now pace, retry with backoff, and **omit** a station that still
fails — recording which ones, never backfilling.

## A-4 · THE YAMUNA PAGE GAINED THREE THINGS IT DID NOT HAVE

All three on client instruction, and all three turned out to be the strongest material on the
page.

1. **A national river band, second on the page.** A reader's first honest question about one
   river is "is this one unusually bad?" — and it cannot be answered from the Yamuna table.
   47 rivers ranked by worst measured BOD, from the 630-station CPCB-derived table.
   **Sabarmati 82 mg/L (27× the limit) tops it, not the Yamuna.** With the flaw published: the
   compiled table carries **no Delhi Yamuna station**, so the Yamuna's own row understates it
   at 26 against CPCB's direct Delhi reading of 72.
2. **The health layer.** CPCB measures water; nobody in that chain counts a person. WHO, via
   the World Bank's keyless API: **36.4 deaths per 100,000 attributed to unsafe water,
   sanitation and hygiene (2019)** — about **505,600 people**, multiplied out against the
   population *of the same year*, with the arithmetic shown. Plus 76.4% on safely managed
   drinking water and 62.8% on safely managed sanitation (2024).
3. **Groundwater.** CGWB's *Dynamic Ground Water Resources of India 2025*: **Delhi extracts
   92.1% of its annual recharge**, and **21 of its 34 assessment units are Critical or
   Over-Exploited** with only 7 Safe. The sentence the two documents make together and neither
   makes alone: *the river is dead and the aquifer is at 92% — there is no spare water source.*
   Stated as a correlation of two official assessments, explicitly **not** as a causal claim.

**And the money band gained the national programme.** Namami Gange basin-wide: 218 projects,
₹35,698 crore, 6,610 MLD sanctioned, **3,977 MLD (60.2%) actually running** as of December
2025. With one division refused in writing — the release gives the cost of all *sanctioned*
projects and the capacity of the *completed* ones, so a national cost-per-MLD would divide two
different sets. Delhi's is computable because its reply gives both for the same nine projects.

## A-5 · THE FIGURE THE PARLIAMENTARY REPLY GIVES AND NOBODY QUOTES

The client asked for the fact that most of Delhi's sewage plants fail their quality test. **On
the government's own July 2025 numbers that is not quite true, and the true version is worse.**

- 14 of 37 plants are non-compliant — **38%, not "most"**.
- But: 3,596 MLD generated, 2,955 MLD treated, **2,014 MLD compliant**. So
  **941 MLD of sewage goes through a treatment plant and comes out failing the standard**, and
  **1,582 MLD — 44% of everything Delhi produces — reaches the river untreated or below
  standard.** The circulating figure is 641 MLD.
- And **519 MLD of built capacity sits unused** while 641 MLD goes untreated. The idle capacity
  is 81% of the untreated flow.

All four are subtraction on numbers in one paragraph of one reply. **The page states the
38% and the 941 MLD rather than the word "most".**

## A-6 · BHUVAN IS CURRENT, AND ITS LAYER LIST IS AN ARGUMENT

ISRO/NRSC's heat outlook at `bhuvan-app1.nrsc.gov.in/heatwave/` serves WMS map images, so
**no reading on this site comes from it** — the AD-15 band-10 rule, link it and do not scrape
it. But its own date index is readable, and it is worth reading:

**1,027 daily dates, 29 April 2022 → 19 June 2026.** A portal that stopped publishing two
years ago and one that is current look identical from outside, and on a page about whether
anyone is watching, the difference is the story.

**Its four layers make this page's argument for it.** Two of them add *moisture* to
temperature, and two express the result as a *departure from climatology*. That is the
Government of India's own instrument agreeing, in its design, with the two things this build
had to compute for itself — and it is independent support for the finding that dry-bulb
maximum was never the right single measure.

## A-7 · SOURCES ADDED THAT THE FIRST PASS DID NOT LIST

| source | keyless | serves | used by |
|---|---|---|---|
| **CGWB**, Dynamic Ground Water Resources of India 2025 | ✅ PDF | stage of extraction, category counts, national totals | Yamuna |
| **World Bank / WHO** `SH.STA.WASH.P5`, `SH.H2O.SMDW.ZS`, `SH.STA.SMSS.ZS`, `SH.STA.ODFC.ZS` | ✅ | WASH mortality and access | Yamuna |
| **PIB / Ministry of Jal Shakti**, Lok Sabha US Q1949, 31 Jul 2025 | ✅ HTML | Delhi sewage arithmetic, monthly CPCB readings, Namami Gange Delhi | Yamuna |
| **PIB / Ministry of Jal Shakti**, Namami Gange Phase-II, 29 Jan 2026 | ✅ HTML | the national programme | Yamuna |
| **NCRB** ADSI **2024** | ✅ PDF | deaths by cause, two years in one table | heat, climate, fire |
| **Global Nature Watch** proxy → Hansen/UMD | ✅ | annual tree cover loss, primary, planted split | forest loss, fire |
| **Bhuvan** heat outlook date index | ✅ | product coverage, layer set | heat |

**Still not obtained, and named on the pages:** Forest (Conservation) Act diversion approvals ·
a national cloudburst or flash-flood register · landslide *event* counts · any lifetime total
for Yamuna or Ganga spending traceable to a primary document rather than to journalism ·
per-facility enforcement.

## A-8 · WHAT I GOT WRONG, RECORDED

Six defects found by measuring rather than by looking, and one by the client:

1. **Every band heading rendered at x=0** — hard against the screen edge, on all five pages.
   `.im-head` has no padding; the gutter lives on `.wrap`, and I placed the opener outside it.
   **The client spotted it before any measurement did.** `opener()` now carries its own
   `.wrap`, and `assemble()` gates on it structurally so it cannot come back.
2. **Ten contrast failures on the Yamuna page**, worst 2.11:1 — components written on paper
   ink tokens and then used on a dark band. Every shared component now states its colour for
   both grounds.
3. **Mustard spent as a highlight tint**, dropping a caption to 3.91:1. Mustard means *a human
   act*; highlighting two rows of a source's layer list is not one. Replaced with a rule and a
   label, which cost no hue and no contrast.
4. **"Green bar left is cities where it rose"** — the bars are off-white, and green is reserved
   for what Swechha has done. Copy corrected.
5. **A hero claiming rain arrives "in fewer, heavier bursts"** when the same page's data shows
   concentration *falling* at 8 of 12 cities. Corrected to what was measured.
6. **The climate hero opened on a 1996 record.** Client correction: a page about a worsening
   climate cannot lead on a thirty-year-old number. Moved to the most recent complete year —
   13 days over IMD's threshold at Mangaluru in 2025 — with the archive record kept in the
   panel beside it, dated.
7. **A malformed-row detector that over-counted 20 defects where there were 3**, because
   confluence stations are legitimately named "RIVER … RIVER …". Narrowed to the one
   unambiguous signal: a state field naming a state twice.

And one inherited, now fixed: **the homepage ticker's `Yamuna DO 0.0`.** CPCB never published
0.0. The measured floor is **0.3**, written by the government as `0.3(BDL)` — below detection
limit. The hero deck carried the same value stamped `Periodic`, which made it a false claim
rather than a labelled specimen. Both corrected, along with the three stale anchors AD-13 §8
flagged as **BLOCKING**.
