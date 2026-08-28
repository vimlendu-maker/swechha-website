# Keeping the Air pipeline beating — on Vercel Hobby

**The problem in one line:** the Air data is only as fresh as the last time
something *triggered* the pipeline, and on a Hobby plan neither of the two
obvious triggers is reliable enough on its own.

| Trigger | Cadence it can do | Reliability, measured |
|---|---|---|
| GitHub Actions `schedule` | any | **Poor.** 26–28 Aug 2026: five scheduled events in forty-eight hours across seven scheduled workflows, and none at all to the Air workflow for thirty-four hours. GitHub states scheduled runs may be delayed or dropped under load. |
| Vercel Cron (Hobby) | **once per day, ±59 min** | Good, but once a day. Vercel: *"Hobby accounts are limited to cron jobs that run once per day. Cron expressions that would run more frequently will fail during deployment."* |
| **An external pinger** | 1–15 min | **This is the one that carries the cadence.** Free, no plan change. |

A fifteen-minute cron expression in `vercel.json` does not merely fail to run —
**it fails the deployment itself.** That is what happened on 27 August 2026:
every Vercel deploy from 18:08 IST onward failed at build time on one line, so
the live site stopped receiving any update at all, and went on serving a
27-hour-old AQI even on the runs where the pipeline worked. `lib/air-history.test.ts`
now fails if anyone reinstates a sub-daily schedule.

## ★ The other Hobby ceiling: 100 deployments a day

> *"You are able to deploy 100 times every 86400 seconds (1 day). Should you
> hit the rate limit, you will need to wait another day before you can deploy
> again."* — Vercel limits

**Every push to `main` is a deployment.** So the pipeline's *publish* rate is a
platform budget, not a preference. Polling every 15 minutes and committing
every successful check is **96 deployments/day from Air alone** — before
`data-refresh`, `content-rebuild`, or a human pushing anything. That goes
through the ceiling, and the penalty is a full day with no deploys: the site
frozen, which is the exact failure this work existed to end.

So polling and publishing are separated, because they were never the same
thing:

| Outcome | Published? |
|---|---|
| `new_observation` — the reading moved | **always** (CPCB gives at most 24/day) |
| `same_observation` / `stale_refused` | at most once per `MIN_PUBLISH_MINUTES` (default **30**) |

Worst case ≈ **48 Air deployments/day**, leaving real headroom.
`lib/workflows.test.ts` fails if the floor is removed or set so low the budget
is blown.

**What this costs, stated rather than hidden:** on a skipped run the check
genuinely happened and is genuinely discarded — the runner resets to
`origin/main` next time, so the history store's `checks` counter samples at the
publish cadence, not the poll cadence, and the page's *last checked* is
accurate but granular to 30 minutes. That is the honest trade for a hard deploy
ceiling. On Pro, set `MIN_PUBLISH_MINUTES: 0` and every poll publishes.

---

## What triggers what

```
external pinger (every 15 min)  ─┐   poll != publish; see the deploy budget above
Vercel Cron  (once daily, backstop) ─┼─→  GET/POST /api/cron/air
GitHub schedule (best effort)    ─┘         (Authorization: Bearer CRON_SECRET)
                                              │
                                              │ skips if a run started <12 min ago
                                              ▼
                                    GitHub Actions: air-hourly.yml
                                    (the ONLY writer of Air data)
                                              ▼
                                    commit to main → Vercel deploys
```

All three triggers are safe to run together: the route refuses to create a
duplicate run if one started in the last 12 minutes, and the workflow's
`concurrency: air` group stops two runs racing into a push.

---

## Step 1 — set the two environment variables in Vercel

Vercel → your project → **Settings → Environment Variables**, scope
**Production**.

### `CRON_SECRET`

Any long random string. Generate one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Vercel sends this automatically as `Authorization: Bearer $CRON_SECRET` on its
own cron calls, and the external pinger will send the same header.

**If this is missing, `/api/cron/air` refuses every call — including Vercel's
own cron.** The route writes a named error to the server log when that
happens, so it is visible in Vercel → Logs rather than being a silent 401.

### `GITHUB_AIR_DISPATCH_TOKEN`

A GitHub **fine-grained personal access token**:

- GitHub → Settings → Developer settings → Personal access tokens →
  Fine-grained tokens → **Generate new token**
