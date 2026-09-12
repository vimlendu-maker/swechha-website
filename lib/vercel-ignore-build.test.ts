import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * scripts/vercel-ignore-build.sh's PATH-BASED SKIP, run end to end in a
 * throwaway git repo — not by re-implementing its regex in TypeScript and
 * asserting against that copy, which would pass even if the script itself
 * were wrong. FREEZE_UNTIL inside the script is a fixed past timestamp, so
 * every run here exercises the path-based check, never the time freeze.
 *
 * exit 0 == build is SKIPPED. exit 1 == build CONTINUES. Backwards from every
 * other exit code, per the script's own comment and Vercel's ignoreCommand
 * contract.
 *
 * This test covers a file under `scripts/`, but lives here rather than beside
 * it: `vitest.config.mts`'s `include` only globs `lib/**` and `app/**`, and
 * that file is outside this run's edit permissions (a top-level test-gate
 * config, denied the same way `vercel.json` was — see the PR description).
 * A test vitest never collects is worse than no test at all, which is the
 * exact lesson `vitest.config.mts`'s own comment records about the school
 * enquiry route — so this stayed where `npm test` actually runs it instead of
 * sitting next to the script it checks and silently never firing.
 */

const SCRIPT = join(process.cwd(), 'scripts', 'vercel-ignore-build.sh')

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

function runIgnoreCommand(): { status: number | null; stdout: string } {
  const result = spawnSync('bash', [SCRIPT], { cwd: repo, encoding: 'utf8' })
  return { status: result.status, stdout: result.stdout }
}

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'vercel-ignore-build-'))
  git('init', '-q')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'test')
})

afterEach(() => {
  rmSync(repo, { recursive: true, force: true })
})

describe('vercel-ignore-build.sh path-based skip', () => {
  it('skips when the whole diff is under docs/**', () => {
    commit({ 'docs/website-team/lessons.md': 'first' }, 'init')
    commit({ 'docs/website-team/lessons.md': 'second' }, 'docs only')
    const { status, stdout } = runIgnoreCommand()
    expect(status, stdout).toBe(0)
    expect(stdout).toMatch(/skipping this build/)
  })

  it('builds when the diff touches app/** even alongside docs/**', () => {
    commit({ 'docs/website-team/lessons.md': 'first', 'app/page.tsx': 'first' }, 'init')
    commit({ 'docs/website-team/lessons.md': 'second', 'app/page.tsx': 'second' }, 'mixed')
    const { status, stdout } = runIgnoreCommand()
    expect(status, stdout).toBe(1)
    expect(stdout).toMatch(/building normally/)
  })

  it('builds on a served-only change', () => {
    commit({ 'app/page.tsx': 'first' }, 'init')
    commit({ 'app/page.tsx': 'second' }, 'served only')
    const { status } = runIgnoreCommand()
    expect(status).toBe(1)
  })

  /* The three real 2026-09-12 commits this fix is measured against. */
  it('skips 4406b9ee: policy.json + scripts/website-team/on-change.sh', () => {
    commit({ 'docs/website-team/policy.json': '{}', 'scripts/website-team/on-change.sh': '#!/bin/sh' }, 'init')
    commit(
      { 'docs/website-team/policy.json': '{"x":1}', 'scripts/website-team/on-change.sh': '#!/bin/sh\necho hi' },
      '4406b9ee',
    )
    const { status } = runIgnoreCommand()
    expect(status).toBe(0)
  })

  it('skips 91ea00a4: lessons.md alone', () => {
    commit({ 'docs/website-team/lessons.md': 'a' }, 'init')
    commit({ 'docs/website-team/lessons.md': 'a\nb' }, '91ea00a4')
    const { status } = runIgnoreCommand()
    expect(status).toBe(0)
  })

  it('builds on b448a270: scripts/build-teach.mjs + scripts/verify-cutover.mjs — generators are never skipped', () => {
    commit({ 'scripts/build-teach.mjs': 'a', 'scripts/verify-cutover.mjs': 'a' }, 'init')
    commit({ 'scripts/build-teach.mjs': 'b', 'scripts/verify-cutover.mjs': 'b' }, 'b448a270')
    const { status } = runIgnoreCommand()
    expect(status).toBe(1)
  })

  it('skips on .claude/** and .superpowers/**', () => {
    commit({ '.claude/agents/website-design.md': 'a', '.superpowers/notes.md': 'a' }, 'init')
    commit({ '.claude/agents/website-design.md': 'b', '.superpowers/notes.md': 'b' }, 'internal')
    const { status } = runIgnoreCommand()
    expect(status).toBe(0)
  })

  it('skips on top-level CLAUDE.md, AGENTS.md and README.md', () => {
    commit({ 'CLAUDE.md': 'a', 'AGENTS.md': 'a', 'README.md': 'a' }, 'init')
    commit({ 'CLAUDE.md': 'b', 'AGENTS.md': 'b', 'README.md': 'b' }, 'top-level docs')
    const { status } = runIgnoreCommand()
    expect(status).toBe(0)
  })

  it('does NOT skip a nested README.md — only the top-level one is exempt', () => {
    commit({ 'scripts/README.md': 'a' }, 'init')
    commit({ 'scripts/README.md': 'b' }, 'nested readme')
    const { status } = runIgnoreCommand()
    expect(status).toBe(1)
  })

  it('skips on lib/website-team-*.test.ts', () => {
    commit({ 'lib/website-team-policy.test.ts': 'a' }, 'init')
    commit({ 'lib/website-team-policy.test.ts': 'b' }, 'team test')
    const { status } = runIgnoreCommand()
    expect(status).toBe(0)
  })

  it('does NOT skip an ordinary lib/*.test.ts outside the website-team- prefix', () => {
    commit({ 'lib/brand.test.ts': 'a' }, 'init')
    commit({ 'lib/brand.test.ts': 'b' }, 'ordinary test')
    const { status } = runIgnoreCommand()
    expect(status).toBe(1)
  })

  it('builds normally when there is no HEAD^ to diff against', () => {
    commit({ 'docs/website-team/lessons.md': 'only commit' }, 'sole commit')
    const { status, stdout } = runIgnoreCommand()
    expect(status, stdout).toBe(1)
    expect(stdout).toMatch(/Could not determine changed paths/)
  })

  it('does NOT skip data/**, package.json or next.config.ts', () => {
    for (const path of ['data/situations/air.json', 'package.json', 'next.config.ts']) {
      commit({ [path]: 'a' }, `init-${path}`)
      commit({ [path]: 'b' }, `change-${path}`)
      const { status } = runIgnoreCommand()
      expect(status, `${path} should not be skippable`).toBe(1)
    }
  })
})
