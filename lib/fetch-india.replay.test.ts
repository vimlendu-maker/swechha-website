import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

/**
 * AD-42E, PINNED AT LAST — the suspect→particulate fallback had no test.
 *
 * The rule lives in scripts/fetch-india.mjs, a top-level script that fetches
 * on import, so it cannot be unit-imported the way the lib/ parsers are. It
 * CAN be replayed: AIR_FIXTURE is the script's own committed test seam
 * ("review a method change without the number moving"), and this test runs
 * the whole script through it against a labelled synthetic capture — the
 * real Leh shapes of 25-26 August 2026, arranged into the three city cases
 * the fold must keep apart:
 *
 *   1. an ordinary particulate city — ranked as-is, unflagged;
 *   2. a SUSPECT city (lone gas far above clean particulates) — ranked on
 *      its worst particulate, the gas figure published-but-not-ranked (E-2);
 *   3. a GAS-ONLY city — nothing to fall back to, keeps the gas figure and
 *      stays flagged (E-4 — the branch the AD-45 audit found dead: suspicion
 *      used to require a particulate to compare against, so a station with
 *      none could never be flagged at all).
 *
 * The stuck-channel drop rides along: Leh's famous frozen CO (187/188/188)
 * is in the fixture and must not be what Leh ranks on.
 */

const REPO = resolve(__dirname, '..')
const FIXTURE = join(__dirname, '__fixtures__/mirror-ad42e-synthetic.json')

type City = {
  rank: number; city: string; aqi: number; governing: string; station: string
  stations: number; meanAqi: number; suspect: boolean; suspectReason: string | null
  basis?: string; gas?: { pollutant: string; aqi: number; ranked: boolean }
}
let out: { cities: City[]; source: { served_by: string } }
const city = (name: string) => out.cities.find((c) => c.city === name)!

beforeAll(() => {
  const outPath = join(mkdtempSync(join(tmpdir(), 'air-india-replay-')), 'air-india.json')
  execFileSync(process.execPath, ['scripts/fetch-india.mjs', outPath], {
    cwd: REPO,
    env: {
      ...process.env,
      AIR_FIXTURE: FIXTURE,
      DATA_GOV_IN_KEY: 'unused-in-replay-but-required-by-the-guard',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  out = JSON.parse(readFileSync(outPath, 'utf8'))
})

describe('fetch-india.mjs replayed on the AD-42E fixture', () => {
  it('replay is served by the mirror path and says so', () => {
    expect(out.source.served_by).toContain('data.gov.in mirror')
  })

  it('an ordinary particulate city ranks as-is, unflagged', () => {
    const delhi = city('Delhi')
    expect(delhi.aqi).toBe(172)
    expect(delhi.governing).toBe('PM10')
    expect(delhi.station).toBe('Anand Vihar, Delhi - DPCC')
    expect(delhi.suspect).toBe(false)
    expect(delhi.gas).toBeUndefined()
  })

  it('a suspect city is RANKED on its worst particulate, not its lone gas (E-1/E-2)', () => {
    const leh = city('Leh')
    expect(leh.suspect).toBe(true)
    expect(leh.aqi).toBe(26)              // worst particulate: PM10 26 beats PM2.5 17
    expect(leh.governing).toBe('PM10')
    expect(leh.basis).toContain('particulate-only')
  })

  it('…while the gas figure keeps its name, its value and its doubt (E-3)', () => {
    const leh = city('Leh')
    expect(leh.gas).toEqual({ pollutant: 'OZONE', aqi: 195, ranked: false })
    // The flag names BOTH numbers — a flag that hides the figure it is
    // flagging is not a flag.
    expect(leh.suspectReason).toContain('195')
    expect(leh.suspectReason).toContain('26')
  })

  it('…and the frozen CO channel (187/188/188) never entered the fold (AD-42D)', () => {
    const leh = city('Leh')
    expect(leh.aqi).not.toBe(188)
    expect(leh.gas!.aqi).not.toBe(188)   // even the set-aside figure is the ozone, not the dead CO
  })

  it('a GAS-ONLY city keeps its gas figure AND stays flagged (E-4)', () => {
    const gasville = city('Gasville')
    expect(gasville.aqi).toBe(250)        // nothing to fall back to — not deleted, not zeroed
    expect(gasville.governing).toBe('CO')
    expect(gasville.suspect).toBe(true)
    expect(gasville.gas).toBeUndefined()  // no fallback happened, so no set-aside pair
    expect(gasville.basis).toContain('no particulate to fall back to')
    expect(gasville.suspectReason).toContain('no particulate')
  })

  it('the ranking reflects the fallback: the unverifiable gas city sits above Delhi, Leh at the bottom', () => {
    expect(out.cities.map((c) => c.city)).toEqual(['Gasville', 'Delhi', 'Leh'])
  })
})