- **Repository access:** Only select repositories → `vimlendu-maker/swechha-website`
- **Repository permissions:** `Actions` → **Read and write** (this one is
  required; everything else can stay No access)
- **Expiration:** set a date you will actually renew, and put it in a calendar.
  An expired token makes the heartbeat return 502 with no other symptom.

Redeploy after adding either variable — env vars are baked in at build time
for the runtime that reads them.

## Step 2 — check the daily Vercel cron is registered

Vercel → project → **Settings → Cron Jobs**. You should see `/api/cron/air`
with schedule `17 1 * * *`. Hobby precision is per-hour (±59 min), so the
stated minute is indicative. This is the daily backstop, not the heartbeat.

## Step 3 — the 15-minute heartbeat (pick one)

### Option A — cron-job.org (no code, easiest)

1. Sign up at <https://cron-job.org> (free).
2. **Create cronjob.**
3. **URL:** `https://swechha.in/api/cron/air`
4. **Schedule:** every 15 minutes.
5. Open **Advanced / Headers** and add one header:
   - Name: `Authorization`
   - Value: `Bearer <the CRON_SECRET value>`
6. Save and use its **Test run** button — expect HTTP 200 and a JSON body of
   `{"ok":true,"action":"dispatched"}` or `{"ok":true,"action":"skipped_recent_run"}`.
   **Both are success.**

### Option B — Cloudflare Workers Cron Trigger (sturdier, tiny bit of code)

Free, 1-minute granularity, and the secret lives as an encrypted binding
rather than in a web form.

```js
// worker.js
export default {
  async scheduled(event, env, ctx) {
    await fetch('https://swechha.in/api/cron/air', {
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    })
  },
}
```

`wrangler.toml`:

```toml
name = "swechha-air-heartbeat"
main = "worker.js"
compatibility_date = "2026-01-01"

[triggers]
crons = ["*/15 * * * *"]
```

Then `npx wrangler secret put CRON_SECRET` and `npx wrangler deploy`.

### Option C — Google Cloud Scheduler

Free tier covers three jobs. Target the same URL, method GET or POST, and add
the `Authorization: Bearer …` header. Reliable, but the heaviest setup of the
three.

---

## Step 4 — verify the chain yourself

```bash
# 1. The route accepts your secret (200, not 401)
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://swechha.in/api/cron/air
```

```bash
# 2. A run appears within a minute
gh run list --workflow=air-hourly.yml --limit 3
```

```bash
# 3. The page's two clocks move independently and honestly
curl -sL https://swechha.in/now/air | grep -o 'Observed [^<]*'
```

### Reading the responses

| Response | Meaning | Fix |
|---|---|---|
| `200 {"action":"dispatched"}` | Working. A run was started. | — |
| `200 {"action":"skipped_recent_run"}` | Working. A run started under 12 min ago. | — |
| `401 {"error":"unauthorized"}` | Wrong header, **or** `CRON_SECRET` unset. | Check Vercel → Logs; the route names which. |
| `503 {"error":"dispatch token not configured"}` | Your secret is right; `GITHUB_AIR_DISPATCH_TOKEN` is missing. | Step 1. |
| `502 {"error":"workflow dispatch failed"}` | Token present but rejected — usually expired, or missing `Actions: read and write`. | Regenerate with the right scope. |

---

## What "working" looks like on the page

The site prints **two clocks, and they are different facts**:

- **Observed** — when CPCB measured the air (CPCB's own IST stamp, never
  converted).
- **Last checked by Swechha** — when this pipeline last successfully asked.

A healthy system shows *last checked* moving every 15 minutes while *observed*
moves once an hour, because CPCB publishes hourly. **Last checked catching up
to observed is not the goal**; them being equal would mean we only ever look at
the moment the air is measured, which is not how either clock works.

If *last checked* stops moving, the heartbeat is down. If *observed* stops
moving while *last checked* keeps going, CPCB is the one that has stopped —
and the page says so by printing the observation's age.

---

## If you ever move to Vercel Pro

A fifteen-minute expression in `vercel.json` becomes legal, and the external
pinger becomes redundant. Change the schedule **and** relax the assertion in
`lib/air-history.test.ts` in the *same commit* — the test exists precisely so
that the schedule cannot be changed without someone noticing the plan
constraint, which is the mistake that took the site down.
