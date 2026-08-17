import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'
import { DataAttribution } from '@/components/data-attribution'
import type { Entry, Campaign } from '@/lib/content'

/**
 * The homepage's compact view into Swechha NOW. One hero situation gets the
 * full treatment; up to two more render as a single quiet line each. This
 * is intentionally not the full /now page — see app/now/page.tsx for that.
 * Renders nothing if there is currently no active situation, rather than an
 * empty or broken-looking module.
 */
export function NowModule({ situations }: { situations: Entry<Campaign>[] }) {
  if (situations.length === 0) return null
  const [hero, ...rest] = situations
  const secondary = rest.slice(0, 2)

  return (
    <section className="mt-20">
      <h2 className="text-xs uppercase tracking-widest text-ink-muted">Swechha now</h2>

      <div className="mt-6 bg-indigo p-6 text-paper md:p-9">
        <p className="font-mono text-xs uppercase tracking-widest opacity-70">{hero.data.location}</p>
        <h3 className="mt-2 max-w-[20ch] text-2xl">{hero.data.title}</h3>
        {hero.data.liveData && (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-xs uppercase tracking-widest opacity-70">
                {hero.data.liveData.label}
              </span>
              <span className="font-mono text-4xl font-bold leading-none md:text-6xl">
                {hero.data.liveData.value}{hero.data.liveData.unit}
              </span>
            </div>
            <DataAttribution
              sourceLabel={hero.data.liveData.sourceLabel}
              updatedAt={hero.data.liveData.updatedAt}
              mock={hero.data.liveData.mock}
            />
          </>
        )}
        <div className="mt-3">
          <StatusBadge status={hero.data.status} severity={hero.data.severity} onDark />
        </div>
        <div className="mt-5 flex flex-wrap gap-6">
          <Link href={`/campaigns/${hero.slug}#public-health`} className="text-sm underline underline-offset-[3px] opacity-85">
            What this means
          </Link>
          <Link href={`/campaigns/${hero.slug}`} className="text-sm underline underline-offset-[3px] opacity-85">
            What you can do
          </Link>
        </div>
      </div>

      {secondary.length > 0 && (
        <div className="mt-[1px] grid gap-[1px] bg-rule sm:grid-cols-2">
          {secondary.map((s) => (
            // `relative` here, not on the Link: wrapping location + badge +
            // summary all inside one <Link> (as this used to) made a screen
            // reader announce the whole tile as the link's accessible name.
            // Only the title is a real link now, stretched over the full
            // tile via `after:absolute after:inset-0`, matching the pattern
            // already established in components/content-card.tsx.
            <div
              key={s.slug}
              className="relative flex flex-wrap items-baseline gap-2 bg-paper p-4"
            >
              <span className="font-mono text-[0.66rem] uppercase tracking-wide text-ink-muted">
                {s.data.location}
              </span>
              <StatusBadge status={s.data.status} severity={s.data.severity} />
              <h3 className="w-full text-sm font-semibold">
                <Link href={`/campaigns/${s.slug}`} className="after:absolute after:inset-0">
                  {s.data.title}
                </Link>
              </h3>
              <span className="text-sm text-ink-muted">{s.data.summary}</span>
            </div>
          ))}
        </div>
      )}

      <Link href="/now" className="mt-6 inline-block border-b-2 border-teal pb-1 text-sm uppercase tracking-widest hover:text-teal-ink">
        All active situations
      </Link>
    </section>
  )
}
