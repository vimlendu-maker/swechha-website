import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { DataAttribution } from '@/components/data-attribution'
import { LifecycleTimeline } from '@/components/lifecycle-timeline'
import { ActionList } from '@/components/action-list'
import { EvidenceList } from '@/components/evidence-list'
import { RelatedContent } from '@/components/related-content'
import { getAllCampaigns, getCampaignBySlug, getRelated } from '@/lib/content'
import { shareCard } from '@/lib/social'

export function generateStaticParams() {
  return getAllCampaigns().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(
  props: PageProps<'/work/campaigns/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const campaign = getCampaignBySlug(slug)
  if (!campaign) return {}
  /* The campaign's own hero, and the whole openGraph object — the identical
     shallow-merge trap this route was in. See lib/social.ts. */
  const card = shareCard(campaign.data.heroImage)
  return {
    title: campaign.data.title,
    description: campaign.data.summary,
    ...card,
    openGraph: {
      ...card.openGraph,
      title: campaign.data.title,
      description: campaign.data.summary,
    },
  }
}

export default async function CampaignPage(props: PageProps<'/work/campaigns/[slug]'>) {
  const { slug } = await props.params
  const campaign = getCampaignBySlug(slug)
  if (!campaign) notFound()

  const { data } = campaign
  const urgent = data.status === 'active' && data.severity === 'critical'

  return (
    <main>
      <header className="bg-ground py-14 text-paper md:py-20">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-widest opacity-70">{data.location}</p>
          <h1 className="mt-3 max-w-[16ch]">{data.title}</h1>
          <div className="mt-4">
            <StatusBadge status={data.status} severity={data.severity} onDark />
          </div>
          {data.liveData && (
            <>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-xs uppercase tracking-widest opacity-70">
                  {data.liveData.label}
                </span>
                <span className="font-mono text-5xl font-bold leading-none md:text-6xl">
                  {data.liveData.value}
                  {data.liveData.unit}
                </span>
              </div>
              <DataAttribution
                sourceLabel={data.liveData.sourceLabel}
                updatedAt={data.liveData.updatedAt}
                mock={data.liveData.mock}
              />
            </>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-rule">
          <Image src={data.heroImage.src} alt={data.heroImage.alt} fill sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" priority />
        </div>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>What we know</h2>
          <p className="mt-4 max-w-[64ch]">{data.whatWeKnow}</p>
        </section>

        <section id="public-health" className="mt-12 border-t border-rule pt-10">
          <h2>Public health impact</h2>
          <p className="mt-4 max-w-[64ch]">{data.publicHealthImpact}</p>
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>Why it matters</h2>
          <p className="mt-4 max-w-[64ch]">{data.whyItMatters}</p>
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>What Swechha is doing</h2>
          <p className="mt-4 max-w-[64ch]">{data.whatSwechhaIsDoing}</p>
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>What you can do</h2>
          <ActionList actions={data.actions} urgent={urgent} />
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>Evidence &amp; sources</h2>
          <EvidenceList evidence={data.evidence} />
        </section>

        <section className="mt-12 border-t border-rule pt-10">
          <h2>How this situation has evolved</h2>
          <div className="mt-6">
            <LifecycleTimeline entries={data.timeline} />
          </div>
        </section>

        <RelatedContent entries={getRelated(campaign)} />
      </div>
    </main>
  )
}
