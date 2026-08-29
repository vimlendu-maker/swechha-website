import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
// Importing the .mjs script modules directly is the repo's standing convention
// for these — see caaqms.test.ts and air-history.test.ts. `allowJs` is on, so
// types are inferred and no suppression is needed.
import { figuresFromText, consolidate, eventName, mentionsPlace } from '../scripts/lib/event-figures.mjs'
import { dedupeFeedItems, anchorPublished } from '../scripts/lib/event-feed.mjs'
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
      src('b', 'B', 'flood death toll hits 940', 'Fri, 28 Aug 2026 12:00:00 GMT'),
      src('c', 'C', 'flood death toll hits 820', 'Fri, 28 Aug 2026 22:00:00 GMT'),
    ]))
    // C is newest and LOWER than both. Recency is a fact about the record;
    // magnitude is a preference, and taking the larger would be this page
    // choosing the more alarming of numbers it cannot adjudicate. 820 against
    // a 940 peak is a 12.8% revision — inside the agreement band, so it is
    // ordinary movement and it leads.
    expect(rows.deaths.value).toBe(820)
    expect(rows.deaths.spread).toMatchObject({ min: 820, max: 940, outlets: 3 })
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

/**
 * ★ THE DETECTOR MUST NOT EAT AN EDITOR'S DECISION, and this had a
 * thirty-minute fuse in production.
 *
 * `dossier()` in scripts/detect-climate-events.mjs rebuilds the event object
 * from a FIXED key set, so any field not named in it is dropped on the next
 * run — and that run happens on every scheduled CI tick (hourly; was
 * half-hourly, cut back 29 August). An editor demoting an
 * event off the homepage would have had the decision reverted automatically,
 * with the page quietly promoting itself again. `hero_days` had the same hole
 * and predates the lifecycle entirely.
 *
 * This test reads the SCRIPT rather than running it, because running it means
 * hitting Google News. What it asserts is the wiring: that every field this
 * repository treats as human-set is in the allowlist, and that the allowlist is
 * actually applied to the dossier before it is written.
 */
