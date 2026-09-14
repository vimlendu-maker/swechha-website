import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * EVERY WAY IN MUST GO THROUGH THE SNAPSHOT.
 *
 * Bash reads a script incrementally by byte offset. Edit run.sh underneath a
 * running copy and execution resumes at a stale offset, landing anywhere —
 * which is why #171 ("a running script must not be edited underneath it")
 * introduced snapshot-run.sh.
 *
 * ★ THAT FIX WAS APPLIED TO THE CALL SITES SOMEBODY REMEMBERED. Two launchd
 *   jobs were routed through snapshot-run.sh; on-change.sh still did
 *
 *       exec "$REPO/scripts/website-team/run.sh" work
 *
 *   and it is the entry point that fires MOST OFTEN — WatchPaths on the vault's
 *   inbox files, so it triggers whenever somebody is writing to the vault,
 *   which is exactly when the repository is most likely to be mid-edit.
 *
 *   Measured 2026-09-13/14: run.sh was committed at 23:07, 23:23, 01:51 and
 *   02:04; runs left `run_started` with no terminal event at 22:22, 22:54,
 *   23:55, 00:25, 00:56 and 01:26. One died with "line 629: TEXT: unbound
 *   variable" — a variable assigned unconditionally a hundred lines above the
 *   line that could not see it.
 *
 * So this asserts the RULE rather than the one call site that was wrong: no
 * script here may exec or invoke run.sh directly. A fourth entry point added
 * later fails here instead of corrupting a run at 02:00.
 */
const DIR = join(__dirname, '..', 'scripts', 'website-team')

/** run.sh is the thing being protected; snapshot-run.sh is the protector. */
const EXEMPT = new Set(['run.sh', 'snapshot-run.sh'])

describe('every entry point reaches run.sh through the snapshot', () => {
  it('no script invokes run.sh directly', () => {
    const offenders: string[] = []
    for (const name of readdirSync(DIR)) {
      if (!name.endsWith('.sh') || EXEMPT.has(name)) continue
      const src = readFileSync(join(DIR, name), 'utf8')
      src.split('\n').forEach((line, i) => {
        if (line.trimStart().startsWith('#')) return
        // `.../run.sh` as a command, not as part of `snapshot-run.sh`.
        if (/(^|[^-\w])run\.sh(\s|"|$)/.test(line) && !line.includes('snapshot-run.sh')) {
          offenders.push(`${name}:${i + 1}: ${line.trim()}`)
        }
      })
    }
    expect(offenders, 'these reach run.sh without a snapshot').toEqual([])
  })

  it('on-change.sh — the most frequently fired entry point — uses the snapshot', () => {
    const src = readFileSync(join(DIR, 'on-change.sh'), 'utf8')
    expect(src).toMatch(/exec\s+"\$REPO\/scripts\/website-team\/snapshot-run\.sh"/)
  })

  it('snapshot-run.sh copies the whole directory, not just run.sh', () => {
    /** A snapshot of one file leaves every helper it calls editable mid-run. */
    const src = readFileSync(join(DIR, 'snapshot-run.sh'), 'utf8')
    expect(src).toMatch(/cp -R/)
    expect(src).toMatch(/exec "\$SNAP\/run\.sh"/)
  })
})

/**
 * A RUN CANNOT DIE SILENTLY.
 *
 * Six runs on 2026-09-13/14 emitted `run_started` and then nothing at all, and
 * sat in `org status` as STALLED for ten hours. Working out where even ONE of
 * them died meant reading byte offsets out of a temp directory.
 */
describe('the exit trap always reports how a run ended', () => {
  const RUN = readFileSync(join(DIR, 'run.sh'), 'utf8')
  const LINES = RUN.split('\n')

  /**
   * The trap body only — from the function header to its closing brace.
   * ★ Sliced by LINE, not by indexOf on the file: the first version searched
   *   for 'trap on_exit EXIT' and matched the COMMENT that quotes it, producing
   *   an empty slice and three assertions that "passed" on nothing. The same
   *   narrowing this repo's guard test needed twice.
   */
  const trapBody = (() => {
    const start = LINES.findIndex((l) => l.startsWith('on_exit() {'))
    const end = LINES.findIndex((l, i) => i > start && l === '}')
    expect(start, 'on_exit() is gone').toBeGreaterThan(-1)
    expect(end, 'on_exit() is not closed').toBeGreaterThan(start)
    return LINES.slice(start, end + 1)
  })()

  it('reports BEFORE unlocking, and the unlock cannot abort the report', () => {
    /**
     * ★ THE BUG THIS CAUGHT, IN THE FIX ITSELF. The first version ran
     *   `"$WT" unlock` first, unguarded. A trap body runs under the script's
     *   `set -e`, so a failing unlock aborted the trap before it could report —
     *   and the moment unlock is most likely to fail is a run that already
     *   broke, which is the only moment this trap matters.
     */
    const report = trapBody.findIndex((l) => l.includes('died_without_reporting') && !l.trim().startsWith('#'))
    const unlock = trapBody.findIndex((l) => l.includes('"$WT" unlock') && !l.trim().startsWith('#'))
    expect(report, 'the trap no longer reports a silent death').toBeGreaterThan(-1)
    expect(unlock, 'the trap no longer unlocks the worktree').toBeGreaterThan(-1)
    expect(report, 'the unlock runs before the report and can abort it').toBeLessThan(unlock)
    expect(trapBody.join('\n')).toMatch(/"\$WT" unlock \|\| true/)
  })

  it('captures $? before anything else can overwrite it', () => {
    const firstReal = trapBody.find(
      (l) => l.trim() && !l.trim().startsWith('#') && !l.includes('on_exit() {'))
    expect(firstReal?.trim()).toBe('_rc=$?')
  })

  it('every terminal event marks the run as having reported', () => {
    /** Otherwise a run that ended properly also emits a false death. */
    // ★ EXCLUDING THE TRAP'S OWN `ev run_failed`, which is the event that says
    //   the run never reported — marking it as "reported" would be a lie.
    const trapStart = LINES.findIndex((l) => l.startsWith('on_exit() {'))
    const trapEnd = LINES.findIndex((l, i) => i > trapStart && l === '}')
    const terminals = LINES
      .map((l, i) => ({ l, i }))
      .filter(({ l, i }) => /^\s*ev run_(finished|refused|failed)\b/.test(l)
        && !(i > trapStart && i < trapEnd))
    expect(terminals.length, 'run.sh emits no terminal events at all').toBeGreaterThan(0)
    for (const { l, i } of terminals) {
      expect(LINES[i + 1], `no ENDED=1 after: ${l.trim()}`).toMatch(/ENDED=1/)
    }
  })

  it('stage() is defined before the first stage call', () => {
    /**
     * ★ THE OTHER BUG THIS CAUGHT. The definitions were first placed beside the
     *   trap — two hundred lines BELOW the first `stage` call — so every run
     *   would have died on "stage: command not found" under `set -e`. A progress
     *   marker that kills the run it exists to explain is worse than none.
     */
    const defined = LINES.findIndex((l) => /^stage\(\) \{/.test(l))
    const firstCall = LINES.findIndex((l) => /^\s*stage [a-z][a-z-]*\s*$/.test(l))
    expect(defined, 'stage() is not defined').toBeGreaterThan(-1)
    expect(firstCall, 'nothing calls stage()').toBeGreaterThan(-1)
    expect(defined, 'stage() is defined after it is first called').toBeLessThan(firstCall)
  })
})
