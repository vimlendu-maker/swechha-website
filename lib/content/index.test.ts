import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../markdown'
import { getAllStories, getStoryBySlug, getAllEntries, getRelated } from './index'

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
  it('getAllStories returns the three sample stories', () => {
    const stories = getAllStories()
    expect(stories).toHaveLength(3)
    const slugs = stories.map((s) => s.slug).sort()
    expect(slugs).toEqual([
      'delhi-air-victory',
      'monsoon-wooding-2021',
      'rooftop-sanctuary',
    ])
  })

  it('getStoryBySlug finds a known story and returns null for an unknown one', () => {
    expect(getStoryBySlug('delhi-air-victory')?.data.title).toContain(
      "Delhi's communities",
    )
    expect(getStoryBySlug('does-not-exist')).toBeNull()
  })

  it('getAllEntries includes every story', () => {
    expect(getAllEntries()).toHaveLength(3)
  })

  it('getRelated resolves the delhi-air-victory -> rooftop-sanctuary relation', () => {
    const story = getStoryBySlug('delhi-air-victory')
    expect(story).not.toBeNull()
    const related = getRelated(story!)
    expect(related.map((e) => e.slug)).toContain('rooftop-sanctuary')
  })
})
