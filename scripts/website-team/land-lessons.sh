#!/usr/bin/env bash
# Land a run's LEARNING on main, as a pull request, deterministically: the
# lessons it wrote, and the tool grants its own telemetry has earned.
#
#   land-lessons.sh <report-file>
#
# ★ BOOKKEEPING MUST NEVER BREAK THE RUN. Every failure here is swallowed and
#   reported, the same rule hook-event.py and the task spine follow. A
#   department that dies because it could not file a note has traded something
#   that matters for something that does not.
#
# ★ IT GETS ITS OWN WORKTREE, NOT THE DEPARTMENT'S. run.sh's $WORK is where
#   stage two checks out specialist branches; committing into it from here would
#   either carry an uncommitted lessons edit into a specialist's branch or fight
#   a checkout already in progress. ~/swechha-website taught this estate the
#   lesson once already, at the cost of rebasing someone else's four commits.
#
# ★ A PULL REQUEST, NOT A PUSH TO MAIN. policy.json's `never` list opens with
#   "push directly to main" and this is a runner acting for the department, so
#   the rule applies to it. The merge is conditional on the same shared gate
#   everything else uses -- `generated-current.yml` runs on every pull request,
#   so the check this waits for genuinely arrives.
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
REPORT="${1:?usage: land-lessons.sh <report-file>}"
LESSONS="docs/website-team/lessons.md"
GRANTS="docs/website-team/tool-grants.json"
STAMP="$(date +%Y%m%d)"
BRANCH="team/lessons-$STAMP"
APPEND="$REPO/scripts/website-team/append-lessons.py"

[ -r "$REPORT" ] || { echo "land-lessons: no report at $REPORT"; exit 0; }

WT="$(mktemp -d)"
cleanup() { git -C "$REPO" worktree remove --force "$WT" 2>/dev/null || rm -rf "$WT"; }
trap cleanup EXIT

# ★ THE SECOND UNGUARDED COMMAND, found by the test written for the first. This
#   runs on a laptop that sleeps and moves between networks; an unreachable
#   origin is an ordinary Tuesday, not an exception. Unguarded it ended the
#   script here, before anything had been attempted, in exactly the silence the
#   push used to fail in.
if ! FETCH_ERR="$(git -C "$REPO" fetch -q origin 2>&1)"; then
  echo "land-lessons: CANNOT REACH origin — the lesson and any earned grant are NOT saved."
  printf 'land-lessons:   %s\n' "$FETCH_ERR"
  echo "land-lessons:   nothing is lost that the next run cannot recompute; it recomputes from the event log."
  exit 0
fi

# ── WHICH BASE, AND WHY IT IS NOT ALWAYS origin/main ─────────────────────────
#
# ★ THE RATCHET NEVER RATCHETED, AND THIS IS WHERE IT DIED. From 2026-09-11 to
#   2026-09-12 reconcile.py printed `granting 'gh run list'` on run after run
#   while docs/website-team/tool-grants.json stayed `grants: []`. Both verbs were
#   provably read-only and past the two-run threshold. Nothing was wrong with
#   the learning; the commit carrying it could not be pushed.
#
#   merge-when-green.sh merges with `--squash` on purpose (auto_merge condition
#   9: the whole change arrives as one commit). A squash merge does NOT make the
#   branch head an ancestor of main -- PR #140's merge commit 91ea00a4 has a
#   single parent, and `git merge-base --is-ancestor` on the branch head returns
#   false. delete_branch_on_merge is false, so the ref survives, pointing at a
#   commit main will never contain.
#
#   The old line here was `-B "$BRANCH" ... origin/main` unconditionally, which
#   rebuilt today's branch WITHOUT that commit. The push on the far side was then
#   a non-fast-forward, was rejected, and `set -e` ended the script -- taking the
#   earned grant with the worktree. Every run after the day's first one lost its
#   learning, silently, which is why the same verbs recurred hourly.
#
# So: if a pull request is still OPEN on today's branch, build ON it, because it
# carries lessons that are not on main yet and rebuilding from main would drop
# them. Otherwise today's ref is finished or absent, and main is the right base
# -- in which case a leftover remote ref has to be replaced rather than appended
# to, which is what PUSH_FORCE below is for.
BASE="origin/main"
PUSH_FORCE=""
if [ "$(gh pr view "$BRANCH" --json state --jq .state 2>/dev/null || true)" = "OPEN" ]; then
  BASE="origin/$BRANCH"
  echo "land-lessons: today's pull request is still open — adding to it"
