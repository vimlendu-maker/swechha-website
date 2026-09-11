#!/usr/bin/env bash
# Neon: database availability and free-tier headroom.
#
# ★ THIS PROBE CAN CURRENTLY ANSWER ALMOST NOTHING, AND SAYS SO.
#   There is no NEON_API_KEY on this machine, so storage, compute hours and
#   connection health cannot be read. Neon is one of the two HIGHEST cost risks
#   in the stack and the one that grows on its own -- Umami writes a row per
#   visit -- so this silence is the most important blind spot in the monitoring,
#   not a minor gap. It is reported as UNKNOWN every time precisely so it stays
#   visible instead of looking green.
set -euo pipefail
if [ -n "${NEON_API_KEY:-}" ]; then
  P="$(curl -sS --max-time 12 -H "Authorization: Bearer $NEON_API_KEY" \
        https://console.neon.tech/api/v2/projects 2>/dev/null)" || { echo "neon API unreachable"; exit 2; }
  printf '%s' "$P" | grep -q '"projects"' || { echo "neon API rejected the key"; exit 1; }
  exit 0
fi
echo "neon storage/compute/connections UNKNOWN — no NEON_API_KEY (highest unmeasured cost risk)"
exit 2
