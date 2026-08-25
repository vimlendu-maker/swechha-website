# AD-42 — The feed publishes the index. We were computing it twice.

**25 August 2026.** Reverses **D-21.6** and the CO exclusion of **D-15.9**.
Raised by the owner: *"I am getting feedback on aqi data… other monitors are
showing 100 but our site is showing 381."*

---

## A-42.1 · What was wrong

`data.gov.in` resource `3b01bcb8` is titled **"Real time Air Quality Index from
various locations"**, and that is what it returns. `avg_value`, `min_value` and
`max_value` are CPCB's own 24-hour **sub-indexes**, per pollutant per station.

`lib/air.ts`, `scripts/fetch-air.mjs` and `scripts/fetch-india.mjs` all asserted
the opposite — `"returns": "per-station pollutant concentrations, NOT an AQI"` —
and ran every value through the CPCB breakpoint table a **second** time. The
site published roughly double, everywhere, for eleven weeks.

On the morning this was found:

| | site published | CPCB published |
|---|---|---|
| Delhi | **381**, Very Poor, "3.8 the limit" | **97**, Satisfactory |
| Anand Vihar | **381** | **177** |
| Delhi's national rank | **1st of 266** | 26th |

## A-42.2 · How it was proved, not inferred

CPCB's Central Control Room panel for Anand Vihar, against the feed for the same
station:

```
CPCB  "24 Hr Subindexes"   PM2.5 177   PM10 141   NO2 56   NH3 11   SO2 31   CO 117   O3 4
feed   avg_value           PM2.5 225   PM10 202   NO2 55   NH3 10   SO2 32   CO 128   O3 2
```

Nine hours apart. The slow pollutants match to within a point or two; the PM
values fell as the morning cleared. **The fingerprint is PM2.5 MIN = 67 in
both.** If the feed's 67 were µg/m³, CPCB's sub-index for it would read 121. It
reads 67. The feed value *is* the sub-index.

## A-42.3 · A city is the mean of its stations — D-21.6 reversed

D-21.6 ruled *"a city's AQI is its worst station… never a mean, at either
level"*, defending it as one method at both scales. The gesture is consistent;
it is not CPCB's definition. CPCB takes the worst sub-index **within** a station
and the average **across** them.

Tested against CPCB's own published figures for **73 cities**, same hour:

| rule | MAE | bias | mean ratio |
|---|---|---|---|
| **mean of station AQIs** | **9.1** | **0.0** | **1.00** |
| per-pollutant mean, then worst | 9.4 | −1.1 | 0.98 |
| median station | 11.9 | +3.6 | 1.04 |
| worst station *(D-21.6)* | 21.1 | **+15.7** | **1.25** |

CPCB weights that mean by each station's 2km-grid population. That grid is not
published, so ours is unweighted **and the page says so** rather than implying a
precision we do not have.

**The worst station is still published, by name and with its own number.** It is
a real fact about Delhi. It was never "Delhi's AQI".

## A-42.4 · CO is back in

D-15.9 excluded CO because its values were "not credible" as mg/m³ *or* µg/m³
and the feed stated no unit — all true, all explained by the same misreading.
CO 128 is an ordinary sub-index. The old note recorded CO running 10–108 with a
median of 32 across Delhi and treated that as evidence of a broken unit; as
sub-indexes those are unremarkable numbers.

On 25 August, CO was the worst sub-index at **six of Delhi's 44 stations**. The
exclusion was suppressing six real readings, and the paragraph defending it is
off the page.

## A-42.5 · Concentrations are now IMPLIED, and marked

The feed carries no µg/m³ at all. Where the page needs a concentration it
inverts the breakpoint table — exact, since the mapping is piecewise-linear;
the only loss is CPCB's rounding of the index to a whole number. Printed with a
tilde and carried in the data as `concBasis: 'implied-from-subindex'`.

This also resolves CO's "unstated unit": sub-index 106 implies **2.5 mg/m³**,
which is an entirely credible urban reading.

