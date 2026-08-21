import { getAllEntries } from './content'
import type { ContentType } from './content/types'

export interface SearchDoc {
  type: ContentType
  slug: string
  title: string
  summary: string
  href: string
}

const PATHS: Record<ContentType, string> = {
  story: '/stories',
  project: '/work',
  knowledge: '/explore',
  film: '/explore',
  campaign: '/work/campaigns',
}

function titleOf(data: unknown): string {
  return (data as { title?: string }).title ?? ''
}

function summaryOf(data: unknown): string {
  return (data as { summary?: string }).summary ?? ''
}

/**
 * A pure, testable function — the search page reads this at build time and
 * ships it as data for the client component to filter. No index
 * infrastructure: content volume is small enough that shipping the whole
 * index is the honest, simplest option. Revisit if that stops being true.
 */
export function getSearchIndex(): SearchDoc[] {
  return getAllEntries().map((entry) => ({
    type: entry.type,
    slug: entry.slug,
    title: titleOf(entry.data),
    summary: summaryOf(entry.data),
    href: `${PATHS[entry.type]}/${entry.slug}`,
  }))
}
