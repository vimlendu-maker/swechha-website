import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE GUARD'S LIST AND THE POLICY'S LIST MUST AGREE.
 *
 * `scripts/website-team/guard-paths.sh` carries a literal copy of
 * `auto_merge.never_touch` from `docs/website-team/policy.json`. The duplication
 * is deliberate — the guard is the last line of defence and must not stop
 * working because a JSON edit broke a parser — but a hand-maintained list that
 * has to move in lockstep with another one is this repository's single most
 * repeated defect class. So it is derived-checked instead: the duplication
 * stays, and this test fails the moment the two diverge.
 */

const ROOT = join(__dirname, '..')

/* Read inside each test, never in the describe body. A throw during collection
   makes vitest report "no tests" rather than a failure, which hides every other
   assertion in the file — a trap this repository has hit before and recorded. */
const readPolicy = () =>
  JSON.parse(readFileSync(join(ROOT, 'docs/website-team/policy.json'), 'utf8'))
const readGuard = () =>
  readFileSync(join(ROOT, 'scripts/website-team/guard-paths.sh'), 'utf8')

describe('website team policy', () => {

  it('the guard script forbids exactly what the policy forbids', () => {
    const policy = readPolicy()
    const guard = readGuard()
    /* public/_pages is listed in the policy with a parenthetical explaining
       that the build may regenerate it; the guard adds it conditionally rather
       than in its literal list. Strip the annotation and that one entry. */
    const fromPolicy = [...policy.auto_merge.never_touch]
      .map((p: string) => p.replace(/\s*\(.*\)$/, '').replace(/\*+$/, ''))
      .filter((p: string) => p !== 'public/_pages/')
      .sort()

    const block = guard.match(/FORBIDDEN=\(([\s\S]*?)\n\)/)
    expect(block, 'guard-paths.sh has no FORBIDDEN=( ... ) block').toBeTruthy()
    const fromGuard = [...block![1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort()

    expect(fromGuard).toEqual(fromPolicy)
  })

  it('keeps the gates that must not move with the autonomy dial', () => {
    const policy = readPolicy()
    const never = policy.never.join(' | ').toLowerCase()
    expect(never).toContain('push directly to main')
    expect(never).toContain('weaken')
    const approval = policy.requires_approval.join(' | ').toLowerCase()
    expect(approval).toContain('factual claim')
  })

  it('never grants a recruit write access', () => {
    const policy = readPolicy()
    const roles = Object.values(policy.roles) as Array<Record<string, unknown>>
    const writers = roles.filter((r) => r.site_write && r.site_write !== false)
    expect(writers).toHaveLength(1)
    expect((policy.roles as Record<string, { site_write: unknown }>).engineering.site_write)
      .toBe('pr_only')
  })
})
