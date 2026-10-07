#!/usr/bin/env bash
# Run the department when the owner adds urgent work — within seconds, not
# tomorrow. Fired by launchd WatchPaths on the inboxes AND on the department's
# task directory in the AI OS store.
#
# ── HUMAN-FILED TASKS ARE WORK TOO ───────────────────────────────────────────
#   The watcher also reacts to tasks a person filed in the task store (CLI, MCP
#   file_task, Command Centre), read through `org task pickup` via
#   filed-for-you.py. They obey the same vocabulary below, applied to the task
#   TITLE. Opt-in per department (TEAM_PICKUP, default `website`; an EMPTY value
#   falls back to the default and a dummy value such as `none` opts everything
#   out): for any department not listed the helper prints nothing and every line
#   of this file behaves exactly as it did before tasks existed.
#
#   ★ TASKS ARE DELIBERATELY NOT PART OF THE INBOX HASH. The first design hashed
#     task ids (and a TASKS-UNKNOWN marker for an unreadable store) into CURRENT.
#     Review found that every readable<->unreadable flip then changed the hash,
#     and with any open inbox NOW/#today line each flip was a PAID wake -- the
#     installed `org` has no `task pickup` yet, so it would have happened at
#     deploy. So the two halves are decided INDEPENDENTLY:
#
#       inbox : hash, URGENT, JOBS and every rule below -- exactly as before.
#       tasks : NEW_URGENT = urgent (NOW/TODAY) pickup ids not yet in
#               $STATE/tasks-seen.$DEPARTMENT, one id per line.
#
#     Wake if (the inbox changed AND is urgent) OR NEW_URGENT > 0, through the
#     same lock and minimum-interval path. The ids are appended to the seen file
#     only when a wake is actually launched (before the exec, like SEEN), so one
#     task never wakes twice, and a held lock or interval records nothing so the
#     next fire re-evaluates. THIS WEEK/BACKLOG/WATCH tasks never wake; the
#     scheduled run picks them up. An UNREADABLE store is NEW_URGENT=0 plus one
#     `task store unreadable` line: a store problem can never cause a wake, and
#     nothing about it is hashed. (Unreadable is still not "empty" -- run.sh
#     tells the manager UNKNOWN; this only declines to spend money on it.)
#
#     The first run after deploy treats every urgent task already open as new
#     and wakes once for them. That is intended: they are unworked.
#
# ── THE PRIORITY VOCABULARY ──────────────────────────────────────────────────
#   The owner writes a prefix and the system does the right thing without him
#   having to come back and say "go now". That last part is the whole point: a
#   job filed because it matters today should not need a second instruction.
#
#     NOW:        wake the department immediately
#     TODAY:      wake it immediately too — the next scheduled run may be
#                 tomorrow morning, and "today" would then mean "tomorrow"
#
#   The Obsidian TAG forms `#now` and `#today` mean exactly the same thing and
#   are accepted wherever the colon forms are. The owner reaches for tags
#   because Obsidian autocompletes them and they are clickable; on 2026-09-12
#   five jobs filed as `#today` sat unworked because only `TODAY:` matched.
#   Tags are matched only at the START of a line, like every other prefix, so
#   prose mentioning #now in passing still does not wake anyone. A tag must end
#   at a non-word character: `#nowhere` and `#todayish` are different tags and
#   do not match.
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
#
#   It does not close anything. A line leaving `## Open` is evidence the file
#   changed, not evidence the work happened; see inbox-intake.py.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
VAULT="${WEBSITE_TEAM_VAULT:-$HOME/swechha-vault}"
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
INBOX_JOBS="$(printf '%s' "$BOTH" | grep -c . || true)"
JOBS="$INBOX_JOBS"
# Age of the last recorded run, read BEFORE anything below rewrites SEEN: a
# non-urgent inbox record in this same invocation must not look like a recent run.
SEEN_AGE=""
if [ -f "$SEEN" ]; then SEEN_AGE=$(( $(date +%s) - $(stat -f %m "$SEEN") )); fi

