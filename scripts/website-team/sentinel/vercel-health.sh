#!/usr/bin/env bash
# Vercel: platform status, and — once a token exists — whether production is
# actually deploying.
#
# ★ THE DEPLOYMENT CHECK IS THE ONE THAT MATTERS, and it is the gap this probe
#   was built around. On 2026-09-11 a type error broke every production
#   deployment for over half an hour. The site never went down — Vercel keeps
#   serving the last good build — so nothing looked wrong from outside. What
#   stopped was the site receiving NEW DATA, which for a live air-quality and
#   climate site is its whole purpose. A page quietly frozen is the failure
#   mode here, not an outage, and only the deployments API can see it.
#
# ★ NO VALUE FROM $VERCEL_TOKEN IS EVER PRINTED. This reports pass, fail or
#   UNKNOWN and nothing else. Do not add a debug echo of the header.
#
# Scope note: the token should be PROJECT-scoped. Vercel has no read-only
# permission level, so narrow scope is the only control there is — a
# project-scoped token is denied every other project and all team- and
# user-level resources. Team- and project-scoped tokens need no teamId.
set -euo pipefail

ENV_FILE="${WEBSITE_TEAM_ENV:-$HOME/.swechha-ai/env}"
# shellcheck disable=SC1090
[ -r "$ENV_FILE" ] && . "$ENV_FILE"

# ── 1. Platform status, which needs no credential ────────────────────────────
S="$(curl -sS --max-time 10 https://www.vercel-status.com/api/v2/status.json 2>/dev/null)" || {
  echo "vercel status page unreachable"; exit 2; }
IND="$(printf '%s' "$S" | python3 -c 'import json,sys;print(json.load(sys.stdin)["status"]["indicator"])' 2>/dev/null)" || {
  echo "vercel status page returned no indicator"; exit 2; }
case "$IND" in
  none) ;;
  minor) echo "vercel: minor incident"; exit 1 ;;
  *) echo "vercel: $IND incident"; exit 1 ;;
esac

# ── 2. Is production actually deploying? ─────────────────────────────────────
if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "vercel deployments and usage UNKNOWN — no VERCEL_TOKEN in $ENV_FILE"
  exit 2
fi

# limit=100 so the same single request answers both questions: is the latest
# production deployment healthy, and how close is the day's deployment count to
# the Hobby cap. One request per run, not two.
RESP="$(curl -sS --max-time 25 \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  'https://api.vercel.com/v6/deployments?limit=100' 2>/dev/null)" || {
  echo "vercel deployments API unreachable"; exit 2; }

# The API answers a bad or expired token with an `error` object rather than an
# HTTP failure curl would notice, so read the body, not the exit code.
python3 - "$RESP" <<'PY'
import json, sys
try:
    d = json.loads(sys.argv[1])
except Exception:
    print("vercel deployments API returned unreadable JSON"); sys.exit(2)

if isinstance(d, dict) and d.get("error"):
    code = d["error"].get("code", "?")
    # A rejected token is a real problem to surface, not an UNKNOWN to shrug at:
    # it means this probe has been blind since whenever the token expired.
    print(f"vercel token rejected ({code}) — the deployment check is blind")
    sys.exit(1)

deps = (d or {}).get("deployments") or []
if not deps:
    print("vercel returned no deployments"); sys.exit(2)

# ── FREE-TIER HEADROOM, from the published limit, not an invented one ────────
# Hobby allows 100 deployments per day. The air pipeline pushes every fifteen
# minutes and every push to main deploys, so this is the free-tier ceiling this
# site is actually closest to -- measured at 51/day on 2026-09-11. The 70/90
# percentages are a CHOICE and are labelled as one; the 100 is the provider's.
import time
now = time.time() * 1000
day = [x for x in deps if now - (x.get("created") or 0) < 86_400_000]
CAP = 100
pct = 100 * len(day) / CAP
capped = len(deps) >= 100  # a full page means the count is a floor, not a total

prod = [x for x in deps
        if (x.get("target") == "production" or x.get("target") is None)]
if not prod:
    print("vercel returned no production deployments"); sys.exit(2)

latest = prod[0]
state = (latest.get("state") or latest.get("readyState") or "").upper()
sha = (latest.get("meta") or {}).get("githubCommitSha", "")[:8]

def headroom_note():
    floor = "at least " if capped else ""
    return (f"vercel: {floor}{len(day)} deployments in 24h against Hobby's "
            f"published 100/day cap ({pct:.0f}%)")

if state in ("READY",):
    if pct >= 90:
        print(headroom_note() + " — deployments will start being refused"); sys.exit(1)
    if pct >= 70:
        print(headroom_note() + " — approaching the cap"); sys.exit(1)
    sys.exit(0)
if state in ("BUILDING", "QUEUED", "INITIALIZING"):
    sys.exit(0)   # in flight; the next run will judge it
if state in ("ERROR", "CANCELED"):
    # How long has production been unable to ship? Consecutive failures matter
    # more than one, because one may already be fixed.
    streak = 0
    for dep in prod:
        if (dep.get("state") or dep.get("readyState") or "").upper() == "ERROR":
            streak += 1
        else:
            break
    print(f"vercel production deployment {state} at {sha or 'unknown commit'}"
          f"{f' ({streak} in a row)' if streak > 1 else ''} — the site is frozen on the last good build")
    sys.exit(1)

print(f"vercel deployment state not recognised: {state or 'empty'}")
sys.exit(2)
PY
