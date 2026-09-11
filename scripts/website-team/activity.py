#!/usr/bin/env python3
"""Read the department's activity log. The dashboard's ancestor.

This exists now, as 80 lines of terminal output, because the dashboard is last
in the migration plan and a department you cannot see is a department you cannot
trust. When the visual version arrives it reads the same JSONL; nothing here is
throwaway.

Usage: activity.py [--days N] [--department NAME]
"""
import json
import os
import sys
import time
from collections import defaultdict

LOG = os.path.join(os.environ.get("SWECHHA_AI_HOME", os.path.expanduser("~/.swechha-ai")),
                   "activity.jsonl")
days = 7
dept_filter = None
args = sys.argv[1:]
while args:
    a = args.pop(0)
    if a == "--days":
        days = int(args.pop(0))
    elif a == "--department":
        dept_filter = args.pop(0)

if not os.path.exists(LOG):
    sys.exit(f"no activity log at {LOG} — nothing has run yet")

cutoff = time.time() - days * 86400
events = []
for line in open(LOG, encoding="utf8"):
    try:
        e = json.loads(line)
    except ValueError:
        continue
    if e.get("epoch", 0) < cutoff:
        continue
    if dept_filter and e.get("department") != dept_filter:
        continue
    events.append(e)

if not events:
    sys.exit(f"no events in the last {days} day(s)")

by_dept = defaultdict(list)
for e in events:
    by_dept[e.get("department", "?")].append(e)

print(f"\nSWECHHA AI ORGANISATION — last {days} day(s)\n")
grand_cost = 0.0
for dept, evs in sorted(by_dept.items()):
    runs = [e for e in evs if e["event"] == "run_started"]
    done = [e for e in evs if e["event"] == "run_finished"]
    tasks = [e for e in evs if e["event"] == "task_started"]
    prs = [e for e in evs if e["event"] == "pr_opened"]
    refused = [e for e in evs if e["event"] == "task_refused"]
    gates = [e for e in evs if e["event"] == "gate_result"]
    failed_gates = [e for e in gates if e.get("result") == "fail"]
    cost = sum(float(e.get("cost_usd") or 0) for e in evs)
    grand_cost += cost

    running = len(runs) - len(done)
    state = "WORKING" if running > 0 else "IDLE"
    print(f"  {dept.upper()} DEPARTMENT — {state}")
    print(f"    runs      {len(done)} finished" + (f", {running} in flight" if running > 0 else ""))
    print(f"    tasks     {len(tasks)} dispatched, {len(prs)} PR(s), {len(refused)} refused")
    if gates:
        print(f"    gates     {len(gates) - len(failed_gates)}/{len(gates)} passed")
    print(f"    cost      ${cost:.2f} notional (client-side estimate, not a bill)")

    actors = defaultdict(int)
    for e in evs:
        actors[e.get("actor", "?")] += 1
    print("    agents    " + ", ".join(f"{a} ({n})" for a, n in sorted(actors.items())))

    print("\n    recent:")
    for e in evs[-8:]:
        extra = " ".join(f"{k}={v}" for k, v in e.items()
                         if k not in ("ts", "epoch", "department", "actor", "event", "pid"))
        if len(extra) > 72:
            extra = extra[:69] + "..."
        print(f"      {e['ts'][5:16].replace('T',' ')}  {e['actor']:<12} {e['event']:<18} {extra}")
    print()

print(f"  TOTAL notional cost across departments: ${grand_cost:.2f}")
print("  (Runs use the Claude subscription, so the actual bill is zero. This figure")
print("   is a workload gauge and an early warning if a run starts reading too much.)\n")
