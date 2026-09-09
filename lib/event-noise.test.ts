import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ANALYSIS_MARKERS, NEGATIVE_TERMS, headlinePenalty, classifyPlace, classifyHazard } from '../scripts/lib/event-terms.mjs'
import { registerNamesPlace, validateEvent } from '../scripts/lib/climate-events.mjs'
import { placeVocabulary } from '../scripts/lib/event-terms.mjs'

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AN EXPLAINER IS NOT AN EVENT, AND A PAGE MUST NOT DECAY INTO ONE.
 * ───────────────────────────────────────────────────────────────────────────
 * On 9 September 2026 eight published disaster pages were withdrawn by hand.
 * Three of them were leading on something that had never been an event: an
 * explainer about how floods work, an op-ed about regional diplomacy, and a
 * story about a tunnel opening in four days.
 *
 * ★ AND THE ROUTE IN WAS NOT THE PUBLICATION GATE. Measured at the moment of
 * withdrawal, those three scored 6, −1 and 8 against a THRESHOLD of 14, on 1,
 * 1 and 2 independent publishers against a bar of 8 (or 4 with an official
 * alert). Nothing like them could be published today. They were live pages
 * because publishStateFor() LATCHES — an event that ever cleared the bar stays
 * published, deliberately, so a decaying news cycle cannot 404 an indexed URL
 * — and they had cleared it, months of coverage ago, when the bar was lower.
 *
 * So what actually failed is LEAD SELECTION on a page already published.
 * `sources` is rebuilt every run from a rolling two-day window and pickLead()
 * takes the least-penalised survivor. Once the real event reporting ages out,
 * commentary is all that is left — and headlinePenalty() REWARDED these: "From
 * Nepal to Dikhow: Understanding the forces behind major floods" earned −2 for
 * containing the word "flood" and was penalised for nothing whatever.
 *
 * ★ THE SET IS TWO-SIDED ON PURPOSE. A filter tested only against the eight
 * would pass by rejecting everything, and rejecting real disaster reporting is
 * a far worse failure than printing an op-ed. So every marker is tested
 * against a corpus of headlines from the FOUR STILL-STANDING events' own
 * source registers, which must survive untouched.
 *
 * ★ THE FIXTURES ARE HARD-CODED, RECOVERED FROM COMMIT f03c4703. They cannot
 * be read from data/climate-events/active/ at test time: `headline` is
 * recomputed on every detector run, so the withdrawn dossiers on disk now
 * carry different, later leads. assam-flood's lead today is "Assam: Diphu
 * river swells above danger mark, flash flood hits Karbi Anglong town, houses
 * submerged" — a real Assam flood. A test reading the live files would be
 * asserting against a moving target and would have gone green on its own.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** The three headlines that were leading a public disaster page and should
 *  never have been chosen. Recovered from f03c4703. */
const MUST_REJECT = [
  'From Nepal to Dikhow: Understanding the forces behind major floods',
  'Himalayan floods highlight urgent need for regional disaster preparedness: Safi Ahsan Rizvi',
  'Tunnel bypassing most landslide-prone zone of Manali highway to be opened in 4 days',
]

/**
 * Real reporting that must come through untouched. The first five are the
 * OTHER five withdrawn dossiers' leads — those pages were wrong about the
 * PLACE or the HAZARD, not about something having happened, so an
 * explainer filter that rejected them would be right by accident and wrong in
 * method. The rest are lead headlines and source-register titles from the four
 * events still standing.
 */
const MUST_KEEP = [
  // the five misattributed — real events, wrong label
  'Patna Flood: Ganga Swells, 11 Bihar Districts Affected; Homes, Roads & Crops Submerged',
  'Nepal Floods: Death Toll Rises to 1,400; Over 5,800 Missing',
  'At China–Nepal Frontier, Once-Busy Gyirong Crossing Reduced To Rubble By Glacier Flood',
  'Nepal Flood Death Toll Crosses 900',
  'Tamil Nadu: 23 give blood samples to identify Nepal flood victims',
  // the four still standing
  'Assam landslide: 3 killed, one injured as heavy rain triggers collapse',
  'Bihar flood situation serious, 16.85 lakh people affected across 11 districts',
  'Death toll from Nepal-China border floods rises to 1,410, with thousands still missing',
  'Uttarakhand: Heavy Rain Triggers Landslide On Garud-Bageshwar Highway, Essential Supplies Cut Off; Check Forecast',
  // from their source registers
  'Assam facing fresh spell of flooding, more than 25,000 affected',
  'Guwahati Landslide: Three of Family Killed, One Injured in Assam',
  '‘We survived on water, biscuits’: Assam man recounts 4-day ordeal after Nepal flash flood',
  '19 lakh lives impacted as Ganga breaches flood mark in Patna',
  'Bihar flood situation still grim; 2.24 million hit',
  'Ganga water level rises in Bihar, flood-like situation in low-lying areas as relief prep intensifies',
  'Bihar flood situation worsens after Ganga crosses highest flood mark in Patna, 19 lakh hit',
  'India sends fresh tranche of relief material, equipment aboard C-17 to flood-ravaged Nepal',
  'India Ramps Up Aid to Flood-Stricken Nepal with Eighth Relief Flight',
  'India steps up relief efforts in flood-hit Nepal; sends 8th flight with 35 tonnes of aid',
  'Typhoon Saudel makes third landfall on China’s eastern coast',
  'Bihar CM inspects flood relief operations in Vaishali, Saran; distributes cheques to kin of victims',
  'Nepal forms panel to assess Rasuwa flood losses, climate finance claims',
]

