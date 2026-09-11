#!/usr/bin/env python3
"""Turn Claude Code's lifecycle hooks into organisation events.

★ THIS IS THE ONE EVENT SOURCE AGENTS CANNOT LIE TO.

  swechha/ai/events.md states the rule: agents never write events, the runtime
  around them does. Hooks are the purest form of that — they fire in the Claude
  Code process itself, before and after each tool call, and an agent has no way
  to suppress, forge or edit one. It cannot even see them. So this closes the
  three gaps events.md lists as NOT_AVAILABLE — per-tool events, file
  modifications, and the manager→specialist hop — without weakening the rule.

★ IT IS NOT WEBSITE-SPECIFIC, deliberately. It lives in scripts/org/ rather
  than scripts/website-team/ because a second Claude Code department is being
  built now. The department is DERIVED from the registry, never hardcoded, so
  the only thing a new department does is copy this file and register the hooks.
  A repository the registry does not list logs department UNKNOWN — which is
  the honest answer, and visible, rather than a plausible guess.

★ WHAT IT DELIBERATELY DOES NOT RECORD:

  - Bash command strings. A command line can carry a key inline, and this log is
    plain text read by a dashboard. Tool name yes, arguments never.
  - File CONTENTS. Paths only, and repo-relative at that.
  - Prompts and model output. The decision records already hold what was decided
    and why; this stream is for what HAPPENED.

  The rule is: enough to see the shape of a run, never enough to leak one.

★ IT MUST NEVER BREAK A RUN. Every failure is swallowed and the exit is always
  zero. A telemetry bug that stops the department working would cost more than
  the telemetry is worth.

Usage (from .claude/settings.json): hook-event.py <HookEventName>
Reads the hook payload as JSON on stdin.
"""
import json
import os
import sys
import time

HOME = os.path.expanduser("~")
LOG_DIR = os.environ.get("SWECHHA_AI_HOME", os.path.join(HOME, ".swechha-ai"))
LOG = os.path.join(LOG_DIR, "activity.jsonl")
VAULT = os.environ.get("WEBSITE_TEAM_VAULT", os.path.join(HOME, "swechha-vault"))
REGISTRY = os.path.join(VAULT, "swechha/ai/departments.json")

# Rotate rather than trim. Runner events are the department's only continuous
# history; dropping the oldest lines to make room for tool noise would spend
# something irreplaceable on something cheap.
MAX_BYTES = 8 * 1024 * 1024


def repo_root(path):
    """Walk up to the enclosing git repository.

    The session's working directory is NOT reliably the repository being
    edited — this was found the hard way: the first version derived everything
    from os.getcwd() and a session bound to one project while editing another
    logged every event against the wrong department. The file being touched
    knows which repository it is in; the shell does not.
    """
    try:
        d = path if os.path.isdir(path) else os.path.dirname(path)
        while d and d != "/":
            if os.path.exists(os.path.join(d, ".git")):
                return d
            d = os.path.dirname(d)
    except Exception:
        pass
    return None


def department(path):
    """Ask the registry which department owns this repository.

    Never a hardcoded map: a hand-kept list beside a registry is this
    organisation's most repeated defect. Unknown is a real answer.
    """
    override = os.environ.get("SWECHHA_DEPARTMENT")
    if override:
        return override
    root = repo_root(path)
    if not root:
        return "UNKNOWN"
    slug = os.path.basename(root)
    try:
        with open(REGISTRY, encoding="utf8") as f:
            reg = json.load(f)
        for dept in reg.get("departments", []):
            if (dept.get("repository") or "").split("/")[-1] == slug:
                return dept["id"]
    except Exception:
        pass
    return "UNKNOWN"


def relative(path):
    """Repo-relative. An absolute path leaks the machine's directory layout,
    and this repository is public."""
    root = repo_root(path)
    try:
        if root and path.startswith(root + "/"):
            return path[len(root) + 1:]
    except Exception:
        pass
    return os.path.basename(path or "")


def translate(hook, payload):
    """Map one hook to at most one organisation event, or None to stay silent.

    Silence is the common case and the point of the curation: PreToolUse fires
    on every Read and every Grep, and a log where a run's shape is buried under
    four hundred reads is a log nobody opens.
    """
    tool = payload.get("tool_name") or ""
    ti = payload.get("tool_input") or {}

    if hook == "SessionStart":
        return "session_started", "claude-code", {}
    if hook == "Stop":
        return "session_ended", "claude-code", {}

    if hook == "PreToolUse" and tool == "Agent":
        # The manager→specialist hop. events.md records this as the only
        # agent-to-agent path in the organisation and as having left no trace.
        return "task_started", ti.get("subagent_type") or "subagent", {
            "task": ti.get("description") or "",
        }
    if hook == "PostToolUse" and tool == "Agent":
        return "task_returned", ti.get("subagent_type") or "subagent", {
            "task": ti.get("description") or "",
        }

    if hook == "PostToolUse" and tool in ("Write", "Edit", "NotebookEdit"):
        return "file_modified", "claude-code", {
            "path": relative(ti.get("file_path") or ""),
            "tool": tool,
        }

    if hook == "PostToolUseFailure":
        # Tool name only. What the command WAS is exactly the field that can
        # carry a secret.
        return "tool_failed", "claude-code", {"tool": tool or "UNKNOWN"}

    return None


def main():
    try:
        raw = sys.stdin.read()
    except Exception:
        return
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        payload = {}

    hook = sys.argv[1] if len(sys.argv) > 1 else ""

    out = translate(hook, payload)
    if out is None:
        return
    event, actor, extra = out

    rec = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "epoch": int(time.time()),
        # From the FILE being touched where there is one, because the session's
        # working directory may belong to an entirely different project.
        "department": department(
            (payload.get("tool_input") or {}).get("file_path") or os.getcwd()
            if isinstance(payload.get("tool_input"), dict) else os.getcwd()),
        "actor": actor,
        "event": event,
        "pid": os.getpid(),
        # Scheduled runs set this; anything else is a person at the keyboard.
        # Both are true, and conflating them would let an owner's afternoon read
        # as departmental autonomy.
        "origin": "scheduled" if os.environ.get("SWECHHA_RUN") else "interactive",
        "source": "hook",
        "session": (payload.get("session_id") or "")[:8],
    }
    rec.update({k: v for k, v in extra.items() if v != ""})

    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        if os.path.exists(LOG) and os.path.getsize(LOG) > MAX_BYTES:
            os.rename(LOG, LOG + "." + time.strftime("%Y%m%d%H%M%S"))
        with open(LOG, "a", encoding="utf8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    except Exception:
        pass


if __name__ == "__main__":
    # Guarded so the mapping can be imported and tested without the script
    # exiting the test runner out from under it.
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
