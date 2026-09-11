# Sentinel probes

One file per domain. **Do not add a check to `sentinel.sh` itself** — it is an
orchestrator and must stay one screen long. The owner's instruction, 2026-09-11:
don't let this become a 3,000-line script with Vercel, Neon, APIs, climate, SEO
and GitHub all inside it.

## The contract every probe obeys

A probe is an executable file in this directory. The orchestrator runs each one
and reads only two things:

| Exit code | Meaning |
|---|---|
| `0` | all clear — say nothing |
| `1` | a problem — **stdout is the one-line description** |
| `2` | the probe could not determine an answer (no credential, host unreachable) |

**Exit 2 is not a pass and not a failure.** It is UNKNOWN, and it is reported as
UNKNOWN rather than swallowed, on the same rule the infrastructure inventory
follows: a metric that cannot be obtained is never presented as healthy.

**★ A probe contains no model call.** Ever. That is what makes the monitoring
layer free to run as often as we like, and it is why the expensive judgement is
invoked only when a probe trips. A probe that needs an LLM to decide is not a
probe — it is a job for the manager.

Keep each one fast (a few seconds), cheap (cache or use a free endpoint), and
quiet (one line of output, not a report).

## Adding one

1. Write `scripts/website-team/sentinel/<domain>-health.sh`, `chmod +x`.
2. Exit 0/1/2 per the table. Print one line on 1 or 2.
3. That is all — the orchestrator discovers it. There is no list to update,
   deliberately: a hand-maintained list that must move in lockstep with a
   directory is this repository's most repeated defect.
