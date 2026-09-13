import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

/**
 * THE TOKENS WERE THERE ALL ALONG.
 *
 * The manager's cost per run went $1.21 -> $4.94 between 2026-09-11 and
 * 2026-09-12 and nothing in the estate could say why: `activity.jsonl` records
 * `cost_usd` and nothing else. input_tokens, output_tokens and latency appear
 * ZERO times in 1,034 events (MODEL_GATEWAY_AUDIT.md §12.1).
 *
 * They were never missing. `claude -p --output-format json` returns `usage`
 * with input_tokens, output_tokens, cache_read_input_tokens and
 * cache_creation_input_tokens, plus duration_ms, duration_api_ms, num_turns and
 * a per-model modelUsage breakdown — and parse-result.py printed
 * `total_cost_usd` and dropped every one of them.
 *
 * Exactly the shape of PAPERCLIP_INTEGRATION_EVALUATION.md I.5: the number is
 * computed and discarded at the transport boundary, so the one fact that would
 * settle the question is unavailable through the API that exists.
 */
const SCRIPT = join(__dirname, '..', 'scripts', 'website-team', 'parse-result.py')

const run = (input: string, args: string[] = []) =>
  execFileSync('python3', [SCRIPT, ...args], { input, encoding: 'utf8' })

const RESULT = JSON.stringify({
  type: 'result',
  result: 'the answer text',
  total_cost_usd: 4.94,
  duration_ms: 812345,
  duration_api_ms: 800000,
  num_turns: 27,
  usage: {
    input_tokens: 1200,
    output_tokens: 8400,
    cache_read_input_tokens: 980000,
    cache_creation_input_tokens: 42000,
  },
  modelUsage: {
    'claude-sonnet-5': { inputTokens: 1200, outputTokens: 8400 },
  },
})

describe('parse-result.py --metrics', () => {
  it('emits the token counts that were being discarded', () => {
    const out = run(RESULT, ['--metrics'])
    expect(out).toContain('input_tokens=1200')
    expect(out).toContain('output_tokens=8400')
    expect(out).toContain('cache_read_tokens=980000')
    expect(out).toContain('cache_creation_tokens=42000')
  })

  it('emits latency and turns, which explain a slow expensive run', () => {
    const out = run(RESULT, ['--metrics'])
    expect(out).toContain('duration_ms=812345')
    expect(out).toContain('num_turns=27')
  })

  it('names the model and the billing basis (ADR-0012)', () => {
    const out = run(RESULT, ['--metrics'])
    expect(out).toContain('model=claude-sonnet-5')
    // ADR-0012: cost_basis is mandatory, because subscription-equivalent and
    // money actually spent must never be summed into one figure.
    expect(out).toContain('cost_basis=subscription')
    expect(out).toContain('lane=agentic')
  })

  it('is one line of key=value, safe to interpolate into a shell call', () => {
    const out = run(RESULT, ['--metrics']).trim()
    expect(out.split('\n')).toHaveLength(1)
    for (const pair of out.split(' ')) {
      expect(pair, `not a bare key=value: ${pair}`).toMatch(/^[a-z_]+=[^ ]*$/)
    }
  })

  it('LEAVES THE DEFAULT OUTPUT BYTE-IDENTICAL', () => {
    // run.sh reads line 1 as the cost and lines 2+ as the text. A metrics mode
    // that shifted either would break the runner silently — it swallows
    // parse failures — so the default path must not move at all.
    const out = run(RESULT)
    expect(out.split('\n')[0]).toBe('4.94')
    expect(out.split('\n').slice(1).join('\n')).toBe('the answer text')
  })

  it('omits a field it was not given rather than inventing a zero', () => {
    const thin = JSON.stringify({ result: 'x', total_cost_usd: 1 })
    const out = run(thin, ['--metrics'])
    expect(out).not.toContain('input_tokens=')
    expect(out).not.toContain('input_tokens=0')
    expect(out).toContain('cost_basis=subscription')
  })

  it('survives the multi-document stdout the default path already handles', () => {
    const out = run('{"warning":"x"}\n' + RESULT, ['--metrics'])
    expect(out).toContain('output_tokens=8400')
  })
})
