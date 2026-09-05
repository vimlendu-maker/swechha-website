import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, appendFileSync, readdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// The repo's standing convention allows importing .mjs script modules into
// tests directly (see caaqms.test.ts) — this exercises the real module.
import { recordObservation, readHistory, historyFile } from '../scripts/lib/air-history.mjs'

const T0 = '2026-08-26T11:00:00.000Z'
const T1 = '2026-08-26T11:15:00.000Z'
const T2 = '2026-08-26T11:30:00.000Z'

const delhiRecord = (obs: string, aqi = 183) => ({
  obs,
  source: 'caaqms',
  city: { aqi, band: 'Moderately Polluted', governing: 'PM10', station: 'Anand Vihar, Delhi - DPCC' },
  mean: 90,
  above_limit: 14,
  stations: [{ s: 'Anand Vihar, Delhi - DPCC', a: aqi, g: 'PM10' }],
})

const dir = () => mkdtempSync(join(tmpdir(), 'air-history-'))
const lines = (file: string) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l))

describe('dedup by observation stamp (the 15-minute polling cycle)', () => {
  it('append, then touch, then touch — one record, three checks, no duplicates', () => {
    const d = dir()
    const r1 = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T0 })
    expect(r1.action).toBe('appended')
    const r2 = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T1 })
    expect(r2.action).toBe('touched')
    const r3 = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T2 })
    expect(r3.action).toBe('touched')
    const all = lines(r1.file!)
    expect(all).toHaveLength(1)
    expect(all[0].checks).toBe(3)
    expect(all[0].first_seen).toBe(T0)
    expect(all[0].last_checked).toBe(T2)
    expect(all[0].revised).toBeUndefined()
  })

  it('a new observation stamp appends a second record', () => {
    const d = dir()
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T0 })
    const r = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 17:00:00', 190), now: T1 })
    expect(r.action).toBe('appended')
    expect(lines(r.file!)).toHaveLength(2)
  })

  it('a source flip with identical values is a touch, not a revision', () => {
    const d = dir()
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T0 })
    const viaMirror = { ...delhiRecord('26-08-2026 16:00:00'), source: 'mirror' }
    const r = recordObservation({ dir: d, scope: 'delhi', record: viaMirror, now: T1 })
    expect(r.action).toBe('touched')
    expect(lines(r.file!)[0].source).toBe('caaqms')
  })
})

describe('CPCB revising an hour', () => {
  it('same stamp, different values — updated in place with an audit trail, never duplicated', () => {
    const d = dir()
    const r1 = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00', 183), now: T0 })
    const r2 = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00', 195), now: T1 })
    expect(r2.action).toBe('revised')
    const all = lines(r1.file!)
    expect(all).toHaveLength(1)
    const e = all[0]
    expect(e.city.aqi).toBe(195)
    expect(e.revised).toBe(1)
    expect(e.revisions).toHaveLength(1)
    expect(e.revisions[0].at).toBe(T1)
    expect(e.revisions[0].from.aqi).toBe(183)
    expect(e.first_seen).toBe(T0)
    expect(e.checks).toBe(2)
  })
})

describe('durability', () => {
  it('tolerates a malformed trailing line — logs, drops it, keeps going', () => {
    const d = dir()
    const r1 = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 15:00:00'), now: T0 })
    appendFileSync(r1.file!, '{"obs":"26-08-2026 16:00:00","city":{"aqi"')
    const r2 = recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 17:00:00'), now: T1 })
    expect(r2.action).toBe('appended')
    const all = readHistory({ dir: d, scope: 'delhi' })
    expect(all.map((e: { obs: string }) => e.obs)).toEqual(['26-08-2026 15:00:00', '26-08-2026 17:00:00'])
  })

  it('month rollover creates a new file, partitioned by the OBSERVATION month', () => {
    const d = dir()
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('31-08-2026 23:00:00'), now: T0 })
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('01-09-2026 00:00:00'), now: T1 })
    expect(readdirSync(d).sort()).toEqual(['delhi-2026-08.ndjson', 'delhi-2026-09.ndjson'])
    expect(historyFile('delhi', '01-09-2026 00:00:00')).toBe('delhi-2026-09.ndjson')
  })

  it('a late-arriving OLDER observation (mirror lag) is inserted in observation order', () => {
    const d = dir()
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T0 })
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 14:00:00', 150), now: T1 })
    const all = readHistory({ dir: d, scope: 'delhi' })
    expect(all.map((e: { obs: string }) => e.obs)).toEqual(['26-08-2026 14:00:00', '26-08-2026 16:00:00'])
  })

  it('an unusable observation stamp is skipped, never thrown', () => {
    const d = dir()
    const r = recordObservation({ dir: d, scope: 'delhi', record: { obs: '2026-08-26T16:00:00Z' } as never, now: T0 })
    expect(r.action).toBe('skipped')
  })
})

