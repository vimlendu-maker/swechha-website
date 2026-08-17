import type { ZodType } from 'zod'
import { loadEntries } from './load'
import { campaignSchema, storySchema, type Campaign, type Story } from './schemas'
import { buildIndex, resolveRelated, validateRelations, type EntryIndex } from './relations'
import type { ContentType, Entry } from './types'
import { SEVERITIES, type Severity } from '../status'

export type { Entry } from './types'
export type { Story } from './schemas'
export type { Campaign } from './schemas'
export { ContentError } from './load'

interface Content {
  stories: Entry<Story>[]
  campaigns: Entry<Campaign>[]
  all: Entry[]
  index: EntryIndex
}

/**
 * Single source of truth mapping each implemented content type to its
 * schema. `buildIndex`, `all` (the relation-validation universe) and each
 * type's loaded entries are all derived from this one record below, so a
 * type can only ever be "half wired in" if it's missing from here entirely
 * — there's no second list to fall out of sync with it. Add a new type by
 * adding one line here.
 */
const TYPES = {
  story: storySchema,
  campaign: campaignSchema,
} satisfies Partial<Record<ContentType, ZodType>>

let cache: Content | null = null

/**
 * Loads and validates all content once per process. Called lazily by every
 * accessor, so a build failure surfaces on first access with a message
 * naming the offending file.
 *
 * In development the cache is bypassed on every call so editing a content
 * file under `content/**` is reflected on the next page reload — those
 * files aren't part of Next's module graph, so nothing else would ever
 * invalidate them short of a full server restart.
 */
function content(): Content {
  if (cache && process.env.NODE_ENV !== 'development') return cache

  const loaded = Object.fromEntries(
    (Object.entries(TYPES) as [ContentType, ZodType][]).map(([type, schema]) => [
      type,
      loadEntries(type, schema),
    ]),
  ) as Record<keyof typeof TYPES, Entry[]>

  const stories = loaded.story as Entry<Story>[]
  const campaigns = loaded.campaign as Entry<Campaign>[]
  const all: Entry[] = Object.values(loaded).flat()
  const index = buildIndex(loaded)

  validateRelations(all, index)

  cache = { stories, campaigns, all, index }
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

export function getAllCampaigns(): Entry<Campaign>[] {
  return content().campaigns
}

export function getCampaignBySlug(slug: string): Entry<Campaign> | null {
  return content().campaigns.find((e) => e.slug === slug) ?? null
}

export function getActiveSituations(): Entry<Campaign>[] {
  const priority: Severity[] = [...SEVERITIES]
  return content()
    .campaigns.filter((e) => e.data.status === 'active')
    .sort((a, b) => {
      const ai = priority.indexOf(a.data.severity as Severity)
      const bi = priority.indexOf(b.data.severity as Severity)
      return ai - bi
    })
}
