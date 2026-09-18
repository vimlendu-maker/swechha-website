# Umami — reading the analytics this site already collects

What `scripts/umami.mjs` does, what it deliberately does not do, the parameter
contract as **measured against the live instance** rather than read off a doc
page, and the one setup step that needs the owner.

Companion to `docs/SEARCH-CONSOLE-API.md`, which does the same job for Google.
The design this implements is `docs/superpowers/specs/2026-08-24-analytics-design.md`
§6, Phase 3 — its **collection** half only.

---

## The gap this closes

Umami has been collecting since **26 August 2026**. The tracker is on all 149
built pages and `verify-seo.mjs` fails the build if it is missing from one. The
collection side has been solid for three weeks.

There was no read side at all. Search Console has a committed, appended
baseline in `data/seo/search-performance.json` going back to the first pull;
first-party analytics had **no file, no history, and no figure anybody could
quote without opening a browser and trusting their memory of it.** That
asymmetry is the whole reason this script exists.

---

## What it does

```bash
npm run analytics:check        # does the credential work, and does the id resolve
npm run analytics:pull         # append a 28-day snapshot to data/analytics/audience.json
npm run analytics:pull:dry     # read and print everything, write nothing
```

or directly:

```bash
node scripts/umami.mjs --check
node scripts/umami.mjs --pull [--days 28] [--dry-run]
```

`.github/workflows/umami.yml` runs `--pull` **Tuesdays at 06:10 UTC** and
commits the snapshot.

### `--dry-run` still fetches

It suppresses the **write** and nothing else. `search-console.mjs`'s
`--dry-run` returns before its first request, which means there is no way to
look at a fresh figure there without committing a snapshot — the safe option is
useless for the exact question people reach for it with. Reading is not the
side effect worth guarding against; writing a file into git history is.

---

## What it deliberately does not do

**It publishes nothing.** No figure reaches `/impact`, `/record` or any page.
The spec puts publication last on purpose:

> **Deliberately last.** Which figures are honest to publish is a question to
> settle against real traffic, not against a guess.

That decision is now one that can be made against a year of evidence instead
of a dashboard screenshot. Making it is a separate change.

---

## Why it appends, and why that is a different reason than the Google one

`search-performance.json` appends because **Google revises its own figures for
days after the fact**. Umami does not revise — an event is written once and
stays.

This file appends because of the failure mode the spec names in §3.4: the
analytics database is on a free tier whose documented behaviour is that it
**suspends compute at the cap**. So the risk being managed is *a silent gap in
the data* — and **a week that was never collected looks exactly like a week
nobody visited.** For ever. Nothing announces it.

Every snapshot therefore carries its **day-by-day series**, with every date in
the window present even when Umami returned no bucket for it, and the script
flags any **zero day with traffic on both sides of it**. That is the one shape
a quiet site does not produce. It is recorded as `suspected_collection_gaps`
and stated as a suspicion: only Neon's own console can confirm it.

Edge days of the window are never flagged — the window ends on an hour, not at
midnight IST, so its first and last days are partial and a zero there is
ordinary. A warning that fires on most runs stops being read.

---

## The parameter contract, measured

Established **18 September 2026** against `https://analytics.swechha.in`
unauthenticated, which is enough to see the validator run before the auth
check:

| Request | Response |
|---|---|
| `GET /api/websites/<id>/stats` | `400` — *"Either startAt+endAt or startDate+endDate must be provided"* |
| `GET /api/websites/<id>/metrics` | `400` — `properties.type`: *"expected string, received undefined"* |
| `GET /api/websites/<id>/pageviews` | `400` — same `startAt`/`endAt` message |
| `…/pageviews?…&unit=__bogus__` | `400` — *"Invalid unit"* |
| any of the three **with** `startAt`/`endAt` | `401 Unauthorized` |
| `GET /api/heartbeat` | `200 {"ok":true}` |

So the required parameters are known exactly.

