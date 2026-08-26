# AD-45 — The egress relay: the fetch runs wherever connectivity happens to be

**26 August 2026.** Extends **AD-44** (CAAQMS live source) and the transport
ladder of `scripts/lib/fetch-cpcb.mjs`. Raised by the owner's standing mandate:
*"the job of the API is to pull data without a laptop being on; real-time AQI
without errors."*

---

## A-45.1 · The problem is the NETWORK now, not the protocol

Every transport fix so far solved a protocol problem: undici's 10-second
connect default, the AAAA/ENODATA stall, the cross-signed eMudhra chain. On
26 August 2026 a different class of failure arrived — raw TCP to the sources
died, and it died differently from every egress point. Measured the same
afternoon:

| egress | airquality.cpcb.gov.in (CAAQMS live XML) | api.data.gov.in (mirror JSON) | cpcb.nic.in (bulletin PDF) |
|---|---|---|---|
| the maintainer's Mac (Indian ISP) | ✅ curl / pinned node:https (plain fetch fails the TLS chain) | ✅ curl -4 (node fetch stalls) | ✅ |
| GitHub runners (Azure) | ❌ TCP dropped, 6/6 across two probes 15 min apart | ❌ TCP dropped 6/6 — **NEW mid-afternoon; it had served every hourly run for days** | ✅ (~1s) |
| Vercel iad1 | ❌ ("timed out") | ✅ | untested |
| Vercel bom1 (our region) | ❌ 9s+ silence | ✅ **serving /api/air in the same minutes** | untested |

Two facts in that table outrank the rest:

1. **The matrix changes over time.** The mirror served the runners for days
   and died mid-afternoon. Any design keyed to *today's* matrix is wrong by
   construction; the design target is the volatility itself.
2. **At every moment measured, SOMETHING could reach each host.** The failure
   was never "the source is down"; it was always "the source is down *from
   here*." That is a routing problem, and routing problems have a routing
   answer.

## A-45.2 · The relay: `GET /api/relay?src=<name>` on our own deployment

The transport ladder gets a third rung: when direct fetch and curl both fail,
the fetch is relayed through `https://swechha.in/api/relay` — this site's own
Vercel function, running in Mumbai next to the sources (and next to the
readers, per A-44.12). The scripts borrow the deployment's egress instead of
needing a laptop to be on.

- **Auth**: `Authorization: Bearer <AIR_RELAY_TOKEN>`, compared in constant
  time over SHA-256 digests. No token — *including the unset-env case* — is a
  401: a misdeployed relay fails CLOSED, never open.
- **Whitelist, not URLs**: callers name a source — `src=caaqms`,
  `src=mirror&city=…&limit=…&offset=…`, `src=mirror-all&…`, `src=bulletin` —
  and the upstream URL is constructed server-side from constants
  (`lib/relay.ts`). The mirror's city/limit/offset are validated to the
  character before they touch a URL. There is no code path from caller input
  to an arbitrary host, which is the difference between a relay and an open
  proxy.
- **The key never crosses the boundary**: the relay splices Vercel's own
  `DATA_GOV_IN_KEY` into the mirror URL; the caller neither sends a key nor
  gets one back (error text is scrubbed — verified in the end-to-end run).
