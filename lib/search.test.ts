import { describe, it, expect } from 'vitest'
import { getSearchIndex } from './search'

describe('getSearchIndex', () => {
  it('includes every loaded entry with a title and a resolvable href', () => {
    const index = getSearchIndex()
    expect(index.length).toBeGreaterThan(0)
    for (const doc of index) {
      expect(doc.title.length).toBeGreaterThan(0)
      expect(doc.href.startsWith('/')).toBe(true)
    }
  })

  it('routes stories to /stories and campaigns to /campaigns', () => {
    const index = getSearchIndex()
    const story = index.find((d) => d.type === 'story')
    const campaign = index.find((d) => d.type === 'campaign')
    expect(story).toBeDefined()
    expect(story!.href).toBe(`/stories/${story!.slug}`)
    expect(campaign).toBeDefined()
    expect(campaign!.href).toBe(`/campaigns/${campaign!.slug}`)
  })
})
