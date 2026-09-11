#!/usr/bin/env bash
#
# Vercel "Ignored Build Step" — wired up as `ignoreCommand` in vercel.json.
#
#   exit 0  -> the build is IGNORED (no build, no deploy)
#   exit 1  -> the build CONTINUES as normal
#
# (Yes, that is backwards from every other exit code you have ever met.
#  https://vercel.com/docs/project-configuration/vercel-json#ignorecommand)
#
# WHY THIS EXISTS
#
# The Hobby plan allows 100 deployments per account per day, and the counter
# resets at 00:00 UTC = 05:30 IST. On the evening of 2026-09-11 we were at
# 95/100 by 21:50 IST — 66 production pushes to main plus 29 preview builds,
# all from one night of AI OS work. This freeze lets the department keep
# committing, merging and opening PRs overnight without any of it turning into
# a build.
#
# IT EXPIRES BY ITSELF.
#
# Once FREEZE_UNTIL has passed, this script exits 1 for everything and every
# branch builds normally again. There is nothing to remember to revert, and no
# way for a forgotten freeze to quietly keep swechha.in stale for days.
#
# To lift the freeze early: set FREEZE_UNTIL to a past timestamp, or delete
# `ignoreCommand` from vercel.json.
# To extend it: move FREEZE_UNTIL. Keep it in UTC, keep the trailing Z — the
# comparison below is a plain string compare, which only works on
# zero-padded ISO-8601 UTC.

set -uo pipefail

# LIFTED EARLY, 2026-09-12 ~01:40 IST, on the owner's instruction.
#
# The freeze was set to run to 05:30 IST so the department could work overnight
# without burning the last of the day's 100 deployments. It did its job: three
# pull requests merged tonight (#136, #137, #138) and none of them built.
#
# But it also meant the Teach section — 81,534 words rewritten for India across
# nine copy passes — was sitting merged on main and NOT on swechha.in, with the
# Vercel check reading "Canceled by Ignored Build Step". The owner asked for it
# live rather than waiting for the automatic expiry a few hours away.
#
# This timestamp is now in the past, so the comparison below always fails and
# every branch builds normally. The quota resets at 00:00 UTC regardless, which
# is what makes lifting it early cheap: there are only a few hours left to spend.
FREEZE_UNTIL="2026-09-11T00:00:00Z"

NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [[ "$NOW" < "$FREEZE_UNTIL" ]]; then
  echo "Deploy freeze: now $NOW is before $FREEZE_UNTIL — skipping this build."
  echo "Commit ${VERCEL_GIT_COMMIT_SHA:-unknown} on ${VERCEL_GIT_COMMIT_REF:-unknown} was NOT deployed."
  exit 0
fi

echo "Deploy freeze expired at $FREEZE_UNTIL (now $NOW) — building normally."
exit 1
