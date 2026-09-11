#!/usr/bin/env bash
# Run the department when the owner adds a job — within seconds, not tomorrow.
#
# THE PROBLEM THIS SOLVES
#   The department ran on a 09:00 schedule and nothing else, so an idea typed
#   into the inbox at 10:00 waited twenty-three hours. The owner's expectation —
#   that the agents work when work appears — was simply not met.
#
# WHY NOT JUST POLL EVERY FIFTEEN MINUTES
#   Because each run is an LLM invocation and costs real money: ~$0.80 when the
#   manager only observes, ~$4.70 when it delegates to a specialist. Fifteen-
#   minute polling is $75-450 a day to discover, almost every time, that nothing
#   changed. So this fires on the EVENT instead: launchd's WatchPaths wakes it
#   when the file is written, and it costs nothing at all while the owner is not
#   typing.
#
# WHY IT STILL CHECKS A HASH
#   WatchPaths fires on any write, and Obsidian writes while you type, and the
#   Git plugin writes when it commits. Firing on each of those would burn a
#   dollar per keystroke-pause. So this compares a hash of the `## Open` section
#   only, and does nothing unless the list of open jobs actually changed.
#
# WHAT IT DELIBERATELY DOES NOT DO
#   It does not queue. If a run is already in flight the lock is held, and this
#   exits — the run already underway reads the same file and will see the job.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
VAULT="${WEBSITE_TEAM_VAULT:-$HOME/Desktop/swechha-vault}"
DEPARTMENT="${WEBSITE_TEAM_DEPARTMENT:-website}"
STATE="${WEBSITE_TEAM_STATE:-$HOME/.swechha-ai}"
LOCK="${WEBSITE_TEAM_LOCK:-$STATE/run.lock}"
SEEN="$STATE/inbox-seen.$DEPARTMENT"
# A burst of saves must not become a burst of runs.
MIN_INTERVAL="${WEBSITE_TEAM_MIN_INTERVAL:-600}"

INBOX="$VAULT/swechha/$DEPARTMENT/team/inbox.md"
ORG_INBOX="$VAULT/swechha/ai/inbox.md"

mkdir -p "$STATE"

# The `## Open` section of a file, comments and blank lines stripped. Everything
# else in an inbox — the preamble, `## Done`, the owner's notes to himself — can
# change without any new work appearing.
open_section() {
  [ -f "$1" ] || return 0
  # Strip blank lines, HTML comments (the "add jobs below" hints) and the
  # horizontal rule that separates Open from Done — that rule sits INSIDE the
  # awk range, so counting it as a job makes an empty inbox look occupied and
  # fires a $0.80 run at nothing.
  awk '/^## Open/{f=1;next} /^## Done/{f=0} f' "$1" \
    | grep -vE '^[[:space:]]*(<!--.*-->)?[[:space:]]*$' \
    | grep -vE '^[[:space:]]*-{3,}[[:space:]]*$' || true
}

CURRENT="$( { open_section "$INBOX"; open_section "$ORG_INBOX"; } | shasum | cut -d' ' -f1)"
JOBS="$( { open_section "$INBOX"; open_section "$ORG_INBOX"; } | grep -c . || true)"

if [ "$JOBS" -eq 0 ]; then
  # Emptying the inbox is not a reason to run. Record the hash so that
  # re-adding the same job later still counts as a change.
  echo "$CURRENT" > "$SEEN"
  exit 0
fi

if [ -f "$SEEN" ] && [ "$(cat "$SEEN")" = "$CURRENT" ]; then
  exit 0   # written, but the open jobs are identical — nothing to do
fi

if [ -d "$LOCK" ]; then
  # A run is in flight and reads the same file. Do not queue a second one;
  # deliberately do NOT record the hash, so if that run started before the
  # job was saved, the next write still triggers.
  echo "on-change: a run is already in flight — it will see this" >&2
  exit 0
fi

if [ -f "$SEEN" ]; then
  LAST_RUN=$(( $(date +%s) - $(stat -f %m "$SEEN") ))
  if [ "$LAST_RUN" -lt "$MIN_INTERVAL" ]; then
    echo "on-change: last run was ${LAST_RUN}s ago (min ${MIN_INTERVAL}s) — holding" >&2
    exit 0
  fi
fi

echo "$CURRENT" > "$SEEN"
echo "on-change: the open jobs changed — running the department now"
python3 "$REPO/scripts/website-team/log-event.py" "$DEPARTMENT" runner \
  run_triggered by=inbox-change jobs="$JOBS" 2>/dev/null || true
exec "$REPO/scripts/website-team/run.sh" work
