#!/usr/bin/env bash
# Failed GitHub Actions runs. The publishers keep the site current; when they
# fail the site silently goes stale, which is invisible from the outside.
set -euo pipefail
cd "${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
OUT="$(gh run list --limit 12 --json conclusion,name \
  --jq '[.[] | select(.conclusion == "failure") | .name] | unique | join(", ")' 2>/dev/null)" || exit 2
[ -z "$OUT" ] && exit 0
echo "workflows failing: $OUT"; exit 1
