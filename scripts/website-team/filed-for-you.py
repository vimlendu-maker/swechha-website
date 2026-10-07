#!/usr/bin/env python3
"""The tasks a PERSON filed in the task store for this department, as runner input.

    filed-for-you.py <department> [--urgent] [--json] [--limit N]

★ WHY THIS EXISTS (audit S1; ADR-0014's premise was false for this runner). The
  runner read two inbox FILES as work and showed open spine tasks only as
  "ALREADY OPEN, do not duplicate" (open-tasks.py). A task a person filed through
  the CLI, the MCP server or the Command Centre (origin `human`) was therefore
  never worked: website-20261006-0005 sat unpicked for a day. `org task pickup`
  is the read-only selection; this is the runner's thin wrapper around it, so
  run.sh can put the result in the prompt and on-change.sh can wake on it.

★ IT NEVER RAISES AND NEVER EXITS NON-ZERO. A runner must not die over this.

★ ABSENT IS NOT EMPTY. A missing CLI, an `org` too old to know `task pickup`, a
  hang past the timeout, or output without the expected marker prints
  `FILED FOR YOU: UNKNOWN — …` (`{"ok": false, "tasks": []}` for --json). Never
  nothing: an empty answer reads as "nothing is filed", which is the very failure
  this exists to close.

★ OPT-IN PER DEPARTMENT. snapshot-run.sh runs ONE runner for website, fundraising
  and communications. TEAM_PICKUP is a comma-separated list of department ids,
  default `website`. A department not listed gets NO OUTPUT AT ALL, so its prompt
  and its wake decision are byte-for-byte what they were. A department adopts by
  being added to the default below or by setting TEAM_PICKUP in its plist.
  An EMPTY TEAM_PICKUP falls back to the default (`website`); to opt a department
  out entirely set a dummy value such as `none`.

  FILED_FOR_YOU_TIMEOUT (seconds, default 20) exists so a test can exercise the
  hang path without waiting 20 s.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

DEFAULT_OPT_IN = "website"


def opted_in(department: str) -> bool:
    raw = os.environ.get("TEAM_PICKUP")
    listed = raw if raw is not None and raw.strip() else DEFAULT_OPT_IN
    return department in {d.strip() for d in listed.split(",") if d.strip()}


def _timeout() -> float:
    try:
        return max(0.1, float(os.environ.get("FILED_FOR_YOU_TIMEOUT", "20")))
    except ValueError:
        return 20.0


def read(department: str, extra: list[str], as_json: bool) -> str:
    """The CLI's output if it is trustworthy; raises ValueError(reason) if not."""
    org = os.environ.get("ORG_CLI") or os.path.expanduser("~/.swechha-ai/org")
    if not os.access(org, os.X_OK):
        raise ValueError("the task spine is not installed here")
    try:
        out = subprocess.run([org, "task", "pickup", department] + extra,
                             capture_output=True, text=True, timeout=_timeout())
    except subprocess.TimeoutExpired:
        raise ValueError("the pickup read timed out")
    except Exception as exc:  # noqa: BLE001
        raise ValueError("could not run the pickup read (%s)" % exc)
    text = (out.stdout or "").strip()
    if out.returncode != 0:
        raise ValueError("`org task pickup` is unavailable or failed (exit %s) — "
                         "an older org without the subcommand" % out.returncode)
    if as_json:
        try:
            data = json.loads(text)
        except ValueError:
            raise ValueError("the pickup read did not return JSON")
        if (not isinstance(data, dict) or "ok" not in data
                or not isinstance(data.get("tasks"), list)):
            raise ValueError("the pickup read returned an unexpected shape")
        return text
    if not text.startswith("FILED FOR YOU"):
        raise ValueError("the pickup read returned output without the expected marker")
    return text


def main() -> int:
    argv = sys.argv[1:]
    if not argv:
        return 0
    department = argv[0]
    as_json = "--json" in argv
    if not opted_in(department):
        return 0
    extra = []
    if "--urgent" in argv:
        extra.append("--urgent")
    if as_json:
        extra.append("--json")
    if "--limit" in argv:
        try:
            extra += ["--limit", str(max(1, int(argv[argv.index("--limit") + 1])))]
        except (IndexError, ValueError):
            pass
    try:
        print(read(department, extra, as_json))
    except Exception as exc:  # noqa: BLE001 — never break a run over this
        if as_json:
            print(json.dumps({"department": department, "ok": False, "tasks": [],
                              "reason": str(exc)}))
        else:
            print("FILED FOR YOU: UNKNOWN — %s. Treat that as 'there may be filed "
                  "tasks', never as 'there are none'." % exc)
    return 0


if __name__ == "__main__":
    sys.exit(main())
