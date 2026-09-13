#!/usr/bin/env python3
"""Why did the model call fail? Read stderr, name the cause, never guess.

    model-failure.py <exit-code> < stderr   ->  one line of key=value

★ WHY THIS EXISTS. On 2026-09-13 two manager runs died leaving only
  `run_started` in the log -- 17:16 and 19:18, each followed one second later by
  `session_started` and then nothing at all. The reason is unknowable after the
  fact, because run.sh called:

      RESULT="$(claude -p ... 2>/dev/null)"

  under `set -euo pipefail`. stderr to /dev/null and no `|| true`, so a non-zero
  exit killed the runner AT THAT LINE with the explanation already discarded.

★ AND ON A SUBSCRIPTION THIS IS THE FAILURE THAT MATTERS. The estate carries no
  per-token cost -- measured 2026-09-13, 94.8M of its 94.8M input tokens are
  cache reads on the owner's subscription -- so the finite resource is not money
  but the subscription's own usage window. It has never been exhausted (zero
  rate-limit events in three days, including the $109-equivalent one). If it
  ever is, the department goes quiet mid-incident and nothing says why:
  `api-health.sh` watches GitHub's rate limit, and nothing anywhere watches
  Anthropic's.

★ A WRONG CLASSIFICATION IS WORSE THAN NONE, because it sends somebody to the
  wrong remedy. Anything unrecognised is `unknown`, and `unknown` carries the
  stderr so a human can read what the matcher could not.
"""
import re
import sys

CLASSES = (
    # A usage limit is a WALL until the window resets. A rate limit is
    # transient. ADR-0010's retry table splits exactly here, so this must too --
    # and usage is tested first because its message often contains "limit" too.
    ("usage_limit", r"usage limit|limit will reset|out of (?:credits|usage)|upgrade to continue"),
    ("rate_limit",  r"rate.?limit|\b429\b|too many requests|overloaded"),
    ("auth",        r"invalid api key|unauthor|authentication|/login|not logged in|401|403"),
    ("network",     r"econnrefused|enotfound|etimedout|fetch failed|network|dns|socket hang up"),
)


def classify(text):
    low = text.lower()
    for name, pattern in CLASSES:
        if re.search(pattern, low):
            return name
    return "unknown"


def main():
    code = sys.argv[1] if len(sys.argv) > 1 else "?"
    raw = sys.stdin.read()
    text = raw.strip()

    pairs = ["reason=%s" % classify(text), "exit_code=%s" % re.sub(r"[^0-9?]", "", code) or "?"]

    if not text:
        # An empty stderr is itself the finding: the process died without saying
        # anything, which points at a signal rather than a refusal.
        pairs.append("stderr=empty")
    else:
        # One line, no spaces: this is interpolated unquoted into a log-event.py
        # call, where a space would split into a second key=value pair and a
        # newline would corrupt the record.
        first = text.splitlines()[0][:120]
        pairs.append("detail=" + re.sub(r"[^A-Za-z0-9._:/-]+", "_", first).strip("_"))

    print(" ".join(pairs))


if __name__ == "__main__":
    main()
