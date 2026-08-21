import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Act',
  description: 'Ways to participate in Swechha’s work.',
}

export default function ActPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>Act</h1>
      <p className="mt-6 max-w-[60ch] text-ink-muted">
        What Swechha needs most right now.
      </p>

      <div className="mt-12 flex flex-col gap-10">
        <section>
          <h2 className="text-xl">Volunteer</h2>
          <p className="mt-3 max-w-[52ch] text-ink-muted">
            Volunteer sign-up isn&rsquo;t connected yet. Check back soon, or
            follow a specific <Link href="/work/campaigns" className="underline underline-offset-[3px]">campaign</Link>{' '}
            for situation-specific ways to help.
          </p>
        </section>

        <section className="border-t border-rule pt-10">
          <h2 className="text-xl">Donate</h2>
          <p className="mt-3 max-w-[52ch] text-ink-muted">
            Donation processing isn&rsquo;t connected yet.
          </p>
        </section>

        <section className="border-t border-rule pt-10">
          <h2 className="text-xl">Newsletter</h2>
          <div className="mt-3 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              disabled
              aria-describedby="newsletter-note"
              className="flex-1 border border-rule bg-surface px-3 py-2 text-ink-muted"
            />
            <button
              disabled
              className="border border-rule px-4 py-2 text-sm uppercase tracking-widest text-ink-muted"
            >
              Notify me
            </button>
          </div>
          <p id="newsletter-note" className="mt-2 text-sm text-ink-muted">
            Not connected yet — this field is intentionally disabled rather
            than pretending to submit.
          </p>
        </section>
      </div>
    </main>
  )
}
