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
import json, os, re, sys

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
    settings = os.path.join(home, slug, ".claude/settings.json")
    if not os.path.exists(settings):
        # A department with no local checkout is not a fault, it is simply not
        # visible from here. The fundraising pipeline runs on GitHub and has no
        # Claude Code half until the team being built starts running.
        unknown.append(dept["id"])
        continue
    checked += 1
    try:
        hooks = json.load(open(settings, encoding="utf8")).get("hooks", {})
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
note = " (%s: no local checkout)" % ", ".join(unknown) if unknown else ""
print("hooks: %d department(s) wired for %d hooks%s" % (checked, len(handled), note))
sys.exit(0)
CHECK
