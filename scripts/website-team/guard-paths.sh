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
  'scripts/org/'
  'scripts/website-team/'
)

# ★ CHECKED BEFORE FORBIDDEN. The mechanism for narrowing a deny, currently
#   holding nothing.
#
#   It existed for one case: a `WATCH:` inbox item meant "add a deterministic
#   probe to scripts/website-team/sentinel/", so that one directory had to stay
#   writable inside an otherwise forbidden tree. The sentinel moved to the
#   swechha-ai repository on 2026-09-11 — it watches two departments and lived
#   inside one of them — so the exception has nothing left to except.
#
#   The directory-wide deny above stays as it is. Denying the directory rather
#   than listing run.sh, execute.sh, worktree.sh and the rest by name is the
#   point: a list of machinery files is a list that must move in lockstep with
#   the machinery, which is this repository's most repeated defect. New
#   machinery is forbidden by DEFAULT.
#
#   The mechanism is kept rather than deleted because the next legitimate
#   exception should narrow a deny, not delete one.
ALLOWED=(
  # ★ THE BUILD'S OWN HASH REGISTER, AND WHY DENYING IT BROKE THE DEPARTMENT.
  #
  #   `npm run build:all` rewrites data/seo/lastmod.json on every run that
  #   changes any rendered page — that is what the file is for. `data/` is
  #   forbidden above, and nothing narrowed it, so ANY change that altered what
  #   a reader sees failed the guard and was refused with "branch kept locally
  #   for inspection; nothing pushed".
  #
  #   The effect was exactly backwards. A change that alters no output — the
  #   ternary-to-if/else lint pass in #136 — produced no lastmod diff and
  #   shipped. Every change that FIXED SOMETHING VISIBLE could not. Measured on
  #   2026-09-12: five branches, all of them /teach, refused between 08:21 and
  #   13:10, four of them re-diagnosing and re-fixing the same two unstyled
  #   classes because none of the earlier ones had reached main for the next
  #   run to see. The live site kept the defect all day.
  #
  #   This is the narrowing the mechanism was kept for. `data/` stays denied —
  #   the real authored data under it is exactly what the department must not
  #   rewrite. Only this one generated file is excepted, and it is named in
  #   full rather than as a directory so the exception cannot widen by
  #   accident. lib/website-team-policy.test.ts fails if it does.
  #
  #   Safe to except because it is machine-written by definition: it carries a
  #   custom key-wise merge driver precisely because no human edits it
  #   (docs/LASTMOD-MERGE-DRIVER.md), and generated-current.yml regenerates it
  #   on every pull request and fails on any drift. A hand edit here cannot
  #   survive; a denied build artefact stopped all shipping.
  'data/seo/lastmod.json'
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
  allowed=""
  # ${A[@]+"${A[@]}"} rather than "${A[@]}": macOS ships bash 3.2, where
  # expanding an EMPTY array under `set -u` is an unbound-variable error. The
  # list is empty today, and an empty exception list must not break the guard
  # into refusing everything — which is exactly what it did, caught by the test
  # that runs the guard rather than reading it.
  for ok in ${ALLOWED[@]+"${ALLOWED[@]}"}; do
    case "$f" in "$ok"*) allowed=1 ;; esac
  done
  # An `if` rather than `[ -n "$allowed" ] && continue`. Both are correct here
  # — bash exempts a command in a `&&` list from `set -e` — but the `if` does
  # not depend on knowing that exemption, and this file is the last line of
  # defence. Prefer the form whose safety does not need a footnote.
  if [ -n "$allowed" ]; then continue; fi
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
