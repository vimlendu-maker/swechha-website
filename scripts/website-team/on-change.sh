#!/usr/bin/env bash
# Run the department when the owner adds urgent work — within seconds, not
# tomorrow. Fired by launchd WatchPaths on the inboxes.
#
# ── THE PRIORITY VOCABULARY ──────────────────────────────────────────────────
#   The owner writes a prefix and the system does the right thing without him
#   having to come back and say "go now". That last part is the whole point: a
#   job filed because it matters today should not need a second instruction.
#
#     NOW:        wake the department immediately
#     TODAY:      wake it immediately too — the next scheduled run may be
#                 tomorrow morning, and "today" would then mean "tomorrow"
#     THIS WEEK:  queued; taken at the next scheduled run
#     BACKLOG:    queued; taken when there is nothing more pressing
#     WATCH:      not work to do now — a request for a standing condition
#                 monitor, which the manager turns into a sentinel probe
#     (no prefix) treated as THIS WEEK
#
#   Only NOW and TODAY fire a run here. Everything else changes the file, gets
#   its hash recorded, and waits for its cycle — because every run costs real
#   money (~$0.80 observing, ~$4.67 delegating, both measured) and a BACKLOG
#   idea typed at midnight should not bill one.
#
# ── WHY THE HASH CHECK ───────────────────────────────────────────────────────
#   WatchPaths fires on any write. Obsidian writes while you type and the Git
#   plugin writes when it commits. Without the hash, every keystroke-pause
#   would cost about a dollar.
#
# ── WHAT IT DELIBERATELY DOES NOT DO ─────────────────────────────────────────
#   It does not queue. If a run is already in flight the lock is held and this
#   exits — that run reads the same file and will see the job.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
VAULT="${WEBSITE_TEAM_VAULT:-$HOME/Desktop/swechha-vault}"
DEPARTMENT="${WEBSITE_TEAM_DEPARTMENT:-website}"
STATE="${WEBSITE_TEAM_STATE:-$HOME/.swechha-ai}"
LOCK="${WEBSITE_TEAM_LOCK:-$STATE/run.lock}"
SEEN="$STATE/inbox-seen.$DEPARTMENT"
MIN_INTERVAL="${WEBSITE_TEAM_MIN_INTERVAL:-600}"

INBOX="$VAULT/swechha/$DEPARTMENT/team/inbox.md"
ORG_INBOX="$VAULT/swechha/ai/inbox.md"

mkdir -p "$STATE"

# The `## Open` section, stripped of blanks, HTML comments and the horizontal
# rule that sits inside the awk range. That rule counting as a job is why an
# empty inbox once looked occupied.
#
# ★ UNREADABLE IS NOT EMPTY. On 2026-09-11 this returned nothing because a
#   launchd-spawned process cannot read ~/Desktop at all — macOS TCC protects
#   it and an agent inherits no grant and can show no prompt. The watcher fired
#   correctly, read nothing, concluded "no open jobs", recorded the hash and
#   exited 0. Silent, plausible, and wrong: every scheduled run would have
#   reported an empty inbox forever. Refuse loudly instead.
open_section() {
  if [ ! -r "$1" ]; then
    if [ -e "$1" ]; then
      echo "on-change: REFUSED — cannot READ $1" >&2
      echo "on-change: a launchd job has no access to ~/Desktop (macOS TCC)." >&2
      echo "on-change: grant Full Disk Access, or move the vault outside Desktop." >&2
    else
      echo "on-change: REFUSED — $1 does not exist" >&2
    fi
    exit 4
  fi
  awk '/^## Open/{f=1;next} /^## Done/{f=0} f' "$1" \
    | grep -vE '^[[:space:]]*(<!--.*-->)?[[:space:]]*$' \
    | grep -vE '^[[:space:]]*-{3,}[[:space:]]*$' || true
}

BOTH="$( { open_section "$INBOX"; open_section "$ORG_INBOX"; } )"
CURRENT="$(printf '%s' "$BOTH" | shasum | cut -d' ' -f1)"
JOBS="$(printf '%s' "$BOTH" | grep -c . || true)"

# Urgent = a line whose first word, after any markdown heading or bullet
# marker, is NOW: or TODAY:. Case-insensitive, because the owner types fast.
URGENT="$(printf '%s' "$BOTH" \
  | sed -E 's/^[[:space:]]*([#]+|[-*])[[:space:]]*//' \
  | grep -icE '^(NOW|TODAY)[[:space:]]*:' || true)"

if [ "$JOBS" -eq 0 ]; then
  echo "$CURRENT" > "$SEEN"
  exit 0
fi

if [ -f "$SEEN" ] && [ "$(cat "$SEEN")" = "$CURRENT" ]; then
  exit 0   # written, but the open jobs are identical
fi

if [ "$URGENT" -eq 0 ]; then
  # The list changed but nothing is urgent. Record it so this does not
  # re-evaluate on every subsequent save, and leave it to the next cycle.
  echo "$CURRENT" > "$SEEN"
  echo "on-change: jobs changed, none marked NOW or TODAY — leaving it for the next scheduled run"
  exit 0
fi

if [ -d "$LOCK" ]; then
  # A run is in flight and reads the same file. Do not queue a second one, and
  # deliberately do NOT record the hash — if that run started before the job
  # was saved, the next write still triggers.
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
echo "on-change: $URGENT urgent item(s) — running the department now"
python3 "$REPO/scripts/website-team/log-event.py" "$DEPARTMENT" runner \
  run_triggered by=inbox-urgent urgent="$URGENT" jobs="$JOBS" 2>/dev/null || true
exec "$REPO/scripts/website-team/run.sh" work
