import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { StatusBadge } from '@/components/status-badge'
import { getAllCampaigns } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Work',
  description: 'What Swechha is working on — active situations and programmes.',
}

export default function WorkPage() {
  const campaigns = getAllCampaigns()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Work</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Situations Swechha is actively responding to, and the programmes behind them.
      </p>

      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Situations</h2>
        <div className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div key={c.slug}>
              <ContentCard
                href={`/work/campaigns/${c.slug}`}
                title={c.data.title}
                summary={c.data.summary}
                image={c.data.heroImage}
                meta={c.data.location}
              />
              <div className="mt-2">
                <StatusBadge status={c.data.status} severity={c.data.severity} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-rule pt-10">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">Projects</h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          Project profiles are being written — nothing published yet.
        </p>
      </section>
    </main>
  )
}
