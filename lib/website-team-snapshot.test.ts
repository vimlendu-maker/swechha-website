import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * A RUNNING SCRIPT MUST NOT BE EDITED UNDERNEATH IT.
 *
 * Bash reads a script incrementally, from a byte offset. Edit the file while it
 * is executing and the shell resumes at that offset in the NEW contents —
 * mid-statement, mid-function, anywhere. It does not reload and it does not
 * notice. The symptom is nonsense: a variable that cannot be unset reported as
 * unbound, at a line that never ran.
 *
 * Measured 2026-09-13:
 *
 *     22:22:16  run_started                        launchd begins run.sh
 *     22:24:24  git checkout main -> fix/lint-…    a person, in the same repo
 *     …         run.sh: line 508: TEXT: unbound variable
 *
 * The run died leaving only `run_started` in the log — as did 17:16 and 19:18.
 * Every one was an ordinary `git checkout` while a scheduled run was in flight.
 *
 * execute.sh already staged ITS helpers into a temp directory for exactly this
 * reason. The runner that stages its helpers was itself unstaged.
 */
const SNAP = join(__dirname, '..', 'scripts', 'website-team', 'snapshot-run.sh')
const RUN = join(__dirname, '..', 'scripts', 'website-team', 'run.sh')

describe('snapshot-run.sh', () => {
  it('copies the scripts and execs the copy, not the source', () => {
    const src = readFileSync(SNAP, 'utf8')
    expect(src).toMatch(/cp -R/)
    expect(src).toMatch(/exec "\$SNAP\/run\.sh"/)
  })

  it('stays tiny, because it is the one file still read from the live tree', () => {
    // Every line here widens the window in which an edit can corrupt IT.
    // Logic belongs in run.sh, which by then is a copy nobody is editing.
    const lines = readFileSync(SNAP, 'utf8').split('\n')
      .filter((l) => l.trim() && !l.trim().startsWith('#'))
    expect(lines.length, `snapshot-run.sh has grown to ${lines.length} code lines`)
      .toBeLessThan(20)
  })

  it('leaves worktree.sh with the DEPARTMENT, which is the harder call', () => {
    // I changed this to $LIB so it would travel with the snapshot, and
    // lib/website-team-inbox.test.ts refused it: "the department supplies its
    // own worktree script". One runner serves two departments, and
    // fundraising's worktree.sh lives in its own repo — taking it from the
    // website snapshot would hand fundraising the wrong tree management.
    //
    // The residual risk is accepted: worktree.sh is invoked as a SUBPROCESS,
    // so each call reads a whole consistent file. That is nothing like bash
    // resuming mid-statement in a rewritten script.
    expect(readFileSync(RUN, 'utf8'))
      .toMatch(/^WT="\$REPO\/scripts\/\$DEPARTMENT-team\/worktree\.sh"/m)
  })

  it('a snapshot is genuinely immune to an edit of the source', () => {
    const src = mkdtempSync(join(tmpdir(), 'src-'))
    writeFileSync(join(src, 'run.sh'), 'original\n')
    const snap = mkdtempSync(join(tmpdir(), 'snap-'))
    execFileSync('cp', ['-R', `${src}/.`, `${snap}/`])
    writeFileSync(join(src, 'run.sh'), 'REWRITTEN\n')
    expect(readFileSync(join(snap, 'run.sh'), 'utf8')).toBe('original\n')
    expect(readFileSync(join(src, 'run.sh'), 'utf8')).toBe('REWRITTEN\n')
  })

  it('does not trap EXIT to clean up, because exec would never fire it', () => {
    // A trap set before `exec` is discarded with the shell it belonged to.
    // Writing one would look like cleanup and do nothing — worse than none.
    const src = readFileSync(SNAP, 'utf8')
    expect(src).not.toMatch(/trap .* EXIT/)
    expect(src).toMatch(/exec /)
  })
})