- **caaqms rides the CA-pinned rung** (`caFetchText`, A-44.11's fix) first,
  plain fetch second; the mirror and bulletin ride plain fetch, which is what
  bom1 was measured doing successfully while the runners were being dropped.
- `dynamic = 'force-dynamic'`, `Cache-Control: no-store`, `maxDuration 60`,
  `preferredRegion 'bom1'`.

## A-45.3 · `x-relay-upstream-status` is the whole contract

The exit-75/exit-1 split — *"the source was silent"* vs *"the source answered
and the answer was wrong"* — must survive the extra hop, and one header
carries it: the relay sets `x-relay-upstream-status` **if and only if the
upstream actually answered**, and then the relayed status and body are the
upstream's own. A response *without* the header is the relay itself speaking —
a 401, an edge error, a 404 — and the calling rung throws it as a failed rung,
never resolves it as an answer.

> **Exit 75 now means: direct fetch AND curl AND the relay were all silent.**

## A-45.4 · The deploy-order trap, stated so nobody re-trips it

The relay route exists in production only AFTER the branch adding it merges
and deploys — **but PR CI runs BEFORE**. Nothing in CI may depend on the relay
answering. The ladder treats relay-404/relay-unreachable as one more failed
rung (A-45.3's header rule is what makes a 404 land on the *silent* side of
the split, not the *answered-wrongly* side), and `lib/fetch-relay.test.ts`
pins exactly that case. Getting it wrong would have turned every pre-deploy
CI run red with exit 1 for a route that could not possibly exist yet.

The same rule covers the future day Vercel itself is what is down.

## A-45.5 · Test seams, and the end-to-end proof

`AIR_RELAY_ORIGIN` points the rung at a local `next start`;
`AIR_FORCE_RELAY=1` disables the first two rungs. Run against a local
production build on this Mac, 26 August 2026 (~14:20 IST):

- no token → 401; wrong token → 401; `src=<a URL>` → 400. ✅
- `src=caaqms` + token → **378,678 bytes of real CAAQMS XML in 83ms** via the
  CA-pinned rung, `x-relay-upstream-status: 200`. ✅
- `src=bulletin` → the day's real PDF (317,797 bytes, `%PDF-`, 0.34s). ✅
- `src=mirror&city=Delhi` → 502 *without* the upstream header — this Mac's
  own documented undici stall to api.data.gov.in, arriving exactly as a
  failed rung should, with no key in the error text. (The same code path is
  what bom1 runs successfully in production.) ✅
- `AIR_FORCE_RELAY=1 AIR_RELAY_ORIGIN=http://localhost:3210` then completed
  **real runs of `fetch-air.mjs`, `fetch-india.mjs` and
  `verify-air-crosscheck.mjs` purely through the relay**: CAAQMS 506 stations,
  integrity 0/478 disagreeing, Delhi headline 178 (Anand Vihar, PM10,
  observed 14:00 IST, chip LIVE); bulletin gate 245 cities matched, mean
  ratio 1.00. ✅

The workflows (`air-hourly.yml`, `data-refresh.yml`, `ward-alerts.yml`) pass
`AIR_RELAY_TOKEN` into their fetch steps; the token is already set in Vercel
prod+preview and in the Actions secrets.

## A-45.6 · The app.cpcbccr.com trap — record it before someone "finds" it

`app.cpcbccr.com` looks like a CPCB host and is not a CPCB data source:
verified 26 August 2026, its responses carry `generationtime_ms` and `us_aqi`
— it is serving **Open-Meteo MODEL output on the US-AQI scale**, not CAAQMS
measurements on CPCB's. Either property alone disqualifies it (a model is not
a monitor; the scales do not reconcile — the same reason WAQI is adjudication
only, never a reading source). **Never wire it in.** The repo carries zero
references to it today; keep it that way.

## A-45.7 · The fresh audit — every finding, with a verdict

The owner's mandate asked for a thorough check from the start. Every fetch
site, gate, and exit path on the air pipeline was re-read; findings:

