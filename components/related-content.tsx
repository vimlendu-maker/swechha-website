import Link from 'next/link'
import type { Entry } from '@/lib/content'

const PATHS: Record<Entry['type'], string> = {
  story: '/stories',
  project: '/work',
  knowledge: '/explore',
  film: '/films',
  campaign: '/campaigns',
  briefing: '/now',
}

export function RelatedContent({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null

  return (
    <aside className="mt-16 border-t border-rule pt-8">
      <h2 className="text-xs uppercase tracking-widest text-ink-muted">Related</h2>
      <ul className="mt-4 space-y-3">
        {entries.map((entry) => {
          const title = (entry.data as { title?: string }).title ?? entry.slug
          return (
            <li key={`${entry.type}/${entry.slug}`}>
              <Link
                href={`${PATHS[entry.type]}/${entry.slug}`}
                className="font-display text-xl hover:text-teal-ink"
              >
                {title}
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
