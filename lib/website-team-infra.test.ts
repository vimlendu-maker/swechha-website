import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'

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
  it('the checker is deterministic — no model call anywhere in it', () => {
    const src = read('scripts/website-team/infra-status.py')
    // An agent that generates its own infrastructure metrics can report
    // whatever keeps it out of trouble.
    expect(src).not.toMatch(/\bclaude\b/i)
    expect(src).not.toMatch(/anthropic/i)
  })

  it('reports UNKNOWN rather than inventing a figure it cannot measure', () => {
    const dir = mkdtempSync(join(tmpdir(), 'infra-'))
    // --offline with a cache path that cannot exist: nothing is measurable, so
    // everything measurable-by-probe must come back UNKNOWN and nothing may
    // come back GREEN on the strength of a guess.
    const out = execFileSync('python3', [
      join(root, 'scripts/website-team/infra-status.py'), '--offline', '--json',
    ], { env: { ...process.env, WEBSITE_TEAM_INFRA_CACHE: join(dir, 'none.json') }, encoding: 'utf8' })
    const parsed = JSON.parse(out) as { services: { service: string; status: string; usage: string }[] }
    expect(parsed.services.length).toBeGreaterThan(5)
    expect(parsed.services.every((s) => s.status === 'UNKNOWN')).toBe(true)
    // And it must never print a bare percentage or byte figure it did not read.
    for (const s of parsed.services) {
      expect(s.usage, `${s.service} invented a usage figure with no data`).toMatch(/UNKNOWN/)
    }
  })

  it('an unreachable provider is UNKNOWN, never healthy', () => {
    const src = read('scripts/website-team/infra-status.py')
    // The failure path in cached() returns an error marker, and grade() turns
    // that into UNKNOWN. A provider we cannot reach must never read as fine.
    expect(src).toMatch(/if isinstance\(value, dict\) and "error" in value:\s*\n\s*return "UNKNOWN"/)
  })

  it('it caches, so running it repeatedly does not hammer providers', () => {
    const src = read('scripts/website-team/infra-status.py')
    expect(src).toMatch(/TTLS\s*=/)
    expect(src).toMatch(/def cached\(/)
  })

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
    expect(pkg.scripts['infra:status']).toBe('python3 scripts/website-team/infra-status.py')
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
    // The two blind spots that carry the highest cost risk must stay named.
    expect(doc).toMatch(/VERCEL_TOKEN/)
    expect(doc).toMatch(/NEON_API_KEY/)
  })
})
