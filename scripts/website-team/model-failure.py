#!/usr/bin/env python3
"""Why did the model call fail? Read stderr AND stdout, name the cause, never guess.

    model-failure.py <exit-code> [--stdout FILE] < stderr   ->  one line of key=value
    model-failure.py --is-error < stdout                    ->  1 or 0

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

★ THE ERROR IS ON STDOUT, AND FOR SEVEN DAYS THIS READ ONLY STDERR. From
  2026-09-22 every run failed with `{"is_error": true, "result": "Failed to
  authenticate: OAuth session expired..."}` on stdout and nothing on stderr, and
  this file dutifully reported `reason=unknown stderr=empty`. --stdout FILE
  hands it the reply; an `is_error` result is read first. The auth reasons are
  org-claude's own vocabulary (org-spine org/claude_auth.py), so a refusal and a
  failure name one condition with one word.
"""
import json
import re
import sys

CLASSES = (
    # A usage limit is a WALL until the window resets. A rate limit is
    # transient. ADR-0010's retry table splits exactly here, so this must too --
    # and usage is tested first because its message often contains "limit" too.
    ("usage_limit", r"usage limit|limit will reset|out of (?:credits|usage)|upgrade to continue"),
    ("rate_limit",  r"rate.?limit|\b429\b|too many requests|overloaded"),
    # Expired before missing: the 09-22 text is "Failed to authenticate: OAuth
    # session expired", and the remedy for each differs.
    ("auth-expired", r"oauth[^\n]*(?:expired|refresh)|(?:session|token)[^\n]*expired|invalid api key|invalid bearer|\b401\b"),
    ("auth-missing", r"not logged in|please run /login|failed to authenticate|/login"),
    ("auth",        r"unauthor|authentication|\b403\b"),
    ("network",     r"econnrefused|enotfound|etimedout|fetch failed|network|dns|socket hang up"),
)


def classify(text):
    low = text.lower()
    for name, pattern in CLASSES:
        if re.search(pattern, low):
            return name
    return "unknown"


def result_object(raw):
    """The CLI's result object from stdout, or None. It can print a warning
    object first, so a whole-document parse is tried and then line by line."""
    docs = []
    try:
        docs = [json.loads(raw)]
    except ValueError:
        for line in raw.splitlines():
            try:
                docs.append(json.loads(line))
            except ValueError:
                continue
    found = None
    for d in docs:
        if isinstance(d, dict) and ("is_error" in d or d.get("type") == "result"):
            found = d
    return found


def from_stdout(raw):
    """(text, is_error) -- what stdout says went wrong, if it says anything.

    A reply that is NOT an error contributes nothing: model output can contain
    "401" or "rate limit" in prose, and classifying that would be a guess."""
    raw = (raw or "").strip()
    if not raw:
        return "", False
    obj = result_object(raw)
    if obj is None:
        return raw[:2000], False      # not JSON at all: plain text is evidence
    if obj.get("is_error"):
        return str(obj.get("result") or obj.get("subtype") or "is_error"), True
    return "", False


def main():
    args = sys.argv[1:]
    if args[:1] == ["--is-error"]:
        print(1 if from_stdout(sys.stdin.read())[1] else 0)
        return
    out_text = ""
    if "--stdout" in args:
        i = args.index("--stdout")
        try:
            with open(args[i + 1], encoding="utf8", errors="replace") as f:
                out_text, _ = from_stdout(f.read())
        except (IndexError, OSError):
            pass
        del args[i:i + 2]
    code = args[0] if args else "?"
    raw = sys.stdin.read()
    text = raw.strip()

    pairs = ["reason=%s" % classify(out_text + "\n" + text),
             "exit_code=%s" % (re.sub(r"[^0-9?]", "", code) or "?")]
    if out_text:
        pairs.append("source=stdout")

    if out_text:
        # The reply's own words outrank stderr's: they are the CLI's verdict.
        first = out_text.strip().splitlines()[0][:120]
        pairs.append("detail=" + re.sub(r"[^A-Za-z0-9._:/-]+", "_", first).strip("_"))
        if not text:
            pairs.append("stderr=empty")
    elif not text:
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
