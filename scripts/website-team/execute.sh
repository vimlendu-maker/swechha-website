#!/usr/bin/env bash
# Stage two: give one specialist brief to one specialist, with write access, and
# turn it into a reviewed pull request -- merging it only when every condition
# holds.
#
# THE MANAGER NEVER RUNS THIS. It decides; this executes. The manager's session
# has no file tools at all, so a synthesis error cannot become a commit. That
# separation is the whole point and it is why there are two scripts.
#
# Usage: execute.sh <specialist> <model> <brief-file> [--dry-run]
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
# The branch point. `origin/main` once the team is merged; until then it must be
# the team's own branch, because a specialist that branches from main cannot
# read docs/website-team/lessons.md or policy.json -- the context its role file
# tells it to read first.
BASE="${WEBSITE_TEAM_BASE:-origin/main}"
SPECIALIST="${1:?usage: execute.sh <specialist> <model> <brief-file> [--dry-run]}"
MODEL="${2:?usage: execute.sh <specialist> <model> <brief-file> [--dry-run]}"
BRIEF_FILE="${3:?usage: execute.sh <specialist> <model> <brief-file> [--dry-run]}"
DRY="${4:-}"
case "$MODEL" in
  haiku|sonnet|opus|fable|inherit) ;;
  *) echo "execute: unknown model '$MODEL'" >&2; exit 2 ;;
esac
LOG="${SWECHHA_LOG_EVENT:-$HOME/.swechha-ai/log-event.py}"
ev() { python3 "$LOG" website "$SPECIALIST" "$@" 2>/dev/null || true; }

# GATE OUTPUT GOES IN A PER-RUN DIRECTORY, not in fixed /tmp paths. The logs
# used to be /tmp/wt-test.log and friends, which meant every run overwrote the
# evidence of the last one -- and two runs starting together (both schedules
# fire at 09:00) would interleave into the same files. These are the only record
# of why a refused task was refused, so they are kept per run and not cleaned.
RUNLOG="${WEBSITE_TEAM_LOGS:-$HOME/.swechha-ai/logs}/$(date +%Y%m%d-%H%M%S)-$SPECIALIST"
mkdir -p "$RUNLOG"

# ★ THIS RUNS IN THE DEPARTMENT'S OWN WORKTREE, NEVER IN THE MAIN CHECKOUT.
#   Everything below checks out a branch, commits and pushes. Doing that in
#   ~/swechha-website meant competing with whatever a person had checked out
#   there, and on 2026-09-11 that cost a rebase of someone else's four commits.
#   scripts/website-team/worktree.sh carries the full account.
#
#   run.sh has normally created and refreshed the tree already; ensure is
#   idempotent, so calling execute.sh by hand works too.
WORK="$("$REPO/scripts/website-team/worktree.sh" ensure)"
cd "$WORK"

case "$SPECIALIST" in
  website-engineering|website-design|website-content-seo) ;;
  *) echo "execute: unknown specialist '$SPECIALIST'" >&2; exit 2 ;;
esac

# Only engineering may change files. Design and content report; if the manager
# briefs them here it is a mistake, and a loud one is better than a silent one.
if [ "$SPECIALIST" != "website-engineering" ]; then
  echo "execute: $SPECIALIST is read-only by policy; it cannot be given an execution brief" >&2
  exit 2
fi

# EDITABLE PATHS, ALLOW-LISTED RATHER THAN DENY-LISTED.
# An allow-list fails closed: a path nobody thought about is refused, not
# permitted. `docs/**` does include policy.json, which must never be touched --
# guard-paths.sh catches that, which is exactly the case it exists for.
#
# EVERY COMMAND GETS ITS `:*` FORM TOO. `Bash(npm run lint)` is exact-match: it
# permits the bare command and refuses `npm run lint -- --fix`, which is
# precisely what a specialist doing a lint pass would reach for. Measured on
# 2026-09-11 against the Manager's allowlist, which had the same defect: the
# argument form returned DENIED and ALLOWED once the `:*` form was added. The
# specialist already holds Edit on these paths, so permitting arguments grants
# no new capability -- it only stops a denial the agent then has to work around.
ALLOWED='Read,Grep,Glob'
ALLOWED="$ALLOWED,Edit(scripts/**),Edit(lib/**),Edit(components/**),Edit(docs/**)"
ALLOWED="$ALLOWED,Bash(npm test),Bash(npm test:*)"
ALLOWED="$ALLOWED,Bash(npm run lint),Bash(npm run lint:*)"
ALLOWED="$ALLOWED,Bash(npm run typecheck),Bash(npm run typecheck:*)"
ALLOWED="$ALLOWED,Bash(npm run build:all),Bash(npm run build:all:*)"
ALLOWED="$ALLOWED,Bash(npm run verify:seo),Bash(npm run verify:seo:*)"
ALLOWED="$ALLOWED,Bash(npm run verify:final),Bash(npm run verify:final:*)"
ALLOWED="$ALLOWED,Bash(git status:*),Bash(git diff:*),Bash(git log:*)"
# ★ READ-ONLY gh, BECAUSE A SPECIALIST CANNOT INVESTIGATE WHAT IT CANNOT SEE.
#   engineering.md has listed `gh` under Commands since the role was written;
#   this allowlist granted none of it. On 2026-09-11 the Manager briefed
#   "get the actual logs" and handed it to a specialist with STRICTLY FEWER
#   permissions than itself. denials.py shows it then tried eight different
#   routes -- gh, curl, node fetch, git -C -- and was refused every one, before
#   correctly changing nothing. List and view only: `gh pr create` and
#   `gh pr merge` stay out, because the runner opens and merges the PR, so that
#   what ships is exactly the diff and nothing else.
ALLOWED="$ALLOWED,Bash(gh run list:*),Bash(gh run view:*)"

