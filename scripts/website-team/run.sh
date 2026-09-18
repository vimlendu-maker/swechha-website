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
# ★ FROM $REPO, AND DELIBERATELY NOT FROM THE SNAPSHOT. I changed this to
#   "$LIB/worktree.sh" so it would travel with snapshot-run.sh, and
#   lib/website-team-inbox.test.ts refused it: "the department supplies its own
#   worktree script". It is right. One runner serves two departments, and
#   fundraising's worktree.sh lives in ~/swechha-fundraising -- taking it from
#   the website snapshot would hand fundraising the wrong repository's tree
#   management, which is a far worse failure than the one I was closing.
#
#   The residual risk is accepted and it is small: worktree.sh is invoked as a
#   SUBPROCESS, so each call reads a whole consistent file. That is nothing like
#   bash resuming mid-statement in a rewritten script, which is what
#   snapshot-run.sh exists to prevent.
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

# ★ DEFINED HERE, BESIDE `ev`, NOT BESIDE THE TRAP THAT READS IT. The first
#   version put these three lines next to `trap on_exit EXIT` — two hundred
#   lines BELOW the first `stage` call, so every run would have died on
#   "stage: command not found" under `set -e`. A progress marker that kills the
#   run it is meant to explain is worse than no marker at all. Caught by
#   checking definition order against first use, not by reading it back.
STAGE="startup"
ENDED=0
stage() { STAGE="$1"; }

# ★ WHAT IS ALREADY FILED, BECAUSE THIS MANAGER HAS NEVER BEEN TOLD. It
#   re-derives its work from the site on every run, so it observed the same
#   unstyled CSS four mornings running and wrote four differently-worded briefs
#   for it -- four tasks for ONE bug, and four of the six `fix(teach)` items
#   that sat in NEEDS YOU until a human read them side by side on 2026-09-14
#   and found every one obsolete.
#
#   THE SPINE CANNOT DEDUPE THESE AND DELIBERATELY DOES NOT TRY: a near-match
#   rule "would eventually fold 'section 3' into 'section 4'", so it folds a
#   repeat only when a caller declares two filings are one condition with --key.
#   A brief carries no key because only the MANAGER knows whether today's
#   observation is yesterday's task. So the manager is the actor that must be
#   given the list.
#
#   `|| true`, and a self-describing fallback: a runner must not die because the
#   spine is unreadable, and an empty string must never be mistaken for
#   "nothing is open" -- which is the reading that licenses a duplicate.
OPEN_TASKS="$(python3 "$LIB/open-tasks.py" "$DEPARTMENT" --limit 20 2>/dev/null || true)"
[ -n "$OPEN_TASKS" ] || OPEN_TASKS="ALREADY OPEN: UNKNOWN — this run could not read the task list. Treat that as 'there may be open tasks', never as 'there are none'."

if [ "$MODE" = "review" ]; then
  PROMPT="Run in **review** mode. Read BOTH inboxes first — this department's
at $INBOX and the organisation's at $ORG_INBOX — then this week's run
records in $RECORDS. Write the week's account for the owner: what changed, what
it cost, what you decided and why, what you got wrong, and what is waiting on
them. Written for someone who has not been watching. Short.

$OPEN_TASKS

