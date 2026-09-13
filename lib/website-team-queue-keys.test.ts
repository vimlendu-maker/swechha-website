import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE QUEUE STOPS GROWING.
 *
 * `OS_MIGRATION_READINESS.md` blocker 2, measured twice:
 *
 *   2026-09-12  13 needs_human tasks, 10 of them duplicates of two messages,
 *               0 acted on, none on any ladder.
 *   2026-09-13  24, all undated, after a day spent on everything else.
 *
 * Every one of them was filed from run.sh. The spine now folds a repeat into
 * the live task it repeats — but only when it can tell two filings are the same
 * condition, and it cannot tell that from these titles:
 *
 *   BLOCKED: the work run was refused 5 tool(s)
 *   BLOCKED: the work run was refused 17 tool(s)
 *
 * One standing fact, a varying parameter, two different strings. THIS runner
 * knows they are one condition. The spine must not guess it — a near-match rule
 * would eventually fold "section 3" into "section 4" — so the caller declares it
 * with --key.
 *
 * These assertions are about run.sh's TEXT rather than its behaviour, and that
 * is a deliberate limit: the filing path needs a live `org` binary, a registry
 * and a task root. What can be checked cheaply and every run is that the keys
 * are still being passed — which is the thing that would silently regress when
 * somebody edits the title.
 */
const RUN = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'run.sh'), 'utf8')

describe('the auto-filed BLOCKED tasks declare their recurring condition', () => {
  it('keys the refused-tools filing, whose title carries a varying count', () => {
    const line = RUN.split('\n').find((l) => l.includes('BLOCKED: the $MODE run was refused'))
    expect(line, 'the refused-tools filing disappeared').toBeTruthy()
    expect(line).toContain('run-refused-tools:$MODE')
  })

  it('keys the cost-ceiling filing, whose title carries a varying amount', () => {
    const lines = RUN.split('\n')
    const i = lines.findIndex((l) => l.includes('BLOCKED: daily cost ceiling reached'))
    expect(i, 'the cost-ceiling filing disappeared').toBeGreaterThan(-1)
    // The key is set into KEYARG on the preceding lines rather than inline,
    // because it is conditional on the installed spine understanding --key.
    const block = lines.slice(Math.max(0, i - 4), i + 1).join('\n')
    expect(block).toContain('daily-cost-ceiling')
    expect(block).toContain('KEYARG')
  })

  it('separates work and review, because they are different conditions', () => {
    // `run-refused-tools:$MODE` and not a bare constant: the work run and the
    // weekly review being blocked are two facts about two different jobs, and
    // one key would hide whichever was filed second.
    expect(RUN).toContain('run-refused-tools:$MODE')
  })

  it('passes no key when the title is already the whole identity', () => {
    // Stage two files a brief by its own title. Those are distinct pieces of
    // work that happen to be filed by a machine, and folding two briefs with the
    // same title would lose one. spine_new's second argument is optional and
    // this call site deliberately omits it.
    const line = RUN.split('\n').find((l) => l.includes('TASK="$(spine_new "$TITLE")"'))
    expect(line, 'the brief filing should pass a title and no key').toBeTruthy()
  })

  it('degrades to the old behaviour against a spine without --key', () => {
    // A `--key` an older spine does not know is an argparse ERROR, not an
    // ignored flag, and run.sh swallows failures into "no task filed". So the
    // flag is probed before it is used: a stale spine keeps filing duplicates,
    // which is worse than today and far better than filing nothing at all.
    // Probed ONCE into ORG_HAS_KEY rather than on every filing: --help is cheap
    // but not free, and the installed spine cannot change mid-run. It is also
    // `|| true` guarded, because lib/website-team-spine.test.ts requires every
    // line touching $ORG to swallow its own failure -- that test caught the
    // first version of this probe, correctly.
    expect(RUN).toContain('task new --help')
    expect(RUN).toContain('ORG_HAS_KEY')
    expect(RUN).toMatch(/ORG_HAS_KEY=.*\|\| true/)
  })
})
