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
#
# WHY THE SCRIPTS COME FROM $REPO BUT THE WORK HAPPENS IN $WORK:
#   The department operates in its own git worktree (scripts/website-team/
#   worktree.sh explains why). The helpers stay in the main checkout, because
#   stage two checks out a branch in $WORK and a helper living there would be
#   swapped out from under a running script -- that is not hypothetical, it is
#   how the first stage-two run deleted its own parser mid-run.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
WT="$REPO/scripts/website-team/worktree.sh"
VAULT="${WEBSITE_TEAM_VAULT:-$HOME/swechha-vault}"

# ── THE ORG-WIDE CONVENTION, NOT THIS DEPARTMENT'S INVENTION ─────────────────
# Every path below is DERIVED from $DEPARTMENT, so the second department
# changes one variable rather than reinventing a task system. The convention
# these three lines implement is specified in the vault at
# swechha/ai/README.md, which is the single source of truth for the whole AI
# organisation; lib/website-team-inbox.test.ts asserts this file still conforms
# to it. If you change a path here, change the spec — or the owner learns a
# different system per department, which is the thing that spec exists to stop.
#
# The shared code deliberately does NOT live in the vault: the vault is shared
# with Swechha colleagues, and a script stored there would be editable by
# anyone with vault access while running unattended with write access to a live
# site. The spec travels between repositories; the executable does not.
DEPARTMENT="${WEBSITE_TEAM_DEPARTMENT:-website}"
RECORDS="$VAULT/swechha/$DEPARTMENT/decisions"
INBOX="$VAULT/swechha/$DEPARTMENT/team/inbox.md"
ORG_INBOX="$VAULT/swechha/ai/inbox.md"
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
OUT="$RECORDS/$STAMP-$DEPARTMENT-team-$MODE.md"

EV="${SWECHHA_LOG_EVENT:-$HOME/.swechha-ai/log-event.py}"
ev() { python3 "$EV" "$DEPARTMENT" manager "$@" 2>/dev/null || true; }

if [ "$MODE" = "review" ]; then
  PROMPT="Run in **review** mode. Read BOTH inboxes first — this department's
at $INBOX and the organisation's at $ORG_INBOX — then this week's run
records in $RECORDS. Write the week's account for the owner: what changed, what
it cost, what you decided and why, what you got wrong, and what is waiting on
them. Written for someone who has not been watching. Short."
else
  PROMPT="Run in **work** mode. Read BOTH inboxes first, then observe, diagnose
and prioritise.

  - This department's inbox: $INBOX
  - The organisation's inbox: $ORG_INBOX

