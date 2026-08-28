# AD-47 — The Air pipeline, rebuilt to one owner

**28 August 2026.** Supersedes the arrangement of 27 August. Touches the AQI
pipeline only.

## What was wrong

The site had been showing **AQI 311, observed 05:00 IST 27 August** since
27 August 09:35 UTC — a 27-hour-old observation with an 18-hour-old "last
checked" clock — while CPCB was publishing a current hour the whole time. The
pipeline was not failing to fetch. It was **failing to publish, on every run
that succeeded.**

### A-47.1 — The outage: a decoupled fetch under a coupled build gate

The 27 August change set (`1145426`, `3dc6ec5`) decoupled Delhi's poll from the
national fetch, correctly, by switching the workflow from `npm run data:air` to
`npm run data:air:delhi`. `data-refresh.yml` had already been told that Air
belongs to `air-hourly.yml`. The result: **nothing anywhere invoked
`fetch-india.mjs`**, so `data/air-india.json` froze.

But `build-situation-air.mjs` still asserted that `air-delhi.json` and
`air-india.json` carry the *identical* observation stamp, because the page
claimed "all nine figures were read together". So every successful Delhi poll
advanced Delhi's hour, failed that assertion, refused to write, and turned the
run red:

```
AIR/IND HOUR: the hero reads 05:00 IST, 28 August 2026 and the national panel
reads 27-08-2026 05:00:00.
REFUSING TO WRITE: 1 extraction assertion(s) failed.
```

**Ruling.** The coupling comes out of the DATA and moves into the COPY. Delhi
is the 15-minute live leg; the national table is a larger, slower read on its
own leg whose failure can never hold Delhi back (requirement 8). The hero
prints Delhi's observation hour, the national panel prints the national
snapshot's hour, and when they differ the panel says so in words. Two honest
hours beat one hour asserted.

Still refused: either stamp missing or unparseable, or a national snapshot
older than **48 hours** under a heading reading "India, right now". Past that
no label rescues it.

### A-47.2 — A successful check that could not move the clock

The monotonicity guard added on 26 August (AD-45B) correctly refuses an
observation *older* than the one on disk — but it did so with
`process.exit(0)` **before** the write. So a genuinely successful check that
found a stale hour left `time.swechha_checked_utc` untouched, and the workflow
then found nothing staged after a run it had classified `success` and went red.

**Ruling.** A poll has more than two outcomes, and collapsing them is how the
pipeline lied in both directions. Every run now states which it was, in the
file, as `check.status`:

| status | reading moves | check clock moves | published |
|---|---|---|---|
| `new_observation` | yes | yes | yes |
| `same_observation` | no | **yes** | yes |
| `stale_refused` | no — last known good preserved | **yes** | yes, with the refusal recorded |
| exit 75 — no source answered | no | **no** | nothing written |
| exit 1 — a source answered wrongly | no | no | nothing written, run red |

