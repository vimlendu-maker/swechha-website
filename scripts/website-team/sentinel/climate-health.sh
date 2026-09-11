#!/usr/bin/env bash
# Is the site's own air data fresh? air:status compares what the site shows
# against CPCB's freshest reachable observation. The one check that sees
# STALENESS rather than breakage — a pipeline can be green and still publish
# yesterday.
#
# ★ THE FORMAT IS `VERDICT   OK`, WHITESPACE-SEPARATED, NOT `VERDICT: OK`.
#   The first version grepped for a colon, matched nothing ever, and so
#   reported the pipeline healthy under every possible condition. Re-read the
#   real output before touching this pattern.
set -euo pipefail
cd "${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"
set +e
RAW="$(npm run --silent air:status 2>/dev/null)"; RC=$?
set -e
[ "$RC" -ne 0 ] && { echo "air:status exited $RC"; exit 2; }
V="$(printf '%s' "$RAW" | grep -oE 'VERDICT[[:space:]]+[A-Z]+' | head -1 | awk '{print $2}')"
# Silence is not health: if the instrument stops producing a verdict, that is
# itself the finding.
[ -z "$V" ] && { echo "air:status produced no VERDICT line"; exit 2; }
[ "$V" = "OK" ] && exit 0
echo "air pipeline: $V"; exit 1
