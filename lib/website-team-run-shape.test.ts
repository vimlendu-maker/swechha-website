import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE FILE PARSED PERFECTLY AND THE SHAPE WAS WRONG, AND IT COST A DAY.
 *
 * On 2026-09-13 at 21:52, commit cb3086f9 lost the closing `}` of
 * `spine_close()`. Bash did not care: the next function definition closed it, so
 * 180 lines — the hooks probe, THE MODEL CALL, `TEXT=`, and `ev run_finished` —
 * silently became the body of a function almost nothing called. `bash -n`
 * reported the file clean, because it IS syntactically clean.
 *
 * The department stopped working thirty minutes later. Seven consecutive runs
 * started and none reported: `run_started` fired, the model was never reached,
 * and the reporting that would have said so had moved inside the same uncalled
 * function. `org status` showed seven STALLED runs and no cause, and at 23:41 a
 * single `spine_close` call executed the whole swallowed block at once — 22
 * terminal events in one second.
 *
 * ★ FIVE EXISTING TESTS PASSED THROUGHOUT, AND THAT IS THE POINT OF THIS FILE.
 *   Their harness extracted and ran the swallowed block directly, where it
 *   behaved correctly — it was inert only because nothing called the function it
 *   had fallen into. Every test of what the code DOES was satisfied. Nothing
 *   asserted where the code LIVES.
 *
 * So this asserts the shape, mechanically, and nothing else.
 */

const RUN_SH = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'run.sh'), 'utf8')

/** The lines of a shell function, found by brace depth from its definition. */
function functionBody(src: string, name: string): string[] {
  const lines = src.split('\n')
  const start = lines.findIndex((l) => new RegExp(`^\\s*${name}\\s*\\(\\)`).test(l))
  if (start < 0) throw new Error(`${name}() is not defined in run.sh`)
  let depth = 0
  for (let i = start; i < lines.length; i++) {
    depth += (lines[i].match(/\{/g) || []).length
    depth -= (lines[i].match(/\}/g) || []).length
    if (depth === 0 && i > start) return lines.slice(start, i + 1)
  }
  throw new Error(`${name}() is never closed — the brace bug of 2026-09-13 is back`)
}

describe('run.sh keeps its shape', () => {
  it('closes spine_close() at all', () => {
    expect(() => functionBody(RUN_SH, 'spine_close')).not.toThrow()
  })

  it('does not let spine_close() swallow the run', () => {
    // 14 lines when this was written. The bound is generous but FINITE: the
    // failure mode is a function growing by 180 lines, not by 3.
    expect(functionBody(RUN_SH, 'spine_close').length).toBeLessThan(40)
  })

  it.each([
    ['the model call', /claude -p/],
    ['the model output', /^RESULT=/m],
    ['the run-finished report', /ev run_finished/],
    ['the hooks-health probe', /hooks-health/],
  ])('keeps %s OUT of spine_close()', (_what, pattern) => {
    expect(functionBody(RUN_SH, 'spine_close').join('\n')).not.toMatch(pattern)
  })

  it('still calls the model from the TOP LEVEL, not from inside anything', () => {
    // ★ THE ASSERTION IS THE INDENTATION, AND THAT IS NOT A STYLE RULE HERE.
    //   The defect was a top-level statement becoming a function body without
    //   moving a single character. Every top-level statement in run.sh sits at
    //   column 0; everything inside a function is indented. So an unindented
    //   `RESULT="$(claude -p` is the one cheap, mechanical witness that the
    //   model call has not fallen into a function again.
    const topLevel = RUN_SH.split('\n').filter((l) => /^RESULT="\$\(claude -p/.test(l))
    expect(topLevel).toHaveLength(1)
  })
})
