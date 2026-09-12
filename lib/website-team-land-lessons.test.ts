import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * THE RATCHET MUST ACTUALLY LAND.
 *
 * From 2026-09-11 to 2026-09-12 `reconcile.py` printed `granting 'gh run list'`
 * on run after run while `docs/website-team/tool-grants.json` stayed
 * `grants: []`. The learning was correct every time and reached nothing.
 *
 * The cause is a two-part interaction that neither part is wrong about:
 *
 *   merge-when-green.sh merges with `--squash`, deliberately, so the whole
 *   change arrives as one commit (auto_merge condition 9). A squash merge does
 *   not make the branch head an ancestor of main, and delete_branch_on_merge is
 *   false, so `team/lessons-<date>` survives pointing at a commit main will
 *   never contain.
 *
 *   land-lessons.sh then rebuilt that same branch from origin/main, so its push
 *   was a non-fast-forward. It was rejected, `set -e` ended the script, and the
 *   earned grant died with the temporary worktree.
 *
 * Only the SECOND run of a day hits it, which is why it looked intermittent and
 * why the first lessons PR of each day landed normally.
 *
 * These tests build a real git remote and drive the real script. The scenario is
 * the whole test: a first run that lands, a squash merge that leaves the ref
 * behind, and a second run that must still deliver its grant.
 */