**What could not be established without a credential** is which `type` values
the metrics endpoint accepts on this version — that enum is validated *after*
auth. `METRICS` in the script is therefore a list it tries **individually**,
recording any the instance refuses under `metrics_unavailable` rather than
asserting a set or failing the run. One refused type must not cost the whole
snapshot; the pageview totals are the part that cannot be re-read later if the
compute suspends. The first authenticated run prints the truth.

---

## Setup — the one step that needs the owner

The script reads its host and website id from `data/analytics.json`, the same
file `lib/analytics.ts` and `situation-shell.mjs` read to emit the tracker tag.
Neither is secret; both are in the page source of every page. **Nothing else is
configured.**

What is missing is a credential. Two forms are accepted and the script says
which it used:

| Secret | Used as | Notes |
|---|---|---|
| `UMAMI_API_KEY` | `x-umami-api-key` header | Umami **Cloud** issues these. A self-hosted install may not — if it 401s, use the pair below. |
| `UMAMI_USERNAME` + `UMAMI_PASSWORD` | `POST /api/auth/login` → bearer token | The expected path here: swechha.in is self-hosted, and spec §2 rejected Cloud outright because its free tier has no API at all. |

To wire it:

1. In the Umami dashboard at `analytics.swechha.in`, note the admin username.
2. Add the repository secrets under **Settings → Secrets and variables →
   Actions**: either `UMAMI_API_KEY`, or both `UMAMI_USERNAME` and
   `UMAMI_PASSWORD`.
3. Run the workflow once by hand with **action: check** to confirm it
   authenticates, then with **action: pull**.

For a local run, put the same variables in `.env.local` — the npm scripts pass
`--env-file-if-exists=.env.local`, so they are never typed on a command line
and never land in shell history.

**Neither value is ever printed**, including inside an error. Failure messages
name the environment variable, never its contents.

Until a secret exists the workflow says so in its own job summary and stops. It
does not fail the repository's other work, it does not write an empty snapshot,
and it does not pretend to have run.

---

## Two things about the schedule

**Tuesday, not Monday.** Search Console runs Mondays 05:40 UTC. A different day
keeps two scheduled jobs from waking the same Neon project within minutes of
each other for no gain.

**Weekly, not hourly.** Reading is not free — the spec notes that *browsing the
dashboard wakes the same compute*, so a job that ran hourly would itself be a
plausible way to reach the cap it exists to detect. One run, six requests.

---

## Where the snapshot lives, and why it does not rebuild the site

`data/analytics/audience.json`, which is where the spec asks for it.

`content-rebuild.yml` triggers on `data/**`, so without an exclusion every
weekly snapshot would rebuild all 149 pages and ship a deploy in which nothing
changed — on a Vercel plan that has already hit a daily deploy cap once. That
workflow now carries `- '!data/analytics/**'`, with a note saying to delete the
line the day a page actually reads the file.

`data/seo/search-performance.json` is the same case and is **not** excluded: it
still rebuilds the whole site every Monday for nothing. Left alone deliberately
— changing an existing job's triggers was outside the change that added this
document.

---

## What is tested

`scripts/lib/umami-shape.mjs` holds the four pieces whose failure mode is *a
file full of plausible numbers* rather than an error, and `lib/umami.test.ts`
covers them:

- **`statValue`** — Umami v3 returns `{ value, prev }`; older versions returned
  a bare number. Reading `.value` off a number gives `undefined`, which would
  have recorded **every total as zero** while the run reported success and the
  JSON looked structurally perfect.
- **`istDay`** — a UTC day boundary files an Indian evening under the following
  morning.
- **`fillDaily`** — an absent bucket becomes a zero rather than a missing row.
- **`suspectedGaps`** — a hole bounded by traffic, and never the window's edges.

Both behaviours above were mutation-checked when written: breaking `statValue`
to read `.value` only, and widening `suspectedGaps` to include the edges, each
turned the suite red.
