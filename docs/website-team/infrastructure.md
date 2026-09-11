# Infrastructure and free-tier inventory

Every external service swechha.in depends on, what it costs, and how close it
is to costing more. The instrument is
`scripts/website-team/infra-status.py` — deterministic, cached, no model call.
The rules are the `infrastructure` block in `policy.json`.

**Read this before adding any dependency.** The site must stay inside the free
envelope unless the owner explicitly authorises otherwise, and that is a hard
constraint rather than a preference.

## The one rule

**A metric that cannot be obtained is UNKNOWN.** Never estimate a usage figure
and present it as fact. A plausible number stops someone from looking; UNKNOWN
sends them to look. UNKNOWN is a gap, not a pass, and never a green.

Eight of the twelve services below are UNKNOWN today. That is the honest state
of the instrumentation, not a failure of the inventory — and it is far more
useful than twelve invented percentages.

## How each column was arrived at

| Provenance | Meaning |
|---|---|
| **verified** | Measured on this machine on the date given, by the command shown |
| **published** | Read from the provider's own terms; date it was read is given |
| **unverified** | Believed but not confirmed — treat as a question, not a fact |
| **UNKNOWN** | Cannot be obtained from here, with the reason why |

## The inventory

### Vercel — hosting
- **Plan:** Hobby — *unverified.* No `VERCEL_TOKEN` and no Vercel CLI on this
  machine, and `~/.vercel` does not exist, so the plan cannot be confirmed from
  here. `.vercel/project.json` exists, so the project is linked.
- **Published limits:** 100 deployments/day; 100 GB bandwidth/month on Hobby.
- **Usage:** UNKNOWN — needs `VERCEL_TOKEN`.
- **Status:** verified reachable 2026-09-11 — `vercel-status.com` reported
  *All Systems Operational*.
- **Cost risk: HIGH.** This is the largest single billing exposure in the
  stack: it hosts the site, it meters bandwidth, and a Hobby project that
  outgrows its limits is pushed toward Pro.
- **Known constraint already recorded:** sub-daily cron fails Hobby deploys and
  there is a 100/day deployment cap — see the air-pipeline notes. This is why
  the air pipeline is driven by an external heartbeat.

### Neon — Postgres
- **Plan:** Free — *unverified.* No `NEON_API_KEY` on this machine.
- **Published limits:** 0.5 GB storage; 191.9 compute-hours/month on Free.
- **Usage:** UNKNOWN — needs `NEON_API_KEY`.
- **Cost risk: HIGH,** and it is the one that grows without anyone acting:
  the self-hosted Umami analytics tables accumulate rows every time somebody
  visits the site. Storage is the metric to watch, and nobody can watch it yet.

### GitHub — Actions
- **Plan:** public repository — **verified 2026-09-11**,
  `gh repo view --json visibility` → `PUBLIC`.
- **Limit: not metered.** Actions minutes are free and unlimited for public
  repositories. The 7 scheduled workflows therefore cost nothing in minutes
  however often they run.
- **Cost risk: NONE — conditional on the repository staying public.** If it is
  ever made private, minutes begin metering at 2,000/month and this entry is
  wrong; the checker's source comment says the same thing next to the code.
- **Health:** verified — 3 of the last 30 runs had failed at the time of
  writing, which is an *operational* signal, not a cost one.

### GitHub — API
- **Limit:** 5,000 requests/hour, authenticated — **verified 2026-09-11** via
  `gh api /rate_limit` (5000/5000 available).
- **Cost risk: NONE.** Exhaustion throttles; it does not bill.
- Token scopes present: `gist`, `read:org`, `repo`, `workflow`. Note that the
  Actions **billing** endpoint needs the `user` scope, which is not granted —
  and for a user account with public repos it returns 404 regardless.

### GitHub — repository storage
- **Size:** 183 MB — **verified 2026-09-11** via `gh repo view --json diskUsage`.
- **Guide:** 1 GB recommended, warnings around 5 GB.
- **Cost risk: NONE** directly; a large repository slows every clone and every
  CI run, so the cost is time.

### data.gov.in — CPCB air data
- **Plan:** free API key (`DATA_GOV_IN_KEY`).
- **Limit:** UNKNOWN — no published per-key quota found.
- **Usage:** UNKNOWN — the provider exposes no quota endpoint.
- **Cost risk: NONE** — no paid tier exists. The real risk is *withdrawal or
  breakage*, not billing, and reachability of Indian government hosts from any
  cloud already changes by the hour (hence the fetch → curl → relay ladder).

### WAQI / AQICN
- **Plan:** free token (`WAQI_TOKEN`).
- **Published limit:** 1,000 requests/day.
- **Usage:** UNKNOWN — no quota endpoint; it would have to be counted locally.
- **Cost risk: LOW** — exceeding it throttles rather than bills.

