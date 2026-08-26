# AD-44 — CPCB's own live feed is the source. The mirror is the fallback.

**26 August 2026.** Extends **AD-42** (the sub-index correction) and **D-26.1**
(the earned label). Raised by the owner's standing mandate: real-time AQI data.

---

## A-44.1 · The mirror lags, and it was the only source we had

Every air figure on this site — the hero, `/now/air`, the national table, the
ward alerts, the LIVE route — came through data.gov.in resource `3b01bcb8`,
which is a **mirror** of CPCB's data, not CPCB's publication. Measured today:

| | observation being served | measured at |
|---|---|---|
| data.gov.in mirror | **02:00 IST** | 12:04 IST |
| CPCB's own CAAQMS feed | **12:00 IST** | 12:04 IST |

A ten-hour lag, on the one reading this site refreshes hourly. This is the
same lag AD-42's B-4 measured at ten hours on 25 August (05:00 served at
15:22) — it is the mirror's character, not a bad day. The consequences ran
through everything downstream: the chip read PERIODIC over an accurate page
because the observation was ten hours old, the hourly workflow burnt 24 runs a
day re-fetching a figure that moved twice, and the LIVE route could serve an
observation *older* than the committed page it exists to confirm — which
inverts the chip-confirm logic entirely.

## A-44.2 · CPCB's own feed: public, keyless, one hour old

    GET https://airquality.cpcb.gov.in/caaqms/rss_feed

XML, ~375KB, **501 stations** today, no key, no registration. One
`<Station>` block per monitor with `<Pollutant_Index id Min Max Avg>`
children and a `lastupdate` in the same `DD-MM-YYYY HH:MM:SS` the mirror
uses. All 501 stations carried the same 12:00 stamp at 12:11 IST.

## A-44.3 · Identical semantics, proven the AD-42 way

`Min`/`Max`/`Avg` are CPCB's 24-hour **sub-indexes** per pollutant — the same
values, under the same station names, that the mirror copies. NOT
concentrations. Anand Vihar, 12:00 IST today, feed vs the rule:

```
Avg sub-indexes   PM2.5 146   PM10 172   NO2 36   NH3 13   SO2 31   CO 119   O3 3
CPCB's own        <Air_Quality_Index Value="172" Predominant_Parameter="PM10"/>
```

172 = the worst Avg = CPCB's own published station AQI, to the unit. Extended
across the whole feed: of **478 stations** publishing a `Value` today, **zero**
disagreed with the worst-Avg rule by more than ±1 rounding.

> **NEVER convert these values.** `Avg` is the answer, not the input. Running
> it through the breakpoint table is the AD-42 double conversion — the bug
> that published doubled figures for eleven weeks.

## A-44.4 · The feed carries a tripwire the mirror never had

The mirror publishes the channels and leaves the station AQI to us. The feed
publishes **CPCB's own computed station AQI** beside the channels — which
means the pipeline can now check, per station per fetch, that its parse
agrees with the publisher's own arithmetic.

That is the new **per-station integrity gate**
(`scripts/lib/fetch-caaqms.mjs`'s `integrityCheck`, transcribed into
`lib/air.ts` as `caaqmsIntegrity`): our worst raw `Avg` vs CPCB's `Value`,
tolerance ±1 for their rounding; if more than **2%** of comparable stations
disagree by more, the parser has drifted and the CAAQMS data is **refused** —
the run falls back to the mirror and says why loudly. It is the station-level
sibling of the daily bulletin gate in `verify-air-crosscheck.mjs`, and it
would have caught AD-42 **instantly**: the test suite proves a doubled copy of
the committed fixture fails at 63 of 63 comparable stations.

Two subtleties, both load-bearing:

- **Raw maxima, before the stuck-drop.** We drop stuck channels (AD-42D);
  CPCB does not. Measured today, six stations nationally — Leh's frozen 188
  among them — take their raw maximum from a stuck channel and agree with
  CPCB's `Value` exactly, while our post-drop figure differs at all six. The
  gate compares raw maxima so it measures parser *fidelity*, never our
  *policy*.
- **An empty `Value=""` is skipped, not zero.** Chittoor published one today.
  An error is not a zero, at this level too.

## A-44.5 · The selection: CAAQMS first, gates, then the mirror

Every reader of this data (`fetch-air.mjs`, `fetch-india.mjs`,
`ward-alerts.mjs`, and `lib/air.ts`'s `fetchDelhiLive` for the `/api/air`
route) now tries CAAQMS first and trusts it only past its gates:

1. **≥300 stations** parsed nationally (the feed carried 501; 300 tolerates
   an outage without accepting a stub), **≥35 for Delhi** (it carried 44);
2. a parseable observation stamp;
3. the per-station integrity gate (A-44.4).

