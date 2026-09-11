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
