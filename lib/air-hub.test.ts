import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * THE AIR HUB'S SCIENTIFIC-INTEGRITY GATES — air hub v2, 26 September 2026.
 *
 * Each case below pins a defect that was LIVE on /now/air when the v2 audit
 * ran (docs/air-hub/AIR_PAGE_AUDIT.md), so that a later edit cannot quietly
 * put it back. They run over what is ON DISK — the built page and the
 * committed data — for the same reason lib/provenance.test.ts does: a build
 * gate sees the page being rebuilt; this sees the page that shipped.
 */

const ROOT = join(__dirname, '..')
const page = readFileSync(join(ROOT, 'public/_pages/v3/situation-air.html'), 'utf8')
const now = readFileSync(join(ROOT, 'public/_pages/v3/intelligence.html'), 'utf8')
const AIR = JSON.parse(readFileSync(join(ROOT, 'data/air-delhi.json'), 'utf8'))
const STD = JSON.parse(readFileSync(join(ROOT, 'data/air-standards.json'), 'utf8'))
const NCR = JSON.parse(readFileSync(join(ROOT, 'data/ncr.json'), 'utf8'))
const fetchAir = readFileSync(join(ROOT, 'scripts/fetch-air.mjs'), 'utf8')

/** Visible text only: scripts, styles and comments blanked, tags stripped. */
const visible = (h: string) => h
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
const text = visible(page)

describe('an AQI is not a verdict in law', () => {
  // "Above 100 is above the law." and "CPCB safe limit 100. Limit broken."
  // were both on the page. CPCB never calls 100 safe, and NAAQS 2009 lets
  // short-term values exceed on 2% of days a year, never two days running —
  // one reading over the level is not, by itself, a breach.
  it.each(['above the law', 'safe limit', 'Limit broken', 'breaks the law', 'illegal'])(
    'the page never says "%s"', (phrase) => {
      expect(text.toLowerCase()).not.toContain(phrase.toLowerCase())
    })

  it('names the compliance rule where it explains what 100 means', () => {
    expect(text).toContain('2% of days in a year')
    expect(text).toMatch(/never on two days running/)
  })

  it('the hero line names the governing pollutant’s own standard, in the reading’s own window', () => {
    const line = /id="air-limit">([\s\S]*?)<\/p>/.exec(page)?.[1] ?? ''
    const gov = AIR.worst_station.governing as string
    const g = AIR.worst_station.pollutants[gov]
    const key = g?.averaging === '8-hour' ? 'h8' : g?.averaging === '24-hour' ? 'h24' : null
    const std = key ? AIR.limits[gov]?.[key] : null
    if (std != null) {
      expect(line).toContain(`${g.averaging} standard`)
      expect(line).toContain(`${std} `)
      expect(line).toContain(AIR.limits[gov].unit)
    }
    expect(line).toMatch(/Over it\.|Under it\./)
  })
})

describe('the page checks its own age — AD-42 B-4 on the client', () => {
  it('carries the observation instant, and it is the observation in the data', () => {
    const o = AIR.observed
    const want = new Date(Date.UTC(o.y, o.m - 1, o.d, o.hh, o.mi) - 19800000).toISOString()
    expect(page).toContain(`data-observed-utc="${want}"`)
  })

  it('uses the same three-hour bound the fetch job uses for LIVE', () => {
    const fetchBound = Number(/const STALE_HOURS = (\d+)/.exec(fetchAir)?.[1])
    expect(fetchBound).toBeGreaterThan(0)
    expect(page).toContain(`data-stale-hours="${fetchBound}"`)
  })

  it('ships the demotion, and it never upgrades a stale chip back to Live', () => {
    expect(page).toContain('var STALE=false')
    expect(page).toContain("w.textContent='Periodic'")
    expect(page).toContain('if(STALE) CHIP_ALREADY_LIVE=true')
    expect(page).toMatch(/id="air-age"[^>]*hidden/)
  })
})

