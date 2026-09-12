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

# ── ONE RUNNER, TWO DEPARTMENTS ──────────────────────────────────────────────
#
# ★ THE COMMENT BELOW PROMISED THIS AND THE CODE DID NOT DELIVER IT. "The second
#   department changes one variable rather than reinventing a task system" was
#   true of the VAULT paths and false of everything else: twelve lines named
#   scripts/website-team/ and docs/website-team/ outright, and the agent was
#   named literally. So fundraising could not use this runner, and on 2026-09-12
#   the owner found out the hard way — the fundraising department had a policy
#   file, a path guard and a worktree script, and no runner to call any of them.
#   Its own policy.json had been recording `claude_code_team: "not yet running"`
#   since it was written.
#
#   Copying this file into the second department was the obvious fix and the
#   wrong one: two 23KB runners that must move in lockstep is the duplicated-
#   machinery defect class this estate keeps paying for. So the file is now
#   genuinely department-neutral, and there is exactly one of it.
#
# THREE DIRECTORIES, AND THEY ARE NOT THE SAME DIRECTORY:
#
#   $LIB    where THIS script and its helpers live. Resolved from the script's
#           own path, so the helpers travel with the runner wherever it is moved
#           to — including into the org spine, which is where it belongs and is
#           now a `git mv` rather than a rewrite, because nothing below names
#           this location.
#   $REPO   the DEPARTMENT'S repository. Its worktree.sh, its guard-paths.sh,
#           its policy.json, its tool grants, its agent definition.
#   $VAULT  the shared record. Already derived from $DEPARTMENT, and was the
#           only thing that ever was.
#
# For $DEPARTMENT=website every path below resolves to the byte-identical string
# it did before this change. That is the point: the live department cannot
# notice, and lib/website-team-spine.test.ts proves it rather than asserting it.
LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ★ THE DEPARTMENT IS READ FIRST NOW, because $REPO and $WT are derived from it.
#   WEBSITE_TEAM_* is still honoured so nothing already scheduled breaks; TEAM_*
#   is the name to use from here, since "WEBSITE_TEAM_DEPARTMENT=fundraising" is
#   a sentence that reads like a bug.
DEPARTMENT="${TEAM_DEPARTMENT:-${WEBSITE_TEAM_DEPARTMENT:-website}}"
REPO="${TEAM_REPO:-${WEBSITE_TEAM_REPO:-$HOME/swechha-$DEPARTMENT}}"
WT="$REPO/scripts/$DEPARTMENT-team/worktree.sh"
VAULT="${TEAM_VAULT:-${WEBSITE_TEAM_VAULT:-$HOME/swechha-vault}}"

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
RECORDS="$VAULT/swechha/$DEPARTMENT/decisions"
INBOX="$VAULT/swechha/$DEPARTMENT/team/inbox.md"
ORG_INBOX="$VAULT/swechha/ai/inbox.md"
STAMP="$(date +%Y-%m-%d)"
# Portable capitalisation. The ${VAR^} form is bash 4 and /bin/bash here is
# 3.2.57, where it is a fatal "bad substitution" -- and the LaunchAgents run
# this under /bin/bash. `bash -n` does not catch it; running it does.
DEPT_TITLE="$(printf '%s' "$DEPARTMENT" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
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
# ★ `gh run list` DOES NOT IMPLY THE REST OF `gh run`. Granting the list and
#   withholding the log is the shape that produced a wrong diagnosis on
#   2026-09-11: the Manager could see that a workflow was red and could not see
#   why, so it reasoned from the workflow's comments instead -- and those
#   comments were themselves wrong. Reading a log is strictly read-only.
ALLOWED="$ALLOWED,Bash(gh run view:*)"
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

