#!/usr/bin/env bash
# Is the live site actually serving? HTTP availability of the critical routes.
#
# ★ swechha.in RETURNS 403 TO THIS MACHINE by design — Vercel's attack-challenge
#   mode answers an unverified client with `x-vercel-mitigated: challenge`. That
#   is NOT an outage and must never be reported as one; it is the documented
#   behaviour recorded in the vault. So a 403 carrying that header is treated as
#   REACHABLE-BUT-UNVERIFIABLE (exit 2, UNKNOWN), and only a connection failure,
#   a 5xx, or a 403 WITHOUT that header is a real problem.
#   Getting this wrong would page the department every thirty minutes forever.
set -euo pipefail
ORIGIN="${SITE_ORIGIN:-https://swechha.in}"
ROUTES="${SITE_ROUTES:-/ /now /work /about /act}"
down=""; unknown=""
for r in $ROUTES; do
  H="$(curl -sS -o /dev/null -D - --max-time 12 "$ORIGIN$r" 2>/dev/null)" || { down="$down $r(unreachable)"; continue; }
  CODE="$(printf '%s' "$H" | awk 'NR==1{print $2}')"
  case "$CODE" in
    2*|3*) ;;
    403)   printf '%s' "$H" | grep -qi 'x-vercel-mitigated' \
             && unknown="$unknown $r" || down="$down $r(403)" ;;
    *)     down="$down $r($CODE)" ;;
  esac
done
[ -n "$down" ] && { echo "site not serving:$down"; exit 1; }
[ -n "$unknown" ] && { echo "site returns Vercel challenge to this machine, so availability is UNVERIFIABLE from here:$unknown"; exit 2; }
exit 0
