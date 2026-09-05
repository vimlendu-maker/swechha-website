import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { foldStations, worstStation, cityMean, isStuck, impliedConcentration, selfCheck,
  observedAgeHours, stateFor, STALE_HOURS } from './air'

/**
 * THE BUG THIS FILE EXISTS TO PREVENT.
 *
 * `data.gov.in` resource 3b01bcb8 — "Real time AIR QUALITY INDEX from various
 * locations" — publishes CPCB's own sub-indexes. It does NOT publish
 * concentrations. For eleven weeks this codebase read `avg_value` as µg/m³ and
 * ran it through the CPCB breakpoint table a SECOND time, roughly doubling
 * every number the site printed: Delhi read 381 "Very Poor" on a day CPCB
 * itself published 97 "Satisfactory".
 *
 * ★ THE FIXTURE IS THE REAL FEED, NOT A HAND-WRITTEN SAMPLE. Captured
 * 25 August 2026, observation 05:00 IST, all 308 Delhi rows. The expected
 * values below are CPCB's own, read off its Central Control Room panel for the
 * same stations, and they are the only reason these numbers can be trusted.
 *
 * ★ THE OLD `selfCheck()` PASSED THROUGHOUT. It verified the breakpoint table
 * against CPCB's worked example, which was correct — the table was never the
 * problem. A check that validates a conversion cannot notice that the
 * conversion should not be happening at all. The replacement below checks the
 * INVERSE, which is the direction we actually use.
 */

const ROWS = JSON.parse(
  readFileSync(join(__dirname, '__fixtures__/cpcb-delhi-2026-08-25T0500.json'), 'utf8'),
) as Record<string, string>[]

describe('foldStations — the feed publishes sub-indexes, not concentrations', () => {
  it('reads avg_value as the sub-index it already is, without converting it', () => {
    // CPCB's own panel, Anand Vihar, same observation window:
    //   "24 Hr Subindexes PM2.5  AVG 225"  ->  AQI 225, prominent pollutant PM2.5.
    // Converting 225 as though it were µg/m³ yields 381, which is the bug.
    const anand = foldStations(ROWS).find((s) => s.station.startsWith('Anand Vihar'))
    expect(anand).toBeDefined()
    expect(anand!.aqi).toBe(225)
    expect(anand!.governing).toBe('PM2.5')
    expect(anand!.band).toBe('Poor')
  })

  it('lets CO govern a station, because the feed reports it as a sub-index like the rest', () => {
    // CO was excluded on the reasoning that its values were "not credible" as
    // mg/m³ or µg/m³. They were never concentrations. CPCB lists CO among the
    // "24 Hr Subindexes" it publishes, and at six Delhi stations CO is the worst.
    const cantonment = foldStations(ROWS).find((s) => s.station.startsWith('Cantonment Area'))
    expect(cantonment!.governing).toBe('CO')
    expect(cantonment!.aqi).toBe(106)
  })

  it('still takes the worst sub-index as the station AQI, never the mean', () => {
    const anand = foldStations(ROWS).find((s) => s.station.startsWith('Anand Vihar'))!
    // PM2.5 225 beats PM10 202, CO 128, NO2 55, SO2 32, NH3 10, OZONE 2.
    expect(anand.aqi).toBe(225)
  })
})

