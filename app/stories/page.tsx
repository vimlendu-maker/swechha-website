import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { getAllStories } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Stories',
  description: 'Impact narratives and testimonies from Swechha’s work.',
}

export default function StoriesPage() {
  const stories = getAllStories()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Stories</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Narratives of change from the field — what happened, who made it
        happen, and what it changed.
      </p>

      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <ContentCard
            key={story.slug}
            href={`/stories/${story.slug}`}
            title={story.data.title}
            summary={story.data.summary}
            image={story.data.heroImage}
            meta={new Date(story.data.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
            })}
          />
        ))}
      </div>
    </main>
  )
}