# ── THE DEPARTMENT'S OWN READ-ONLY COMMANDS ──────────────────────────────────
# The block above is the shared core plus, for now, the website department's npm
# rules -- harmless to a department that has no npm, and left here rather than
# migrated because lib/website-team-infra.test.ts derives its check from this
# file and moving them would buy tidiness with a broken guard.
#
# A department whose test command is `pytest` rather than `npm test` adds it
# here. The file is OPTIONAL: a department without one gets the core and
# nothing else, and a missing file is never a reason a run cannot start.
#
# ★ IT LIVES UNDER scripts/$DEPARTMENT-team/, WHICH EVERY DEPARTMENT'S PATH
#   GUARD FORBIDS. That is the whole reason it is a shell file there rather
#   than data anywhere else: an agent that can append to its own allowlist has
#   no allowlist. The earned-grants ledger below is the path that IS agent-
#   writable, and tool-grants.py refuses anything it cannot prove read-only.
_DEPT_TOOLS="$REPO/scripts/$DEPARTMENT-team/allowed-tools.sh"
if [ -r "$_DEPT_TOOLS" ]; then
  # shellcheck source=/dev/null
  . "$_DEPT_TOOLS"
fi

# ── EARNED GRANTS ────────────────────────────────────────────────────────────
# docs/website-team/tool-grants.json is data the department may add to;
# tool-grants.py refuses anything it cannot prove read-only, and IT lives in
# scripts/website-team/**, which is GATED. So an agent can grant itself eyes and
# can never grant itself hands -- the thing deciding which is which is not
# something it can edit. A missing or broken ledger grants nothing and is never
# a reason the run cannot start.
_GRANTS="$(python3 "$LIB/tool-grants.py" "$REPO/docs/$DEPARTMENT-team/tool-grants.json" 2>/dev/null || true)"
[ -n "$_GRANTS" ] && ALLOWED="$ALLOWED,$_GRANTS"

if [ "$DRY" = "--dry-run" ]; then
  echo "repo:     $REPO   (scripts come from here)"
  echo "worktree: $("$WT" path)   (the run happens here)"
  echo "vault:    $VAULT"
  echo "dept:     $DEPARTMENT"
  echo "inbox:    $INBOX"
  echo "org inbox: $ORG_INBOX"
  echo "record:   $OUT"
  echo "agent:    $DEPARTMENT-manager"
  echo "tools:    $ALLOWED"
  echo
  echo "would run: claude -p --agent "$DEPARTMENT-manager" --permission-mode dontAsk \\"
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

# ── FILE THE INBOX AS WORK ITEMS, BEFORE SPENDING ANYTHING ───────────────────
# The watcher does this too. Both, because they fail in different directions: the
# watcher can be skipped (a run held the lock, or the edit landed while the Mac
# slept) and a scheduled run can be refused before it reads anything. Running it
# here means a job the owner typed is tracked even on a day the department never
# gets as far as the model -- which is precisely the day it matters, and precisely
# the day it used to vanish.
#
# Placed AFTER the vault preflight so an unreadable inbox is already a loud
# refusal, and BEFORE the ceiling so a refused run still files the work it was
# refused from doing.
python3 "$REPO/scripts/website-team/inbox-intake.py" "$DEPARTMENT" \
  "$INBOX" "$ORG_INBOX" || true

