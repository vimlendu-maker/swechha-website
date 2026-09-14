#!/usr/bin/env python3
"""The department's already-open tasks, as a short block for the manager's prompt.

    open-tasks.py <department> [--limit N]

★ WHY THIS EXISTS. The manager re-derives its work from the site on every run
  and has never been shown what it already filed. So it observed the same
  unstyled CSS four mornings running and wrote four differently-worded briefs
  for it, which became four tasks for ONE bug -- four of the six `fix(teach)`
  items that sat in `org status` NEEDS YOU until a human read them side by side
  on 2026-09-14 and found every one obsolete.

★ WHY NOT DEDUPE IN THE SPINE INSTEAD. Because it cannot, and that is settled:
  run.sh's own note says a near-match rule "would eventually fold 'section 3'
  into 'section 4'", so the spine folds a repeat only when a CALLER declares the
  two filings are one condition with --key. A brief has no key, because only the
  manager knows whether today's observation is yesterday's task. This gives the
  one actor that can tell the information it needs to tell.

★ IT PROPOSES, IT NEVER CLOSES. Nothing here writes a task, and the manager is
  read-only by design. A task it believes is fixed is REPORTED for a human. An
  agent that could close the record of its own unfinished work has no record.

★ ABSENT IS NOT EMPTY. If the spine cannot be reached this prints a line saying
  so rather than nothing, because a silent empty list reads as "nothing is open"
  and would license exactly the duplicate filing this exists to prevent.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys


def main() -> int:
    argv = sys.argv[1:]
    if not argv:
        print("usage: open-tasks.py <department> [--limit N]", file=sys.stderr)
        return 2
    department = argv[0]
    limit = 20
    if "--limit" in argv:
        try:
            limit = max(1, int(argv[argv.index("--limit") + 1]))
        except (IndexError, ValueError):
            pass

    org = os.environ.get("ORG_CLI") or os.path.expanduser("~/.swechha-ai/org")
    if not os.access(org, os.X_OK):
        print("ALREADY OPEN: UNKNOWN — the task spine is not installed here, so "
              "this run cannot tell what is already filed.")
        return 0
    try:
        out = subprocess.run([org, "task", "list", "--dept", department, "--json"],
                             capture_output=True, text=True, timeout=20)
        data = json.loads(out.stdout or "[]")
    except Exception as exc:  # noqa: BLE001 — never break a run over telemetry
        print("ALREADY OPEN: UNKNOWN — could not read the task list (%s). Treat "
              "this as 'there may be open tasks', not as 'there are none'." % exc)
        return 0

    tasks = data if isinstance(data, list) else data.get("tasks", [])
    tasks = [t for t in tasks if not t.get("_terminal")]
    if not tasks:
        print("ALREADY OPEN: nothing. Every brief you write is new work.")
        return 0

    # Oldest first: the ones most likely to be stale, and most likely to be the
    # thing you are about to describe again.
    tasks.sort(key=lambda t: t.get("created") or "")
    shown, hidden = tasks[:limit], max(0, len(tasks) - limit)
    lines = ["ALREADY OPEN in this department — %d task(s). DO NOT file a brief "
             "for anything already here:" % len(tasks)]
    for t in shown:
        age = t.get("_age_days")
        age_s = "%sd old" % age if isinstance(age, (int, float)) else "age UNKNOWN"
        flag = " NEEDS A HUMAN" if t.get("_needs_human") else ""
        lines.append("  - [%s] %s (%s%s)" % (t.get("id", "?"),
                                             (t.get("title") or "").strip()[:110],
                                             age_s, flag))
    if hidden:
        lines.append("  ... and %d more not shown." % hidden)
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
