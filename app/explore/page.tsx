import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { getAllStories } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Stories, knowledge and films from Swechha.',
}

export default function ExplorePage() {
  const stories = getAllStories()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Explore</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Stories, explainers, guides and films — understand what&rsquo;s happening
        and why it matters.
      </p>

      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Stories</h2>
        <div className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <ContentCard
              key={story.slug}
              href={`/stories/${story.slug}`}
              title={story.data.title}
              summary={story.data.summary}
              image={story.data.heroImage}
            />
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Knowledge &amp; DIY</h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          Explainers and DIY guides are being written — nothing published yet.
        </p>
      </section>

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Films</h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          No films published yet.
        </p>
      </section>
    </main>
  )
}