1. **`fetch-yamuna.mjs`'s document watch was the one raw `fetch()` left on an
   Indian-government host** (the cpcb.gov.in source PDF) — every other CPCB
   fetch in scripts/ already rode `fetchUpstream`. **FIXED**: it now rides the
   ladder too (with its User-Agent; non-secret headers only — they sit on
   curl's argv). Its failure mode is unchanged: recorded in the output, never
   a job failure.
2. **`watch-documents.mjs` also raw-fetches cpcb.gov.in/ncrb.gov.in** —
   **NOT A DEFECT**: a manual diagnostic run by a human on this Mac (in no
   workflow), and it degrades gracefully. Recorded so the next audit does not
   re-litigate it.
3. **AD-42E's E-4 branch was DEAD CODE, and gas-only stations were published
   unflagged.** Suspicion required a particulate to compare against
   (`pmSub >= 0 && pmSub < worst/2`), so a station reporting *no particulate
   at all* could never be suspect — yet E-4 rules those "keep the gas figure
   and stay flagged", and the `else if (c.suspect)` branch written for them
   was unreachable. **FIXED** in `fetch-india.mjs`: a gas over the limit with
   nothing at the station to corroborate it is also suspect, with a reason
   that says exactly that. First live effect, same afternoon: Dhanbad
   (NO2 107, no particulate) now carries the flag, and tier 2 correctly
   adjudicated it (NO COVERAGE — the honest verdict).
4. **AD-42E had no test at all.** The rule lives in a top-level script, so it
   is now pinned through the script's own `AIR_FIXTURE` replay seam:
   `lib/fetch-india.replay.test.ts` runs the whole script against a
   **labelled synthetic** fixture (the measured Leh shapes, arranged into the
   three city cases) and asserts E-1/E-2/E-3/E-4 and the stuck-drop together.
5. **Leh-class defenses, coverage check**: `isStuck` (2% relative) was
   pinned; **added** the all-channels-*near*-stuck station (only the
   all-frozen case existed) and the all-NA station (no reading, never a
   zero). The CAAQMS integrity gate was pinned including Chittoor's empty
   `Value=""`; **added** the CPCB-scored-but-all-NA station (non-comparable,
   not a mismatch — one feed hiccup must not eat the 2% budget). The WAQI
   25km guard and the bulletin 0.85–1.15 gate live in
   `verify-air-crosscheck.mjs`, a top-level script with no import seam —
   verified by inspection and by today's live run (245 cities, ratio 1.00);
   unit-testing them means a main()-guard refactor, deliberately not done in
   this change. **ACCEPTED GAP**, stated.
6. **The chip logic is NOT broken — verified, not fixed.** The chip is a
   build artefact (`state_label`); the client block *stands down* when the
   build already wrote `live`, so no stale route answer can downgrade a
   correct LIVE chip — the downgrade path does not exist. The upgrade fires
   only when the route confirms the exact committed figure from an
   observation under two hours old and not in the future. The homepage runs
   the same three conditions on the same route.
7. **`data-refresh.yml` collapsed the crosscheck's two failure codes.**
   `verify-air-crosscheck.mjs` is careful to exit 1 (*gate ran, figures
   disagree — our bug*) vs 2 (*gate could not run* — bulletin unreachable, or
   the PDF layout changed); the workflow step treated both as the same hard
   failure, so a day the bulletin host is unreachable from the runners (the
   exact volatility of A-45.1) would block **every** dataset's commit.
   **FIXED**: exit 1 still hard-fails everything; exit 2 now reverts the two
   air files (together or not at all — a gate that cannot run must not
   silently pass, so unverified air never lands) and lets the other thirty
   datasets commit, with the miss surfaced by name in the final report step.
8. **`ward-alerts` — AD-44 verified intact**: no forward `subIndex()`
   anywhere (the function stays deleted), the fold matches `lib/air.ts`, and
   its exit 75 flows through `ward-alerts.yml` as a green skip. **NOT A
   DEFECT.** It now also carries the relay rung via the shared transport.
9. **The frozen-totals tripwire in `build-situation-air.mjs` fired on a live
   coincidence.** It hunts the *retired constants* "266 cities / 502
   stations / 87 above" in the rendered page — and on 26 August the feed
   genuinely carried 502 stations again, so the gate refused a page for
   printing a true, freshly-read figure. The `of 266 cities` pattern already
   had a never-match escape for exactly this; the 502 and 87 patterns did
   not. **FIXED**: all patterns now stand down when the live total equals the
   retired constant.

## A-45.8 · Standing rules

> **Design for egress volatility, never for today's matrix.** Every rung —
> direct fetch, curl, the relay — is an ordinary fallback; no rung is
> load-bearing alone, and reachability measured today is not an architecture.

> **The relay serves NAMES, never URLs.** The whitelist lives on both sides
> of the boundary (`lib/relay.ts` and `relayQueryFor`), the key stays on the
> Vercel side, and an unset token is a 401. The day this endpoint accepts a
> caller-supplied URL it is an open proxy with our name on it.

> **A relay response is an upstream answer only when
> `x-relay-upstream-status` says so.** Everything else is a failed rung, on
> the *silent* side of the 75/1 split.

> **app.cpcbccr.com is model output in CPCB clothing.** Open-Meteo, US-AQI
> scale. Never a source, never a cross-check.
