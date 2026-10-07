import { describe, it, expect } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  readFileSync, mkdtempSync, writeFileSync, chmodSync, mkdirSync, existsSync, copyFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'

/**
 * A TASK A PERSON FILED MUST BE WORK, NOT A "DO NOT DUPLICATE" WARNING.
 *
 * The runner read two inbox FILES as work and showed open spine tasks only as
 * ALREADY OPEN. A task filed through the CLI, the MCP server or the Command
 * Centre (origin `human`) was therefore never picked up: website-20261006-0005
 * sat for a day. `org task pickup` is the read; filed-for-you.py is the runner's
 * thin, never-failing wrapper around it, run.sh puts the result in the prompt,
 * and on-change.sh wakes the department on a NEW NOW/TODAY task exactly as it
 * does for an inbox NOW.
 *
 * ★ OPT-IN PER DEPARTMENT (TEAM_PICKUP, default `website`). One runner serves
 *   website, fundraising and communications; a department not listed must see
 *   NOTHING change, byte for byte.
 * ★ ABSENT IS NOT EMPTY. A missing CLI, an unknown subcommand, a hang or garbage
 *   output is `UNKNOWN`, which must never read as "nothing is filed".
 *
 * No real store, vault or launchd job is touched: every test uses temp dirs and
 * a stub `org`.
 */
const ROOT = join(__dirname, '..')
const DIR = join(ROOT, 'scripts', 'website-team')
const HELPER = join(DIR, 'filed-for-you.py')

const tmp = (p: string) => mkdtempSync(join(tmpdir(), p))
function stubFile(dir: string, name: string, body: string): string {
  const p = join(dir, name)
  writeFileSync(p, body)
  chmodSync(p, 0o755)
  return p
}

const LISTING =
  'FILED FOR YOU — 2 open task(s) a person filed in the task store for website, not yet owned or started.\n' +
  'Treat each like an inbox item.\n' +
  '  [NOW]         website-20261006-0005  Fix the footer  (filed 2026-10-06, 5h)\n' +
  '  [THIS WEEK]   website-20261006-0006  Tidy the nav  (filed 2026-10-06, 4h)'
const NONE = 'FILED FOR YOU: none open for website.'
const JSON_TWO = JSON.stringify({
  department: 'website', ok: true,
  tasks: [
    { id: 'website-20261006-0005', title: 'NOW: Fix the footer', priority: 'NOW', created: 'x', due: null, age_hours: 5 },
    { id: 'website-20261006-0006', title: 'Tidy the nav', priority: 'THIS WEEK', created: 'x', due: null, age_hours: 4 },
  ],
})

/** A stub org that answers `task pickup` from a file, so a test can change it between runs. */
function stubOrg(dir: string): { cli: string; out: string; set: (v: string, code?: number) => void } {
  const out = join(dir, 'pickup.out')
  const code = join(dir, 'pickup.code')
  const cli = stubFile(dir, 'org',
    `#!/usr/bin/env bash\n` +
    `if [ "$1" = task ] && [ "$2" = pickup ]; then cat "${out}"; exit "$(cat "${code}" 2>/dev/null || echo 0)"; fi\n` +
    `if [ "$1" = task ] && [ "$2" = list ]; then echo '[]'; exit 0; fi\n` +
    `echo "usage: org <command>" >&2; exit 2\n`)
  const set = (v: string, c = 0) => { writeFileSync(out, v); writeFileSync(code, String(c)) }
  set('')
  return { cli, out, set }
}

function helper(args: string[], env: Record<string, string>) {
  const r = spawnSync('python3', [HELPER, ...args], {
    env: { ...process.env, TEAM_PICKUP: '', ...env }, encoding: 'utf8',
  })
  return { out: r.stdout, err: r.stderr, code: r.status }
}
// An empty TEAM_PICKUP in the env above means "unset" to the helper; tests that
// care set it explicitly. Remove the key entirely for the default-case tests.
function helperDefault(args: string[], env: Record<string, string>) {
  const e: NodeJS.ProcessEnv = { ...process.env, ...env }
  delete e.TEAM_PICKUP
  const r = spawnSync('python3', [HELPER, ...args], { env: e, encoding: 'utf8' })
  return { out: r.stdout, err: r.stderr, code: r.status }
}

