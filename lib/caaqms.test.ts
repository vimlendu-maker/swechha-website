import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseCaaqmsXml, caaqmsIntegrity, foldStations, worstStation } from './air'
import {
  parseCaaqms, integrityCheck, newerStamp, newestStamp, assessCaaqms,
} from '../scripts/lib/fetch-caaqms.mjs'

/**
 * THE FEED THIS FILE PINS — CPCB's CAAQMS live feed, the primary source since
 * AD-44 (26 August 2026). The data.gov.in mirror it replaces as primary was
 * measured TEN HOURS stale (serving 02:00 IST at 12:04 IST) while this feed
 * served 12:00.
 *
 * ★ THE FIXTURE IS THE REAL FEED, NOT A HAND-WRITTEN SAMPLE. Captured
 * 26 August 2026, observation 12:00 IST, trimmed to Delhi (all 44 stations)
 * plus Andhra Pradesh, Chandigarh and the self-closing empty state Andaman
 * and Nicobar — 65 stations. It keeps the real hazards: "NA" channels, an
 * <Air_Quality_Index Value=""> published EMPTY (Chittoor), a self-closing
 * <State/>, and CPCB's own per-station AQI to verify against.
 *
 * ★ TWO PARSERS, ONE FIXTURE, ZERO DRIFT. scripts/lib/fetch-caaqms.mjs feeds
 * the fetch scripts; lib/air.ts's parseCaaqmsXml feeds the Vercel route,
 * TRANSCRIBED rather than imported (the repo's standing convention across the
 * .mjs/.ts boundary — .mjs cannot import .ts). The no-drift test below is the
 * only thing standing between "transcribed" and "diverged".
 */

const XML = readFileSync(join(__dirname, '__fixtures__/caaqms-2026-08-26T1200.xml'), 'utf8')

describe('parseCaaqms — mirror-shape rows out of CPCB XML', () => {
  const p = parseCaaqms(XML)

  it('normalises a station block to EXACTLY the data.gov.in row shape', () => {
    // Every key, every value a string, verified against the raw XML by hand.
    const row = p.rows.find((r) => r.station === 'Anand Vihar, Delhi - DPCC' && r.pollutant_id === 'PM2.5')
    expect(row).toEqual({
      country: 'India',
      state: 'Delhi',
      city: 'Delhi',
      station: 'Anand Vihar, Delhi - DPCC',
      last_update: '26-08-2026 12:00:00',
      latitude: '28.647622',
      longitude: '77.315809',
      pollutant_id: 'PM2.5',
      min_value: '74',
      max_value: '200',
      avg_value: '146',
    })
  })

  it('parses the whole trimmed feed: 65 stations, all 44 of Delhi\'s', () => {
    expect(p.stationCount).toBe(65)
    expect(new Set(p.rows.filter((r) => r.city === 'Delhi').map((r) => r.station)).size).toBe(44)
  })

  it('preserves "NA" as the string "NA", never 0, never null', () => {
    // Chittoor's particulate channels were down at the capture hour.
    const na = p.rows.find((r) => r.station.startsWith('Gangineni Cheruvu') && r.pollutant_id === 'PM2.5')
    expect(na!.avg_value).toBe('NA')
    expect(na!.min_value).toBe('NA')
  })

  it('keeps the stamp in the feed\'s own "DD-MM-YYYY HH:MM:SS" and reports it distinctly', () => {
    expect(p.stamps).toEqual(['26-08-2026 12:00:00'])
    expect(newestStamp(p.stamps)).toBe('26-08-2026 12:00:00')
  })

  it('decodes XML entities in names, so a station cannot split from its mirror spelling', () => {
    const q = parseCaaqms('<AqIndex><Country id="India"><State id="A &amp; B">'
      + '<City id="X &lt;Y&gt;"><Station id="Tom &amp; Jerry &quot;Park&quot;, X - PCB" '
      + 'lastupdate="26-08-2026 12:00:00" latitude="1" longitude="2">'
      + '<Pollutant_Index id="PM2.5" Min="1" Max="10" Avg="5"/>'
      + '</Station></City></State></Country></AqIndex>')
    expect(q.rows[0].station).toBe('Tom & Jerry "Park", X - PCB')
    expect(q.rows[0].state).toBe('A & B')
    expect(q.rows[0].city).toBe('X <Y>')
  })

  it('survives a self-closing empty state and a missing Air_Quality_Index', () => {
    // Andaman and Nicobar arrives as <State id="..."/> — no rows, no crash.
    expect(p.rows.some((r) => r.state === 'Andaman and Nicobar')).toBe(false)
    const noAqi = parseCaaqms('<AqIndex><Country id="India"><State id="S"><City id="C">'
      + '<Station id="St, C - PCB" lastupdate="26-08-2026 12:00:00" latitude="1" longitude="2">'
      + '<Pollutant_Index id="PM10" Min="1" Max="10" Avg="7"/>'
      + '</Station></City></State></Country></AqIndex>')
    expect(noAqi.rows).toHaveLength(1)
    expect(noAqi.stationAqi).toEqual({})
  })

  it('feeds foldStations directly — the whole point of the mirror shape', () => {
    const worst = worstStation(foldStations(p.rows.filter((r) => r.city === 'Delhi')))!
    expect(worst.station).toBe('Anand Vihar, Delhi - DPCC')
    expect(worst.aqi).toBe(172)
    expect(worst.governing).toBe('PM10')
  })
})

