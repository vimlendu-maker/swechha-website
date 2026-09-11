#!/usr/bin/env python3
"""List the commands the permission layer refused during a run.

    denials.py < <claude -p --output-format json output>

One refused command per line, deduplicated, most-refused first. Empty output and
exit 0 when nothing was refused.

★ THIS IS EVIDENCE, NOT PROSE. `--output-format json` carries a
  `permission_denials` array naming every tool call `dontAsk` refused, with its
  input. The runner has always had it and has always thrown it away.

  On 2026-09-11 the Manager diagnosed a red air-pipeline run as a push race. The
  real cause was upstream silence, and it could not have known: the two
  `gh run view --log-failed` calls that would have settled it were both refused.
  It said so in its report -- "I could not confirm this from the actual log" --
  and the harness printed that as a caveat under a confident headline. The
  refusals were sitting in the result JSON the whole time.

  A cause an agent could not verify must not become a report's headline. This
  turns "it mentioned being blocked" into "the runner knows it was blocked".

★ THE COMMAND, NOT THE ARGUMENTS THAT CARRY CONTENT. For Bash the first three
  words are kept (`gh run view`), which is enough to identify the grant that is
  missing and not enough to leak what the model was working on. The event stream
  excludes prompts and model output for the same reason; a denial record is not
  a licence to reintroduce them by the side door.
"""
import json
import sys
from collections import Counter

MAX_WORDS = 3
# ★ AND A CHARACTER CAP. Three words is not a bound when one of them is an
#   inline script: `node -e "fetch(...)"` is three words and the third carried a
#   whole URL and body out of the model's working context on the first run of
#   this. Words bound the shape; characters bound the leak.
MAX_CHARS = 48


def commands(obj) -> list[str]:
    out = []
    for d in obj.get("permission_denials") or []:
        tool = d.get("tool_name") or "?"
        inp = d.get("tool_input") or {}
        if tool == "Bash":
            words = str(inp.get("command", "")).split()
            cmd = " ".join(words[:MAX_WORDS]) if words else "Bash"
            out.append(cmd if len(cmd) <= MAX_CHARS else cmd[:MAX_CHARS].rstrip() + "…")
        else:
            out.append(tool)
    return out


def main() -> int:
    raw = sys.stdin.read()
    decoder = json.JSONDecoder()
    best, i = None, 0
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
        return 0  # nothing parsable is not the same as something refused
    for cmd, n in Counter(commands(best)).most_common():
        print(f"{cmd}\t{n}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
