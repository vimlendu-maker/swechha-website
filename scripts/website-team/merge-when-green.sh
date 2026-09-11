#!/usr/bin/env bash
# Merge a pull request only after its required check has actually passed.
#
# ★ WHY THIS IS NOT `gh pr merge --auto`.
#   --auto means "merge when the branch becomes mergeable". On a repository
#   where something is required, that is a wait. Here NOTHING is required:
#   the owner declined a required status check on main on 2026-09-11 because
#   67 of the last 100 commits there are direct pushes from automation and a
#   required check rejects direct pushes outright — measured on 2026-09-11,
#   `Required status check "current" is expected`, with all six data workflows
#   blocked. So --auto has nothing to wait for and merges AT ONCE, before the
#   workflow has even started.
#
#   That is not theoretical. PR #115 was merged 38 seconds before `current`
#   finished and #116 by 76 seconds, both by a human typing `--auto` and
#   believing it meant "when green".
#
# ★ SO THE WAIT LIVES HERE, IN THE ONE PLACE BOTH CALLERS USE.
#   execute.sh (the department, unattended) and `npm run pr:merge` (a person,
#   by hand) call this same script. Two copies of a gate is how one of them
#   quietly stops matching the other, and this repository's most repeated
#   defect is exactly that — a list that must move in lockstep and does not.
#
#   It is shared ACROSS REPOSITORIES too: the fundraising department reaches it
#   through ~/.swechha-ai/merge-when-green.sh, the same shared-install pattern
#   as hook-event.py. That is a real cross-repository dependency and it is
#   named rather than hidden. Unlike the hooks, a missing gate here must fail
#   LOUDLY — telemetry may never block work, but a gate that silently passes
#   is not a gate.
#
# ★ ANYTHING OTHER THAN SUCCESS LEAVES THE PR OPEN. Failure, cancellation,
#   timeout, or a check that never appears are all the same answer: a human
#   looks. That is the correct outcome, not an error condition.
#
# Usage: merge-when-green.sh [PR]     (number, URL, or omitted for this branch)
# Exit:  0 merged · 1 check did not pass · 2 check passed, GitHub refused · 3 usage
set -euo pipefail

# ★ THE CHECK NAME IS A PARAMETER, because this gate is now shared. The
#   fundraising department requires `pytest`; this one requires `current`.
#   The department-prefixed names are kept as a fallback so the website
#   department's existing environment keeps working unchanged.
CHECK="${SWECHHA_REQUIRED_CHECK:-${WEBSITE_TEAM_REQUIRED_CHECK:-current}}"
LIMIT="${SWECHHA_CHECK_WAIT:-${WEBSITE_TEAM_CHECK_WAIT:-1200}}"
PR="${1:-}"

if [ -z "$PR" ]; then
  PR="$(gh pr view --json url --jq .url 2>/dev/null || true)"
  [ -z "$PR" ] && { echo "merge: no pull request for this branch, and none given" >&2; exit 3; }
fi

# Refuse a PR that is already closed or merged, rather than reporting a
# confusing failure from `gh pr merge` a few minutes later.
STATE="$(gh pr view "$PR" --json state --jq .state 2>/dev/null || true)"
case "$STATE" in
  OPEN) ;;
  "")   echo "merge: cannot read $PR" >&2; exit 3 ;;
  *)    echo "merge: $PR is $STATE, nothing to do" >&2; exit 3 ;;
esac

waited=0
state=""
echo "merge: waiting for '$CHECK' on $PR (up to ${LIMIT}s)" >&2
while [ "$waited" -lt "$LIMIT" ]; do
  state="$(gh pr checks "$PR" --json name,state \
    --jq "[.[] | select(.name == \"$CHECK\") | .state] | first // empty" 2>/dev/null || echo '')"
  case "$state" in
    SUCCESS) break ;;
    FAILURE|CANCELLED|TIMED_OUT|ACTION_REQUIRED|STARTUP_FAILURE|STALE|SKIPPED) break ;;
    *) sleep 20; waited=$((waited + 20)) ;;
  esac
done

if [ "$state" != "SUCCESS" ]; then
  echo "merge: '$CHECK' did not pass (state: ${state:-never appeared}, waited ${waited}s) — left open for a human" >&2
  exit 1
fi

# --squash, not a merge commit: auto_merge condition 9 requires the whole
# change be revertible by a single `git revert`, and a squash guarantees it.
if gh pr merge --squash "$PR" 2>/dev/null; then
  echo "merge: '$CHECK' passed — merged $PR" >&2
  exit 0
fi
echo "merge: '$CHECK' passed but GitHub refused the merge — left open for a human" >&2
exit 2
