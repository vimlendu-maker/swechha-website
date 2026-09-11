import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The infrastructure watch exists to stop the site quietly starting to cost
 * money. Its one guarantee is that it NEVER reports a number it did not
 * measure — a plausible "usage: 12%" stops the owner from looking, where
 * UNKNOWN sends them to look. These tests pin that guarantee and the free-first
 * rules it serves.
 *
 * Every read is inside an it() block: a throw in a describe body makes vitest
 * report "no tests" for the file, hiding the failure rather than showing it.
 */

const root = join(__dirname, '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')

describe('website team: infrastructure and free-tier watch', () => {
  it('the free-first rules are policy, not prose in a role file', () => {
    type Infra = {
      cost_safety_questions: string[]
      never_fabricate: string
      escalate_always: string[]
      thresholds: Record<string, string>
      dashboard_contract: { columns: string[] }
    }
    const policy = JSON.parse(read('docs/website-team/policy.json')) as { infrastructure?: Infra }
    const infra = policy.infrastructure as Infra
    expect(infra, 'policy.json must carry an infrastructure block').toBeTruthy()
    expect(infra.cost_safety_questions).toHaveLength(7)
    expect(infra.never_fabricate).toMatch(/UNKNOWN/)
    for (const trigger of ['changing plan or tier', 'accepting new terms']) {
      expect(infra.escalate_always).toContain(trigger)
    }
    // The four capacity states the owner specified.
    for (const k of ['GREEN', 'AMBER', 'RED', 'BLOCKED']) {
      expect(Object.keys(infra.thresholds)).toContain(k)
    }
    // The dashboard renders the instrument; it must not compute its own numbers.
    expect(infra.dashboard_contract.columns).toEqual([
      'SERVICE', 'STATUS', 'PLAN', 'USAGE', 'LIMIT', 'HEADROOM', 'COST RISK', 'LAST CHECK',
    ])
  })

  it('the manager can actually run the instrument it is told to read', () => {
    // A role file that names a command the runner's allowlist does not grant
    // is an instruction the agent cannot follow — the allowlist is the real
    // boundary, not the role file.
    expect(read('.claude/agents/website-manager.md')).toMatch(/npm run infra:status/)
    expect(read('scripts/website-team/run.sh')).toMatch(/Bash\(npm run infra:status\)/)
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
    // The instrument itself lives in swechha-ai now; what this repository must
    // still guarantee is that the manager's documented command reaches it.
    expect(pkg.scripts['infra:status']).toContain('swechha-ai')
    expect(pkg.scripts['infra:status']).toContain('infra-status.py')
  })

  it('every npm command the allowlist grants also grants its `:*` form', () => {
    // `Bash(npm run x)` is EXACT-MATCH: it permits `npm run x` and refuses
    // `npm run x --fresh`. Measured 2026-09-11 — the argument form returned
    // DENIED under the exact rule and ALLOWED once the `:*` form was added,
    // which is why the Manager reported the infra instrument as denied on the
    // very day it shipped. Derived from the file rather than restated, because
    // a hand-kept parallel list is this repo's most repeated defect.
    // BOTH runners: the manager's allowlist and the specialist's. execute.sh
    // had the identical defect, and for a lint task the specialist reaches for
    // `npm run lint -- --fix` — exactly the form an exact rule refuses.
    for (const file of ['scripts/website-team/run.sh', 'scripts/website-team/execute.sh']) {
      const src = read(file)
      // Script names contain colons (`air:status`), so only a TRAILING `:*`
      // marks the prefix form — do not exclude colons generally.
      const granted = [...src.matchAll(/Bash\((npm(?: run)? [^)]+?)\)/g)]
        .map((m) => m[1].trim())
        .filter((c) => !c.endsWith(':*'))
      expect(granted.length, `${file} grants no npm commands?`).toBeGreaterThan(3)
      for (const cmd of granted) {
        expect(src, `${file}: ${cmd} is granted exactly but not with arguments — add Bash(${cmd}:*)`)
          .toContain(`Bash(${cmd}:*)`)
      }
    }
  })

  it('the runner grants no write-capable gh verb to the read-only manager', () => {
    const run = read('scripts/website-team/run.sh')
    const ghRules = [...run.matchAll(/Bash\((gh [^)]+)\)/g)].map((m) => m[1])
    for (const rule of ghRules) {
      // `gh api` is verb-agnostic and can POST; `gh pr merge`/`create` write.
      expect(rule, `${rule} would let the read-only manager change state`)
        .toMatch(/^gh (run list|pr (list|view|checks))/)
    }
  })


  it('the inventory records provenance instead of asserting facts', () => {
    const doc = read('docs/website-team/infrastructure.md')
    for (const word of ['verified', 'published', 'unverified', 'UNKNOWN']) {
      expect(doc).toContain(word)
    }
    // What is still unmeasurable must stay NAMED, so a gap cannot quietly
    // become invisible. This list shrinks as credentials arrive — Vercel's
    // deployment health became measurable on 2026-09-11 — but whatever is
    // left blind has to be findable in this document by name.
    // The list of blind spots SHRINKS as credentials arrive — Vercel's
    // deployments and Neon's storage both became measurable on 2026-09-11 — so
    // this cannot name specific services forever. What it must guarantee is
    // that whatever remains unmeasurable is still findable here by name, and
    // that each gap records WHY, not just that it exists.
    const stillUnknown = doc.match(/still UNKNOWN/g) ?? []
    expect(stillUnknown.length, 'no remaining gap is named — either everything is '
      + 'measured (record that) or a gap went silent').toBeGreaterThan(0)
    // Each of those must carry a reason on the same line or the next.
    for (const m of doc.matchAll(/still UNKNOWN[^\n]*\n?[^\n]*/g)) {
      expect(m[0], `a gap is named without a reason: ${m[0].slice(0, 60)}`)
        .toMatch(/—|because|cannot|returns|needs/)
    }
    // And the Vercel scope trade-off specifically, because a future reader will
    // otherwise "fix" it by widening the token.
    expect(doc).toMatch(/project-scoped token is denied user- and team-level/)
  })
})
