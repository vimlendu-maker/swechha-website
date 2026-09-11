#!/usr/bin/env bash
# Stage two: give one specialist brief to one specialist, with write access, and
# turn it into a reviewed pull request -- merging it only when every condition
# holds.
#
# THE MANAGER NEVER RUNS THIS. It decides; this executes. The manager's session
# has no file tools at all, so a synthesis error cannot become a commit. That
# separation is the whole point and it is why there are two scripts.
#
# Usage: execute.sh <specialist> <brief-file> [--dry-run]
set -euo pipefail

REPO="${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
SPECIALIST="${1:?usage: execute.sh <specialist> <brief-file> [--dry-run]}"
BRIEF_FILE="${2:?usage: execute.sh <specialist> <brief-file> [--dry-run]}"
DRY="${3:-}"
cd "$REPO"

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
ALLOWED='Read,Grep,Glob'
ALLOWED="$ALLOWED,Edit(scripts/**),Edit(lib/**),Edit(components/**),Edit(docs/**)"
ALLOWED="$ALLOWED,Bash(npm test),Bash(npm run lint),Bash(npm run build:all)"
ALLOWED="$ALLOWED,Bash(npm run verify:seo),Bash(npm run verify:final)"
ALLOWED="$ALLOWED,Bash(git status:*),Bash(git diff:*),Bash(git log:*)"

BRANCH="team/$(date +%Y%m%d)-$(basename "$BRIEF_FILE" .txt | tr -cd '[:alnum:]-' | cut -c1-40)"

if [ "$DRY" = "--dry-run" ]; then
  echo "specialist: $SPECIALIST"
  echo "branch:     $BRANCH"
  echo "tools:      $ALLOWED"
  echo "brief:"; sed 's/^/  /' "$BRIEF_FILE"
  exit 0
fi

git fetch -q origin
git checkout -q -B "$BRANCH" origin/main

PROMPT="$(cat "$BRIEF_FILE")

Make the change. Edit files only — **do not run git, do not commit, do not
push, do not open a pull request.** The runner does all of that, so that what
ships is exactly the diff and nothing else.

Before you finish, run \`npm test\` and \`npm run lint\` and report their output.
If you cannot do the task within your permitted paths, change nothing and say
why — an empty diff is a fine outcome and far better than a partial one."

claude -p "$PROMPT" --agent "$SPECIALIST" --permission-mode dontAsk \
  --allowedTools "$ALLOWED" --output-format json < /dev/null > /tmp/wt-exec.json 2>/dev/null || true
python3 "$REPO/scripts/website-team/parse-result.py" < /tmp/wt-exec.json | tail -n +2 > /tmp/wt-exec.txt || true

if git diff --quiet && git diff --cached --quiet; then
  echo "execute: no changes made — nothing to ship"
  git checkout -q - ; git branch -qD "$BRANCH" 2>/dev/null || true
  exit 0
fi

git add -A
git commit -q -m "$(head -1 "$BRIEF_FILE" | cut -c1-70)

Executed by $SPECIALIST from a website-team brief.
$(sed 's/^/  /' /tmp/wt-exec.txt | head -20)"

# ── THE GATES, IN THE ORDER THAT FAILS CHEAPEST FIRST ────────────────────────
FAILED=""
# Pre-build: served HTML must not have been hand-edited.
./scripts/website-team/guard-paths.sh origin/main || FAILED="$FAILED guard"
npm test  >/tmp/wt-test.log 2>&1 || FAILED="$FAILED tests"
npm run lint >/tmp/wt-lint.log 2>&1 || FAILED="$FAILED lint"
npm run build:all >/tmp/wt-build.log 2>&1 || FAILED="$FAILED build"
npm run verify:seo >/tmp/wt-seo.log 2>&1 || FAILED="$FAILED verify:seo"

# A build may legitimately regenerate committed pages. That is a change to
# public/_pages, which the guard forbids -- so re-run the guard AFTER the build
# and refuse rather than quietly shipping regenerated artefacts.
git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "chore: regenerate after build:all"
  # Post-build: regenerated pages are expected; everything else still forbidden.
  ./scripts/website-team/guard-paths.sh origin/main --post-build || FAILED="$FAILED guard-after-build"
fi

if [ -n "$FAILED" ]; then
  echo "execute: FAILED —$FAILED"
  echo "execute: branch $BRANCH kept locally for inspection; nothing pushed"
  exit 1
fi

git push -q -u origin "$BRANCH"
PR_URL="$(gh pr create --base main --head "$BRANCH" \
  --title "$(head -1 "$BRIEF_FILE" | cut -c1-70)" \
  --body "$(printf 'Opened by the website team, stage two.\n\n## Brief\n\n%s\n\n## What the specialist reported\n\n%s\n\n## Gates\n\n- guard-paths: pass\n- npm test: pass\n- npm run lint: pass\n- npm run build:all: pass\n- npm run verify:seo: pass\n\nMerging is conditional on every `auto_merge` condition in `docs/website-team/policy.json`. If any failed, this PR waits for a human.\n' "$(cat "$BRIEF_FILE")" "$(cat /tmp/wt-exec.txt)")")"
echo "execute: opened $PR_URL"

AUTO="$(python3 -c "import json;print(json.load(open('docs/website-team/policy.json'))['auto_merge']['enabled'])")"
if [ "$AUTO" = "True" ]; then
  # --auto asks GitHub to merge when required checks pass. It respects branch
  # protection, so if review is required this waits for a human -- which is the
  # correct outcome, not a failure.
  if gh pr merge --auto --squash "$PR_URL" 2>/dev/null; then
    echo "execute: auto-merge enabled; GitHub will merge when checks pass"
  else
    echo "execute: auto-merge unavailable (branch protection or repo setting) — PR waits for a human"
  fi
else
  echo "execute: auto_merge disabled in policy — PR waits for a human"
fi
