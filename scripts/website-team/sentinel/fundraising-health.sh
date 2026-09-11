#!/usr/bin/env bash
# The fundraising department: did it run, did it succeed, and are its workflows
# failing?
#
# ★ ARCHITECTURAL DEBT, NAMED RATHER THAN HIDDEN. This probe lives in the
#   WEBSITE department's repository and watches a DIFFERENT department. That is
#   the wrong home and it is deliberate for now: the sentinel is the only
#   watching machinery that exists, and fundraising — the one department with a
#   paid dependency — was watched by nothing at all. Delivering the watch beat
#   waiting for an org-level home.
#   The right end state is an org-level sentinel that reads probe roots from
#   swechha/ai/departments.json, with each department owning its own probes.
#   Until then, this file is a tenant, not a resident.
#
# ★ IT NEEDS NO CREDENTIALS. Fundraising's keys (Anthropic, Airtable, Brevo,
#   Tavily, Gemini) are GitHub Actions secrets and are NOT on this machine. So
#   this probe deliberately watches only what `gh` can already see: the
#   department's own committed state, and its workflow outcomes. That covers the
#   failure mode that actually matters — SILENCE — without asking anyone to copy
#   a secret onto a laptop.
#
# ★ WHAT IT CANNOT SEE, and says so: Anthropic spend, Tavily usage, Airtable
#   record counts, Brevo's 300/day. Those need credentials this machine does not
#   have; spend in particular would need an Anthropic ADMIN key, which is a
#   different and more powerful thing than the API key the pipeline uses.
set -euo pipefail

REPO_SLUG="${FUNDRAISING_REPO:-vimlendu-maker/swechha-fundraising}"

# ── 1. Has discovery actually succeeded recently? ────────────────────────────
# state/last_success.txt is written by the pipeline itself and committed back by
# the workflow, so it is the department's own account of when it last worked.
LAST="$(gh api "repos/$REPO_SLUG/contents/state/last_success.txt" --jq '.content' 2>/dev/null \
        | base64 -d 2>/dev/null | tr -d '[:space:]')" || LAST=""

if [ -z "$LAST" ]; then
  echo "fundraising: cannot read state/last_success.txt — UNKNOWN whether it is running"
  exit 2
fi

VERDICT="$(LAST="$LAST" python3 <<'PY'
import datetime as dt, os, sys

raw = os.environ["LAST"]
try:
    last = dt.date.fromisoformat(raw[:10])
except ValueError:
    print(f"UNKNOWN|last_success.txt is not a date: {raw[:30]}")
    sys.exit()

now = dt.datetime.now()
stale = (now.date() - last).days

# Discovery runs 06:37-11:01 IST. Before that window closes, "yesterday" is the
# only honest expectation -- flagging at 02:00 that today has not run yet would
# be a monitor that cries wolf every single night.
window_closed = now.hour >= 12

if stale <= 0:
    print("OK|succeeded today")
elif stale == 1 and not window_closed:
    print("OK|last succeeded yesterday; today's window has not closed yet")
elif stale == 1:
    print("ATTENTION|no successful run today — the 06:37-11:01 window has passed")
else:
    print(f"PROBLEM|no successful run for {stale} days (last: {last.isoformat()})")
PY
)"

STATE="${VERDICT%%|*}"
DETAIL="${VERDICT#*|}"

# ── 2. Are its workflows failing on their LATEST run? ────────────────────────
# Same rule as github-health: any-of-the-last-N reports a recovered workflow as
# broken forever, which trains you to ignore the monitor.
FAILING="$(gh run list --repo "$REPO_SLUG" --limit 30 --json name,conclusion,status 2>/dev/null \
  | python3 -c '
import json, sys
try:
    runs = json.load(sys.stdin)
except Exception:
    sys.exit(0)
latest = {}
for r in runs:
    if r.get("status") == "completed":
        latest.setdefault(r["name"], r["conclusion"])
bad = sorted(n for n, c in latest.items() if c == "failure")
print(", ".join(bad))
' 2>/dev/null)" || FAILING=""

case "$STATE" in
  PROBLEM)   echo "fundraising: $DETAIL${FAILING:+; workflows failing: $FAILING}"; exit 1 ;;
  ATTENTION) echo "fundraising: $DETAIL${FAILING:+; workflows failing: $FAILING}"; exit 1 ;;
  UNKNOWN)   echo "fundraising: $DETAIL"; exit 2 ;;
esac

[ -n "$FAILING" ] && { echo "fundraising: $DETAIL, but workflows failing: $FAILING"; exit 1; }
exit 0
