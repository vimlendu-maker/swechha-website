#!/usr/bin/env bash
# Run the department's runner from a SNAPSHOT, never from the live checkout.
#
# ★ BASH READS A SCRIPT INCREMENTALLY, FROM A BYTE OFFSET. Edit the file while
#   it is executing and the shell resumes at that offset in the NEW contents --
#   mid-statement, mid-function, anywhere. It does not reload and it does not
#   notice. The symptom is nonsense: a variable that cannot be unset reported as
#   unbound, at a line that never ran.
#
#   Measured 2026-09-13, three times in one evening:
#
#       22:22:16  run_started              launchd begins executing run.sh
#       22:24:24  git checkout main -> fix/lint-…    a person, in the same repo
#       …         run.sh: line 508: TEXT: unbound variable
#
#   The run died leaving only `run_started` in the log. So did 17:16 and 19:18.
#   Every one of them was an ordinary `git checkout` in ~/swechha-website while
#   a scheduled run happened to be in flight.
#
# ★ execute.sh ALREADY DOES THIS ONE LEVEL DOWN. It copies parse-result.py,
#   guard-paths.sh and verify-claims.py into a mktemp directory before invoking
#   a specialist, for exactly this reason. The runner that stages its helpers
#   was itself unstaged.
#
# ★ THIS FILE IS DELIBERATELY TINY AND SHOULD STAY THAT WAY. It is the one
#   script still executed from the live checkout, so the window in which an
#   edit could corrupt it is the milliseconds between `cp` and `exec`. Every
#   line added here widens that window. Put logic in run.sh, which by then is
#   a copy nobody is editing.
set -euo pipefail

DEPARTMENT="${TEAM_DEPARTMENT:-${WEBSITE_TEAM_DEPARTMENT:-website}}"
REPO="${TEAM_REPO:-${WEBSITE_TEAM_REPO:-$HOME/swechha-$DEPARTMENT}}"
# The SCRIPTS always come from the website repository even when the DEPARTMENT
# is fundraising: one runner serves both, which is why the fundraising jobs name
# both repositories on their command line.
SRC="${TEAM_SCRIPTS:-$HOME/swechha-website/scripts/website-team}"

SNAP="$(mktemp -d "${TMPDIR:-/tmp}/${DEPARTMENT}-team-XXXXXX")"
cp -R "$SRC"/. "$SNAP"/
# Not trapped on EXIT: `exec` replaces this shell, so a trap here would never
# fire. The snapshot is in TMPDIR and the OS reaps it; run.sh must not delete
# the directory it is running from either.
export TEAM_SNAPSHOT="$SNAP"
exec "$SNAP/run.sh" "$@"
