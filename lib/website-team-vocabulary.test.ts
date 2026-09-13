import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * THE RATCHET COULD NOT RATCHET, AND IT IS A VOCABULARY PROBLEM.
 *
 * ADR-0011 clause 7 exists because of this exact pair:
 *
 *     denials.py       emits the first THREE words     'git log --oneline'
 *     tool-grants.py   matches TWO-word set entries    'git log'
 *
 * Two components, one vocabulary, nothing asserting they agree — which the ADR
 * names as "this estate's most repeated defect". Run against the live log on
 * 2026-09-13, the reconciler reported TWELVE standing gaps and granted NONE,
 * including ADR-0011's own worked example:
 *
 *     reconcile: NEEDS A HUMAN — 'git log --oneline' refused in 2 runs;
 *                not provably read-only
 *
 * ★ AND THE ADR SAYS WHAT THE TEST MUST BE: "a test asserting they agree ON
 *   REAL DATA TAKEN FROM THE LOG — not on invented ones. A synthetic test
 *   passes today; that is precisely why it is not enough."
 *
 *   So the last test here reads ~/.swechha-ai/activity.jsonl. It skips when the
 *   log is absent (CI has no estate) and says so rather than passing quietly.
 */
const TG = join(__dirname, '..', 'scripts', 'website-team', 'tool-grants.py')
const LOG = join(homedir(), '.swechha-ai', 'activity.jsonl')

const py = (code: string) =>
  execFileSync('python3', ['-c', code], { encoding: 'utf8' }).trim()

const canonical = (verb: string) =>
  py(`import importlib.util,sys
spec=importlib.util.spec_from_file_location("tg", ${JSON.stringify(TG)})
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
print(m.canonical(${JSON.stringify(verb)}) or "")`)

describe('one vocabulary, derived (ADR-0011 clause 7)', () => {
  it("reduces a refused verb to the grant that would have covered it", () => {
    // The defect, in one line. `git log` already grants `Bash(git log:*)`,
    // which covers --oneline — the grant was never the problem, the COMPARISON
    // was.
    expect(canonical('git log --oneline')).toBe('git log')
  })

  it('leaves a verb that is already canonical alone', () => {
    expect(canonical('git status')).toBe('git status')
  })

  it('refuses a verb with no read-only prefix', () => {
    expect(canonical('gh secret list')).toBe('')
    expect(canonical('node -e "')).toBe('')
    expect(canonical('rm -rf')).toBe('')
  })

  it('NEVER widens on a prefix that is merely a string prefix', () => {
    // `git logs-everything` must not reduce to `git log`. Word boundaries, not
    // substrings — the same lesson runs.py learned about matching repository
    // names inside paths.
    expect(canonical('git logs-everything')).toBe('')
  })

  it('grants only a string that is already in the read-only set', () => {
    // The safety property, and it is STRONGER than before: the value appended
    // to the ledger is never caller-supplied. It is an entry the gated
    // machinery itself declares.
    const out = py(`import importlib.util
spec=importlib.util.spec_from_file_location("tg", ${JSON.stringify(TG)})
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
c=m.canonical("git log --oneline")
print("IN_SET" if c in m.READ_ONLY else "NOT_IN_SET")`)
    expect(out).toBe('IN_SET')
  })

  it('an npm script keeps its own rule and is not prefix-reduced', () => {
    // `npm run test --watch` must NOT reduce to `npm run test`: the estate
    // already found that `Bash(npm run test:*)` matches `npm run test:watch`,
    // which is why npm grants are emitted bare.
    expect(canonical('npm run test --watch')).toBe('')
    expect(canonical('npm run verify:seo')).toBe('npm run verify:seo')
  })

  it('AGREES ON THE REAL LOG, not on invented strings', () => {
    if (!existsSync(LOG)) {
      // Never a silent pass. CI has no estate, and this test's whole value is
      // that it reads the one the machine actually wrote.
      console.warn('activity.jsonl absent — real-data assertion skipped')
      expect(true).toBe(true)
      return
    }
    const verbs = new Set<string>()
    for (const line of readFileSync(LOG, 'utf8').split('\n')) {
      if (!line.trim().startsWith('{')) continue
      let row: Record<string, unknown>
      try { row = JSON.parse(line) as Record<string, unknown> } catch { continue }
      const refused = row.refused
      if (typeof refused !== 'string') continue
      for (const v of refused.split(';')) if (v.trim()) verbs.add(v.trim())
    }
    // Every verb the log actually contains must either canonicalise to a
    // member of the read-only set, or to nothing. Never to a string the set
    // does not contain — that would be a grant nobody declared.
    for (const v of verbs) {
      const c = canonical(v)
      if (!c) continue
      const inSet = py(`import importlib.util
spec=importlib.util.spec_from_file_location("tg", ${JSON.stringify(TG)})
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
print("Y" if m.permitted(${JSON.stringify(c)}) else "N")`)
      expect(inSet, `canonical(${v}) = ${c} is not itself permitted`).toBe('Y')
    }
  })
})
