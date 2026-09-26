import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync, writeFileSync, chmodSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * ★ SEVEN DAYS OF `reason=unknown`, AND NOTHING REFUSED. From 2026-09-22 the
 *   Claude CLI launchd resolves was logged out. Every run of both departments
 *   took the lock, built a worktree, reached the model and died there as
 *   `reason=unknown exit_code=1 stderr=empty`, filing one more "could not reach
 *   the model" task a day (forensic audit 2026-09-24, defect 1).
 *
 *   run.sh now asks org-claude first. These run the REAL run.sh, up to the
 *   refusal, against stubs: an `org-claude` that reports a reason, an `org`
 *   that records its argv, and an event logger that records its events. The
 *   model stub records every call, and a test fails if it was ever asked to
 *   answer a prompt.
 */
const DIR = join(__dirname, '..', 'scripts', 'website-team')
const RUN_SH = join(DIR, 'run.sh')
const SRC = readFileSync(RUN_SH, 'utf8')

type Sandbox = { dir: string; env: Record<string, string>; read: (f: string) => string }

function sandbox(opts: { preflight?: string; fallbackLoggedIn?: boolean } = {}): Sandbox {
  const dir = mkdtempSync(join(tmpdir(), 'authpf-'))
  const bin = join(dir, 'bin')
  mkdirSync(bin)
  const w = (p: string, body: string) => { writeFileSync(p, body); chmodSync(p, 0o755) }
  const log = (name: string) => join(dir, name)

  // The spine: records argv; `task new` returns an id; `--help` advertises --key.
  w(join(dir, 'org'), '#!/usr/bin/env bash\n' +
    'if [ "$1 $2 $3" = "task new --help" ]; then echo "  --key KEY"; exit 0; fi\n' +
    `printf "%s\\n" "$*" >> "${log('org.log')}"\n` +
    'case "$1 $2" in "task new") echo "website-19700101-0001" ;; "incident detect") echo "inc0001" ;; esac\nexit 0\n')
  // The event logger: <department> <actor> <event> key=value...
  w(join(dir, 'log-event.py'), `#!/usr/bin/env python3\nimport sys\nopen(${JSON.stringify(log('events.log'))},"a").write(" ".join(sys.argv[1:])+"\\n")\n`)
  // Anything that would reach a model writes here.
  const modelLog = log('model.log')
  if (opts.preflight !== undefined) {
    w(join(dir, 'org-claude'), '#!/usr/bin/env bash\n' +
      `printf "%s\\n" "$*" >> "${modelLog}"\n` +
      `if [ "$1" = "--preflight" ]; then echo "${opts.preflight}"; [ "${opts.preflight}" = ok ] && exit 0; exit 9; fi\n` +
      'echo \'{"type":"result","is_error":true,"result":"stub must never be asked"}\'; exit 1\n')
  }
  // The fallback: a bare `claude` on PATH, logged in or not.
  w(join(bin, 'claude'), '#!/usr/bin/env bash\n' +
    `printf "%s\\n" "$*" >> "${modelLog}"\n` +
    `if [ "$1 $2" = "auth status" ]; then echo '{"loggedIn": ${opts.fallbackLoggedIn ? 'true' : 'false'}}'; exit 0; fi\n` +
    'exit 1\n')

  // A vault the preflight can read, and a department repo with no ceiling.
  const vault = join(dir, 'vault')
  mkdirSync(join(vault, 'swechha/website/team'), { recursive: true })
  mkdirSync(join(vault, 'swechha/website/decisions'), { recursive: true })
  writeFileSync(join(vault, 'swechha/website/team/inbox.md'), '# Inbox\n\n## Open\n\n## Done\n')
  const repo = join(dir, 'repo')
  mkdirSync(join(repo, 'scripts/website-team'), { recursive: true })
  // A worktree script that must never be reached by a refused run.
  w(join(repo, 'scripts/website-team/worktree.sh'),
    `#!/usr/bin/env bash\nprintf "%s\\n" "$*" >> "${log('wt.log')}"\n[ "$1" = path ] && echo /nowhere\nexit 0\n`)

  const env: Record<string, string> = {
    PATH: `${bin}:/usr/bin:/bin`,
    HOME: dir,
    TEAM_DEPARTMENT: 'website',
    TEAM_REPO: repo,
    TEAM_VAULT: vault,
    ORG_CLI: join(dir, 'org'),
    SWECHHA_LOG_EVENT: join(dir, 'log-event.py'),
    ORG_CLAUDE: opts.preflight !== undefined ? join(dir, 'org-claude') : join(dir, 'no-such-org-claude'),
    NET_PROBE_HOST: 'localhost',
    TEAM_ACTIVITY_LOG: join(dir, 'activity.jsonl'),
    ORG_JOB_LABEL: 'com.swechha.website-team-work',
  }
  const read = (f: string) => (existsSync(log(f)) ? readFileSync(log(f), 'utf8') : '')
  return { dir, env, read }
}

