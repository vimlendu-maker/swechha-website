import type { Metadata } from 'next'
import { ContentCard } from '@/components/content-card'
import { StatusBadge } from '@/components/status-badge'
import { getAllCampaigns } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Campaigns',
  description: 'Environmental situations Swechha is monitoring, campaigning on, or has resolved.',
}

export default function CampaignsPage() {
  const campaigns = getAllCampaigns()

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1>Campaigns</h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Every significant environmental situation Swechha tracks — what&rsquo;s
        active, what&rsquo;s being monitored, and what&rsquo;s been resolved.
      </p>

      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <div key={c.slug}>
            <ContentCard
              href={`/campaigns/${c.slug}`}
              title={c.data.title}
              summary={c.data.summary}
              image={c.data.heroImage}
              headingLevel={2}
              meta={c.data.location}
            />
            <div className="mt-2">
              <StatusBadge status={c.data.status} severity={c.data.severity} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