Requirement 6 ("a successful check updates last-checked even when the
observation has not") and requirement 7 ("never dress a failed source as a
successful check") are the same rule seen from its two sides; the enum is what
keeps them apart. `stale_refused` writes the previous observation back
verbatim with a new check block naming what was refused and why — preserving
last known good *without* freezing the clock beside it, and without freezing it
silently.

### A-47.3 — The cross-check tier was built, then wired to nothing

`verify-air-crosscheck.mjs` (AD-42D) compares our `city_mean` against CPCB's
**own daily bulletin** across ~245 cities and trips outside 0.85–1.15. It is
the tier that would have caught the eleven-week double-conversion on day one —
that bug ran at ratio 2.00. `data-refresh.yml` handed Air validation to
`air-hourly.yml`; `air-hourly.yml` never called it. **The gate sat switched off
while the pipeline it guards broke twice.** `fetch-crosscheck.mjs` was orphaned
the same way, so `/now/air` was rendering a two-day-old "independent reading"
beside a live one.

**Ruling.** Both are wired into the publisher, on a **6-hour** due window
(the bulletin is published once a day and is a multi-MB PDF; running it on
every 15-minute poll would re-download the same document 96 times to re-derive
the same verdict). The verdict is stamped onto `data/air-delhi.json` beside the
reading it judges, and carried forward by the fetch in between **with its own
timestamp**, so a stale verdict cannot read as a fresh pass. Three states, and
the third is not a pass:

- `passed` — the gate ran and our figures agree with CPCB's own
- `failed` — they do not; **our** parser has drifted. Nothing publishes, the
  trusted reading stands, the run goes red
- `unavailable` — the gate could not run, with the reason. A check that did not
  happen, said plainly

Measured on wiring it in, 28 August: 240 cities matched, **ratio 1.003**,
MAE 15.0. Leh's WAQI adjudication correctly returned NO COVERAGE — nearest
independent monitor 300 km away, in Tibet.

### A-47.4 — Magnitude was never validated

Everything validated the *shape* of a value — is it a number, is the channel
stuck, did paging drop a row — and nothing validated its *magnitude*. CPCB's
index runs 0–500 and `bandFor` falls back to the last band above it, so a
sub-index of 4000 off one mis-parsed field would have become the worst monitor
in Delhi, banded "Severe", and gone out as the headline.

**Ruling.** Channels above 500 are dropped and recorded, exactly like a stuck
one. This is deliberately **not** a "large change = reject" rule: the bound is
CPCB's own published scale, not the previous reading, so a genuine 500 on a
genuinely severe day still publishes untouched. It runs *before* the AQI loop,
so AQI, governing pollutant, band and the `suspect` flag are all computed once
from clean channels.

### A-47.5 — Three schedulers, two of them on the service that was failing

Measured on this repository 26–28 August: GitHub's schedule service delivered
**five** scheduled events in forty-eight hours across seven scheduled
workflows, and none at all to the Air workflow for thirty-four hours. The
response to that had been `air-schedule-watchdog.yml` — a watchdog **on the
same scheduler it was backstopping**. It fired once in twenty-four hours.

**Ruling.** The watchdog is deleted. Two triggers remain, with separated roles:
the GitHub cron as a cheap best-effort rung, and the Vercel cron
(`vercel.json` → `/api/cron/air`) as the heartbeat, because it is the only one
that does not depend on GitHub's scheduler. Both dispatch the one workflow;
`/api/cron/air` skips when a run started in the last 12 minutes.

### A-47.6 — Two latent failures the outage was hiding

- The commit step staged `data/air-history.ndjson`, **a path that has never
  existed** — AD-46 stores history in the *directory* `data/air-history/`.
  Under `set -e` that is `git add` exiting 128 on every run. The publisher was
  one gate-fix away from failing on every run instead. Now it stages trees, not
  hand-named files, and a test asserts every staged path exists.
- The publisher committed and then `git rebase origin/main`, replaying a commit
  touching two generated HTML files and a dataset onto a moved branch. That
  conflicts every time; the logs show three attempts then exit 1. **Generated
  artefacts are regenerated, not rebased** — a lost push now resets to the new
  main and runs the whole cycle again, which also picks up a fresher CPCB hour.
- The workflow rebuilt 2 of the 11 generators while `generated-current.yml`
  re-runs all 11 and fails if the tree moves, leaving that gate primed to fail
  on the next pull request anyone opened. It now rebuilds all of them.

### A-47.7 — A test that asserted prose

`lib/air-history.test.ts` asserted the workflow *contained a step title*. A
rename in the GitHub web UI turned `main` red for a rename, while saying
nothing about the `data/air-history.ndjson` defect three lines below it. It now
asserts behaviour: every staged path exists, exit 75 and exit 1 stay apart, the
national fetch cannot fail the run, no rebase, and no second workflow fetches
or dispatches Air.

## Source hierarchy, restated on measurement

| Source | Role | Measured 28 August |
|---|---|---|
| CPCB CAAQMS `airquality.cpcb.gov.in` | Primary | **Unreachable from GitHub runners (3/3 TCP refusals) and from Vercel bom1.** Reachable from an Indian residential connection, where it served an 0.3h-old observation. |
| data.gov.in mirror | Fallback | The only source that has served CI since 26 August. Lags 4–10 hours. |
| CPCB daily bulletin `cpcb.nic.in` | Cross-check gate | Reachable from runners. 248 cities parsed. |
| WAQI | Adjudication of suspect stations only, never a gate | US EPA scale; distance-guarded at 25 km |

The primary/fallback ladder is unchanged and correct; what changed is that the
job no longer *depends* on the primary being reachable, and `served_by` on
every record says which one actually answered.

## Not changed

`isStuck`'s relative 2%-of-channel test, the gas-above-clean-particulates
`suspect` flag, the CAAQMS per-station integrity gate, the transport ladder,
the worst-monitor headline (AD-42C), the two-clock discipline (AD-46), and the
rule that nothing on the page repaints a reading (AD-27.6-A).
