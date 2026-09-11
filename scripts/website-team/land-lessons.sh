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

git -C "$REPO" fetch -q origin
# `-B` so a same-day second run reuses the branch rather than dying on it.
git -C "$REPO" worktree add -q -B "$BRANCH" "$WT" origin/main

N="$(python3 "$APPEND" "$WT/$LESSONS" < "$REPORT" 2>/dev/null || echo 0)"

# ── AND WHAT THE TELEMETRY EARNED ────────────────────────────────────────────
# A lesson in prose is advice the next run can skim past. reconcile.py reads the
# `run_blocked` events run.sh emits and turns a verb refused in two DIFFERENT
# runs into a grant -- but only one tool-grants.py can prove read-only. Anything
# else it reports for a human and never applies, however often it recurs. The
# ratchet tightens; it does not loosen.
python3 "$REPO/scripts/website-team/reconcile.py" \
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
git push -q -u origin "$BRANCH"

PR_URL="$(gh pr create --base main --head "$BRANCH" \
  --title "docs(lessons): $N lesson(s) from the $(date +%Y-%m-%d) run" \
  --body "$(printf 'Appended by the website department after its scheduled run.\n\n`append-lessons.py` extracts the report'"'"'s trailing `## Lessons` section and appends entries whose heading is not already present. Deduplicated by heading; nothing existing is edited or deleted.\n\nThis is the memory model in `swechha/ai/README.md` — *"each department'"'"'s lessons.md, which the department may append and only a human may delete"* — which had never been wired.\n')" 2>/dev/null)" || {
  echo "land-lessons: could not open a PR; the branch $BRANCH is pushed and the lesson is not lost"
  exit 0
}
echo "land-lessons: opened $PR_URL"
"${SWECHHA_MERGE_GATE:-$HOME/.swechha-ai/merge-when-green.sh}" "$PR_URL" \
  || echo "land-lessons: not merged automatically — it waits for a human, which is fine"
