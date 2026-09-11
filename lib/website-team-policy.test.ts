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

  it('condition 4 is enforced in code, because nothing on GitHub enforces it', () => {
    /* `auto_merge` condition 4 says generated-current.yml passes on the PR.
       The owner declined a required status check on main on 2026-09-11 (67 of
       the last 100 commits there are direct bot pushes and a required check
       would stop them), and `allow_auto_merge` is now on at the repository
       level. So NOTHING blocks a fresh PR, and `gh pr merge --auto` on an
       unblocked PR does not wait — it merges at once, before the workflow has
       started. That would leave the department merging on its own say-so while
       its policy claimed CI had passed. An asserted-but-unenforced condition is
       worse than one never written down, so execute.sh waits itself. */
    const policy = readPolicy()
    const four = policy.auto_merge.conditions.find((c: string) => c.includes('generated-current'))
    expect(four, 'the CI condition disappeared from policy').toBeTruthy()

    /* The gate now lives in merge-when-green.sh, because a person merging by
       hand needs exactly the same wait — PR #115 was merged 38 seconds before
       `current` finished, and #116 by 76, both by someone typing --auto and
       believing it meant "when green". So this test FOLLOWS THE DELEGATION
       rather than naming a file: whichever script execute.sh hands the merge
       to is the one that must hold the gate. Pinning the file name is how a
       test ends up guarding an empty room. */
    const exec = readFileSync(join(ROOT, 'scripts/website-team/execute.sh'), 'utf8')
    const delegate = exec.match(/scripts\/website-team\/([a-z-]+\.sh)" "\$PR_URL"/)
    expect(delegate, 'execute.sh no longer delegates the merge to a script').toBeTruthy()
    const gate = readFileSync(join(ROOT, `scripts/website-team/${delegate![1]}`), 'utf8')

    const strip = (s: string) => s.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')
    // --auto is the trap: it is a no-op wait when nothing is required.
    for (const [name, src] of [['execute.sh', exec], [delegate![1], gate]] as const) {
      expect(strip(src), `${name}: --auto merges immediately when no check is required`)
        .not.toMatch(/gh pr merge --auto/)
    }
    // And the delegate must poll the check and merge only on SUCCESS.
    const code = strip(gate)
    expect(code).toMatch(/gh pr checks/)
    expect(code).toMatch(/\[ "\$state" != "SUCCESS" \]/)
    expect(code).toMatch(/gh pr merge --squash/)
    // The same gate a human reaches, or it is not the same gate.
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
    expect(pkg.scripts['pr:merge'], 'npm run pr:merge must call the same script')
      .toContain(delegate![1])
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

describe('website team: the specialist prompt is a string, not a script', () => {
  it('has no unescaped backtick, which bash would run as a command', () => {
    /* On 2026-09-11 an edit put `next build` into the double-quoted PROMPT
       string. Bash read the backticks as command substitution, tried to run
       `next`, and two real briefs died at runtime having already cost a
       manager run each. `bash -n` PASSED — command substitution is valid
       syntax — and `--dry-run` exits before the prompt is built, so neither
       of the two checks in use could see it. Hence this one. */
    const src = readFileSync(join(ROOT, 'scripts/website-team/execute.sh'), 'utf8')
    const start = src.indexOf('PROMPT="$(cat "$BRIEF_FILE")')
    expect(start, 'the PROMPT assignment moved or was renamed').toBeGreaterThan(-1)
    const endMarker = 'throwaway script."'
    const end = src.indexOf(endMarker, start)
    expect(end, 'the PROMPT string no longer ends where expected').toBeGreaterThan(start)
    const block = src.slice(start, end + endMarker.length)
    const unescaped = [...block.matchAll(/(?<!\\)`/g)]
    expect(unescaped.length,
      `unescaped backtick(s) in the prompt — bash will execute them: ` +
      unescaped.map((m) => block.slice(Math.max(0, m.index! - 30), m.index! + 15)).join(' | ')
    ).toBe(0)
    // $( ) would run too, apart from the one deliberate `cat` on the first line.
    const subs = [...block.matchAll(/(?<!\\)\$\(/g)]
    expect(subs.length, 'only the deliberate $(cat "$BRIEF_FILE") may substitute').toBe(1)
  })
})
