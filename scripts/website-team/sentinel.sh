#!/usr/bin/env bash
# Watch for things going wrong, and wake the department only when they do.
#
# ★ THIS FILE IS AN ORCHESTRATOR, NOT A CHECKER. Every actual check lives in
#   scripts/website-team/sentinel/ as its own executable. The owner's
#   instruction, 2026-09-11: do not let this become a 3,000-line script with
#   Vercel, Neon, APIs, climate, SEO and GitHub all inside it. Adding a check
#   here instead of there is the mistake this comment exists to prevent.
#
#   Probes are DISCOVERED, not listed. There is no array to keep in step with
#   the directory — a hand-maintained list that must move in lockstep with
#   something else is this repository's most repeated defect class.
#
# ★ NO PROBE CONTAINS A MODEL CALL, so running this costs nothing. That is the
#   whole design. Each department run is an LLM invocation (~$0.80 observing,
#   ~$4.67 delegating, both measured 2026-09-11); waking the manager every
#   thirty minutes to ask "is anything wrong?" would cost $38-225 a day to hear
#   "no". Cheap deterministic eyes; expensive judgement only when they trip.
#
# ── THE PROBE CONTRACT ───────────────────────────────────────────────────────
#   exit 0  all clear, say nothing
#   exit 1  a problem — stdout is the one-line description
#   exit 2  UNKNOWN — could not determine (no credential, host unreachable)
#
#   UNKNOWN IS NOT A PASS. It is surfaced, and it never wakes the department on
#   its own: an unmeasurable thing is a standing gap for the owner to close, not
#   an incident to page about every thirty minutes. Same rule the infrastructure
#   inventory follows — never present an unobtainable metric as healthy.
#
# ── ONCE PER PROBLEM, NOT ONCE PER CHECK ─────────────────────────────────────
#   A fingerprint of the current problem set is stored. While the same thing is
#   still wrong this stays quiet, so a publisher that breaks overnight bills one
#   run and not sixteen. A new problem, or a recurrence after recovery, wakes it.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
DEPARTMENT="${WEBSITE_TEAM_DEPARTMENT:-website}"
STATE="${WEBSITE_TEAM_STATE:-$HOME/.swechha-ai}"
LOCK="${WEBSITE_TEAM_LOCK:-$STATE/run.lock}"
SEEN="$STATE/sentinel-seen.$DEPARTMENT"
PROBES="${WEBSITE_TEAM_PROBES:-$REPO/scripts/website-team/sentinel}"
DRY="${1:-}"

mkdir -p "$STATE"

PROBLEMS=""
UNKNOWNS=""
RAN=0

for probe in "$PROBES"/*.sh; do
  [ -x "$probe" ] || continue
  RAN=$((RAN + 1))
  name="$(basename "$probe" .sh)"
  set +e
  out="$("$probe" 2>/dev/null)"
  rc=$?
  set -e
  case "$rc" in
    0) ;;
    1) PROBLEMS="$PROBLEMS$name: ${out:-reported a problem with no detail}"$'\n' ;;
    2) UNKNOWNS="$UNKNOWNS$name: ${out:-could not determine}"$'\n' ;;
    *) PROBLEMS="$PROBLEMS$name: probe exited $rc (a probe must exit 0, 1 or 2)"$'\n' ;;
  esac
done

if [ "$RAN" -eq 0 ]; then
  # A sentinel that runs no probes reports "all clear" forever, which is the
  # most dangerous possible state: silent, plausible and wrong.
  echo "sentinel: REFUSED — no executable probes found in $PROBES" >&2
  exit 3
fi

[ -n "$UNKNOWNS" ] && printf 'sentinel: UNKNOWN (a gap, not a pass) —\n%s' "$UNKNOWNS"

if [ -z "$PROBLEMS" ]; then
  [ -f "$SEEN" ] && { rm -f "$SEEN"; echo "sentinel: recovered — all clear"; }
  [ "$DRY" = "--dry-run" ] && echo "sentinel: $RAN probes ran, nothing wrong"
  exit 0
fi

printf 'sentinel: %s' "$PROBLEMS"
FINGERPRINT="$(printf '%s' "$PROBLEMS" | shasum | cut -d' ' -f1)"

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
