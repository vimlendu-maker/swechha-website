import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * THE DAILY CEILING.
 *
 * The sentinel wakes the department whenever the PROBLEM SET CHANGES, not on a
 * timer — so a service flapping through the night changes it on every flap. On
 * 2026-09-12 an unscheduled 00:24 wake cost $1.37. That is correct behaviour,
 * and it is exactly the shape that becomes a bill nobody chose once self-repair
 * adds runs on top.
 *
 * Measured 2026-09-11: $0.80 observing, $4.67 delegating. Three delegating runs
 * is a busy day. Ten is a loop.
 */
const SCRIPT = join(__dirname, '..', 'scripts', 'website-team', 'budget.py')
const ROOT = join(__dirname, '..')

const withLog = (lines: string[]) => {
  const dir = mkdtempSync(join(tmpdir(), 'budget-'))
  const f = join(dir, 'activity.jsonl')
  writeFileSync(f, lines.join('\n') + '\n')
  return f
}
const today = new Date()
const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const row = (ts: string, cost?: number) =>
  JSON.stringify({ ts, department: 'website', event: 'run_finished', ...(cost === undefined ? {} : { cost_usd: cost }) })
const read = (f: string) => Number(execFileSync('python3', [SCRIPT, '--log', f], { encoding: 'utf8' }).trim())

describe('budget', () => {
  it('sums what was actually spent today', () => {
    expect(read(withLog([row(`${stamp}T09:00:00+0530`, 0.8), row(`${stamp}T14:00:00+0530`, 4.67)]))).toBeCloseTo(5.47, 3)
  })

  /** The ceiling is a day in the owner's life, not a UTC window. */
  it('ignores other days', () => {
    expect(read(withLog([row('2020-01-01T09:00:00+0530', 99), row(`${stamp}T09:00:00+0530`, 1)]))).toBeCloseTo(1, 3)
  })

  /** A fresh install has no log and must still be able to run. */
  it('treats a missing log as nothing spent', () => {
    expect(read('/nonexistent/activity.jsonl')).toBe(0)
  })

  /**
   * The log is append-only from several processes. A torn write must not stop
   * the department — but it must not read as licence to spend either: what
   * parses is still counted.
   */
  it('skips a torn line and still counts the rest', () => {
    expect(read(withLog([row(`${stamp}T09:00:00+0530`, 2), '{"ts": "trunc', row(`${stamp}T10:00:00+0530`, 3)]))).toBeCloseTo(5, 3)
  })

  it('invents no figure for a run that reported none', () => {
    expect(read(withLog([row(`${stamp}T09:00:00+0530`), row(`${stamp}T10:00:00+0530`, 1.5)]))).toBeCloseTo(1.5, 3)
  })

  /**
   * ★ THIS TEST DEMANDED A CEILING THE OWNER HAD DELIBERATELY REMOVED.
   *
   * On 2026-09-12 the owner deleted `daily_ceiling_usd` in full knowledge of
   * what it was for, and policy.json records the reasoning at length --
   * including "Do not reinstate a number". The test went on asserting
   * `typeof ... === 'number'` and turned that decision into a red suite, on
   * main and on the deployed branch both. A test that contradicts an explicit
   * owner decision is not a guard; it is a request to undo the decision, filed
   * where nobody reads it.
   *
   * What is still worth holding is the part the removal did NOT change: the
   * ceiling, present or absent, lives where the department cannot write it.
   */
  it('whatever the ceiling is, the department may not write it', () => {
    const policy = JSON.parse(readFileSync(join(ROOT, 'docs/website-team/policy.json'), 'utf8'))
    const ceiling = policy.cost?.daily_ceiling_usd
    expect(ceiling === undefined || typeof ceiling === 'number').toBe(true)
    // An agent that can raise its own ceiling has no ceiling -- and an agent
    // that can ADD one back to a file the owner emptied is the same problem
    // wearing a different hat.
    const guard = readFileSync(join(ROOT, 'scripts/website-team/guard-paths.sh'), 'utf8')
    expect(guard).toContain('docs/website-team/policy.json')
  })

  it('the absence of a ceiling is deliberate and says so in the file', () => {
    // So that a future reader -- or a future agent -- cannot mistake the empty
    // key for an oversight and helpfully restore it.
    const raw = readFileSync(join(ROOT, 'docs/website-team/policy.json'), 'utf8')
    const policy = JSON.parse(raw)
    if (policy.cost?.daily_ceiling_usd === undefined) {
      expect(raw).toMatch(/THERE IS NO DAILY CEILING/)
    }
  })

  it('run.sh checks the ceiling BEFORE it calls the model', () => {
    // A refusal that costs a dollar to discover is not a refusal.
    const s = readFileSync(join(ROOT, 'scripts/website-team/run.sh'), 'utf8')
    expect(s.indexOf('budget.py')).toBeGreaterThan(-1)
    expect(s.indexOf('budget.py')).toBeLessThan(s.indexOf('RESULT="$(claude -p'))
    // And it must say so rather than going quiet: a silent stop mid-incident
    // turns a cost control into an outage.
    expect(s).toMatch(/REFUSED — today's spend/)
    expect(s).toMatch(/task escalate/)
  })
})
