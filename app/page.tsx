import Link from 'next/link'
import { ContentCard } from '@/components/content-card'
import { NowModule } from '@/components/now-module'
import { getAllStories, getActiveSituations } from '@/lib/content'

export default function Home() {
  const stories = getAllStories().slice(0, 3)
  const situations = getActiveSituations()

  return (
    <main className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <h1 className="max-w-[18ch]">
        Environmental action, and the people making it happen.
      </h1>
      <p className="mt-6 max-w-[55ch] font-display text-xl text-ink-muted">
        Swechha works across climate action, sustainability, education, youth
        engagement and community-led change in India.
      </p>

      <NowModule situations={situations} />

      <section className="mt-20">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">
          Latest stories
        </h2>
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
        <Link
          href="/stories"
          className="mt-10 inline-block border-b-2 border-teal pb-1 text-sm uppercase tracking-widest hover:text-teal-ink"
        >
          All stories
        </Link>
      </section>
    </main>
  )
}
