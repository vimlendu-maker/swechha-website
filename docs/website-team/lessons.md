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

## 2026-09-12 — A tightly-scoped, explicitly non-rendering brief succeeded where two rendering attempts failed

Two prior runs (per this file's own 2026-09-12 entries) burned `website-design`'s and `website-content-seo`'s full turn budgets trying to reach a browser render on this machine, which has none. This run's brief for the same class of question ("is this page too text-heavy") explicitly forbade rendering, named exact files and line ranges to read, and asked for quantified, cited answers rather than a visual verdict. It completed in 22 tool calls with a specific, actionable finding (two existing components — `.tc-rh`, `disclose()`/`.dx` — used inconsistently, not absent). **Do:** for this site (static HTML, own CSS per page), default every design/content brief to file-based unless the question is genuinely about a rendered pixel (contrast, real overlap) — and say explicitly in the brief that rendering is unavailable and forbidden, not just "prefer" a file-based check.

## 2026-09-12 — A duplicate JSON key in a policy file is a silent gate weakening nobody would see in a diff review

`docs/website-team/policy.json` defines `"requires_approval_paths"` twice at the top level. A reviewer scanning the file top-to-bottom sees the first, correct-looking block and would reasonably stop reading; the parser takes the second, narrower one. This is the same species of defect as "a label is not the contents" — the file's *name* for a key says one thing, its *effective* value (post-parse) says another. **Do:** when reading a policy/config file that gates enforcement, check for duplicate top-level keys mechanically (a JSON parse plus a key-count, not just visual scan) before trusting any block of it as active.

## 2026-09-12 — A brief that explicitly forbade rendering still exhausted its budget on a pure counting task

Unlike the two prior 2026-09-12 turn-budget failures (which were mis-scoped as rendering/visual tasks), this brief was already file-based and non-rendering by design — read 36 JSON files, count array lengths, check 5 built HTML files for a CSS class. It still ran 26 tool calls and 148.7k tokens without producing a final answer. The likely cause: "count `sequence` steps across 36 files, then also check for natural break markers, then also check 5 built pages for visual breaks" is three passes disguised as one brief. **Do:** even a file-based brief should ask for one deliverable per dispatch when the file count is large (>~20) — split "how many files, what size" from "which ones have natural break points" into two smaller briefs rather than one compound one, and prefer a number the manager could get from `wc`/`grep` directly over dispatching an agent for pure counting at all.

## 2026-09-13 — A "fixed" commit's own diff can tell you it only fixed one instance, not the class of bug

`78a97ed5` said, accurately, in its own commit body: "these three exact marker patterns occur ... in exactly one file." The org inbox item that prompted it ("individual session pages are too text heavy," plural) was never actually resolved by that commit — it fixed the one file where the heuristic's trigger phrases existed, and the other 42 session pages still carry zero content usage of the same breakup components. Reading a commit's own stated scope, not just its title (`fix(teach): ...`), is what caught this — the title alone reads as a general fix.

**Do:** when a fix commit names a count ("exactly one file," "one page affected"), check that count against the width of the original complaint before marking the complaint resolved. A precise, honest commit message is not the same thing as full resolution of the ticket that prompted it.

## 2026-09-13 — An undefined CSS custom property with no fallback is invisible to every existing gate

`--display` is referenced 146 times across every served page and defined zero times, anywhere in the repository — confirmed by two greps, not assumed. `verify:seo` (147/147 clean), `npm test`, `npm run lint` (1 warning) and the route-invariant test all pass with this bug live, because none of them check that a CSS custom property a page's `<style>` *uses* is also *defined* somewhere reachable by that same page. This is the same species of gap AD-51's "Gate 15" was built for (a class with no styling behind it) but one level lower — a *property* with no value behind it, which produces no missing-class symptom, just a silent fallback to the inherited font.

**Do:** when auditing a served page's CSS for a visual complaint, grep for `var(--` tokens used and check each has a matching `--name:` definition in the same page's own `<style>` — this class of bug produces no error, no missing element and no failing existing gate, only a font (or colour, or size) quietly reverting to its inherited value.

## 2026-09-13 — An inbox item can describe a branch as if it were `main`, and the department has to re-check, not relay

The department inbox's "what is already done" section for the Vercel storage item names four fixes as landed. Only two are true on `main`; the `vercel.json` catch-all and the photo optimisation both live only on the still-open, still-conflicting PR #155. The note was accurate about the PR at the time it was written and became wrong the moment the PR didn't merge — nothing marked that gap. **Do:** when an inbox entry says a fix is "done," check the actual file on `main`, not the PR/commit it cites, before repeating the claim in a report.

## 2026-09-13 — "Careful" does not move a `never`-list item

A specialist recompressed ~100 images in place, verified thoroughly (dimensions, EXIF orientation, pixel diff, share-card regeneration), to solve a real, urgent quota problem. The verification quality is not in question; the `never`-list entry ("replace a font or image at its existing filename") has no carve-out for careful execution, and this repository has already shipped a real regression from exactly this class of change once (the EXIF-rotation incident the rule almost certainly exists because of). **Do:** when a brief's own solution touches a `never`-list path, that is not a "did the specialist do it well" question — it stops at the manager, every time, regardless of verification quality on the branch.

## 2026-09-16 — A lesson is not a ticket, and a defect recorded in `lessons.md` can sit live for days

The 2026-09-13 entry recorded `--display` as referenced across every served page and defined nowhere. Three days later it is still true — 147 of 148 served pages, 11 rules across 6 generators, zero definitions in CSS or JS — and it is the likely cause of an owner-reported symptom (`website-20260912-0009`, "the space between words is less where the font style and size changes") that was filed the day *before* the lesson was written. Nobody connected the two, because a lesson is read as knowledge and a task is read as work, and nothing crosses between them.

**Do:** when writing a lesson that describes a **live defect** rather than a process trap, say in the lesson which open task it explains, or say that none exists. A lesson that records an unfixed bug and names no ticket is a bug report filed in the wrong drawer.

## 2026-09-16 — `gh run list --json conclusion` is empty for a run still in progress, and that reads as failure

`scripts/air-status.mjs:99` maps `ok: r.conclusion === 'success'` without requesting `status`, so an in-progress run is classified not-ok and printed as `FAILED`. I observed the same run as `in_progress` in `gh run list` and as `FAILED` in `air-status` within the same minute.

The near-miss is the useful half: I was about to report it as a false alarm, checked the run's final conclusion first, and found it had genuinely failed. The defect is real but today's label happened to be correct.

**Do:** when a monitor and a raw query disagree, resolve the underlying fact before calling the monitor wrong. A monitor that is right by accident is still a defect, and a monitor you declared wrong by accident is worse.

## 2026-09-16 — `git log --name-only -- <path>` filters the filename list to that same path, so counting other paths always returns zero

I ran `git log --name-only -- data/air-delhi.json | grep -c '^public/_pages'` to ask "do air commits also rewrite built pages", got `0`, and nearly reported that air ticks change no served HTML. They change about nine pages each. The pathspec restricts the printed file list as well as the commit selection, so the answer was structurally guaranteed to be zero regardless of the truth. Using `--grep` on the commit subject instead of a pathspec gave the real figures.

**Do:** when counting paths across commits, select commits with `--grep` or a revision range and never with the pathspec you are trying to count *around*. A query that can only return one answer is not evidence.

## 2026-09-17 — A build artefact in a forbidden directory refuses a branch the specialist wrote correctly

`website-20260916-0002`'s branch changed three real files and two nobody authored: `scripts/website-team/__pycache__/{inbox-intake,tool-grants}.cpython-314.pyc`, written by Python when the runner imported those scripts and staged by `execute.sh`'s `git add -A`. `guard-paths.sh` forbids `scripts/website-team/`, so the guard failed while tests, typecheck, lint, build and `verify:seo` all passed in the same second. `.gitignore` had no Python entry and `git ls-files` shows the files were never tracked on `main` — so the branch was refused for files that exist only because a run happened.

This is the third instance of one shape: a **machine-written** file inside a **denied** tree stops the department shipping. The first was `data/seo/lastmod.json` (fixed 12 Sep by narrowing the deny). The second was the abandoned diagnostic script in the 2026-09-11 entry.

**Do:** when a branch fails `guard` while every other gate passes, read the full `git diff --name-only BASE...HEAD` before re-diagnosing the work — the violation is more likely a generated artefact than the change. And any tree the guard denies needs a matching `.gitignore` rule for whatever tooling writes into it, or the deny will eventually refuse an innocent branch.

## 2026-09-17 — Five days of an owner's `#today` items were a blocked gate, not a misjudged priority

Five `#today` items sat open for five days. The instinct is to re-diagnose them. The activity log said otherwise: on 12 Sep five `/teach` branches were refused by `guard` at 08:21, 10:53, 11:46, 13:04 and 13:10, and on 16 Sep the air-status branch was refused the same way. The work had been done up to four times over; none of it reached `main` for the next run to see. One of the five items (`0008`) had in fact shipped on 12 Sep and nobody had noticed, which two greps settled.

**Do:** before re-investigating an owner complaint that is more than a day old, grep `~/.swechha-ai/activity.jsonl` for `gate_result` and `task_refused` on that task. If the gates other than one are green, the question is why that gate fired — not what the defect is. And check the served files for the complaint's symptom before assuming it is still there.

## 2026-09-17 — `air:status` exiting 1 turns a stale upstream into an UNKNOWN row for the whole pipeline

`scripts/air-status.mjs:113` raises a problem from page-observation age alone and prints *"The pipeline is not publishing."* Today that sentence was false: `/api/air` returned the same 05:00 IST observation the page shows, and the last run succeeded 46 minutes earlier. CPCB was slow; the pipeline was fine. Because the script exits 1, `infra:status` renders the whole Air/climate row as UNKNOWN — so a slow upstream hides a real failure behind the same label.

**Do:** a monitor may report a symptom but must not assert a cause it has not separated from the alternatives. Where `air-status` already computes the site-vs-source comparison (line 132), the page-age problem should name the upstream when there is no gap. And note per the 16 Sep entry: resolve the underlying fact before declaring a monitor wrong — I checked `/api/air` and the run conclusion before writing this.

## 2026-09-26 — `git log --oneline --all` finding a commit does not mean it is on `main`; check the checkout, not the search scope

This run's checkout is `HEAD detached at origin/main`, so anything `git log` or `Read` returns from it genuinely is on `main` — worth stating explicitly in a report (as I did for `vercel.json`, `.gitignore`, and the photo-optimisation commits) rather than just citing a commit hash, because the 2026-09-13 lesson recorded exactly this checkout-vs-branch confusion going the other way (a fix described as "done" that was only on an unmerged PR). Citing which ref you actually read is cheap and closes that gap every time.

## 2026-09-26 — A test that fails once under full-suite load and passes twice afterward is a flake to fix, not a regression to report

`lib/website-team-land-lessons.test.ts` timed out at vitest's 5000ms default during a `npm test` run doing real subprocess git I/O (clone/merge/commit/push), then passed both isolated and on an immediate full-suite re-run. Per the 2026-09-16 lesson ("resolve the underlying fact before calling a monitor wrong"), the same discipline applies to a red test: rerun before treating one red line as a regression. The fix (an explicit longer timeout on the two subprocess-heavy tests) is cheap and prevents this from someday blocking an auto-merge PR on pure bad luck.
