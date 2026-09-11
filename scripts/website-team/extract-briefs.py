#!/usr/bin/env python3
"""Pull execution briefs out of a manager report.

The manager writes briefs inside fenced ```brief blocks under `## Delegated`:

    ```brief
    specialist: website-engineering
    model: sonnet
    title: fix(a11y): the skip link the shared shell never had
    Add a skip link to the shared page shell. ...
    ```

`model` is optional and defaults to sonnet. The manager routes it: haiku for
inspection and deterministic work, sonnet for ordinary coding and editing, opus
where the reasoning is genuinely hard. An unknown value falls back to sonnet
with a warning rather than failing the brief — a typo should not cost the run.

Writes one file per brief into <outdir> and prints `<specialist> <model> <path>`
per line. A malformed block is skipped with a warning on stderr rather than
aborting: one bad brief should not cost the run its good ones.
"""
import os
import re
import sys

report = sys.stdin.read()
outdir = sys.argv[1] if len(sys.argv) > 1 else "."
os.makedirs(outdir, exist_ok=True)

VALID = {"website-engineering", "website-design", "website-content-seo"}
MODELS = {"haiku", "sonnet", "opus", "fable", "inherit"}
DEFAULT_MODEL = "sonnet"

blocks = re.findall(r"```brief\s*\n(.*?)```", report, re.S)
n = 0
for raw in blocks:
    lines = raw.strip("\n").split("\n")
    meta, body = {}, []
    for i, line in enumerate(lines):
        m = re.match(r"^(specialist|title|model)\s*:\s*(.+)$", line.strip())
        if m and not body:
            meta[m.group(1)] = m.group(2).strip()
        else:
            body.append(line)
    spec = meta.get("specialist", "")
    title = meta.get("title", "")
    model = meta.get("model", DEFAULT_MODEL).strip().lower()
    if model not in MODELS:
        print(f"extract-briefs: model={model!r} unknown, using {DEFAULT_MODEL}", file=sys.stderr)
        model = DEFAULT_MODEL
    text = "\n".join(body).strip()
    if spec not in VALID:
        print(f"extract-briefs: skipping block with specialist={spec!r}", file=sys.stderr)
        continue
    if not title or not text:
        print(f"extract-briefs: skipping block for {spec} — missing title or body", file=sys.stderr)
        continue
    n += 1
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:40] or f"brief-{n}"
    path = os.path.join(outdir, f"{n:02d}-{slug}.txt")
    with open(path, "w", encoding="utf8") as f:
        f.write(title + "\n" + text + "\n")
    print(f"{spec} {model} {path}")
