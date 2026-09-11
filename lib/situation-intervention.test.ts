import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { publishStateFor } from '../scripts/lib/active-situation.mjs'

/**
 * THE OWNER'S ONE CONTROL OVER AN AUTOMATICALLY PUBLISHED DISASTER PAGE.
 *
 * Situation pages publish themselves: the detector runs ten times a day, and
 * `publishable()` is purely mechanical — score over threshold AND corroborated
 * by independent publishers. Nobody approves a page before it goes live, and
 * that is the design, not an oversight.
 *
 * The counterweight is `withdrawn`, the only state a person sets and the one
 * the detector may not overturn. It has always worked. It was documented
 * NOWHERE outside the source, and eight events were withdrawn by hand on
 * 9 September 2026 by editing JSON. A control a person cannot find is a control
 * they do not have.
 */
const SCRIPT = join(__dirname, '..', 'scripts', 'situation.mjs')

const sandbox = (dossiers: Record<string, object>) => {
  const dir = mkdtempSync(join(tmpdir(), 'situation-'))
  mkdirSync(join(dir, 'data/climate-events/active'), { recursive: true })
  for (const [name, body] of Object.entries(dossiers)) {
    writeFileSync(join(dir, 'data/climate-events/active', `${name}.json`), JSON.stringify(body, null, 2))
  }
  return dir
}
const run = (cwd: string, args: string[]) => {
  try {
    return { out: execFileSync('node', [SCRIPT, ...args], { cwd, encoding: 'utf8' }), code: 0 }
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string }
    return { out: (err.stdout ?? '') + (err.stderr ?? ''), code: err.status }
  }
}
const dossier = (over: object = {}) =>
  ({ slug: 'bihar-flood', publish_state: 'published', significance_score: 16, location: { text: 'Bihar' }, ...over })
const read = (dir: string, name = 'bihar-flood') =>
  JSON.parse(readFileSync(join(dir, 'data/climate-events/active', `${name}.json`), 'utf8'))

describe('withdrawal outranks the detector', () => {
  /**
   * THE WHOLE CLAIM. Setting a page back to `draft` would not have held — the
   * next run that found it publishable would publish it again. This is why the
   * state is `withdrawn` and not a flag.
   */
  it('survives a run that would otherwise publish the event', () => {
    expect(publishStateFor({ existing: { publish_state: 'withdrawn' }, publishableNow: true })).toBe('withdrawn')
  })

  it('a draft would NOT have held, which is why draft is not the mechanism', () => {
    expect(publishStateFor({ existing: { publish_state: 'draft' }, publishableNow: true })).toBe('published')
  })

  /** Publication latches so a dip in coverage cannot 404 a live disaster page. */
  it('a decayed score does not un-publish a live page', () => {
    expect(publishStateFor({ existing: { publish_state: 'published' }, publishableNow: false })).toBe('published')
  })
})

describe('situation.mjs', () => {
  it('refuses to withdraw without a reason', () => {
    const dir = sandbox({ 'bihar-flood': dossier() })
    const r = run(dir, ['withdraw', 'bihar-flood'])
    expect(r.code).not.toBe(0)
    expect(r.out).toContain('--why')
    expect(read(dir).publish_state).toBe('published')
  })

  it('writes the same three fields the hand-withdrawn dossiers carry', () => {
    const dir = sandbox({ 'bihar-flood': dossier() })
    expect(run(dir, ['withdraw', 'bihar-flood', '--why', 'an opinion piece, not an event']).code).toBe(0)
    const d = read(dir)
    expect(d.publish_state).toBe('withdrawn')
    expect(d.withdrawn_why).toBe('an opinion piece, not an event')
    expect(d.withdrawn_on).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  /** Withdrawal is not deletion: the evidence of the decision must survive it. */
  it('keeps the dossier, its sources and its score', () => {
    const dir = sandbox({ 'bihar-flood': dossier({ publishers: ['a', 'b'], significance_score: 16 }) })
    run(dir, ['withdraw', 'bihar-flood', '--why', 'x'])
    const d = read(dir)
    expect(d.significance_score).toBe(16)
    expect(d.publishers).toEqual(['a', 'b'])
  })

  it('is idempotent and does not overwrite the original reason', () => {
    const dir = sandbox({ 'bihar-flood': dossier() })
    run(dir, ['withdraw', 'bihar-flood', '--why', 'the first reason'])
    const r = run(dir, ['withdraw', 'bihar-flood', '--why', 'a later, worse reason'])
    expect(r.code).toBe(0)
    expect(read(dir).withdrawn_why).toBe('the first reason')
  })

  it('refuses a slug that does not exist rather than creating one', () => {
    const dir = sandbox({ 'bihar-flood': dossier() })
    expect(run(dir, ['withdraw', 'no-such-event', '--why', 'x']).code).not.toBe(0)
  })

  /**
   * active-situation.mjs: "Restoring one is a person editing the file back,
   * which is the correct amount of friction for undoing a human judgement."
   * A one-command undo would remove friction its author chose deliberately.
   */
  it('has no restore command', () => {
    const dir = sandbox({ 'bihar-flood': dossier({ publish_state: 'withdrawn', withdrawn_why: 'x' }) })
    expect(run(dir, ['restore', 'bihar-flood']).code).not.toBe(0)
  })

  /**
   * It writes data/**, which is never_touch and refused by guard-paths.sh. The
   * department publishes these pages and is the thing being overruled; an agent
   * that could withdraw a page could withdraw the evidence of its own mistake.
   */
  it('is a person\'s tool that no agent is granted', () => {
    const root = join(__dirname, '..')
    for (const f of ['scripts/website-team/run.sh', 'scripts/website-team/execute.sh']) {
      expect(readFileSync(join(root, f), 'utf8')).not.toContain('situation.mjs')
    }
    expect(readFileSync(join(root, 'scripts/website-team/guard-paths.sh'), 'utf8')).toContain("'data/'")
  })
})