# Urgent = a line that OPENS with NOW/TODAY, in either the colon form
# (`TODAY:`) or the Obsidian tag form (`#today`). Case-insensitive, because the
# owner types fast.
#
# Strip every leading marker first, not just one: `- #today ...` carries a
# bullet AND a tag, and a single strip left `#today` sitting where the matcher
# expected the keyword. Heading hashes are stripped only when FOLLOWED BY
# WHITESPACE — that is what a markdown heading is — so `### TODAY:` loses its
# hashes while the `#` of `#today` survives to be recognised as a tag.
URGENT="$(printf '%s' "$BOTH" \
  | sed -E 's/^([[:space:]]*(#+[[:space:]]+|[-*+][[:space:]]*|\[[ xX]\][[:space:]]*))+//' \
  | grep -icE '^(#?(NOW|TODAY)[[:space:]]*:|#(NOW|TODAY)([^[:alnum:]_-]|$))' || true)"

# ── THE TASK STORE: NEW URGENT TASKS ONLY (see the header) ───────────────────
#   Opt-in aware: the helper prints NOTHING for a department that has not adopted
#   this, so NEW_URGENT stays 0 and nothing below changes. `|| true` throughout:
#   bookkeeping never stops the department. Nothing here touches CURRENT.
TASKS_SEEN="$STATE/tasks-seen.$DEPARTMENT"
NEW_URGENT=0
NEW_URGENT_IDS=""
TASK_JSON="$(python3 "$REPO/scripts/website-team/filed-for-you.py" "$DEPARTMENT" --json --limit 1000 2>/dev/null || true)"
if [ -n "$TASK_JSON" ]; then
  TASK_PARSED="$(printf '%s' "$TASK_JSON" | python3 -c '
import json, sys
seen = set()
try:
    seen = set(l.strip() for l in open(sys.argv[1]) if l.strip())
except Exception:
    pass
try:
    d = json.load(sys.stdin)
    if not isinstance(d, dict) or d.get("ok") is not True or not isinstance(d.get("tasks"), list):
        raise ValueError(str(d.get("reason") if isinstance(d, dict) and d.get("reason") else "the pickup read reported ok:false"))
    new = sorted(str(x["id"]) for x in d["tasks"]
                 if isinstance(x, dict) and x.get("id") and x.get("priority") in ("NOW", "TODAY")
                 and str(x["id"]) not in seen)
    print("OK")
    print(" ".join(new))
except Exception as e:
    print("UNKNOWN")
    print(str(e).replace("\n", " ")[:160])
' "$TASKS_SEEN" 2>/dev/null || true)"
  if [ "$(printf '%s\n' "$TASK_PARSED" | sed -n 1p)" = "OK" ]; then
    NEW_URGENT_IDS="$(printf '%s\n' "$TASK_PARSED" | sed -n 2p)"
    NEW_URGENT="$(printf '%s' "$NEW_URGENT_IDS" | wc -w | tr -d ' ')"
  else
    TASK_REASON="$(printf '%s\n' "$TASK_PARSED" | sed -n 2p)"
    echo "on-change: task store unreadable (${TASK_REASON:-no reason given}) — inbox rules only" >&2
  fi
fi
CURRENT="$(printf '%s' "$BOTH" | shasum | cut -d' ' -f1)"

# ── FILE EVERY OPEN LINE AS A WORK ITEM, BEFORE DECIDING WHETHER TO WAKE ANYONE ─
#   Tracking and waking are different questions and conflating them is what made
#   this file lose work. A non-urgent line used to be answered by recording the
#   hash and saying "leaving it for the next scheduled run" -- to /tmp, which
#   nobody reads, with the hash recorded so it would never re-trigger. On
#   2026-09-12 that next run was refused on cost and five jobs simply ceased to
#   exist anywhere. A task survives a refused run; a recorded hash does not.
#
#   It runs BEFORE the hash short-circuit on purpose: the hash says the OPEN LIST
#   is unchanged, which is not the same as saying every line in it was filed. If
#   the store was unreachable last time, this is the pass that catches up.
#
#   `|| true` because bookkeeping may never stop the department, the same rule
#   run.sh follows for the spine. It is idempotent -- filing is keyed on the task
#   store, not on a marker -- so running it on every save costs one read.
#
# ★ THIS DEPARTMENT'S INBOX ONLY, as in run.sh. `org route` watches the org
#   inbox itself (WatchPaths, launchd in.swechha.org-route) and files it; this
#   was the second filer of audit defect 7. The org inbox still WAKES the
#   department above -- waking and filing are different questions.
if [ "$INBOX_JOBS" -gt 0 ]; then
  python3 "$REPO/scripts/website-team/inbox-intake.py" "$DEPARTMENT" "$INBOX" || true
