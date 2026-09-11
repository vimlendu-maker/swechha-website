#!/usr/bin/env bash
# Failed GitHub Actions runs. The publishers keep the site current; when they
# fail the site silently goes stale, which is invisible from the outside.
#
# ★ IT IS THE LATEST RUN OF EACH WORKFLOW THAT MATTERS, NOT ANY RUN.
#   The first version asked "did any of the last 12 runs fail?", which meant a
#   workflow that failed and then RECOVERED stayed reported as broken until the
#   failure scrolled off the page. Caught on 2026-09-11: it kept naming
#   "Generated pages are current" minutes after a green run of that very
#   workflow. A monitor that cannot see a recovery is a monitor that trains you
#   to ignore it.
#
#   So: group by workflow, take each one's most recent COMPLETED run, and report
#   only those whose latest outcome is a failure.
set -euo pipefail
cd "${WEBSITE_TEAM_REPO:-$HOME/swechha-website}"

RAW="$(gh run list --limit 40 --json conclusion,name,status,createdAt 2>/dev/null)" || exit 2
[ -z "$RAW" ] && exit 2

printf '%s' "$RAW" | python3 -c '
import json, sys
runs = json.load(sys.stdin)
latest = {}
for r in runs:                      # gh returns newest first
    if r.get("status") != "completed":
        continue                    # in flight: not yet an outcome
    latest.setdefault(r["name"], r["conclusion"])

broken = sorted(n for n, c in latest.items() if c == "failure")
if not broken:
    sys.exit(0)
print("workflows failing on their most recent run: " + ", ".join(broken))
sys.exit(1)
'
