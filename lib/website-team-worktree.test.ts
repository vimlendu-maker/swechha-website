import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The department runs unattended, in its own git worktree, on a schedule. Four
 * things about that arrangement are load-bearing and all four are invisible
 * when broken — the run still appears to work and simply does the wrong thing
 * somewhere else. Each was a real defect on 2026-09-11:
 *
 *   1. The runners operated in ~/swechha-website, the human checkout. A
 *      concurrent session moved HEAD under them; two commits landed on a
 *      stranger's branch and recovery rewrote four of their commits.
 *   2. run.sh called execute.sh with two arguments where it takes three, so
 *      the brief path landed in $MODEL and every brief died on "unknown
 *      model" before a specialist started. Stage two shipped nothing, quietly.
 *   3. The lock recorded the pid of the process that took it, which exits
 *      immediately — so the holder was always dead, the staleness check always
 *      fired, and the lock excluded nothing while looking correct.
 *   4. Both launchd schedules fired at 09:00, so Mondays ran two sessions
 *      against one worktree simultaneously.
 *
 * Every read is INSIDE an it() block on purpose. A throw in a describe body
 * makes vitest report "no tests" for the whole file, which hides the failure
 * instead of showing it — a trap this repo has already paid for once.
 */

const root = join(__dirname, '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')

describe('website team: the scheduled run is isolated from the human checkout', () => {
  it('neither runner works inside $REPO — that is the human checkout', () => {
    for (const f of ['scripts/website-team/run.sh', 'scripts/website-team/execute.sh']) {
      const src = read(f)
      expect(src, `${f} must not cd into the main checkout`).not.toMatch(/^\s*cd "\$REPO"\s*$/m)
      expect(src, `${f} must cd into the worktree`).toMatch(/cd "\$WORK"/)
    }
  })

  it('execute.sh operates on the worktree it was handed, not a path of its own', () => {
    const src = read('scripts/website-team/execute.sh')
    expect(src).toMatch(/WORK="\$\("\$REPO\/scripts\/website-team\/worktree\.sh" ensure\)"/)
  })

  it('stage two passes all three arguments execute.sh requires', () => {
    const run = read('scripts/website-team/run.sh')
    // <specialist> <model> <brief>. Two of the three is a silent no-op.
    expect(run).toMatch(/execute\.sh" "\$spec" "\$model" "\$path"/)
    const exec = read('scripts/website-team/execute.sh')
    expect(exec).toMatch(/SPECIALIST="\$\{1:\?/)
    expect(exec).toMatch(/MODEL="\$\{2:\?/)
    expect(exec).toMatch(/BRIEF_FILE="\$\{3:\?/)
  })

  it('the lock records the caller’s pid, not the locking process’s own', () => {
    const src = read('scripts/website-team/worktree.sh')
    expect(src, 'writing $$ makes the holder always-dead and the lock useless')
      .not.toMatch(/echo "\$\$" > "\$LOCK\/pid"/)
    expect(src).toMatch(/echo "\$holder_pid" > "\$LOCK\/pid"/)
    expect(read('scripts/website-team/run.sh')).toMatch(/"\$WT" lock "\$\$"/)
  })

  it('a refresh keeps the symlinked node_modules instead of deleting 821M', () => {
    const src = read('scripts/website-team/worktree.sh')
    expect(src).toMatch(/clean -qxdf -e node_modules -e \.next/)
  })

  it('the worktree parks on a detached HEAD, because git refuses a shared branch', () => {
    const src = read('scripts/website-team/worktree.sh')
    expect(src).toMatch(/worktree add -q --detach/)
    expect(src).toMatch(/checkout -q --detach "\$BASE"/)
    // `git checkout -` depends on this worktree's reflog having a previous
    // entry, which a freshly created worktree does not reliably have.
    expect(read('scripts/website-team/execute.sh')).not.toMatch(/git checkout -q - ;/)
  })

  it('the two schedules do not fire in the same minute', () => {
    const at = (p: string) => {
      const xml = read(p)
      const hour = xml.match(/<key>Hour<\/key>\s*<integer>(\d+)<\/integer>/)
      const minute = xml.match(/<key>Minute<\/key>\s*<integer>(\d+)<\/integer>/)
      expect(hour, `${p} declares no Hour`).not.toBeNull()
      expect(minute, `${p} declares no Minute`).not.toBeNull()
      return `${hour![1]}:${minute![1]}`
    }
    const work = at('scripts/website-team/com.swechha.website-team-work.plist')
    const review = at('scripts/website-team/com.swechha.website-team-review.plist')
    expect(review, 'both at the same time means two runs share one worktree').not.toBe(work)
  })

  it('gate logs go to a per-run directory, not to fixed /tmp paths', () => {
    const src = read('scripts/website-team/execute.sh')
    // Comments legitimately mention the old paths to explain why they went;
    // assert on the code, or the explanation itself fails the test.
    const code = src
      .split('\n')
      .filter((l) => !/^\s*#/.test(l))
      .join('\n')
    // Fixed paths meant each run destroyed the previous run's only evidence.
    expect(code).not.toMatch(/\/tmp\/wt-/)
    expect(src).toMatch(/RUNLOG="\$\{WEBSITE_TEAM_LOGS:-/)
  })
})