elif git -C "$REPO" show-ref -q --verify "refs/remotes/origin/$BRANCH"; then
  # ★ --force-with-lease, NEVER --force. The lease is checked against the
  #   remote-tracking ref the fetch above just refreshed, so this replaces only
  #   the ref this script itself left behind and refuses if anything else moved
  #   it. The branch is machine-owned and named by date; main is never a target.
  PUSH_FORCE="--force-with-lease"
  echo "land-lessons: today's branch was already merged — replacing the stale ref"
fi

# `-B` so a same-day second run reuses the branch rather than dying on it.
git -C "$REPO" worktree add -q -B "$BRANCH" "$WT" "$BASE"

N="$(python3 "$APPEND" "$WT/$LESSONS" < "$REPORT" 2>/dev/null || echo 0)"

# ── AND WHAT THE TELEMETRY EARNED ────────────────────────────────────────────
# A lesson in prose is advice the next run can skim past. reconcile.py reads the
# `run_blocked` events run.sh emits and turns a verb refused in two DIFFERENT
# runs into a grant -- but only one tool-grants.py can prove read-only. Anything
# else it reports for a human and never applies, however often it recurs. The
# ratchet tightens; it does not loosen.
python3 "$REPO/scripts/website-team/reconcile.py" \
  --log "${WEBSITE_TEAM_ACTIVITY:-$HOME/.swechha-ai/activity.jsonl}" \
  --ledger "$WT/$GRANTS" --apply 2>&1 | sed 's/^/land-lessons: /' || true

cd "$WT"
if git diff --quiet -- "$LESSONS" "$GRANTS" 2>/dev/null && [ "${N:-0}" -eq 0 ]; then
  echo "land-lessons: nothing new to record"
  exit 0
fi
git add "$LESSONS" "$GRANTS"
git commit -q -m "docs(lessons): $N lesson(s) from the $(date +%Y-%m-%d) run

Appended by scripts/website-team/land-lessons.sh. The Manager decides what the
lesson says; this decides only where it goes -- no model in the write path."
# ★ THE ONE STEP THAT WAS NOT SWALLOWED, IN A FILE WHOSE HEADER PROMISES THAT
#   EVERY FAILURE IS. The PR step below has always had its `|| { ... }`; this one
#   did not, so the single command that actually failed in production was also
#   the only one that could kill the script without saying why. `run.sh` then
#   printed "lessons did not land" and nothing anywhere named the reason.
#
#   It still exits 0 -- bookkeeping must never break the run -- but it now says
#   what was lost and what to do, because a grant that cannot be pushed is
#   learning that will be recomputed and discarded again in an hour.
if ! PUSH_ERR="$(git push -q $PUSH_FORCE -u origin "$BRANCH" 2>&1)"; then
  echo "land-lessons: PUSH FAILED — the lesson and any earned grant are NOT saved."
  echo "land-lessons:   branch: $BRANCH   base: $BASE   force: ${PUSH_FORCE:-none}"
  printf 'land-lessons:   %s\n' "$PUSH_ERR"
  echo "land-lessons:   fix it by hand, or delete the remote branch and let the next run rebuild it."
  exit 0
fi

# An open pull request already has this branch as its head, so the push above
# updated it. Creating a second one would fail, and reporting that failure as
# "could not open a PR" would read as a fault when it is the normal path.
if [ "$BASE" = "origin/$BRANCH" ]; then
  PR_URL="$(gh pr view "$BRANCH" --json url --jq .url 2>/dev/null || true)"
  echo "land-lessons: updated ${PR_URL:-the open pull request}"
  "${SWECHHA_MERGE_GATE:-$HOME/.swechha-ai/merge-when-green.sh}" "$PR_URL" \
    || echo "land-lessons: not merged automatically — it waits for a human, which is fine"
  exit 0
fi

PR_URL="$(gh pr create --base main --head "$BRANCH" \
  --title "docs(lessons): $N lesson(s) from the $(date +%Y-%m-%d) run" \
  --body "$(printf 'Appended by the website department after its scheduled run.\n\n`append-lessons.py` extracts the report'"'"'s trailing `## Lessons` section and appends entries whose heading is not already present. Deduplicated by heading; nothing existing is edited or deleted.\n\nThis is the memory model in `swechha/ai/README.md` — *"each department'"'"'s lessons.md, which the department may append and only a human may delete"* — which had never been wired.\n')" 2>/dev/null)" || {
  echo "land-lessons: could not open a PR; the branch $BRANCH is pushed and the lesson is not lost"
  exit 0
}
echo "land-lessons: opened $PR_URL"
"${SWECHHA_MERGE_GATE:-$HOME/.swechha-ai/merge-when-green.sh}" "$PR_URL" \
  || echo "land-lessons: not merged automatically — it waits for a human, which is fine"