# ── THE DAILY CEILING ────────────────────────────────────────────────────────
# Checked BEFORE the model call, like the vault preflight above and for the same
# reason: a refusal that costs a dollar to discover is not a refusal.
#
# ★ WHAT IT GUARDS AGAINST IS REAL, NOT THEORETICAL. The sentinel wakes this
#   department whenever the PROBLEM SET CHANGES, so a service flapping through
#   the night changes it on every flap. On 2026-09-12 an unscheduled 00:24 wake
#   cost $1.37 -- correct behaviour, and exactly the shape that turns into a
#   bill nobody chose once self-repair adds runs.
#
# ★ IT REFUSES LOUDLY. policy.json's `on_exceeded` says why: a department that
#   goes quiet mid-incident because it hit a number, with nobody told, has
#   turned a cost control into an outage.
#
# ★ THE CEILING LIVES IN policy.json, WHICH THIS DEPARTMENT MAY NOT WRITE. An
#   agent that can raise its own ceiling has no ceiling. A missing or unreadable
#   `cost` block leaves CEILING empty and skips the check -- a brake must not
#   become a second way for a bad parse to stop the department.
CEILING="$(python3 -c "import json;print(json.load(open('$REPO/docs/$DEPARTMENT-team/policy.json')).get('cost',{}).get('daily_ceiling_usd',''))" 2>/dev/null || true)"
if [ -n "$CEILING" ]; then
  SPENT="$(python3 "$LIB/budget.py" 2>/dev/null || echo 0)"
  OVER="$(python3 -c "print(1 if float('${SPENT:-0}') >= float('$CEILING') else 0)" 2>/dev/null || echo 0)"
  if [ "$OVER" = "1" ]; then
    echo "run.sh: REFUSED — today's spend \$$SPENT has reached the \$$CEILING daily ceiling." >&2
    echo "run.sh: Nothing was spent on this run. The ceiling is docs/$DEPARTMENT-team/policy.json" >&2
    echo "run.sh: -> cost.daily_ceiling_usd, and only a human can raise it." >&2
    echo "run.sh: If this is an incident, raise it deliberately rather than waiting for midnight." >&2
    ev run_refused reason=daily-ceiling spent_usd="$SPENT" ceiling_usd="$CEILING"
    ORGB="${ORG_CLI:-$HOME/.swechha-ai/org}"
    if [ -x "$ORGB" ]; then
      BID="$("$ORGB" task new "$DEPARTMENT" "BLOCKED: daily cost ceiling reached (\$$SPENT of \$$CEILING)" --origin schedule 2>/dev/null || true)"
      [ -n "$BID" ] && { "$ORGB" task escalate "$BID" --reason "the department stopped itself; raise cost.daily_ceiling_usd or wait for tomorrow" >/dev/null 2>&1 || true; }
    fi
    exit 6
  fi
  echo "run.sh: budget ok — \$$SPENT of \$$CEILING spent today"
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
  --agent "$DEPARTMENT-manager" \
  --permission-mode dontAsk \
  --allowedTools "$ALLOWED" \
  --output-format json < /dev/null 2>/dev/null)"

PARSED="$(printf '%s' "$RESULT" | python3 "$LIB/parse-result.py")"
COST="$(printf '%s' "$PARSED" | head -1)"
TEXT="$(printf '%s' "$PARSED" | tail -n +2)"

# ── WHAT THE PERMISSION LAYER REFUSED ────────────────────────────────────────
# `--output-format json` carries a `permission_denials` array and this runner
# threw it away for as long as it existed. A cause the agent COULD NOT VERIFY
# must not become the report's headline: on 2026-09-11 both `gh run view
# --log-failed` calls were refused, the Manager said so in one line, and the
# guess it was forced into was printed above that caveat as the finding.
DENIED="$(printf '%s' "$RESULT" | python3 "$LIB/denials.py" 2>/dev/null || true)"

{
  echo "---"
  echo "title: $DEPT_TITLE team run — $STAMP"
  echo "source: $DEPARTMENT-team/run.sh, claude -p --agent $DEPARTMENT-manager"
  echo "cost_usd_estimate: $COST"
  echo "---"
  echo
  echo "# $DEPT_TITLE team run — $STAMP"
  echo
  if [ -n "${DENIED:-}" ]; then
    echo "> [!warning] **BLOCKED — this run was refused tools it asked for.**"
    echo "> Any cause below that was not confirmed from evidence is a HYPOTHESIS,"
    echo "> not a finding. Refused, with the number of attempts:"
    echo ">"
    printf '%s\n' "${DENIED:-}" | while IFS="$(printf '\t')" read -r cmd n; do
      echo "> - \`$cmd\` × ${n:-1}"
    done
    echo
  fi
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

# A blocked run is the owner's to unblock -- nothing downstream can grant a
# permission. It goes on the "needs you" queue rather than into a record that
# reads as routine.
if [ -n "${DENIED:-}" ]; then
  ev run_blocked refused="$(printf '%s' "${DENIED:-}" | cut -f1 | tr '\n' ';')"
  BTASK="$(spine_new "BLOCKED: the $MODE run was refused $(printf '%s' "${DENIED:-}" | wc -l | tr -d ' ') tool(s)")"
  spine_close "$BTASK" escalate "refused: $(printf '%s' "${DENIED:-}" | cut -f1 | tr '\n' ';')"
fi

if [ "$MODE" = "work" ]; then
  BRIEFS="$(mktemp -d)"
  MAPPING="$(printf '%s' "$TEXT" | python3 "$LIB/extract-briefs.py" "$BRIEFS" || true)"
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
      "$LIB/execute.sh" "$spec" "$model" "$path"
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
if [ -x "$LIB/land-lessons.sh" ]; then
  "$LIB/land-lessons.sh" "$OUT" || \
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
