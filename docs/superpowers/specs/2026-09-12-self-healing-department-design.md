# Self-healing website department — design

**Status:** approved in outline, not yet implemented
**Date:** 2026-09-12
**Supersedes nothing.** Extends `swechha-vault/swechha/website/team/09-autonomous-department-gap-analysis.md`,
whose §C layer diagram and closing graduation proposal this design finally wires.

---

## 1. Why

On 2026-09-11 the department did everything it was built to do and still
produced a wrong answer and no fix:

| What happened | Evidence |
|---|---|
| Two `Air — poll, validate, publish` runs went red | runs `34623682905`, `34629108848` |
| The Manager diagnosed a **push race** | `2026-09-11-website-team-work.md`, §Diagnosed |
| The actual cause was **exit 75, upstream unavailable** — both CPCB and the data.gov.in mirror timed out | `gh run view --log-failed`, both runs |
| Exit 75 is documented as *not a failure* | `air-hourly.yml:39` — "EXIT 75 IS NOT A FAILURE → stay green" |
| It goes red anyway | `air-hourly.yml:177` runs under `shell: bash -e`; `npm run data:air:delhi` returning 75 kills the shell before `code=$?`, so the exit-75 branch is unreachable dead code |
| The Manager delegated "read the log" to Engineering | §Delegated |
| Engineering has **no `gh` command at all** | `execute.sh` `ALLOWED` — `git status/diff/log` only |
| It changed nothing, correctly | `logs/20260911-231646-website-engineering/exec.txt` |
| The spine recorded it as **"shipped"** | `execute.sh` exits 0 on an empty diff; `run.sh` maps exit 0 → `task done "shipped"` |
| The lesson it wrote was never retained | `lessons.md` contains 0 occurrences of `gh run view`; all 13 entries are human-authored |

Three independent failures, one theme: **the department can observe, but it
cannot see, act, or remember.**

### The specified layer that was never wired

`09-autonomous-department-gap-analysis.md:105` defines three layers with two
different owners:

```
  OPERATING SYSTEM (human, repo)   policy.json · guards · routing · gates
        │  agents may read, never write
  LEARNED KNOWLEDGE (agents)       lessons · patterns · what failed
```

The runtime collapsed these into one read-only layer. `lessons.md` is loaded by
every role and writable by none of them. That is the root cause of "it repeats
its mistakes": not model weakness, a missing write path.

---

## 2. Decisions taken

| # | Decision | Consequence |
|---|---|---|
| D1 | Both self-repair **and** publishing autonomy, **sequenced** | Repair must be trustworthy before publishing rides on it |
| D2 | **Ratchet**: may tighten freely, may never loosen | An agent may add a probe, a test, a lesson, or a read-only capability unattended. Loosening a gate, gaining write/network power, or editing `policy.json` needs a human |
| D3 | **Hybrid runtime**: deterministic 24/7 on GitHub Actions, model judgement on the Mac | Keeps the £0 subscription path (`run.sh:4-11`); a 3am event is detected and queued, not lost |

### The one thing that does not move

`requires_approval` item 1 — *"ANY new factual claim, figure, citation or
statement about Swechha — this gate does not move with the autonomy dial."*

This design does not touch it at any phase. Situation-page figures come only
from verified feeds via the existing fact pipeline. **No agent ever writes a
figure.** This repo has already produced fabricated tolls, DOIs and URLs
(`content-seo.md`, the Nepal headline defect), and death tolls are the exact
surface where fluency is indistinguishable from truth.

---

## 3. Architecture

### 3.1 Bands, in the organisation's own vocabulary

ADR-0004 defines four responsibility bands **by the mechanism that enforces
them**, and explicitly rejected a three-band model. This design uses those names,
not its own:

| Band | Here | Enforced by |
|---|---|---|
| `AUTONOMOUS` | `lib/`, `components/`, `docs/`, tests | the nine `auto_merge` conditions |
| `GATED` | `.github/workflows/**`, `scripts/**` | `approval-gate.py` — an artefact the agent cannot create |
| `FORBIDDEN` | `policy.json`, the never-list, `app/**` | `guard-paths.sh`, no code path |
| `RECOMMENDS` | Design, Content+SEO | read-only by construction; `execute.sh` refuses them |

An earlier draft of this spec invented a third tier called `propose_only`. It is
deleted. The organisation already has the concept, already has the enforcing
executable, and has it in a better shape — see below.

### 3.2 Approval is an artefact, not a tier

`swechha-ai/approval-gate.py` already exists, is department-agnostic, and its
header states the contract: *"A third department inherits it by declaring
`requires_approval_paths` and changing nothing else."*

Website's `policy.json` **does not declare it.** It validates clean against
`policy.schema.json` only because the block is optional — so all fourteen of its
`requires_approval` rules are, today, prose a manager is trusted to honour. That
is the actual reason the department had nothing between "free" and "forbidden".