describe('the headline reading is the WORST MONITOR, named — AD-42C', () => {
  /**
   * ★ OWNER'S RULING, 25 August 2026. AD-42 replaced the worst station with
   * the mean of the 44, because the mean is what CPCB publishes as "Delhi".
   * The owner reversed that: the site's subject is limits being broken at real
   * places, and the mean is the number that hides the place where the limit is
   * broken worst. So the headline is the worst monitor AND IT IS LABELLED AS
   * ONE — never as "Delhi's AQI", which is the mislabelling AD-42 was raised
   * to end. The station's name travels with the number everywhere it is
   * printed; a bare 225 under the word "Delhi" is the old bug in a new place.
   *
   * The mean is kept — computed, not published — as the only cheap check that
   * catches a repeat of the double conversion: it must track CPCB's own city
   * figure, and if it stops doing so the parser has drifted again.
   */
  it('takes the worst monitor of the 44, with its name and governing pollutant', () => {
    const worst = worstStation(foldStations(ROWS))!
    expect(worst.aqi).toBe(225)
    expect(worst.station).toBe('Anand Vihar, Delhi - DPCC')
    expect(worst.governing).toBe('PM2.5')
  })

  it('is NOT the 381 the double conversion produced, and NOT the 107 mean', () => {
    const worst = worstStation(foldStations(ROWS))!
    expect(worst.aqi).not.toBe(381)
    expect(worst.aqi).not.toBe(cityMean(foldStations(ROWS)))
  })

  it("keeps the mean as a cross-check against CPCB's published city figure", () => {
    // Validated across 73 cities: mean-of-stations scored MAE 9.1 with ZERO
    // bias. This is a tripwire for the parser, not a number the page prints.
    expect(cityMean(foldStations(ROWS))).toBe(107)
  })

  it('refuses to invent a reading when there are no stations', () => {
    expect(worstStation([])).toBeNull()
    expect(cityMean([])).toBeNull()
  })
})

describe('isStuck — a sensor that has stopped is not a low reading (AD-42D)', () => {
  /**
   * ★ THE CASE THAT MADE THIS. Leh's CO read min 187 / max 188 / avg 188 — a
   * ONE-POINT range across 24 hours — and put Leh FIRST in India, above Delhi,
   * on the cleanest particulates in the country (PM2.5 17, PM10 26). The old
   * test was `min === max === avg`, so a single point of jitter walked through
   * it. The same Navi Mumbai analyser caught frozen at exactly 101 escaped
   * hours later reading 101–103.
   */
  it('catches the near-flat channel that ranked Leh first in India', () => {
    expect(isStuck(187, 188, 188)).toBe(true)
  })

  it('catches the analyser that escaped by jittering one point', () => {
    expect(isStuck(101, 103, 102)).toBe(true)   // Navi Mumbai CO
  })

  it('still catches a perfectly frozen channel', () => {
    expect(isStuck(101, 101, 101)).toBe(true)
  })

  /**
   * ★ AND THE ONE IT MUST NOT CATCH. An absolute test (`max - min <= 2`) would
   * drop Madurai's ozone at 5–6, which is a real, varying measurement of almost
   * nothing. Dropping it would be inventing a fault. What marks a stuck sensor
   * is that it does not move RELATIVE to what it reads.
   */
  it('leaves a LOW but genuinely varying channel alone', () => {
    expect(isStuck(5, 6, 5)).toBe(false)        // Madurai ozone: 17% range
  })

  it('leaves a live channel at the same station as a stuck one alone', () => {
    expect(isStuck(94, 248, 158)).toBe(false)   // Leh ozone, 62% range
  })

  it('refuses to judge a channel that did not report', () => {
    expect(isStuck(null, null, null)).toBe(false)
    expect(isStuck(10, null, 10)).toBe(false)
  })

  it('treats an all-zero channel as stuck, not as clean air', () => {
    expect(isStuck(0, 0, 0)).toBe(true)
  })

  it('does not crash on a malformed row where max < min', () => {
    expect(isStuck(50, 10, 30)).toBe(false)
  })
})

describe('impliedConcentration — the inverse, because the feed carries no µg/m³', () => {
  it("round-trips CPCB's worked example, the one fixed point we have", () => {
    // CPCB: PM2.5 31 µg/m³ is sub-index 51, and 60 µg/m³ is sub-index 100.
    expect(impliedConcentration('PM2.5', 51)).toBeCloseTo(31, 1)
    expect(impliedConcentration('PM2.5', 100)).toBeCloseTo(60, 1)
  })

  it('recovers the concentration behind a published sub-index', () => {
    // Anand Vihar's 225 sits in PM2.5 band 91–120 µg/m³ -> 201–300.
    expect(impliedConcentration('PM2.5', 225)).toBeCloseTo(98.0, 0)
  })

  it('gives CO in mg/m³, which is the unit that makes its values credible', () => {
    // CO sub-index 106 -> ~2.5 mg/m³. Read as µg/m³ it looked like nonsense,
    // which is precisely why CO was excluded.
    expect(impliedConcentration('CO', 106)).toBeCloseTo(2.5, 1)
  })

  it('returns null for a pollutant it has no breakpoints for', () => {
    expect(impliedConcentration('PB', 100)).toBeNull()
  })
})

