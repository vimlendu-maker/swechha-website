import { describe, it, expect } from 'vitest'
import { buildIndex, validateRelations, resolveRelated } from './relations'
import type { Entry, ContentType, Related } from './types'
import { CONTENT_TYPES } from './types'

const emptyRelated = (): Related =>
  Object.fromEntries(
    CONTENT_TYPES.map((t): [ContentType, string[]] => [t, []]),
  ) as Related

function story(slug: string, related: Partial<Related> = {}): Entry {
  return {
    type: 'story' as ContentType,
    slug,
    body: '',
    data: { title: slug, related: { ...emptyRelated(), ...related } },
  }
}

describe('relations', () => {
  it('resolves a valid relation to the real entry', () => {
    const a = story('alpha', { story: ['beta'] })
    const b = story('beta')
    const index = buildIndex({ story: [a, b] })
    expect(resolveRelated(a, index).map((e) => e.slug)).toEqual(['beta'])
  })

  it('throws naming both files when a slug does not resolve', () => {
    const a = story('alpha', { story: ['ghost'] })
    const index = buildIndex({ story: [a] })
    let message = ''
    try {
      validateRelations([a], index)
    } catch (e) {
      message = (e as Error).message
    }
    expect(message).toContain('story/alpha.md')
    expect(message).toContain('ghost')
  })

  it('throws when the related entry is of the wrong type', () => {
    const a = story('alpha', { project: ['beta'] })
    const b = story('beta')
    const index = buildIndex({ story: [a, b] })
    expect(() => validateRelations([a], index)).toThrow(/project\/beta/)
  })

  it('passes silently when every relation resolves', () => {
    const a = story('alpha', { story: ['beta'] })
    const b = story('beta')
    const index = buildIndex({ story: [a, b] })
    expect(() => validateRelations([a, b], index)).not.toThrow()
  })
})
