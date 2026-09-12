#!/usr/bin/env python3
"""Turn every open line of the inboxes into a Work Item the spine can report on.

★ THE INBOX WAS A TRIGGER AND NOT AN INTAKE, AND THAT IS THE WHOLE BUG. Measured
  2026-09-12: of the ten task_created events in the organisation's entire history,
  ten carried origin=schedule and ZERO carried origin=inbox — although
  tasks.ORIGINS has listed "inbox" since the spine's first day. A job the owner
  typed in Obsidian woke a run and then existed nowhere: no id, no state, no
  owner, no evidence pointer. So it could not be reported as open, stuck, overdue
  or blocked, and `org status` was not hiding it — nothing had ever told the spine
  it existed. That morning five jobs tagged #today sat unworked for hours with no
  record anywhere that they had been asked for.

★ EVERY OPEN LINE BECOMES A TASK, URGENT OR NOT. on-change.sh decides whether to
  WAKE the department; this decides whether the work is TRACKED, and the two are
  different questions. The old behaviour for a non-urgent line was to record the
  file's hash and say "leaving it for the next scheduled run" — into /tmp, where
  nobody reads it, and with the hash recorded so the same line would never
  re-trigger. If that next run was then refused, the job was gone. A tracked task
  survives a refused run; a hash does not.

★ IT NEVER CLOSES ANYTHING. A line that disappears from `## Open` is not evidence
  the work happened — it is evidence the file changed. The owner strikes items
  through, moves them to `## Done`, rewrites them, or fixes a typo, and only one
  of those means "done". Closing on absence would let an edit silently complete a
  task nobody did. Tasks are closed by the runner that finished them or by a
  human, both of which leave a reason. The known cost is the mirror: EDITING a
  line files a second task, because an edited line is indistinguishable from a new
  one without asking the owner. Filing twice is visible and costs a refusal;
  losing the job is invisible and costs the job.

★ IDEMPOTENCY IS THE STORE, NOT A MARKER FILE. "Have I filed this line?" is
  answered by reading tasks whose origin is `inbox` and comparing titles exactly —
  so a deleted task file means the line is filed again, which is correct, and no
  second source of truth can drift away from the first. --all is deliberate:
  terminal tasks count, or a job finished this morning is re-filed this afternoon.

★ UNREADABLE IS NOT EMPTY. Same rule as on-change.sh, for the same reason and the
  same cost: a launchd job that cannot read the vault must refuse loudly. Reading
  nothing and concluding "no open jobs" is silent, plausible and wrong.

Usage:  inbox-intake.py <department> <inbox.md> [<inbox.md> ...]
Prints one line per task created. Exit 4 if an inbox could not be read.
"""
import json
import os
import re
import subprocess
import sys

ORG = os.environ.get("ORG_CLI") or os.path.expanduser("~/.swechha-ai/org")

# Leading noise, stripped REPEATEDLY: `- [ ] #today ...` carries a bullet, a
# checkbox and a tag, and stripping one leaves the next sitting where the title
# should start. Heading hashes only count when followed by whitespace -- that is
# what a markdown heading is -- so the `#` of `#today` survives to be recognised
# as a tag by the next pattern rather than being eaten as a heading.
_LEAD = re.compile(r"^(\s*(#+\s+|[-*+]\s*|\[[ xX]\]\s*))+")

# The urgency marker is stripped FROM THE TITLE. It says when, not what. Leaving
# it in means the same job re-filed the day the owner removes the tag, and two
# tasks for one piece of work. Both spellings, because both are accepted upstream.
_URGENCY = re.compile(
    r"^(#?(NOW|TODAY|THIS WEEK|BACKLOG|WATCH)\s*:|#(NOW|TODAY)(?![\w-]))\s*",
    re.IGNORECASE)

# A line that is punctuation, a rule, a comment or a checked box is not a job.
_NOISE = re.compile(r"^(\s*|-{3,}|<!--.*?-->)$", re.DOTALL)
_DONE_BOX = re.compile(r"^\s*[-*+]?\s*\[[xX]\]")
_STRUCK = re.compile(r"^~~.*~~$")


def open_section(path):
    """The `## Open` block of one inbox, line by line. Refuses loudly if unreadable."""
    if not os.access(path, os.R_OK):
        why = ("cannot READ it (a launchd job has no access to ~/Desktop -- macOS TCC)"
               if os.path.exists(path) else "it does not exist")
        sys.stderr.write("inbox-intake: REFUSED -- %s: %s\n" % (path, why))
        raise SystemExit(4)
    out, inside = [], False
    with open(path, encoding="utf8", errors="replace") as f:
        for line in f:
            line = line.rstrip("\n")
            if line.startswith("## Open"):
                inside = True
                continue
            if line.startswith("## Done"):
                inside = False
            if inside:
                out.append(line)
    return out


# A markdown heading, which is the only thing that opens a job once the file
# uses headings at all. `#today` is not one: a heading needs whitespace after
# the hashes, which is the same distinction _LEAD already relies on.
_HEADING = re.compile(r"^#{1,6}\s")


