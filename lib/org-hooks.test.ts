import { describe, it, expect } from 'vitest'
import { readFileSync, mkdtempSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * HOOKS ARE THE ONE EVENT SOURCE AN AGENT CANNOT LIE TO.
 *
 * `swechha/ai/events.md` states the organisation's rule: agents never write
 * events, the runtime around them does — because an observability layer an
 * agent can write is one it can lie to. Claude Code's hooks are the strongest
 * available form of that rule: they fire inside the Claude Code process, and
 * the agent can neither see nor suppress them.
 *
 * That makes what they record a security question, not just a schema question.
 * The hook payload contains full Bash command strings and full file contents,
 * and this log is plain text that a dashboard reads. So the tests below are
 * mostly about what must NOT come out the other end.
 *
 * Each test shells out to the real script with a real payload. Asserting on the
 * source text would pass for a script that reads well and logs the wrong thing.
 */

const ROOT = join(__dirname, '..')
const HOOK = join(ROOT, 'scripts/org/hook-event.py')

/** Run the hook exactly as Claude Code would, and return what it logged. */
function fire(hookName: string, payload: unknown): Record<string, unknown>[] {
  const home = mkdtempSync(join(tmpdir(), 'swechha-hook-'))
  execFileSync('python3', [HOOK, hookName], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    env: { ...process.env, SWECHHA_AI_HOME: home },
    cwd: ROOT,
  })
  let raw = ''
  try {
    raw = readFileSync(join(home, 'activity.jsonl'), 'utf8')
  } catch {
    return [] // No log file at all means it stayed silent, which is often right.
  }
  return raw.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
}

describe('hook events: what must never reach the log', () => {
  it('a failing Bash command records the tool, never the command line', () => {
    const events = fire('PostToolUseFailure', {
      tool_name: 'Bash',
      tool_input: { command: 'curl -H "Authorization: Bearer sk-live-DEADBEEF" https://api.example.com' },
    })
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('tool_failed')
    expect(events[0].tool).toBe('Bash')
    // The whole point. A command line is the single field most likely to carry
    // a key inline, and this log is read by a renderer, not by a vault.
    const line = JSON.stringify(events[0])
    expect(line, 'the command string reached the event log').not.toContain('sk-live-DEADBEEF')
    expect(line).not.toContain('Authorization')
    expect(line).not.toContain('curl')
  })

  it('an edit records the path and never the contents', () => {
    const events = fire('PostToolUse', {
      tool_name: 'Write',
      tool_input: {
        file_path: `${ROOT}/lib/secret-example.ts`,
        content: 'const NEON_API_KEY = "napi_REAL_LOOKING_VALUE"',
      },
    })
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('file_modified')
    // Repo-relative: the absolute path leaks the machine's directory layout,
    // and this repository is public.
    expect(events[0].path).toBe('lib/secret-example.ts')
    const line = JSON.stringify(events[0])
    expect(line, 'file contents reached the event log').not.toContain('napi_REAL_LOOKING_VALUE')
    expect(line).not.toContain(ROOT)
  })
})

describe('hook events: curation, so a run has a readable shape', () => {
  it('stays silent on the tools that fire constantly', () => {
    // PreToolUse fires on every Read, Grep and Glob. A log where the four
    // events that matter sit under four hundred reads is one nobody opens.
    for (const tool of ['Read', 'Grep', 'Glob', 'Bash', 'TodoWrite']) {
      expect(fire('PreToolUse', { tool_name: tool, tool_input: {} }),
        `${tool} should not produce an event`).toHaveLength(0)
    }
  })

  it('records the manager-to-specialist hop, which nothing else could see', () => {
    // events.md lists this as NOT_AVAILABLE: the brief file is deleted after
    // the run, so a dispatch left no trace anywhere.
    const events = fire('PreToolUse', {
      tool_name: 'Agent',
      tool_input: { subagent_type: 'website-engineering', description: 'Fix the headline mismatch' },
    })
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('task_started')
    expect(events[0].actor, 'the specialist must be the actor, not "claude-code"')
      .toBe('website-engineering')
  })
})