### NASA FIRMS — fire data
- **Plan:** free `MAP_KEY` (`FIRMS_MAP_KEY`).
- **Published limit:** 5,000 transactions per 10 minutes.
- **Usage:** UNKNOWN — no quota endpoint.
- **Cost risk: NONE** — no paid tier.

### Resend — transactional email
- **Plan:** free (`RESEND_API_KEY`).
- **Published limits:** 100 emails/day; 3,000/month.
- **Usage:** UNKNOWN — reading it needs an authenticated call.
- **Cost risk: LOW** — the site only sends on a form submission.

### Umami — analytics
- **Plan:** self-hosted, proxied first-party via `/ledger` and `/api/ledger`.
- **Limit:** bounded by the Neon database it writes to.
- **Usage:** UNKNOWN — the counts live in Neon, which is itself UNKNOWN.
- **Cost risk: INDIRECT but real** — this is the component that grows Neon
  storage, so Neon's limit is the one that binds it.

### cron-job.org — the air pipeline's heartbeat
- **Plan:** free.
- **Limit:** UNKNOWN — the free plan's terms are not recorded anywhere here.
- **Cost risk: LOW,** but it **holds a GitHub PAT**, and that token's expiry is
  a live operational risk already noted in the air-pipeline record: when it
  expires the pipeline stops being driven and the site quietly goes stale.

### DNS / domain — swechha.in
- **Plan:** a registered domain with an annual renewal.
- **Registrar:** UNKNOWN — not recorded in this repository.
- **Cost risk: RECURRING AND ALREADY PAID.** No amount of free-tier discipline
  protects against an expired domain, which takes the whole site down. This is
  the one cost in the stack that is *supposed* to exist.

## The gap that needs the owner

Two services carry the **HIGH** cost risk and neither can be measured:

- **Vercel** needs a read-only API token for plan, bandwidth and build usage.
- **Neon** needs an API key for storage and compute-hour usage.

Creating those is the owner's action, not an agent's — they are credentials.
Until they exist, the department can watch Vercel's *status* but not its
*usage*, and nothing at all about Neon. Given Neon's storage grows on its own
with site traffic, that is the most important blind spot in the inventory.

Neon's status page also did not return a machine-readable status document at
the usual path, so Neon has no automated health check either.

## Cadence

- **Daily (`work` run):** read the instrument. Anything AMBER or worse becomes
  a prioritised item; anything BLOCKED stops and escalates.
- **Weekly (`review` run):** the provider change watch — free-tier terms,
  pricing, deprecations, breaking changes. A provider changing its free tier is
  an operational event, not information, and gets a task.

Run it by hand any time:

```bash
npm run infra:status
```

## Repository protection (decided 2026-09-11)

`main` carries a ruleset — **"main — no history rewrites, no deletion"**,
ruleset `22888329` — with two rules, `non_fast_forward` and `deletion`, and
**no bypass actors**: it binds the owner, every agent and every bot equally.
Verified enforced server-side by force-pushing a disposable branch under an
identical temporary rule and being refused (*"Cannot force-push to this
branch"*), not merely by reading the config back.

**Requiring pull requests or status checks on `main` was considered and
deliberately declined by the owner.** The reason is architectural, and any
future agent proposing it must account for it: **67 of the last 100 commits to
`main` are direct pushes from five automation identities** —
`swechha-air[bot]`, `swechha-climate-events[bot]`,
`swechha-coverage-hourly[bot]`, `swechha-data-refresh[bot]`,
`swechha-search-console[bot]` — all authenticating as the GitHub Actions app
with `permissions: contents: write`, and the air pipeline pushes every fifteen
minutes. A rule that required a PR or a passing check before a commit could
land on `main` would stop those pushes and the site would go stale within the
hour unless the bypass exactly matched how they authenticate. The owner chose
the safety net over that risk.

So the gap is known and accepted: **a direct push that has not passed CI can
still land on `main`.** What cannot happen is history being rewritten or the
branch being deleted — which is the irreversible class, and the one a
mis-aimed rebase actually reached for earlier the same day.

Do not re-raise this as a defect. If it is ever revisited, the test is whether
the bypass covers the GitHub Actions app, and the way to find out is to watch
whether `air-hourly` publishes on its next run rather than to reason about it.

### Auto-merge is off at the repository level

`allow_auto_merge` is **false** on the repository (read 2026-09-11). This is
why `gh pr merge --auto` in `execute.sh` has never taken effect and logs
`automerge_unavailable`: the flag has nothing to attach to, and with no
required status checks there is nothing for it to wait on either. Turning it on
is a repository-settings change and therefore the owner's, not an agent's. Note
that it would also be of limited use while no check is required — `--auto`
would merge as soon as GitHub saw no blocking requirement.