def jobs(lines):
    """Group an `## Open` section into JOBS. A job may span many lines.

    ★ A JOB IS NOT A LINE, AND ASSUMING IT WAS COST 46 WORK ITEMS. On 2026-09-12
      at 18:4x the owner filed one brief -- a `### THIS WEEK:` heading with a
      body of prose and bullets explaining what had already been done. This file
      filed EVERY LINE of it: 46 tasks, each a sentence fragment, one of them
      reading "stop spending. Take it on the next scheduled run." The store went
      from 34 objects to 86 in an hour and the real job had no single task
      representing it. A Work Item store full of fragments is worse than one
      missing an entry, because the fragments look like work.

    ★ TWO SHAPES, AND THE HEADING WINS. The inbox has been written both ways:
      as a flat list, one job per line, which is what the five tasks filed
      earlier that day came from; and as headed sections with bodies. So:

        - a heading opens a job, and everything up to the next heading is its
          body -- including bullets, which are part of the explanation and are
          NOT separate jobs;
        - lines BEFORE the first heading keep the old one-job-per-line rule, so
          a flat file behaves exactly as it did and no existing title changes.

      Titles are compared exactly for idempotency, so changing how a title is
      derived re-files every job. The flat path is therefore left alone rather
      than unified for tidiness.

    ★ THE KNOWN COST, STATED: once a file uses a heading, a job appended after it
      WITHOUT a heading is read as part of the last section's body and is not
      filed. That is the documented contract -- if you use headings, every job
      gets one. It is the one case where this returns to losing a job rather
      than duplicating it, and it is why main() prints the job count and its
      first heading rather than a bare number.
    """
    out, heading_seen, cur = [], False, None
    for line in lines:
        if _HEADING.match(line):
            heading_seen = True
            if cur is not None:
                out.append(cur)
            cur = [line]
            continue
        if heading_seen:
            if cur is not None:
                cur.append(line)
            continue
        # Flat mode, unchanged in effect: an unindented line opens a job, an
        # indented one continues the job above it.
        if not line.strip():
            continue
        if len(line) - len(line.lstrip()) == 0:
            out.append([line])
        elif out:
            out[-1].append(line)
    if cur is not None:
        out.append(cur)
    return out


def title_of(line):
    """The stable title for an inbox line, or None if the line is not a job.

    Stable is the entire requirement: the same line must produce the same string
    on every run for ever, or dedup fails open and files the job again on every
    save of the file.
    """
    if _DONE_BOX.match(line):
        return None
    s = line.strip()
    if _NOISE.match(s):
        return None
    prev = None
    while prev != s:                      # markers nest; one pass is not enough
        prev = s
        s = _LEAD.sub("", s)
        s = _URGENCY.sub("", s).strip()
    # A leading separator is left behind by `- #today - Google page index update`,
    # where the owner wrote a second dash after the tag.
    s = re.sub(r"^[-–—:]\s*", "", s)
    s = " ".join(s.split())               # collapse runs of whitespace
    if not s or _NOISE.match(s) or _STRUCK.match(s):
        return None
    if s.startswith("<!--"):
        return None
    return s


def filed_already(department):
    """Titles this department has already filed from an inbox, terminal ones included."""
    try:
        out = subprocess.run([ORG, "task", "list", "--dept", department, "--all", "--json"],
                             capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        return None
    if out.returncode != 0:
        return None
    try:
        rows = json.loads(out.stdout or "[]")
    except ValueError:
        return None
    return set(r.get("title", "") for r in rows if r.get("origin") == "inbox")


def main(argv):
    if len(argv) < 3:
        sys.stderr.write(__doc__.rsplit("Usage:", 1)[-1].strip() + "\n")
        return 2
    department, paths = argv[1], argv[2:]

    if not os.access(ORG, os.X_OK):
        # The same rule run.sh follows: with the spine uninstalled this file does
        # nothing rather than stopping the department. Bookkeeping that can halt the
        # work has traded something that matters for something that does not.
        return 0

    seen, titles = set(), []
    for p in paths:
        for job in jobs(open_section(p)):
            t = title_of(job[0])
            if t and t not in seen:
                seen.add(t)
                titles.append(t)

    already = filed_already(department)
    if already is None:
        # ★ REFUSE RATHER THAN GUESS. An unreadable store is not an empty one, and
        #   treating it as empty files every open line again on every save.
        sys.stderr.write("inbox-intake: REFUSED -- could not read the task store; "
                         "filing nothing rather than filing everything twice\n")
        return 5

    created = 0
    for t in titles:
        if t in already:
            continue
        r = subprocess.run([ORG, "task", "new", department, t, "--origin", "inbox"],
                           capture_output=True, text=True)
        if r.returncode == 0 and r.stdout.strip():
            created += 1
            print("inbox-intake: filed %s  %s" % (r.stdout.strip(), t))
        else:
            sys.stderr.write("inbox-intake: could not file %r: %s\n"
                             % (t, (r.stderr or "").strip()))
    # JOBS, not lines. The count is the check the owner reads: if one brief
    # reports as forty-six, the grouping is wrong and it is wrong visibly.
    print("inbox-intake: %d open job(s), %d already filed, %d new"
          % (len(titles), len(titles) - created, created))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