describe("CPCB's own per-station AQI — the tripwire the mirror never carried", () => {
  const p = parseCaaqms(XML)

  it("reads CPCB's own Value and Predominant_Parameter per station", () => {
    expect(p.stationAqi['Anand Vihar, Delhi - DPCC']).toEqual({ aqi: 172, pollutant: 'PM10' })
  })

  it('skips a station whose Value is published EMPTY, as Chittoor\'s really was', () => {
    expect(p.stationAqi['Gangineni Cheruvu, Chittoor - APPCB']).toBeUndefined()
  })

  it("equals the worst Avg sub-index at EVERY station where CPCB published one", () => {
    // The identical-semantics claim of AD-44, proven on the whole fixture,
    // not asserted on one station.
    const worst = new Map<string, number>()
    for (const r of p.rows) {
      const n = Number(r.avg_value)
      if (r.avg_value === 'NA' || !Number.isFinite(n)) continue
      if (!worst.has(r.station) || n > worst.get(r.station)!) worst.set(r.station, n)
    }
    for (const [station, own] of Object.entries(p.stationAqi)) {
      expect(Math.abs(worst.get(station)! - own.aqi),
        `${station}: ours ${worst.get(station)} vs CPCB's ${own.aqi}`).toBeLessThanOrEqual(1)
    }
  })
})