describe('the detector preserves what a person set', () => {
  const src = readFileSync(join(__dirname, '..', 'scripts', 'detect-climate-events.mjs'), 'utf8')

  it('carries every editor-owned field across a re-detection', () => {
    for (const field of [
      'situation_status',      // the lifecycle — read by lib/active-situation.mjs
      'situation_status_why',
      'hero_days',             // read by isCurrent() in lib/climate-events.mjs
      'cause_status',          // read by the cause band
    ]) {
      expect(src, `${field} is human-set and must be in EDITOR_OWNED, or the next `
        + 'scheduled detection silently discards it').toContain(`'${field}'`)
    }
  })

  it('applies the allowlist to the dossier it is about to write', () => {
    expect(src).toMatch(/keepEditorFields\(await dossier\(/)
  })

  it('reconciles the feeds rather than keeping whichever query was read first', () => {
    // The 600-to-160 incident. A bare `seenLink`/`seenTitle` Set drops the
    // duplicate copy of an article and keeps the first one's pubDate, which
    // Google varies per query — so the recorded publication time of a story
    // already on the page depended on which feed surfaced it that run.
    expect(src).toContain('dedupeFeedItems(items)')
    expect(src).not.toMatch(/seenLink\.has\(/)
  })

  it('anchors a news source\'s publication time against a later feed answer', () => {
    expect(src).toMatch(/anchorPublished\(sources, existing\?\.sources\)/)
    // And everything downstream must read the ANCHORED register, or the anchor
    // is computed and then thrown away.
    expect(src).toContain('consolidate(register, { place: c.place })')
    expect(src).toContain('sources: register,')
  })

  it('does NOT preserve by spreading the previous file over the new one', () => {
    // A spread would also freeze the score, the corroboration counts and the
    // timestamps — the things the detector exists to update. The division is
    // evidence for the detector, judgement for a person, neither overwriting
    // the other.
    expect(src).not.toMatch(/return\s*\{\s*\.\.\.existing/)
  })
})

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE 600 → 160 INCIDENT, 28–29 AUGUST 2026.
 * ───────────────────────────────────────────────────────────────────────────
 * /now/climate-event/nepal-glof led on "600 CONFIRMED DEAD" at 19:10 IST and
 * on "160 CONFIRMED DEAD" from 21:17 IST until 01:12, four and a half hours,
 * on a live disaster page. Nothing about the disaster changed. One field did.
 *
 * MEASURED CAUSE, both halves reproduced below.
 *
 *  1. GOOGLE NEWS GIVES THE SAME ARTICLE TWO DIFFERENT pubDates. The News On
 *     AIR piece "Nepal flash flood claims nearly 160 lives" is returned by the
 *     `india flood...` query stamped 19:48:50 GMT and by the
 *     `india OR nepal ... cloudburst` query stamped 13:39:10 GMT — same URL,
 *     same title, six hours and nine minutes apart. Verified live against both
 *     feeds on 29 August 2026. collectNews() de-duplicated by link keeping
 *     whichever query surfaced it first, and query membership churns run to
 *     run, so the recorded publication time of an article already on the page
 *     moved FORWARD by six hours between two runs.
 *
 *  2. consolidate() elected the lead figure by that one field alone. A stale
 *     "nearly 160 lives" headline re-stamped to 19:48 became the most recent
 *     reading, and a death toll the page had already published at 600 fell to
 *     160 under the words CONFIRMED DEAD.
 *
 * The same article's "over 750 Missing" simultaneously displaced India Today's
 * 2,500 on the missing card, which is the same defect on a second figure and
 * is why the tests below cover both.
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('an article\'s publication time may not move', () => {
  const item = (link: string, title: string, published: string) =>
    ({ link, title, publisher: 'News On AIR', published, publishedMs: Date.parse(published) })

  const LINK = 'https://news.google.com/rss/articles/CBMimAFBVV95cUxQUFAy'
  const TITLE = 'Nepal flash flood claims nearly 160 lives; over 750 Missing, including 133 Indians'

  it('keeps the earliest pubDate when one feed disagrees with another', () => {
    // Exactly the two rows Google returned for one URL. Whichever query is
    // read first, the article keeps the earlier time — so the answer no longer
    // depends on which feed happened to surface it this run.
    const late = dedupeFeedItems([
      item(LINK, TITLE, 'Fri, 28 Aug 2026 19:48:50 GMT'),
      item(LINK, TITLE, 'Fri, 28 Aug 2026 13:39:10 GMT'),
    ])
    const early = dedupeFeedItems([
      item(LINK, TITLE, 'Fri, 28 Aug 2026 13:39:10 GMT'),
      item(LINK, TITLE, 'Fri, 28 Aug 2026 19:48:50 GMT'),
    ])
    expect(late).toHaveLength(1)
    expect(early).toHaveLength(1)
    expect(late[0].publishedMs).toBe(Date.parse('Fri, 28 Aug 2026 13:39:10 GMT'))
    expect(early[0].publishedMs).toBe(late[0].publishedMs)
  })

  it('still counts one story once, however many feeds carry it', () => {
    const out = dedupeFeedItems([
      item('l1', 'Nepal flood toll rises to 547', 'Fri, 28 Aug 2026 12:00:00 GMT'),
      item('l2', 'Nepal flood toll rises to 547', 'Fri, 28 Aug 2026 14:00:00 GMT'),
      item('l3', 'Nepal flood toll rises to 579', 'Fri, 28 Aug 2026 15:00:00 GMT'),
    ])
    expect(out).toHaveLength(2)
    expect(out[0].publishedMs).toBe(Date.parse('Fri, 28 Aug 2026 12:00:00 GMT'))
  })

  it('never lets a stamp already on the page move forward on a later run', () => {
    // The persistence half. Even if a feed invents a third, later time on some
    // future run, the register keeps what it first recorded for that article.
    const previous = [
      { id: 'a', tier: 'news', publisher: 'News On AIR', title: TITLE, url: LINK,
        published: 'Fri, 28 Aug 2026 13:39:10 GMT' },
    ]
    const fetched = [
      { id: 'a', tier: 'news', publisher: 'News On AIR', title: TITLE, url: LINK,
        published: 'Fri, 28 Aug 2026 19:48:50 GMT' },
    ]
    expect(anchorPublished(fetched, previous)[0].published)
      .toBe('Fri, 28 Aug 2026 13:39:10 GMT')
  })

  it('accepts an EARLIER stamp, and a stamp for an article it has not seen', () => {
    const previous = [
      { id: 'a', tier: 'news', publisher: 'P', title: 'T', published: 'Fri, 28 Aug 2026 19:48:50 GMT' },
    ]
    expect(anchorPublished(
      [{ id: 'a', tier: 'news', publisher: 'P', title: 'T', published: 'Fri, 28 Aug 2026 13:39:10 GMT' }],
      previous,
    )[0].published).toBe('Fri, 28 Aug 2026 13:39:10 GMT')

    expect(anchorPublished(
      [{ id: 'b', tier: 'news', publisher: 'P', title: 'T2', published: 'Fri, 28 Aug 2026 20:00:00 GMT' }],
      previous,
    )[0].published).toBe('Fri, 28 Aug 2026 20:00:00 GMT')
  })

  it('leaves official alerts alone — their ids are positional, not the article\'s', () => {
    // `official-1` is the first matched alert of whatever run wrote it. Two
    // runs' `official-1` are different alerts, so an id match means nothing.
    const previous = [{ id: 'official-1', tier: 'official', publisher: 'IMD', title: 'A',
      published: 'Fri, 28 Aug 2026 01:00:00 GMT' }]
    const fetched = [{ id: 'official-1', tier: 'official', publisher: 'IMD', title: 'B',
      published: 'Fri, 28 Aug 2026 20:00:00 GMT' }]
    expect(anchorPublished(fetched, previous)[0].published).toBe('Fri, 28 Aug 2026 20:00:00 GMT')
  })
})

/**
 * THE SECOND HALF: the lead figure must survive one bad timestamp.
 *
 * Fixing the feed is necessary and it is not sufficient. Read with its TRUE
 * 13:39 stamp, the News On AIR "nearly 160 lives" headline was still, for four
 * hours and forty-five minutes, the most recently published death figure in
 * the register — while the Times of India (500), India Today (587), Maktoob
 * (469) and Al Jazeera (470) had all already printed three to four times that.
 * Recency alone would have put 160 on the page anyway, just earlier in the day.
 *
 * So: a death toll and a missing count only accumulate. A newer figure that
 * COLLAPSES an established one is a stale republish, a different scope or a
 * correction — never new knowledge — and this page will not lead on it until
 * the rest of the record agrees. Movement inside the agreement band is normal
 * revision and still passes straight through, because that is the ordinary
 * case and recency is right about it.
 */
describe('the lead figure survives one bad reading', () => {
  const src = (id: string, publisher: string, title: string, published: string) =>
    ({ id, publisher, title, published, tier: 'news' })

  it('does not let a stale headline collapse an established toll', () => {
    const rows = rowsOf(consolidate([
      src('toi', 'The Times of India', 'Nepal flood toll nears 500', 'Fri, 28 Aug 2026 04:05:00 GMT'),
      src('it', 'India Today', 'Nepal flood toll rises to 587', 'Fri, 28 Aug 2026 06:58:00 GMT'),
      src('mak', 'Maktoob', 'Nepal flood death toll rises to 469', 'Fri, 28 Aug 2026 07:20:00 GMT'),
      src('noa', 'News On AIR', 'Nepal flash flood claims nearly 160 lives; over 750 Missing',
        'Fri, 28 Aug 2026 13:39:10 GMT'),
    ]))
    expect(rows.deaths.value).toBe(587)
    // The 160 is not suppressed. It is still a reading, still attributed, and
    // still one end of the range the card prints.
    expect(rows.deaths.spread).toMatchObject({ min: 160, max: 587 })
    expect(rows.deaths.readings.map((r) => r.value)).toContain(160)
  })

  it('lets an ordinary downward revision through', () => {
    // 600 → 547 is 8.8%, inside the agreement band: outlets counting the same
    // event slightly differently, which is the normal case and not a collapse.
    const rows = rowsOf(consolidate([
      src('it', 'India Today', 'Nepal flood toll nears 600', 'Fri, 28 Aug 2026 18:24:00 GMT'),
      src('et', 'The Economic Times', 'Nepal flood toll hits 547', 'Fri, 28 Aug 2026 23:08:00 GMT'),
    ]))
    expect(rows.deaths.value).toBe(547)
  })

  it('fixes the missing count the same reading was understating', () => {
    // Live on the page at the time of writing: "OVER 750 · MISSING · Outlets
    // report 750–2,500". India Today's 2,500 is the figure that stands.
    const rows = rowsOf(consolidate([
      src('it', 'India Today', 'Nepal toll nears 600, search for 2,500 missing continues',
        'Fri, 28 Aug 2026 18:24:00 GMT'),
      src('noa', 'News On AIR', 'Nepal flash flood claims nearly 160 lives; over 750 Missing',
        'Fri, 28 Aug 2026 19:48:50 GMT'),
    ]))
    expect(rows.missing.value).toBe(2500)
  })

  it('accepts a sustained fall once the high reading is a day old', () => {
    // A missing count genuinely falls as people are accounted for. The guard
    // compares against the last twelve hours only, so a real, sustained fall
    // is published rather than frozen behind yesterday's peak.
    const rows = rowsOf(consolidate([
      src('a', 'A', 'Nepal flood: 2,500 missing', 'Fri, 28 Aug 2026 02:00:00 GMT'),
      src('b', 'B', 'Nepal flood: missing now 400', 'Sat, 29 Aug 2026 06:00:00 GMT'),
    ]))
    expect(rows.missing.value).toBe(400)
  })

  it('still prefers the newer of two figures that agree', () => {
    const rows = rowsOf(consolidate([
      src('a', 'A', 'flood death toll hits 540', 'Fri, 28 Aug 2026 02:00:00 GMT'),
      src('b', 'B', 'flood death toll hits 547', 'Fri, 28 Aug 2026 12:00:00 GMT'),
    ]))
    expect(rows.deaths.value).toBe(547)
  })
})