/**
 * DELIBERATELY NOT ASSERTED, either way. These sit in a published event's
 * register and read as institutional or advocacy news rather than as a report
 * of the event: "Why Bihar govt is advising citizens not to fish in Nepal
 * floodwaters", "Nepal says big polluters must 'wake up'…", "India and Nepal
 * hold meeting… ahead of monsoon". A filter that demoted them as leads would
 * arguably be RIGHT, and one that kept them is not obviously wrong. Pinning a
 * verdict on them would be over-fitting the vocabulary to a judgement nobody
 * has made, so this file states the ambiguity instead of resolving it.
 */

const hits = (title: string) => ANALYSIS_MARKERS.filter((m) => title.toLowerCase().includes(m))

describe('the explainer vocabulary', () => {
  it('rejects every headline that led a page it should not have', () => {
    for (const title of MUST_REJECT) {
      expect(hits(title), `nothing marks this as commentary: "${title}"`).not.toEqual([])
    }
  })

  it('leaves real disaster reporting completely alone', () => {
    for (const title of MUST_KEEP) {
      expect(hits(title), `this is a real report and the vocabulary rejects it — a false `
        + `negative here suppresses actual disaster coverage: "${title}"`).toEqual([])
    }
  })

  it('is reachable from the cluster score as well as from lead selection', () => {
    /* Both layers, from one list. NEGATIVE_TERMS feeds the proportional
       cluster penalty in the scorer — which keeps the publication route shut
       if THRESHOLD is ever lowered again, and it has been lowered and raised
       before. headlinePenalty() is exercised directly in the block below. */
    for (const m of ANALYSIS_MARKERS) {
      expect(NEGATIVE_TERMS, `"${m}" is in ANALYSIS_MARKERS but not in NEGATIVE_TERMS, so it `
        + 'affects which headline leads and not whether the cluster scores').toContain(m)
    }
  })

  it('every marker is lowercase, since both call sites lowercase the haystack', () => {
    for (const m of ANALYSIS_MARKERS) expect(m).toBe(m.toLowerCase())
  })
})

/**
 * AND THE SCORER ITSELF, not just the vocabulary. headlinePenalty() lived
 * unexported inside detect-climate-events.mjs, which cannot be imported — it
 * reads the news at module scope — so nothing could assert on it, which is how
 * the hole stayed open until a person read eight live pages. It now sits in
 * lib/event-terms.mjs beside the words it scores, and these call it for real.
 */
