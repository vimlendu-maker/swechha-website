#!/usr/bin/env python3
"""Extract the result text and cost estimate from `claude -p --output-format json`.

`--output-format json` has been observed emitting more than one JSON document on
stdout — a warning object ahead of the result. `json.load` fails on that with
"Extra data". So scan for every complete JSON object and take the last one that
carries a "result" key, rather than assuming the stream is a single document.

Prints the cost estimate on the first line, then the result text.

NOT NUL-separated: bash command substitution strips NUL bytes, so a NUL
separator can never survive `$(...)` — the first version of this used one and
failed with "bad substitution". Line-based survives.
"""
import json
import sys

raw = sys.stdin.read()
decoder = json.JSONDecoder()
best = None
i = 0
while i < len(raw):
    while i < len(raw) and raw[i] not in "{[":
        i += 1
    if i >= len(raw):
        break
    try:
        obj, end = decoder.raw_decode(raw, i)
    except ValueError:
        i += 1
        continue
    if isinstance(obj, dict) and "result" in obj:
        best = obj
    i = end

if best is None:
    sys.exit("website-team: no parsable result in Claude output")

print(best.get("total_cost_usd", "?"))
sys.stdout.write(best.get("result", ""))
