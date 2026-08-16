export const CONTENT_TYPES = [
  'project',
  'story',
  'knowledge',
  'film',
  'campaign',
  'briefing',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

export type Related = Record<ContentType, string[]>

export interface Entry<T = unknown> {
  type: ContentType
  slug: string
  data: T
  body: string
}
