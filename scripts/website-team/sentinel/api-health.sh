#!/usr/bin/env bash
# The external data APIs the site depends on: are the keys present, and does
# the one with a readable quota still have headroom?
#
# Quota consumption is NOT measurable for most of these -- data.gov.in, WAQI
# and FIRMS publish limits but expose no quota endpoint, so usage against them
# is UNKNOWN unless counted locally. This probe therefore checks what it can:
# that required keys exist at all, and GitHub's rate limit, which is readable.
set -euo pipefail
cd "${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
missing=""
for v in DATA_GOV_IN_KEY WAQI_TOKEN FIRMS_MAP_KEY; do
  # A key may live only in CI; absence locally is not an outage, so this is
  # informational (exit 2), never a failure.
  [ -z "$(eval "echo \${$v:-}")" ] && missing="$missing $v"
done
RL="$(gh api /rate_limit --jq '.resources.core | "\(.remaining) \(.limit)"' 2>/dev/null)" || RL=""
if [ -n "$RL" ]; then
  REM="${RL%% *}"; LIM="${RL##* }"
  if [ "$LIM" -gt 0 ] && [ "$((REM * 100 / LIM))" -lt 10 ]; then
    echo "github API rate limit nearly exhausted: $REM/$LIM remaining"; exit 1
  fi
fi
[ -n "$missing" ] && { echo "API keys not set in this shell (may be CI-only):$missing"; exit 2; }
exit 0
