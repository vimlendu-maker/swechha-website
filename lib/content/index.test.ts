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

// Task 10 adds real content under content/story/, so these are the
// "loads real entries" and "relations resolve" checks the comment above
// used to say were deliberately missing.
describe('content API against real STORY content', () => {
  it('getAllStories returns at least the known sample stories', () => {
    const stories = getAllStories()
    expect(stories.length).toBeGreaterThanOrEqual(3)
    const slugs = stories.map((s) => s.slug)
    expect(slugs).toContain('delhi-air-victory')
    expect(slugs).toContain('monsoon-wooding-2021')
    expect(slugs).toContain('rooftop-sanctuary')
  })

  it('getStoryBySlug finds a known story and returns null for an unknown one', () => {
    expect(getStoryBySlug('delhi-air-victory')?.data.title).toContain(
      "Delhi's communities",
    )
    expect(getStoryBySlug('does-not-exist')).toBeNull()
  })

  it('getAllEntries includes at least every known story', () => {
    expect(getAllEntries().length).toBeGreaterThanOrEqual(3)
  })

  it('getRelated resolves the delhi-air-victory -> rooftop-sanctuary relation', () => {
    const story = getStoryBySlug('delhi-air-victory')
    expect(story).not.toBeNull()
    const related = getRelated(story!)
    expect(related.map((e) => e.slug)).toContain('rooftop-sanctuary')
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
