import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Who Swechha is.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>About Swechha</h1>
      <p className="mt-6 font-display text-xl text-ink-muted">
        Education. Environment. Enterprise.
      </p>
      <p className="mt-8 max-w-[60ch]">
        Swechha works across environmental education, direct environmental
        action, and community enterprise — connecting people to the
        environmental situations that affect them, and to concrete ways to
        respond.
      </p>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        A fuller account of Swechha&rsquo;s history, team and partners will be
        added here — this section intentionally states only what has been
        confirmed rather than filling the space with unverified detail.
      </p>
    </main>
  )
}
