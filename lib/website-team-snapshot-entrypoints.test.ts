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

/**
 * A RUN CARRIES ITS OWN PID.
 *
 * `log-event.py` records `os.getpid()` — the pid of the short-lived python
 * process that writes the line — so every event carries a DIFFERENT pid and
 * none can be attributed to the run that produced it. org/sla.py's header
 * already names this: "across 23 run_started and 22 run_finished events the pid
 * sets overlap in ZERO places".
 *
 * ★ IT COST A DIAGNOSIS ON 2026-09-14. Two runs wrote to one launchd log and
 *   the evidence read as impossible: a death reported at stage `worktree` while
 *   the same log showed line 695 reached — 240 lines and three stage markers
 *   later, and past the `run_finished` at 635. Both are true of DIFFERENT
 *   processes; neither is true of one.
 */
describe('every run boundary names the process that produced it', () => {
  const RUN = readFileSync(join(DIR, 'run.sh'), 'utf8')

  it.each(['run_started', 'run_finished', 'run_failed'])(
    '%s carries run_pid', (event) => {
      const line = RUN.split('\n').find(
        (l) => l.trim().startsWith(`ev ${event} `) && !l.trim().startsWith('#'))
      expect(line, `${event} is no longer emitted`).toBeTruthy()
      expect(line).toContain('run_pid="$$"')
    })

  it('the pid is $$ — the runner, not a child', () => {
    /** $BASHPID or a subshell pid would name a process that is already gone. */
    const emissions = RUN.split('\n').filter((l) => l.includes('run_pid='))
    expect(emissions.length).toBeGreaterThanOrEqual(3)
    for (const l of emissions) expect(l).toMatch(/run_pid="\$\$"/)
  })
})

/**
 * WORK EVENTS NAME THE SPINE TASK THEY BELONG TO.
 *
 * `org doctor` reported this every day: the STUCK rule's false-positive rate is
 * NOT AVAILABLE, because no gap on a task the department actually WORKED could
 * be measured.
 *
 * ★ THE CAUSE WAS ONE MISSING FIELD. Every `task` value in the stream came from
 *   Claude Code's Agent hooks, where it is a subagent DESCRIPTION —
 *   'Copywriter: energy theme', 'Recover design findings' — never a spine id.
 *   execute.sh emitted task_started and task_returned with NO task field at
 *   all, while run.sh had claimed the task three lines before dispatching it.
 */
describe('work events name the spine task', () => {
  const RUN = readFileSync(join(DIR, 'run.sh'), 'utf8')
  const EXEC = readFileSync(join(DIR, 'execute.sh'), 'utf8')

  it('run.sh passes the claimed task id to execute.sh', () => {
    expect(RUN).toMatch(/TEAM_TASK_ID="\$\{TASK:-\}"\s+"\$LIB\/execute\.sh"/)
  })

  it('★ it travels by environment, never as a fourth positional', () => {
    /**
     * execute.sh takes <specialist> <model> <brief> positionally, and THIS CALL
     * already broke once when model routing was added and the brief path landed
     * in $MODEL. A named variable cannot be silently mis-ordered.
     */
    const call = RUN.split('\n').find((l) => l.includes('"$LIB/execute.sh"'))
    expect(call).toBeTruthy()
    const args = call!.slice(call!.indexOf('execute.sh"') + 11).trim()
    expect(args.split(/\s+/).filter(Boolean)).toHaveLength(3)
  })

  it.each(['task_started', 'task_returned', 'task_failed', 'task_refused'])(
    '%s carries the task field', (event) => {
      const line = EXEC.split('\n').find(
        (l) => l.trim().startsWith(`ev ${event} `) && !l.trim().startsWith('#'))
      expect(line, `${event} is no longer emitted`).toBeTruthy()
      expect(line).toContain('$TASK_FIELD')
    })

  it('★ an absent task id emits NO field rather than an empty one', () => {
    /**
     * `task=` with nothing after it joins to nothing while looking like a
     * value — the same shape as a zero that reads as "measured". A hand-run
     * execute.sh has no task and must say nothing.
     */
    expect(EXEC).toMatch(/TASK_FIELD=""/)
    expect(EXEC).toMatch(/\[ -n "\$\{TEAM_TASK_ID:-\}" \] && TASK_FIELD="task=\$TEAM_TASK_ID"/)
  })
})

/**
 * THE MODEL CALL IS NOT INSIDE A FUNCTION.
 *
 * ★ THE DEFECT THAT BROKE THE DEPARTMENT FOR A DAY. `spine_close()`'s closing
 *   brace was lost on 2026-09-13 at 21:52 (cb3086f9). Every line after it —
 *   the hooks probe, THE MODEL CALL, the parse, `TEXT=`, the denials check and
 *   `ev run_finished` — became part of the function body, 180 lines of it.
 *
 *   The main path therefore defined a large function and skipped straight to
 *   stage two, where `$TEXT` was unbound. The first stalled run was 22:22,
 *   THIRTY MINUTES LATER, and every run since produced no work.
 *
 *   It also explains the burst nobody could account for: `ev run_finished` was
 *   inside that body too, so a single `spine_close` call in stage two executed
 *   the whole block — which is why 22 terminal events landed in one second at
 *   23:41.
 *
 * ★ `bash -n` DOES NOT CATCH THIS. The file parses perfectly; a function may
 *   contain anything. Only the SHAPE is wrong, which is why this asserts sizes.
 */
describe('the runner\'s functions contain only their own bodies', () => {
  const RUN = readFileSync(join(DIR, 'run.sh'), 'utf8').split('\n')

  function bodyOf(name: string): number {
    const i = RUN.findIndex((l) => l.startsWith(`${name}() `))
    expect(i, `${name} is gone`).toBeGreaterThan(-1)
    const j = RUN.findIndex((l, n) => n > i && l === '}')
    expect(j, `${name} is never closed`).toBeGreaterThan(i)
    return j - i
  }

  it.each([
    ['spine_new', 40],
    ['spine_incident', 20],
    ['spine_close', 30],
    ['on_exit', 40],
  ])('%s is under %d lines', (name, max) => {
    expect(bodyOf(name)).toBeLessThan(max)
  })

  it('★ the model call is at the top level, not inside any function', () => {
    const call = RUN.findIndex((l) => l.startsWith('RESULT="$(claude -p'))
    expect(call, 'the model call is gone').toBeGreaterThan(-1)
    for (const fn of ['spine_new', 'spine_incident', 'spine_close', 'on_exit']) {
      const i = RUN.findIndex((l) => l.startsWith(`${fn}() `))
      const j = RUN.findIndex((l, n) => n > i && l === '}')
      expect(call > i && call < j,
        `the model call is inside ${fn}() — it will never run`).toBe(false)
    }
  })

  it('★ so is ev run_finished — a run must report at the top level', () => {
    const fin = RUN.findIndex((l) => l.startsWith('ev run_finished'))
    expect(fin).toBeGreaterThan(-1)
    const i = RUN.findIndex((l) => l.startsWith('spine_close() '))
    const j = RUN.findIndex((l, n) => n > i && l === '}')
    expect(fin > i && fin < j, 'run_finished fires only when spine_close is called').toBe(false)
  })
})
