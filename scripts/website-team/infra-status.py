#!/usr/bin/env python3
"""Infrastructure and free-tier watch: what the site depends on, and whether
any of it is about to cost money.

★ THIS SCRIPT NEVER ESTIMATES A METRIC AND PRESENTS IT AS FACT.
  Every field is either measured from a provider right now, read from a
  committed record, or printed as UNKNOWN with the reason it is unknown. A
  fabricated 'usage: 12%' is worse than UNKNOWN, because UNKNOWN prompts
  someone to go and look while a plausible number stops them. This is the one
  rule in here that is not a preference.

★ IT IS DETERMINISTIC. No LLM call, no model, no judgement. The Website
  Manager reads its output; it does not produce it. An agent that generates
  its own infrastructure metrics can report whatever keeps it out of trouble.

★ IT DOES NOT POLL ON EVERY INVOCATION. Results are cached (see TTLS), so
  running this ten times in an afternoon makes at most one request per
  provider per TTL window. Provider status pages are cheap but they are
  someone else's bandwidth, and the brief says not to poll unnecessarily.
  --fresh overrides the cache; --offline never makes a request at all.

Exit codes: 0 all clear (UNKNOWN included), 1 something is AMBER,
2 something is RED or BLOCKED. Non-zero is the signal for a human.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HOME = Path(os.path.expanduser("~"))

# Credentials live outside both repositories, in a file the launchd jobs can
# read and git cannot see. Nothing here ever prints a value from it.
def _load_env(path: Path) -> None:
    try:
        for line in path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            v = v.strip().strip('"').strip("'")
            if v and not os.environ.get(k.strip()):
                os.environ[k.strip()] = v
    except Exception:
        pass  # an unreadable credentials file leaves every probe UNKNOWN, which is correct


_load_env(Path(os.environ.get("WEBSITE_TEAM_ENV", HOME / ".swechha-ai" / "env")))
CACHE = Path(os.environ.get("WEBSITE_TEAM_INFRA_CACHE", HOME / ".swechha-ai" / "infra-cache.json"))
REPO = Path(os.environ.get("WEBSITE_TEAM_REPO", HOME / "swechha-website"))

# Seconds. Status pages change by the minute during an incident; plan terms and
# pricing change on the order of months, and re-reading them hourly would be
# pure noise against someone else's server.
TTLS = {"status": 1800, "quota": 900, "runs": 900}

UNMETERED = "not metered"
NA = "n/a"

# ── the inventory ────────────────────────────────────────────────────────────
# Every entry's `known` fields come from the provider's own published terms and
# are recorded in docs/website-team/infrastructure.md with the date they were
# read. Anything this script cannot measure says so, and says why, so the gap
# is visible rather than guessed at. Adding a service here without a `probe`
# is fine and honest: it shows up as UNKNOWN, which is the truth.
SERVICES: list[dict] = [
    {
        "name": "Vercel",
        "plan": "Hobby (unverified — no API token on this machine)",
        "limit": "100 deploys/day, 100GB bandwidth/mo on Hobby",
        "probe": "vercel_status",
        "usage_unknown": "needs VERCEL_TOKEN; none is set here",
        "cost_risk": "HIGH — hosting; overage or a forced Pro upgrade is the "
                     "single largest billing risk in the stack",
    },
    {
        "name": "Neon (Postgres)",
        "plan": "Free tier (unverified — no API key on this machine)",
        "limit": "0.5GB storage, 191.9 compute-hours/mo on Free",
        "probe": None,
        "usage_unknown": "needs NEON_API_KEY; none is set here",
        "cost_risk": "HIGH — storage and compute both meter, and the analytics "
                     "database grows on its own without anyone acting",
    },
    {
        "name": "GitHub — Actions",
        "plan": "public repository",
        "limit": UNMETERED,
        "probe": "gh_runs",
        # This is the fact that removes a whole category of worry, so it is
        # stated rather than monitored: Actions minutes are free and unmetered
        # for public repositories. swechha-website is public (verified
        # 2026-09-11 via `gh repo view --json visibility`). The 7 scheduled
        # workflows therefore cost nothing in minutes no matter how often they
        # run. IF THIS REPO IS EVER MADE PRIVATE, minutes start metering at
        # 2,000/month and this line becomes wrong.
        "cost_risk": "NONE while the repo is public — see the note in the source",
    },
    {
        "name": "GitHub — API",
        "plan": "authenticated",
        "limit": "5,000 requests/hour",
        "probe": "gh_rate",
        "cost_risk": "NONE — exhaustion throttles, it does not bill",
    },
    {
        "name": "GitHub — storage",
        "plan": "public repository",
        "limit": "soft 1GB recommended, 5GB warned",
        "probe": "repo_size",
        "cost_risk": "NONE directly; a large repo slows every clone and CI run",
    },
    {
        "name": "data.gov.in (CPCB air)",
        "plan": "free API key",
        "limit": "UNKNOWN — no published per-key quota",
        "probe": None,
        "usage_unknown": "the provider exposes no quota endpoint",
        "cost_risk": "NONE — no paid tier exists; the risk is withdrawal, not cost",
    },
    {
        "name": "WAQI / AQICN",
        "plan": "free token",
        "limit": "1,000 requests/day (published)",
        "probe": None,
        "usage_unknown": "no quota endpoint; would have to be counted locally",
        "cost_risk": "LOW — exceeding it throttles rather than bills",
    },
    {
        "name": "NASA FIRMS",
        "plan": "free MAP_KEY",
        "limit": "5,000 transactions/10 min (published)",
        "probe": None,
        "usage_unknown": "no quota endpoint",
        "cost_risk": "NONE — no paid tier",
    },
    {
        "name": "Resend (email)",
        "plan": "free",
        "limit": "100 emails/day, 3,000/mo (published)",
        "probe": None,
        "usage_unknown": "needs an API call with the key to read usage",
        "cost_risk": "LOW — the site sends on form submission only",
    },
    {
        "name": "Umami (analytics)",
        "plan": "self-hosted, first-party via /ledger",
        "limit": "bounded by its Neon database",
        "probe": None,
        "usage_unknown": "counts live in the Neon database; see Neon above",
        "cost_risk": "INDIRECT — it is the thing that grows Neon storage",
    },
    {
        "name": "cron-job.org (air heartbeat)",
        "plan": "free",
        "limit": "UNKNOWN — free plan terms not recorded",
        "probe": None,
        "usage_unknown": "no API token recorded for this account",
        "cost_risk": "LOW, but it holds a GitHub PAT — watch that token's expiry",
    },
    {
        "name": "DNS / domain (swechha.in)",
        "plan": "registered domain — annual renewal",
        "limit": NA,
        "probe": None,
        "usage_unknown": "registrar not recorded in this repository",
        "cost_risk": "RECURRING AND ALREADY PAID — an expiry takes the whole site "
                     "down and no amount of free-tier care prevents it",
    },
]


# ── cache ────────────────────────────────────────────────────────────────────
def load_cache() -> dict:
    try:
        return json.loads(CACHE.read_text())
    except Exception:
        return {}


def save_cache(c: dict) -> None:
    try:
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        CACHE.write_text(json.dumps(c, indent=2, sort_keys=True))
    except Exception:
        pass  # A cache that cannot be written must not break the report.


def cached(cache: dict, key: str, kind: str, fn, fresh: bool, offline: bool):
    """Return (value, age_seconds, source). source is 'live'|'cache'|'none'."""
    entry = cache.get(key)
    now = time.time()
    if entry and not fresh:
        age = now - entry.get("at", 0)
        if age < TTLS.get(kind, 900):
            return entry.get("value"), age, "cache"
    if offline:
        if entry:
            return entry.get("value"), now - entry.get("at", 0), "cache"
        return None, None, "none"
    try:
        value = fn()
    except Exception as e:
        # A provider we cannot reach is UNKNOWN, never "fine".
        return {"error": f"{type(e).__name__}: {e}"[:120]}, 0, "live"
    cache[key] = {"at": now, "value": value}
    return value, 0, "live"


# ── probes ───────────────────────────────────────────────────────────────────
def _get_json(url: str, timeout: int = 8) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "swechha-website-team/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def probe_statuspage(url: str):
    d = _get_json(url)
    return {"indicator": d["status"]["indicator"], "description": d["status"]["description"]}


def probe_vercel_status():
    return probe_statuspage("https://www.vercel-status.com/api/v2/status.json")


def probe_gh_rate():
    out = subprocess.run(
        ["gh", "api", "/rate_limit"], capture_output=True, text=True, timeout=20, check=True
    )
    core = json.loads(out.stdout)["resources"]["core"]
    return {"remaining": core["remaining"], "limit": core["limit"]}


def probe_gh_runs():
    out = subprocess.run(
        ["gh", "run", "list", "--limit", "30", "--json", "conclusion,name"],
        capture_output=True, text=True, timeout=30, check=True, cwd=str(REPO),
    )
    runs = json.loads(out.stdout)
    failed = [r["name"] for r in runs if r.get("conclusion") == "failure"]
    return {"checked": len(runs), "failed": len(failed), "names": sorted(set(failed))[:5]}


def probe_repo_size():
    out = subprocess.run(
        ["gh", "repo", "view", "--json", "diskUsage"],
        capture_output=True, text=True, timeout=20, check=True, cwd=str(REPO),
    )
    return {"kb": json.loads(out.stdout)["diskUsage"]}


PROBES = {
    "vercel_status": probe_vercel_status,
    "gh_rate": probe_gh_rate,
    "gh_runs": probe_gh_runs,
    "repo_size": probe_repo_size,
}


# ── grading ──────────────────────────────────────────────────────────────────
# Thresholds are derived from the provider's published limit, never invented.
# A service with no measurable usage is UNKNOWN, which is not a pass and not a
# failure -- it is a gap, and it is reported as one.
def grade(svc: dict, value) -> tuple[str, str, str]:
    """-> (status, usage, headroom)"""
    if value is None:
        return "UNKNOWN", "UNKNOWN", "UNKNOWN"
    if isinstance(value, dict) and "error" in value:
        return "UNKNOWN", f"unreachable ({value['error'][:40]})", "UNKNOWN"

    p = svc.get("probe")
    if p in ("vercel_status",):
        ind = value.get("indicator", "unknown")
        status = {"none": "GREEN", "minor": "AMBER", "major": "RED", "critical": "BLOCKED"}.get(ind, "UNKNOWN")
        return status, value.get("description", "UNKNOWN"), NA
    if p == "gh_rate":
        rem, lim = value["remaining"], value["limit"]
        pct = 100 * rem / lim if lim else 0
        status = "GREEN" if pct > 25 else "AMBER" if pct > 10 else "RED"
        return status, f"{lim - rem}/{lim} used", f"{rem} left this hour"
    if p == "gh_runs":
        f, c = value["failed"], value["checked"]
        # Scheduled publishers failing is an operational signal, not a cost one.
        status = "GREEN" if f == 0 else "AMBER" if f <= 3 else "RED"
        names = (": " + ", ".join(value["names"])) if value["names"] else ""
        return status, f"{f} failed of last {c}{names}", NA
    if p == "repo_size":
        mb = value["kb"] / 1024
        status = "GREEN" if mb < 1024 else "AMBER" if mb < 5120 else "RED"
        return status, f"{mb:.0f}MB", f"{max(0, 1024 - mb):.0f}MB to the 1GB guide"
    return "UNKNOWN", "UNKNOWN", "UNKNOWN"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--fresh", action="store_true", help="ignore the cache and re-probe")
    ap.add_argument("--offline", action="store_true", help="never make a request; cache only")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()

    cache = load_cache()
    rows = []
    worst = 0
    for svc in SERVICES:
        p = svc.get("probe")
        if p:
            value, age, source = cached(cache, p, "status" if "status" in p else "quota",
                                        PROBES[p], args.fresh, args.offline)
        else:
            value, age, source = None, None, "none"
        status, usage, headroom = grade(svc, value)
        if status == "UNKNOWN" and not p:
            usage = "UNKNOWN — " + svc.get("usage_unknown", "no probe available")
        last = "never" if source == "none" else ("just now" if age is not None and age < 60
                                                 else f"{int((age or 0) / 60)}m ago")
        worst = max(worst, {"BLOCKED": 2, "RED": 2, "AMBER": 1}.get(status, 0))
        rows.append({
            "service": svc["name"], "status": status, "plan": svc["plan"],
            "usage": usage, "limit": svc["limit"], "headroom": headroom,
            "cost_risk": svc["cost_risk"], "last_check": last,
        })
    save_cache(cache)

    if args.json:
        print(json.dumps({"checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "services": rows}, indent=2))
        return worst

    w = max(len(r["service"]) for r in rows)
    print(f"{'SERVICE'.ljust(w)}  {'STATUS'.ljust(8)}  {'LAST'.ljust(9)}  USAGE / LIMIT")
    print("-" * (w + 60))
    for r in rows:
        print(f"{r['service'].ljust(w)}  {r['status'].ljust(8)}  {r['last_check'].ljust(9)}  "
              f"{r['usage']}  [limit: {r['limit']}]")
    unknown = [r["service"] for r in rows if r["status"] == "UNKNOWN"]
    print()
    print(f"{len(rows)} services — "
          f"{sum(1 for r in rows if r['status'] == 'GREEN')} green, "
          f"{sum(1 for r in rows if r['status'] == 'AMBER')} amber, "
          f"{sum(1 for r in rows if r['status'] in ('RED', 'BLOCKED'))} red, "
          f"{len(unknown)} unknown")
    if unknown:
        print()
        print("UNKNOWN is a gap, not a pass. These cannot be measured from this")
        print("machine, and no number should be invented for them:")
        for r in rows:
            if r["status"] == "UNKNOWN":
                print(f"  {r['service']}: {r['usage']}")
    return worst


if __name__ == "__main__":
    sys.exit(main())