describe('selfCheck', () => {
  it('passes on the inverse table the code actually uses', () => {
    // Deliberately thin. The real coverage is the round-trip cases above —
    // a boolean self-check cannot prove it is checking the right direction,
    // which is exactly how the previous one stayed green through the bug.
    expect(selfCheck()).toBe(true)
  })
})

/**
 * PLAUSIBILITY — added after the Leh finding, 25 August 2026.
 *
 * Leh ranked SECOND in India at 195 on a single ozone channel, at a station
 * whose PM2.5 was 13 and PM10 23 — among the cleanest particulates in the
 * country. CPCB publishes the same figure (its own ticker read Leh 188 the
 * same afternoon), so this is not a pipeline error: it is a bad reading being
 * faithfully repeated. Nationally, 251 of 3,170 rows (7.9%) report min, max
 * and avg identical over a 24-hour window, and NINE stations take their AQI
 * from one of them.
 *
 * ★ A FLATLINED CHANNEL IS DROPPED. A 24-hour window with zero variation is a
 * stuck instrument, not a measurement. Where the stuck value is low this
 * changes nothing — it never governed. Where it is high it was setting a
 * city's rank.
 *
 * ★ A SUSPECT READING IS FLAGGED, NOT DELETED. High-altitude ozone is real —
 * stratospheric intrusion and low NOx titration genuinely lift it at 3,500m —
 * so we cannot prove Leh's 195 false, only that it rests on one gas channel
 * beside a dead one. Silently dropping a government reading we merely mistrust
 * would be this site doing the thing it exists to complain about. It is
 * published with the doubt attached.
 */

const ANOM = JSON.parse(
  readFileSync(join(__dirname, '__fixtures__/cpcb-anomalies-2026-08-25T0500.json'), 'utf8'),
) as Record<string, string>[]