describe('the two clocks never cross-contaminate', () => {
  const IST_TEXT = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/
  const UTC_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

  it('obs stays IST text; first_seen/last_checked stay UTC ISO', () => {
    const d = dir()
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T0 })
    recordObservation({ dir: d, scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T1 })
    const [e] = readHistory({ dir: d, scope: 'delhi' })
    expect(e.obs).toMatch(IST_TEXT)
    expect(e.obs).not.toMatch(UTC_ISO)
    expect(e.first_seen).toMatch(UTC_ISO)
    expect(e.last_checked).toMatch(UTC_ISO)
    expect(e.first_seen).not.toMatch(IST_TEXT)
  })

  it('the store refuses a UTC ISO string where CPCB\'s stamp belongs', () => {
    const d = dir()
    const r = recordObservation({ dir: d, scope: 'delhi', record: { obs: T0, city: { aqi: 1 } } as never, now: T1 })
    expect(r.action).toBe('skipped')
  })
})

describe('backward compatibility of the current-state files', () => {
  it('air-delhi.json keeps observed/fetched and adds the labelled pair; formats never swap', () => {
    const delhi = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'air-delhi.json'), 'utf8'))
    expect(delhi.observed?.raw).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/)
    expect(typeof delhi.fetched?.epochMs).toBe('number')
    if (delhi.time) {
      expect(delhi.time.cpcb_observed_ist).toBe(delhi.observed.raw)
      expect(delhi.time.swechha_checked_utc).toMatch(/Z$/)
      expect(delhi.time.swechha_first_saw_utc).toMatch(/Z$/)
      expect(delhi.time.cpcb_observed_ist).not.toMatch(/Z$/)
    }
  })
})

describe('a temp store never leaks into the repo', () => {
  it('writes land beside the OUT file, not in data/ (the fetch scripts derive the dir from OUT)', () => {
    const d = dir()
    const r = recordObservation({ dir: join(d, 'air-history'), scope: 'delhi', record: delhiRecord('26-08-2026 16:00:00'), now: T0 })
    expect(r.file).toContain(d)
  })
})

