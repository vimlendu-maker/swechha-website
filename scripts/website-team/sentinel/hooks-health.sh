#!/usr/bin/env bash
# Are the organisation's event hooks still wired, in every department?
#
# ★ THE FAILURE MODE THIS EXISTS FOR IS SILENCE. Every hook command ends
#   `; exit 0` so that a broken hook can never block the work — which is the
#   right trade, and it means a hook that has stopped working looks exactly like
#   a quiet afternoon. Nothing would ever tell you.
#
# ★ IT IS A STRUCTURAL CHECK, NOT A RECENCY ONE. "No hook events for a day"
#   would fire every time nobody happened to use Claude Code, and a monitor that
#   cries wolf is a monitor you learn to ignore. What it checks instead is that
#   the wiring is intact: the shared script resolves, and each department
#   registers exactly the hooks that script handles.
#
# ★ WHY THE SHARED SCRIPT CAN GO MISSING AT ALL. ~/.swechha-ai/hook-event.py is
#   a symlink into swechha-website. The fundraising department depends on it
#   from a different repository — named debt, resolved by an org-level home.
set -euo pipefail

HOOK="${SWECHHA_HOOK_SCRIPT:-$HOME/.swechha-ai/hook-event.py}"
VAULT="${WEBSITE_TEAM_VAULT:-$HOME/swechha-vault}"
REGISTRY="$VAULT/swechha/ai/departments.json"

if [ ! -e "$HOOK" ]; then
  echo "hooks: the shared translator is MISSING at $HOOK — every department's event stream is silently dead"
  exit 1
fi
if [ -L "$HOOK" ] && [ ! -e "$(readlink "$HOOK")" ]; then
  echo "hooks: $HOOK is a DANGLING symlink -> $(readlink "$HOOK")"
  exit 1
fi

if [ ! -f "$REGISTRY" ]; then
  echo "hooks: cannot read the registry at $REGISTRY — UNKNOWN which departments to check"
  exit 2
fi

# No command substitution around the Python: bash tokenises quotes inside $( ),
# and a single apostrophe in a comment was enough to make the whole file
# unparseable. The probe exits with the checker's own status instead.
HOOK="$HOOK" REGISTRY="$REGISTRY" exec python3 - <<'CHECK'
import json, os, re, subprocess, sys


def settings_for(repo):
    """Read .claude/settings.json from the repository's DEFAULT BRANCH.

    ★ NOT FROM THE WORKING TREE. Whether a department is wired is a property of
      the repository, not of whichever branch someone is standing on. Reading
      the working tree reported "fundraising: no local checkout" while its main
      branch carried the hooks and its checkout sat on a feature branch — a
      monitor that says NOT WIRED about something that is wired is one you
      learn to ignore, which is worse than no monitor.
    """
    if not os.path.isdir(os.path.join(repo, ".git")):
        return None, "no local checkout"
    # ★ NO "HEAD" FALLBACK. Reading the checked-out ref is precisely the
    #   branch-dependence this function exists to remove: a repository whose
    #   feature branch happens to lack the hooks would be reported unwired.
    #   With no default branch to read, the honest answer is that this cannot
    #   be checked — not a guess taken from whichever branch is out.
    for ref in ("origin/HEAD", "origin/main", "origin/master"):
        try:
            out = subprocess.run(
                ["git", "-C", repo, "show", "%s:.claude/settings.json" % ref],
                capture_output=True, text=True, timeout=10)
        except Exception:
            continue
        if out.returncode == 0:
            return out.stdout, None
    return None, "no readable default branch, or no .claude/settings.json on it"

hook = os.environ["HOOK"]
handled = set(re.findall(r'hook == "(\w+)"', open(hook, encoding="utf8").read()))
if not handled:
    print("hooks: the translator handles no hooks at all")
    sys.exit(1)

reg = json.load(open(os.environ["REGISTRY"], encoding="utf8"))
home = os.path.expanduser("~")
problems, checked, unknown = [], 0, []

for dept in reg.get("departments", []):
    slug = (dept.get("repository") or "").split("/")[-1]
    if not slug:
        continue
    raw, why = settings_for(os.path.join(home, slug))
    if raw is None:
        # Not a fault — simply not visible from here. A department may run
        # entirely on GitHub and have no Claude Code half at all.
        unknown.append("%s: %s" % (dept["id"], why))
        continue
    checked += 1
    try:
        hooks = json.loads(raw).get("hooks", {})
    except Exception as exc:
        problems.append("%s: settings.json will not parse (%s)" % (dept["id"], exc))
        continue
    missing = handled - set(hooks)
    if missing:
        problems.append("%s does not register %s" % (dept["id"], sorted(missing)))
    for name, entries in hooks.items():
        for entry in entries:
            for h in entry.get("hooks", []):
                if not re.search(r";\s*exit 0\s*$", h.get("command", "")):
                    problems.append(
                        "%s/%s can block the tool call it observes" % (dept["id"], name))

if problems:
    print("hooks: " + "; ".join(problems))
    sys.exit(1)
if checked == 0:
    print("hooks: no department has a local checkout to check")
    sys.exit(2)
note = " (%s)" % "; ".join(unknown) if unknown else ""
print("hooks: %d department(s) wired for %d hooks%s" % (checked, len(handled), note))
sys.exit(0)
CHECK
