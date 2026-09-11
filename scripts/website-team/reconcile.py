#!/usr/bin/env python3
"""Turn a repeated refusal into a grant, or into something a person must read.

    reconcile.py --log <activity.jsonl> --ledger <tool-grants.json> [--apply]

Without `--apply` it reports and changes nothing.

★ THIS IS THE SELF-LEARNING PART, AND IT HAS NO MODEL IN IT.
  The department writes lessons in prose. Prose is advice the next run can skim
  past — on 2026-09-11 it learned that `gh run view` was denied, wrote that
  lesson correctly, and would have started the next run without it. A department
  that pays a dollar a run to relearn yesterday is not learning.

  So learning happens on TELEMETRY, not on essays. run.sh emits `run_blocked`
  naming the verbs the permission layer refused. Two refusals of the same verb
  in two DIFFERENT runs is not bad luck; it is a standing gap.

★ THE RATCHET: IT MAY TIGHTEN, NEVER LOOSEN.
  A verb that tool-grants.py can prove read-only is appended automatically. Any
  other refusal is REPORTED for a human and never applied, however often it
  recurs. So the mechanism can widen what the department SEES and can never
  widen what it can DO. Deciding which is which belongs to tool-grants.py, in
  the GATED machinery this cannot edit.

★ TWO RUNS, NOT TWO REFUSALS. A single confused run can refuse the same command
  eight times — that is what happened on 2026-09-11 — and none of it is
  evidence that the grant is missing rather than that the run was lost. Distinct
  runs are the unit, keyed by the event's own pid-and-timestamp.
"""
import argparse
import json
import os
import sys
from collections import defaultdict


def blocked_verbs(log_path):
    """{verb: {run_key, ...}} from `run_blocked` events."""
    out = defaultdict(set)
    if not os.path.exists(log_path):
        return out
    with open(log_path, "r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except ValueError:
                continue
            if row.get("event") != "run_blocked":
                continue
            run_key = f"{row.get('ts', '')}/{row.get('pid', '')}"
            for verb in str(row.get("refused", "")).split(";"):
                verb = " ".join(verb.split())
                if verb:
                    out[verb].add(run_key)
    return out


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, here)
    from importlib import machinery, util
    spec = util.spec_from_loader(
        "toolgrants", machinery.SourceFileLoader("toolgrants", os.path.join(here, "tool-grants.py")))
    tg = util.module_from_spec(spec)
    spec.loader.exec_module(tg)

    ap = argparse.ArgumentParser()
    ap.add_argument("--log", default=os.path.expanduser("~/.swechha-ai/activity.jsonl"))
    ap.add_argument("--ledger", required=True)
    ap.add_argument("--threshold", type=int, default=2)
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()

    counts = blocked_verbs(a.log)
    try:
        with open(a.ledger, "r", encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError):
        print("reconcile: no readable ledger — nothing to do", file=sys.stderr)
        return 0
    have = set(data.get("grants") or [])

    grant, report = [], []
    for verb, runs in sorted(counts.items()):
        if len(runs) < a.threshold or verb in have:
            continue
        (grant if tg.permitted(verb) else report).append((verb, len(runs)))

    for verb, n in report:
        print(f"reconcile: NEEDS A HUMAN — {verb!r} refused in {n} runs; not provably read-only")
    for verb, n in grant:
        print(f"reconcile: {'granting' if a.apply else 'would grant'} {verb!r} — refused in {n} runs")

    if a.apply and grant:
        data["grants"] = sorted(have | {v for v, _ in grant})
        with open(a.ledger, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, ensure_ascii=False)
            fh.write("\n")
    if not grant and not report:
        print("reconcile: nothing has been refused twice")
    return 0


if __name__ == "__main__":
    sys.exit(main())