// Guard the workflow contract without YAML parsing. The load-bearing contract
// is the poll cadence plus a successful-poll publish path: the workflow must
// stage the Air data/history and commit it. The old heartbeat= marker was
// intentionally removed when every successful poll began refreshing the visible
// check timestamp, so tests must not pin an obsolete implementation detail.
describe('air-hourly.yml is the sole Air publisher, and its contract holds', () => {
  const wfDir = join(__dirname, '..', '.github', 'workflows')
  const yml = readFileSync(join(wfDir, 'air-hourly.yml'), 'utf8')

  /* ★ HOURLY NOW, NOT EVERY FIFTEEN MINUTES, AND SILENT OVERNIGHT.
     This pinned the literal string `cron: '4,19,34,49 * * * *'`. Four polls an
     hour around the clock is 96 deployments a day before anything else runs,
     and on 5 September the account hit Vercel's hundred-a-day ceiling and
     froze every deploy for a full day. The owner's instruction is one pull an
     hour and none between midnight and 05:00 IST.

     THE ASSERTION IS NOW THE PROPERTY, NOT THE STRING. What matters is that
     the poll clears CPCB's 15-35 minute publication lag — with four slots one
     was always late enough, with one it has to be — and that the schedule is
     hourly rather than denser. Pinning the exact cron text is what made this
     test fail for a cadence change that was deliberate; the shape is the
     contract, and lib/workflows.test.ts owns the budget and the quiet hours. */
  it('polls once an hour, late enough to clear CPCB\'s publication lag', () => {
    const crons = [...yml.matchAll(/cron: '(\d+(?:,\d+)*) ([^']+)'/g)]
    expect(crons.length, 'air-hourly.yml must carry at least one cron').toBeGreaterThan(0)
    for (const [, minutes] of crons) {
      const slots = minutes.split(',').map(Number)
      expect(slots.length, 'one poll per hour — the budget cannot carry four').toBe(1)
      expect(slots[0], 'a single hourly poll must land after the 15-35 minute lag')
        .toBeGreaterThanOrEqual(30)
    }
  })

  /* ★ THE ASSERTION THAT WOULD HAVE CAUGHT THE REAL BUG.
     The previous version of this block asserted that the workflow CONTAINED a
     particular step TITLE. It went red the moment someone renamed the step in
     the GitHub web UI — turning main red for a rename — while saying nothing
     at all about the defect actually sitting three lines below it: the commit
     step named `data/air-history.ndjson`, a path that has never existed
     (AD-46 stores history in the DIRECTORY data/air-history/). Under
     `set -e` that is `git add` exiting 128 on every run.
     So: never assert prose. Assert that every path the workflow stages is a
     path this repository actually has. */
  it('stages only paths that exist in this repository', () => {
    const staged = [...yml.matchAll(/^\s*git add (?:-A )?(.+)$/gm)]
      .flatMap((m) => m[1].trim().split(/\s+/))
      .filter((p) => !p.startsWith('-'))
    expect(staged.length).toBeGreaterThan(0)
    for (const rel of staged) {
      expect(existsSync(join(__dirname, '..', rel)), `air-hourly.yml stages "${rel}", which does not exist`).toBe(true)
    }
  })

  it('stages the Air data and the observation history', () => {
    const staged = [...yml.matchAll(/^\s*git add (?:-A )?(.+)$/gm)]
      .flatMap((m) => m[1].trim().split(/\s+/))
    // `data` covers data/air-delhi.json, data/air-india.json and
    // data/air-history/ in one tree — the point is that history is reachable.
    expect(staged.some((p) => p === 'data' || p.startsWith('data/air'))).toBe(true)
    expect(yml).toContain('data(air):')
  })

  /* Exit 75 ("no source answered") must stay green and publish nothing; exit 1
     ("a source answered wrongly") must stay red. Collapsing the two is how the
     job spent August emailing a human about someone else's server. */
  it('keeps the exit-75 and exit-1 outcomes apart', () => {
    expect(yml).toMatch(/"\$code" = "75"/)
    expect(yml).toContain('upstream_unavailable')
    expect(yml).toContain('pipeline_failure')
  })

  /* The national fetch may never sink the Delhi leg (requirement 8). */
  it('never lets the national fetch fail the run', () => {
    const india = /if npm run data:air:india; then[\s\S]*?\n            fi/.exec(yml)
    expect(india, 'the India fetch must be wrapped so its exit code cannot fail the job').not.toBeNull()
  })

  /* Generated artefacts are regenerated onto the new main, never rebased —
     `git rebase` on two generated HTML files plus a dataset conflicted on
     every run where main had moved, three attempts, then exit 1. */
  it('publishes by regenerating onto the latest main, not by rebasing', () => {
    // Comment lines are stripped first: the file EXPLAINS why the rebase is
    // gone, and an assertion that cannot tell a command from its own
    // rationale is the same species of test as the one this block replaced.
    const commands = yml.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n')
    expect(commands).not.toMatch(/git rebase/)
    expect(commands).toMatch(/git reset --hard/)
  })

  /* There is ONE Air publisher. A second workflow that can write Air data or
     dispatch this one is the arrangement this cleanup removed. */
  it('is the only workflow that fetches or dispatches Air', () => {
    const others = readdirSync(wfDir).filter((f) => f !== 'air-hourly.yml' && f.endsWith('.yml'))
    for (const f of others) {
      const other = readFileSync(join(wfDir, f), 'utf8')
      expect(other, `${f} runs an Air fetch; air-hourly.yml is the sole Air owner`).not.toMatch(/npm run data:air/)
      expect(other, `${f} dispatches air-hourly.yml; the external heartbeat is Vercel cron, not a second GitHub schedule`)
        .not.toMatch(/workflows\/air-hourly\.yml\/dispatches/)
    }
  })
})

/* ── THE ONE LINE THAT STOPPED THE WHOLE SITE DEPLOYING ────────────────────
   On 27 August 2026 at 18:08 IST a fifteen-minute cron expression was added
   to vercel.json. Vercel's documentation: "Hobby accounts are limited to cron
   jobs that run once per day. Cron expressions that would run more frequently
   will fail during deployment." They did — EVERY deployment from that commit
   onward failed at build time, so swechha.in stopped receiving any update at
   all and went on serving a 27-hour-old AQI even on the runs where the data
   pipeline worked. The failing deployment's own error link redirects to
   vercel.com/docs/cron-jobs/usage-and-pricing.
   Nothing in this repository could have caught that, which is why this exists.
   If the project moves to Vercel Pro, relax this test in the same commit that
   changes the schedule — deliberately, not by discovering it in production. */
describe('vercel.json crons stay inside the plan that deploys them', () => {
  const vercel = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8')) as {
    crons?: Array<{ path: string; schedule: string }>
  }

  it('runs at most once per day — more often fails the DEPLOYMENT, not the cron', () => {
    for (const c of vercel.crons ?? []) {
      const [minute, hour] = c.schedule.trim().split(/\s+/)
      expect(minute, `${c.path}: minute field "${minute}" repeats within the hour`).toMatch(/^\d+$/)
      expect(hour, `${c.path}: hour field "${hour}" repeats within the day`).toMatch(/^\d+$/)
    }
  })

  it('every cron path is a route that exists', () => {
    for (const c of vercel.crons ?? []) {
      const route = join(__dirname, '..', 'app', c.path.replace(/^\//, ''), 'route.ts')
      expect(existsSync(route), `vercel.json schedules ${c.path}, which has no route file`).toBe(true)
    }
  })
})
