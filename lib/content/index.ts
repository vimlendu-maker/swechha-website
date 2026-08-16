import { loadEntries } from './load'
import { storySchema, type Story } from './schemas'
import { buildIndex, resolveRelated, validateRelations, type EntryIndex } from './relations'
import type { Entry } from './types'

export type { Entry } from './types'
export type { Story } from './schemas'
export { ContentError } from './load'

interface Content {
  stories: Entry<Story>[]
  all: Entry[]
  index: EntryIndex
}

let cache: Content | null = null

/**
 * Loads and validates all content once per process. Called lazily by every
 * accessor, so a build failure surfaces on first access with a message
 * naming the offending file.
 */
function content(): Content {
  if (cache) return cache

  const stories = loadEntries('story', storySchema)
  const all: Entry[] = [...stories]
  const index = buildIndex({ story: stories })

  validateRelations(all, index)

  cache = { stories, all, index }
  return cache
}

export function getAllStories(): Entry<Story>[] {
  return content().stories
}

export function getStoryBySlug(slug: string): Entry<Story> | null {
  return content().stories.find((e) => e.slug === slug) ?? null
}

export function getAllEntries(): Entry[] {
  return content().all
}

export function getRelated(entry: Entry): Entry[] {
  return resolveRelated(entry, content().index)
}