describe('the per-station integrity gate — ±1 tolerance, 2% budget', () => {
  const p = parseCaaqms(XML)

  it('passes on the real feed', () => {
    const g = integrityCheck(p.rows, p.stationAqi)
    expect(g.ok).toBe(true)
    expect(g.mismatched).toBe(0)
    expect(g.comparable).toBeGreaterThan(50)
  })

  it('FAILS on a doubled copy — it would have caught AD-42 instantly', () => {
    // The AD-42 double conversion published roughly 2x CPCB's numbers for
    // eleven weeks while every gate in the repo stayed green. Doubled values
    // disagree with CPCB's own per-station AQI at essentially every station.
    const doubled = p.rows.map((r) => ({
      ...r,
      avg_value: /^\d+(\.\d+)?$/.test(r.avg_value) ? String(Number(r.avg_value) * 2) : r.avg_value,
    }))
    const g = integrityCheck(doubled, p.stationAqi)
    expect(g.ok).toBe(false)
    expect(g.mismatched).toBe(g.comparable)
  })

  it('is measured on RAW maxima, before the stuck-drop, so policy is not flagged as drift', () => {
    /* Measured on the full 26 August 2026 capture: SIX stations nationally
       (Skara Yokma in Leh at its famous frozen 188 among them) had a STUCK
       channel as their raw maximum while CPCB still published a Value. On raw
       maxima all six agreed with CPCB exactly; on our post-drop values all
       six would have read as mismatches — our POLICY masquerading as parser
       drift, eating most of the 2% budget for nothing. The scenario below is
       that shape in miniature: CO frozen at 188/188/188 governs the raw max,
       CPCB (which drops nothing) publishes 188, and the gate must agree. */
    const stuck = parseCaaqms('<AqIndex><Country id="India"><State id="Ladakh"><City id="Leh">'
      + '<Station id="Skara Yokma, Leh - LPCC" lastupdate="26-08-2026 12:00:00" latitude="34" longitude="77">'
      + '<Pollutant_Index id="CO" Min="188" Max="188" Avg="188"/>'
      + '<Pollutant_Index id="PM2.5" Min="10" Max="30" Avg="17"/>'
      + '<Air_Quality_Index Value="188" Predominant_Parameter="CO"/>'
      + '</Station></City></State></Country></AqIndex>')
    const g = integrityCheck(stuck.rows, stuck.stationAqi)
    expect(g.ok).toBe(true)
    expect(g.mismatched).toBe(0)
    // The post-drop value at that station is 17 — comparing THAT against
    // CPCB's 188 would flag it, which is exactly what the gate must not do.
  })

  it('refuses an empty comparison rather than passing it', () => {
    expect(integrityCheck([], {}).ok).toBe(false)
  })

  /**
   * Added by the AD-45 audit. A station can publish an <Air_Quality_Index>
   * while every one of its channels reads NA (CPCB computed its Value over
   * channels it then stopped serving). Our side then has NO numeric maximum
   * to compare — that station must be NON-COMPARABLE, not a mismatch: a
   * feed hiccup at one station must not eat the 2% budget as false drift.
   */
  it('skips a CPCB-scored station whose channels all arrived as NA — non-comparable, not a mismatch', () => {
    const p = parseCaaqms('<AqIndex><Country id="India"><State id="S"><City id="C">'
      + '<Station id="Ghost, C - PCB" lastupdate="26-08-2026 12:00:00" latitude="1" longitude="2">'
      + '<Pollutant_Index id="PM2.5" Min="NA" Max="NA" Avg="NA"/>'
      + '<Air_Quality_Index Value="120" Predominant_Parameter="PM2.5"/>'
      + '</Station>'
      + '<Station id="Real, C - PCB" lastupdate="26-08-2026 12:00:00" latitude="1" longitude="2">'
      + '<Pollutant_Index id="PM10" Min="80" Max="160" Avg="140"/>'
      + '<Air_Quality_Index Value="140" Predominant_Parameter="PM10"/>'
      + '</Station></City></State></Country></AqIndex>')
    const g = integrityCheck(p.rows, p.stationAqi)
    expect(g.comparable).toBe(1)   // Ghost is skipped, Real is compared
    expect(g.mismatched).toBe(0)
    expect(g.ok).toBe(true)
  })

  it('both NA-only station shapes count toward stationCount, and neither invents a number', () => {
    // The station-count gate reads stationCount rather than counting rows
    // precisely because of these two shapes: a feed of present-but-empty
    // stations is a thin-FEED question, not a parse question, and the gate
    // must see the stations either way.
    const p = parseCaaqms('<AqIndex><Country id="India"><State id="S"><City id="C">'
      // Shape 1: channels present, every value NA — the row is preserved
      // with the string "NA", never 0, and foldStations later drops it.
      + '<Station id="Ghost, C - PCB" lastupdate="26-08-2026 12:00:00" latitude="1" longitude="2">'
      + '<Pollutant_Index id="PM2.5" Min="NA" Max="NA" Avg="NA"/>'
      + '</Station>'
      // Shape 2: no <Pollutant_Index> children at all — counted, zero rows.
      + '<Station id="Silent, C - PCB" lastupdate="26-08-2026 12:00:00" latitude="1" longitude="2">'
      + '</Station></City></State></Country></AqIndex>')
    expect(p.stationCount).toBe(2)
    expect(p.rows).toHaveLength(1)
    expect(p.rows[0].station).toBe('Ghost, C - PCB')
    expect(p.rows[0].avg_value).toBe('NA')
    // And the fold refuses to turn either into a reading.
    expect(foldStations(p.rows)).toEqual([])
  })

  it('assessCaaqms wires the gates together and names the failure kind', () => {
    expect(assessCaaqms(parseCaaqms(XML), { minStations: 60 }).ok).toBe(true)
    expect(assessCaaqms(parseCaaqms(XML), { minStations: 300 })).toMatchObject({ ok: false, kind: 'thin' })
    const doubled = parseCaaqms(XML)
    doubled.rows = doubled.rows.map((r) => ({
      ...r,
      avg_value: /^\d+$/.test(r.avg_value) ? String(Number(r.avg_value) * 2) : r.avg_value,
    }))
    expect(assessCaaqms(doubled, { minStations: 60 })).toMatchObject({ ok: false, kind: 'integrity' })
  })
})

