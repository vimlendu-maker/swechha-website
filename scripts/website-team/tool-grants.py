#!/usr/bin/env python3
"""Read the earned tool grants, and refuse anything that is not provably read-only.

    tool-grants.py <ledger.json> [--check]

Prints a comma-separated `--allowedTools` fragment, or nothing. `--check`
validates and reports rejections on stderr instead.

★ THE WHITELIST LIVES HERE, IN THE MACHINERY THE DEPARTMENT MAY NOT WRITE.
  `scripts/website-team/**` is GATED: changing it needs a human merge. The
  LEDGER is data the department may add to. So the worst a wrong ledger entry
  can do is be ignored -- an agent can grant itself eyes and can never grant
  itself hands, because the thing that decides what counts as eyes is not
  something it can edit.

  This is the same shape as guard-paths.sh duplicating auto_merge.never_touch:
  the last line of defence must not depend on the file it is defending against.

★ VERBS, NOT PREFIXES. `gh run` would admit `gh run rerun`, which writes. Every
  entry below is a full subcommand whose effect is to READ, checked against the
  whole grant rather than its first word. On 2026-09-11 the department's manager
  was granted `gh run list` and denied `gh run view`, could see that a workflow
  was red and not why, reasoned from the workflow's comments instead -- and the
  comments were wrong. That is what withholding a read costs; it is not an
  argument for withholding a write.

★ NO NETWORK VERBS, EVER. `curl`, `wget` and `node -e` fetches are read-only in
  the sense that they change nothing locally, and they are the shape by which
  anything in the model's context leaves the machine. Being harmless to the
  repository is not the test.
"""
import argparse
import json
import sys

# Full subcommands, not prefixes. Anything not matching exactly is refused.
READ_ONLY = frozenset({
    "gh run list", "gh run view", "gh run watch",
    "gh pr list", "gh pr view", "gh pr checks", "gh pr diff",
    "gh issue list", "gh issue view",
    "gh workflow list", "gh workflow view",
    "gh label list", "gh release list", "gh release view",
    "git log", "git show", "git diff", "git status", "git blame", "git ls-files",
})

# npm scripts are named by the repository, so they cannot be enumerated here.
# These suffixes are the repository's own convention for a script that reports
# and writes nothing; `npm run build:*` and `npm run data:*` deliberately do not
# appear, because both commit.
READ_ONLY_NPM_SUFFIXES = ("status", "check", "verify")


def permitted(grant: str) -> bool:
    g = " ".join(str(grant).split())
    if g in READ_ONLY:
        return True
    if g.startswith("npm run "):
        script = g[len("npm run "):]
        # No arguments, and a reporting-shaped name.
        return " " not in script and script.split(":")[-1] in READ_ONLY_NPM_SUFFIXES
    return False


def load(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError):
        # A missing or broken ledger grants nothing. It must never be a reason
        # the department cannot run -- it is additive by construction.
        return []
    grants = data.get("grants") if isinstance(data, dict) else data
    return [g for g in (grants or []) if isinstance(g, str)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ledger")
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    ok, refused = [], []
    for g in load(a.ledger):
        (ok if permitted(g) else refused).append(g)

    for r in refused:
        print(f"tool-grants: REFUSED {r!r} — not a provably read-only verb", file=sys.stderr)
    if a.check:
        print(f"{len(ok)} granted, {len(refused)} refused", file=sys.stderr)
        return 1 if refused else 0
    # Both forms: an exact-match rule permits the bare command and refuses it
    # with an argument, which is the defect that made half this repository's
    # allowlist narrower than it looked.
    print(",".join(f"Bash({g}),Bash({g}:*)" for g in ok), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main())
