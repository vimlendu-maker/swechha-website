import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error — a plain .mjs with no type declarations; this suite is the
// only consumer and the two exports it uses are asserted below.
import { targets, checkAll } from '../scripts/check-parse.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVERY COMMITTED SCRIPT PARSES.
 * ───────────────────────────────────────────────────────────────────────────
 * On 10 September 2026 `d8c468d3` committed the shell snippet that was meant to
 * APPLY a fix into the top of the file it was meant to edit. build-hero.mjs
 * line 1 became `cd ~/Desktop/swechha-website`. All four scheduled publishers
 * run `npm run build:all`, build:all runs build:hero, and nothing published for
 * eighteen hours.
 *
 * generated-current.yml already caught it — and could not prevent it, because
 * it runs after the push and takes three minutes to reach the finding. This
 * test is the same finding in under a second, in `npm test`, which is the step
 * generated-current.yml runs FIRST and which anyone can run before pushing.
 *
 * See scripts/check-parse.mjs for why the file list is derived rather than
 * written down, and why the exit code is read instead of the output.
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('every committed script parses', () => {
  it('finds the scripts to check, and finds a realistic number of them', () => {
    const files = targets() as string[]
    /* A guard against the gate quietly checking NOTHING — the failure mode
       vitest.config.ts's own comment describes for a narrowed include glob, and
       the one that makes a green suite meaningless. There were 100 on the day
       this was written; the floor is deliberately far below that, because this
       asserts "the discovery still works", not a file count somebody has to
       maintain. */
    expect(files.length).toBeGreaterThan(50)
    expect(files).toContain('scripts/build-hero.mjs')
    expect(files).toContain('scripts/build-all.sh')
  })

  it('parses every one of them', async () => {
    const failures = (await checkAll()) as Array<{ file: string; detail: string }>
    /* The message is the report: naming the files and Node's own caret output
       beats `expected 3 to be 0`, since the whole point is to say which file. */
    const report = failures.map((f) => `\n✗ ${f.file}\n${f.detail.replace(/^/gm, '    ')}`).join('\n')
    expect(failures.length, `${failures.length} tracked script(s) do not parse:\n${report}\n`).toBe(0)
  }, 30_000)

  it('FAILS when a script does not parse — verified against the real regression', async () => {
    /* ★ A gate nobody has watched fail is not known to work. This reproduces
       d8c468d3 exactly: the `cd ~/…` line that took the site down, prepended to
       a real module. It is written to a temporary file and removed again, so
       the test never depends on git history staying reachable and never leaves
       the tree dirty. */
    const tmp = join(ROOT, 'scripts', '.check-parse-fixture.mjs')
    try {
      writeFileSync(tmp, 'cd ~/Desktop/swechha-website\n\nexport const real = 1;\n')
      const failures = (await checkAll(['scripts/.check-parse-fixture.mjs'])) as Array<{
        file: string; detail: string
      }>
      expect(failures).toHaveLength(1)
      expect(failures[0].detail).toContain('SyntaxError')
    } finally {
      rmSync(tmp, { force: true })
    }
  })

  it('leaves the working tree untouched — it parses, it never executes', () => {
    /* `node --check` and `sh -n` parse only. If this ever regressed into
       importing the generators, running the suite would rewrite 30 pages and
       the diff below would be enormous. */
    const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' })
    const built = dirty.split('\n').filter((l) => l.includes('public/_pages/'))
    expect(built).toEqual([])
  })
})