Two things follow from that list, and they matter more than they look:

  - DO NOT write a brief for something already on it. Say under \`## Inbox\` which
    open task your observation matches, and move on. A second task for one
    condition is a queue nobody reads, and this department has already produced
    four for a single bug.
  - IF YOU BELIEVE AN OPEN TASK IS ALREADY FIXED, say so under \`## Resolved\`
    with its id and the evidence you actually checked. You cannot close it and
    must not try; a human decides. An agent that could close the record of its
    own unfinished work would have no record."
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
nothing needs doing — a quiet report is a good outcome.

$OPEN_TASKS

Two things follow from that list, and they matter more than they look:

  - DO NOT write a brief for something already on it. Say under \`## Inbox\` which
    open task your observation matches, and move on. A second task for one
    condition is a queue nobody reads, and this department has already produced
    four for a single bug.
  - IF YOU BELIEVE AN OPEN TASK IS ALREADY FIXED, say so under \`## Resolved\`
    with its id and the evidence you actually checked. You cannot close it and
    must not try; a human decides. An agent that could close the record of its
    own unfinished work would have no record."
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
# ★ THE ROLE FILE NAMED THIS AND THE ALLOWLIST DID NOT GRANT IT, which is the
#   exact drift the comment above warns about -- "an instruction the agent
#   cannot follow, and it fails as a refusal the agent then has to explain".
#   Refused on three separate runs before anybody noticed, because the refusal
#   was buried among commands the manager had merely improvised.
#   scripts/verify-seo.mjs opens nothing but readFileSync/readdirSync/statSync/
#   existsSync: read-only, so granting it widens nothing that matters.
ALLOWED="$ALLOWED,Bash(npm run verify:seo),Bash(npm run verify:seo:*)"

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
stage inbox-intake
python3 "$LIB/inbox-intake.py" "$DEPARTMENT" \
  "$INBOX" --org-inbox "$ORG_INBOX" || true

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
stage cost-ceiling
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
    ENDED=1
    ORGB="${ORG_CLI:-$HOME/.swechha-ai/org}"
    if [ -x "$ORGB" ]; then
      # Keyed: the SPENT figure moves every run, so the title never repeats and
      # two identical ceilings were filed twice on 2026-09-12 alone.
      KEYARG=""
      [ "${ORG_HAS_KEY:-0}" != "0" ] && KEYARG="--key daily-cost-ceiling"
      BID="$("$ORGB" task new "$DEPARTMENT" "BLOCKED: daily cost ceiling reached (\$$SPENT of \$$CEILING)" --origin schedule ${KEYARG} 2>/dev/null || true)"
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
# ── A RUN CANNOT DIE SILENTLY ────────────────────────────────────────────────
#
# ★ THE FAILURE THIS ENDS. Six runs on 2026-09-13/14 emitted `run_started` and
#   then NOTHING -- no run_finished, no run_refused, no run_failed -- and sat in
#   `org status` as STALLED for ten hours. One of them died on
#   "line 629: TEXT: unbound variable", a variable assigned unconditionally a
#   hundred lines above the line that could not see it, and working out even
#   THAT much took reading byte offsets out of a temp directory. The stream
#   recorded that the run began and nothing else, which is the one thing
#   events.md says a control plane must never do.
#
# ★ THE EXIT TRAP FIRES ON EVERY DEATH, including a `set -u` abort, a `set -e`
#   abort and a signal. So the last thing this script does, always, is say how
#   it ended -- and if nothing else already said so, it says the run died and
#   names the last stage it reached.
#
# ★ NO NEW EVENT NAME. `run_failed` is already in events.md and already
#   classified by org/runs.py as an ENDING. Inventing `run_died` would have
#   created a fourth hand-kept list of run_* names, which is the exact defect
#   that produced the phantom stalls in the first place. Readers must tolerate
#   unknown FIELDS, so `stage` and `rc` ride along on an event that already
#   means what this means.
#
# ★ STAGE COSTS NOTHING UNTIL IT IS NEEDED. `stage` is a variable assignment
#   and no I/O whatsoever; the value is only ever written out by the trap, on a
#   run that is already over. A progress log that wrote a line per phase would
#   be four hundred lines nobody opens.
on_exit() {
  # ★ CAPTURE $? FIRST. Anything above this line replaces the exit status that
  #   is the whole point of the report.
  _rc=$?

  # ★ REPORT BEFORE UNLOCKING, AND GUARD THE UNLOCK. The first version ran
  #   `"$WT" unlock` first, unguarded. A trap body runs under the script's
  #   `set -e`, so a failing unlock ABORTED THE TRAP before it could report --
  #   and the moment unlock is most likely to fail is a run that already broke,
  #   which is the only moment this trap matters. Found by running the trap with
  #   a $WT that does not exist; it reported nothing at all.
  if [ "$ENDED" = "0" ]; then
    ev run_failed mode="$MODE" reason=died_without_reporting stage="$STAGE" rc="$_rc" run_pid="$$"
    echo "run.sh: DIED at stage '$STAGE' (exit $_rc, pid $$) without reporting an outcome." >&2
  fi

  "$WT" unlock || true
  return 0
}
trap on_exit EXIT
stage worktree
WORK="$("$WT" ensure)"
cd "$WORK"

# ★ run_pid IS THE RUNNER'S OWN PID, AND NOTHING HAD ONE. log-event.py records
#   os.getpid() -- the pid of the short-lived python process that writes the
#   line -- so every event in the stream carries a DIFFERENT pid and no event
#   can be attributed to the run that produced it. org/sla.py's header already
#   names this as the fact that shapes its whole module: "across 23 run_started
#   and 22 run_finished events the pid sets overlap in ZERO places".
#
#   It cost a diagnosis today. Two runs wrote to one launchd log and the
#   evidence read as impossible: a death reported at stage `worktree` while the
#   same log showed line 695 reached, which is 240 lines and three stage markers
#   later, and past the run_finished at 635. Both are true of DIFFERENT
#   processes and neither is true of one. With run_pid that is a glance.
ev run_started mode="$MODE" run_pid="$$"

# ── THE SPINE HELPERS, DEFINED BEFORE ANYTHING CALLS THEM ────────────────────
# ★ MOVED UP 2026-09-13, and a test caught why it had to be. Bash resolves a
#   function at CALL time, so a `spine_new` used above its own definition is
#   simply "command not found" -- and under `set -e` that aborts the script. The
#   new model-failure handler below files a task, so the definitions have to come
#   first. lib/website-team-denials.test.ts asserts the ordering and found this
#   within a minute of the handler being written.
ORG="${ORG_CLI:-$HOME/.swechha-ai/org}"

# Probed once per run, not per filing: `--help` is cheap but not free, and a
# capability of the installed spine cannot change mid-run. `|| true` because
# EVERY spine call here swallows its own failure -- a runner must not die
# because the task store is unavailable, and lib/website-team-spine.test.ts
# asserts exactly that for every line that touches $ORG.
ORG_HAS_KEY="$({ [ -x "$ORG" ] && "$ORG" task new --help 2>/dev/null | grep -c -- "--key"; } || true)"

spine_new() {   # <title> [dedupe-key] -> task id on stdout, or nothing
  [ -x "$ORG" ] || return 0
  # ★ THE KEY IS WHY THE QUEUE STOPPED GROWING. The spine folds a repeat into
  #   the live task it repeats, same department, same day -- but only if it can
  #   tell that two filings are the same condition, and it cannot do that from
  #   these titles:
  #
  #       BLOCKED: the work run was refused 5 tool(s)
  #       BLOCKED: the work run was refused 17 tool(s)
  #
  #   One standing fact, a varying parameter, two different strings. THIS runner
  #   knows they are one condition; the spine must not guess it, because a
  #   near-match rule would eventually fold "section 3" into "section 4".
  #
  #   Measured 2026-09-12: 13 needs_human tasks, 10 of them duplicates of two
  #   messages. Measured 2026-09-13: 24, all undated. Every one of them filed
  #   from here.
  #
  #   `--key` is ignored by an older spine? No -- it would be an ARGPARSE ERROR
  #   and the task would not be filed at all. The `|| true` below swallows that
  #   into "no task", which is why this is guarded on the flag existing.
  if [ -n "${2:-}" ] && [ "${ORG_HAS_KEY:-0}" != "0" ]; then
    "$ORG" task new website "$1" --origin schedule --key "$2" 2>/dev/null || true
  else
    "$ORG" task new website "$1" --origin schedule 2>/dev/null || true
  fi
}

# ★ AN INCIDENT IS NOT A TASK, and raising one is not the same as filing one.
#   A task is work somebody must do. An incident is a FAULT: deduplicated by
#   signature so a flapping service is one row with a count rather than forty,
#   dispatched ONCE to a phone, and closed only when a person says what the
#   outcome was. ADR-0010.
#
#   The error text stays LOCAL -- it is what the signature is computed from and
#   it lands in the incident record on this machine. What reaches the phone is a
#   closed vocabulary that cannot express it: department, kind, count, minutes,
#   id. The topic is a bearer URL and org/notify.py is built so a secret cannot
#   travel over it even by accident.
#
#   `|| true` like every other spine call here: a runner must not die because
#   the incident store is unavailable, and lib/website-team-spine.test.ts
#   asserts that for every line touching $ORG.
spine_incident() {  # <kind> <error-text> -> id on stdout, or nothing
  [ -x "$ORG" ] || return 0
  "$ORG" incident detect "$DEPARTMENT" "$1" "$2" \
      --workflow "$DEPARTMENT-$MODE" --notify 2>/dev/null || true
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

# ── THE HOOK WIRING ──────────────────────────────────────────────────────────
# ★ FOLDED IN FROM THE SENTINEL, 2026-09-14, when the Mac's half-hourly sentinel
#   was retired in favour of the hourly cloud one. Every other probe travels
#   fine; hooks-health does not. It verifies that each department registers the
#   hooks the shared translator handles, and that is a property of a machine
#   where CLAUDE CODE RUNS. On a GitHub runner there is nothing to check, so
#   the probe correctly answers UNKNOWN there -- and with the Mac job gone,
#   UNKNOWN would have been the only answer anyone ever got.
#
# ★ IT IS A STRUCTURAL CHECK, SO DAILY IS THE RIGHT CADENCE, not a compromise.
#   Hook wiring changes when somebody edits a settings.json, which is rare; it
#   never needed the half-hourly beat it was getting.
#
# ★ WHAT IT GUARDS AGAINST IS SILENCE. Every hook command ends `; exit 0` so a
#   broken hook can never block the work -- the right trade, and it means a hook
#   that has stopped working looks exactly like a quiet afternoon. Nothing else
#   would ever tell you. That is also why this block raises an INCIDENT rather
#   than refusing the run: a dead event stream must be loud, and must not become
#   a second way for the department to stop working.
#
# ★ BEFORE THE MODEL CALL, like the vault preflight and the ceiling, so the
#   answer exists even on a run that later dies reaching the model.
stage hooks-health
HOOKS_PROBE="${SWECHHA_HOOKS_PROBE:-$HOME/swechha-ai/sentinel/hooks-health.sh}"
if [ -r "$HOOKS_PROBE" ]; then
  set +e
  HOOKS_OUT="$(bash "$HOOKS_PROBE" 2>&1)"
  HOOKS_RC=$?
  set -e
  case "$HOOKS_RC" in
    0)
      ev gate_result gate=hooks-health result=pass
      ;;
    2)
      # Exit 2 is the probe's UNKNOWN: a gap, never a pass. Reported as such.
      ev gate_result gate=hooks-health result=unknown
      echo "run.sh: hooks-health UNKNOWN — $HOOKS_OUT" >&2
      ;;
    *)
      ev gate_result gate=hooks-health result=fail
      echo "run.sh: hooks-health FAILED — $HOOKS_OUT" >&2
      spine_incident hooks_unwired \
        "$(printf '%s' "$HOOKS_OUT" | tr '\n' ' ' | cut -c1-200)" >/dev/null || true
      ;;
  esac
else
  # ★ NOT A PASS. An absent probe is the same class of gap as an absent answer,
  #   and silently skipping it is how a check stops existing without anyone
  #   deciding that it should.
  ev gate_result gate=hooks-health result=unknown
  echo "run.sh: hooks-health UNKNOWN — no probe at $HOOKS_PROBE" >&2
fi

# ★ STDERR IS KEPT, AND THE FAILURE IS SURVIVED LONG ENOUGH TO REPORT IT.
#   This was `2>/dev/null` with no guard, under `set -euo pipefail`. A non-zero
#   exit therefore killed the runner ON THIS LINE with the explanation already
#   discarded -- which is how two manager runs died on 2026-09-13 (17:16 and
#   19:18) leaving nothing in the log but `run_started`.
#
#   On a subscription this is THE failure that matters. The estate has no
#   per-token cost to run out of; what it can run out of is the subscription's
#   own usage window, and if that happens the department goes quiet mid-incident.
#   api-health.sh watches GitHub's rate limit. Nothing watches Anthropic's.
MODEL_ERR="$(mktemp)"
set +e
stage model-call
RESULT="$(claude -p "$PROMPT" \
  --agent "$DEPARTMENT-manager" \
  --permission-mode dontAsk \
  --allowedTools "$ALLOWED" \
  --output-format json < /dev/null 2>"$MODEL_ERR")"
MODEL_RC=$?
set -e

if [ "$MODEL_RC" -ne 0 ] || [ -z "$RESULT" ]; then
  # Classified, not guessed: model-failure.py says `unknown` rather than
  # inventing a cause, and carries the stderr so a person can read what the
  # matcher could not.
  WHY="$(python3 "$LIB/model-failure.py" "$MODEL_RC" < "$MODEL_ERR" 2>/dev/null || true)"
  echo "run.sh: the model call FAILED (exit $MODEL_RC). $WHY" >&2
  sed -n '1,20p' "$MODEL_ERR" >&2
  ev run_failed mode="$MODE" $WHY
  ENDED=1
  # The reason, not the whole stderr: the classification is what deduplicates,
  # and model-failure.py already refuses to guess when it does not recognise it.
  INC="$(spine_incident model_call_failed "$(printf '%s' "$WHY" | tr ' ' '\n' | grep '^reason=' | cut -d= -f2 || echo unknown)")"
  [ -n "$INC" ] && echo "run.sh: incident $INC — org incident show $INC"
  BTASK="$(spine_new "BLOCKED: the $MODE run could not reach the model" "model-call-failed:$MODE")"
  [ -n "$BTASK" ] && { spine_close "$BTASK" escalate "the model call failed: $WHY"; }
  rm -f "$MODEL_ERR"
  # Exit 7, distinct from the budget brake's 6: a caller must be able to tell
  # "the department refused to spend" from "the department could not run".
  exit 7
fi
rm -f "$MODEL_ERR"

stage parse-result
PARSED="$(printf '%s' "$RESULT" | python3 "$LIB/parse-result.py")"
COST="$(printf '%s' "$PARSED" | head -1)"
TEXT="$(printf '%s' "$PARSED" | tail -n +2)"

# ── WHAT THE PERMISSION LAYER REFUSED ────────────────────────────────────────
# `--output-format json` carries a `permission_denials` array and this runner
# threw it away for as long as it existed. A cause the agent COULD NOT VERIFY
# must not become the report's headline: on 2026-09-11 both `gh run view
# --log-failed` calls were refused, the Manager said so in one line, and the
# guess it was forced into was printed above that caveat as the finding.
stage denials
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

