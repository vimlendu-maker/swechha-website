import { ContentError } from './load'
import { CONTENT_TYPES, type ContentType, type Entry, type Related } from './types'

export type EntryIndex = Map<ContentType, Map<string, Entry>>

function relationsOf(entry: Entry): Partial<Related> {
  const data = entry.data as { related?: Partial<Related> }
  return data.related ?? {}
}

export function buildIndex(
  entriesByType: Partial<Record<ContentType, Entry[]>>,
): EntryIndex {
  const index: EntryIndex = new Map()
  for (const type of CONTENT_TYPES) {
    const bySlug = new Map<string, Entry>()
    for (const entry of entriesByType[type] ?? []) bySlug.set(entry.slug, entry)
    index.set(type, bySlug)
  }
  return index
}

/**
 * Fails the build if any entry points at a slug that does not exist as the
 * declared type. Runs once, after every type has been loaded.
 */
export function validateRelations(entries: Entry[], index: EntryIndex): void {
  const errors: string[] = []

  for (const entry of entries) {
    const related = relationsOf(entry)
    for (const type of CONTENT_TYPES) {
      for (const slug of related[type] ?? []) {
        if (!index.get(type)?.has(slug)) {
          errors.push(
            `  - ${entry.type}/${entry.slug}.md refers to ${type}/${slug}, ` +
              `but content/${type}/${slug}.md does not exist`,
          )
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new ContentError(`Unresolved content relations:\n${errors.join('\n')}`)
  }
}

export function resolveRelated(entry: Entry, index: EntryIndex): Entry[] {
  const related = relationsOf(entry)
  const out: Entry[] = []
  for (const type of CONTENT_TYPES) {
    for (const slug of related[type] ?? []) {
      const found = index.get(type)?.get(slug)
      if (found) out.push(found)
    }
  }
  return out
}
