import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * THE DEPARTMENT'S MEMORY, CHECKED.
 *
 * Two documents promised this behaviour and nothing delivered it:
 * `swechha/ai/README.md`'s memory model ("each department's lessons.md, which
 * the department may append"), and `docs/website-team/lessons.md`'s own header
 * ("The Website Manager adds to it after each run"). Neither was true — the
 * Manager has no write tools, run.sh never wrote the file, and every lesson it
 * produced went into a dated vault record nobody reads twice.
 *
 * The cost is specific. On 2026-09-11 the Manager discovered `gh run view` was
 * denied to it, wrote that lesson correctly, and the next morning's run would
 * have started without it and paid ~$1 to rediscover it.
 */
const SCRIPT = join(__dirname, '..', 'scripts', 'website-team', 'append-lessons.py')

const run = (lessons: string, report: string) => {
  const dir = mkdtempSync(join(tmpdir(), 'lessons-'))
  const file = join(dir, 'lessons.md')
  writeFileSync(file, lessons)
  const out = execFileSync('python3', [SCRIPT, file], { input: report, encoding: 'utf8' })
  return { appended: Number(out.trim()), text: readFileSync(file, 'utf8') }
}

const BASE = '# Lessons\n\n---\n\n## 2026-09-11 — An existing lesson\n\nIts body.\n'

describe('append-lessons', () => {
  it('appends an entry the file does not have', () => {
    const r = run(BASE, '## Observed\n\nstuff\n\n## Lessons\n\n## 2026-09-12 — A new claim\n\nWhat happened.\n')
    expect(r.appended).toBe(1)
    expect(r.text).toContain('## 2026-09-12 — A new claim')
    expect(r.text).toContain('What happened.')
  })

  it('does not append the same heading twice', () => {
    const r = run(BASE, '## Lessons\n\n## 2026-09-11 — An existing lesson\n\nReworded body.\n')
    expect(r.appended).toBe(0)
    expect(r.text).toBe(BASE)
  })

  it('never deletes or rewrites what is already there', () => {
    const r = run(BASE, '## Lessons\n\n## 2026-09-12 — Another\n\nBody.\n')
    expect(r.text.startsWith(BASE.trimEnd())).toBe(true)
  })

  it('does nothing when the run taught nothing', () => {
    const r = run(BASE, '## Observed\n\nAll quiet.\n')
    expect(r.appended).toBe(0)
    expect(r.text).toBe(BASE)
  })

  /**
   * A heading with no body is a claim with no evidence. The Manager's role file
   * tells it to write nothing when a run taught nothing, and a half-written
   * entry is the shape that instruction produces when it is half-followed.
   */
  it('drops a heading with no body', () => {
    const r = run(BASE, '## Lessons\n\n## 2026-09-12 — Started and abandoned\n')
    expect(r.appended).toBe(0)
  })

  /**
   * Entries are themselves `##`-level, so only "the section runs to end of
   * file" distinguishes an entry from a later report section. If the Manager
   * ever stops ending its report with Lessons, this is the test that notices.
   */
  it('takes every entry in the trailing section, not just the first', () => {
    const r = run(BASE, '## Lessons\n\n## 2026-09-12 — One\n\nA.\n\n## 2026-09-12 — Two\n\nB.\n')
    expect(r.appended).toBe(2)
  })
})