describe('filed-for-you.py', () => {
  it('passes a normal listing through unchanged', () => {
    const d = tmp('ffy-'); const o = stubOrg(d); o.set(LISTING)
    const r = helperDefault(['website'], { ORG_CLI: o.cli })
    expect(r.code).toBe(0)
    expect(r.out.trim()).toBe(LISTING)
  })

  it('passes the "none open" line through', () => {
    const d = tmp('ffy-'); const o = stubOrg(d); o.set(NONE)
    const r = helperDefault(['website'], { ORG_CLI: o.cli })
    expect(r.code).toBe(0)
    expect(r.out.trim()).toBe(NONE)
  })

  it('forwards --urgent and --limit to the CLI', () => {
    const d = tmp('ffy-')
    const cli = stubFile(d, 'org', '#!/usr/bin/env bash\necho "FILED FOR YOU: none open — ARGS: $*"\n')
    const r = helperDefault(['website', '--urgent', '--limit', '7'], { ORG_CLI: cli })
    expect(r.out).toContain('task pickup website')
    expect(r.out).toContain('--urgent')
    expect(r.out).toContain('--limit 7')
  })

  it('★ a missing CLI says UNKNOWN, never nothing, and exits 0', () => {
    const d = tmp('ffy-')
    const r = helperDefault(['website'], { ORG_CLI: join(d, 'absent') })
    expect(r.code).toBe(0)
    expect(r.out).toMatch(/^FILED FOR YOU: UNKNOWN — /)
    expect(r.out).toMatch(/never as 'there are none'/)
  })

  it('★ an unknown subcommand (older org) says UNKNOWN and exits 0', () => {
    const d = tmp('ffy-')
    const cli = stubFile(d, 'org', '#!/usr/bin/env bash\necho "usage: org task {list,show}" >&2\nexit 2\n')
    const r = helperDefault(['website'], { ORG_CLI: cli })
    expect(r.code).toBe(0)
    expect(r.out).toMatch(/^FILED FOR YOU: UNKNOWN — /)
  })

  it('★ usage text on stdout with exit 0 is still UNKNOWN (marker missing)', () => {
    const d = tmp('ffy-')
    const cli = stubFile(d, 'org', '#!/usr/bin/env bash\necho "usage: org task {list,show}"\nexit 0\n')
    const r = helperDefault(['website'], { ORG_CLI: cli })
    expect(r.out).toMatch(/^FILED FOR YOU: UNKNOWN — /)
  })

  it('★ garbage output is UNKNOWN', () => {
    const d = tmp('ffy-'); const o = stubOrg(d); o.set('\u0000\u0001 not a listing')
    const r = helperDefault(['website'], { ORG_CLI: o.cli })
    expect(r.code).toBe(0)
    expect(r.out).toMatch(/^FILED FOR YOU: UNKNOWN — /)
  })

  it('★ a hanging CLI times out into UNKNOWN (timeout is overridable for tests)', () => {
    const d = tmp('ffy-')
    const cli = stubFile(d, 'org', '#!/usr/bin/env bash\nexec sleep 30\n')
    const t0 = Date.now()
    const r = helperDefault(['website'], { ORG_CLI: cli, FILED_FOR_YOU_TIMEOUT: '1' })
    expect(Date.now() - t0).toBeLessThan(15000)
    expect(r.code).toBe(0)
    expect(r.out).toMatch(/^FILED FOR YOU: UNKNOWN — .*timed out/)
  })

  it('--json passes a valid document through', () => {
    const d = tmp('ffy-'); const o = stubOrg(d); o.set(JSON_TWO)
    const r = helperDefault(['website', '--json'], { ORG_CLI: o.cli })
    expect(JSON.parse(r.out)).toEqual(JSON.parse(JSON_TWO))
  })

  it('--json falls back to {ok:false} for a missing CLI, garbage, and a wrong shape', () => {
    const d = tmp('ffy-'); const o = stubOrg(d)
    const expected = expect.objectContaining({ department: 'website', ok: false, tasks: [] })
    expect(JSON.parse(helperDefault(['website', '--json'], { ORG_CLI: join(d, 'absent') }).out)).toEqual(expected)
    o.set('garbage')
    expect(JSON.parse(helperDefault(['website', '--json'], { ORG_CLI: o.cli }).out)).toEqual(expected)
    o.set('{"hello":1}')
    expect(JSON.parse(helperDefault(['website', '--json'], { ORG_CLI: o.cli }).out)).toEqual(expected)
    o.set('usage', 2)
    const r = helperDefault(['website', '--json'], { ORG_CLI: o.cli })
    expect(r.code).toBe(0)
    expect(JSON.parse(r.out)).toEqual(expected)
  })

  it('★ a department not opted in prints NOTHING, in both modes, and never calls the CLI', () => {
    const d = tmp('ffy-')
    const marker = join(d, 'called')
    const cli = stubFile(d, 'org', `#!/usr/bin/env bash\ntouch "${marker}"\necho "${LISTING}"\n`)
    for (const args of [['fundraising'], ['fundraising', '--json'], ['communications', '--urgent']]) {
      const r = helperDefault(args, { ORG_CLI: cli })
      expect(r.code).toBe(0)
      expect(r.out).toBe('')
    }
    expect(existsSync(marker)).toBe(false)
  })

  it('TEAM_PICKUP=website,fundraising opts fundraising in (whitespace tolerated)', () => {
    const d = tmp('ffy-'); const o = stubOrg(d); o.set(NONE)
    const r = helper(['fundraising'], { ORG_CLI: o.cli, TEAM_PICKUP: 'website, fundraising' })
    expect(r.out.trim()).toBe(NONE)
    const r2 = helper(['communications'], { ORG_CLI: o.cli, TEAM_PICKUP: 'website, fundraising' })
    expect(r2.out).toBe('')
  })

  it('exits 0 even with no department argument', () => {
    const r = helperDefault([], { ORG_CLI: '/nonexistent' })
    expect(r.code).toBe(0)
  })
})

