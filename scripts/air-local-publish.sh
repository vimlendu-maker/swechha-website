#!/usr/bin/env bash
# air-local-publish.sh — the Delhi air reading, fetched from a machine that can
# still reach CPCB, published the way .github/workflows/air-hourly.yml would.
#
# WHY THIS EXISTS (27 September 2026). The cloud job needs a source it can
# reach, and on 25 September it lost the last one:
#   · airquality.cpcb.gov.in (CAAQMS) drops TCP from GitHub's runners AND from
#     Vercel bom1 — the relay reported `connect ETIMEDOUT 115.112.199.4:443`;
#   · api.data.gov.in, the mirror that had been rescuing every cloud run at a
#     4-10 hour lag, answers 502 from its own nginx — from anywhere, this Mac
#     included; its gateway still rejects a bad key with 403, so it is their
#     backend, not our key.
# CAAQMS answers from the owner's Indian residential connection. So this runs
# on that machine, hourly, under launchd (see docs/AIR-LOCAL-PUBLISHER.md).
#
# IT IS A FALLBACK, NOT A SECOND PUBLISHER, and three rules keep it one:
#   1. It publishes ONLY a new CPCB observation (check.status new_observation).
#      A same-hour or stale check writes nothing and pushes nothing, so it can
#      never double-publish an hour and never spends Vercel's 100-deploys/day
#      budget on a clock tick — at most ~19 deploys a day.
#   2. It starts from origin/main every run, so the fetch's own regression
#      guard compares against what the site actually carries. If the cloud job
#      (or anyone) already published this hour, the status is not new and it
#      stands down.
#   3. A rejected push (main moved during the build) resets to the new main and
#      reruns the cycle, up to three times, exactly as the workflow does.
#
# Exit codes: 0 = published or stood down (including no source answering);
# non-zero = a source answered wrongly, a gate refused, or a generator failed —
# the same split the workflow draws, so a non-zero here is worth reading.
#
# Usage: run from the root of a worktree whose checkout it may reset.
#   ENV_FILE   file holding DATA_GOV_IN_KEY / AIR_RELAY_TOKEN / WAQI_TOKEN
#              (default: ~/swechha-website/.env.local). Read line by line, never
#              sourced and never printed.
#   AIR_LOCAL_DRY_RUN=1   build and verify, commit nothing.
#   AIR_LOCAL_ANY_HOUR=1  ignore the 00:00-05:00 IST window (manual runs only).

set -uo pipefail
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
export TZ="Asia/Kolkata"

log() { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S IST')" "$*"; }
ROOT="$(git rev-parse --show-toplevel)" || { log "not inside a git worktree"; exit 1; }
cd "$ROOT"

# ── one run at a time. mkdir is atomic; macOS has no flock(1). A lock older
#    than an hour is a run that died, and is broken rather than obeyed.
LOCK="${TMPDIR:-/tmp}/swechha-air-local.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +60 2>/dev/null)" ]; then
    rmdir "$LOCK" 2>/dev/null; mkdir "$LOCK" || { log "lock contested; standing down"; exit 0; }
  else
    log "another run holds the lock; standing down"; exit 0
  fi
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

