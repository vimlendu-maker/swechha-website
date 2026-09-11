#!/usr/bin/env python3
"""What the department has spent today, from the activity log.

    budget.py [--log <activity.jsonl>]   -> today's total on stdout, e.g. 1.61

★ MEASURED OR NOTHING. The organisation's cost rule is "measured or UNKNOWN,
  never estimated", so this sums `cost_usd` fields that runners actually emitted
  and invents no figure for a run that reported none. The number is Claude
  Code's own client-side estimate and can differ from the real bill -- which is
  why the ceiling it feeds is a brake, not an accounting record.

★ WHY A CEILING AT ALL. Self-repair adds runs. The sentinel wakes the department
  whenever the problem set CHANGES, and a flapping probe changes it every time it
  flaps: a service going up and down through the night is the shape that turns
  ~$1 a run into a bill nobody chose. Measured 2026-09-11: $0.80 observing,
  $4.67 delegating. Three delegating runs is a normal busy day; ten is a loop.

★ A MISSING LOG IS ZERO, NOT A REFUSAL. A fresh install has no activity.jsonl
  and must still be able to run. An unparseable LINE is skipped, not fatal --
  the log is append-only from several processes and a torn write must not stop
  the department. What is never done is treating an unreadable log as licence:
  lines that parse are counted, and the caller is told how many did not.
"""
import argparse
import json
import os
import sys
from datetime import date


def spent_today(path, today=None):
    """(total, counted, unparsable). Local dates, because the ceiling is a day
    in the owner's life, not a UTC window -- the farm app paid for that lesson
    in a timezone five and a half hours from UTC."""
    today = today or date.today().isoformat()
    total, counted, bad = 0.0, 0, 0
    if not os.path.exists(path):
        return 0.0, 0, 0
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except ValueError:
                bad += 1
                continue
            if not str(row.get("ts", "")).startswith(today):
                continue
            raw = row.get("cost_usd")
            if raw in (None, "", "?"):
                continue
            try:
                total += float(raw)
                counted += 1
            except (TypeError, ValueError):
                bad += 1
    return round(total, 4), counted, bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--log", default=os.environ.get(
        "SWECHHA_ACTIVITY_LOG", os.path.expanduser("~/.swechha-ai/activity.jsonl")))
    ap.add_argument("--verbose", action="store_true")
    a = ap.parse_args()
    total, counted, bad = spent_today(a.log)
    if a.verbose:
        print(f"{total} from {counted} run(s); {bad} unparsable line(s)", file=sys.stderr)
    print(total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