describe('headlinePenalty, on the real function', () => {
  /* Lower is better: pickLead() sorts ascending and takes the first. */
  const worstKeep = (hazard: string) => Math.max(...MUST_KEEP.map((t) => headlinePenalty(t, hazard)))

  it('ranks every rejected headline below every real report of the same hazard', () => {
    for (const bad of MUST_REJECT) {
      const hazard = /landslide|tunnel/i.test(bad) ? 'landslide' : 'flood'
      const p = headlinePenalty(bad, hazard)
      expect(p, `"${bad}" still scores ${p}, no worse than the worst real report `
        + `(${worstKeep(hazard)}) — pickLead() could choose it the moment the real `
        + 'reporting ages out of the two-day window').toBeGreaterThan(worstKeep(hazard))
    }
  })

  it('would have out-ranked the explainer that led assam-flood', () => {
    /* The exact pairing that shipped: the page was leading on the explainer
       while its own register still held a report of a real flood. */
    const explainer = headlinePenalty('From Nepal to Dikhow: Understanding the forces behind major floods', 'flood')
    const report = headlinePenalty('Assam: Diphu river swells above danger mark, flash flood hits Karbi Anglong town, houses submerged', 'flood')
    expect(report).toBeLessThan(explainer)
  })

  it('still prefers a plain report to an aggregator digest, as it did before', () => {
    /* Unchanged behaviour, asserted so this change cannot have cost it. */
    const digest = headlinePenalty('News Today: Avalanche, glacier burst, warning delay: What caused Nepal floods? What experts say', 'flood')
    const report = headlinePenalty('Death toll from Nepal-China border floods rises to 1,410, with thousands still missing', 'flood')
    expect(report).toBeLessThan(digest)
  })

  it('still prefers the event to one person\'s story, as it did before', () => {
    const personal = headlinePenalty('Nepal flash floods: Software engineer from A.P.\'s Kuppam \'missing\', family appeals for assistance', 'flood')
    const report = headlinePenalty('Bihar flood situation serious, 16.85 lakh people affected across 11 districts', 'flood')
    expect(report).toBeLessThan(personal)
  })
})

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MISATTRIBUTION: A REAL STORY WEARING THE WRONG LABEL.
 * ───────────────────────────────────────────────────────────────────────────
 * Five of the eight pages withdrawn on 9 September 2026 were not about
 * nothing. They were real events filed under the wrong place or the wrong
 * hazard: "Nepal Flood Death Toll Crosses 900" as an Odisha landslide, "Tamil
 * Nadu: 23 give blood samples to identify Nepal flood victims" as a Tamil
 * Nadu flood, "Patna Flood: Ganga Swells" as a Bihar landslide.
 *
 * ★ ALL EIGHT CLEARED THE CORROBORATION BAR, 8 of 8. That bar asks how many
 * independent outlets carried the story, and every one of those stories was
 * TRUE — so breadth cannot catch this and raising it never will. Two things
 * close it instead, and they work at different ends.
 * ═══════════════════════════════════════════════════════════════════════════
 */
describe('a place name is a word, not a substring', () => {
  it('does not find a river inside a person’s surname', () => {
    /* krishna-flood.json exists because a bare includes() found "krishna" in
       RadhaKRISHNAn, and title() prefers the longest match — 7 beats the 6 of
       "kerala" in "Keralam" — so the Vice-President's name won. */
    const h = 'vice president radhakrishnan urges deepening of keralam rivers to prevent floods'
    expect(classifyPlace(h)?.place).not.toBe('Krishna')
    expect(classifyPlace(h)?.place).toBe('Kerala')
  })

  it('still matches a place inside a legitimate inflection', () => {
    /* Anchored at the START only, deliberately: Keralam is Kerala. */
    expect(classifyPlace('keralam rivers in spate')?.place).toBe('Kerala')
  })

  it('still matches a hazard word in every form it is written in', () => {
    for (const h of ['heavy flooding in bihar', 'bihar floods worsen', 'patna flooded overnight']) {
      expect(classifyHazard(h)?.hazard, `"${h}" no longer reads as a flood`).toBe('flood')
    }
  })

  it('reads each of the five misfiled headlines as something other than its old label', () => {
    const cases: [string, string, string][] = [
      ['nepal floods: death toll rises to 1,400; over 5,800 missing', 'Kashmir', 'flood'],
      ['at china–nepal frontier, once-busy gyirong crossing reduced to rubble by glacier flood', 'Odisha', 'flood'],
      ['nepal flood death toll crosses 900', 'Odisha', 'landslide'],
      ['tamil nadu: 23 give blood samples to identify nepal flood victims', 'Tamil Nadu', 'flood'],
      ['patna flood: ganga swells, 11 bihar districts affected; homes, roads & crops submerged', 'Bihar', 'landslide'],
    ]
    for (const [h, wrongPlace, wrongHazard] of cases) {
      const got = `${classifyHazard(h)?.hazard} @ ${classifyPlace(h)?.place}`
      expect(got, `still reads as ${wrongHazard} @ ${wrongPlace}: "${h}"`)
        .not.toBe(`${wrongHazard} @ ${wrongPlace}`)
    }
  })
})

