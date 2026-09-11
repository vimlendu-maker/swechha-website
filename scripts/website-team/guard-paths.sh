#!/usr/bin/env bash
# Refuse a change that touches a path the team may never touch.
#
# WHY THIS EXISTS SEPARATELY FROM THE PERMISSION SYSTEM:
#   Permissions are enforced by Claude Code and configured by flags, and this
#   repo has already been bitten once by a rule that was "accepted and never
#   consulted" (Write(path) -- see docs/website-team/lessons.md). This guard
#   reads the actual diff with git and exits non-zero. It does not care what the
#   agent intended, what its role file says, or whether a permission rule
#   matched. It is the layer that still works when the layer above it is
#   misconfigured.
#
# Usage: guard-paths.sh <base-ref> [--post-build]
#
#   Default (pre-build): public/_pages/ is forbidden. A specialist must never
#   hand-edit served HTML -- it is a build artefact, and an edit there is
#   overwritten by the next build while looking like it worked.
#
#   --post-build: public/_pages/ is allowed, because `npm run build:all`
#   legitimately regenerates it and "regenerate the committed pages" is on the
#   safe_to_automate list. Everything else stays forbidden.
#
#   The distinction matters: without it the guard refuses the team's own core
#   job, and with only one of the two calls an agent could hand-edit served HTML
#   and have the build appear to bless it.
set -euo pipefail

BASE="${1:-origin/main}"
PHASE="${2:-}"

# Mirrors auto_merge.never_touch in docs/website-team/policy.json. The
# duplication is deliberate: this file is the last line of defence and must not
# stop working because a JSON edit broke a parser. lib/website-team-policy.test.ts
# fails if the two lists ever disagree.
FORBIDDEN=(
  'app/'
  'data/'
  'next.config.ts'
  'design-routes.ts'
  '.github/workflows/'
  'docs/website-team/policy.json'
  'lib/seo/register.test.ts'
)

# Hand-editing served HTML is forbidden; the build regenerating it is not.
if [ "$PHASE" != "--post-build" ]; then
  FORBIDDEN+=('public/_pages/')
fi

CHANGED="$(git diff --name-only "$BASE"...HEAD)"
if [ -z "$CHANGED" ]; then echo "guard: no changes against $BASE"; exit 0; fi

VIOLATIONS=""
while IFS= read -r f; do
  [ -z "$f" ] && continue
  for bad in "${FORBIDDEN[@]}"; do
    case "$f" in "$bad"*) VIOLATIONS="$VIOLATIONS  $f  (matches $bad)"$'\n' ;; esac
  done
done <<< "$CHANGED"

if [ -n "$VIOLATIONS" ]; then
  echo "guard: REFUSED — the change touches paths the team may never touch:" >&2
  printf '%s' "$VIOLATIONS" >&2
  echo "guard: see auto_merge.never_touch in docs/website-team/policy.json" >&2
  exit 1
fi
echo "guard: ok — $(printf '%s\n' "$CHANGED" | grep -c .) file(s), none forbidden"
