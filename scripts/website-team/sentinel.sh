#!/usr/bin/env bash
# Watch for things going wrong, and wake the department only when they do.
#
# THE PROBLEM THIS SOLVES
#   "If a code breaks, do they wait for tomorrow?" — they did. The department
#   ran at 09:00 and nothing else, so a publisher that broke at 09:05 stayed
#   broken for a day. That is exactly what happened on 2026-09-10: a commit made
#   build-hero.mjs unparseable and every scheduled publisher failed for about
#   eighteen hours before a human noticed.
#
# ★ THIS SCRIPT CONTAINS NO MODEL CALL AND COSTS NOTHING TO RUN.
#   That is the entire point. Waking the manager every fifteen minutes to ask
#   "is anything wrong?" would cost $75-450 a day to hear "no" almost every
#   time. So the cheap deterministic checks run often, and the expensive
#   judgement is invoked only when a check actually trips. The owner's own brief
#   says it: use deterministic scripts instead of LLM calls wherever you can.
#
# IT WAKES THE DEPARTMENT ONCE PER PROBLEM, NOT ONCE PER CHECK.
#   A fingerprint of the current problem is stored. While the same thing is
#   still wrong, this stays quiet — otherwise a broken publisher would bill a
#   run every fifteen minutes all night. A NEW problem, or the same problem
#   recurring after a recovery, wakes it again.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
DEPARTMENT="${WEBSITE_TEAM_DEPARTMENT:-website}"
STATE="${WEBSITE_TEAM_STATE:-$HOME/.swechha-ai}"
LOCK="${WEBSITE_TEAM_LOCK:-$STATE/run.lock}"
SEEN="$STATE/sentinel-seen.$DEPARTMENT"
DRY="${1:-}"

mkdir -p "$STATE"
cd "$REPO"

PROBLEMS=""
note() { PROBLEMS="$PROBLEMS$1"$'\n'; }

# ── 1. Scheduled workflows ───────────────────────────────────────────────────
# The publishers keep the site current. When they fail the site silently goes
# stale, which is the failure mode that is invisible from the outside.
FAILED="$(gh run list --limit 12 --json conclusion,name,createdAt \
  --jq '[.[] | select(.conclusion == "failure") | .name] | unique | join(", ")' 2>/dev/null || echo '')"
[ -n "$FAILED" ] && note "workflows failing: $FAILED"

# ── 2. Is the site's own data fresh? ─────────────────────────────────────────
# air:status compares what the site is showing against CPCB's freshest
# reachable observation. It is the one check that sees staleness rather than
# breakage — a pipeline can be green and still be publishing yesterday.
#
# ★ THE FORMAT IS `VERDICT   OK`, WHITESPACE-SEPARATED, NOT `VERDICT: OK`.
#   The first version of this line grepped for a colon, matched nothing ever,
#   and so reported the air pipeline healthy under every possible condition —
#   a check that cannot fail, which is worse than no check. Caught only by
#   running each probe separately and noticing probe 2 returned empty.
#   Re-read the real output before changing this pattern.
set +e
AIR_OUT="$(npm run --silent air:status 2>/dev/null)"
AIR_RC=$?
set -e
AIR="$(printf '%s' "$AIR_OUT" | grep -oE 'VERDICT[[:space:]]+[A-Z]+' | head -1 | awk '{print $2}')"
if [ "$AIR_RC" -ne 0 ]; then
  note "air pipeline: air:status exited $AIR_RC"
elif [ -z "$AIR" ]; then
  # Silence is not health. If the instrument stops producing a verdict, that
  # is itself the finding — the same rule the infrastructure watch follows.
  note "air pipeline: air:status produced no VERDICT line"
elif [ "$AIR" != "OK" ]; then
  note "air pipeline: $AIR"
fi

# ── 3. Infrastructure ────────────────────────────────────────────────────────
# Cached, so this makes at most one request per provider per TTL. Exit 2 is
# RED or BLOCKED; exit 1 is AMBER, which is a watch item rather than a wake-up.
set +e
python3 scripts/website-team/infra-status.py >/dev/null 2>&1
INFRA=$?
set -e
[ "$INFRA" -ge 2 ] && note "infrastructure: a service is RED or BLOCKED"

# ── decide ───────────────────────────────────────────────────────────────────
if [ -z "$PROBLEMS" ]; then
  # Recovered? Clear the fingerprint so the next occurrence wakes it again.
  [ -f "$SEEN" ] && { rm -f "$SEEN"; echo "sentinel: recovered — all clear"; }
  exit 0
fi

FINGERPRINT="$(printf '%s' "$PROBLEMS" | shasum | cut -d' ' -f1)"
printf 'sentinel: %s' "$PROBLEMS"

if [ -f "$SEEN" ] && [ "$(cat "$SEEN")" = "$FINGERPRINT" ]; then
  echo "sentinel: already reported this — staying quiet"
  exit 0
fi

if [ "$DRY" = "--dry-run" ]; then
  echo "sentinel: would wake the department (dry run)"
  exit 0
fi

if [ -d "$LOCK" ]; then
  echo "sentinel: a run is already in flight — leaving it to that one"
  exit 0
fi

echo "$FINGERPRINT" > "$SEEN"
python3 "$REPO/scripts/website-team/log-event.py" "$DEPARTMENT" runner \
  run_triggered by=sentinel problems="$(printf '%s' "$PROBLEMS" | tr '\n' ';')" 2>/dev/null || true
echo "sentinel: waking the department"
exec "$REPO/scripts/website-team/run.sh" work
