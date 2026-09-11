import { describe, it, expect } from 'vitest'
import { readFileSync, mkdtempSync, writeFileSync, chmodSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * THE TASK SPINE'S CONTRACT WITH THIS RUNNER.
 *
 * Stage two's briefs are mktemp files destroyed at the end of the run, so every
 * delegation this department has made has left no durable trace of what was asked
 * or whether it shipped. run.sh now records the title and the outcome of each
 * brief as a task.
 *
 * Two of the three things below are safety properties, not features:
 *
 *  - THE BRIEF BODY MUST NEVER LEAVE THE RUN. A brief is a prompt, and
 *    `swechha/ai/events.md` excludes prompts and model output from the event
 *    stream because it is plain text a renderer reads. Only the title goes out.
 *
 *  - BOOKKEEPING MUST NEVER BREAK THE RUN. The `org` CLI lives in a separate
 *    repository and may simply be absent — on CI it always is. With it missing
 *    the runner must behave exactly as it did before.
 *
 * The helper block is extracted from the real run.sh and executed with a STUB
 * `org` that records its argv, so these assert on behaviour rather than on source
 * text — a script can read well and still pass the wrong argument.
 */

const ROOT = join(__dirname, '..')
const RUN_SH = join(ROOT, 'scripts/website-team/run.sh')

/** The helper block as it actually appears in run.sh, between ORG= and stage two. */
function helperBlock(): string {
  const src = readFileSync(RUN_SH, 'utf8').split('\n')
  const start = src.findIndex((l) => l.startsWith('ORG="${ORG_CLI'))
  const end = src.findIndex((l) => l.startsWith('if [ "$MODE" = "work" ]'))
  expect(start, 'run.sh no longer defines ORG=${ORG_CLI...}').toBeGreaterThan(-1)
  expect(end, 'run.sh no longer has a stage two').toBeGreaterThan(start)
  return src.slice(start, end).join('\n')
}

/**
 * Run the helpers with a stubbed `org`, and return every argv it was called with.
 * `orgPath: null` simulates the spine not being installed at all.
 */
function callHelpers(script: string, opts: { installed: boolean }): { argv: string[][]; status: number } {
  const dir = mkdtempSync(join(tmpdir(), 'spine-'))
  const log = join(dir, 'argv.log')
  const stub = join(dir, 'org')

  if (opts.installed) {
    writeFileSync(
      stub,
      '#!/usr/bin/env bash\nprintf "%s\\n" "$*" >> "' + log + '"\n' +
        // `task new` prints the id its caller captures.
        'if [ "$1 $2" = "task new" ]; then echo "website-19700101-0001"; fi\nexit 0\n',
    )
    chmodSync(stub, 0o755)
  }

  const runner = join(dir, 'run.sh')
  writeFileSync(runner, `#!/usr/bin/env bash\nset -euo pipefail\n${helperBlock()}\n${script}\n`)
  chmodSync(runner, 0o755)

  let status = 0
  try {
    execFileSync('bash', [runner], {
      env: { ...process.env, ORG_CLI: opts.installed ? stub : join(dir, 'absent') },
      encoding: 'utf8',
    })
  } catch (e) {
    // execFileSync throws on a non-zero exit and carries the code on `status`.
    // Narrowed rather than `any`: the lint gate rejects an explicit any, and this
    // is the one field the test actually reads.
    status = (e as { status?: number }).status ?? 1
  }
  const argv = existsSync(log)
    ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map((l) => l.split(' '))
    : []
  return { argv, status }
}

describe('run.sh ↔ the task spine', () => {
  it('sends the brief TITLE and never the brief BODY', () => {
    const { argv } = callHelpers(
      'T="$(spine_new "fix(a11y): the skip link")"\n' +
        'spine_close "$T" done "shipped"\n',
      { installed: true },
    )
    const flat = argv.map((a) => a.join(' ')).join('\n')
    expect(flat).toContain('fix(a11y): the skip link')
    // The body of a brief is a prompt. Nothing that is not the title may go out.
    expect(flat).not.toMatch(/SECRET|body text/i)
    expect(flat).toContain('task new website')
    expect(flat).toContain('task done website-19700101-0001')
  })

  it('a brief that did not ship is escalated, so it stays visible', () => {
    // The structural answer to a task being skipped 682 times while reporting success.
    const { argv } = callHelpers(
      'spine_close "website-19700101-0001" escalate "execute.sh did not ship it"\n',
      { installed: true },
    )
    expect(argv.map((a) => a.join(' ')).join('\n')).toContain('task escalate')
  })

  it('a read-only specialist is CLOSED, not escalated', () => {
    // A "needs you" queue full of routine skips is one nobody reads.
    const { argv } = callHelpers(
      'spine_close "website-19700101-0001" refused "read-only specialist"\n',
      { installed: true },
    )
    const flat = argv.map((a) => a.join(' ')).join('\n')
    expect(flat).toContain('task refuse')
    expect(flat).not.toContain('task escalate')
  })

  /**
   * AN EMPTY DIFF IS A RESULT, AND IT IS NOT `shipped`.
   *
   * execute.sh returned 0 when a specialist changed nothing, and run.sh maps 0
   * to `done: shipped`. So on 2026-09-11 the air investigation -- which could
   * not read the workflow log, correctly changed nothing, and said so -- was
   * recorded as shipped. A task system reporting success for work that did not
   * happen is precisely the failure the spine was built to end, reappearing
   * inside the spine itself. execute.sh now exits 4 and run.sh reads it.
   */
  it('a specialist that changed nothing is refused, never shipped', () => {
    const { argv } = callHelpers(
      'spine_close "website-19700101-0001" refused "the specialist changed nothing and said why"\n',
      { installed: true },
    )
    const flat = argv.map((a) => a.join(' ')).join('\n')
    expect(flat).toContain('task refuse')
    expect(flat).not.toContain('task done')
  })

  it('stage two distinguishes shipped, refused and escalated by exit status', () => {
    // Reads the runner itself: the three-way case must not collapse back into
    // an if/else, which is what recorded an undone brief as done.
    const runner = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'run.sh'), 'utf8')
    expect(runner).toMatch(/exec_rc=\$\?/)
    expect(runner).toMatch(/4\)\s*echo[\s\S]*?spine_close "\$TASK" refused/)
    expect(runner).toMatch(/0\)\s*spine_close "\$TASK" done "shipped"/)
    // And execute.sh must actually produce a 4.
    const exec = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'execute.sh'), 'utf8')
    expect(exec).toMatch(/no changes made[\s\S]*?exit 4/)
  })

  it('does nothing, and does not fail, when the spine is not installed', () => {
    // The org CLI lives in a separate repository. On CI it is always absent.
    const { argv, status } = callHelpers(
      'T="$(spine_new "a title")"\n' +
        '[ -z "$T" ] || { echo "expected no task id"; exit 3; }\n' +
        'spine_close "$T" done "shipped"\n' +
        'spine_close "" escalate "no id"\n',
      { installed: false },
    )
    expect(status).toBe(0)
    expect(argv).toEqual([])
  })

  it('every spine invocation in run.sh swallows its own failure', () => {
    // Scans the WHOLE runner, not just the helpers: stage two calls `org task
    // claim` directly, and run.sh is `set -euo pipefail`, so one unguarded call
    // would abort the department's run over a bookkeeping error.
    const src = readFileSync(RUN_SH, 'utf8')
    const calls = src.split('\n').filter((l) => /"\$ORG" task/.test(l))
    expect(calls.length, 'run.sh no longer calls the spine at all').toBeGreaterThan(0)
    for (const line of calls) {
      expect(line, `unguarded spine call: ${line.trim()}`).toMatch(/\|\| true/)
    }
    // Both helpers must refuse early when the CLI is missing.
    expect((helperBlock().match(/\[ -x "\$ORG" \] \|\| return 0/g) || []).length).toBe(2)
  })
})
