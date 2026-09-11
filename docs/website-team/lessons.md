# Lessons

Append-only. Every role file loads this before working. The Website Manager adds
to it after each run; nobody edits or deletes an existing entry, because a lesson
that was true once is evidence even after it stops applying — mark it superseded
instead.

Format: `## YYYY-MM-DD — one-line claim` then what happened, then what to do.

---

## 2026-09-11 — A green test you have not tried to break is not evidence

`lib/route-invariant.test.ts` passed the first time it ran. That proved nothing:
a check with a bug in its resolver also passes. Three broken links were injected
into `public/_pages/v3/home.html` — `/volunteer`, `/work/nonexistent`,
`/now/cyclone` — the test named all three, and the file was restored
byte-identical.

**Do:** before trusting any new check, make it fail on purpose and show the
failure. This applies to a test, a gate, a lint rule and an agent constraint.

## 2026-09-11 — The recommended flag is the expensive one

Claude Code's documentation recommends `--bare` for scripted calls. `--bare` does
**not** use the subscription login: it requires `ANTHROPIC_API_KEY` and never
reads the keychain. Plain `-p` uses the subscription. Taking the recommended flag
would have moved this team from free to billed silently.

**Do:** read what a flag does, not what it is recommended for. `--bare` is slated
to become the default for `-p`; re-read `scripts/website-team/run.sh` after any
Claude Code upgrade.

## 2026-09-11 — Two flags in the docs do not exist on this machine

`--permission-prompts none` is documented for unattended runs and requires
v2.1.259. This machine runs 2.1.232 and rejects it with "unknown option". The
first run of the team failed on exactly that.

**Do:** check `claude --version` against a flag's stated minimum before putting
it in a script. Documentation describes the newest release, not the installed one.

## 2026-09-11 — Bash strips NUL, so a NUL separator cannot survive

The runner parsed the agent's output using a NUL separator between cost and text.
Command substitution `$(...)` strips NUL bytes, so the variable never contained
one and the script died with "bad substitution". Line-based separation works.

**Do:** do not pass NUL through a shell variable, ever.

## 2026-09-11 — A label is not the contents

A document named `SWECHHA - PSEA Policy 2023.docx` carries "Adopted on September
13, 2022" in every footer. It was asserted to be a newer policy twice — once from
the filename, once from the body header — and was neither time.

**Do:** open the file, read it, quote it. This is the most repeated defect class
across this whole codebase and the organisation's documents.

## 2026-09-11 — `Write(path)` permission rules are accepted and never consulted

The manager was given `Write(.claude/agents/**)` so it could recruit by writing a
job description. Recruitment was denied anyway. The permissions reference says
why, outright: *"Claude Code checks file permissions against `Edit(path)` and
`Read(path)` rules only. If you write a path rule for `Write`, `NotebookEdit`,
`Glob`, or the legacy `MultiEdit` tool instead, Claude Code accepts the rule but
never consults it."* The rule was decorative.

`Edit(path)` did not unblock it either under `dontAsk`. Rather than widen
permissions until something worked, the manager now has **no file tools at all**
and emits job descriptions in its report for a human to save.

**Do:** use `Edit(path)`, never `Write(path)`, in any permission rule. And when a
permission fight is going badly, consider whether the agent should have the
capability at all — the safest version of this turned out to also be the simplest.

## 2026-09-11 — Compliance is not enforcement

Asked to write outside its boundary, the manager refused in prose and never
called the tool. That looks like a pass and proves nothing: it tests whether the
model is currently well-behaved, not whether the boundary holds. A model update,
or text injected by a page the agent reads, could change the first without
touching the second.

**Do:** test an enforcement boundary with the role's own conscience removed —
plain `claude -p` with the same allowlist and a flat instruction. If the tool
layer does not stop it, the boundary is a suggestion.

## 2026-09-11 — The team's first real task disproved the ticket that commissioned it

`website-engineering` was briefed to fix "two `<img>` tags without `alt`" on the
homepage, a figure from `02-baseline-audit.md`. It found 43 `<img>` tags and 43
`alt` attributes, changed nothing, and explained why: two tags wrap onto a second
line, so the audit's `grep -ohE '<img[^>]*alt='` matched `<img` but not the
`alt=` that followed a newline. Verified independently with a DOTALL parse: 43
tags, 0 without alt. **The backlog item was void and the agent was right.**

**Do:** a regex over HTML is a guess. `[^>]*` does not cross a newline in a
line-oriented grep, so any multi-line tag is silently miscounted. Parse, or at
least use DOTALL, before a count becomes a backlog item.

**Also do:** brief a specialist with the evidence, not just the conclusion, and
tell it explicitly that disproving the premise is a valid outcome. This one did
that unprompted; the instruction is now in `execute.sh` so it does not depend on
the model's disposition.

## 2026-09-11 — `git diff` does not see untracked files

The executor checked `git diff --quiet && git diff --cached --quiet` to decide
whether anything had changed. A specialist left a throwaway diagnostic script in
the tree; `git diff` did not see it, the run reported "no changes made", and the
file would have been swept into the next commit by `git add -A`. It also could
not delete the file itself, because `dontAsk` denies `rm`.

**Do:** use `git status --porcelain` to detect changes. And tell an agent that
cannot delete files not to create them.

## 2026-09-11 — Fact-checking is a script's job, not an agent's

Content autonomy was blocked on one thing: no way to let an agent publish a
figure without a human reading it. Requiring approval per article was the wrong
answer — it makes the manager a bottleneck and does not scale.

`scripts/website-team/verify-claims.py` resolves DOIs against Crossref, compares
the returned record to what was claimed, fetches source URLs and confirms quotes
appear verbatim. No model is involved, deliberately: an agent checking its own
citations is the failure this repository has already had.

Measured against four fabrication modes, all caught: a non-existent DOI (404), a
real DOI attached to the wrong paper (metadata mismatch), a quote absent from its
source, and a bare link offered as proof of a fact.

**Do:** write claims in `claim` blocks and label the type honestly. Label
analysis as analysis and the gate waves it through; dress analysis up as a
verified fact and it stops you. **An unreachable source is not a pass** — re-run
or drop the claim.

**What the gate still cannot do**, and why the human approval list keeps these:
it cannot judge whether a topic is appropriate for Swechha to write about, or
whether a framing misrepresents a contested issue. Citations are checkable;
editorial judgement is not.
