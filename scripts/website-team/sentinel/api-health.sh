#!/usr/bin/env bash
# The external data APIs the site's pipelines depend on: does each key still
# authenticate, and is GitHub's rate limit holding?
#
# ★ A KEY THAT HAS QUIETLY STOPPED WORKING IS THE FAILURE MODE HERE, not a
#   quota. These providers publish limits but expose no quota endpoint, so
#   consumption is not readable — but a revoked, rotated or expired key is, and
#   it produces exactly the silent staleness this department exists to catch:
#   the workflow still runs, still goes green on its fallback rung, and the site
#   simply stops learning anything new. The air pipeline's own notes already
#   record one instance of this class (a cron-job.org PAT whose expiry stops the
#   pipeline being driven at all).
#
# ★ IT CHECKS AT MOST ONCE EVERY SIX HOURS. WAQI publishes 1,000 requests/day;
#   probing every 30 minutes would spend 48 of them to learn nothing, and this
#   probe must not become a meaningful consumer of the quota it is watching.
#   Between checks it reports the cached verdict.
#
# ★ NO KEY IS EVER PRINTED. Only the provider name and a verdict.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HERE/env.inc"

STATE="${WEBSITE_TEAM_STATE:-$HOME/.swechha-ai}"
CACHE="$STATE/api-keys.cache"
TTL="${WEBSITE_TEAM_API_TTL:-21600}"   # 6 hours
mkdir -p "$STATE"

if [ -f "$CACHE" ] && [ "$(( $(date +%s) - $(stat -f %m "$CACHE") ))" -lt "$TTL" ]; then
  VERDICT="$(cat "$CACHE")"
  [ "$VERDICT" = "ok" ] && exit 0
  echo "$VERDICT"
  case "$VERDICT" in *"UNKNOWN"*) exit 2 ;; *) exit 1 ;; esac
fi

dead=""      # authenticated and was refused — a real problem
absent=""    # not present on this machine — UNKNOWN, not a failure

check() {  # name, url, success-pattern
  local name="$1" url="$2" pat="$3"
  local body
  body="$(curl -sS --max-time 20 "$url" 2>/dev/null)" || { absent="$absent $name(unreachable)"; return; }
  case "$body" in
    *"$pat"*) return ;;
    *) dead="$dead $name" ;;
  esac
}

if [ -n "${DATA_GOV_IN_KEY:-}" ]; then
  # The CPCB mirror. A bad key returns a JSON body whose status is not "ok".
  check "data.gov.in" \
    "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=$DATA_GOV_IN_KEY&format=json&limit=1" \
    '"status"'
else
  absent="$absent DATA_GOV_IN_KEY"
fi

if [ -n "${WAQI_TOKEN:-}" ]; then
  # WAQI answers {"status":"ok",...} or {"status":"error","data":"Invalid key"}
  check "WAQI" "https://api.waqi.info/feed/delhi/?token=$WAQI_TOKEN" '"status":"ok"'
else
  absent="$absent WAQI_TOKEN"
fi

if [ -n "${FIRMS_MAP_KEY:-}" ]; then
  # FIRMS has a dedicated key-status endpoint; an invalid key says so in text.
  check "NASA FIRMS" "https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=$FIRMS_MAP_KEY" \
    'current_transactions'
else
  absent="$absent FIRMS_MAP_KEY"
fi

# GitHub's limit IS readable, so it is measured rather than assumed.
RL="$(gh api /rate_limit --jq '.resources.core | "\(.remaining) \(.limit)"' 2>/dev/null || echo '')"
if [ -n "$RL" ]; then
  REM="${RL%% *}"; LIM="${RL##* }"
  if [ "$LIM" -gt 0 ] && [ "$((REM * 100 / LIM))" -lt 10 ]; then
    dead="$dead github-api($REM/$LIM-left)"
  fi
fi

if [ -n "$dead" ]; then
  VERDICT="API keys no longer working:$dead — the pipelines using them will go stale silently"
  printf '%s' "$VERDICT" > "$CACHE"; echo "$VERDICT"; exit 1
fi
if [ -n "$absent" ]; then
  VERDICT="API keys UNKNOWN — not on this machine (they may be CI-only):$absent"
  printf '%s' "$VERDICT" > "$CACHE"; echo "$VERDICT"; exit 2
fi
printf 'ok' > "$CACHE"
exit 0
