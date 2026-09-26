import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * THE RUNNER DIED TWICE TODAY AND SAID NOTHING.
 *
 *   2026-09-13 17:16  manager run_started … then nothing
 *   2026-09-13 19:18  manager run_started … then nothing
 *
 * In both, `session_started` follows one second later and no `session_ended`,
 * no `run_finished`, no `run_refused` ever arrives. The reason is unknowable
 * after the fact, because run.sh called:
 *
 *     RESULT="$(claude -p … 2>/dev/null)"
 *
 * under `set -euo pipefail`. stderr to /dev/null, no `|| true` — so a non-zero
 * exit kills the runner AT THAT LINE with the explanation already thrown away.
 *
 * On a SUBSCRIPTION this is the failure that matters. The estate has never hit
 * a usage limit (zero rate-limit events in three days, including the $109 one),
 * but if it ever does, the department goes quiet mid-incident and nothing says
 * why. api-health.sh watches GitHub's rate limit. Nothing watches Anthropic's.
 */
const SCRIPT = join(__dirname, '..', 'scripts', 'website-team', 'model-failure.py')
const run = (stderr: string, code = '1') =>
  execFileSync('python3', [SCRIPT, code], { input: stderr, encoding: 'utf8' }).trim()

describe('model-failure.py classifies why the model call failed', () => {
  it('names a usage limit, which is the one that matters on a subscription', () => {
    const out = run('Claude AI usage limit reached. Your limit will reset at 3pm.')
    expect(out).toContain('reason=usage_limit')
  })

  it('separates a rate limit from a usage limit', () => {
    // Different remedies: a rate limit is transient and worth retrying, a usage
    // limit is a wall until the window resets. ADR-0010's table splits exactly
    // here, so the classifier must too.
    expect(run('API Error: 429 rate_limit_error')).toContain('reason=rate_limit')
  })

  it('names an auth failure, which halts rather than retries', () => {
    // org-claude's vocabulary, so a refusal and a failure name one condition.
    expect(run('Invalid API key · Please run /login')).toContain('reason=auth-expired')
    expect(run('Not logged in · Please run /login')).toContain('reason=auth-missing')
    expect(run('403 Forbidden: unauthorized')).toContain('reason=auth')
  })

  it('names a network failure', () => {
    expect(run('fetch failed: ECONNREFUSED')).toContain('reason=network')
  })

  it('says unknown rather than guessing', () => {
    // A wrong classification is worse than none: it would send somebody to the
    // wrong remedy. "Measured or UNKNOWN, never estimated."
    expect(run('something nobody has seen before')).toContain('reason=unknown')
  })

  it('carries a short detail, one line, safe to interpolate', () => {
    const out = run('Claude AI usage limit reached.\nsecond line\nthird line')
    expect(out.split('\n')).toHaveLength(1)
    for (const pair of out.split(' ')) expect(pair).toMatch(/^[a-z_]+=[^ ]*$/)
    expect(out).toContain('exit_code=1')
  })

  it('reports an empty stderr honestly rather than inventing a cause', () => {
    const out = run('', '137')
    expect(out).toContain('reason=unknown')
    expect(out).toContain('exit_code=137')
    expect(out).toContain('stderr=empty')
  })
})

/**
 * ★ THE ERROR IS ON STDOUT. From 2026-09-22 every run failed with
 *   `{"is_error": true, "result": "Failed to authenticate: …"}` on stdout and an
 *   EMPTY stderr, and this classifier — reading stderr only — said `unknown`
 *   seven days running. These are the real shapes the CLI printed.
 */