## A-42.6 · The self-check that slept through it

`selfCheck()` validated the breakpoint table against CPCB's worked example
(PM2.5 31 → 51). It was correct. It passed on every run for eleven weeks while
the forward conversion was itself the bug.

> **A check can prove the table is right. It cannot prove the table should be
> consulted.**

Both self-checks now run the **inverse**, which is the direction the code
actually depends on. `subIndex()` is **deleted rather than left unused** — the
only reliable way to stop a conversion being reintroduced is to remove the
function that performs it.

## A-42.7 · What the hero says now

> Periodic **107** · Delhi-NCR / Air quality index · Moderately Polluted ·
> 1.1 times the limit · CPCB safe limit 100. **Limit broken.**
> CPCB continuous monitors, mean of 44 across Delhi.
> Observed 05:00 IST, 25 August 2026.

(The chip reads PERIODIC rather than LIVE because the observation is ten hours
old — see B-4. It returns to LIVE on its own the moment the feed catches up.)

The provenance line used to read *"CPCB continuous monitor, Anand Vihar"*. Under
a city mean that is the same mislabelling in a smaller font — a reader checking
Anand Vihar against CPCB would find 225, not the 107 above it. It now states the
count and the method.

At 107 Delhi is still over the limit, so the argument survives. Its magnitude
does not, and **"Limit broken" is no longer hardcoded** — it is conditional on
the reading, because a page that cannot print "within the limit" is not
reporting.

## A-42.8 · What this cost, stated plainly

Every air figure the site published between 21 August and 25 August 2026 was
roughly double. That includes the hero, /now/air, the intelligence index, the
national ranking, and the claim **"Delhi is first of 266"** — which was 26th.

The national table's top is now dominated by single-monitor cities (Panipat 198,
Leh 195, Faridabad 165). D-21.6's own caveat — *"a city with one monitor is
measured LESS, not better"* — stops being a footnote and becomes the thing the
reader has to know before reading the rank. It is now the first caveat in the
list, not the third.

## A-42.9 · Standing rule

> **Read the resource title before writing the parser.** This one said
> "Air Quality Index" on the tin for eleven weeks.

The cross-check tier that would have caught this on day one does not exist yet.
It is specified separately.

---

# AD-42B — Three more defects, found by asking why Leh was 195

The owner looked at the corrected national table and asked how Leh could read
195. It could not, and chasing it turned up a worse bug than the one the table
was built to fix.

## B-1 · The upstream's paging was eating rows, silently

`fetch-india.mjs` paged the all-India resource at `limit=1000`. Measured
25 August 2026:

```
limit=1000   collected 3,451   total 3,451   DISTINCT 3,386   -> 65 rows LOST
limit=2000   collected 3,451   total 3,451   DISTINCT 3,451   -> clean
limit=4000   collected 3,451   total 3,451   DISTINCT 3,451   -> clean
```

The result set is not stably ordered, so `offset` does not mean what it looks
like it means. Sixty-five rows arrived twice; sixty-five never arrived.

**The existing integrity check could not see it.** It compared
`rows.length` to `total`, and both were 3,451. Counting rows cannot detect a
duplicate standing in for a loss. The check is now on **distinct
`(station, pollutant)` keys**, and the job refuses to write rather than
publish a partial snapshot.

**What it did to Leh.** The paged fetch returned four of Leh's seven channels —
PM10, OZONE and NO2 were lost. The station published as **13, "Good"**, on the
PM2.5 that survived, while a city-filtered query for the same station in the
same second returned all seven and an AQI of **195**.

> **A lost row does not publish a missing reading. It publishes a wrong one.**

That is why this refuses rather than warns. Four consecutive runs after the fix
returned identical output.

## B-2 · A flatlined channel is a stuck instrument

251 of 3,170 rows (7.9%) report `min === max === avg` over a 24-hour window —
overwhelmingly the gas analysers (NH3 114, OZONE 46, NO2 36, CO 27). Air does
not do that; a stopped sensor does.