fi

# The inbox half decides on its own, exactly as before; INBOX_WAKE says whether
# it wants a run. A new urgent task (NEW_URGENT) is the only other reason.
INBOX_WAKE=0
if [ "$JOBS" -eq 0 ]; then
  echo "$CURRENT" > "$SEEN"
elif [ -f "$SEEN" ] && [ "$(cat "$SEEN")" = "$CURRENT" ]; then
  :   # written, but the open jobs are identical
elif [ "$URGENT" -eq 0 ]; then
  # The list changed but nothing is urgent. Record it so this does not
  # re-evaluate on every subsequent save, and leave it to the next cycle.
  echo "$CURRENT" > "$SEEN"
  echo "on-change: jobs changed, none marked NOW or TODAY — leaving it for the next scheduled run"
else
  INBOX_WAKE=1
fi

if [ "$INBOX_WAKE" -eq 0 ] && [ "$NEW_URGENT" -eq 0 ]; then
  exit 0
fi

if [ -d "$LOCK" ]; then
  # A run is in flight and reads the same file. Do not queue a second one, and
  # deliberately do NOT record the hash or the task ids — if that run started
  # before the job was saved, the next write still triggers.
  echo "on-change: a run is already in flight — it will see this" >&2
  exit 0
fi

if [ -n "$SEEN_AGE" ] && [ "$SEEN_AGE" -lt "$MIN_INTERVAL" ]; then
  echo "on-change: last run was ${SEEN_AGE}s ago (min ${MIN_INTERVAL}s) — holding" >&2
  exit 0
fi

if [ "$INBOX_WAKE" -eq 1 ]; then
  WAKE_URGENT=$(( URGENT + NEW_URGENT )); WAKE_BY="inbox-urgent"
else
  WAKE_URGENT="$NEW_URGENT"; WAKE_BY="task-urgent"
fi
if [ "$NEW_URGENT" -gt 0 ]; then
  # Record the ids BEFORE the exec, like SEEN, so one task never wakes twice.
  { [ -f "$TASKS_SEEN" ] && cat "$TASKS_SEEN"; printf '%s\n' $NEW_URGENT_IDS; } > "$TASKS_SEEN.tmp.$$" \
    && mv "$TASKS_SEEN.tmp.$$" "$TASKS_SEEN" || true
fi
echo "$CURRENT" > "$SEEN"
echo "on-change: $WAKE_URGENT urgent item(s) — running the department now"
python3 "${SWECHHA_LOG_EVENT:-$HOME/.swechha-ai/log-event.py}" "$DEPARTMENT" runner \
  run_triggered by="$WAKE_BY" urgent="$WAKE_URGENT" jobs="$JOBS" 2>/dev/null || true
# ★ THROUGH THE SNAPSHOT, NOT STRAIGHT AT THE REPO. This line read
#
#       exec "$REPO/scripts/website-team/run.sh" work
#
#   which is precisely the defect snapshot-run.sh was written to close, left
#   open in the ONE ENTRY POINT THAT FIRES MOST OFTEN. #171 ("a running script
#   must not be edited underneath it") fixed the two launchd jobs that call
#   snapshot-run.sh and never touched this one, because the fix was applied to
#   the call sites somebody remembered rather than to all of them.
#
# ★ WHY IT MATTERS HERE MORE THAN ANYWHERE. This job is triggered by WatchPaths
#   on the vault's inbox files, so it fires whenever the vault is written --
#   which is exactly when somebody is working, and therefore exactly when the
#   repository is most likely to be mid-edit. Bash reads a script incrementally
#   by byte offset: edit run.sh underneath a running copy and execution resumes
#   at a stale offset, landing anywhere.
#
#   Measured 2026-09-13/14: run.sh was committed at 23:07, 23:23, 01:51 and
#   02:04, and runs left `run_started` with no terminal event at 22:22, 22:54,
#   23:55, 00:25, 00:56 and 01:26 -- one of them dying with
#   "line 629: TEXT: unbound variable", a variable assigned unconditionally a
#   hundred lines above the line that could not see it.
exec "$REPO/scripts/website-team/snapshot-run.sh" work
