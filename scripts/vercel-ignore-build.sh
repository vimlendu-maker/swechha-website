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

# --- PATH-BASED SKIP --------------------------------------------------------
#
# WHY THIS EXISTS
#
# The time-based freeze above is for a deliberate, announced pause. It says
# nothing about the ordinary case: a commit that only touches internal
# tooling — this department's own docs, its runner scripts, its policy file —
# and could never change a single byte a reader loads. On 2026-09-12, with the
# account at 98/100 for the day (`npm run infra:status`), three such commits
# still burned a deployment each: `4406b9ee` (only
# `docs/website-team/policy.json` + `scripts/website-team/on-change.sh`),
# `91ea00a4` (only `docs/website-team/lessons.md`), and `b448a270` (only
# `scripts/build-teach.mjs` + `scripts/verify-cutover.mjs` — no regenerated
# `public/_pages` alongside them, so the served output was byte-identical
# before and after).
#
# The set below is deliberately narrow. It is safe to add a path here ONLY
# when NOTHING under it can affect app/, public/, content/, data/, the build
# config, or a page generator — a generator change must still build, because
# the next commit that runs it needs a working pipeline, and being wrong here
# costs a stale build, not a skipped one. That is why `scripts/build-*.mjs` is
# NOT in this set even when a commit touching one regenerates no page: this
# check only ever looks backwards at one commit's diff, never forwards at
# whether the generator will be run again.
NEVER_AFFECTS_SERVED_SITE='^(docs/.*|\.claude/.*|\.superpowers/.*|scripts/website-team/.*|CLAUDE\.md|AGENTS\.md|README\.md|lib/website-team-.*\.test\.ts)$'

CHANGED="$(git diff --name-only HEAD^ HEAD 2>/dev/null || true)"

if [[ -z "$CHANGED" ]]; then
  echo "Could not determine changed paths (git diff --name-only HEAD^ HEAD returned nothing) — building normally."
  exit 1
fi

SERVED_CHANGE=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  if ! [[ "$f" =~ $NEVER_AFFECTS_SERVED_SITE ]]; then
    SERVED_CHANGE=1
  fi
done <<< "$CHANGED"

if [[ "$SERVED_CHANGE" -eq 0 ]]; then
  echo "Every changed path is internal tooling that cannot affect the served site — skipping this build."
  echo "Changed paths:"
  echo "$CHANGED"
  exit 0
fi

echo "A changed path could affect the served site — building normally."
exit 1