describe('hook events: the organisation, not this department', () => {
  it('the department is derived from the registry, never hardcoded', () => {
    const src = readFileSync(HOOK, 'utf8')
    const code = src.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')
    // A hand-kept repo→department map beside a registry that already knows is
    // this codebase's most repeated defect class. The registry is the source.
    expect(code).toContain('departments.json')
    expect(code, 'a department id is hardcoded in the mapping code')
      .not.toMatch(/==\s*["']website["']|["']website["']\s*if|return\s+["']website["']/)
    // An unlisted repository must say UNKNOWN rather than guess.
    expect(code).toMatch(/return "UNKNOWN"/)
  })

  it('it lives outside the website department, because a second one is coming', () => {
    expect(HOOK, 'a shared hook under scripts/website-team/ is the wrong home')
      .toContain('scripts/org/')
  })

  it('a person at the keyboard is never recorded as the department working', () => {
    const events = fire('SessionStart', { session_id: 'abcdef123' })
    expect(events[0].origin).toBe('interactive')
    expect(events[0].source).toBe('hook')
  })
})

describe('hook events: it must never break a run', () => {
  it('survives every malformed payload without a non-zero exit', () => {
    // A telemetry bug that stops the department working costs more than the
    // telemetry is worth. execFileSync throws on a non-zero exit, so these
    // calls completing at all is the assertion.
    for (const bad of ['', 'not json', '[]', 'null', '{"tool_input": "a string"}']) {
      expect(() => fire('PostToolUse', bad)).not.toThrow()
    }
  })
})

describe('hook events: the registration matches the code', () => {
  it('every hook the script handles is registered, and nothing else is', () => {
    // The parallel-list failure class, applied to hooks: a script that handles
    // Stop and a settings file that never calls it fails silently and for good.
    const src = readFileSync(HOOK, 'utf8')
    const handled = new Set(
      [...src.matchAll(/hook == "(\w+)"/g)].map((m) => m[1]),
    )
    const settings = JSON.parse(
      readFileSync(join(ROOT, '.claude/settings.json'), 'utf8'),
    ) as { hooks: Record<string, unknown[]> }
    const registered = new Set(Object.keys(settings.hooks))

    for (const h of handled) {
      expect(registered.has(h), `${h} is handled in code but never registered`).toBe(true)
    }
    for (const h of registered) {
      expect(handled.has(h), `${h} is registered but the script ignores it`).toBe(true)
    }
    // And each registration must pass its own name through as the argument, or
    // every event would be translated as whichever hook is passed first.
    for (const [name, entries] of Object.entries(settings.hooks)) {
      const cmds = JSON.stringify(entries)
      expect(cmds, `${name} does not pass its own name to the script`)
        .toMatch(new RegExp(`\\s${name}\\s`))
    }
  })

  it('a failing hook can never block the tool call it is observing', () => {
    // Found by proving the hook fired: the first version resolved a relative
    // path into an unrelated project, and the resulting error came back as a
    // BLOCKING error on the Write it was meant to be quietly recording.
    const settings = JSON.parse(
      readFileSync(join(ROOT, '.claude/settings.json'), 'utf8'),
    ) as { hooks: Record<string, { hooks: { command: string }[] }[]> }
    for (const [name, entries] of Object.entries(settings.hooks)) {
      for (const entry of entries) {
        for (const h of entry.hooks) {
          expect(h.command, `${name} can return a non-zero exit and stop the work`)
            .toMatch(/;\s*exit 0\s*$/)
          // An absolute path via $HOME, because neither CLAUDE_PROJECT_DIR nor
          // the working directory can be relied on to be this repository.
          expect(h.command, `${name} uses a path that depends on the cwd`)
            .toContain('"$HOME/')
        }
      }
    }
  })
})