BRANCH="team/$(date +%Y%m%d)-$(basename "$BRIEF_FILE" .txt | tr -cd '[:alnum:]-' | cut -c1-40)"

# ★ STAGE THE HELPERS OUTSIDE THE WORKING TREE BEFORE ANY CHECKOUT.
#   This script checks out a branch from $BASE, which replaces the files in the
#   tree it is running from. origin/main does carry scripts/website-team/ as of
#   2026-09-11 -- but the first run of this script, from a base that did not,
#   deleted its own parser out from under itself at the checkout and then
#   reported "no changes made": quiet, plausible, and wrong. Any base without
#   them does the same, so the helpers are copied out first regardless and every
#   call below uses $STAGE, never the working tree's copy.
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cp "$REPO/scripts/website-team/parse-result.py" \
   "$REPO/scripts/website-team/guard-paths.sh" \
   "$REPO/scripts/website-team/verify-claims.py" "$STAGE/"
chmod +x "$STAGE/guard-paths.sh"

if [ "$DRY" = "--dry-run" ]; then
  echo "specialist: $SPECIALIST"
  echo "model:      $MODEL"
  echo "branch:     $BRANCH"
  echo "tools:      $ALLOWED"
  echo "brief:"; sed 's/^/  /' "$BRIEF_FILE"
  exit 0
fi

git fetch -q origin

# ── PREFLIGHT: the base must contain the team itself ────────────────────────
# This script checks out $BASE and then runs `claude --agent $SPECIALIST`. If
# the agent definition is not present in $BASE, that call fails after the
# checkout with an unhelpful error, having already moved the tree. Check first
# and say exactly what is missing.
for needed in ".claude/agents/$SPECIALIST.md" "docs/website-team/policy.json" "docs/website-team/lessons.md"; do
  if ! git cat-file -e "$BASE:$needed" 2>/dev/null; then
    echo "execute: REFUSED — $BASE does not contain $needed" >&2
    echo "execute: the specialist would start in a tree without its own role file," >&2
    echo "execute: policy or lessons. Merge the website-team branch to $BASE first," >&2
    echo "execute: or set WEBSITE_TEAM_BASE to a branch that has them." >&2
    exit 3
  fi
done

git checkout -q -B "$BRANCH" "$BASE"

PROMPT="$(cat "$BRIEF_FILE")

Make the change. Edit files only — **do not run git, do not commit, do not
push, do not open a pull request.** The runner does all of that, so that what
ships is exactly the diff and nothing else.

