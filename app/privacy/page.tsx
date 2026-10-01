import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What this site collects, why, and how to ask us to remove it.',
}

const CONTACT = 'swechhaindia@gmail.com'

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>Privacy</h1>
      <p className="mt-4 text-ink-muted">Last updated 1 October 2026.</p>

      <p className="mt-8">
        Swechha is a not-for-profit. This site collects as little as it can. Here is all of it.
      </p>

      <h2 className="mt-10 text-xl">Visits</h2>
      <p className="mt-3">
        We count visits with Umami, a privacy-focused analytics tool that we run ourselves. It
        records which pages are read, roughly where from, and what browser was used. It sets no
        tracking cookies, does not follow you across other sites, and is not shared with
        advertisers.
      </p>

      <h2 className="mt-10 text-xl">Email</h2>
      <p className="mt-3">
        If you subscribe to our digest or an air-quality alert, we store your email address (and
        the monitor you chose, for alerts) to send exactly that. We ask you to confirm first. Every
        message has an unsubscribe link, and we do not sell or rent addresses.
      </p>

      <h2 className="mt-10 text-xl">If you write to us</h2>
      <p className="mt-3">
        Emails you send us are used to reply to you and kept as long as the conversation needs.
      </p>

      <h2 className="mt-10 text-xl">Who handles the data</h2>
      <p className="mt-3">
        The site is hosted on Vercel and its database on Neon. Email is sent through Resend. They
        process data for us, only to run the service.
      </p>

      <h2 className="mt-10 text-xl">Your choices</h2>
      <p className="mt-3">
        You can ask us what we hold about you, or have it corrected or deleted, by writing to{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </main>
  )
}
