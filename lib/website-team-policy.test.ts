import { describe, it, expect } from 'vitest'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'

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

  it('the guard refuses the machinery and admits the probes — run, not read', () => {
    /* ★ A BEHAVIOURAL TEST, because asserting on the source would pass for a
       guard that reads beautifully and blocks nothing. This is the last line
       of defence: the department's specialists have Edit, and until now they
       could edit the runner that invokes them, the worktree that isolates
       them, and this guard itself. A weakened guard merges, and then every
       later run is ungoverned.

       The exception mechanism stays and the exception itself is gone: it held
       scripts/website-team/sentinel/, because a `WATCH:` item meant "add a
       probe there". The sentinel moved to swechha-ai on 2026-09-11, so that
       path is now denied like the rest of the directory — a probe reappearing
       here would mean something was put back in the wrong repository. */
    const repo = mkdtempSync(join(tmpdir(), 'guard-'))
    const git = (...args: string[]) =>
      execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
    const write = (rel: string) => {
      mkdirSync(join(repo, dirname(rel)), { recursive: true })
      writeFileSync(join(repo, rel), 'x\n')
    }
    git('init', '-q', '-b', 'main')
    git('config', 'user.email', 'x@example.com')
    git('config', 'user.name', 'x')
    write('README.md')
    git('add', '-A'); git('commit', '-qm', 'base')
    const base = git('rev-parse', 'HEAD').trim()
    // OUTSIDE the repository: `git add -A` below would otherwise commit the
    // guard itself, and the next `checkout base` would then delete it.
    const guard = join(mkdtempSync(join(tmpdir(), 'guardbin-')), 'guard.sh')
    copyFileSync(join(ROOT, 'scripts/website-team/guard-paths.sh'), guard)

    const verdict = (path: string) => {
      git('checkout', '-q', base)
      write(path)
      git('add', '-A'); git('commit', '-qm', `touch ${path}`)
      try {
        execFileSync('bash', [guard, base], { cwd: repo, stdio: 'pipe' })
        return 'allowed'
      } catch {
        return 'refused'
      }
    }

    // The machinery that invokes, isolates and constrains the agents.
    for (const machinery of [
      'scripts/website-team/run.sh',
      'scripts/website-team/execute.sh',
      'scripts/website-team/guard-paths.sh',
      'scripts/website-team/worktree.sh',
      'scripts/website-team/log-event.py',
      'scripts/website-team/sentinel.sh',
      'scripts/website-team/com.swechha.website-team-work.plist',
      // A file that does not exist yet: new machinery must be denied by
      // default, or this rule decays the first time someone adds a script.
      'scripts/website-team/some-future-runner.sh',
      // ★ ONCE THE ONE EXCEPTION, NOW DENIED LIKE THE REST. The sentinel moved
      //   to the swechha-ai repository on 2026-09-11, so there is no probes
      //   directory here to write into. If a probe reappears at this path,
      //   something has been put back in the wrong repository.
      'scripts/website-team/sentinel/delhi-heat-health.sh',
    ]) {
      expect(verdict(machinery), `${machinery} must be refused`).toBe('refused')
    }

    // Ordinary work.
    for (const permitted of [
      'scripts/build-hero.mjs',
      'content/story/a-new-story.md',
    ]) {
      expect(verdict(permitted), `${permitted} must be allowed`).toBe('allowed')
    }

    // And the pre-existing rules still bite.
    expect(verdict('app/page.tsx')).toBe('refused')
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
       The owner declined a required status check on main on 2026-09-11 — 67 of
       the last 100 commits there are direct bot pushes, and a required check
       REJECTS direct pushes outright (measured: `Required status check "current"
       is expected`, with all six data workflows blocked). So nothing on GitHub
       blocks a fresh PR, and `gh pr merge --auto` on an unblocked PR does not
       wait: it merges at once, before the workflow has started.

       ★ THE GATE LEFT THIS REPOSITORY on 2026-09-11. It is shared with the
       fundraising department and belonged to neither, so it lives in swechha-ai
       and both reach it at a stable path. Its own properties — never --auto,
       polls the check, merges only on SUCCESS — are tested where it lives, in
       swechha-ai/tests/test_merge_gate.py. A test here would assert about a
       file this repository cannot see.

       What this repository still owns is that BOTH of its merge paths lead to
       that one gate: the department's unattended merge, and a person typing a
       command. If either stops delegating, this repo has grown a second gate —
       the condition that let #115 and #116 merge 38 and 76 seconds before their
       checks finished. */
    const policy = readPolicy()
    const four = policy.auto_merge.conditions.find((c: string) => c.includes('generated-current'))
    expect(four, 'the CI condition disappeared from policy').toBeTruthy()

    const exec = readFileSync(join(ROOT, 'scripts/website-team/execute.sh'), 'utf8')
    const strip = (t: string) => t.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

    // Neither path may reach for --auto: with nothing required, it does not wait.
    expect(strip(exec), 'execute.sh merges without waiting').not.toMatch(/gh pr merge --auto/)
    expect(pkg.scripts['pr:merge'], 'the human path merges without waiting').not.toMatch(/--auto/)

    // Both must name the SAME gate, and it must be the shared install.
    const GATE = /\$\{SWECHHA_MERGE_GATE:-\$HOME\/\.swechha-ai\/merge-when-green\.sh\}/
    expect(strip(exec), 'execute.sh no longer delegates to the shared gate').toMatch(GATE)
    expect(pkg.scripts['pr:merge'], 'npm run pr:merge must use the same gate').toMatch(GATE)
    expect(strip(exec), 'the gate must not have been copied back into this repository')
      .not.toMatch(/scripts\/website-team\/merge-when-green/)
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
