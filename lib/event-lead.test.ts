import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// Importing the .mjs script modules directly is the repo's standing convention
// for these — see active-situation.test.ts and event-noise.test.ts. `allowJs`
// is on, so types are inferred and no suppression is needed.
import { consolidate, figuresFromText } from '../scripts/lib/event-figures.mjs'
import { electHeadline, rankHeadlines, headlineDisagreesWith, LEAD_FIGURE_METRICS } from '../scripts/lib/event-lead.mjs'

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * A PAGE MAY NOT PRINT TWO DIFFERENT DEATH TOLLS ABOUT THE SAME DISASTER.
 * ───────────────────────────────────────────────────────────────────────────
 * Read off disk on 11 September 2026, from data/climate-events/active/
 * nepal-glof.json, in one file:
 *
 *   "headline": "Nepal flood death toll rises to 1,377, over 5,000 still missing"
 *   "impact":   { "deaths": { "value": 1365, ... } }
 *
 * Both numbers are verbatim quotations of outlets and neither is wrong in
 * itself, which is exactly why nothing caught it. The page contradicted itself
 * in public about a disaster that has killed more than a thousand people.
 *
 * The cause was two pools and two rules. The headline came from ranking the
 * detector's FULL item list by headlinePenalty(); the figure came from
 * consolidate() over the dossier's 24-item register, filtered again by the
 * place guard and by electLead(). The 1,377 item was not in that register at
 * all — it could lead the page while contributing nothing to the figure the
 * page published. Nothing compared the two before the file was written.
 *
 * ★ EVERY HEADLINE BELOW IS REAL. The four register titles are quoted from
 * nepal-glof.json's own `sources` array with their own published stamps; the
 * 1,377 line is the `headline` that file carried on 11 September 2026. No
 * figure in this file was chosen, adjusted or invented here — that is the one
 * thing neither this test nor the code under it is allowed to do.
 */

/** consolidate() keys its result by metric at runtime, so the inferred type is
 *  the empty object. Same two aliases active-situation.test.ts uses. */
type Row = { value: number; status: string; label: string }
const rowsOf = (r: unknown) => r as Record<string, Row>

type Candidate = { title: string; publishedMs: number }

/* nepal-glof.json's own register, four entries of it, verbatim. */
const REGISTER = [
  {
    id: 'rediff-india-sends-fresh-relief-mater',
    publisher: 'Rediff',
    title: 'India sends fresh relief materials to flood-hit Nepal; toll rises to 1,365',
    published: 'Wed, 09 Sep 2026 20:31:23 GMT',
  },
  {
    id: 'public-tv-english-nepal-flood-death-toll-rises-t',
    publisher: 'Public TV English',
    title: 'Nepal flood death toll rises to 1,369 as India sends eighth aid flight with over 130 tonnes of relief in total',
    published: 'Wed, 09 Sep 2026 17:52:27 GMT',
  },
  {
    id: 'indiatoday-in-nepal-flood-toll-hits-1-365-as',
    publisher: 'indiatoday.in',
    title: 'Nepal flood toll hits 1,365 as President Paudel pushes faster rescue',
    published: 'Wed, 09 Sep 2026 15:18:29 GMT',
  },
  {
    id: 'dd-news-india-sends-eighth-iaf-flight',
    publisher: 'DD News',
    title: 'India sends eighth IAF flight with relief supplies to flood-hit Nepal',
    published: 'Wed, 09 Sep 2026 18:36:46 GMT',
  },
]

const SHIPPED_LEAD = 'Nepal flood death toll rises to 1,377, over 5,000 still missing'
const AGREES = 'India sends fresh relief materials to flood-hit Nepal; toll rises to 1,365'
const NO_FIGURE = 'India sends eighth IAF flight with relief supplies to flood-hit Nepal'

/* The candidate pool the detector ranks: the register's four headlines plus the
   one that led the page and was never in the register. `publishedMs` is each
   item's own stamp; the 1,377 item is the newest, which is how it won a tie on
   penalty and became the lead. */
const POOL: Candidate[] = [
  { title: SHIPPED_LEAD, publishedMs: Date.parse('Wed, 09 Sep 2026 21:00:00 GMT') },
  ...REGISTER.map((s) => ({ title: s.title, publishedMs: Date.parse(s.published) })),
]

