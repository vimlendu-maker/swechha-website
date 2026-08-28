import { describe, it, expect } from 'vitest'
// Importing the .mjs script modules directly is the repo's standing convention
// for these — see caaqms.test.ts and air-history.test.ts. `allowJs` is on, so
// types are inferred and no suppression is needed.
import { figuresFromText, consolidate, eventName, mentionsPlace } from '../scripts/lib/event-figures.mjs'
import { statusOf, homepageSlot, situationHref, SITUATION_STATUS } from '../scripts/lib/active-situation.mjs'

/**
 * consolidate() keys its result by metric name at runtime, so the inferred type
 * is the empty object. These two aliases are the whole of the typing this file
 * needs; they exist so the assertions read as assertions rather than as index
 * expressions with casts in the middle of them.
 */
type Reading = { value: number; status: string; source: string; publisher?: string; hedge?: string | null; matched?: string }
type Row = {
  value: number; status: string; source: string[]; label: string; hedge: string | null
  spread: { min: number; max: number; outlets: number; readings: number; ratio: number }
  readings: Reading[]
}
const rowsOf = (r: unknown) => r as Record<string, Row>

/**
 * THE ACTIVE-SITUATION SYSTEM, AND THE HEADLINE GRAMMAR UNDER IT.
 *
 * Every string in the extraction block below is a REAL headline from
 * data/climate-events/active/nepal-glof.json, and the expectations are what
 * the page printed once each bug was found. Four of them are here because the
 * matcher got them wrong first:
 *
 *   1. "death toll rises to 469; 1,944 injured"  filed 469 as INJURED — it
 *      looked forward for a metric word, skipped past 1,944 and found that
 *      figure's noun. Fixed by reading backwards first.
 *   2. "toll hits 392; 288 Indians among 1,468 missing"  reported 1,468 DEAD,
 *      because "toll hits" was merely present in the backward window rather
 *      than abutting the numeral.
 *   3. "Deaths Rise To 472"  was dropped entirely: the tokeniser has to admit
 *      a comma so "1,468" survives, which made the token "472," and that
 *      fails the numeral test.
 *   4. "...1,944 injured, India's MEA says 290..."  marked the INJURY count an
 *      official estimate, because the ministry is named 30 characters away.
 *
 * A regression in any of these publishes a wrong number on a disaster page
 * under a confident label, which is the worst thing this repository can do.
 */
describe('headline figures: the numbers that must be read', () => {
  const one = (s: string) => figuresFromText(s)
  const find = (s: string, metric: string) =>
    one(s).find((f: { metric: string }) => f.metric === metric)

  it('reads a plain toll construction', () => {
    expect(find('Nepal-Tibet floods toll hits 547 as fresh flood fears slow rescue', 'deaths'))
      .toMatchObject({ value: 547 })
  })

  it('reads a toll written without the word "toll"', () => {
    expect(find('Nepal Flood Deaths Rise To 472, Over 170 Indians Missing Amid New Threat', 'deaths'))
      .toMatchObject({ value: 472 })
  })

  it('keeps the outlet\'s own hedge rather than dropping it', () => {
    expect(find('Nepal flash flood claims nearly 160 lives; over 750 Missing, including 133 Indians', 'deaths'))
      .toMatchObject({ value: 160, hedge: 'nearly' })
    expect(find('Nepal flash flood claims nearly 160 lives; over 750 Missing, including 133 Indians', 'missing'))
      .toMatchObject({ value: 750, hedge: 'over' })
  })

  it('does not let one figure steal the next figure\'s label', () => {
    const s = 'Nepal flood death toll rises to 469; 1,944 injured, India’s MEA says 290 Indians missing'
    expect(find(s, 'deaths')).toMatchObject({ value: 469 })
    expect(find(s, 'injured')).toMatchObject({ value: 1944 })
    expect(find(s, 'indians_missing')).toMatchObject({ value: 290 })
  })

  it('does not let a toll phrase claim every later numeral in the sentence', () => {
    const s = 'Nepal flood toll hits 392; 288 Indians among 1,468 missing'
    expect(find(s, 'deaths')).toMatchObject({ value: 392 })
    expect(find(s, 'missing')).toMatchObject({ value: 1468 })
    // 1,468 is the missing count. Nothing here may report it as a death toll.
    expect(one(s).filter((f: { metric: string }) => f.metric === 'deaths')).toHaveLength(1)
  })

  it('attributes an official voice only to the figure it is next to', () => {
    const s = 'Nepal flood death toll rises to 469; 1,944 injured, India’s MEA says 290 Indians missing'
    expect(find(s, 'indians_missing').official).toBe(true)
    expect(find(s, 'injured').official).toBe(false)
  })

  it('separates Indians-specific counts from the totals', () => {
    expect(find('320 Indian nationals remain uncontactable in flash flood in Nepal: MEA', 'indians_missing'))
      .toMatchObject({ value: 320 })
    expect(find('Nearly 300 Indian tourists missing after flash flood in Nepal', 'indians_missing'))
      .toMatchObject({ value: 300, hedge: 'nearly' })
  })
})

