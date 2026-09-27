# The local air publisher — the fallback when no cloud egress reaches CPCB

`scripts/air-local-publish.sh`, run hourly by launchd on the owner's Mac
(`docs/launchd/in.swechha.air-local.plist`). Added 27 September 2026.

## Why it exists

The hourly cloud job (`.github/workflows/air-hourly.yml`) needs a source it can reach. On 25 September 2026
it lost the last one, and for ~30 hours every run "succeeded" while fetching nothing:

| Source | GitHub runners | Vercel bom1 (the relay) | Owner's Mac |
|---|---|---|---|
| CPCB CAAQMS (`airquality.cpcb.gov.in`) | TCP dropped | `connect ETIMEDOUT 115.112.199.4:443` | answers in 0.07 s |
| data.gov.in mirror | HTTP 502 | — | HTTP 502 — their nginx, from anywhere; a bad key still gets 403, so it is their backend |
| the relay itself | — | works (bulletin PDF, 200) | — |

Nothing in our code was broken. The mirror normally rescues cloud runs at a 4–10 h lag, and it was down;
CPCB's live host refuses every cloud network measured. The owner's Indian residential connection reaches it.

## What it does

The same steps as the workflow — Delhi fetch, national snapshot, bulletin cross-check when > 6 h old,
`build:all`, `verify:final`, `stage-generated.sh`, commit, push to `main` — with three differences that keep it
a fallback rather than a second publisher:

1. **It publishes only a new CPCB observation.** A same-hour or stale check writes nothing and pushes nothing.
   At most ~19 deploys a day, well inside Vercel Hobby's 100.
2. **It starts from `origin/main` every run**, so if the cloud job already published this hour it stands down.
3. **A rejected push is retried from the top** (reset to the new `main`, run the cycle again, up to three times). Other publishers move `main` several times an hour, so this is the ordinary case, not a race with another air publish.

It keeps the cloud job's window (no runs 00:00–05:00 IST) and runs at minute 40, after CPCB's 15–35 minute lag.
When the mirror recovers, both run: the cloud job's lagging mirror reading is refused by the regression guard
whenever this one has already published a newer hour, so they do not fight.

## Install (once)

```bash
git -C ~/swechha-website worktree add ~/.swechha-ai/air-worktree origin/main --detach
cp ~/swechha-website/docs/launchd/in.swechha.air-local.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/in.swechha.air-local.plist
```

The worktree belongs to the job: every run hard-resets it. Keys are read from `~/swechha-website/.env.local`
(`DATA_GOV_IN_KEY`, `AIR_RELAY_TOKEN`, optional `WAQI_TOKEN`) line by line — never sourced, never printed.
The first run does an `npm ci` in the worktree; later runs reinstall only when `package-lock.json` changes.

## Operate

| Want | Command |
|---|---|
| Watch it | `tail -f ~/.swechha-ai/logs/air-local.log` |
| Run it now | `launchctl kickstart gui/$(id -u)/in.swechha.air-local` |
| Test without publishing | `cd ~/.swechha-ai/air-worktree && AIR_LOCAL_DRY_RUN=1 AIR_LOCAL_ANY_HOUR=1 bash scripts/air-local-publish.sh` |
| Stop it | `launchctl bootout gui/$(id -u)/in.swechha.air-local` |

Log lines to expect: `published Delhi AQI …` (a new hour went out), `… standing down` (already on the site, or
another run holds the lock), `no Delhi source answered` (this Mac could not reach CPCB either). Anything else
exited non-zero and is worth reading.

## Limits

- **It only runs while this Mac is on and awake.** launchd reruns one missed slot on wake; hours slept through
  are simply not published, and the page's own age check then says so to readers.
- It pushes to production unattended, with the owner's git credentials. It commits only generated air data and
  the pages built from it, through the same gates the cloud job uses.
- Remove it once a cloud path reaches CPCB again (the mirror recovering is enough for 4–10 h freshness; a
  relay rung that reaches CAAQMS is enough for real-time).
