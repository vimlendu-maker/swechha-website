import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, appendFileSync, readdirSync } from 'node:fs'
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

// Guard the workflow contract without YAML parsing: the heartbeat and the
// 15-minute cadence are load-bearing strings in air-hourly.yml.
describe('air-hourly.yml carries the AD-46 cadence and heartbeat', () => {
  const yml = readFileSync(join(__dirname, '..', '.github', 'workflows', 'air-hourly.yml'), 'utf8')
  it('polls every 15 minutes, offset off the hour', () => {
    const compact = yml.includes("cron: '4,19,34,49 * * * *'")
    const explicit = ["cron: '4 * * * *'", "cron: '19 * * * *'", "cron: '34 * * * *'", "cron: '49 * * * *'"]
      .every((slot) => yml.includes(slot))
    expect(compact || explicit).toBe(true)
  })
  it('has the heartbeat output and commits data/air-history with the rest', () => {
    expect(yml).toContain('heartbeat=')
    expect(yml).toMatch(/git add -A data public\/_pages design/)
  })
})