const deathsIn = (title: string) =>
  figuresFromText(title).find((f: { metric: string }) => f.metric === 'deaths')

describe('the lead headline may not contradict the dossier’s own figures', () => {
  const impact = rowsOf(consolidate(REGISTER, { place: 'Nepal' }))

  it('reproduces the register’s side of the defect: consolidate() holds 1365', () => {
    /* Not asserted as a fact about Nepal — asserted as what THIS register
       yields, which is what the page prints in the CONFIRMED DEAD card. The
       newest reading leads (Rediff, 20:31), the 1,369 at 17:52 sets the top of
       the range, and the spread is inside the agreement band. It is the value
       nepal-glof.json held on 11 September 2026, and nothing here reads that
       file: a dossier is rewritten hourly by the detector, so an assertion
       against one would be a clock, not a check. */
    expect(impact.deaths.value).toBe(1365)
  })

  it('reproduces the headline side: the unguarded rule picks the 1,377 item', () => {
    /* rankHeadlines() IS the rule that shipped — least penalised, then most
       recent, over the whole pool. This assertion is the "before": it must keep
       passing, because the fix does not change the ranking, only what is
       allowed to win it. */
    expect(rankHeadlines(POOL, 'glof')[0].title).toBe(SHIPPED_LEAD)
    expect(deathsIn(SHIPPED_LEAD)).toMatchObject({ value: 1377 })
    expect(deathsIn(SHIPPED_LEAD)!.value).not.toBe(impact.deaths.value)
  })

  it('★ elects a headline that agrees with the figure the page will print', () => {
    /* The assertion that was red before the guard existed. The 1,377 item is
       disqualified and the next-best candidate — which happens to carry the
       same 1,365 the card prints — leads instead. */
    const lead = electHeadline(POOL, 'glof', impact)
    expect(lead?.title).toBe(AGREES)
    expect(deathsIn(lead!.title)!.value).toBe(impact.deaths.value)
  })

  it('disqualifies a headline that is IN the register but lost the election', () => {
    /* 1,369 is a real reading in `impact.deaths.readings` and still may not
       lead: the card prints 1,365, so a 1,369 heading over it is the same
       self-contradiction in a smaller font. */
    const inRegister = REGISTER[1].title
    expect(deathsIn(inRegister)).toMatchObject({ value: 1369 })
    expect(headlineDisagreesWith(inRegister, impact)).toBe(true)
  })

  it('accepts a headline carrying no death toll at all — plainer beats wrong', () => {
    const plainOnly: Candidate[] = [
      { title: SHIPPED_LEAD, publishedMs: 3 },
      { title: REGISTER[1].title, publishedMs: 2 },
      { title: NO_FIGURE, publishedMs: 1 },
    ]
    expect(headlineDisagreesWith(NO_FIGURE, impact)).toBe(false)
    expect(electHeadline(plainOnly, 'glof', impact)?.title).toBe(NO_FIGURE)
  })

  it('leaves a headline that already agrees alone — nepal-flood, 11 September 2026', () => {
    /* The sibling dossier, quoted from disk the same day: its headline and its
       impact row had converged on the same figure by coincidence of a later
       cron run. The guard must be silent there, or the fix would churn the
       headline of every page it was never about. */
    const title = 'Nepal flash flood death toll rises to 1,385 as over 5,000 remain missing'
    expect(deathsIn(title)).toMatchObject({ value: 1385 })
    expect(headlineDisagreesWith(title, rowsOf({
      deaths: { value: 1385, status: 'media_report', label: 'Confirmed dead' },
    }))).toBe(false)
  })

  it('leaves the ordinary case alone: an agreeing headline still wins on merit', () => {
    /* Guarding must not cost the best headline when nothing is wrong with it.
       Same pool, same ranking, impact that agrees with the top item. */
    const agreeing = rowsOf({ deaths: { value: 1377, status: 'media_report', label: 'Confirmed dead' } })
    expect(electHeadline(POOL, 'glof', agreeing)?.title).toBe(SHIPPED_LEAD)
    expect(electHeadline(POOL, 'glof', null)?.title).toBe(SHIPPED_LEAD)
  })

  it('covers both death metrics, and only those', () => {
    /* The check is one loop over LEAD_FIGURE_METRICS, so `deaths` above
       exercises the whole mechanism and `indians_dead` is data rather than a
       second code path. There is deliberately NO fixture headline for it:
       nothing in this repository's headline corpus or in the live registers
       under data/climate-events/active yields an indians_dead reading today,
       and writing one would mean
       composing a death toll here — the one thing neither this test nor the
       code under it may do. */
    expect(LEAD_FIGURE_METRICS).toEqual(['deaths', 'indians_dead'])
  })

  it('says nothing about a figure the page is not printing', () => {
    /* Deliberately narrow, and pinned here so a later widening is a decision
       rather than a drift: where the dossier holds no row for a metric, the
       card reads "not established" and there is nothing to contradict. */
    expect(headlineDisagreesWith(SHIPPED_LEAD, rowsOf({}))).toBe(false)
    expect(headlineDisagreesWith(SHIPPED_LEAD, null)).toBe(false)
    /* The missing count in the same headline (5,000) is not checked either.
       1,468 is this event's own earlier missing figure, quoted in
       event-figures.mjs; the guard lets the disagreement stand because
       LEAD_FIGURE_METRICS is two entries and the reason is on the module. */
    expect(headlineDisagreesWith(SHIPPED_LEAD, rowsOf({
      deaths: { value: 1377, status: 'media_report', label: '' },
      missing: { value: 1468, status: 'media_report', label: '' },
    }))).toBe(false)
  })

  it('never returns nothing when it was given something', () => {
    /* If every candidate disagrees, the unguarded pick stands: a page with a
       contradiction is bad, a page with no heading is worse. */
    const allWrong: Candidate[] = [
      { title: SHIPPED_LEAD, publishedMs: 2 },
      { title: REGISTER[1].title, publishedMs: 1 },
    ]
    expect(electHeadline(allWrong, 'glof', impact)?.title).toBe(SHIPPED_LEAD)
    expect(electHeadline([], 'glof', impact)).toBe(null)
  })
})

