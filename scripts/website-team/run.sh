#!/usr/bin/env bash
# The Website Manager's scheduled run.
#
# WHY PLAIN `-p` AND NOT `--bare`:
#   `--bare` is the flag Claude Code's docs recommend for scripted calls, and it
#   is the one that does NOT use the subscription login — it requires
#   ANTHROPIC_API_KEY and never reads the keychain. Plain `-p` uses the
#   subscription. Taking the recommended flag would silently move this from free
#   to billed. The docs also say `--bare` will become the default for `-p` in a
#   future release; if that lands, this script must pin the old behaviour
#   explicitly or it will start failing (or billing). Re-read this after any
#   Claude Code upgrade.
#
# WHY NO `--permission-prompts none`:
#   The docs recommend it for unattended runs, and it requires Claude Code
#   v2.1.259 or later. This machine is on 2.1.232, where the flag is rejected
#   outright with "unknown option". `--permission-mode dontAsk` already denies
#   anything outside the allow rules, so an unattended run cannot block on a
#   prompt. Add the flag once the CLI is new enough; it makes Claude stop
#   retrying denied requests, which dontAsk alone does not.
#
# WHY THE MANAGER HAS NO Write TOOL:
#   Its report comes back on stdout and THIS script writes it to the vault. An
#   orchestrator with no hands cannot turn a synthesis error into a shipped
#   change. Do not "simplify" by giving it Write.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
VAULT="${WEBSITE_TEAM_VAULT:-$HOME/Desktop/swechha-vault}"
RECORDS="$VAULT/swechha/website/decisions"
STAMP="$(date +%Y-%m-%d)"
# MODE: `work` (daily) or `review` (weekly). Anything else is rejected rather
# than defaulted, because a typo silently running the wrong mode is worse than
# not running.
MODE="${1:-work}"
DRY=""
[ "${2:-}" = "--dry-run" ] && DRY="--dry-run"
[ "$MODE" = "--dry-run" ] && { DRY="--dry-run"; MODE="work"; }
case "$MODE" in
  work|review) ;;
  *) echo "usage: run.sh [work|review] [--dry-run]" >&2; exit 2 ;;
esac
OUT="$RECORDS/$STAMP-website-team-$MODE.md"

cd "$REPO"
EV="$REPO/scripts/website-team/log-event.py"
ev() { python3 "$EV" website manager "$@" 2>/dev/null || true; }

if [ "$MODE" = "review" ]; then
  PROMPT="Run in **review** mode. Read the inbox first, then this week's run
records in $RECORDS. Write the week's account for the owner: what changed, what
it cost, what you decided and why, what you got wrong, and what is waiting on
them. Written for someone who has not been watching. Short."
else
  PROMPT="Run in **work** mode. Read the inbox first, then observe, diagnose and
prioritise.