An item in either outranks your own priorities. In the ORG inbox, act only on
what names this department ($DEPARTMENT) or is plainly its own; anything
genuinely ambiguous you REPORT rather than do, saying whose it looks like — two
departments must never both act on one job. You cannot edit either file, so
report what you did with each item under \`## Inbox\`.

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
#
# ★ EVERY COMMAND NEEDS ITS `:*` FORM TOO, OR AN ARGUMENT DENIES IT.
#   `Bash(npm run infra:status)` is an EXACT-MATCH rule. It permits
#   `npm run infra:status` and refuses `npm run infra:status --fresh`. That is
#   not a guess: on 2026-09-11 the Manager reported the instrument denied, and
#   a two-run test under this exact allowlist returned DENIED for the argument
#   form and ALLOWED once `Bash(npm run infra:status:*)` was added. Every npm
#   rule here had the same defect, which is most of what the lessons file
#   records as "the allowlist is narrower than it looks".
#
#   A role file that names a command the allowlist withholds is an instruction
#   the agent cannot follow, and it fails as a refusal the agent then has to
#   explain rather than as an error anyone notices. `lib/website-team-infra.test.ts`
#   now derives the check from the role file so the two cannot drift.
ALLOWED='Read,Grep,Glob'
ALLOWED="$ALLOWED,Bash(git log:*),Bash(git status:*),Bash(gh run list:*)"
# Read-only gh, so the Manager can see whether a PR merged and what a gate said.
# NOT bare `gh api`: that is a verb-agnostic tool which would also POST.
ALLOWED="$ALLOWED,Bash(gh pr list:*),Bash(gh pr view:*),Bash(gh pr checks:*)"
ALLOWED="$ALLOWED,Bash(npm test),Bash(npm test:*)"
ALLOWED="$ALLOWED,Bash(npm run lint),Bash(npm run lint:*)"
ALLOWED="$ALLOWED,Bash(npm run air:status),Bash(npm run air:status:*)"
# Infrastructure awareness is the Manager's job, so it must be able to read the
# instrument. Deterministic, cached, and it makes at most one request per
# provider per TTL -- see swechha-ai/infra-status.py.
ALLOWED="$ALLOWED,Bash(npm run infra:status),Bash(npm run infra:status:*)"

if [ "$DRY" = "--dry-run" ]; then
  echo "repo:     $REPO   (scripts come from here)"
  echo "worktree: $("$WT" path)   (the run happens here)"
  echo "vault:    $VAULT"
  echo "dept:     $DEPARTMENT"
  echo "inbox:    $INBOX"
  echo "org inbox: $ORG_INBOX"
  echo "record:   $OUT"
  echo "agent:    website-manager"
  echo "tools:    $ALLOWED"
  echo
  echo "would run: claude -p --agent website-manager --permission-mode dontAsk \\"
  echo "             --allowedTools '$ALLOWED' --output-format json"
  exit 0
fi

# ── PREFLIGHT: CAN WE ACTUALLY REACH THE VAULT? ──────────────────────────────
# Check BEFORE spending anything. A launchd-spawned process cannot read or
# write ~/Desktop — macOS TCC protects it, an agent inherits no grant and can
# show no prompt. Without this check the run reads an empty inbox, reports "no
# open items", calls the model, and only then dies trying to write its record:
# a wasted ~$1 and a false account of the owner's own instructions. Found
# 2026-09-11 when the inbox watcher fired and silently read nothing.
if [ ! -r "$INBOX" ] || ! mkdir -p "$RECORDS" 2>/dev/null || [ ! -w "$RECORDS" ]; then
  echo "run.sh: REFUSED — the vault is not reachable from this process." >&2
  echo "run.sh:   inbox readable:   $([ -r "$INBOX" ] && echo yes || echo NO)  ($INBOX)" >&2
  echo "run.sh:   records writable: $([ -w "$RECORDS" ] && echo yes || echo NO)  ($RECORDS)" >&2
  echo "run.sh: If this ran from launchd, it is macOS TCC: ~/Desktop is protected" >&2
  echo "run.sh: and a launch agent has no access. Grant Full Disk Access to the" >&2
  echo "run.sh: job, or move the vault outside ~/Desktop. Nothing was spent." >&2
  python3 "$EV" "$DEPARTMENT" runner run_refused reason=vault-unreachable 2>/dev/null || true
  exit 5
fi

# ── ONE RUN AT A TIME, IN THE DEPARTMENT'S OWN TREE ──────────────────────────
# Both schedules fire at 09:00, so on Mondays `work` and `review` start
# together. They share one worktree, so they must not overlap: the lock makes
# the second wait rather than read a tree the first is mid-checkout of.
"$WT" lock "$$"
trap '"$WT" unlock' EXIT
WORK="$("$WT" ensure)"
cd "$WORK"

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
# ── The task spine ───────────────────────────────────────────────────────────
# Stage two's briefs are mktemp files destroyed at the end of the run, so every
# delegation this department has ever made has left no durable trace of what was
# asked or whether it shipped. `org status` could therefore answer nothing. These
# helpers record the TITLE and the OUTCOME of each brief as a task.
#
# ★ NEVER THE BRIEF'S BODY. A brief is a prompt, and swechha/ai/events.md excludes
#   prompts and model output from the stream because it is plain text a renderer
#   reads. Title and outcome are what a person needs; the body stays ephemeral and
#   is destroyed with the run, exactly as now.
#
# ★ IT MUST NEVER BREAK THE RUN. Every call is guarded by [ -x ] and swallows its
#   own failure, the same rule hook-event.py follows. Bookkeeping that can stop the
#   department has traded something that matters for something that does not. With
#   the spine uninstalled this file behaves exactly as it did before.
ORG="${ORG_CLI:-$HOME/.swechha-ai/org}"

spine_new() {   # <title> -> task id on stdout, or nothing
  [ -x "$ORG" ] || return 0
  "$ORG" task new website "$1" --origin schedule 2>/dev/null || true
}

spine_close() { # <task id> <done|refused|escalate> <note>
  [ -x "$ORG" ] || return 0
  [ -n "$1" ] || return 0
  case "$2" in
    done)     "$ORG" task done    "$1" --outcome "$3"  >/dev/null 2>&1 || true ;;
    # A brief this department declined to execute is CLOSED, not escalated. Only
    # something genuinely stuck belongs in "needs you"; a queue full of routine
    # skips is a queue nobody reads.
    refused)  "$ORG" task refuse  "$1" "$3"            >/dev/null 2>&1 || true ;;
    # A brief that did not ship STAYS VISIBLE until a person moves it. This is the
    # structural answer to a task being skipped 682 times while reporting success.
    escalate) "$ORG" task escalate "$1" --reason "$3"  >/dev/null 2>&1 || true ;;
  esac
}

if [ "$MODE" = "work" ]; then
  BRIEFS="$(mktemp -d)"
  MAPPING="$(printf '%s' "$TEXT" | python3 "$REPO/scripts/website-team/extract-briefs.py" "$BRIEFS" || true)"
  if [ -z "$MAPPING" ]; then
    echo "stage two: no execution briefs in this report"
  else
    while read -r spec model path; do
      [ -z "$spec" ] && continue
      echo "stage two: $spec ($model) <- $(basename "$path")"
      # extract-briefs.py writes the title as the brief's first line.
      TITLE="$(head -1 "$path" 2>/dev/null || true)"
      [ -n "$TITLE" ] || TITLE="$(basename "$path")"
      TASK="$(spine_new "$TITLE")"
      if [ -n "$TASK" ]; then
        "$ORG" task claim "$TASK" "$spec" >/dev/null 2>&1 || true
      fi
      if [ "$spec" != "website-engineering" ]; then
        echo "stage two: skipped — $spec is read-only by policy; its findings are already in the record"
        spine_close "$TASK" refused "read-only specialist; the findings are in the run record"
        continue
      fi
      # THREE ARGUMENTS, NOT TWO. execute.sh takes <specialist> <model> <brief>.
      # This call passed <specialist> <brief> when model routing was added, so
      # the brief path landed in $MODEL and every brief died on "unknown model"
      # before a specialist ever started. Stage two has never shipped anything
      # since; caught 2026-09-11 while moving the run into its own worktree.
      # Three outcomes, not two. Exit 4 is "the specialist changed nothing and
      # said why" -- a real result, and never `shipped`. Collapsing it into
      # success is how a brief that could not be done was reported as done.
      set +e
      "$REPO/scripts/website-team/execute.sh" "$spec" "$model" "$path"
      exec_rc=$?
      set -e
      case "$exec_rc" in
        0) spine_close "$TASK" done "shipped" ;;
        4) echo "stage two: $(basename "$path") made no change — recorded as refused, not shipped"
           spine_close "$TASK" refused "the specialist changed nothing and said why" ;;
        *) echo "stage two: $(basename "$path") did not ship — see output above"
           spine_close "$TASK" escalate "execute.sh did not ship it" ;;
      esac
    done <<< "$MAPPING"
  fi
  rm -rf "$BRIEFS"
fi

# ── LAND THE LESSONS ─────────────────────────────────────────────────────────
# AFTER stage two, never before: stage two checks branches out, and a lessons
# commit racing that is how a specialist's branch ends up carrying an unrelated
# docs edit. land-lessons.sh takes its own worktree for the same reason.
#
# Guarded and non-fatal. `swechha/ai/README.md`'s memory model says the
# department may append to its own lessons file; until 2026-09-12 nothing did,
# so every lesson the Manager wrote died in a dated record and the next run paid
# to relearn it.
if [ -x "$REPO/scripts/website-team/land-lessons.sh" ]; then
  "$REPO/scripts/website-team/land-lessons.sh" "$OUT" || \
    echo "run.sh: lessons did not land; the run itself is unaffected"
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
