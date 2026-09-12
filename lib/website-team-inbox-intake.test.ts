import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

/**
 * AN INBOX JOB IS NOT A LINE.
 *
 * On 2026-09-12 the owner filed one brief — a `### THIS WEEK:` heading with a
 * body of prose and bullets explaining what had already been done — and this
 * script filed EVERY LINE of it. 46 Work Items, each a sentence fragment, one of
 * them reading "stop spending. Take it on the next scheduled run." The store
 * went from 34 objects to 86 in an hour, and the job itself had no single task
 * representing it.
 *
 * A Work Item store full of fragments is worse than one missing an entry,
 * because fragments look like work: they are open, undated, and indistinguishable
 * in `org status` from things a human asked for.
 *
 * These tests drive the real grouping function with the real note.
 */
const INTAKE = join(__dirname, '..', 'scripts', 'website-team', 'inbox-intake.py')

/** Titles the script would file from a given `## Open` body. */
const titlesFor = (openBody: string): string[] => {
  const py = `
import sys, json
sys.path.insert(0, ${JSON.stringify(join(__dirname, '..', 'scripts', 'website-team'))})
from importlib import machinery, util
spec = util.spec_from_loader("intake", machinery.SourceFileLoader("intake", ${JSON.stringify(INTAKE)}))
m = util.module_from_spec(spec); spec.loader.exec_module(m)
lines = sys.stdin.read().split("\\n")
print(json.dumps([t for t in (m.title_of(j[0]) for j in m.jobs(lines)) if t]))
`
  return JSON.parse(
    execFileSync('python3', ['-c', py], { input: openBody, encoding: 'utf8' }).trim(),
  )
}

/** The shape of the brief that caused the incident, abridged but structurally identical. */
const THE_REAL_NOTE = `
<!-- Add jobs below this line. -->

### THIS WEEK: Vercel Deployment Storage is at 100% and the cause is deploy volume

Filed by the owner on 2026-09-12, not by an agent.

**THIS WEEK rather than NOW on purpose.** The account was at 91 of the 100
deployments Hobby allows per day when this was written. Waking the department
off-schedule would spend, on this job, the very deployments the job exists to
stop spending. Take it on the next scheduled run.

**What is already done — do not redo it.**

- \`sentinel/vercel-health.sh\` now reports and alarms on the RETAINED DEPLOYMENT
  COUNT, paginated, with ATTENTION at 90. It prints no GB figure.
- The same probe no longer treats CANCELED as ERROR. Four of the newest eight
  production deployments were deliberate skips.
- \`public/\` went from 104MB to 89MB via \`scripts/optimise-photos.mjs\`.
`

describe('inbox intake: one brief is one job', () => {
  it('files the real note as ONE task, not forty-six', () => {
    const titles = titlesFor(THE_REAL_NOTE)
    expect(titles).toEqual([
      'Vercel Deployment Storage is at 100% and the cause is deploy volume',
    ])
  })

  it('does not file the body prose as work', () => {
    const titles = titlesFor(THE_REAL_NOTE).join('\n')
    // The line that made the incident obvious when it appeared in `org status`.
    expect(titles).not.toContain('stop spending')
    expect(titles).not.toContain('do not redo it')
    expect(titles).not.toContain('Filed by the owner')
  })

  it('does not file a bullet inside a section as its own job', () => {
    // Bullets explain the heading; they are not separate work. This is the exact
    // case a "top-level bullet starts a job" rule would have got wrong.
    const titles = titlesFor(THE_REAL_NOTE).join('\n')
    expect(titles).not.toContain('vercel-health.sh')
    expect(titles).not.toContain('optimise-photos')
  })

  it('strips the urgency marker from the heading, so re-tagging does not re-file', () => {
    const a = titlesFor('### THIS WEEK: Reindex /teach\n\nbody\n')
    const b = titlesFor('### NOW: Reindex /teach\n\nbody\n')
    expect(a).toEqual(['Reindex /teach'])
    expect(b).toEqual(a)
  })

  /**
   * The five tasks filed earlier that day came from a flat file. Titles are
   * compared exactly for idempotency, so any change to how they are derived
   * re-files every one of them.
   */
  it('leaves the flat one-job-per-line format exactly as it was', () => {
    const flat = [
      "/teach section has design issues. Section 'Eight Themes' underline is hiding the text below.",
      'Page has spacing issues, for example in NEXT section',
      '- #today - Google page index update',
    ].join('\n')
    expect(titlesFor(flat)).toEqual([
      "/teach section has design issues. Section 'Eight Themes' underline is hiding the text below.",
      'Page has spacing issues, for example in NEXT section',
      'Google page index update',
    ])
  })

  it('keeps flat lines that precede the first heading', () => {
    // A file mid-migration between the two shapes must lose neither half.
    const mixed = 'Fix the footer link\n\n### TODAY: A headed job\n\nits body\n'
    expect(titlesFor(mixed)).toEqual(['Fix the footer link', 'A headed job'])
  })

  it('separates consecutive headed jobs', () => {
    const two = '### One\n\nbody of one\n\n### TODAY: Two\n\nbody of two\n'
    expect(titlesFor(two)).toEqual(['One', 'Two'])
  })

  it('still ignores rules, comments and checked boxes', () => {
    const noise = '<!-- a comment -->\n---\n- [x] already done\nA real job\n'
    expect(titlesFor(noise)).toEqual(['A real job'])
  })
})
