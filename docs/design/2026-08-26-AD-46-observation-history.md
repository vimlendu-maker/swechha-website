# AD-46 — The observation history: two clocks, one store, no duplicates

**26 August 2026.** Raised by the owner's brief, verbatim intent: poll CPCB
every 15 minutes; never assume a poll returns a new reading; for every AQI
record keep CPCB's **observation timestamp** and Swechha's **fetch timestamp**
apart and never confused (*"AQI: 183 / Source observation: 5:00 PM / Last
checked by Swechha: 5:15 PM"*); keep a **time-series of genuine CPCB
observations** for trends, charts, daily comparisons, records, episodes and
storytelling; and avoid duplicate records caused by the polling cycle.

Builds on AD-42 (sub-indexes, never concentrations), AD-44 (CAAQMS live
source, mirror fallback) and AD-45/45B (egress relay; the clock only moves
forward). Nothing in those is reopened.

---

## A-46.1 · THE TWO-CLOCK RULE, made standing

Every air record carries two timestamps, and they are different facts:

| clock | whose | format | meaning |
|---|---|---|---|
| `cpcb_observed_ist` / `obs` | CPCB's | IST wall-clock TEXT, `DD-MM-YYYY HH:MM:SS`, exactly as published, never converted, never `new Date(string)` | when the AIR was measured |
| `swechha_checked_utc` / `last_checked` | ours | UTC ISO 8601 | when WE ASKED CPCB |

The formats are the fence: an IST stamp can never satisfy a UTC-ISO check and
vice versa, and `lib/air-history.test.ts` has a case that fails if either
clock is ever written in the other's format. The store's `recordObservation`
*refuses* a UTC ISO string in the `obs` field outright.

`data/air-delhi.json` and `data/air-india.json` keep their existing
`observed` / `fetched` keys untouched (every consumer greps clean), and add a
self-documenting `time` block: `cpcb_observed_ist`, `cpcb_observed_parts`,
`swechha_checked_utc`, `swechha_first_saw_utc` (when this observation was
FIRST seen — carried forward across polls that re-see the same hour),
`observation_age_minutes_at_check`, and a `note` stating the rule in prose.
`/api/air` reports the same pair per request — and there `swechha_checked_utc`
is genuinely per-request, because the route fetches CPCB at request time.

## A-46.2 · The cadence: every 15 minutes, offset off the hour

`air-hourly.yml` (the FILE keeps its name — dispatch scripts and session
history reference it) now runs at UTC `:04/:19/:34/:49` = IST
`:34/:49/:04/:19`. CPCB publishes each top-of-hour observation 15–35 minutes
late (measured 26 August: 12:00 appeared ~12:30 IST, 14:00 by ~14:35, 16:00
by ~16:30), so the IST `:34` slot catches the common ~`:30` publish almost
immediately and nothing waits more than ~15 minutes past its own publication.
Most polls find an observation already held — by design, and the store treats
them as checks, not data (A-46.4).

## A-46.3 · "Last checked" on the page, and the heartbeat that keeps it honest

The hero and `/now/air` now print both clocks:
`Observed 17:00 IST, 26 August 2026 · last checked 17:22 IST` (the situation
page adds one sentence saying WHY the two differ). The honesty constraint: the
pages are build artefacts and a poll that finds nothing new normally commits
nothing, so the committed "last checked" is *the last check that produced this
page*. Two consequences, both implemented:

1. **Wording** — "last checked", never "as of now"; the situation page states
   the two-clock distinction in the same sentence.
2. **The heartbeat** — when the figure did NOT move but the last air commit is
   older than 60 minutes, the run commits anyway, purely to refresh the check
   timestamps (and the store's `checks`). **Churn bound:** at most ~1
   commit/hour while the air is static (four polls an hour; three stop at the
   gate), zero extra while the figure moves hourly as usual, and a silent
   upstream (exit 75) never heartbeats — nothing was checked, so there is
   nothing to refresh.

A corollary stated plainly: `checks`/`last_checked` in the *committed* store
count only the checks that survived to a commit. A no-op run's increment
evaporates with the ephemeral runner; the heartbeat bounds that loss at ~1
hour. This is inherent to git-as-store with commit gating, and it is the
right trade — the alternative is a commit per poll, 96/day, for bookkeeping.

## A-46.4 · The store: `data/air-history/`, NDJSON, monthly, dedup by stamp

`scripts/lib/air-history.mjs`, called by BOTH fetch scripts after every
successful fetch — including runs the AD-45B monotonicity guard refuses to
write into the current-state file (an older observation off the laggy mirror
is still real data about that older hour), which is why the history write
sits BEFORE the guard's exit.

**Why NDJSON in git and not a database.** Production has no database for this
(verified: no DATABASE_URL in the Vercel env) and the whole architecture is
committed artefacts. One JSON object per line: an append never rewrites
history, a diff is one readable line, git supplies provenance (every record's
arrival is a signed commit), and the report CLI needs zero dependencies.

**Dedup is by CPCB's observation stamp** — the natural key, per file:

- new stamp → **append** (O(1) `appendFileSync` in the common newest-last case);
- same stamp, same values (the common 15-minute case) → **touch**: update
  `last_checked`, increment `checks`, never a duplicate line;
- same stamp, **different values** → CPCB revised the hour: the record is
  updated in place, `revised` increments, and `revisions[]` records
  `{at, from}` with a compact before-image. Not silent, not duplicated,
  tested — and observed for real: the backfill caught CPCB revising the
  26-08-2026 02:00 hour between two commits (governing PM2.5, mean 88→
  later values), recorded as `revised: 1`.
- `source` is metadata, not a value: the same observation arriving later via
  the mirror is a touch, not a revision, and the first sighting's source stands.

**Durability.** Files are sorted by observation time (field-wise stamp
comparison, never Date). Rewrites go through temp-file + rename. A malformed
trailing line (crash mid-append) is logged, dropped and healed on the next
write — and a file not ending in a newline forces the rewrite path so an
append can never glue onto a broken line (found by the test suite, fixed
before it shipped). The store can never crash the fetch: every failure is a
warning, because the current-state files outrank it.

## A-46.5 · Record shape and measured size

Delhi (`delhi-YYYY-MM.ndjson`) — per-station AQI + governing pollutant, no
per-station pollutant breakdown (episodes and records are answerable; the full
breakdown would roughly 10x the record for questions nothing asks yet):

```
{"obs":"26-08-2026 17:00:00","first_seen":"...Z","last_checked":"...Z","checks":2,
 "source":"caaqms","city":{"aqi":187,"band":"Moderately Polluted","governing":"PM10",
 "station":"Anand Vihar, Delhi - DPCC"},"mean":96,"above_limit":18,
 "stations":[{"s":"Anand Vihar, Delhi - DPCC","a":187,"g":"PM10"}, ...44 rows]}
```

India (`india-YYYY-MM.ndjson`) — city-level only, **columnar**: keyed objects
measured 20,166 bytes/record (~170MB/year), so rows ride under a named `cols`
header. Nothing is lost: `rank` is the row's position (the list is stored
ranked) and `band` is a pure function of `aqi` via CPCB's published bands.

```
{"obs":"...","first_seen":"...","last_checked":"...","checks":1,"source":"caaqms",
 "cols":["city","aqi","governing","stations","meanAqi"],
 "cities":[["Delhi",187,"PM10",13,96], ...265 rows]}
```

**Measured, 26 August 2026:** Delhi 2,703 bytes/record; India 7,713
bytes/record. At CPCB's hourly cadence (8,760 observations/year): Delhi
~23MB/year (~2MB/month/file), India ~66MB/year (~5.5MB/month/file). Manageable
for git at monthly partitions; if India's growth ever matters, the honest
lever is dropping `meanAqi`/`governing` from the national rows, not sampling.

## A-46.6 · Dedup, proven for real

`node scripts/fetch-air.mjs` run twice in a row against the live feed
(26 August 2026, observation 17:00 IST):

```
run 1: history: appended 26-08-2026 17:00:00 in data/air-history/delhi-2026-08.ndjson
run 2: history: touched  26-08-2026 17:00:00 in data/air-history/delhi-2026-08.ndjson
store: 1 line; checks=2; first_seen=2026-08-26T11:52:45.873Z; last_checked=2026-08-26T11:52:55.902Z
```

One record, two checks, two distinct fetch timestamps, one observation.

## A-46.7 · Backfill: what was recovered, and from where

Backfilled from the git history of `data/air-delhi.json` /
`data/air-india.json` — real committed observations only, each check stamped
with its own commit time, **post-AD-42 commits only**: everything committed
before the sub-index correction (82eb30b, 25 August) carries the
double-converted figures, which are not faithful CPCB observations and were
skipped, deliberately. Recovered, both scopes:

| observation (IST) | commits | result |
|---|---|---|
| 25-08-2026 21:00 | b69eae4c | appended (Delhi 171) |
| 26-08-2026 02:00 | 67c34873, 9a09b8e2, 60bdb40c, 0d44cc97 | appended, then **revised** (CPCB re-published the hour with moved station values), then touched twice — checks=4 |
| 26-08-2026 15:00 | 20413d81 | appended (Delhi 181) |
| 26-08-2026 16:00 | b4260ad4 | appended (Delhi 183) |

Plus 17:00 live from this session's runs. Commits whose `served_by` predates
AD-44 were recorded as `mirror` (the only source that existed then). Nothing
was interpolated; the gaps (03:00–14:00 on 26 August, where the mirror lag
and the egress failures of AD-45 meant nothing was committed) are left as
gaps, because an absent observation is not a zero.

## A-46.8 · What future charts can and cannot ask of this data

CAN: 24-hour trends by IST hour; daily max/min with times; monthly records;
episode detection (consecutive hours above a band); which station governed
and how often; how many stations were over the limit per hour; national
city-rank history; how long CPCB sat on an hour (`first_seen` minus the
observation instant); how often CPCB revises (`revised`/`revisions`).

CANNOT: per-station pollutant breakdowns over time (not stored — only the
governing pollutant per station); sub-hourly movement (CPCB publishes hourly);
anything before 25 August 2026 21:00 IST (nothing faithful exists to backfill —
see A-46.7); and continuous coverage during source outages, which remain gaps
by design. `scripts/air-history-report.mjs` (read-only, dependency-free) is
the working proof and the seam charts build on.
