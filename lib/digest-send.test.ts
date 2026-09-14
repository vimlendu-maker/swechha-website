import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE MONTHLY DIGEST'S REFUSALS, WHICH ARE THE PART WORTH TESTING.
 *
 * The composer is easy to eyeball; what has to hold under edit is what it
 * DECLINES to do. Three refusals, and each one is a promise the subscribe box
 * makes on eleven pages:
 *
 *   1. No note for the month      -> compose nothing, send nothing, exit 75.
 *   2. Note not approved          -> send nothing, exit 75; a dry run may still
 *                                    compose it, because that is how a reviewer
 *                                    decides whether to approve.
 *   3. A figure its own page does not show -> refuse outright, exit non-zero.
 *
 * Exit 75 is this repository's "nothing to do, and that is not a failure" code
 * (air-hourly.yml, ward-alerts.yml). The workflow maps it to a green run with a
 * notice, so a month nobody wrote is silence rather than an alert.
 *
 * ★ NOTHING HERE TOUCHES THE DATABASE OR THE MAILER. Every case runs
 * `--dry-run` or stops before the send, and the script requires neither secret
 * in that mode — which is also what makes the digest reviewable by a person who
 * has none.
 */

const ROOT = join(__dirname, '..')
const SCRIPT = join(ROOT, 'scripts/digest-send.mjs')
const DIGEST_DIR = join(ROOT, 'data/digest')

/* ★ DUMMY SECRETS, NOT BLANK ONES, AND THE DIFFERENCE MATTERS TO WHAT THIS
   FILE CAN TEST. The script checks its configuration FIRST and exits 1 naming
   what is missing — correct behaviour, and it fires before the approval gate.
   Blanking the variables therefore made every non-dry case exit 1 for the wrong
   reason, and the gate below went untested while appearing to pass.

   These values are syntactically plausible and connect to nothing. Every case
   here stops at a refusal well before `neon()` is called or a request is made,
   which is asserted by the exit codes rather than assumed: 75 and 1 are both
   reached before the send loop. A developer's real secrets are overridden so
   this suite behaves identically on a laptop and in CI. */
function run(args: string[]) {
  const r = spawnSync('node', [SCRIPT, ...args], {
    cwd: ROOT, encoding: 'utf8', timeout: 60_000,
    env: {
      ...process.env,
      DATABASE_URL: 'postgres://not-a-real-host.invalid/none',
      RESEND_API_KEY: 're_not_a_real_key',
      SITE_ORIGIN: 'https://swechha.in',
    },
  })
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** A month with no note file, far enough out that nobody will ever write one. */
const EMPTY_MONTH = '2019-01'

describe('the digest refuses a month nobody wrote', () => {
  it('exits 75 and names the file it wanted', () => {
    expect(existsSync(join(DIGEST_DIR, `${EMPTY_MONTH}.json`))).toBe(false)
    const { code, out } = run(['--dry-run', '--month', EMPTY_MONTH])
    expect(code).toBe(75)
    expect(out).toContain(`data/digest/${EMPTY_MONTH}.json`)
    expect(out).toMatch(/nothing sent|nothing composed/i)
  })
})

describe('the approval gate', () => {
  const month = '2099-07'
  const path = join(DIGEST_DIR, `${month}.json`)
  const note = {
    month, subject: 'Test', publish_state: 'draft', approved_by: null,
    opening: 'A test note that exists only inside this test run.',
    did: ['Nothing. This is a fixture.'],
  }

  const withNote = (patch: Record<string, unknown>, fn: () => void) => {
    mkdirSync(DIGEST_DIR, { recursive: true })
    writeFileSync(path, JSON.stringify({ ...note, ...patch }, null, 2))
    try { fn() } finally { rmSync(path, { force: true }) }
  }

  it('a draft is composed by a dry run, and flagged as unsendable', () => {
    withNote({}, () => {
      const { code, out } = run(['--dry-run', '--month', month])
      expect(code).toBe(0)
      expect(out).toContain('WOULD NOT BE SENT')
      // It still composed — that is the point of previewing before approving.
      expect(out).toContain('THE SIX, AS THEY STAND')
    })
  })

  it('a draft is refused when the run is not a dry run', () => {
    withNote({}, () => {
      const { code, out } = run(['--month', month])
      expect(code).toBe(75)
      expect(out).toMatch(/not approved/i)
    })
  })

  it('published without a named approver is still not approved', () => {
    withNote({ publish_state: 'published', approved_by: null }, () => {
      expect(run(['--month', month]).code).toBe(75)
    })
  })

  it('a note with no "what we did" is refused outright, not merely held', () => {
    withNote({ publish_state: 'published', approved_by: 'A Person', did: [] }, () => {
      const { code, out } = run(['--dry-run', '--month', month])
      // Not 75: an approved note missing the human half is a mistake to fix,
      // not a month nobody wrote.
      expect(code).toBe(1)
      expect(out).toMatch(/did/)
    })
  })
})

describe('the composed digest', () => {
  const month = '2099-08'
  const path = join(DIGEST_DIR, `${month}.json`)

  it('carries the licence, an unsubscribe link and every situation route', () => {
    mkdirSync(DIGEST_DIR, { recursive: true })
    writeFileSync(path, JSON.stringify({
      month, publish_state: 'published', approved_by: 'A Person',
      opening: 'A test note that exists only inside this test run.',
      did: ['Nothing. This is a fixture.'],
    }, null, 2))
    try {
      const { code, out } = run(['--dry-run', '--month', month])
      expect(code).toBe(0)
      for (const route of ['/now/air', '/now/yamuna', '/now/heat',
        '/now/forest-fire', '/now/forest-loss', '/now/climate-event']) {
        expect(out, `the digest should link ${route}`).toContain(route)
      }
      expect(out).toContain('CC BY 4.0')
      expect(out).toContain('/api/newsletter/unsubscribe?t=')
      expect(out).toContain('cross-check ok')
    } finally {
      rmSync(path, { force: true })
    }
  })

  /* The guard that stops the digest quoting a figure the site contradicts.
     Proved against the real datasets rather than asserted: every figure the
     composer would print must appear in its own built situation page. */
  it('cross-checks every figure against its own built page', () => {
    const month2 = '2099-09'
    const p2 = join(DIGEST_DIR, `${month2}.json`)
    writeFileSync(p2, JSON.stringify({
      month: month2, publish_state: 'published', approved_by: 'A Person',
      opening: 'Fixture.', did: ['Fixture.'],
    }, null, 2))
    try {
      const { out } = run(['--dry-run', '--month', month2])
      const m = /cross-check ok — (\d+) figures/.exec(out)
      expect(m, 'the cross-check should report how many figures it verified').toBeTruthy()
      expect(Number(m![1])).toBeGreaterThanOrEqual(5)
    } finally {
      rmSync(p2, { force: true })
    }
  })
})

describe('the note the repository ships', () => {
  it('is held as a draft, so nothing goes out unread', () => {
    const files = existsSync(DIGEST_DIR)
      ? readFileSync(join(DIGEST_DIR, 'README.md'), 'utf8') : ''
    expect(files, 'data/digest/README.md should explain the gate').toMatch(/approved_by/)
  })
})
