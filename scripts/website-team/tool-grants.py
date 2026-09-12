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

    # ★ THE ONE NETWORK VERB, AND IT IS HERE DELIBERATELY. `git fetch` reaches the
    #   network and writes remote-tracking refs, so it fails the literal reading
    #   of "read-only" that governs everything else in this set. Admitted anyway,
    #   by the owner, 2026-09-12, because the alternative was measured and is
    #   worse: without it the department reasons from whatever this checkout
    #   happens to hold and CANNOT TELL BEHIND FROM MISSING -- the exact confusion
    #   org-spine's `fix/stale-checkout-is-not-an-absent-one` was written to end.
    #
    #   What makes it safe is what it does not touch: no working tree, no index,
    #   no local branch, no merge. `git pull` is therefore NOT here and must never
    #   be added -- it is a fetch plus a merge, and the merge is a write.
    #
    #   It is not a precedent for `curl`, `wget` or `node -e`. Each of those
    #   carries an arbitrary URL and can post the model's context to it. This one
    #   speaks only to `origin`.
    "git fetch origin",
})

# ★ NAMED ONE BY ONE, BECAUSE THE NAMING CONVENTION LIED. The suffix rule below
#   was written from half this repository's evidence. It admits `air:status` and
#   `seo:gsc:check` and refuses `verify:seo`, because the same words are used as
#   a PREFIX here too. The obvious repair -- also accept a reporting word in the
#   FIRST segment -- was drafted and then abandoned on inspection:
#
#       verify:final       writes docs/design/FINAL.md      verify-final.mjs:757
#       verify:crosscheck  writes data files, mkdir -p      verify-air-crosscheck.mjs:114,341
#       verify:seo         writes nothing                   read in full, 2026-09-12
#
#   Two of the three `verify:*` scripts write. A prefix rule would have granted
#   both. So the NAME IS NOT EVIDENCE in either direction, and every entry here
#   was decided by reading the script it runs, not by the shape of its label.
#
#   `test` is the exact name only. `test:watch` is `vitest` with no `run` -- a
#   watcher that never exits, which would hang an unattended run forever -- and
#   exact matching is what excludes it.
READ_ONLY_NPM_SCRIPTS = frozenset({
    "test",         # vitest run -- the suite, non-watch
    "verify:seo",   # node scripts/verify-seo.mjs -- reports, writes nothing
})

# npm scripts are named by the repository, so they cannot all be enumerated here.
# These suffixes are the repository's own convention for a script that reports
# and writes nothing; `npm run build:*` and `npm run data:*` deliberately do not
# appear, because both commit.
READ_ONLY_NPM_SUFFIXES = ("status", "check", "verify")


def is_npm_script(grant: str) -> bool:
    """True when this grant names an npm script rather than a plain verb.

    Separate from permitted() because the two answer different questions and
    main() needs both: whether a grant is allowed, and how to EMIT it.
    """
    return " ".join(str(grant).split()).startswith("npm run ")


def permitted(grant: str) -> bool:
    g = " ".join(str(grant).split())
    if g in READ_ONLY:
        return True
    if g.startswith("npm run "):
        script = g[len("npm run "):]
        if " " in script:          # no arguments, ever
            return False
        # The named exceptions first, then the convention for scripts that
        # genuinely follow it.
        return (script in READ_ONLY_NPM_SCRIPTS
                or script.split(":")[-1] in READ_ONLY_NPM_SUFFIXES)
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
    # Both forms for a plain verb: an exact-match rule permits the bare command
    # and refuses it with an argument, which is the defect that made half this
    # repository's allowlist narrower than it looked.
    #
    # ★ BUT NEVER THE `:*` FORM FOR AN NPM SCRIPT. `Bash(npm run test:*)` matches
    #   `npm run test:watch` -- a watcher that never exits -- and also
    #   `npm run test -- --update`, which rewrites snapshots. For a script the
    #   trailing form does not widen what can be SEEN, it widens what can be RUN,
    #   which is the one thing this file exists to prevent.
    fragments = [f"Bash({g})" if is_npm_script(g) else f"Bash({g}),Bash({g}:*)"
                 for g in ok]
    print(",".join(fragments), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main())
