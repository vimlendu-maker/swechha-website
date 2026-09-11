#!/usr/bin/env python3
"""Infrastructure and free-tier status: one table, one source of truth.

★ THIS FILE MEASURES NOTHING. It is a renderer.
  Live state comes from scripts/website-team/sentinel/*.sh — the probes — and
  slow-moving facts come from docs/website-team/services.json. That separation
  is the whole point of this rewrite.

  The previous version carried its OWN copies of the Vercel, GitHub and rate
  limit checks alongside the probes. On 2026-09-11 the two drifted within four
  hours: this table reported "Neon UNKNOWN — no NEON_API_KEY" while neon-health
  was measuring 112MB of it, and reported GitHub AMBER using the
  any-of-the-last-30-runs rule that had already been fixed in github-health.
  Two instruments computing one fact is this repository's most repeated defect
  class, and that was one more instance of it.

  SO: if you want to change what a service reports, change its PROBE. Adding a
  check here is the mistake this paragraph exists to prevent.

★ NEVER PRESENTS AN UNOBTAINABLE METRIC AS HEALTHY. A service with no probe is
  UNKNOWN, and UNKNOWN is a gap rather than a pass. A probe that cannot reach
  its provider is UNKNOWN too. Nothing is estimated.

★ NO MODEL CALL. The Website Manager reads this; it does not produce it.

Exit codes: 0 all clear (UNKNOWN included), 2 something needs attention.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

HOME = Path(os.path.expanduser("~"))
REPO = Path(os.environ.get("WEBSITE_TEAM_REPO", HOME / "swechha-website"))
PROBES = Path(os.environ.get("WEBSITE_TEAM_PROBES", REPO / "scripts/website-team/sentinel"))
INVENTORY = Path(os.environ.get("WEBSITE_TEAM_SERVICES", REPO / "docs/website-team/services.json"))

# Probe results are cached briefly so that rendering the table twice — once for
# the terminal, once for the dashboard — does not probe twice.
CACHE = Path(os.environ.get("WEBSITE_TEAM_PROBE_CACHE", HOME / ".swechha-ai" / "probe-cache.json"))
TTL = int(os.environ.get("WEBSITE_TEAM_PROBE_TTL", "300"))

STATUS_FROM_RC = {0: "GREEN", 1: "ATTENTION", 2: "UNKNOWN"}


def run_probe(name: str) -> dict:
    """Run one probe and read ONLY its contract: exit code, and one line."""
    path = PROBES / f"{name}.sh"
    if not path.exists():
        return {"status": "UNKNOWN", "detail": f"probe {name} is missing", "at": time.time()}
    try:
        p = subprocess.run([str(path)], capture_output=True, text=True, timeout=90)
    except subprocess.TimeoutExpired:
        return {"status": "UNKNOWN", "detail": f"probe {name} timed out", "at": time.time()}
    except Exception as e:  # noqa: BLE001 — a broken probe must not break the table
        return {"status": "UNKNOWN", "detail": f"probe {name} failed: {e}", "at": time.time()}
    out = (p.stdout or "").strip()
    return {
        "status": STATUS_FROM_RC.get(p.returncode, "UNKNOWN"),
        "detail": out.splitlines()[0] if out else "",
        "at": time.time(),
    }


def probe_results(names: list, fresh: bool, offline: bool) -> dict:
    cache = {}
    try:
        cache = json.loads(CACHE.read_text())
    except Exception:
        pass
    now = time.time()
    out = {}
    for n in names:
        hit = cache.get(n)
        if hit and not fresh and now - hit.get("at", 0) < TTL:
            out[n] = dict(hit, cached=True)
            continue
        if offline:
            out[n] = dict(hit or {"status": "UNKNOWN", "detail": "not probed (offline)", "at": 0},
                          cached=True)
            continue
        out[n] = run_probe(n)
    try:
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        CACHE.write_text(json.dumps(
            {k: {i: j for i, j in v.items() if i != "cached"} for k, v in out.items()}, indent=2))
    except Exception:
        pass
    return out


def age(ts: float) -> str:
    if not ts:
        return "never"
    s = time.time() - ts
    if s < 90:
        return "just now"
    if s < 5400:
        return f"{int(s / 60)}m ago"
    return f"{int(s / 3600)}h ago"


def build(fresh: bool = False, offline: bool = False) -> dict:
    inv = json.loads(INVENTORY.read_text())
    services = inv["services"]
    names = sorted({s["probe"] for s in services if s.get("probe")})
    results = probe_results(names, fresh, offline)

    rows = []
    for s in services:
        pn = s.get("probe")
        r = results.get(pn) if pn else None
        if r is None:
            status = "UNKNOWN"
            detail = s.get("unmeasured") or "no probe covers this service"
            last = "never"
        else:
            status = r["status"]
            detail = r["detail"]
            last = age(r.get("at", 0))
            if status == "GREEN" and not detail:
                # A probe is silent when clear; the row should still say so.
                detail = "clear"
        rows.append({
            "service": s["name"],
            "status": status,
            "plan": s["plan"],
            "usage": detail,
            "limit": s["limit"],
            "headroom": f"unmeasured: {s['unmeasured']}" if s.get("unmeasured") else "",
            "cost_risk": s["cost_risk"],
            "last_check": last,
            "probe": pn or "—",
        })
    return {"checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "services": rows}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--fresh", action="store_true", help="ignore the cache and re-probe")
    ap.add_argument("--offline", action="store_true", help="never run a probe; cache only")
    ap.add_argument("--json", action="store_true", help="machine-readable, for the dashboard")
    args = ap.parse_args()

    data = build(args.fresh, args.offline)
    rows = data["services"]
    attention = [r for r in rows if r["status"] == "ATTENTION"]
    unknown = [r for r in rows if r["status"] == "UNKNOWN"]

    if args.json:
        print(json.dumps(data, indent=2))
        return 2 if attention else 0

    w = max(len(r["service"]) for r in rows)
    print(f"{'SERVICE'.ljust(w)}  {'STATUS'.ljust(9)}  {'LAST'.ljust(9)}  DETAIL")
    print("-" * (w + 62))
    for r in rows:
        print(f"{r['service'].ljust(w)}  {r['status'].ljust(9)}  {r['last_check'].ljust(9)}  "
              f"{r['usage'][:70]}")
    print()
    print(f"{len(rows)} services — {sum(1 for r in rows if r['status'] == 'GREEN')} green, "
          f"{len(attention)} need attention, {len(unknown)} unknown")
    if unknown:
        print()
        print("UNKNOWN is a gap, not a pass. No number is invented for these:")
        for r in unknown:
            print(f"  {r['service']}: {r['usage']}")
    return 2 if attention else 0


if __name__ == "__main__":
    sys.exit(main())