function runner(sb: Sandbox, args: string[] = ['work']): { status: number; out: string } {
  try {
    const out = execFileSync('/bin/bash', [RUN_SH, ...args], { env: sb.env as unknown as NodeJS.ProcessEnv, encoding: 'utf8', stdio: 'pipe' })
    return { status: 0, out }
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string }
    return { status: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` }
  }
}

describe('run.sh refuses before spending when Claude will not authenticate', () => {
  it('refuses with the preflight reason, exit 8, and never asks the model', () => {
    const sb = sandbox({ preflight: 'auth-missing' })
    const { status, out } = runner(sb)
    expect(status, out).toBe(8)
    expect(sb.read('events.log')).toMatch(/website manager run_refused reason=auth-missing mode=work/)
    expect(sb.read('events.log')).toContain('job=com.swechha.website-team-work')
    // Only the preflight was ever asked; no prompt went anywhere.
    expect(sb.read('model.log').trim().split('\n')).toEqual(['--preflight'])
    // The lock and the worktree are never touched by a run that could not start.
    expect(sb.read('wt.log')).toBe('')
    expect(sb.read('events.log')).not.toContain('run_started')
  })

  it('files ONE keyed task, escalates it, and raises a claude_auth incident', () => {
    const sb = sandbox({ preflight: 'auth-expired' })
    runner(sb)
    const org = sb.read('org.log')
    expect(org).toMatch(/task new website BLOCKED: Claude is not authenticated \(auth-expired\) — run `claude setup-token`, then `org auth claude-token` --origin schedule --key claude-auth:auth-expired/)
    expect(org.match(/^task new /gm)).toHaveLength(1)
    expect(org).toMatch(/task escalate website-19700101-0001/)
    expect(org).toMatch(/incident detect website claude_auth auth-expired --workflow website-work --notify/)
  })

  it('files the task in the department that refused, not always `website`', () => {
    const sb = sandbox({ preflight: 'auth-missing' })
    mkdirSync(join(sb.env.TEAM_VAULT, 'swechha/fundraising/team'), { recursive: true })
    mkdirSync(join(sb.env.TEAM_VAULT, 'swechha/fundraising/decisions'), { recursive: true })
    writeFileSync(join(sb.env.TEAM_VAULT, 'swechha/fundraising/team/inbox.md'), '## Open\n')
    mkdirSync(join(sb.env.TEAM_REPO, 'scripts/fundraising-team'), { recursive: true })
    const { status } = runner({ ...sb, env: { ...sb.env, TEAM_DEPARTMENT: 'fundraising' } })
    expect(status).toBe(8)
    expect(sb.read('org.log')).toMatch(/^task new fundraising BLOCKED: Claude is not authenticated/m)
  })

  it('an ok preflight passes through to the lock', () => {
    const sb = sandbox({ preflight: 'ok' })
    runner(sb)
    expect(sb.read('events.log')).not.toContain('run_refused')
    expect(sb.read('wt.log')).toMatch(/^lock /m)
  })

  it('without org-claude, the bare-claude fallback still refuses a logged-out CLI', () => {
    const sb = sandbox({ fallbackLoggedIn: false })
    const { status, out } = runner(sb)
    expect(status, out).toBe(8)
    expect(sb.read('events.log')).toMatch(/run_refused reason=auth-missing/)
    expect(sb.read('model.log').trim().split('\n')).toEqual(['auth status'])
  })

  it('the fallback reports binary-missing when there is no CLI at all', () => {
    const sb = sandbox({ fallbackLoggedIn: false })
    const { status } = runner({ ...sb, env: { ...sb.env, PATH: '/usr/bin:/bin' } })
    // /usr/bin may hold a real claude on some machine; only assert when it does not.
    if (!existsSync('/usr/bin/claude')) {
      expect(status).toBe(8)
      expect(sb.read('events.log')).toMatch(/run_refused reason=binary-missing/)
    }
  })
})

describe('run.sh --catch-up is silent unless a window was really missed', () => {
  it('does nothing, and records nothing, when it cannot read the window', () => {
    const sb = sandbox({ preflight: 'ok' })
    const { status, out } = runner(sb, ['work', '--catch-up'])
    expect(status).toBe(0)
    expect(out).toMatch(/catch-up: not running — window UNKNOWN/)
    expect(sb.read('events.log')).toBe('')
    expect(sb.read('model.log')).toBe('')
  })

  const plutil = existsSync('/usr/bin/plutil')
  it.skipIf(!plutil)('does nothing when today’s work run already finished', () => {
    const sb = sandbox({ preflight: 'ok' })
    mkdirSync(join(sb.dir, 'Library/LaunchAgents'), { recursive: true })
    // Midnight, so the window has always passed (outside 00:00–00:15).
    writeFileSync(join(sb.dir, 'Library/LaunchAgents/com.swechha.website-team-work.plist'),
      '<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>StartCalendarInterval</key>' +
      '<dict><key>Hour</key><integer>0</integer><key>Minute</key><integer>0</integer></dict></dict></plist>')
    const now = new Date()
    if (now.getHours() === 0 && now.getMinutes() < 16) return
    const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    writeFileSync(sb.env.TEAM_ACTIVITY_LOG, JSON.stringify({
      ts: `${day}T09:10:00+0530`, department: 'website', actor: 'manager', event: 'run_finished', mode: 'work',
    }) + '\n')
    const { status, out } = runner(sb, ['work', '--catch-up'])
    expect(status).toBe(0)
    expect(out).toMatch(/already finished today/)
    expect(sb.read('events.log')).toBe('')

    // And with no finished run it proceeds — once — then the hourly stamp holds it.
    writeFileSync(sb.env.TEAM_ACTIVITY_LOG, '')
    const first = runner(sb, ['work', '--catch-up'])
    expect(first.out).toMatch(/catch-up: today's work run is missing/)
    expect(existsSync(join(sb.dir, '.swechha-ai/catchup-website-work.stamp'))).toBe(true)
    const second = runner(sb, ['work', '--catch-up'])
    expect(second.status).toBe(0)
    expect(second.out).toMatch(/attempted within the hour/)
  })

  it.skipIf(!plutil)('reports a missing credential ONCE a day, then stays silent', () => {
    // DarkWake can eat the 09:00 run, so no scheduled run said it. The first
    // catch-up that sees the gap refuses loudly; after that it is silent.
    const sb = sandbox({ preflight: 'auth-missing' })
    mkdirSync(join(sb.dir, 'Library/LaunchAgents'), { recursive: true })
    writeFileSync(join(sb.dir, 'Library/LaunchAgents/com.swechha.website-team-work.plist'),
      '<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>StartCalendarInterval</key>' +
      '<dict><key>Hour</key><integer>0</integer><key>Minute</key><integer>0</integer></dict></dict></plist>')
    const now = new Date()
    if (now.getHours() === 0 && now.getMinutes() < 16) return
    writeFileSync(sb.env.TEAM_ACTIVITY_LOG, '')
    const first = runner(sb, ['work', '--catch-up'])
    expect(first.status, first.out).toBe(8)
    expect(sb.read('events.log')).toMatch(/run_refused reason=auth-missing/)
    expect(sb.read('model.log')).not.toMatch(/^-p/m)

    // Reported today: the next catch-up (past the hourly stamp) says nothing.
    const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    writeFileSync(sb.env.TEAM_ACTIVITY_LOG, JSON.stringify({
      ts: `${day}T09:00:05+0530`, department: 'website', actor: 'manager', event: 'run_refused',
      reason: 'auth-missing', mode: 'work',
    }) + '\n')
    execFileSync('rm', ['-f', join(sb.dir, '.swechha-ai/catchup-website-work.stamp')])
    const second = runner(sb, ['work', '--catch-up'])
    expect(second.status).toBe(0)
    expect(second.out).toMatch(/already reported today/)
  })

  it('refuses --catch-up for the weekly review', () => {
    const sb = sandbox({ preflight: 'ok' })
    expect(runner(sb, ['review', '--catch-up']).status).toBe(2)
  })
})

describe('run.sh structure', () => {
  it('every model call goes through $ORG_CLAUDE; no bare `claude -p` remains', () => {
    for (const f of ['run.sh', 'execute.sh']) {
      const code = readFileSync(join(DIR, f), 'utf8').split('\n')
        .filter((l) => !l.trimStart().startsWith('#') && !/^\s*echo /.test(l))
      expect(code.filter((l) => /(^|[\s(])claude -p/.test(l)), f).toEqual([])
      expect(code.some((l) => l.includes('"$ORG_CLAUDE" -p')), f).toBe(true)
    }
  })

  it('falls back to bare claude ONLY when org-claude is not executable', () => {
    expect(SRC).toMatch(/ORG_CLAUDE="\$\{ORG_CLAUDE:-\$HOME\/\.swechha-ai\/org-claude\}"/)
    expect(SRC).toMatch(/if \[ ! -x "\$ORG_CLAUDE" \]; then/)
  })

  it('the auth preflight sits after the ceiling and before the lock', () => {
    const auth = SRC.indexOf('AUTH="$(claude_preflight)"')
    expect(auth).toBeGreaterThan(SRC.indexOf('stage cost-ceiling'))
    expect(auth).toBeLessThan(SRC.indexOf('"$WT" lock "$$"'))
    expect(SRC.indexOf('claude_preflight() {')).toBeLessThan(auth)
    expect(SRC.indexOf('spine_new() {')).toBeLessThan(auth)
  })

  it('keeps the Mac awake for the run, right after the lock', () => {
    const lock = SRC.indexOf('"$WT" lock "$$"')
    const caf = SRC.indexOf('caffeinate -i -w $$')
    expect(caf).toBeGreaterThan(lock)
    expect(SRC.slice(lock, caf)).toMatch(/command -v caffeinate/)
  })

  it('files only its OWN inbox; the org inbox is `org route`’s (audit defect 7)', () => {
    const call = SRC.split('\n').find((l) => l.includes('"$LIB/inbox-intake.py"'))
    expect(call, 'the intake call is gone').toBeTruthy()
    expect(SRC).not.toMatch(/inbox-intake\.py[^\n]*\\\n[^\n]*--org-inbox/)
    expect(call).not.toContain('--org-inbox')
    // …while the manager still READS both.
    expect(SRC).toMatch(/The organisation's inbox: \$ORG_INBOX/)
    // And the inbox watcher, the other caller, files only its own too — while
    // the org inbox still wakes it.
    const watcher = readFileSync(join(DIR, 'on-change.sh'), 'utf8')
    expect(watcher).toMatch(/inbox-intake\.py" "\$DEPARTMENT" "\$INBOX" \|\| true/)
    expect(watcher.split('\n').filter((l) => !l.trimStart().startsWith('#')).join('\n'))
      .not.toContain('--org-inbox')
    expect(watcher).toMatch(/open_section "\$ORG_INBOX"/)
  })

  it('documents exit 8 beside the other refusal codes', () => {
    expect(SRC).toMatch(/Exit 8[^\n]*distinct from 5 \(vault\),\n\s*#\s*6 \(network \/ ceiling\) and 7/)
    expect(SRC).toMatch(/^  exit 8$/m)
  })
})
