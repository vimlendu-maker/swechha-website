# AD-15 — The air page: source ledger

**Status:** the data-source specification for AD-14's fourteen bands. Rulings recorded as
D-13.1 → D-13.7. Nothing in this document may be built against until its schema row is
green.

**Purpose.** AD-14 §8 listed ten value slots and said what had to fill them. This says
**where each one actually comes from**, what it costs, what its real cadence is, **which of
the four state words it earns**, and what blocks it. It is the answer to "can we finalise
and link the data sources."

**The rule that governs every row.** Per D-10.1 the state word follows the *actual* cadence,
not the ambition. Per D-13.1 the feed reaches the page as committed JSON, so **`LIVE` is
unreachable on this page by construction** — every row below earns `PERIODIC`, a sourced
constant, or nothing.

---

## 1. It is three workstreams, and only one of them is API work

| # | workstream | blocked on | can start |
|---|---|---|---|
| **1** | **Sourced constants** — NAAQS limits, AQI breakpoints, the sub-index method, apportionment study figures, **the three health studies**, fund tables | nothing | **now.** Unblocks bands 1, **2**, 3, 4, 9 |
| **2** | **Feeds** — current AQI, station list, city ranking, FIRMS hotspots | the schema fields in §5 | after §5 lands |
| **3** | **Gaps nothing closes** — per-facility enforcement, pre-2015 AQI, forecast provenance | nothing closes them | design to them (D-12.1) |

Workstream 1 is the surprise: **five of the fourteen bands need no API at all**, and they
include the two carrying the page's heaviest figures — deaths, and money. Their values are
published constants with an authority and a date.

That is not a lesser form of data. **For a limit it is the only correct form**, because a
limit is not a measurement. And for a peer-reviewed mortality estimate it is *better* than a
feed: the figure is fixed, the method is published, and the document can be attached — which
is more than any air-quality API on this list can offer.

**The corollary worth stating: the most powerful things on this page do not need the API work
at all.** Bands 1's limit, 2's three studies, 4's apportionment, 9's fund tables and 11's
own record are all startable today. The feeds add currency to the *reading*; they add nothing
to the argument.

---

## 2. The ledger, band by band

Cadence is the **real** cadence, not the vendor's claim. "Earns" is the state word from the
frozen four-word vocabulary that the row honestly supports.