describe('freshness — stamps compared by FIELD, never by Date or by string', () => {
  it('picks the newer of two stamps', () => {
    expect(newerStamp('26-08-2026 12:00:00', '26-08-2026 02:00:00')).toBe('a')
    expect(newerStamp('25-08-2026 23:00:00', '26-08-2026 02:00:00')).toBe('b')
    expect(newerStamp('26-08-2026 12:00:00', '26-08-2026 12:00:00')).toBe('tie')
  })

  it('gets the case a STRING comparison would get wrong', () => {
    // "02-09-2026" < "26-08-2026" lexically, but 2 September is LATER than
    // 26 August. Day-first stamps make string order a trap; fields do not lie.
    expect(newerStamp('02-09-2026 05:00:00', '26-08-2026 23:00:00')).toBe('a')
  })

  it('lets a parseable stamp beat garbage, and ties two garbage stamps', () => {
    expect(newerStamp('not a stamp', '26-08-2026 02:00:00')).toBe('b')
    expect(newerStamp('', null as unknown as string)).toBe('tie')
  })
})

describe('NO DRIFT — lib/air.ts transcription vs scripts/lib/fetch-caaqms.mjs', () => {
  /**
   * The TS parser exists because .mjs cannot import .ts and the Vercel route
   * cannot import scripts/. Transcription is the convention (km(), the
   * breakpoint table, isStuck all live twice) and THIS test is its warranty:
   * both parsers over the same real fixture must agree on every row, every
   * stamp, every station AQI. If someone edits one and not the other, this
   * is the test that fails.
   */
  it('produces identical rows, stamps and station-AQI maps on the same fixture', () => {
    const mjs = parseCaaqms(XML)
    const ts = parseCaaqmsXml(XML)
    expect(ts.rows).toEqual(mjs.rows)
    expect(ts.stationAqi).toEqual(mjs.stationAqi)
    expect(ts.stamps).toEqual(mjs.stamps)
    expect(ts.stationCount).toBe(mjs.stationCount)
  })

  it('and the two integrity gates agree on both the real and the doubled copy', () => {
    const p = parseCaaqms(XML)
    const doubled = p.rows.map((r) => ({
      ...r,
      avg_value: /^\d+$/.test(r.avg_value) ? String(Number(r.avg_value) * 2) : r.avg_value,
    }))
    expect(caaqmsIntegrity(p.rows, p.stationAqi).ok).toBe(true)
    expect(integrityCheck(p.rows, p.stationAqi).ok).toBe(true)
    expect(caaqmsIntegrity(doubled, p.stationAqi).ok).toBe(false)
    expect(integrityCheck(doubled, p.stationAqi).ok).toBe(false)
    expect(caaqmsIntegrity(p.rows, p.stationAqi).comparable)
      .toBe(integrityCheck(p.rows, p.stationAqi).comparable)
  })
})