describe('plausibility — a dead instrument is not a reading', () => {
  it('drops a channel whose 24-hour min, max and avg are identical', () => {
    // Mahape: CO reports 101/101/101 and currently sets the station's AQI.
    // The live channels put it at PM10 67 — Satisfactory, not Moderate.
    const mahape = foldStations(ANOM).find((s) => s.station.startsWith('Mahape'))!
    expect(mahape.governing).toBe('PM10')
    expect(mahape.aqi).toBe(67)
    expect(mahape.quality.flatlined).toContain('CO')
  })

  it('gives no reading at all when every channel is flatlined', () => {
    // Shivaji Nagar, Rishikesh: all seven channels frozen. A station that
    // cannot be measured must not contribute a number — least of all a clean
    // one, which would quietly pull its city's mean down.
    const rishikesh = foldStations(ANOM).find((s) => s.station.startsWith('Shivaji Nagar'))
    expect(rishikesh).toBeUndefined()
  })

  it('records the channels it dropped and the ones CPCB never sent', () => {
    const leh = foldStations(ANOM).find((s) => s.station.startsWith('Skara Yokma'))!
    expect(leh.quality.flatlined).toContain('CO')
    expect(leh.quality.missing).toEqual(expect.arrayContaining(['NO2', 'NH3']))
  })

  it('flags a gas-governed reading standing over clean particulates', () => {
    const leh = foldStations(ANOM).find((s) => s.station.startsWith('Skara Yokma'))!
    expect(leh.aqi).toBe(195)          // NOT deleted — still published
    expect(leh.governing).toBe('OZONE')
    expect(leh.quality.suspect).toBe(true)
    expect(leh.quality.suspectReason).toMatch(/particulate/i)
  })

  it('does not flag an ordinary particulate-governed station', () => {
    const anand = foldStations(ROWS).find((s) => s.station.startsWith('Anand Vihar'))!
    expect(anand.quality.suspect).toBe(false)
    expect(anand.quality.suspectReason).toBeNull()
  })

  /**
   * The Shivaji Nagar case above is every channel PERFECTLY frozen
   * (min === max === avg). AD-42D widened "stuck" to the 2% relative test —
   * so a station whose every channel jitters by a point, Leh-CO style, must
   * ALSO produce no reading, not fall through to the least-stuck channel.
   * Added by the AD-45 audit: nothing pinned the all-channels-NEAR-stuck
   * station before, only the all-frozen one. (Synthetic rows, built from the
   * measured Leh/Navi-Mumbai jitter shapes.)
   */
  it('gives no reading when every channel is stuck by the 2% rule, not merely frozen', () => {
    const row = (pollutant_id: string, min: string, max: string, avg: string) => ({
      station: 'All Stuck, Synthetic - TEST', pollutant_id,
      min_value: min, max_value: max, avg_value: avg,
      last_update: '26-08-2026 12:00:00', latitude: '28.6', longitude: '77.2',
    })
    const stations = foldStations([
      row('CO', '187', '188', '188'),      // the Leh jitter, verbatim
      row('PM2.5', '101', '103', '102'),   // the Navi Mumbai jitter
      row('OZONE', '50', '50', '50'),      // perfectly frozen
    ])
    expect(stations.find((s) => s.station.startsWith('All Stuck'))).toBeUndefined()
  })

  it('a station whose channels are all NA produces no reading, never a zero', () => {
    const na = (pollutant_id: string) => ({
      station: 'All NA, Synthetic - TEST', pollutant_id,
      min_value: 'NA', max_value: 'NA', avg_value: 'NA',
      last_update: '26-08-2026 12:00:00', latitude: '28.6', longitude: '77.2',
    })
    expect(foldStations([na('PM2.5'), na('PM10'), na('CO')])).toEqual([])
  })
})

/* ── THE CHIP IS EARNED, NOT ASSERTED — AD-47 ──────────────────────────────
   /api/air answered the constant `state: 'LIVE'`, on the argument that the
   word names the ROUTE's cadence rather than the observation's age. Measured
   28 August 2026 at 08:45 IST it therefore said LIVE over a 05:00 IST
   observation, three and three-quarter hours old, while scripts/fetch-air.mjs
   — corrected for exactly this — was calling the same age PERIODIC. One
   system, one field name, two opposite rules.

   ★ EVERY CASE HERE IS PINNED TO A FIXED INSTANT. An age test that reads the
   real clock passes at 09:00 and fails at noon, which is worse than no test.
   The offset arithmetic is the other half: the stamps are IST wall-clock text
   and the assertions below run in whatever timezone CI happens to use, so a
   local-getter implementation fails these rather than shipping a 5:30 error. */
