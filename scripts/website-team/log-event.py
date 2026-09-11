#!/usr/bin/env python3
"""Append one event to the department's activity log.

★ THE AGENTS DO NOT CALL THIS. The runner and the executor do.

That is the whole design constraint: an observability layer an agent can write
is an observability layer an agent can lie to. Every event here is emitted by
shell around the agent — before it starts, after it returns, on each gate
result — so the log records what the system observed, not what the agent said
about itself. An agent cannot mark itself green.

The log is JSONL at ~/.swechha-ai/activity.jsonl. Deliberately outside both
repositories: it is neither knowledge (the vault) nor code (git), it is
high-churn telemetry, and committing it would bury real history under machine
noise. Decision records still go to the vault; this is the stream beneath them.

Usage: log-event.py <department> <actor> <event> [key=value ...]
"""
import json
import os
import sys
import time

HOME = os.path.expanduser("~")
LOG_DIR = os.environ.get("SWECHHA_AI_HOME", os.path.join(HOME, ".swechha-ai"))
LOG = os.path.join(LOG_DIR, "activity.jsonl")

if len(sys.argv) < 4:
    sys.exit("usage: log-event.py <department> <actor> <event> [key=value ...]")

dept, actor, event = sys.argv[1], sys.argv[2], sys.argv[3]
rec = {
    "ts": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    "epoch": int(time.time()),
    "department": dept,
    "actor": actor,
    "event": event,
    "pid": os.getpid(),
}
for arg in sys.argv[4:]:
    if "=" in arg:
        k, v = arg.split("=", 1)
        # Keep numbers numeric so a dashboard can sum costs without parsing.
        try:
            rec[k] = int(v)
        except ValueError:
            try:
                rec[k] = float(v)
            except ValueError:
                rec[k] = v

os.makedirs(LOG_DIR, exist_ok=True)
with open(LOG, "a", encoding="utf8") as f:
    f.write(json.dumps(rec, ensure_ascii=False) + "\n")