The fix is therefore not a new tier. It is:

1. add `requires_approval_paths` to `policy.json`, mapping the path-shaped rules
   to globs (keys matching `requires_approval` entries **verbatim** — the schema
   derives "not mechanically enforced" by comparing the two lists);
2. move `.github/workflows/**` out of `never_touch` and into a rule mapped there;
3. call `approval-gate.py` from `execute.sh` against the diff.

This is strictly better than what this spec first proposed, and the reason is
worth recording: my version had `execute.sh` classify the *brief*. That is the
agent deciding whether the agent needs approval. The gate reads the **diff**,
after the fact, which is why its header says *"a gate an agent can talk itself
past is a gate in name only."*

Per ADR-0004, moving `.github/workflows/**` out of `FORBIDDEN` requires **a test
that fails if the lock is removed**. §9 carries it.

### 3.3 The tool-grant ledger

The department may not edit its own machinery (`scripts/**` is `GATED`). But it
must be able to *earn sight*. So the command allowlists move out of the scripts
into a data file:

- `docs/website-team/tool-grants.json` — read-only command grants, ratchet-writable
- `run.sh` / `execute.sh` read it and concatenate onto their static `ALLOWED`
- a **verb whitelist** in the reading script rejects anything not provably
  read-only (`gh run view`, `gh api` GET, `git show`, `npm run *:status`)

**Not** `capabilities.json`: that name is taken at org level by
`swechha/ai/capabilities.json`, the capability *catalogue* whose `implemented_by`
paths `lib/skilltree.test.ts` asserts exist. Two files with one name meaning
different things is the confusion this estate can least afford.

New mechanisms built here are **registered** in that catalogue, with a real
`implemented_by` path — a capability whose implementation cannot be found is a
claim, not a capability.

So an agent can grant itself eyes and can never grant itself hands.

## 4. Phase 1 — see, act, remember

*Ships alone. Fixes both stated complaints.*

### 1.1 Fix the `-e` bug
`air-hourly.yml:177` → `npm run data:air:delhi || code=$?`.
Upstream outages become green, as the file has always claimed.

**Test:** a workflow-contract test asserting every exit code named in the
top-of-file state model maps to the concluded status it documents. This is the
generalisable defect — *documentation asserting behaviour no test enforces* —
and it is what poisoned the diagnosis.

### 1.2 Lessons write-back
`run.sh` extracts `## Lessons` from the Manager's report and appends it to
`docs/website-team/lessons.md`, deduplicated by heading, committed on a
`team/lessons-<date>` branch and merged through the existing
`merge-when-green.sh` gate. Deterministic — no model in the write path.

One file, not two. A second "agent lessons" file would be the parallel-list
failure class (vault: `swechha-parallel-list-failure-class`) this repo has hit
four times.

### 1.3 Evidence-or-escalate
- Grant `gh run view:*` and `gh run view --log-failed` via the tool-grant ledger.
- **Structural rule:** if a run's activity log contains a tool denial, `run.sh`
  stamps the record `BLOCKED — diagnosis withheld` and opens an escalated spine
  task. A cause the agent could not verify may not become the report's headline.

This is complaint (1) fixed as a mechanism, not as advice. The Manager already
said *"I could not confirm this from the actual log"* — the harness threw that
signal away.

### 1.4 Declare and wire the approval gate
Add `requires_approval_paths` to `policy.json` for every path-shaped rule in
`requires_approval`; move `.github/workflows/**` from `never_touch` into it.
`execute.sh` runs `approval-gate.py --policy … --paths $(git diff --name-only)`
after the gates: exit 1 means the PR opens, stays open, and auto-merge is skipped.
Semantic rules it cannot see are reported NOT MECHANICALLY ENFORCED by name, as
the script already does — a gate covering ten of fourteen rules while reading as
complete is worse than the prose it replaced.

### 1.5 Honest empty-diff reporting
`execute.sh` exits `4` on an empty diff; `run.sh` maps it to
`task refuse "no change made"`. Today it reports `shipped`, which is precisely
the "skipped while reporting success" failure the spine exists to end.

---

## 5. Phase 2 — it repairs itself

*Gated on phase 1 being green for a week.*

### 2.1 Probes move to Actions
`swechha-ai/sentinel/*.sh` run in a scheduled workflow in the public
`swechha-ai` repo: free minutes, 24/7, zero model calls. Probe contract
(`0` clear / `1` problem / `2` unknown) is unchanged.

### 2.2 The queue
A probe that trips opens a GitHub issue labelled `dept:website/queued`,
one per fingerprint. The Mac's sentinel drains open issues at next wake and
triggers `run.sh work`. Nothing is lost to a closed lid, nothing new is billed,
and the queue is human-visible.

