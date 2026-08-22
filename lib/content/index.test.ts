import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../markdown'
import { getAllStories, getStoryBySlug, getAllEntries, getRelated } from './index'
import { getAllCampaigns, getCampaignBySlug, getActiveSituations, compareBySeverity } from './index'
import type { Entry } from './types'
import type { Campaign } from './schemas'

describe('renderMarkdown', () => {
  it('renders a heading and a paragraph', () => {
    const html = renderMarkdown('# Title\n\nSome text.')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<p>Some text.</p>')
  })
})

/* THE SAMPLE CONTENT IS RETIRED, so these check the contract that now matters:
   the loaders handle an EMPTY content set without throwing and without
   inventing an entry. That is the behaviour the site depends on today, and it
   is what these four tests could not check while three fixtures existed.

   WHY THE FIXTURES WENT (owner, 22 August). All three files in content/story/
   and the one in content/campaign/ were placeholder scaffolding, and two had
   already been ruled on: AD-17 §5.5 retired
   content/campaign/delhi-air-quality-2026.md ("liveData: mock: true", AQI 347,
   "thirteen stations") because it was a situation, not a campaign, and its
   subject is covered by situation-air.html on real data; AD-17 §3 recorded that
   content/story/delhi-air-victory.md "claims a policy victory no source
   supports", in "the same class of claim as the fabricated court citations
   D-11.1 cut from the air page". The other two were a four-sentence and a
   two-sentence stub, one asserting eleven bird species with no source.

   When real written pieces arrive, the assertions that belong here are the ones
   this file used to make — by slug, against content that is true. */
describe('content API with no content', () => {
  it('getAllStories returns an empty list rather than throwing', () => {
    expect(() => getAllStories()).not.toThrow()
    expect(getAllStories()).toEqual([])
  })

  it('getStoryBySlug returns null for any slug', () => {
    expect(getStoryBySlug('delhi-air-victory')).toBeNull()
    expect(getStoryBySlug('does-not-exist')).toBeNull()
  })

  it('getAllEntries returns an empty list rather than throwing', () => {
    expect(() => getAllEntries()).not.toThrow()
    expect(getAllEntries()).toEqual([])
  })

  it('getRelated does not throw on an entry with no relations to resolve', () => {
    const orphan = { type: 'story', slug: 'nothing', body: '', data: {} } as unknown as Entry<never>
    expect(() => getRelated(orphan)).not.toThrow()
    expect(getRelated(orphan)).toEqual([])
  })
})

describe('campaign accessors', () => {
  it('does not throw when loading campaigns', () => {
    expect(() => getAllCampaigns()).not.toThrow()
  })

  it('returns null for an unknown slug', () => {
    expect(getCampaignBySlug('not-a-real-situation')).toBeNull()
  })

  it('does not throw and only returns active-status entries', () => {
    expect(() => getActiveSituations()).not.toThrow()
    expect(getActiveSituations().every((e) => e.data.status === 'active')).toBe(true)
  })

  it('sorts active situations by severity priority', () => {
    // With only one real campaign in the repo, looping over
    // `getActiveSituations()`'s own output executes zero comparisons and
    // proves nothing (`active.length === 1`). `compareBySeverity` is the
    // exact comparator `getActiveSituations()` sorts with, so exercise it
    // directly against mock entries covering every severity out of order.
    const mockEntry = (severity: Campaign['severity'], slug: string): Entry<Campaign> => ({
      type: 'campaign',
      slug,
      body: '',
      data: { severity } as Campaign,
    })

    const entries = [
      mockEntry('water', 'water-situation'),
      mockEntry('watch', 'watch-situation'),
      mockEntry('critical', 'critical-situation'),
      mockEntry('warning', 'warning-situation'),
    ]

    const sorted = [...entries].sort(compareBySeverity)
    expect(sorted.map((e) => e.slug)).toEqual([
      'critical-situation',
      'warning-situation',
      'watch-situation',
      'water-situation',
    ])
  })
})
