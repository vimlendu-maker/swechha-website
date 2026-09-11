import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * EARNED EYES, AND THE LINE THEY MAY NOT CROSS.
 *
 * The department repeats its mistakes because nothing it learns changes a
 * mechanism. A lesson in prose is advice the next run can skim past: on
 * 2026-09-11 it discovered `gh run view` was denied, wrote that lesson
 * correctly, and the next run would have started without it.
 *
 * So learning runs on telemetry. `reconcile.py` reads the `run_blocked` events
 * the runner emits and turns a verb refused in two DIFFERENT runs into a grant
 * — but only one `tool-grants.py` can prove read-only. Everything else is
 * reported for a human and never applied, however often it recurs.
 *
 * The ratchet only holds because the WHITELIST lives in `scripts/website-team/`,
 * which is GATED, while the LEDGER is data the department may append to. An
 * agent can grant itself eyes and can never grant itself hands. These tests are
 * that claim, checked.
 */
const SCRIPTS = join(__dirname, '..', 'scripts', 'website-team')
const GRANTS = join(SCRIPTS, 'tool-grants.py')
const RECONCILE = join(SCRIPTS, 'reconcile.py')
const ROOT = join(__dirname, '..')

const ledgerWith = (grants: string[]) => {
  const dir = mkdtempSync(join(tmpdir(), 'grants-'))
  const f = join(dir, 'tool-grants.json')
  writeFileSync(f, JSON.stringify({ grants }))
  return f
}
const allowed = (grants: string[]) =>
  execFileSync('python3', [GRANTS, ledgerWith(grants)], { encoding: 'utf8' })

describe('tool grants', () => {
  it('admits a read-only verb, in both its bare and argument forms', () => {
    // An exact-match rule permits the bare command and refuses it with an
    // argument — the defect that made half this repo's allowlist narrower than
    // it looked.
    expect(allowed(['gh run view'])).toBe('Bash(gh run view),Bash(gh run view:*)')
  })

  it.each([
    ['gh pr merge', 'merges'],
    ['gh run rerun', 'starts a workflow'],
    ['gh pr create', 'writes'],
    ['curl -s', 'egress: how context leaves the machine'],
    ['npm run build:all', 'commits'],
    ['git push', 'writes'],
    ['rm -rf', 'obviously'],
  ])('refuses %s (%s)', (verb) => {
    expect(allowed([verb])).toBe('')
  })

  /**
   * `gh run` as a prefix would admit `gh run rerun`. Entries are whole
   * subcommands, matched exactly.
   */
  it('matches whole subcommands, not prefixes', () => {
    expect(allowed(['gh run'])).toBe('')
  })

  it('grants nothing from a broken ledger rather than failing the run', () => {
    const dir = mkdtempSync(join(tmpdir(), 'grants-'))
    const f = join(dir, 'x.json')
    writeFileSync(f, '{ this is not json')
    expect(execFileSync('python3', [GRANTS, f], { encoding: 'utf8' })).toBe('')
  })

  /**
   * The live ledger is data an automated process appends to. Whatever is in it,
   * the effective allowlist must still contain nothing that writes.
   */
  it('every entry in the committed ledger is read-only', () => {
    const real = join(ROOT, 'docs/website-team/tool-grants.json')
    const r = execFileSync('python3', [GRANTS, real, '--check'], { encoding: 'utf8', stdio: 'pipe' })
    expect(r).toBe('')
  })

  it('the whitelist lives where the department cannot edit it', () => {
    // guard-paths.sh forbids scripts/website-team/** outright; the ledger sits
    // in docs/ on purpose. If tool-grants.py ever moved, the ratchet would be
    // the agent's to rewrite.
    const guard = readFileSync(join(SCRIPTS, 'guard-paths.sh'), 'utf8')
    expect(guard).toContain("'scripts/website-team/'")
  })
})

describe('reconcile', () => {
  const logWith = (rows: object[]) => {
    const dir = mkdtempSync(join(tmpdir(), 'rec-'))
    const f = join(dir, 'a.jsonl')
    writeFileSync(f, rows.map((r) => JSON.stringify(r)).join('\n') + '\n')
    return f
  }
  const blocked = (ts: string, pid: number, refused: string) =>
    ({ ts, pid, event: 'run_blocked', refused })
  const run = (rows: object[], ledger: string[], apply = false) => {
    const l = ledgerWith(ledger)
    const out = execFileSync('python3',
      [RECONCILE, '--log', logWith(rows), '--ledger', l, ...(apply ? ['--apply'] : [])],
      { encoding: 'utf8' })
    return { out, ledger: JSON.parse(readFileSync(l, 'utf8')).grants as string[] }
  }

  /**
   * TWO RUNS, NOT TWO REFUSALS. One confused run can refuse the same command
   * eight times — that is exactly what happened on 2026-09-11 — and none of it
   * proves the grant is missing rather than the run being lost.
   */
  it('ignores a verb refused many times in a single run', () => {
    const { out, ledger } = run([blocked('2026-09-12T01:00:00+0530', 1, 'gh run view;gh run view;gh run view')], [], true)
    expect(out).toContain('nothing has been refused twice')
    expect(ledger).toEqual([])
  })

  it('grants a read-only verb refused in two different runs', () => {
    const { ledger } = run([
      blocked('2026-09-11T23:16:46+0530', 877, 'gh run view'),
      blocked('2026-09-12T00:30:51+0530', 64474, 'gh run view'),
    ], [], true)
    expect(ledger).toEqual(['gh run view'])
  })

  /** The ratchet: it may tighten, never loosen — however often it recurs. */
  it('never applies a verb that is not provably read-only', () => {
    const rows = [1, 2, 3, 4, 5].map((i) => blocked(`2026-09-1${i}T01:00:00+0530`, i, 'curl -s -o'))
    const { out, ledger } = run(rows, [], true)
    expect(ledger).toEqual([])
    expect(out).toContain('NEEDS A HUMAN')
  })

  it('changes nothing without --apply', () => {
    const { out, ledger } = run([
      blocked('2026-09-11T23:00:00+0530', 1, 'gh run view'),
      blocked('2026-09-12T00:00:00+0530', 2, 'gh run view'),
    ], [])
    expect(out).toContain('would grant')
    expect(ledger).toEqual([])
  })

  it('does not re-add what is already granted', () => {
    const { out } = run([
      blocked('2026-09-11T23:00:00+0530', 1, 'gh run view'),
      blocked('2026-09-12T00:00:00+0530', 2, 'gh run view'),
    ], ['gh run view'])
    expect(out).toContain('nothing has been refused twice')
  })
})
