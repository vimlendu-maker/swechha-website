import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

/**
 * CI coverage for the fact-verification gate, using only the cases it decides
 * WITHOUT network access — so this test cannot go flaky and cannot fail because
 * Crossref is slow. The network paths (DOI resolution, URL fetch, quote match)
 * are exercised by hand; what matters here is that the classification logic and
 * the refusals never silently regress.
 */

const SCRIPT = join(__dirname, '..', 'scripts/website-team/verify-claims.py')

function verify(md: string): { code: number; out: string } {
  try {
    const out = execFileSync('python3', [SCRIPT], { input: md, encoding: 'utf8' })
    return { code: 0, out }
  } catch (e) {
    const err = e as { status: number; stdout: string }
    return { code: err.status, out: err.stdout }
  }
}

const claim = (body: string) => '```claim\n' + body + '\n```\n'

describe('verify-claims gate', () => {
  it('passes a draft that asserts nothing', () => {
    const r = verify('Just prose, no claims.')
    expect(r.code).toBe(0)
    expect(r.out).toContain('nothing asserted')
  })

  it('allows analysis and opinion without a source, but labelled', () => {
    const r = verify(
      claim('text: Winter readings run higher than monsoon ones.\ntype: analysis') +
        claim('text: We think this matters.\ntype: opinion'),
    )
    expect(r.code).toBe(0)
  })

  it('refuses a claim with an unknown type', () => {
    const r = verify(claim('text: Something.\ntype: probably-true'))
    expect(r.code).toBe(1)
    expect(r.out).toContain('type must be one of')
  })

  it('refuses an uncertain claim that carries a figure', () => {
    const r = verify(claim('text: Roughly 90,000 people were affected.\ntype: uncertain'))
    expect(r.code).toBe(1)
    expect(r.out).toContain("may not carry a figure")
  })

  it('refuses a verified_fact with neither source nor doi', () => {
    const r = verify(claim('text: A number is a number.\ntype: verified_fact'))
    expect(r.code).toBe(1)
    expect(r.out).toContain('requires a source or a doi')
  })

  it('refuses an interpretation with no source', () => {
    const r = verify(claim('text: This suggests a trend.\ntype: interpretation'))
    expect(r.code).toBe(1)
  })

  it('refuses a claim with no text', () => {
    const r = verify(claim('type: analysis'))
    expect(r.code).toBe(1)
    expect(r.out).toContain('no claim text')
  })

  it('exits non-zero whenever anything failed, so a caller cannot ignore it', () => {
    const r = verify(
      claim('text: Fine.\ntype: analysis') + claim('text: Bad.\ntype: nonsense'),
    )
    expect(r.code).toBe(1)
    expect(r.out).toContain('REFUSING')
  })
})
