import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentCard } from '@/components/content-card'
import { StatusBadge } from '@/components/status-badge'
import { DataAttribution } from '@/components/data-attribution'
import { getActiveSituations, getAllStories } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Now',
  description: 'The environmental situations Swechha is tracking right now, and the latest stories.',
}

export default function NowPage() {
  const situations = getActiveSituations()
  const stories = getAllStories().slice(0, 3)

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Now</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        What&rsquo;s active, and what Swechha is doing about it.
      </p>

      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Current situations</h2>
        {situations.length === 0 ? (
          <p className="mt-6 max-w-[52ch] text-ink-muted">
            Nothing is currently active. Resolved and monitored situations are on the{' '}
            <Link href="/work/campaigns" className="underline underline-offset-[3px]">Campaigns</Link> page.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-[1px] bg-rule">
            {situations.map((s) => (
              // `relative` here, not on the Link: wrapping the whole card's
              // text in one <Link> (as this used to) made a screen reader
              // announce the entire card — including the live-data
              // timestamp and DEMO DATA tag — as the link's accessible
              // name. Only the title is a real link now, stretched over the
              // full card via `after:absolute after:inset-0`, matching the
              // pattern already established in components/content-card.tsx.
              <div key={s.slug} className="relative bg-ground p-6 text-paper md:p-8">
                <p className="font-mono text-xs uppercase tracking-widest opacity-70">{s.data.location}</p>
                {s.data.liveData && (
                  <>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-xs uppercase tracking-widest opacity-70">
                        {s.data.liveData.label}
                      </span>
                      <span className="font-mono text-3xl font-bold md:text-5xl">
                        {s.data.liveData.value}{s.data.liveData.unit}
                      </span>
                    </div>
                    <DataAttribution sourceLabel={s.data.liveData.sourceLabel} updatedAt={s.data.liveData.updatedAt} mock={s.data.liveData.mock} />
                  </>
                )}
                <div className="mt-3">
                  <StatusBadge status={s.data.status} severity={s.data.severity} onDark />
                </div>
                <h3 className="mt-3 max-w-[24ch] text-2xl">
                  <Link href={`/work/campaigns/${s.slug}`} className="after:absolute after:inset-0">
                    {s.data.title}
                  </Link>
                </h3>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Latest stories</h2>
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
    </main>
  )
}
