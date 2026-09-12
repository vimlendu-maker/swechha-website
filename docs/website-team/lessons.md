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

## 2026-09-11 — An observability layer an agent can write is one it can lie to

The activity log is written by `run.sh` and `execute.sh`, never by an agent.
Every event is emitted by the shell *around* the agent — before it starts, after
it returns, on each gate result — so the log records what the system observed
rather than what the agent said about itself. **An agent cannot mark itself
green.**

It lives at `~/.swechha-ai/activity.jsonl`, outside both repositories. It is
neither knowledge (the vault) nor code (git): it is high-churn telemetry, and
committing it would bury real history under machine noise. Decision records
still go to the vault; this is the stream beneath them.

**Do:** when adding a new stage, emit the event from the script, not from the
prompt. If the only record that a thing happened is the agent's own claim that
it happened, there is no record.

## 2026-09-11 — Route the model, but first ask whether it needs a model

Briefs now carry `model:` — haiku for inspection and deterministic work, sonnet
for ordinary coding and editing, opus where being wrong costs more than the
tokens. Unknown values fall back to sonnet with a warning rather than losing the
brief, because a typo should not cost a run.

The more valuable half is the question before it: **does this need an agent at
all?** A shell command, a test, a parser, `git log` or a grep answers a
deterministic question better, faster and for nothing. The fact gate is the
worked example — fact-checking looked like a job for a careful model and turned
out to be a job for `urllib` and a string comparison.

## 2026-09-11 — A permission rule without `:*` is an exact-match rule, and an argument denies it
The Manager reported `npm run infra:status` DENIED on the day the instrument
shipped, with the rule `Bash(npm run infra:status)` present in the allowlist and
visibly passed to `--allowedTools`. The rule was not ignored: it is
EXACT-MATCH. It permits `npm run infra:status` and refuses
`npm run infra:status --fresh`. Measured, not inferred — two `claude -p` runs
under the same allowlist returned DENIED for the argument form and ALLOWED once
`Bash(npm run infra:status:*)` was added. Every npm rule in the runner had the
same defect, which is most of what the earlier "the allowlist is narrower than
it looks" lesson was actually observing.
**Do:** grant both forms, `Bash(cmd)` and `Bash(cmd:*)`. **Do not** conclude a
rule is being ignored because a command it names was refused — check whether the
agent invoked it bare. And when a role file tells an agent to run something,
the allowlist must grant it in the form the agent will actually type; a role
file naming an ungranted command is an instruction that fails as a refusal the
agent then has to explain, not as an error anyone notices.
`lib/website-team-infra.test.ts` now derives this check from the runner itself.

## 2026-09-12 — `Agent` with a fresh call does not continue a prior agent; only `SendMessage` to its id does

Two specialists exhausted their turn budget mid-investigation and returned no final text. I tried to recover their work by dispatching a *new* `Agent` call and asking it to "just write up what you already found" — that produces a **fresh agent with no memory of the prior run**, and to its credit it said so plainly rather than fabricating a history it didn't have (one even flagged "I have no record of the 38 tool calls you're describing" and redid the check from scratch). The correct recovery is `SendMessage` addressed to the exhausted agent's own id, which does carry its actual context forward — confirmed working on the second attempt, and the design specialist's real 26-tool-call investigation surfaced findings a fresh instance had already missed.

**Do:** if a subagent returns with no final text, use `SendMessage` to its own `agentId`, not a new `Agent` dispatch — and don't ask a fresh instance to recount work it never did.

## 2026-09-12 — The manager has no `SendMessage` tool, so an exhausted subagent cannot be resumed mid-run

Two read-only specialists (`website-design`, `website-content-seo`) ran out of turn budget mid-investigation and returned only a one-line progress note, no final report. The 2026-09-11 lesson says the fix is `SendMessage` to the agent's own id — but the manager's own toolset this run is `Read, Grep, Glob, Bash, Agent` only; there is no `SendMessage` available to it, and a fresh `Agent`/`fork` dispatch (also unavailable — `fork` is not a registered subagent type here) starts with no memory of the prior run, which is the exact failure that lesson warns against manufacturing. The only honest options are: finish the investigation yourself with `Read`/`Grep`/`Bash`, or report the gap plainly and leave it for the next run. I did the former for the /teach underline and sitemap questions, and the latter for the "Next"-spacing and text-heavy-session questions, rather than force either to a conclusion I hadn't earned.

**Do:** budget subagent investigations to fewer, more targeted tool calls up front (the brief should say "render first" as step one, not step ten) — a 27-42 tool-call investigation that dies before writing anything up front-loads the risk of losing the whole result. And don't rely on `SendMessage` being available to the manager; it may not be.

## 2026-09-12 — A tighter brief did not fix the turn-budget failure; the fix was not delegating render-dependent judgement at all

Two fresh, narrowly-scoped briefs (11 lines each, exact file:line citations, explicit "render first" instruction) still ran both `website-design` and `website-content-seo` to their full 25-turn budget with no final synthesis — `website-design` spent 27 tool calls and never got past "let me set up browse and render directly via file://"; `website-content-seo` spent 45 tool calls and stopped mid-sentence. Both times I had no `SendMessage` to resume them (confirmed absent again this run), so both investigations were finished by the manager directly with plain `Read`/`Grep` against the static HTML/CSS — no rendering was actually needed for either verdict (the underline fix, the description duplication) once I stopped trying to have an agent set up a browser and just read the generated files.

**Do:** for a static-HTML site like this one, prefer briefing (or doing directly) a **file-based** check over a **rendered** one whenever the question is "does this CSS rule exist and what does it say" rather than "what does a pixel look like" — the former is a grep, the latter is what burns the budget. Reserve visual/render investigation for genuinely visual judgement calls (contrast, real layout collision) and expect it to cost most of the turn budget just reaching a render, on this toolchain. Until `SendMessage` is available to the manager, budget for finishing an exhausted specialist's task in-house rather than re-dispatching or re-briefing it.