# ── the cloud job's window: no polls 00:00-05:00 IST (air-hourly.yml says why).
HOUR=$((10#$(date +%H)))
if [ "$HOUR" -lt 5 ] && [ "${AIR_LOCAL_ANY_HOUR:-}" != "1" ]; then log "00:00-05:00 IST — outside the publishing window"; exit 0; fi

# ── keys, read without sourcing (a `#` inside a value survives) and never echoed.
ENV_FILE="${ENV_FILE:-$HOME/swechha-website/.env.local}"
key() { [ -f "$ENV_FILE" ] && grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^["'"'"']//' -e 's/["'"'"']$//'; }
DATA_GOV_IN_KEY="$(key DATA_GOV_IN_KEY)"; export DATA_GOV_IN_KEY
AIR_RELAY_TOKEN="$(key AIR_RELAY_TOKEN)"; export AIR_RELAY_TOKEN
WAQI_TOKEN="$(key WAQI_TOKEN)"; export WAQI_TOKEN
[ -n "$DATA_GOV_IN_KEY" ] || { log "DATA_GOV_IN_KEY not found in $ENV_FILE"; exit 1; }

# ── dependencies, reinstalled only when the lockfile changes.
# ★ NEVER THROUGH A SYMLINK. `npm ci` deletes node_modules before installing,
#   and through a symlink that is somebody else's node_modules: on 27 Sep 2026 a
#   dry run of this script from a worktree whose node_modules linked to the main
#   checkout emptied the main checkout's (and the website team's worktree,
#   which links there too) for fifteen minutes. This job's worktree owns a real
#   node_modules; a linked one is refused, not "fixed".
if [ -L node_modules ]; then
  log "node_modules is a symlink ($(readlink node_modules)) — refusing to npm ci through it"; exit 1
fi
STAMP="node_modules/.air-local-lock-sha"
LOCK_SHA="$(shasum package-lock.json | cut -d' ' -f1)"
if [ ! -f "$STAMP" ] || [ "$(cat "$STAMP")" != "$LOCK_SHA" ]; then
  log "package-lock changed — npm ci"
  npm ci --no-audit --no-fund --loglevel=error || { log "npm ci failed"; exit 1; }
  echo "$LOCK_SHA" > "$STAMP"
fi

J='JSON.parse(require("fs").readFileSync("data/air-delhi.json","utf8"))'

# ── ONE CYCLE: fetch, build, verify, commit, push. Returns 0 (published or
#    stood down), 2 (the push was rejected because main moved), or the
#    failing step's code.
publish_once() {
  # ── DELHI: the leg that matters.
  npm run -s data:air:delhi; code=$?
  if [ "$code" = "75" ]; then log "no Delhi source answered — nothing written"; return 0; fi
  if [ "$code" != "0" ]; then log "data:air:delhi exited $code — a source answered and the answer was wrong"; return "$code"; fi

  st="$(node -p "$J.check?.status")"
  if [ "$st" != "new_observation" ]; then
    log "Delhi check: $st — this hour is already on the site; standing down"
    git checkout -q -- data public design 2>/dev/null
    return 0
  fi

  # ── INDIA: never holds Delhi back.
  npm run -s data:air:india || log "national snapshot did not refresh; it keeps its committed hour"

  # ── CROSS-CHECK against CPCB's own bulletin, when the verdict is > 6 h old.
  due="$(node -p '
    let at=null; try { at = '"$J"'.crosscheck?.at ?? null } catch {}
    (!at || (Date.now() - Date.parse(at)) / 3600000 > 6) ? "1" : "0"' 2>/dev/null || echo 1)"
  if [ "$due" = "1" ]; then
    if [ -n "$WAQI_TOKEN" ]; then npm run -s data:air:crosscheck || log "WAQI panel did not refresh"; fi
    npm run -s verify:crosscheck; xc=$?
    if [ "$xc" = "1" ]; then
      log "CROSS-CHECK FAILED against CPCB's bulletin — nothing published"
      git checkout -q -- data public design 2>/dev/null
      return 1
    fi
  fi

  npm run -s build:all    || { log "a generator refused to write — nothing published"; return 1; }
  npm run -s verify:final >/dev/null || { log "verify:final refused — nothing published"; return 1; }
  ./scripts/stage-generated.sh >/dev/null
  if git diff --cached --quiet; then log "a new observation staged nothing — refusing"; return 1; fi

  aqi="$(node -p "$J.city_reading?.aqi")"; obs="$(node -p "$J.observed?.raw")"; chk="$(node -p "$J.time?.swechha_checked_utc")"
  if [ "${AIR_LOCAL_DRY_RUN:-}" = "1" ]; then log "dry run — would publish Delhi AQI $aqi, observed $obs"; git reset -q; return 0; fi

  git -c user.name='swechha-air[local]' -c user.email='actions@github.com' commit -q \
    -m "data(air): ${st} — Delhi AQI ${aqi}, observed ${obs}" \
    -m "Checked ${chk}. Published by scripts/air-local-publish.sh on the owner's Mac, the fallback for when no cloud egress reaches CPCB (docs/AIR-LOCAL-PUBLISHER.md). Same steps as .github/workflows/air-hourly.yml."
  if git push -q origin HEAD:main; then
    log "published Delhi AQI $aqi, observed $obs"
    return 0
  fi
  return 2
}

# ── A REJECTED PUSH IS RETRIED FROM THE TOP, as air-hourly.yml does.
# ★ It is NOT "somebody published this hour first". The first version assumed
#   so and stood down, and on 27 Sep 2026 lost every push: the climate-event
#   and coverage publishers move main several times an hour, so main almost
#   always advances during the three-minute build. Generated artefacts are not
#   rebased; they are regenerated — so a rejected push resets to the new main
#   and runs the whole cycle again. If the new main already carries this hour,
#   the Delhi check comes back not-new and the cycle stands down by itself.
for attempt in 1 2 3; do
  publish_once; rc=$?
  [ "$rc" = "2" ] || exit "$rc"
  log "push rejected — main moved during the build (attempt $attempt of 3); starting again from the new main"
  git fetch -q origin main && git reset -q --hard origin/main && git clean -q -fd data public design \
    || { log "could not reset to the new main"; exit 1; }
done
log "push rejected three times running — giving up until the next hour"
exit 0
