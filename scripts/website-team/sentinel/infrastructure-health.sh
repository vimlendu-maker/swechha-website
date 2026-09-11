#!/usr/bin/env bash
# Free-tier headroom and provider status, via the cached deterministic
# instrument. Exit 2 there is RED/BLOCKED; exit 1 is AMBER, a watch item
# rather than a wake-up.
set -euo pipefail
cd "${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
set +e
python3 scripts/website-team/infra-status.py >/dev/null 2>&1; RC=$?
set -e
[ "$RC" -ge 2 ] && { echo "infrastructure: a service is RED or BLOCKED"; exit 1; }
exit 0