| band | figure | source | access | cost | real cadence | earns | blocked on |
|---|---|---|---|---|---|---|---|
| 1 | current AQI + PM2.5/PM10/NO₂/SO₂/CO/O₃ | **CPCB** via `data.gov.in` "Real-Time Air Quality Index"; or **WAQI** (aggregates CPCB's ~586 India stations) | free API key / free token | published bulletin; sub-daily at best | **PERIODIC** | §5 #1, #3 |
| 1 | **the published limit** | **CPCB NAAQS notification** + the **AQI breakpoint table** | document, transcribed | free | **static** — changes only when the standard does | *n/a — sourced constant* | §5 #2 |
| 1 | verdict + band scale | derived from the two rows above | — | — | derives | follows band 1 | §5 #2 |
| 1 | multiplier (`4.1×`) | **derived**, never typed | — | — | derives | follows band 1 | §5 #2 |
| 2 | **deaths, against two limits** | ***Lancet Planetary Health*, Dec 2024** — "Estimating the effect of annual PM2·5 exposure on mortality in India" | paper — **no API** | free | one-off study | *sourced constant, dated* | §5 #3 |
| 2 | **Delhi adolescent lung function** | **Lung Care Foundation** + Pulmocare Research, ***Lung India*, Sept 2021** | paper — **no API** | free | one-off study | *sourced constant, dated* | §5 #3 |
| 2 | **years of life expectancy lost** | **AQLI**, Energy Policy Institute at the University of Chicago (EPIC), **2025 edition** | report + portal — **no API** | free | **annual edition** | *sourced constant, edition stamped* | §5 #3 |
| strip | the 360° overview cells | **every band below it** — the strip originates nothing | — | — | follows its band | one label for the whole strip | — |
| 3 | six sub-indices, one governing | same feed as band 1; **"worst of six" is CPCB's own published method** | as band 1 | as band 1 | **PERIODIC** | §5 #1 |
| 4 | source apportionment split | **TERI–ARAI 2018 Delhi winter study** · SAFAR apportionment · **CPCB NCAP / PRANA** | report / portal — **no API** | free | **one-off, dated** | *sourced constant, year stamped* | — |
| 5 | farm-fire counts | **NASA FIRMS** (`MAP_KEY`), MODIS **and** VIIRS | free key, ≤~3h NRT | free | near-real-time, **seasonal** | **PERIODIC** · `OUT OF SEASON` off-season | §5 #3, #4 |
| 6 | monitor locations + district coverage | CPCB station list (carries lat/lng) + open district boundaries | as band 1 + one-off geo | free | station list changes rarely | **PERIODIC** | §5 #1 |
| 7 | the year strip + **AQI since 2015** | `data.gov.in` / CPCB archives | bulk / archive | free | annual roll-up | **PERIODIC** | §5 #1 |
| 8 | India city ranking | CPCB daily bulletin / WAQI | as band 1 | free | daily bulletin | **PERIODIC** | §5 #1 |
| 9 | **funds allocated + utilised, national and state-wise** | **NCAP** releases · **15th Finance Commission** air-quality grants · **PRANA** · **CAQM** (NCR) · **CAG** performance audits · **Lok Sabha / Rajya Sabha answers** | documents — **no API** | free | annual / per session | **PERIODIC** | §5 #2 |
| 10 | the forecast | **SAFAR** (IITM Pune, operationalised by IMD); **CPCB republishes it** | **portal, no documented public API** | free to read | 72h advance, updated daily | *not republished — linked* | — |
| 11 | Swechha's own three figures | **already in `SOURCE-FACTS.md`** | — | — | static | *sourced constant* | — |
| 12 | source + derivation per figure | every row above | — | — | — | — | **§5 #2 — the URL field** |
| — | per-facility enforcement / violations | **nothing public and stable** | — | — | — | **stays a named hole** | unclosable |

### 2.1 Notes that change how a row is built

**Band 1 — the limit is a constant, and that is the point.** A limit is not a measurement, so
it must never arrive from a feed. It is transcribed once from the CPCB notification with the
publishing authority named, and then **breach, verdict and multiplier all derive from it**.
This is schema gap #1 in the situation brief and it is the field the masthead's promise
rests on: without it, `LIMIT BROKEN` is hand-typed and the page can say a limit is broken
when it is not.

**The figures are not transcribed into this document.** Naming the notification is
provenance; typing its numbers into a spec from memory is how an unsourced figure enters a
fact base and then gets cited as if it were checked. The transcription happens once, into
the schema, from the document, with the document attached — per gate #11.

**Band 5 — the two-sensor discrepancy is the device, not a caveat.** A fire of 1 km² is
**one** hotspot in MODIS and **nine** in VIIRS. NRT counts are indicative by design and run
hot; science-quality data lags months. So the band renders **both counts side by side** and
names the sensor for each. Every headline farm-fire figure in Indian media depends on this
choice and almost none of them state it. A dashboard cannot run this device because it
undermines its own number.

**Band 7 — the series starts in 2015 and the page says so.** India's National AQI launched
April 2015. Pre-2015 NAMP data is SPM / RSPM / PM10 — a different quantity by a different
method — so it is not the same series and is not spliced in (D-13.3).

**Band 9 — attach the document or drop the row.** These figures exist as PDFs and Parliament
answers, which is *better* provenance than a feed: numbered, dated, downloadable. The
discipline is D-13.6's — the figure is quoted, the document is attached, and no inference is
drawn beyond the arithmetic. No "wasted", no "failed", no "diverted".

**Band 10 — link it, do not scrape it.** SAFAR is a portal with no documented public API.
Scraping it would produce a figure this page cannot attach a source document to, which is
the thing it exists not to do.

---

## 3. What the scheduled job does (D-13.1)

```
cron  →  fetch  →  validate (zod)  →  write JSON into the repo  →  commit  →  build reads it
```

Requirements, each one a real failure mode rather than a nicety:

1. **Validate before writing.** A malformed upstream response must fail the job, not land in
   the repo. The content pipeline already fails the build on bad frontmatter; this is the
   same contract one step earlier.
2. **Write the observation time, not the fetch time.** Two different timestamps, and the
   page's `.src` line needs the first (§5 #4).
3. **Never overwrite good data with an error.** A failed fetch leaves the last good file in
   place and the page's relative age grows visibly — which is honest, and is what the age
   line is for. An empty write would show as fresh-and-blank.
4. **Keys stay server-side.** They are in the job's environment, never in the client. This is
   one of the reasons D-13.1 rejected the client-side fetch.
5. **Local `Date` getters only** for anything date-shaped. Never `toISOString()` /
   `toLocaleDateString()` — the standing rule, and the reason the existing
   `data-attribution.tsx` bug (`timeZone:'UTC'` on an IST project) exists.
6. **The commit is the audit trail.** Every reading the site has ever shown is recoverable
   from git, which is a genuine by-product: it makes "we keep the record" true of the site's
   own data and not only of its subject.

---

## 4. What this buys, and what it does not

**Buys:** every figure on bands 1, 3, 5, 6, 7, 8 arrives from a named public source on a
stated cadence, labelled `PERIODIC`, with the fetch auditable in git. Bands 4, 9 and 11
carry sourced constants with documents attached. Band 12 can finally show a derivation per
figure.

**Does not buy `LIVE`.** By construction (D-13.1), and correctly: CPCB has no stable public
API and a bulletin is not a feed. If `LIVE` is ever wanted on this page it needs a genuinely
hourly source **and** a different fetch model, and it should be argued on its own rather than
smuggled in.

**Does not close three holes.** Per-facility enforcement (nothing public and stable);
pre-2015 AQI (never measured); a forecast this page can attach (SAFAR has no public API).
All three are **designed to** rather than papered over — which is the page's thesis working
as intended.

---

## 5. Schema fields — the actual blocker

None of these exists in `lib/content/schemas.ts`. Confirmed by reading the file. Ordered by
what unblocks the most.

| # | field | unblocks | why it is not optional |
|---|---|---|---|
| **1** | **a freshness enum** — `live \| periodic \| demo \| out_of_season` | every reading | The only freshness signal today is the boolean `mock`, so the four-word vocabulary **cannot be expressed at all.** The state badge is a component whose whole design is that it is never conditional, and it currently has nothing to read. |
| **2** | **`limit`** — value + publishing authority + effective date | bands 1, 3, 9 | So breach, verdict, band-scale tip and multiplier are **derived and never typed.** Without it the page can assert a breach that is not one. |
| **3** | **a source URL** — on both `liveDataSchema` and `evidenceSchema` | bands 4, 5, 9, 12 | Neither schema has one. **On a page whose claim is "with the source document attached", nothing can currently attach a document.** Also required by D-11.4's `Dataset` structured data. |
| **4** | **a validated observed timestamp**, separate from the fetch time | bands 1, 5 | `updatedAt` is `min(1)` with no ISO validation and is treated as one datetime; `data-attribution.tsx` then formats it as **UTC on an IST project.** |
| **5** | `windowStart` / `windowEnd` / `recursAnnually` | band 5, band 13 | `getActiveSituations()` has **no date logic at all**, so "a closed window does not render" is enforced by an editor remembering. Band 5 is seasonal, so this stops being theoretical. |
| **6** | an admin on/off override | band 13 | `OUT OF SEASON` is only reachable through it, so without it one of the four state words can never legitimately appear. |

**Two dead surfaces to delete rather than build against:** `heroImageSchema.signal`
(selective colour is retired) and `severity: 'water'` (a legal enum value that means nothing
and should not survive into a page deriving a red rail from severity).

---

## 6. Recommended order

1. **Fields #1, #2, #3** — the three that unblock the most and are pure schema work.
2. **The constants** — NAAQS limits and breakpoints, the apportionment study, the fund
   tables. No API, no job, documents attached. Bands 1, 3, 4, 9 become real.
3. **The job, one source only** — current AQI. Prove the whole chain end to end on one
   figure before adding a second.
4. **Fields #4, #5, #6**, then FIRMS — because band 5 is seasonal and needs the window
   fields to render honestly.
5. **The archives** — the 2015→present series and the city ranking. Heaviest, least
   urgent, and the two most likely to be cut for budget.

**Nothing here gates AD-14's Phase 1.** The shell is measured empty, so the build can start
now and the data can land underneath it — which is the right order, because every band is
composed to hold with its value stamped.