describe('the state chip is earned against the observation age', () => {
  afterEach(() => { vi.useRealTimers() })
  /* 28 August 2026, 09:30 IST — expressed in UTC so the test does not depend
     on the machine's zone, which is the entire point. */
  const at = (utc: string) => { vi.useFakeTimers(); vi.setSystemTime(new Date(utc)) }

  it('reads an IST stamp correctly from a UTC machine', () => {
    at('2026-08-28T04:00:00Z')            // 09:30 IST
    expect(observedAgeHours('09:00 IST, 28 August 2026')).toBe(0.5)
    expect(observedAgeHours('05:00 IST, 28 August 2026')).toBe(4.5)
    expect(observedAgeHours('23:00 IST, 27 August 2026')).toBe(10.5)
  })

  it('LIVE inside the bound, PERIODIC outside it', () => {
    at('2026-08-28T04:00:00Z')            // 09:30 IST
    expect(stateFor('09:00 IST, 28 August 2026')).toBe('LIVE')      // 0.5h
    expect(stateFor('07:00 IST, 28 August 2026')).toBe('LIVE')      // 2.5h, inside 3
    expect(stateFor('05:00 IST, 28 August 2026')).toBe('PERIODIC')  // 4.5h — the real case
    expect(STALE_HOURS).toBe(3)
  })

  it('an unreadable stamp is PERIODIC, never LIVE — a missing age is not age zero', () => {
    at('2026-08-28T04:00:00Z')
    for (const bad of [null, undefined, '', 'yesterday', '2026-08-28T09:00:00Z', '09:00 IST, 28 Smarch 2026']) {
      expect(observedAgeHours(bad as string | null), `age of ${String(bad)}`).toBeNull()
      expect(stateFor(bad as string | null), `state of ${String(bad)}`).toBe('PERIODIC')
    }
  })

  it('a stamp in the future is not fresher than now — it is a broken feed', () => {
    at('2026-08-28T04:00:00Z')                                      // 09:30 IST
    expect(observedAgeHours('12:00 IST, 28 August 2026')).toBe(-2.5)
    expect(stateFor('12:00 IST, 28 August 2026')).toBe('PERIODIC')
    // Ten minutes of clock skew is tolerated, exactly as the page's own
    // chip-confirm tolerates it; a stamp on the minute still reads LIVE.
    expect(stateFor('09:30 IST, 28 August 2026')).toBe('LIVE')
  })
})

/**
 * THE GOVERNING POLLUTANT NEED NOT BE ONE WE HOLD A LIMIT FOR.
 *
 * `data/air-delhi.json`'s `limits` carries PM2.5 and PM10 — the two the page
 * argues about. `worst_station.governing` is whichever of CPCB's EIGHT
 * sub-indexes is worst at that monitor, and in September, when Delhi's
 * particulates fall, that is routinely NO2.
 *
 * On 5 September build-situation-air.mjs read `govLimit.authority` with no
 * guard, `AIR.limits.NO2` was undefined, and the generator threw
 * `Cannot read properties of undefined (reading 'authority')`. build:situations
 * refused to write and air-hourly.yml failed thirteen consecutive runs — with
 * the readings themselves fetched perfectly every time. Two lines above the
 * crash, the same value was already being used behind a `govLimit &&` guard.
 *
 * Reproduced before fixing: with `governing` set to NO2 the old generator threw
 * that exact TypeError, and the patched one wrote the page.
 */
describe('a governing pollutant with no published limit does not take the page down', () => {
  const gen = readFileSync(join(__dirname, '..', 'scripts', 'build-situation-air.mjs'), 'utf8')

  it('never dereferences govLimit without a guard', () => {
    /* Comments are stripped FIRST. The note beside the fix in that file quotes
       the very expression that failed, and a checker which reads an explanation
       of a bug as the bug is worse than no checker — this one did exactly that
       on its first run. Continuation lines inside a block comment need not
       begin with a star, so line-shape filtering is not enough. */
    const code = gen.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const bare = code.split('\n')
      .filter((l) => /govLimit\.\w+/.test(l))
      .filter((l) => !/govLimit\s*(\|\||&&|\?)/.test(l))
      .map((l) => l.trim())
    expect(bare, 'build-situation-air.mjs dereferences govLimit unguarded. `limits` holds two '
      + 'pollutants and `worst_station.governing` can be any of CPCB\'s eight sub-indexes, so '
      + 'this throws the first time a gas governs the worst monitor — which is normal in September')
      .toEqual([])
  })

  it('still names an authority when the governing pollutant is absent from limits', () => {
    expect(gen).toMatch(/limitAuthority/)
    // Derived from the table, never a bare literal standing in for a source.
    expect(gen).toMatch(/Object\.values\(AIR\.limits\)/)
  })

  it('the limits table really is narrower than the sub-index set — the premise of all this', () => {
    const air = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'air-delhi.json'), 'utf8'))
    expect(Object.keys(air.limits).length).toBeLessThan(8)
  })
})
