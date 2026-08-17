import { describe, it, expect } from 'vitest'
import { storySchema } from './schemas'

const valid = {
  title: 'How Delhi won a partial ban on construction emissions',
  summary: 'After 18 months of advocacy, a partial ban was secured.',
  author: 'Priya Sharma',
  date: '2024-08-12',
  heroImage: { src: '/images/stories/delhi-air.jpg', alt: 'Community members at an anti-pollution event' },
}

describe('storySchema', () => {
  it('accepts a valid story and applies defaults', () => {
    const parsed = storySchema.parse(valid)
    expect(parsed.title).toBe(valid.title)
    expect(parsed.tags).toEqual([])
    expect(parsed.featured).toBe(false)
    expect(parsed.related.story).toEqual([])
  })

  it('rejects a story with no title', () => {
    expect(() => storySchema.parse({ ...valid, title: '' })).toThrow()
  })

  it('rejects a hero image with no alt text', () => {
    expect(() =>
      storySchema.parse({ ...valid, heroImage: { src: '/a.jpg', alt: '' } }),
    ).toThrow()
  })

  it('rejects a malformed date', () => {
    expect(() => storySchema.parse({ ...valid, date: '12-08-2024' })).toThrow()
  })

  it('rejects an unknown key inside related (e.g. `stories` typo for `story`)', () => {
    expect(() =>
      storySchema.parse({ ...valid, related: { stories: ['ghost-slug'] } }),
    ).toThrow()
  })

  it('rejects a wrong-case key inside related (e.g. `Story` for `story`)', () => {
    expect(() =>
      storySchema.parse({ ...valid, related: { Story: ['another-ghost'] } }),
    ).toThrow()
  })

  it('rejects an unknown top-level frontmatter key (e.g. `titel` typo for `title`)', () => {
    expect(() => storySchema.parse({ ...valid, titel: 'Typo' })).toThrow()
  })

  it('rejects a briefing relation key — the type no longer exists', () => {
    expect(() =>
      storySchema.parse({ ...valid, related: { briefing: ['x'] } }),
    ).toThrow()
  })
})
