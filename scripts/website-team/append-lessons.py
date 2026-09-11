#!/usr/bin/env python3
"""Append a run's `## Lessons` to the department's lessons file, deduplicated.

    append-lessons.py <lessons.md> < <the manager's report>

Prints the number of entries appended. Exit 0 always when it could read and
write; a run must never fail because its bookkeeping did.

★ WHY THIS EXISTS AT ALL. `swechha-vault/swechha/ai/README.md`'s memory model
  says: "each department's `lessons.md`, which the department may append and
  only a human may delete." `docs/website-team/lessons.md` says the same in its
  own header -- "The Website Manager adds to it after each run." Neither was
  true. The Manager has no write tools by design, nothing in run.sh wrote the
  file, and every lesson it produced went into a dated vault record nobody reads
  twice. All 13 entries as of 2026-09-12 were written by a human.

  The cost was measured: on 2026-09-11 the Manager learned that `gh run view` is
  denied to it, wrote that lesson correctly, and the next run would have started
  without it. A department that pays $1 a run to relearn yesterday is not
  learning.

★ DETERMINISTIC, AND NO MODEL IN THE WRITE PATH. The Manager decides what the
  lesson says; this decides only where it goes. An LLM that could edit the file
  agents read before working could rewrite its own history, which is the same
  objection that keeps the activity log out of agents' hands.

★ DEDUPLICATED BY HEADING, NOT BY BODY. Two runs hitting the same wall produce
  the same `## DATE — claim` line and prose that differs in wording. Matching on
  the heading keeps the file honest without a similarity threshold nobody can
  reason about.
"""
import sys
from pathlib import Path

MARKER = "## Lessons"


def extract(report: str) -> list[tuple[str, str]]:
    """[(heading, entry)] from the report's trailing `## Lessons` section.

    The role file says "End your report with a `## Lessons` section", so the
    section runs to end of file. That is load-bearing: entries are themselves
    `##`-level, so there is no way to tell an entry from the next report section
    by depth alone, and taking everything after the marker is the only reading
    that cannot mistake one for the other.
    """
    idx = report.rfind(MARKER)
    if idx == -1:
        return []
    body = report[idx + len(MARKER):]
    entries, heading, buf = [], None, []
    for line in body.split("\n"):
        if line.startswith("## "):
            if heading:
                entries.append((heading, "\n".join(buf).strip()))
            heading, buf = line.strip(), []
        elif heading:
            buf.append(line)
    if heading:
        entries.append((heading, "\n".join(buf).strip()))
    # An entry with a heading and no body is a heading the model started and did
    # not finish. Appending it would put a claim in the file with no evidence.
    return [(h, b) for h, b in entries if b]


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: append-lessons.py <lessons.md> < report", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    report = sys.stdin.read()
    entries = extract(report)
    if not entries:
        print(0)
        return 0
    existing = path.read_text(encoding="utf-8") if path.exists() else "# Lessons\n"
    new = [(h, b) for h, b in entries if h not in existing]
    if not new:
        print(0)
        return 0
    block = "".join(f"\n{h}\n\n{b}\n" for h, b in new)
    path.write_text(existing.rstrip("\n") + "\n" + block, encoding="utf-8")
    print(len(new))
    return 0


if __name__ == "__main__":
    sys.exit(main())