describe('run.sh puts FILED FOR YOU in the prompt', () => {
  const runSh = readFileSync(join(DIR, 'run.sh'), 'utf8')

  /** Run the prompt-building region of a run.sh in isolation and return $PROMPT. */
  function prompt(src: string, mode: 'work' | 'review', department: string,
                  env: Record<string, string>): string {
    const start = src.indexOf('OPEN_TASKS="$(python3')
    const lines = src.slice(start).split('\n')
    // The region ends at the `fi` closing the review/work if-else.
    const workAt = lines.findIndex((l) => l.includes('Run in **work** mode'))
    const end = lines.findIndex((l, i) => i > workAt && l === 'fi')
    const region = lines.slice(0, end + 1).join('\n')
    const script =
      `set -u\nLIB='${DIR}'\nDEPARTMENT='${department}'\nMODE='${mode}'\n` +
      `INBOX=/i/inbox.md\nORG_INBOX=/o/inbox.md\nRECORDS=/r\n${region}\nprintf '%s' "$PROMPT"\n`
    return execFileSync('bash', ['-c', script], {
      env: { ...process.env, ...env }, encoding: 'utf8',
    })
  }
  const baseline = () => execFileSync('git', ['show', 'origin/main:scripts/website-team/run.sh'],
    { cwd: ROOT, encoding: 'utf8' })

  const SENTENCES = [
    'A task in FILED FOR YOU was filed in the task store by a person.',
    'It is WORK, not a duplicate warning: it outranks your own priorities exactly like an inbox item.',
    'You cannot close a task; report what you did with each, by id, under `## Inbox`.',
    'If it is also listed under ALREADY OPEN that is the same task, not a second one.',
  ]

  it('work prompt carries the block and the sentences, right after the inbox paragraph', () => {
    const d = tmp('ffy-run-'); const o = stubOrg(d); o.set(LISTING)
    delete process.env.TEAM_PICKUP
    const p = prompt(runSh, 'work', 'website', { ORG_CLI: o.cli })
    expect(p).toContain(LISTING)
    const flat = p.replace(/\s+/g, ' ')
    for (const s of SENTENCES) expect(flat).toContain(s)
    expect(p.indexOf('under `## Inbox`.')).toBeLessThan(p.indexOf('FILED FOR YOU —'))
    expect(p.indexOf('FILED FOR YOU —')).toBeLessThan(p.indexOf('You are read-only'))
    // The ALREADY OPEN block and its rules are untouched.
    expect(p).toContain('DO NOT write a brief for something already on it')
  })

  it('review prompt mentions it too', () => {
    const d = tmp('ffy-run-'); const o = stubOrg(d); o.set(LISTING)
    const p = prompt(runSh, 'review', 'website', { ORG_CLI: o.cli })
    expect(p).toContain(LISTING)
    expect(p.replace(/\s+/g, ' ')).toContain(SENTENCES[1])
  })

  it('★ byte-identical to the previous runner for a department not opted in', () => {
    const d = tmp('ffy-run-'); const o = stubOrg(d); o.set(LISTING)
    for (const mode of ['work', 'review'] as const) {
      const now = prompt(runSh, mode, 'fundraising', { ORG_CLI: o.cli, TEAM_PICKUP: 'website' })
      const before = prompt(baseline(), mode, 'fundraising', { ORG_CLI: o.cli })
      expect(now).toBe(before)
      expect(now).not.toContain('FILED FOR YOU')
    }
  })

  it('★ byte-identical to the previous runner when the helper prints nothing', () => {
    // An opted-in department whose helper yields nothing (e.g. helper absent):
    // the prompt must not gain a stray blank line.
    const d = tmp('ffy-run-'); const o = stubOrg(d); o.set(LISTING)
    for (const mode of ['work', 'review'] as const) {
      const now = prompt(runSh.replace('"$LIB/filed-for-you.py"', '"$LIB/does-not-exist.py"'),
        mode, 'website', { ORG_CLI: o.cli })
      const before = prompt(baseline(), mode, 'website', { ORG_CLI: o.cli })
      expect(now).toBe(before)
    }
  })

  it('an opted-in department with an unreadable store is told UNKNOWN, not nothing', () => {
    const p = prompt(runSh, 'work', 'website', { ORG_CLI: '/nonexistent/org' })
    expect(p).toContain('FILED FOR YOU: UNKNOWN')
  })
})