# ★ THE TOKENS WERE ALWAYS IN THIS JSON. Until 2026-09-13 this line recorded
#   cost_usd and nothing else, so when the manager's cost per run went
#   $1.21 -> $4.94 overnight NOTHING IN THE ESTATE COULD SAY WHY. `usage`,
#   `duration_ms` and `num_turns` were in the reply all along and parse-result.py
#   dropped them. Unquoted on purpose: --metrics emits bare key=value pairs and
#   word-splitting is how they become separate arguments to log-event.py.
METRICS="$(printf '%s' "$RESULT" | python3 "$LIB/parse-result.py" --metrics 2>/dev/null || true)"
ev run_finished mode="$MODE" run_pid="$$" cost_usd="$COST" record="$(basename "$OUT")" $METRICS
ENDED=1

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

# A blocked run is the owner's to unblock -- nothing downstream can grant a
# permission. It goes on the "needs you" queue rather than into a record that
# reads as routine.
if [ -n "${DENIED:-}" ]; then
  ev run_blocked refused="$(printf '%s' "${DENIED:-}" | cut -f1 | tr '\n' ';')"
  # Keyed on the VERBS, so the same standing gap is one incident however many
  # runs hit it -- the same argument as the task dedupe, one layer up.
  spine_incident tools_refused "$(printf '%s' "${DENIED:-}" | cut -f1 | sort -u | tr '\n' ' ')" >/dev/null
  # ★ RECORDED AND CLOSED, NOT ESCALATED -- AND THE REASON IS THIS BLOCK'S OWN
  #   POSITION IN THE FILE. `ev run_finished` is emitted at line 562, ABOVE.
  #   Nothing reaches here except a run that already succeeded, so every task
  #   this ever filed was titled BLOCKED on a run that was not blocked. Sixteen
  #   of them sat in `org status` NEEDS YOU on 2026-09-14, three quarters of the
  #   whole queue, every one of them a run that finished.
  #
  #   What they actually recorded was THE ALLOWLIST WORKING. The manager
  #   improvised `date`, `echo`, `npx vitest run`, `gh secret list`, `git fetch`;
  #   the boundary refused them; the run completed anyway. A security boundary
  #   doing its job must not generate work for a human.
  #
  #   This file already states the rule one level down, at spine_close:
  #   "Only something genuinely stuck belongs in 'needs you'; a queue full of
  #   routine skips is a queue nobody reads." The same rule, applied here.
  #
  # ★ IT IS STILL RECORDED, LOUDLY. The incident above, the run_blocked event,
  #   and a closed task carrying the full list. That record is how the genuine
  #   defect underneath was found: the manager's role file names
  #   `npm run verify:seo` and the allowlist did not grant it -- an instruction
  #   the agent could not follow. Deleting the signal would have hidden it.
  BTASK="$(spine_new "the $MODE run was refused $(printf '%s' "${DENIED:-}" | wc -l | tr -d ' ') tool(s) — the run finished" "run-refused-tools:$MODE")"
  spine_close "$BTASK" refused "the run FINISHED; refused: $(printf '%s' "${DENIED:-}" | cut -f1 | tr '\n' ';')"
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
      # ★ THE TASK ID TRAVELS BY ENVIRONMENT, NOT AS A FOURTH ARGUMENT.
      #   execute.sh takes <specialist> <model> <brief> positionally, and this
      #   very call already broke once when model routing was added and the
      #   brief path landed in $MODEL. Adding a fourth positional is the same
      #   trap; a named variable cannot be silently mis-ordered.
      #
      # ★ WHY IT MUST TRAVEL AT ALL. execute.sh emits task_started and
      #   task_returned with NO task field, so nothing joins a run's work to the
      #   task it was doing. `org doctor` reports the consequence every day:
      #   the STUCK rule's false-positive rate is NOT AVAILABLE, because the
      #   only `task` values in the stream come from Claude Code's hooks and are
      #   subagent DESCRIPTIONS ('Copywriter: energy theme'), never spine ids.
      #   run.sh has claimed the task three lines above and simply never said so.
      TEAM_TASK_ID="${TASK:-}" "$LIB/execute.sh" "$spec" "$model" "$path"
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
  # ★ THE VAULT IS A SHARED CHECKOUT AND THIS BLOCK USED TO ASSUME IT WAS NOT.
  #   Measured 2026-09-18: four days of records — two website runs and two
  #   fundraising ones — sat committed on `spec/ai-os-2.0-agent-kind-taxonomy`,
  #   pushed nowhere, because a human had left the vault on that branch. These
  #   are the files `org status` cites as each run's own account, so the
  #   estate's accountability trail for 16-17 Sep existed in one working copy.
  #
  #   Three separate faults, all of them in three lines:
  #
  #   1. IT COMMITTED TO HEAD AND PUSHED A DIFFERENT REF. `commit` takes
  #      whatever branch is checked out; `push origin main` then pushed main,
  #      which the commit had never touched. The push SUCCEEDED, having sent
  #      nothing, so `&&` printed "pushed record to vault" over a record that
  #      had gone nowhere. An absence that reads as a success.
  #   2. IT COMMITTED THE WHOLE INDEX. `commit` with no pathspec takes
  #      everything staged, so vault 2a71507 — a website run — swept three
  #      unrelated fundraising documents another session had staged, under the
  #      website's message. Same hazard as `git add -A` in a shared checkout.
  #   3. THE MESSAGE HARDCODED "website team" though run.sh is ONE runner
  #      shared by both departments ($DEPARTMENT, set at the top). Every
  #      fundraising run has been misattributed in the vault's history.
  #
  #   The refusal is deliberate and it is not a loss: the record is already
  #   written to disk, $RECORDS is department-scoped, and the next run on a
  #   correct checkout commits the whole directory — so a record stranded by a
  #   branch left switched lands by itself once the branch is put back. What
  #   must never happen again is committing it somewhere nobody looks and
  #   reporting success.
  VBRANCH="$(git -C "$VAULT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
  if [ "$VBRANCH" != "main" ]; then
    echo "run.sh: vault is on '$VBRANCH', not main — record NOT committed." \
         "It is on disk at $OUT and will land on the next run once the vault" \
         "is back on main." >&2
    ev vault_record_stranded branch="$VBRANCH"
  else
    # Pathspec on BOTH add and commit: this department's own records and
    # nothing else, whatever another session may have left staged.
    git -C "$VAULT" add -- "$RECORDS"
    git -C "$VAULT" commit -q -m "$DEPARTMENT team: scheduled run $STAMP" -- "$RECORDS"
    if git -C "$VAULT" push -q origin main; then
      echo "pushed record to vault"
    else
      echo "run.sh: vault push FAILED — the record is committed locally only" >&2
      ev vault_push_failed
    fi
  fi
fi
