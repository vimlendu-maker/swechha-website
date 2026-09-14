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