/**
 * THE WIRING, NOT ONLY THE RULE.
 *
 * electHeadline() is only load-bearing if the detector hands it the figures,
 * and the detector reads the news at module scope so no test can import it.
 * These assertions are what stops the guard being silently orphaned by a
 * future edit — the same defect class the two pools were.
 */
describe('the generators use the guard', () => {
  const src = readFileSync(join(ROOT_DIR, 'scripts/detect-climate-events.mjs'), 'utf8')

  /* Assertions are made against a SLICE, never the whole file: `toContain` on
     40KB of source prints 40KB of diff on failure, which buries the one line
     that matters. */
  it('computes impact BEFORE electing the lead, and passes it in', () => {
    const impactAt = src.indexOf('const impact = (() => {')
    const leadAt = src.indexOf('const lead = pickLead(')
    expect(impactAt).toBeGreaterThan(-1)
    expect(leadAt).toBeGreaterThan(-1)
    expect(impactAt).toBeLessThan(leadAt)
    expect(src.slice(leadAt, src.indexOf(';', leadAt) + 1))
      .toBe('const lead = pickLead(c.items, c.hazard, impact);')
  })

  it('elects through the tested module rather than a second private sort', () => {
    const imported = src.split('\n').find((l) => l.includes('event-lead.mjs')) ?? ''
    expect(imported).toContain('electHeadline')
    expect(src.split('\n').filter((l) => l.includes('electHeadline(')).length).toBeGreaterThan(0)
  })

  /* THE OTHER WRITE PATH. extract-event-figures.mjs backfills `impact` onto
     dossiers whose headline an earlier run already elected, so it can create
     the same contradiction from the other side. It has no candidate pool and
     may not compose a heading, so it abstains — and it must do so BEFORE the
     write, or the abstention is decorative. */
  it('the backfill path abstains instead of manufacturing the contradiction', () => {
    const back = readFileSync(join(ROOT_DIR, 'scripts/extract-event-figures.mjs'), 'utf8')
    const imported = back.split('\n').find((l) => l.includes('event-lead.mjs')) ?? ''
    expect(imported).toContain('headlineDisagreesWith')
    const guardAt = back.indexOf('if (headlineDisagreesWith(e.headline, next.impact))')
    const writeAt = back.indexOf('writeFileSync(path')
    expect(guardAt).toBeGreaterThan(-1)
    expect(writeAt).toBeGreaterThan(-1)
    expect(guardAt).toBeLessThan(writeAt)
  })
})