describe('headline figures: the numbers that must NOT be read', () => {
  const metrics = (s: string) => figuresFromText(s).map((f: { metric: string }) => f.metric)

  it('a count of countries is not a count of people', () => {
    expect(metrics('India, US, UK: List Of 35 Countries Whose Citizens Are Missing After Nepal Floods'))
      .toEqual([])
  })

  it('a distance glued to its unit is never a casualty figure', () => {
    expect(metrics('Nepal floods swept bodies 200km downstream, 3 found in UP')).toEqual([])
    expect(metrics('"God helped me, flood was just 100 metres from me": Rescued Indian pilgrim')).toEqual([])
  })

  it('a listicle number is not a figure', () => {
    expect(metrics('Nepal floods: 6 ways to help victims of the glacial collapse')).toEqual([])
  })

  it('a number of families is not a toll', () => {
    expect(metrics('Nepal flash flood: Families of 33 from Bengal pray for a miracle')).toEqual([])
  })

  it('a word is not a numeral — this module publishes digits or nothing', () => {
    expect(metrics('Glacial collapse left hundreds dead or missing')).toEqual([])
  })

  it('a headline with no numbers yields nothing', () => {
    expect(metrics('What we know about deadly Nepal-Tibet floods')).toEqual([])
    expect(metrics('Nepal flood sweeps elephant herd to India? Viral video makes false claim')).toEqual([])
  })
})

describe('consolidating disagreeing outlets', () => {
  const src = (id: string, publisher: string, title: string, published: string) =>
    ({ id, publisher, title, published, tier: 'news' })

  it('leads on the most recently published figure, not the largest', () => {
    const rows = rowsOf(consolidate([
      src('a', 'A', 'flood death toll hits 900', 'Fri, 28 Aug 2026 02:00:00 GMT'),
      src('b', 'B', 'flood death toll hits 500', 'Fri, 28 Aug 2026 12:00:00 GMT'),
    ]))
    // B is newer and lower. Recency is a fact about the record; magnitude is a
    // preference, and taking the larger would be this page choosing the more
    // alarming of two numbers it cannot adjudicate.
    expect(rows.deaths.value).toBe(500)
    expect(rows.deaths.spread).toMatchObject({ min: 500, max: 900, outlets: 2 })
  })

  it('calls a wide spread PRELIMINARY and a tight one a MEDIA REPORT', () => {
    const wide = rowsOf(consolidate([
      src('a', 'A', 'toll hits 160', 'Fri, 28 Aug 2026 02:00:00 GMT'),
      src('b', 'B', 'toll hits 547', 'Fri, 28 Aug 2026 12:00:00 GMT'),
    ]))
    expect(wide.deaths.status).toBe('preliminary')

    const tight = rowsOf(consolidate([
      src('a', 'A', 'toll hits 540', 'Fri, 28 Aug 2026 02:00:00 GMT'),
      src('b', 'B', 'toll hits 547', 'Fri, 28 Aug 2026 12:00:00 GMT'),
    ]))
    expect(tight.deaths.status).toBe('media_report')
  })

  it('every consolidated row is a valid claim: value, status, resolvable source', () => {
    const rows = rowsOf(consolidate([
      src('nd', 'NDTV', 'Nepal Flood Deaths Rise To 472', 'Fri, 28 Aug 2026 03:10:00 GMT'),
    ]))
    expect(rows.deaths.value).toBe(472)
    expect(rows.deaths.status).toBeTruthy()
    expect(rows.deaths.source).toEqual(['nd'])
    for (const r of rows.deaths.readings) {
      expect(r).toHaveProperty('value')
      expect(r).toHaveProperty('status')
      expect(r.source).toBe('nd')
    }
  })

  it('never invents a metric nothing reported', () => {
    const rows = rowsOf(consolidate([src('a', 'A', 'What we know about the floods', '')]))
    expect(Object.keys(rows)).toEqual([])
  })
})

/**
 * THE PLACE GUARD. This caught a figure about to be published on the wrong
 * event, which is the worst class of bug this whole system can have.
 *
 * The detector clusters by which places a headline mentions, so a regional
 * outlet covering somebody else's disaster lands in that region's cluster. All
 * three strings below are real: `goa-flood`, `kashmir-flood` and
 * `odisha-flood` each hold a Nepal death toll, printed by their own local
 * paper. Extracting figures without this guard put Nepal's 538 dead on three
 * Indian flood pages under three Indian place names.
 */