const ROOT = join(__dirname, '..')
const sh = (script: string, env: NodeJS.ProcessEnv = {}) =>
  execFileSync('bash', ['-c', script], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

/** A remote, a clone, the real scripts, and stubs for `gh` and the merge gate. */
function estate() {
  const dir = mkdtempSync(join(tmpdir(), 'land-'))
  const origin = join(dir, 'origin.git')
  const repo = join(dir, 'repo')
  const bin = join(dir, 'bin')
  mkdirSync(bin, { recursive: true })

  // Two run_blocked events for one verb, in two DIFFERENT runs — reconcile's
  // threshold. `gh run list` is provably read-only, so it is auto-grantable.
  const activity = join(dir, 'activity.jsonl')
  writeFileSync(
    activity,
    [
      { ts: '2026-09-12T09:00:00+0530', pid: 111, event: 'run_blocked', refused: 'gh run list' },
      { ts: '2026-09-12T10:00:00+0530', pid: 222, event: 'run_blocked', refused: 'gh run list' },
    ]
      .map((r) => JSON.stringify(r))
      .join('\n') + '\n',
  )

  const report = join(dir, 'report.md')
  writeFileSync(report, '# Run\n\n## Lessons\n\n### A thing learned\n\nBody.\n')

  sh(`
    set -euo pipefail
    git init -q --bare "${origin}" -b main
    git init -q "${repo}" -b main
    cd "${repo}"
    git config user.email t@t && git config user.name t
    mkdir -p docs/website-team scripts/website-team
    printf '# Lessons\\n' > docs/website-team/lessons.md
    printf '{ "grants": [] }\\n' > docs/website-team/tool-grants.json
    git add -A && git commit -q -m init
    git remote add origin "${origin}" && git push -q -u origin main
  `)

  for (const f of ['land-lessons.sh', 'append-lessons.py', 'reconcile.py', 'tool-grants.py']) {
    cpSync(join(ROOT, 'scripts/website-team', f), join(repo, 'scripts/website-team', f))
  }
  chmodSync(join(repo, 'scripts/website-team/land-lessons.sh'), 0o755)

  // `gh`, reduced to the three calls this script makes. PR state lives in a file
  // so the merge-gate stub can close it, exactly as a real merge would.
  const state = join(dir, 'pr-state')
  writeFileSync(state, 'none')
  writeFileSync(
    join(bin, 'gh'),
    `#!/usr/bin/env bash
set -euo pipefail
if [ "\${1:-}" = "pr" ] && [ "\${2:-}" = "create" ]; then
  echo open > "${state}"; echo "https://example.invalid/pr/1"; exit 0
fi
if [ "\${1:-}" = "pr" ] && [ "\${2:-}" = "view" ]; then
  [ "\$(cat "${state}")" = "open" ] || exit 1
  case "\$*" in *url*) echo "https://example.invalid/pr/1";; *) echo OPEN;; esac
  exit 0
fi
exit 1
`,
  )
  chmodSync(join(bin, 'gh'), 0o755)

  // The merge gate, faithful in the one way that matters: --squash, and the
  // branch ref is NOT deleted.
  const gate = join(bin, 'merge-gate.sh')
  writeFileSync(
    gate,
    `#!/usr/bin/env bash
set -euo pipefail
W="\$(mktemp -d)"
git clone -q "${origin}" "\$W"
cd "\$W"
git config user.email t@t && git config user.name t
git merge --squash "origin/\$(cat "${dir}/branch")" >/dev/null
git commit -q -m "squashed"
git push -q origin main
echo closed > "${state}"
`,
  )
  chmodSync(gate, 0o755)

  return { dir, origin, repo, bin, gate, activity, report, state }
}

const run = (e: ReturnType<typeof estate>) => {
  // The gate stub needs to know which branch to squash; the script names it by date.
  writeFileSync(join(e.dir, 'branch'), `team/lessons-${sh('date +%Y%m%d').trim()}`)
  return sh(`"${e.repo}/scripts/website-team/land-lessons.sh" "${e.report}" 2>&1`, {
    PATH: `${e.bin}:${process.env.PATH}`,
    WEBSITE_TEAM_REPO: e.repo,
    WEBSITE_TEAM_ACTIVITY: e.activity,
    SWECHHA_MERGE_GATE: e.gate,
    HOME: e.dir,
  })
}

/** The ledger as it exists on the remote's main — the only copy that counts. */
const ledgerOnMain = (e: ReturnType<typeof estate>) =>
  JSON.parse(
    sh(`git -C "${e.repo}" fetch -q origin && git -C "${e.repo}" show origin/main:docs/website-team/tool-grants.json`),
  ).grants

describe('land-lessons: the ratchet reaches main', () => {
  it('lands an earned grant on the first run of the day', () => {
    const e = estate()
    const out = run(e)
    expect(out).toContain("granting 'gh run list'")
    expect(ledgerOnMain(e)).toContain('gh run list')
  })

  /**
   * THE REGRESSION. Before the fix this second run died on a rejected
   * non-fast-forward push and the grant was lost with the worktree.
   */
  it('still lands after a squash merge has left the branch ref behind', () => {
    const e = estate()
    run(e) // first run: lands, and the gate squash-merges it

    // The precondition that breaks the old code, asserted rather than assumed:
    // the surviving branch is not an ancestor of main.
    const branch = readFileSync(join(e.dir, 'branch'), 'utf8').trim()
    const ancestor = sh(
      `git -C "${e.repo}" fetch -q origin; git -C "${e.repo}" merge-base --is-ancestor origin/${branch} origin/main && echo yes || echo no`,
    ).trim()
    expect(ancestor).toBe('no')

    // A fresh grant to carry, so a pass cannot come from the first run's work.
    writeFileSync(
      e.activity,
      readFileSync(e.activity, 'utf8') +
        [
          { ts: '2026-09-12T11:00:00+0530', pid: 333, event: 'run_blocked', refused: 'gh workflow list' },
          { ts: '2026-09-12T12:00:00+0530', pid: 444, event: 'run_blocked', refused: 'gh workflow list' },
        ]
          .map((r) => JSON.stringify(r))
          .join('\n') + '\n',
    )

    const out = run(e)
    expect(out).toContain('replacing the stale ref')
    expect(out).not.toContain('PUSH FAILED')
    expect(ledgerOnMain(e)).toContain('gh workflow list')
  })

  /**
   * A push that genuinely cannot succeed must still exit 0 — bookkeeping never
   * breaks the run — but it must SAY SO. The old code's only unguarded command
   * was this one, so the single step that failed in production was also the only
   * one that could die without printing a reason.
   */
  it('reports a failed push instead of dying silently, and still exits 0', () => {
    const e = estate()
    // Fetch still works; the push is refused. A pre-receive hook is the cheapest
    // faithful stand-in for a protected ref or a rejected non-fast-forward.
    const hook = join(e.origin, 'hooks', 'pre-receive')
    writeFileSync(hook, '#!/bin/sh\nexit 1\n')
    chmodSync(hook, 0o755)
    const out = run(e)
    expect(out).toContain('PUSH FAILED')
    expect(out).toContain('are NOT saved')
    expect(ledgerOnMain(e)).toEqual([]) // and it really did not land
  })

  /**
   * Found by the test above rather than by reading: `git fetch` was the second
   * unguarded command, and this runs on a laptop that sleeps and changes
   * networks. An unreachable origin is ordinary, and it used to end the script
   * in the same silence.
   */
  it('reports an unreachable origin instead of dying silently, and still exits 0', () => {
    const e = estate()
    sh(`rm -rf "${e.origin}"`)
    const out = run(e)
    expect(out).toContain('CANNOT REACH origin')
    expect(out).toContain('are NOT saved')
  })
})
