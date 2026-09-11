#!/usr/bin/env bash
# Vercel platform status, and deployment health where it can be read.
#
# USAGE AND PLAN REMAIN UNKNOWN: there is no VERCEL_TOKEN and no Vercel CLI on
# this machine, so bandwidth, build minutes and plan cannot be measured. That is
# reported as UNKNOWN rather than guessed -- see docs/website-team/
# infrastructure.md, where Vercel is one of the two HIGHEST cost risks in the
# stack and one of the two things that cannot currently be measured at all.
set -euo pipefail
S="$(curl -sS --max-time 10 https://www.vercel-status.com/api/v2/status.json 2>/dev/null)" || {
  echo "vercel status page unreachable"; exit 2; }
IND="$(printf '%s' "$S" | python3 -c 'import json,sys;print(json.load(sys.stdin)["status"]["indicator"])' 2>/dev/null)" || {
  echo "vercel status page returned no indicator"; exit 2; }
case "$IND" in
  none) ;;
  minor) echo "vercel: minor incident"; exit 1 ;;
  *) echo "vercel: $IND incident"; exit 1 ;;
esac
[ -z "${VERCEL_TOKEN:-}" ] && { echo "vercel deployments and usage UNKNOWN — no VERCEL_TOKEN on this machine"; exit 2; }
exit 0