Any gate failing logs why and falls back to the data.gov.in path, which is
**fully intact** — replay via `AIR_FIXTURE` (which skips the CAAQMS attempt
entirely, so replays stay deterministic), paging integrity on distinct keys,
the backoff ladder, and the exit-75-vs-1 split. If both sources answer, the
**fresher stamp** serves, parsed by field, never by `new Date(string)` — in
practice CAAQMS always wins (it is the thing the mirror lags), and the
comparison is the safety net that stops an odd day from making the site less
current than it was before this change. `fetch-india.mjs` prices that net
honestly: a one-row probe of the mirror, escalating to the full set only if
the probe is strictly newer.

Exit codes keep their meaning: **75 only when both sources were silent**;
a CAAQMS refusal by the *integrity* gate with no mirror to step in exits 1,
because a drifted parser is this repository's own defect.

## A-44.6 · `served_by` — the output names what actually answered

`source.served_by` in `air-delhi.json`, `air-india.json` and the `/api/air`
response now records the source that served **that run**:

- `CPCB CAAQMS live feed (airquality.cpcb.gov.in/caaqms/rss_feed)`
- `data.gov.in mirror (resource 3b01bcb8)`

A mirror-served file also carries a `note` saying *why* it was the fallback
that run. Anything printing provenance must read it from the data rather than
asserting the mirror — the builders were grepped for hardcoded
"via data.gov.in" reading-source claims and carry none; historical and
design-doc mentions stand.

## A-44.7 · The TLS quirk, measured, and where curl is and is not

The CAAQMS server's chain includes a cross-signed eMudhra intermediate that
breaks Node/undici's certificate path-building — native `fetch()` fails with
*"self-signed certificate in certificate chain"* — while curl and system
openssl verify the same chain fine (the root is Comodo "AAA Certificate
Services"). So:

- **Scripts** fetch the feed through `fetchUpstream()`
  (`scripts/lib/fetch-cpcb.mjs`): native fetch first, curl -4 fallback. From
  the maintainer's Mac, curl carries it.
- **The Vercel route** has no curl. `fetchDelhiLive` wraps native fetch so
  that a TLS failure there is an **ordinary fallback to the mirror**, exactly
  the route's pre-AD-44 behaviour — never an error response. If Vercel's
  undici accepts the chain, the route is an hour old; if not, it is exactly
  as stale as it was before, and no worse.

## A-44.8 · What today's end-to-end run published

`served_by` CAAQMS, observed **12:00 IST, 26 August 2026**, fetched 12:30 —
0.5h old, chip **LIVE** — against the mirror's 02:00. Headline: worst monitor
Anand Vihar at 172 (Moderately Polluted, PM10), of 43 reporting; city mean 90.
Integrity gate: 478 compared, 0 disagreeing. The bulletin gate
(`verify-air-crosscheck.mjs`) passed at mean ratio **1.01** across 243
matched cities; Delhi's bulletin 101 vs our mean 90 is the freshness gap
between a 4PM-yesterday 24h average and a 12:00-today reading, inside the
0.85–1.15 gate.

## A-44.9 · Found while wiring: ward-alerts still had the AD-42 bug

AD-42 corrected `lib/air.ts`, `fetch-air.mjs` and `fetch-india.mjs` — and
missed `scripts/ward-alerts.mjs`, which was still running `avg_value` through
a forward `subIndex()`. Every band it compared, and every figure in every
alert it would have mailed, was computed on roughly doubled values: a station
CPCB had at ~150 would have alerted as "301, Very Poor". Fixed here the AD-42
way: the value is read directly, `subIndex()` and its breakpoint table are
**deleted rather than left unused**, and the station fold now matches
`lib/air.ts` (worst sub-index, stuck channels dropped) so an alert can never
name a figure the site itself refuses to publish.

`app/api/ward/route.ts` still reads the mirror only; its readings are
per-station lookups where the same correction already lives in `lib/air.ts`.
Wiring it to CAAQMS is a candidate follow-up, not part of this change.

## A-44.10 · Standing rules

> **The mirror is a FALLBACK, not a co-equal.** One run is served entirely by
> one source, named in `served_by`. The two are never averaged, interleaved,
> or mixed within a run — a number must always have exactly one provenance.

> **CAAQMS data is trusted only past its gates.** Station count, stamp, and
> the per-station integrity check against CPCB's own `<Air_Quality_Index>`.
> A gate failure is a fallback, never a patched-over parse.

> **The integrity gate compares RAW maxima, before the stuck-drop.** It
> measures whether we read what CPCB wrote, not whether our policy matches
> theirs. Moving it after the filter turns policy into false alarms.

> **The two parsers must not drift.** `scripts/lib/fetch-caaqms.mjs` and
> `lib/air.ts` transcribe the same parser across the .mjs/.ts boundary;
> `lib/caaqms.test.ts` pins both to the same committed fixture, row for row.
