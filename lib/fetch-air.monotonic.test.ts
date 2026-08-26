import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

/**
 * THE CLOCK ONLY MOVES FORWARD — AD-45B.
 *
 * On 26 August 2026 the hourly job replaced a committed 14:00 observation
 * (CAAQMS, fresh) with a 02:00 one (the mirror, twelve hours behind), because
 * its only guard asked whether the figure MOVED, not which way. This test
 * runs the real script, through its real fixture seam, against a file primed
 * with a newer observation, and demands the refusal.
 */
const SCRIPT = resolve(__dirname, '../scripts/fetch-air.mjs')
const FIXTURE = resolve(__dirname, '__fixtures__/cpcb-delhi-2026-08-25T0500.json')

function run(outPath: string, env: Record<string, string> = {}) {
  return execFileSync('node', [SCRIPT, outPath], {
    encoding: 'utf8',
    env: { ...process.env, AIR_FIXTURE: FIXTURE, DATA_GOV_IN_KEY: 'unused-in-replay', ...env },
  })
}

describe('fetch-air refuses to walk the observation backward', () => {
  it('keeps a newer committed observation over an older fetch, and exits 0', () => {
    const dir = mkdtempSync(join(tmpdir(), 'air-mono-'))
    const out = join(dir, 'air-delhi.json')
    // The fixture observes 25-08-2026 05:00; prime the file one day newer.
    writeFileSync(out, JSON.stringify({ observed: { raw: '26-08-2026 05:00:00' }, sentinel: true }))
    const log = run(out)
    expect(log).toContain('REFUSING TO WALK BACKWARD')
    expect(JSON.parse(readFileSync(out, 'utf8')).sentinel).toBe(true) // untouched
  })

  it('writes when the fetch is newer than the file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'air-mono-'))
    const out = join(dir, 'air-delhi.json')
    writeFileSync(out, JSON.stringify({ observed: { raw: '24-08-2026 23:00:00' } }))
    run(out)
    expect(JSON.parse(readFileSync(out, 'utf8')).observed.raw).toBe('25-08-2026 05:00:00')
  })

  it('AIR_ALLOW_REGRESSION=1 is the human override, and it writes', () => {
    const dir = mkdtempSync(join(tmpdir(), 'air-mono-'))
    const out = join(dir, 'air-delhi.json')
    writeFileSync(out, JSON.stringify({ observed: { raw: '26-08-2026 05:00:00' } }))
    run(out, { AIR_ALLOW_REGRESSION: '1' })
    expect(JSON.parse(readFileSync(out, 'utf8')).observed.raw).toBe('25-08-2026 05:00:00')
  })
})