**Nine stations were taking their entire AQI from one of them.** Mahape, Navi
Mumbai was ranked on a CO channel frozen at exactly 101; its live channels put
it at PM10 67 — Satisfactory, not Moderate. Three stations report *nothing but*
frozen numbers, including Shivaji Nagar, Rishikesh, which is its city's only
monitor and was publishing a dead sensor's "37, Good" into that city's average.

Flatlined channels are now dropped. A station with no live channel has no
reading — not a zero, and not a clean bill of health.

## B-3 · Leh itself: flagged, not deleted

With the paging fixed, Leh reads 195 again, and that is genuinely what CPCB
publishes (its own ticker read Leh 188 the same afternoon). It rests on a single
ozone channel — sub-index 195, implying 164.6 µg/m³ 8-hourly — beside a PM2.5 of
13 and a PM10 of 23, among the cleanest particulates in India, with CO flatlined
and NO2 and NH3 absent.

**We did not delete it.** High-altitude ozone is real: stratospheric intrusion
and weak NOx titration genuinely lift surface ozone at 3,500m. We can show that
the reading stands alone; we cannot show it false. Deleting a government figure
we merely mistrust would be this site doing the thing it exists to complain
about.

So the row is published with the doubt attached, and the panel now **names the
governing pollutant whenever it is not particulate**. Leh reads
`195 ? · 1 station · O₃`, against Panipat's `198 · 1 station`. A rank is not
comparable unless the reader can see what is being ranked.

Only four of 493 stations show this signature. It is a narrow defect that
happened to land at number two.

## B-4 · The LIVE chip was lying by ten hours

At 15:22 IST the feed was still serving the **05:00 IST** observation — a
10.4-hour lag, while CPCB's own portal was current to 14:00. The chip read
`LIVE` regardless, because D-26.1 ruled the word names CPCB's publishing
cadence rather than this job's.

That defence assumed the cadence was real. A chip reading LIVE over a
ten-hour-old number is the same species of error as the one AD-42 corrected: a
label that does not describe the figure beside it. The label now **downgrades
to PERIODIC when the observation is older than three hours**, computed by
converting the IST wall-clock stamp to a real instant (`Date.UTC(...) −
5.5h`) so the comparison survives a CI box running UTC.

## B-5 · Not done: CPCB's own minimum-pollutant rule

CPCB requires **three pollutants, at least one particulate**, for a valid AQI.
Applying it would drop 36 of 488 stations and remove **22 cities entirely** from
the national table.

It is not applied, because CPCB does not apply it either — Pali publishes at 149
from two gas channels — and enforcing it would break the property that makes
this whole correction checkable: that our numbers reproduce CPCB's. Adopting it
means deliberately diverging from the source we cite, which is the owner's call
and not a bug fix.

## B-6 · Standing rule

> **An integrity check that counts rows cannot detect a lost row.** Check
> distinct keys, and refuse rather than warn — a partial snapshot publishes
> wrong readings, not missing ones.

---

# AD-42C — The headline goes back to the worst monitor, and this time it says so

**25 August 2026, later the same day.** Reverses **A-42.3** and the city-mean
half of **AD-42B**. Raised by the owner, on seeing the corrected page:
*"It shouldn't do the average, it should have the data of worst aqi station
reading out of 44. And yet it shouldn't be 381 as before."*

## C-1 · Two corrections arrived together; only one is reversed

AD-42 fixed two separate things in one pass, and the distinction is the whole
of this ruling:

| | AD-42 changed | AD-42C |
|---|---|---|
| **The arithmetic** — feed carries sub-indexes, not µg/m³ | doubled → read directly | **kept** |
| **The selection** — which station is the headline | worst monitor → mean of 44 | **reversed** |

The arithmetic fix is why the worst monitor now reads **183** and not 381. The
selection is the owner's call and has gone back.

## C-2 · Why the mean lost, having just won

