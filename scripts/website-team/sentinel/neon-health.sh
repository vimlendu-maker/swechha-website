#!/usr/bin/env bash
# Neon: plan, storage headroom, and whether the API answers at all.
#
# ★ THIS WAS THE BIGGEST BLIND SPOT IN THE STACK until 2026-09-11. Neon storage
#   grows WITHOUT ANYONE ACTING — the self-hosted Umami analytics writes a row
#   per visit — so it is the one free-tier limit that can be crossed by the site
#   simply being used. Nothing could see it until the API key arrived.
#
# ★ THREE PROJECTS SHARE THIS ONE FREE PLAN, and one of them is not the
#   website's: farm-app, swechha-analytics (Umami) and Swechha Website all sit
#   under the same Neon organisation. The website department therefore watches a
#   quota it does not solely control, and a report that named only the website's
#   own project would understate the risk. All three are counted.
#
# ★ NO VALUE FROM $NEON_API_KEY IS EVER PRINTED.
#
# The org id is DISCOVERED, not hardcoded: /projects refuses without org_id, and
# a hardcoded one silently rots the day the account changes. Two cheap requests.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HERE/env.inc"

if [ -z "${NEON_API_KEY:-}" ]; then
  echo "neon storage/compute UNKNOWN — no NEON_API_KEY in ~/.swechha-ai/env (the one limit that grows on its own)"
  exit 2
fi

API=https://console.neon.tech/api/v2
auth=(-H "Authorization: Bearer $NEON_API_KEY" -H "Accept: application/json")

ORGS="$(curl -sS --max-time 20 "${auth[@]}" "$API/users/me/organizations" 2>/dev/null)" || {
  echo "neon API unreachable"; exit 2; }

# Distinguish a REJECTED key from a request that merely needs a parameter. The
# first version conflated them and reported a perfectly good key as rejected.
case "$ORGS" in
  *'"organizations"'*) ;;
  *'"code"'*)
    MSG="$(printf '%s' "$ORGS" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("message","")[:80])' 2>/dev/null)"
    echo "neon API refused the key: ${MSG:-unknown reason}"; exit 1 ;;
  *) echo "neon API returned something unreadable"; exit 2 ;;
esac

ORG="$(printf '%s' "$ORGS" | python3 -c 'import json,sys;o=json.load(sys.stdin)["organizations"];print(o[0]["id"] if o else "")' 2>/dev/null)"
[ -z "$ORG" ] && { echo "neon: the key sees no organisation"; exit 2; }

PLAN="$(curl -sS --max-time 20 "${auth[@]}" "$API/organizations/$ORG" 2>/dev/null \
  | python3 -c 'import json,sys;print(json.load(sys.stdin).get("plan",""))' 2>/dev/null || echo '')"

PROJ="$(curl -sS --max-time 25 "${auth[@]}" "$API/projects?org_id=$ORG" 2>/dev/null)" || {
  echo "neon projects endpoint unreachable"; exit 2; }

printf '%s' "$PROJ" | PLAN="$PLAN" python3 -c '
import json, os, sys

d = json.load(sys.stdin)
if d.get("code"):
    msg = str(d.get("message", ""))[:70]
    print("neon projects refused: " + msg); sys.exit(2)
ps = d.get("projects") or []
if not ps:
    print("neon returned no projects"); sys.exit(2)

plan = os.environ.get("PLAN", "")
# Published free-plan storage allowance. Read from Neon docs, not measured, and
# labelled as published wherever it is reported -- the same rule the rest of the
# inventory follows.
LIMIT = 512 * 1024 * 1024

total = sum(p.get("synthetic_storage_size") or 0 for p in ps)
pct = 100 * total / LIMIT
def row(p):
    mb = (p.get("synthetic_storage_size") or 0) / 1048576
    return "{} {:.0f}MB".format(p.get("name"), mb)


rows = ", ".join(row(p) for p in sorted(
    ps, key=lambda x: -(x.get("synthetic_storage_size") or 0)))

if plan and plan != "free":
    # Not a failure -- but a plan change is a COST event and must never pass
    # silently, because free-first is the standing constraint.
    print(f"neon plan is now '{plan}', not free — {total/1048576:.0f}MB across {len(ps)} projects")
    sys.exit(1)

summary = (f"neon: {total/1048576:.0f}MB across {len(ps)} projects "
           f"({pct:.0f}% of the published 512MB free allowance) — {rows}")

if pct >= 90:
    print(summary + " — at the ceiling"); sys.exit(1)
if pct >= 70:
    print(summary + " — approaching the ceiling"); sys.exit(1)
sys.exit(0)
'