You are read-only this run, by design: your session has no write tools at all.
Where work needs doing, write the brief for the specialist under \`## Delegated\`
— name the files, the question, and what would count as done. A second stage
executes those briefs with the permissions for it; your job is to decide what
should happen and to be right about it.

Report in the format your role file specifies. Name files. Say plainly if
nothing needs doing — a quiet report is a good outcome."
fi

# THE ALLOWLIST IS THE SECURITY BOUNDARY, not the role file.
#
# A role file's `tools:` line says what the agent may ask for. This says what it
# may actually have. The manager is granted write in EXACTLY two directories --
# .claude/agents/ so it can recruit by writing a job description, and
# docs/website-team/ so it can record lessons and update the roster. It has no
# write path into app/, public/, scripts/, data/ or any config, so it cannot
# change what the site says however it reasons about it.
#
# docs/website-team/policy.json is deliberately NOT writable: it is the human's
# file, and an agent that can edit its own never-list has none. The manager's
# role file states this too, but belt and braces -- state it here, where it is
# enforced rather than requested.
# THE MANAGER HAS NO FILE-WRITE PATH AT ALL. It reports; this script writes.
#
# An earlier version granted it scoped write so it could create a recruit's job
# description itself. Two things killed that. First, `Write(path)` rules are
# ACCEPTED AND NEVER CONSULTED -- the permissions reference says so outright, so
# the rule was decorative and the write was denied anyway. Second, and the real
# reason: under `dontAsk` the write stayed blocked even with `Edit(path)` rules,
# and rather than widen permissions until it worked, the manager now emits the
# job description in its report for a human to save. A new agent is a new actor
# on a live NGO's website; it should have a human gate, and this gives it one for
# free.
ALLOWED='Read,Grep,Glob'
ALLOWED="$ALLOWED,Bash(git log:*),Bash(git status:*),Bash(gh run list:*)"
ALLOWED="$ALLOWED,Bash(npm test),Bash(npm run lint),Bash(npm run air:status)"

if [ "$DRY" = "--dry-run" ]; then
  echo "repo:    $REPO"
  echo "vault:   $VAULT"
  echo "record:  $OUT"
  echo "agent:   website-manager"
  echo "tools:   $ALLOWED"
  echo
  echo "would run: claude -p --agent website-manager --permission-mode dontAsk \\"
  echo "             --allowedTools '$ALLOWED' --output-format json"
  exit 0
fi

mkdir -p "$RECORDS"
ev run_started mode="$MODE"

RESULT="$(claude -p "$PROMPT" \
  --agent website-manager \
  --permission-mode dontAsk \
  --allowedTools "$ALLOWED" \
  --output-format json < /dev/null 2>/dev/null)"

PARSED="$(printf '%s' "$RESULT" | python3 "$REPO/scripts/website-team/parse-result.py")"
COST="$(printf '%s' "$PARSED" | head -1)"
TEXT="$(printf '%s' "$PARSED" | tail -n +2)"

{
  echo "---"
  echo "title: Website team run — $STAMP"
  echo "source: scripts/website-team/run.sh, claude -p --agent website-manager"
  echo "cost_usd_estimate: $COST"
  echo "---"
  echo
  echo "# Website team run — $STAMP"
  echo
  echo "_Generated. The cost figure is Claude Code's own client-side estimate and"
  echo "can differ from the real bill. Verification in this run is against the"
  echo "local repository only; swechha.in returns 403 to this machine._"
  echo
  printf '%s\n' "$TEXT"
} > "$OUT"

ev run_finished mode="$MODE" cost_usd="$COST" record="$(basename "$OUT")"
echo "wrote $OUT"

# ── STAGE TWO: hand each brief to its specialist ─────────────────────────────
# The manager decided; this executes. Only `work` mode delegates, and only
# engineering may act -- execute.sh refuses a read-only specialist outright.
if [ "$MODE" = "work" ]; then
  BRIEFS="$(mktemp -d)"
  MAPPING="$(printf '%s' "$TEXT" | python3 "$REPO/scripts/website-team/extract-briefs.py" "$BRIEFS" || true)"
  if [ -z "$MAPPING" ]; then
    echo "stage two: no execution briefs in this report"
  else
    while read -r spec model path; do
      [ -z "$spec" ] && continue
      echo "stage two: $spec ($model) <- $(basename "$path")"
      if [ "$spec" != "website-engineering" ]; then
        echo "stage two: skipped — $spec is read-only by policy; its findings are already in the record"
        continue
      fi
      "$REPO/scripts/website-team/execute.sh" "$spec" "$path" ||         echo "stage two: $(basename "$path") did not ship — see output above"
    done <<< "$MAPPING"
  fi
  rm -rf "$BRIEFS"
fi

# Push the record. Obsidian only syncs while it is open, so a scheduled run must
# push for itself or the record sits local until someone opens the app.
if git -C "$VAULT" diff --quiet --exit-code -- "$OUT" 2>/dev/null && \
   [ -z "$(git -C "$VAULT" status --porcelain -- "$OUT")" ]; then
  echo "no change to record"
else
  git -C "$VAULT" add "$OUT"
  git -C "$VAULT" commit -q -m "website team: scheduled run $STAMP"
  git -C "$VAULT" push -q origin main && echo "pushed record to vault"
fi