describe('on-change.sh folds the task store into the wake decision', () => {
  const INBOX_EMPTY = '# Inbox\n\n## Open\n\n<!-- nothing -->\n\n## Done\n'

  function rig() {
    const d = tmp('ffy-oc-')
    const repo = join(d, 'repo'); const sdir = join(repo, 'scripts', 'website-team')
    mkdirSync(sdir, { recursive: true })
    copyFileSync(HELPER, join(sdir, 'filed-for-you.py'))
    stubFile(sdir, 'inbox-intake.py', '#!/usr/bin/env bash\nexit 0\n')
    const woke = join(d, 'woke')
    stubFile(sdir, 'snapshot-run.sh', `#!/usr/bin/env bash\necho "$@" >> "${woke}"\n`)
    const vault = join(d, 'vault')
    mkdirSync(join(vault, 'swechha', 'website', 'team'), { recursive: true })
    mkdirSync(join(vault, 'swechha', 'ai'), { recursive: true })
    const inbox = join(vault, 'swechha', 'website', 'team', 'inbox.md')
    writeFileSync(inbox, INBOX_EMPTY)
    writeFileSync(join(vault, 'swechha', 'ai', 'inbox.md'), INBOX_EMPTY)
    const state = join(d, 'state'); mkdirSync(state)
    const o = stubOrg(d)
    const logev = stubFile(d, 'log-event.py', '#!/usr/bin/env bash\nexit 0\n')
    const run = (extra: Record<string, string> = {}) => {
      const e: NodeJS.ProcessEnv = {
        ...process.env,
        WEBSITE_TEAM_REPO: repo, WEBSITE_TEAM_VAULT: vault, WEBSITE_TEAM_STATE: state,
        WEBSITE_TEAM_LOCK: join(d, 'lock'), WEBSITE_TEAM_MIN_INTERVAL: '0',
        SWECHHA_LOG_EVENT: logev, ORG_CLI: o.cli, ...extra,
      }
      delete e.TEAM_PICKUP
      if (extra.TEAM_PICKUP) e.TEAM_PICKUP = extra.TEAM_PICKUP
      const r = spawnSync('bash', [join(DIR, 'on-change.sh')], { env: e, encoding: 'utf8' })
      return { ...r, woke: existsSync(woke) ? readFileSync(woke, 'utf8').trim().split('\n').filter(Boolean).length : 0 }
    }
    const seen = () => readFileSync(join(state, 'inbox-seen.website'), 'utf8').trim()
    return { d, o, inbox, run, seen, woke }
  }
  const task = (id: string, priority: string) =>
    ({ id, title: `${priority}: t`, priority, created: 'x', due: null, age_hours: 1 })
  const doc = (...tasks: unknown[]) => JSON.stringify({ department: 'website', ok: true, tasks })

  it('a new NOW human task with an unchanged inbox wakes the department', () => {
    const r = rig(); r.o.set(doc(task('website-1', 'NOW')))
    const res = r.run()
    expect(res.status).toBe(0)
    expect(res.woke).toBe(1)
    expect(res.stdout).toMatch(/urgent item/)
  })

  it('a TODAY task wakes too', () => {
    const r = rig(); r.o.set(doc(task('website-1', 'TODAY')))
    expect(r.run().woke).toBe(1)
  })

  it('a THIS WEEK task is recorded and does not wake', () => {
    const r = rig(); r.o.set(doc(task('website-2', 'THIS WEEK'), task('website-3', 'BACKLOG')))
    const res = r.run()
    expect(res.woke).toBe(0)
    expect(res.stdout).toMatch(/none marked NOW or TODAY/)
    expect(existsSync(join(r.d, 'state', 'inbox-seen.website'))).toBe(true)
  })

  it('★ the same set twice does not wake a second time', () => {
    const r = rig(); r.o.set(doc(task('website-1', 'NOW')))
    expect(r.run().woke).toBe(1)
    expect(r.run().woke).toBe(1) // still 1: the hash short-circuits
  })

  it('a second, different NOW task wakes again', () => {
    const r = rig(); r.o.set(doc(task('website-1', 'NOW')))
    r.run()
    r.o.set(doc(task('website-1', 'NOW'), task('website-9', 'NOW')))
    expect(r.run().woke).toBe(2)
  })

  it('★ ok:false is not "no tasks": no wake, no crash, the marker is in the recorded hash', () => {
    const r = rig()
    r.o.set('garbage') // helper reports ok:false
    const res = r.run()
    expect(res.status).toBe(0)
    expect(res.woke).toBe(0)
    expect(res.stderr + res.stdout).toMatch(/on-change: task store unreadable \(.+\) — inbox rules only/)
    const unknownHash = r.seen()
    // The marker is literally in what was hashed: it differs from a clean empty read.
    const emptyInboxHash = createHash('sha1').update('').digest('hex')
    expect(unknownHash).not.toBe(emptyInboxHash)
    expect(unknownHash).toBe(createHash('sha1').update('TASKS-UNKNOWN').digest('hex'))
    // A later successful read changes the hash and is re-evaluated.
    r.o.set(doc(task('website-1', 'NOW')))
    expect(r.run().woke).toBe(1)
  })

  it('a missing subcommand (older org) behaves like ok:false, never a failure', () => {
    const r = rig(); r.o.set('usage: org task', 2)
    const res = r.run()
    expect(res.status).toBe(0)
    expect(res.woke).toBe(0)
  })

  it('★ inbox NOW still wakes exactly as before, with or without a task store', () => {
    const r = rig()
    writeFileSync(r.inbox, '# Inbox\n\n## Open\n\n- NOW: fix the thing\n\n## Done\n')
    r.o.set('usage', 2) // unknown store must not suppress an inbox wake
    expect(r.run().woke).toBe(1)
  })

  it('★ a department not opted in is unchanged: tasks ignored, hash is the inbox hash alone', () => {
    const r = rig(); r.o.set(doc(task('website-1', 'NOW')))
    const res = r.run({ TEAM_PICKUP: 'fundraising' })
    expect(res.woke).toBe(0)
    expect(res.stdout + res.stderr).not.toMatch(/task store/)
    expect(r.seen()).toBe(createHash('sha1').update('').digest('hex'))
  })

  it('zero tasks (ok:true) leaves the hash exactly as the inbox-only watcher computed it', () => {
    const r = rig(); r.o.set(doc())
    r.run()
    expect(r.seen()).toBe(createHash('sha1').update('').digest('hex'))
  })

  it('every task is counted in JOBS even when the inbox is empty (the hash is recorded)', () => {
    const r = rig(); r.o.set(doc(task('website-5', 'WATCH')))
    r.run()
    expect(r.seen()).toBe(createHash('sha1').update('TASKS:website-5').digest('hex'))
  })
})

describe('shipped artefacts', () => {
  it('the oninbox plist template watches the department task directory', () => {
    const plist = readFileSync(join(DIR, 'com.swechha.website-team-oninbox.plist'), 'utf8')
    expect(plist).toContain('/Users/administrator/.swechha-ai/tasks/website')
    expect(plist).toMatch(/INSTALLED copy/)
    // The two inbox files are still watched.
    expect(plist).toContain('/swechha-vault/swechha/website/team/inbox.md')
    expect(plist).toContain('/swechha-vault/swechha/ai/inbox.md')
  })

  it('on-change.sh documents the task store in its header', () => {
    const src = readFileSync(join(DIR, 'on-change.sh'), 'utf8').split('\n').slice(0, 60).join('\n')
    expect(src).toMatch(/human-filed tasks/i)
  })
})
