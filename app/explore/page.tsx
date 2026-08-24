import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { getAllStories } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Stories, knowledge and films from Swechha.',
  /* Audited 23 August 2026: this page carried no canonical and no structured
     data, while all 40 built pages carry both. Resolved against the layout's
     `metadataBase` AT REQUEST TIME, which is the whole reason it is safe to
     state here — `scripts/lib/situation-shell.mjs` explains at length why the
     BUILT pages keep a relative canonical instead, and that reasoning holds:
     an absolute value baked in at build time advertises the preview host on
     every preview deploy. This one is not baked. */
  alternates: { canonical: '/explore' },
  /* Task 9: this page renders an empty content grid (no stories are published
     under `content/` yet — see `lib/content.ts`), has zero inbound internal
     links from any of the 35 built pages, and self-canonicalises above. That
     is a thin page inviting indexation, not a page ready to compete for
     search placement. `follow` is left at its default (true) since nothing on
     the page needs blocking from crawl, only from the index. Reversible: drop
     this the day real content lands here. */
  robots: { index: false, follow: true },
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
