import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync, writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * THE MANAGER MUST BE TOLD WHAT IT ALREADY FILED.
 *
 * It re-derives its work from the site on every run and had never been shown
 * the task queue, so it observed the same unstyled CSS four mornings running
 * and wrote four differently-worded briefs for it — four tasks for ONE bug, and
 * four of the six `fix(teach)` items that sat in NEEDS YOU until a human read
 * them side by side on 2026-09-14 and found every one obsolete.
 *
 * ★ THE SPINE CANNOT FIX THIS AND DELIBERATELY DOES NOT TRY. A near-match rule
 *   "would eventually fold 'section 3' into 'section 4'". Only the manager
 *   knows whether today's observation is yesterday's task.
 */
const DIR = join(__dirname, '..', 'scripts', 'website-team')
const SCRIPT = join(DIR, 'open-tasks.py')
const RUN = readFileSync(join(DIR, 'run.sh'), 'utf8')

function withOrg(stub: string | null): string {
  const dir = mkdtempSync(join(tmpdir(), 'opentasks-'))
  const env: NodeJS.ProcessEnv = { ...process.env }
  if (stub === null) {
    env.ORG_CLI = join(dir, 'absent')
  } else {
    const p = join(dir, 'org')
    writeFileSync(p, stub)
    chmodSync(p, 0o755)
    env.ORG_CLI = p
  }
  return execFileSync('python3', [SCRIPT, 'website'], { env, encoding: 'utf8' })
}

describe('the already-open block', () => {
  it('lists open tasks and tells the manager not to re-file them', () => {
    const out = withOrg(
      '#!/usr/bin/env bash\ncat <<J\n[{"id":"website-1","title":"the Next band has no CSS",' +
        '"_age_days":2,"_needs_human":true,"created":"2026-09-12","_terminal":false}]\nJ\n')
    expect(out).toContain('website-1')
    expect(out).toContain('the Next band has no CSS')
    expect(out).toMatch(/DO NOT file a brief/i)
  })

  it('★ an unreachable spine says UNKNOWN, never nothing', () => {
    /**
     * A silent empty list reads as "nothing is open" — which is exactly the
     * reading that licenses the duplicate this block exists to prevent.
     */
    const out = withOrg(null)
    expect(out).toMatch(/UNKNOWN/)
    expect(out.trim()).not.toBe('')
  })

  it('★ a broken spine also says UNKNOWN rather than an empty list', () => {
    const out = withOrg('#!/usr/bin/env bash\necho "not json"\nexit 0\n')
    expect(out).toMatch(/UNKNOWN/)
  })

  it('says so plainly when the queue really is empty', () => {
    const out = withOrg('#!/usr/bin/env bash\necho "[]"\n')
    expect(out).toMatch(/nothing/i)
    expect(out).not.toMatch(/UNKNOWN/)
  })

  it('excludes terminal tasks — a closed task is not a reason to skip work', () => {
    const out = withOrg(
      '#!/usr/bin/env bash\ncat <<J\n[{"id":"done-1","title":"already closed","_terminal":true}]\nJ\n')
    expect(out).not.toContain('done-1')
    expect(out).toMatch(/nothing/i)
  })

  it('both prompts carry the queue and the do-not-refile rule', () => {
    /** review and work — a duplicate filed from either is the same duplicate. */
    expect(RUN.split('$OPEN_TASKS').length - 1).toBeGreaterThanOrEqual(3)
    expect(RUN.split('## Resolved').length - 1).toBe(2)
  })

  it('the runner survives a spine that cannot be read', () => {
    /** A runner must not die because telemetry is unavailable. */
    expect(RUN).toMatch(/open-tasks\.py[^\n]*\|\| true/)
    expect(RUN).toMatch(/\[ -n "\$OPEN_TASKS" \] \|\| OPEN_TASKS=/)
  })

  it('the manager is told it may not close a task itself', () => {
    expect(RUN).toMatch(/cannot close it and\s*\n?\s*must not try/)
  })
})