describe('model-failure.py reads the reply on stdout too', () => {
  const withStdout = (stdout: string, stderr = '', code = '1') => {
    const dir = mkdtempSync(join(tmpdir(), 'mf-'))
    const f = join(dir, 'out.json')
    writeFileSync(f, stdout)
    return execFileSync('python3', [SCRIPT, code, '--stdout', f], { input: stderr, encoding: 'utf8' }).trim()
  }
  const isError = (stdout: string) =>
    execFileSync('python3', [SCRIPT, '--is-error'], { input: stdout, encoding: 'utf8' }).trim()

  it('names an expired OAuth session from the is_error result, not `unknown`', () => {
    const out = withStdout(JSON.stringify({
      type: 'result', is_error: true,
      result: 'Failed to authenticate: OAuth session expired and could not be refreshed',
    }))
    expect(out).toContain('reason=auth-expired')
    expect(out).toContain('source=stdout')
    expect(out).toContain('stderr=empty')
    expect(out).not.toContain('reason=unknown')
  })

  it('names a missing login', () => {
    const out = withStdout(JSON.stringify({ type: 'result', is_error: true, result: 'Not logged in · Please run /login' }))
    expect(out).toContain('reason=auth-missing')
  })

  it('survives a warning object before the result', () => {
    const out = withStdout('{"type":"warning"}\n' +
      JSON.stringify({ type: 'result', is_error: true, result: 'Claude AI usage limit reached' }))
    expect(out).toContain('reason=usage_limit')
  })

  it('never classifies a SUCCESSFUL reply — model prose is not evidence', () => {
    const out = withStdout(JSON.stringify({ type: 'result', is_error: false, result: 'the 401 page and the rate limit' }))
    expect(out).toContain('reason=unknown')
    expect(out).not.toContain('source=stdout')
  })

  it('stays one line of safe key=value pairs', () => {
    const out = withStdout(JSON.stringify({ type: 'result', is_error: true, result: 'Not logged in\nsecond line' }))
    expect(out.split('\n')).toHaveLength(1)
    for (const pair of out.split(' ')) expect(pair).toMatch(/^[a-z_]+=[^ ]*$/)
  })

  it('--is-error answers 1 only for an is_error reply', () => {
    expect(isError(JSON.stringify({ type: 'result', is_error: true, result: 'x' }))).toBe('1')
    expect(isError(JSON.stringify({ type: 'result', is_error: false, result: 'x' }))).toBe('0')
    expect(isError('')).toBe('0')
  })
})

describe('the runners no longer discard the explanation', () => {
  const RUN = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'run.sh'), 'utf8')
  const EXEC = readFileSync(join(__dirname, '..', 'scripts', 'website-team', 'execute.sh'), 'utf8')

  it('run.sh captures the model call stderr instead of /dev/null', () => {
    const line = RUN.split('\n').find((l) => l.includes('"$ORG_CLAUDE" -p "$PROMPT"'))
    expect(line, 'the manager call disappeared').toBeTruthy()
    const block = RUN.slice(RUN.indexOf(line!), RUN.indexOf(line!) + 400)
    expect(block, 'stderr is still going to /dev/null').not.toContain('2>/dev/null')
  })

  it('run.sh survives a failed model call long enough to report it', () => {
    // Under `set -e` an unguarded failure kills the script at that line, which
    // is how two runs died today leaving only `run_started`.
    expect(RUN).toContain('MODEL_RC=')
    expect(RUN).toMatch(/run_failed/)
  })

  it('execute.sh does the same for the specialist call', () => {
    // Asserted over the BLOCK, not one line: the redirections live on the
    // continuation line below the flags, and a single-line matcher quietly
    // stops testing anything the moment somebody wraps the command.
    const i = EXEC.indexOf('--output-format json')
    expect(i, 'the specialist call disappeared').toBeGreaterThan(-1)
    const block = EXEC.slice(i, i + 300)
    expect(block).toContain('exec.json')
    expect(block).toContain('exec.stderr')
    // Narrowed to the CLAUDE call's own redirection. The first version banned
    // `2>/dev/null` anywhere in the block and fired on the classifier's own
    // stderr suppression two lines below — a legitimate use. A matcher that
    // catches innocent neighbours gets relaxed, and then it catches nothing.
    const call = EXEC.slice(EXEC.lastIndexOf('"$ORG_CLAUDE" -p', i), i + 200)
    expect(call, "the claude call's stderr still goes to /dev/null")
      .not.toMatch(/ORG_CLAUDE" -p[\s\S]*?2>\/dev\/null/)
    expect(EXEC).toContain('model-failure.py')
  })

  it('both runners hand the classifier STDOUT, where the CLI puts its error', () => {
    expect(RUN).toMatch(/model-failure\.py" "\$MODEL_RC" --stdout "\$MODEL_OUT"/)
    expect(RUN).toMatch(/MODEL_IS_ERROR" = "1"/)
    expect(EXEC).toMatch(/model-failure\.py" 1 --stdout "\$RUNLOG"\/exec\.json/)
    expect(EXEC).toMatch(/model-failure\.py" --is-error/)
  })
})
