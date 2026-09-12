#!/usr/bin/env bash
# classify-content-commit.sh — the discriminator content-rebuild.yml's
# fidelity gate calls before deciding whether a data/** change is fatal.
#
#   exit 0 -> CMS SAVE.  The fidelity gate is fatal   (workflow sets cms=1)
#   exit 1 -> MIGRATION. The fidelity gate reports only (workflow sets cms=0)
#
# Diffs HEAD~1..HEAD in the CALLER'S CURRENT WORKING DIRECTORY — same
# convention as scripts/vercel-ignore-build.sh — which is what lets this be
# exercised against a throwaway git repo in a test (lib/classify-content-
# commit.test.ts), not only inside the real checkout content-rebuild.yml runs
# against.
#
# TWO THINGS MAKE THIS "NOT A CMS SAVE":
#
#   1. `scripts/` changed. Keystatic cannot write scripts/, so a commit that
#      changes a generator alongside the data is a reviewed migration by
#      construction. This was the ORIGINAL rule (content-rebuild.yml's own
#      header names the AD-39 case it exists for) — unchanged here, just
#      moved into a testable file instead of inline workflow bash.
#
#   2. every changed `data/**` path falls OUTSIDE every Keystatic collection's
#      own `path` — read from `keystatic.config.ts` by
#      `keystatic-managed-paths.mjs`, not hand-copied here as `data/work/**`.
#      Keystatic never had write access to those files, so it could not have
#      produced this diff no matter what changed alongside it. This is what
#      `scripts/situation.mjs` needed: it touches only
#      `data/climate-events/active/**`, which no collection in
#      `keystatic.config.ts` has ever pointed at, and it was misclassified as
#      a CMS save on commit 737f465a / PR #146 because condition 1 alone
#      cannot see that — situation.mjs is a hand-run tool, not a generator, so
#      `scripts/` is untouched by its commits.
#
# NEITHER CONDITION WEAKENS THE GATE FOR THE CASE IT EXISTS TO CATCH. A save
# that changes only files under a Keystatic-managed path, with `scripts/`
# untouched, is still classified as a CMS save (exit 0) and the fidelity check
# stays fatal exactly as before.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if git diff --name-only HEAD~1 HEAD -- scripts 2>/dev/null | grep -q .; then
  echo "A generator changed in this commit:"
  git diff --name-only HEAD~1 HEAD -- scripts | sed 's/^/  /'
  echo "Keystatic cannot write scripts/, so this is a reviewed migration, not a save."
  exit 1
fi

CHANGED_DATA="$(git diff --name-only HEAD~1 HEAD -- data 2>/dev/null | tr '\n' ' ')"

if [[ -z "${CHANGED_DATA// /}" ]]; then
  echo "No data/** path changed — nothing a Keystatic save could have written. Treating as a migration."
  exit 1
fi

if node "$SCRIPT_DIR/keystatic-managed-paths.mjs" --any-managed "$CHANGED_DATA"; then
  echo "A changed path is under a directory Keystatic can write to (see keystatic.config.ts) — treating this as a CMS save. The fidelity gate is fatal."
  exit 0
else
  echo "Every changed data/** path is outside every Keystatic collection's own path — Keystatic could not have written this, so it cannot be a CMS save."
  echo "Changed: $CHANGED_DATA"
  exit 1
fi