describe('a figure cannot migrate to the wrong event', () => {
  it('rejects another region\'s disaster from a local paper', () => {
    expect(mentionsPlace('Nepal Flood Death Toll Rises to 538; Over 1,400 Missing', 'Goa')).toBe(false)
    expect(mentionsPlace('Nepal Flash Flood Death Toll Rises to 469', 'Kashmir')).toBe(false)
    expect(mentionsPlace('Nepal Flood Death Toll Rises to 469', 'Odisha')).toBe(false)
  })

  it('rejects a headline that names no place at all', () => {
    // Two simultaneous floods; nothing in this sentence says which.
    expect(mentionsPlace('Death toll reaches 538, 977 still missing as rescue teams race', 'Kashmir')).toBe(false)
  })

  it('accepts the adjectival form, which is what headlines actually use', () => {
    expect(mentionsPlace('Hundreds killed and more than 1,000 missing after Himalayan flood', 'Himalaya')).toBe(true)
    expect(mentionsPlace('Goan NRI Missing In Nepal After Flash Flood', 'Goa')).toBe(true)
  })

  it('does not confuse two states that share a word', () => {
    expect(mentionsPlace('Himachal Pradesh: 12 dead in flash flood', 'Uttar Pradesh')).toBe(false)
    expect(mentionsPlace('Uttar Pradesh: 12 dead in flash flood', 'Uttar Pradesh')).toBe(true)
  })

  it('still matches a two-word place when the headline uses both words', () => {
    expect(mentionsPlace('21 rescued flood survivors from Tamil Nadu reach Kathmandu', 'Tamil Nadu')).toBe(true)
  })

  it('drops the guarded figure, not just the flag', () => {
    const rows = rowsOf(consolidate([
      { id: 'a', publisher: 'Herald Goa', tier: 'news', published: 'Fri, 28 Aug 2026 07:00:00 GMT',
        title: 'Nepal Flood Death Toll Rises to 538; Over 1,400 Missing' },
    ], { place: 'Goa' }))
    expect(Object.keys(rows)).toEqual([])
  })
})

describe('the event gets a name a person would say out loud', () => {
  it('does not reuse a listicle headline as the page heading', () => {
    const e = { location: { text: 'Nepal' }, hazard: 'glof', slug: 'nepal-glof' }
    expect(eventName(e)).toBe('Nepal: glacial flood')
    expect(eventName({ ...e, hazard: 'flood', location: { text: 'Assam, India' } })).toBe('Assam flood')
    expect(eventName({ ...e, hazard: 'cyclone', location: { text: 'Odisha' } })).toBe('Cyclone over Odisha')
  })
})

describe('the lifecycle', () => {
  const DAY = 86400000
  const ev = (over: Record<string, unknown> = {}) => ({
    slug: 'e', publish_state: 'published', tier: 2, hazard: 'glof',
    significance_score: 22, location: { text: 'Nepal' },
    last_updated: { epochMs: Date.now() }, ...over,
  })

  it('derives ACTIVE from fresh evidence, and ages out on its own', () => {
    const now = Date.now()
    expect(statusOf(ev(), now).status).toBe('active')
    expect(statusOf(ev({ last_updated: { epochMs: now - 5 * DAY } }), now).status).toBe('developing')
    expect(statusOf(ev({ last_updated: { epochMs: now - 15 * DAY } }), now).status).toBe('stabilising')
    expect(statusOf(ev({ last_updated: { epochMs: now - 40 * DAY } }), now).status).toBe('demoted')
  })

  it('lets an admin override the derived answer in either direction', () => {
    const now = Date.now()
    const fresh = ev()
    expect(statusOf({ ...fresh, situation_status: 'demoted' }, now)).toMatchObject({
      status: 'demoted', source: 'admin',
    })
    const old = ev({ last_updated: { epochMs: now - 40 * DAY } })
    expect(statusOf({ ...old, situation_status: 'active' }, now)).toMatchObject({
      status: 'active', source: 'admin',
    })
  })

  it('refuses a status word it does not know rather than showing an unlabelled dot', () => {
    expect(() => statusOf(ev({ situation_status: 'urgent' }))).toThrow(/not a status/)
  })

  it('gives an unpublished dossier no public standing', () => {
    expect(statusOf(ev({ publish_state: 'draft' })).status).toBe('archived')
  })

  it('never lets a demoted or archived event onto the homepage', () => {
    for (const s of ['demoted', 'archived']) {
      expect(SITUATION_STATUS[s as keyof typeof SITUATION_STATUS].hero).toBe(0)
      expect(SITUATION_STATUS[s as keyof typeof SITUATION_STATUS].pill).toBeNull()
    }
  })

  it('puts an active event first and a stabilising one only in the rotation', () => {
    const now = Date.now()
    expect(homepageSlot([ev()], now).slot).toBe('primary')
    expect(homepageSlot([ev({ situation_status: 'stabilising' })], now).slot).toBe('rotation')
    expect(homepageSlot([ev({ situation_status: 'demoted' })], now).slot).toBeNull()
    expect(homepageSlot([], now).slot).toBeNull()
  })

  it('prefers the primary event over a stabilising one when both are live', () => {
    const now = Date.now()
    const picked = homepageSlot([
      ev({ slug: 'quiet', situation_status: 'stabilising', significance_score: 99 }),
      ev({ slug: 'loud', situation_status: 'active', significance_score: 5 }),
    ], now)
    // Status outranks score: a STABILISING event with a huge score must not
    // take the primary slot from an ACTIVE one.
    expect(picked.event.slug).toBe('loud')
    expect(picked.slot).toBe('primary')
  })

  it('the homepage link is the event page, never the section index', () => {
    expect(situationHref({ slug: 'nepal-glof' })).toBe('/now/climate-event/nepal-glof')
  })
})