### 2.3 Telemetry-driven mechanisms
`hook-event.py` extends `tool_failed` to record *denial vs error* and the
command's **verb only** (`gh run view`), never its arguments — prompts and model
output stay out of the event stream, per `swechha/ai/events.md`.

A deterministic reconciler reads `activity.jsonl`; a denial of the same verb in
**two distinct runs** becomes either a capability-ledger entry (read-only verb,
auto-applied under D2) or a `needs-owner` PR (anything else). No model in the
learning path, so learning cannot hallucinate.

### 2.4 Registry honesty
ADR-0005 makes `runs_when_mac_asleep` a **required and honest** registry field.
Today `departments.json` records `website: false`. Splitting the department into
two runtimes moves the property to the runtime, as ADR-0005 anticipates
("fundraising already is"). `departments.json` is updated in the same change, or
the registry lies.

### 2.5 Budget ceiling
Sum today's `cost_usd` from `activity.jsonl`. Above the ceiling, `run.sh`
refuses to start and escalates. **Proposed: $15/day** — roughly 3 delegating
runs. Adjust before implementation.

---

## 6. Phase 3 — situation pages publish themselves

*Gated on phase 2 producing a month of sound records. Unchanged from the
graduation proposal already on record.*

Detect → draft → build → **`noindex` staging route** → live on the next run
unless the owner objects. Intervention is a veto, not a prerequisite.

The fact gate does not move (§2). What becomes autonomous is the *mechanism*:
detection, assembly, build, publication, and repair when any of those break.

---

## 7. Failure modes

| Failure | Handling |
|---|---|
| Reconciler proposes a bad capability | Verb whitelist rejects non-read-only; the grant file cannot express a write |
| Lessons file grows unreadable | At 40 entries the Manager is briefed to consolidate; a padded lessons file stops being read |
| Queue issue storm | One issue per fingerprint, same dedupe the sentinel already uses |
| Actions and the Mac both act | The existing `worktree.sh` lock; the queue is drained transactionally |
| A `propose_only` PR sits forever | It is an open PR with a label — visible, and surfaced by `org status` under NEEDS YOU |
| Lessons PR's required check never runs (docs-only) | `merge-when-green.sh` already leaves it open for a human rather than merging on its own say-so; the lesson is still committed on the branch and is not lost |
| Budget ceiling hit mid-incident | Refuses and escalates loudly; a silent stop during an incident would be worse than the spend |

---

## 7a. Conformance with the organisation's OS

Verified 2026-09-12 against `Projects/ai-org/docs/` and
`swechha-vault/swechha/ai/`:

| Source | Bearing |
|---|---|
| `03-AI_OPERATING_SYSTEM.md:219` | *"each department's `lessons.md`, which the department may append and only a human may delete"* — §4.2 implements a **specified** behaviour the runtime never built. This is the instruction that was dropped. |
| ADR-0005 | *"A department may be two runtimes."* §5 is the sanctioned pattern, not a novelty. |
| ADR-0004 | Four bands by enforcement; three-band models rejected. §3.1 adopts the vocabulary; §9 carries the lock-removal test its consequences require. |
| `policy.schema.json` → `requires_approval_paths` | §3.2. Already built, already department-agnostic. Not re-authored. |
| ADR-0002 | Three levels, no orchestrator. The reconciler is a service called by a runner, not a layer above departments. |
| ADR-0003 | Task state is runner-written and status is derived. §4.5 corrects a runner that wrote the wrong outcome; it adds no state. |
| ADR-0006 | *"The spec travels; the executable does not."* This document is spec and lives in the repo; probes and gates stay in `vimlendu-maker/swechha-ai`. |
| `swechha/ai/capabilities.json` | Name collision avoided (§3.3); new mechanisms register there with real `implemented_by` paths. |

**No conflict found.** Three corrections were made *because* of this pass: the
invented `propose_only` tier was deleted in favour of the existing approval gate,
the band vocabulary was aligned to ADR-0004, and the grant file was renamed off a
collision.

## 8. Non-goals

Deliberately excluded: the dashboard, the research skill, the Design⇄Content
creative pair, cost-register reporting beyond the ceiling, extracting a reusable
Agent OS, and moving model calls to API billing. All are in §E of the gap
analysis; none touch either stated complaint.

---

## 9. Testing

Every mechanism gets a test, in the repo's existing `lib/*.test.ts` style:

- exit-code contract: documented state model matches concluded status
- capability ledger: a write verb is rejected; a read verb is accepted
- reconciler: one denial does nothing; two auto-apply or propose, correctly
- lessons append: dedupes by heading, appends otherwise
- `propose_only`: never auto-merges, even when every gate is green
- empty diff: reports `refused`, never `shipped`
- budget: refuses above ceiling
