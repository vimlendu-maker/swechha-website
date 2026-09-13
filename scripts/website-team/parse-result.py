#!/usr/bin/env python3
"""Extract the result text and cost estimate from `claude -p --output-format json`.

`--output-format json` has been observed emitting more than one JSON document on
stdout — a warning object ahead of the result. `json.load` fails on that with
"Extra data". So scan for every complete JSON object and take the last one that
carries a "result" key, rather than assuming the stream is a single document.

Prints the cost estimate on the first line, then the result text.

With `--metrics` it prints ONE line of `key=value` pairs instead, ready to
interpolate straight into a `log-event.py` call.

★ WHY --metrics EXISTS. The manager's cost per run went $1.21 -> $4.94 between
  2026-09-11 and 2026-09-12 and nothing in the estate could say why: the
  activity log records `cost_usd` and nothing else. input_tokens, output_tokens
  and latency appear ZERO times in 1,034 events.

  They were never missing. `claude -p --output-format json` returns `usage` with
  input_tokens, output_tokens, cache_read_input_tokens and
  cache_creation_input_tokens, plus duration_ms, duration_api_ms, num_turns and
  a per-model modelUsage breakdown. THIS FILE READ total_cost_usd AND DROPPED
  EVERY ONE OF THEM.

  Which is exactly I.5 in the Paperclip evaluation -- a number computed and
  discarded at the transport boundary, leaving the one fact that would settle
  the question unavailable through the API that exists. Same defect, our own
  code, found the same week.

★ THE DEFAULT OUTPUT DOES NOT MOVE. run.sh reads line 1 as the cost and lines
  2+ as the text, and it swallows parse failures -- so a metrics mode that
  shifted either would break the runner silently. --metrics is a separate mode,
  not an addition to the existing one.

★ A FIELD THAT WAS NOT SUPPLIED IS OMITTED, NEVER ZEROED. `input_tokens=0` is a
  measurement; a missing field is an absence. The estate's rule is measured or
  UNKNOWN, never estimated, and a fabricated zero would be averaged into a
  per-run figure by something downstream.

NOT NUL-separated: bash command substitution strips NUL bytes, so a NUL
separator can never survive `$(...)` — the first version of this used one and
failed with "bad substitution". Line-based survives.
"""
import json
import sys

METRICS = "--metrics" in sys.argv[1:]

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

if not METRICS:
    print(best.get("total_cost_usd", "?"))
    sys.stdout.write(best.get("result", ""))
    sys.exit(0)

# ── metrics ─────────────────────────────────────────────────────────────────
usage = best.get("usage") or {}
pairs = []


def put(key, value):
    """Omit rather than zero. See the note above."""
    if value is None:
        return
    text = str(value)
    if text == "" or " " in text:      # a space would split into a second pair
        return
    pairs.append("%s=%s" % (key, text))


put("input_tokens", usage.get("input_tokens"))
put("output_tokens", usage.get("output_tokens"))
put("cache_read_tokens", usage.get("cache_read_input_tokens"))
put("cache_creation_tokens", usage.get("cache_creation_input_tokens"))
put("duration_ms", best.get("duration_ms"))
put("duration_api_ms", best.get("duration_api_ms"))
put("num_turns", best.get("num_turns"))

# The model that did most of the work, when several are reported. modelUsage is
# keyed by model id; picking the largest output rather than the first key means
# a cheap summarisation pass cannot mislabel the run.
model_usage = best.get("modelUsage") or {}
if isinstance(model_usage, dict) and model_usage:
    def _out(entry):
        return (entry or {}).get("outputTokens") or 0
    put("model", max(model_usage, key=lambda k: _out(model_usage.get(k))))

# ★ ADR-0012 MAKES THESE TWO MANDATORY, and they are constants HERE rather than
#   guesses: everything this file parses came from `claude -p` on the owner's
#   subscription, in the agentic lane. `cost_basis` exists so that
#   subscription-equivalent figures and money actually spent can never be summed
#   into one number by a dashboard.
put("cost_basis", "subscription")
put("lane", "agentic")

print(" ".join(pairs))