Before you finish, run \`npm test\`, \`npm run lint\` and \`npm run typecheck\`
and report their output. The type check matters: nothing else here runs tsc, and
\`next build\` type-checks the whole repository including test files.
If you cannot do the task within your permitted paths, change nothing and say
why — an empty diff is a fine outcome and far better than a partial one. If the
brief's premise turns out to be wrong, say so and change nothing; do not invent
a change to justify the ticket.

Leave no scratch files behind. You cannot delete files in this mode, so do not
create any — do your checking with Read and Grep rather than by writing a
throwaway script."

ev task_started model="$MODEL" brief="$(basename "$BRIEF_FILE")" branch="$BRANCH"
claude -p "$PROMPT" --agent "$SPECIALIST" --model "$MODEL" --permission-mode dontAsk \
  --allowedTools "$ALLOWED" --output-format json < /dev/null > "$RUNLOG"/exec.json 2>/dev/null || true
ev task_returned cost_usd="$(python3 "$STAGE/parse-result.py" < "$RUNLOG"/exec.json 2>/dev/null | head -1)"
if ! python3 "$STAGE/parse-result.py" < "$RUNLOG"/exec.json | tail -n +2 > "$RUNLOG"/exec.txt; then
  echo "execute: could not parse the specialist's output — refusing to continue" >&2
  echo "execute: raw output is in "$RUNLOG"/exec.json" >&2
  git checkout -q --detach "$BASE" ; git branch -qD "$BRANCH" 2>/dev/null || true
  exit 1
fi

# `git diff` does not see UNTRACKED files. The first real run left a throwaway
# diagnostic script behind and this check reported "no changes made" while an
# untracked file sat in the tree -- it would have been swept into the next
# commit by `git add -A`. Use porcelain, which sees untracked too.
if [ -z "$(git status --porcelain)" ]; then
  # ★ EXIT 4, NOT 0. An empty diff is a legitimate outcome -- disproving a
  #   brief's premise is a complete piece of work -- but it is NOT a shipped
  #   change, and run.sh reads this script's exit status to close the task.
  #   While this returned 0, "the specialist could not do the job and said so"
  #   was recorded as `done: shipped`. That happened on 2026-09-11: the air
  #   investigation could not read the workflow log, correctly changed nothing,
  #   and the spine logged it as shipped. A task system that reports success for
  #   work that did not happen is the failure it was built to end.
  echo "execute: no changes made — nothing to ship"
  ev task_returned_empty brief="$(basename "$BRIEF_FILE")"
  git checkout -q --detach "$BASE" ; git branch -qD "$BRANCH" 2>/dev/null || true
  exit 4
fi

git add -A
git commit -q -m "$(head -1 "$BRIEF_FILE" | cut -c1-70)

Executed by $SPECIALIST from a website-team brief.
$(sed 's/^/  /' "$RUNLOG"/exec.txt | head -20)"

# ── THE GATES, IN THE ORDER THAT FAILS CHEAPEST FIRST ────────────────────────
FAILED=""
# Pre-build: served HTML must not have been hand-edited.
"$STAGE/guard-paths.sh" "$BASE" || FAILED="$FAILED guard"
npm test  >"$RUNLOG"/test.log 2>&1 || FAILED="$FAILED tests"
# ★ TYPE-CHECK, BECAUSE NOTHING ELSE HERE RUNS tsc. On 2026-09-11 a dotAll
#   regex in a TEST FILE broke every production deployment for over half an
#   hour: vitest transpiles without type-checking, eslint does not type-check,
#   and generated-current.yml does not either -- but `next build` type-checks
#   the WHOLE repository, test files included, and that is what Vercel runs.
#   Every gate was green while the site could not deploy at all. 1.2 seconds.
npm run typecheck >"$RUNLOG"/typecheck.log 2>&1 || FAILED="$FAILED typecheck"
npm run lint >"$RUNLOG"/lint.log 2>&1 || FAILED="$FAILED lint"
npm run build:all >"$RUNLOG"/build.log 2>&1 || FAILED="$FAILED build"
npm run verify:seo >"$RUNLOG"/seo.log 2>&1 || FAILED="$FAILED verify:seo"

# ── THE FACT GATE ────────────────────────────────────────────────────────────
# Any content this change adds must have its claims verified mechanically. A
# test can prove the build works; no test can prove a figure is true, and a
# research subagent on this repository has already produced fluent,
# citation-dense fabrication and retracted it afterwards. So every changed
# markdown or content file goes through verify-claims.py, which resolves DOIs
# against Crossref, fetches source URLs, and checks quotes appear verbatim.
# A source it cannot reach is NOT a pass.
CONTENT_CHANGED="$(git diff --name-only "$BASE"...HEAD -- '*.md' 'content/**' 'data/**/*.json' | grep -v '^docs/website-team/' || true)"
if [ -n "$CONTENT_CHANGED" ]; then
  echo "execute: fact gate over:"; printf '  %s
' $CONTENT_CHANGED
  for f in $CONTENT_CHANGED; do
    [ -f "$f" ] || continue
    python3 "$STAGE/verify-claims.py" < "$f" >>"$RUNLOG"/claims.log 2>&1 || FAILED="$FAILED fact-gate($f)"
  done
else
  echo "execute: fact gate — no content changed, nothing asserted"
fi

# A build may legitimately regenerate committed pages. That is a change to
# public/_pages, which the guard forbids -- so re-run the guard AFTER the build
# and refuse rather than quietly shipping regenerated artefacts.
git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "chore: regenerate after build:all"
  # Post-build: regenerated pages are expected; everything else still forbidden.
  "$STAGE/guard-paths.sh" "$BASE" --post-build || FAILED="$FAILED guard-after-build"
fi

for g in guard tests typecheck lint build verify:seo; do
  case " $FAILED " in *" $g "*) ev gate_result gate="$g" result=fail ;; *) ev gate_result gate="$g" result=pass ;; esac
done
if [ -n "$FAILED" ]; then
  ev task_refused reason="$FAILED" branch="$BRANCH"
  echo "execute: FAILED —$FAILED"
  echo "execute: branch $BRANCH kept locally for inspection; nothing pushed"
  exit 1
fi

git push -q -u origin "$BRANCH"
PR_URL="$(gh pr create --base "${BASE#origin/}" --head "$BRANCH" \
  --title "$(head -1 "$BRIEF_FILE" | cut -c1-70)" \
  --body "$(printf 'Opened by the website team, stage two.\n\n## Brief\n\n%s\n\n## What the specialist reported\n\n%s\n\n## Gates\n\n- guard-paths: pass\n- npm test: pass\n- npm run lint: pass\n- npm run build:all: pass\n- npm run verify:seo: pass\n- fact gate (verify-claims.py): pass\n\nMerging is conditional on every `auto_merge` condition in `docs/website-team/policy.json`. If any failed, this PR waits for a human.\n' "$(cat "$BRIEF_FILE")" "$(cat "$RUNLOG"/exec.txt)")")"
ev pr_opened url="$PR_URL" branch="$BRANCH"
echo "execute: opened $PR_URL"

AUTO="$(python3 -c "import json;print(json.load(open('docs/website-team/policy.json'))['auto_merge']['enabled'])")"
if [ "$AUTO" = "True" ]; then
  # ★ CONDITION 4 IS ENFORCED HERE, BY THIS SCRIPT, NOT BY GITHUB.
  #
  #   policy.json's auto_merge condition 4 is "generated-current.yml passes on
  #   the PR". The obvious way to guarantee that is a required status check on
  #   main -- and that route is CLOSED, deliberately: 67 of the last 100
  #   commits to main are direct pushes from five automation identities and the
  #   air pipeline pushes every fifteen minutes, so a required check on main
  #   would stop them and take the site stale within the hour. The owner
  #   declined it on 2026-09-11 for exactly that reason; see
  #   docs/website-team/infrastructure.md.
  #
  #   Which leaves a trap. `allow_auto_merge` is now on at the repository level
  #   but NOTHING is required, so `gh pr merge --auto` on a PR that nothing
  #   blocks does not wait for anything -- it merges immediately, before the
  #   workflow has even started. The department would then be merging on its
  #   own say-so while its policy claimed CI had passed. A condition that is
  #   asserted but not enforced is worse than one that was never written down.
  #
  #   So: wait for the check to CONCLUDE, read its conclusion, and merge only
  #   on success. Anything else -- failure, cancellation, timeout, or the check
  #   never appearing -- leaves the PR open for a human, which is the correct
  #   outcome and not an error.
  # ── THE WAIT LIVES IN THE SHARED GATE, NOT HERE ──────────────────────────
  # A person merging by hand needs exactly this gate, and so does the
  # fundraising department; a second copy would drift from this one. The gate
  # moved to the swechha-ai repository on 2026-09-11 and is reached at a stable
  # path, so this line did not have to change when it moved. `npm run pr:merge`
  # calls the same script.
  # The events stay HERE, because the runtime emits events and the thing being
  # gated must never be the thing reporting on the gate.
  CHECK="${WEBSITE_TEAM_REQUIRED_CHECK:-current}"
  set +e
  "${SWECHHA_MERGE_GATE:-$HOME/.swechha-ai/merge-when-green.sh}" "$PR_URL"
  merge_rc=$?
  set -e
  case "$merge_rc" in
    0)
      ev gate_result gate="generated-current" result=pass
      ev automerge_enabled url="$PR_URL" check="$CHECK"
      ;;
    2)
      ev gate_result gate="generated-current" result=pass
      ev automerge_unavailable url="$PR_URL" reason="merge refused by GitHub"
      ;;
    *)
      ev gate_result gate="generated-current" result=blocked
      ev automerge_unavailable url="$PR_URL" reason="check=$CHECK did not pass"
      ;;
  esac
else
  echo "execute: auto_merge disabled in policy — PR waits for a human"
fi
