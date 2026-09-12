import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * scripts/classify-content-commit.sh's TWO-CONDITION DISCRIMINATOR, run end to
 * end in a throwaway git repo — not by re-implementing its logic in
 * TypeScript and asserting against that copy, which would pass even if the
 * script itself were wrong (the same reasoning as
 * lib/vercel-ignore-build.test.ts, whose header this follows).
 *
 * This is the test the fidelity-gate fix names as "done": a synthetic
 * `data/climate-events/**`-only commit must classify as NON-FATAL (the
 * `scripts/situation.mjs` / commit 737f465a / PR #146 case), and a synthetic
 * `data/work/**`-only commit — a real Keystatic collection path per
 * `keystatic.config.ts` — must stay FATAL.
 *
 * exit 0 == CMS SAVE, the fidelity gate is fatal (workflow's cms=1).
 * exit 1 == MIGRATION, reported only (workflow's cms=0).
 *
 * The script shells out to `node scripts/keystatic-managed-paths.mjs`, which
 * imports the REAL `keystatic.config.ts` from THIS repo (resolved relative to
 * the script's own location, not the throwaway repo's cwd) — so this test
 * exercises the actual, current collection paths, not a copy of them.
 */

const SCRIPT = join(process.cwd(), 'scripts', 'classify-content-commit.sh')

let repo: string

function git(...args: string[]) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8' })
}

function commit(files: Record<string, string>, message: string) {
  for (const [path, content] of Object.entries(files)) {
    const full = join(repo, path)
    mkdirSync(join(full, '..'), { recursive: true })
    writeFileSync(full, content)
  }
  git('add', '-A')
  git('commit', '-m', message, '--allow-empty')
}

function classify(): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync('bash', [SCRIPT], { cwd: repo, encoding: 'utf8' })
  return { status: result.status, stdout: result.stdout, stderr: result.stderr }
}

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'classify-content-commit-'))
  git('init', '-q')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'test')
})

afterEach(() => {
  rmSync(repo, { recursive: true, force: true })
})

describe('classify-content-commit.sh', () => {
  it('is NON-FATAL on a synthetic data/climate-events/**-only commit (the situation.mjs / PR #146 case)', () => {
    commit({ 'data/climate-events/active/nepal-flood.json': '{"a":1}' }, 'init')
    commit({ 'data/climate-events/active/nepal-flood.json': '{"a":1,"withdrawn":true}' }, 'withdraw via situation.mjs')
    const { status, stdout } = classify()
    expect(status, stdout).toBe(1)
    expect(stdout).toMatch(/outside every Keystatic collection/)
  })

  it('stays FATAL on a synthetic data/work/**-only commit (a real Keystatic collection path)', () => {
    commit({ 'data/work/projects/eco-action.json': '{"slug":"eco-action","holes":[{"what":"x"}]}' }, 'init')
    commit({ 'data/work/projects/eco-action.json': '{"slug":"eco-action"}' }, 'cms save that drops holes')
    const { status, stdout } = classify()
    expect(status, stdout).toBe(0)
    expect(stdout).toMatch(/CMS save/)
  })

  it('is NON-FATAL when scripts/ changes alongside data/**, regardless of which data path (the AD-39 case)', () => {
    commit({ 'data/work/projects/eco-action.json': '{"a":1}', 'scripts/build-work-pages.mjs': 'a' }, 'init')
    commit({ 'data/work/projects/eco-action.json': '{"a":2}', 'scripts/build-work-pages.mjs': 'b' }, 'migration')
    const { status, stdout } = classify()
    expect(status, stdout).toBe(1)
    expect(stdout).toMatch(/reviewed migration/)
  })

  it('stays FATAL when a managed path changes even alongside an unmanaged one', () => {
    commit(
      { 'data/work/projects/eco-action.json': '{"a":1}', 'data/climate-events/active/nepal-flood.json': '{"a":1}' },
      'init',
    )
    commit(
      { 'data/work/projects/eco-action.json': '{"a":2}', 'data/climate-events/active/nepal-flood.json': '{"a":2}' },
      'mixed change',
    )
    const { status } = classify()
    expect(status).toBe(0)
  })

  it('is NON-FATAL when no data/** path changed at all', () => {
    commit({ 'content/story/a.md': 'first' }, 'init')
    commit({ 'content/story/a.md': 'second' }, 'content only')
    const { status, stdout } = classify()
    expect(status, stdout).toBe(1)
    expect(stdout).toMatch(/nothing a Keystatic save could have written/)
  })
})
