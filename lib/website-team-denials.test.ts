import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A CAUSE THE AGENT COULD NOT VERIFY MUST NOT BECOME THE HEADLINE.
 *
 * `claude -p --output-format json` returns `permission_denials`, naming every
 * tool call `dontAsk` refused and its input. The runner had it from the start
 * and discarded it.
 *
 * 2026-09-11 is what that cost. The Manager reported a red air-pipeline run as
 * a push race; it was upstream silence, and it could not have known, because
 * both `gh run view --log-failed` calls were refused. It wrote one honest line
 * — "I could not confirm this from the actual log" — under a confident heading,
 * and the owner read the heading. Run against that session's real output, this
 * extractor finds the specialist was refused EIGHT different routes to the same
 * evidence: gh, curl, node fetch, git -C.
 */
const SCRIPT = join(__dirname, '..', 'scripts', 'website-team', 'denials.py')
const run = (obj: unknown) =>
  execFileSync('python3', [SCRIPT], { input: JSON.stringify(obj), encoding: 'utf8' })
    .trim().split('\n').filter(Boolean).map((l) => l.split('\t'))

const withDenials = (d: unknown[]) => ({ result: 'text', permission_denials: d })
const bash = (command: string) => ({ tool_name: 'Bash', tool_input: { command } })

describe('denials', () => {
  it('reports a refused command and how often it was tried', () => {
    expect(run(withDenials([bash('gh run view 1 --log-failed'), bash('gh run view 2 --log-failed')])))
      .toEqual([['gh run view', '2']])
  })

  it('is silent when nothing was refused', () => {
    expect(run({ result: 'text', permission_denials: [] })).toEqual([])
  })

  it('names non-Bash tools by tool', () => {
    expect(run(withDenials([{ tool_name: 'WebFetch', tool_input: { url: 'https://x' } }])))
      .toEqual([['WebFetch', '1']])
  })

  /**
   * The event stream excludes prompts and model output on purpose. A denial
   * record must not reintroduce them: `node -e "fetch(...)"` is three words and
   * the third carried a whole URL out of the model's working context on the
   * first run of this.
   */
  it('bounds a long single token by characters, not just words', () => {
    const long = `node -e "fetch('https://api.github.com/repos/some/really-long-name').then(r=>r.json())"`
    const [[cmd]] = run(withDenials([bash(long)]))
    expect(cmd.length).toBeLessThanOrEqual(49)
    expect(cmd).not.toContain('really-long-name')
  })

  /** parse-result.py already guards this: the CLI can emit a warning object first. */
  it('survives more than one JSON document on stdout', () => {
    const raw = '{"type":"warning"}\n' + JSON.stringify(withDenials([bash('gh run view 1')]))
    const out = execFileSync('python3', [SCRIPT], { input: raw, encoding: 'utf8' })
    expect(out.trim()).toBe('gh run view\t1')
  })

  it('the runner acts on it rather than only printing it', () => {
    const s = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'run.sh'), 'utf8')
    expect(s).toContain('denials.py')
    expect(s).toMatch(/BLOCKED — this run was refused tools it asked for/)
    // Ink on a page is not a gate: a blocked run must reach the "needs you" queue.
    expect(s).toMatch(/spine_close "\$BTASK" escalate/)
    // And it must be callable where it is called — bash needs the definition first.
    expect(s.indexOf('spine_new() {')).toBeLessThan(s.indexOf('BTASK="$(spine_new'))
  })
})