describe('the register must name the place the page claims', () => {
  const reg = (place: string, titles: string[]) =>
    registerNamesPlace({ location: { text: place }, sources: titles.map((t, i) => ({ id: `n${i}`, title: t })) })

  it('blocks a place no item in the register mentions', () => {
    expect(reg('Kashmir', ['Nepal Floods: Death Toll Rises to 1,400; Over 5,800 Missing'])).toBe(false)
    expect(reg('Krishna', ['Vice President Radhakrishnan urges deepening of Keralam rivers'])).toBe(false)
  })

  it('does NOT block a real event over a shortened place name', () => {
    /* ★ THE LOAD-BEARING CASE. Indian outlets write "Himachal" for Himachal
       Pradesh. A gate that failed this would block real disaster pages, which
       is a far worse failure than letting an odd register through — so it asks
       for ANY token of the place, not all of them. This is why it is weaker
       than mentionsPlace(), which attributes a figure and is right to be
       strict. */
    expect(reg('Himachal Pradesh', ['Nepal floods raise alarm in Himachal: IIT Mandi flags 9 glacial lakes'])).toBe(true)
    expect(reg('Bihar', ['19 lakh lives impacted as Ganga breaches flood mark in Patna',
      'Bihar flood situation still grim; 2.24 million hit'])).toBe(true)
  })

  it('accepts the cities a state\'s flood is actually reported in', () => {
    /* ★ THE CASE THAT CAUGHT THE FIRST VERSION OF THIS GATE, on live data,
       within one run of it being written. uttar-pradesh-flood's register is
       "Lucknow on Alert Today" and "flood-hit families in Kanpur"; REGION_OF
       folds both cities into Uttar Pradesh and the CLUSTER KEY is
       regionOf(place), so the dossier is correctly named and not one headline
       says "Uttar Pradesh". A gate that asked only for the place string would
       have blocked a real flood page — the exact failure that is worse than
       the disease. It must ask with the clusterer's own vocabulary. */
    expect(reg('Uttar Pradesh', ['Flash Flood Risk on Wednesday: Lucknow on Alert Today'])).toBe(true)
    expect(reg('Uttar Pradesh', ['Expired syrup given to flood-hit families in Kanpur?'])).toBe(true)
    expect(placeVocabulary('Uttar Pradesh')).toEqual(expect.arrayContaining(['lucknow', 'kanpur']))
  })

  it('accepts a tier-2 zone\'s own place names', () => {
    /* Nepal's flood is reported as Rasuwa, Sindhupalchok and Bhote Koshi. */
    expect(reg('Nepal', ['Rasuwa flood losses assessed by new panel'])).toBe(true)
    expect(placeVocabulary('Nepal')).toEqual(expect.arrayContaining(['rasuwa', 'sindhupalchok']))
  })

  it('does not gate an official-only register, which is not its business', () => {
    expect(registerNamesPlace({ location: { text: 'Assam' }, sources: [{ id: 'official-1', title: 'IMD red warning' }] })).toBe(true)
  })

  it('refuses to publish a dossier whose register contradicts its place', () => {
    const base = {
      slug: 'x-flood', headline: 'A headline', hazard: 'flood', india_relevance: 'direct', tier: 1,
      origin: 'automated', location: { text: 'Kashmir', country: 'India' },
      occurred: { epochMs: 1_788_000_000_000 }, last_updated: { epochMs: 1_788_000_000_000 },
      publish_state: 'published', uncertain: ['not established'],
      published_on: { epochMs: 1_788_000_000_000, independent_publishers: 12, official_alerts: 0 },
      sources: [{ id: 'n0', tier: 'news', publisher: 'X', title: 'Nepal Floods: Death Toll Rises to 1,400' }],
    }
    expect(() => validateEvent('active/x.json', base)).toThrow(/names that place/)
    /* …and the identical dossier is fine once its register is about Kashmir. */
    const ok = { ...base, sources: [{ id: 'n0', tier: 'news', publisher: 'X', title: 'Kashmir floods: 12 dead as Jhelum breaches' }] }
    expect(() => validateEvent('active/x.json', ok)).not.toThrow()
  })

  it('every page live on the site right now passes it', () => {
    /* ★ THIS ONE READS THE LIVE FILES ON PURPOSE, unlike the headline fixtures
       above. The property being asserted is about TODAY'S data, not a
       historical string: if a published dossier's register ever stops naming
       its own place, that is exactly the defect this gate exists for and the
       suite should go red. Measured when written: 4/5, 15/17, 22/24 and 1/1. */
    const dir = join(ROOT_DIR, 'data', 'climate-events', 'active')
    const live = readdirSync(dir).filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
      .filter((d) => d.publish_state === 'published')
    expect(live.length, 'no published dossiers found — has the path moved?').toBeGreaterThan(0)
    for (const d of live) {
      expect(registerNamesPlace(d), `${d.slug} is published as "${d.location.text}" and no item in its `
        + 'register names it').toBe(true)
    }
  })
})
