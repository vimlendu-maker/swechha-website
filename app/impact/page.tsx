import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Impact',
  description: 'The change Swechha’s work has created.',
}

export default function ImpactPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>Impact</h1>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        Verified impact figures — years active, people reached, situations
        resolved — are being compiled and will appear here. Nothing on this
        page is a placeholder number: rather than invent statistics, this
        page states plainly that the real ones aren&rsquo;t in yet.
      </p>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        In the meantime, individual outcomes are visible on resolved{' '}
        <Link href="/work/campaigns" className="underline underline-offset-[3px]">campaign pages</Link>.
      </p>
    </main>
  )
}