A-42.3 argued the mean because it is what CPCB publishes as "Delhi", and it
proved it: across 73 cities the mean scored MAE 9.1 at ratio 1.00 where
worst-station scored MAE 21.1 at +15.7 bias. That evidence is not disputed and
is not deleted.

It answers the wrong question. It establishes which number best **reproduces
CPCB**. This site does not exist to reproduce CPCB — it exists to record limits
being broken at named places, and the mean is precisely the operation that
averages away the place where the limit is broken worst. On 25 August at 17:00
IST the mean says Delhi is 103 and marginal; Anand Vihar says 183 and is nearly
twice the limit. Both are true. Only one of them is about anything.

## C-3 · The mislabelling is fixed by the LABEL, not by the number

A-42.3's second argument was sound and survives: a single monitor's number
printed under the word "Delhi" is a lie about what was measured, and it is a
lie in a smaller font when the provenance line names the station as though it
were merely where we happen to measure.

So the number is the worst monitor and **every printed instance says which**:

> Live **183** · Delhi-NCR / Air quality index · Moderately Polluted ·
> 1.8 times the limit · CPCB safe limit 100. **Limit broken.**
> **worst of 44 CPCB monitors — Anand Vihar, DPCC.**
> Observed 17:00 IST, 25 August 2026.

`scope: 'worst-monitor'` is on the reading in the JSON and in `/api/air`, the
station name and `selectedFrom` travel with the figure, and `worstStation()`
returns a **Station rather than an integer** — deliberately, so no caller can
print the number without having the name to hand.

## C-4 · The mean is kept as the tripwire

`city_mean` is computed, published in the data, and **not led with**. It is the
cheapest possible check that the double conversion has not come back: read
correctly it tracks CPCB's own city figure at ratio 1.00, so a sudden
divergence means the parser has drifted again. `/api/air` returns it as
`cityMean`; the method table on /now/air prints it beside ours.

> **The number the page argues from and the number that proves the parser is
> honest do not have to be the same number.**

## C-5 · The national table follows, and states what it costs

`fetch-india.mjs` now ranks each city by its **worst monitor**, because the
hero prints Delhi's worst monitor and a table underneath it ranking Delhi by a
different statistic would contradict it on one screen — the exact defect D-21.6
was written to stop.

**This is not CPCB's city definition and the table says so**, in `method` and in
the caveat list: these figures sit about 25% above CPCB's published city
figures, and `meanAqi` is carried on every row so the comparable number is one
field away.

**The single-monitor caveat inverts and had to be rewritten.** Under a mean, a
one-monitor city was "measured LESS". Under a worst-of, a city with 44 monitors
has 44 chances to produce a high one and a city with one has one — so a
well-monitored city now ranks **worse**, not better. The caveat says that.

At 17:00 IST Delhi is **2nd of 268** behind Leh's flagged single ozone channel.

## C-6 · Replay, so a selection change can be judged at a fixed hour

Both fetch jobs take `AIR_FIXTURE`, a captured response from the same resource.
A change to *how the reading is selected* cannot be reviewed while the feed
advances underneath it — the before and after would differ for two reasons at
once. Nothing is faked: the rows are CPCB's and their stamp says which hour.
The daily job sets no such variable.

It also happens to be the only way to re-run these jobs from a network that
cannot hold a connection to `data.gov.in` inside the 12-second timeout.

## C-7 · Footnote: the feed caught up

B-4 recorded a 10.4-hour lag with the chip forced to PERIODIC. By 17:45 IST the
feed was serving the 17:00 observation, 0.7h old, and the chip returned to LIVE
on its own — which is the behaviour B-4 specified, observed working.

## C-8 · Standing rule

> **A number is only as honest as the noun next to it.** The worst monitor is a
> fact; "Delhi's AQI" is a different fact. Publishing either is fine.
> Publishing one under the other's name is the bug, and it does not stop being
> the bug when the arithmetic is right.