describe('measured, calculated, modelled and forecast are never swapped', () => {
  const table = /<table class="p-tbl">[\s\S]*?<\/table>/.exec(page)?.[0] ?? ''
  const row = (label: string) => visible(new RegExp(`<tr><th scope="row">${label}[\\s\\S]*?</tr>`).exec(table)?.[0] ?? '')

  it('the concentrations are CALCULATED, not measured — the feed carries sub-indexes only', () => {
    expect(row('Concentrations')).toContain('Calculated')
    expect(text).not.toContain('The feed returns concentrations and no index')
  })

  it('the forecast is labelled a forecast, and its scale is named', () => {
    expect(row('Forecast')).toContain('Forecast')
    expect(text).toContain('A forecast, not an observation.')
    expect(text).toContain('US EPA index scale')
  })

  it('the PM2.5 card quotes a monitor that actually reports PM2.5', () => {
    const card = /PM2\.5<\/h3>[\s\S]*?<\/div>/.exec(page)?.[0] ?? ''
    const station = /at ([^,<]+), the highest of the Delhi monitors/.exec(visible(card))?.[1]?.trim()
    if (station) {
      const st = AIR.stations.find((s: { station: string }) => s.station.split(',')[0].trim() === station)
      expect(st?.pollutants?.['PM2.5']?.sub).toBeTypeOf('number')
    } else {
      expect(visible(card)).toContain('No Delhi monitor reported it')
    }
  })

  it('/now prints no index multiplier (D-15.3: 200 is not twice the pollution of 100)', () => {
    expect(visible(now)).not.toMatch(/\d(\.\d)?\s*× the limit/)
  })
})

describe('the standards table pairs like with like', () => {
  it('holds India’s notified figures exactly as the Gazette prints them', () => {
    const v = (p: string, w: string) => STD.rows.find((r: { pollutant: string; window: string }) => r.pollutant === p && r.window === w)?.india
    expect([v('PM2.5', 'Annual'), v('PM2.5', '24-hour'), v('PM10', 'Annual'), v('PM10', '24-hour')]).toEqual([40, 60, 60, 100])
    expect([v('NO2', '24-hour'), v('SO2', '24-hour'), v('OZONE', '8-hour'), v('CO', '8-hour')]).toEqual([80, 80, 100, 2])
  })

  it('agrees with the limits the fetch job writes', () => {
    for (const [pol, lim] of Object.entries(AIR.limits) as [string, Record<string, number>][]) {
      if (lim.h24 != null) expect(STD.rows.find((r: { pollutant: string; window: string }) => r.pollutant === pol && r.window === '24-hour')?.india).toBe(lim.h24)
      if (lim.h8 != null) expect(STD.rows.find((r: { pollutant: string; window: string }) => r.pollutant === pol && r.window === '8-hour')?.india).toBe(lim.h8)
    }
  })

  it('never invents a pairing: a missing figure is null, never zero', () => {
    for (const r of STD.rows) {
      expect(r.india === null || r.india > 0).toBe(true)
      expect(r.who === null || r.who > 0).toBe(true)
      expect(r.india !== null || r.who !== null).toBe(true)
    }
  })

  it('publishes WHO figures only once they are checked against the WHO document', () => {
    expect(STD.who.verified).toBe(true)
    expect(STD.who.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('Delhi-NCR is NCR, and an absent town is not a clean one', () => {
  const ncrTable = /<table class="p-tbl p-tbl-d">\s*<caption class="sr">Air quality in the towns of the National Capital Region[\s\S]*?<\/table>/.exec(page)?.[0] ?? ''
  const towns = [...ncrTable.matchAll(/<th scope="row">([^<]+)</g)].map((m) => m[1].trim())
  const inNcr = new Set(NCR.districts.flatMap((d: { cities: string[] }) => d.cities))

  it('lists Delhi and only towns in the NCR Planning Board’s districts', () => {
    expect(towns).toContain('Delhi')
    for (const t of towns) expect(inNcr.has(t)).toBe(true)
  })

  it('prints no zero where a figure is missing', () => {
    expect(visible(ncrTable)).not.toMatch(/(^|\s)0(\s|$)/)
  })
})

describe('the questions are visible, or they are not in the markup', () => {
  it('every FAQPage question is an h3 a reader can see, word for word', () => {
    const ld = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1])).find((j) => j['@type'] === 'FAQPage')
    expect(ld).toBeTruthy()
    const shown = [...page.matchAll(/<h3 class="p-qa-q"[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]
      .replace(/&rsquo;/g, '’').replace(/&#39;/g, "'").replace(/&amp;/g, '&'))
    expect(ld.mainEntity.map((q: { name: string }) => q.name)).toEqual(shown)
  })
})
