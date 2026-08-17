import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { ZodType } from 'zod'
import type { ContentType, Entry } from './types'

export const CONTENT_DIR = join(process.cwd(), 'content')

/**
 * Thrown when a content file is malformed. The message is written for a
 * human author, not a developer: it names the file and the failing field.
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

function hasDate(value: unknown): value is { date: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { date?: unknown }).date === 'string'
  )
}

export function loadEntries<T>(
  type: ContentType,
  schema: ZodType<T>,
  baseDir: string = CONTENT_DIR,
): Entry<T>[] {
  const dir = join(baseDir, type)
  if (!existsSync(dir)) return []

  const entries = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const raw = readFileSync(join(dir, file), 'utf8')
      const { data, content } = matter(raw)

      const result = schema.safeParse(data)
      if (!result.success) {
        const details = result.error.issues
          .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('\n')
        throw new ContentError(
          `Invalid frontmatter in ${type}/${file}:\n${details}`,
        )
      }

      return { type, slug, data: result.data, body: content }
    })

  return entries.sort((a, b) => {
    if (!hasDate(a.data) || !hasDate(b.data)) return 0
    return b.data.date.localeCompare(a.data.date)
  })
}
