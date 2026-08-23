'use client'

import { useState } from 'react'

/**
 * The footer's digest signup.
 *
 * ★ WHY THIS IS A COMPONENT AND NOT THE `<form action>` IT REPLACES.
 * Audited in production 23 August 2026. The footer shipped
 *
 *     <form action="/api/newsletter" method="post">
 *
 * and there is no `/api/newsletter` route — the endpoint is
 * `/api/newsletter/subscribe`. So submitting navigated the reader to a 404 page
 * and dropped the address. This form is rendered by `app/layout.tsx`, which
 * means it was on `/explore`, on `/keystatic`, and on EVERY 404 PAGE — the page
 * a mistyped URL lands on. A signup box that silently discards addresses is the
 * failure `app/api/newsletter/subscribe/route.ts` opens by refusing to commit:
 * "A subscribe box that accepts an address it cannot store and cannot email is
 * the single most dishonest thing this site could ship."
 *
 * ★ A PATH FIX ALONE WOULD NOT HAVE WORKED, which is why this is a handler and
 * not a one-word edit. A native form POST sends
 * `application/x-www-form-urlencoded`; the route reads `await req.json()` and
 * answers `{"ok":false,"reason":"expected JSON"}` with a 400. Verified against
 * production. Correcting the `action` would have turned a 404 into a 400 and
 * still lost the address.
 *
 * ★ IT SAYS WHAT THE ROUTE SAYS. The route distinguishes not-configured (503),
 * a malformed address (400), rate-limited (429) and a real failure (500), and
 * each one is a different true sentence for the reader. Collapsing them into
 * "something went wrong" would throw away the one thing that makes the 503 case
 * honest: that the digest is not wired up yet, rather than that the reader
 * typed something wrong.
 *
 * The markup below is the markup that was already there. This changes what the
 * form DOES, not how it looks.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return

    /* The same shape check the built pages' handler uses, so the two forms on
       this site agree about what an address looks like before either asks the
       server. The server re-checks regardless — this is for the reader's sake,
       not the route's. */
    const value = email.trim()
    if (value.length < 6 || value.indexOf('@') < 1) {
      setMsg({ kind: 'err', text: 'That does not look like an address an email could reach.' })
      return
    }

    setBusy(true)
    setMsg({ kind: 'ok', text: 'Sending a confirmation…' })
    try {
      const r = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      })
      const body = (await r.json().catch(() => null)) as
        | { ok?: boolean; reason?: string; message?: string }
        | null

      if (r.ok && body?.ok) {
        setEmail('')
        setMsg({
          kind: 'ok',
          text: body.message
            ?? 'Check your email and confirm. Until you do, nothing is stored against your address.',
        })
      } else {
        setMsg({
          kind: 'err',
          text: body?.reason ?? 'Could not complete that just now. Nothing was stored.',
        })
      }
    } catch {
      /* Offline, or the request never left. Say so rather than implying the
         address was taken. */
      setMsg({ kind: 'err', text: 'Could not reach the site just now. Nothing was stored.' })
    } finally {
      /* ALWAYS re-enabled. A submit button left disabled after a failure is a
         dead end with no way back for the reader. */
      setBusy(false)
    }
  }

  return (
    <>
      <form className="mt-5 flex items-stretch" onSubmit={onSubmit} noValidate>
        <label className="sr-only" htmlFor="nl-email">
          Email address
        </label>
        <input
          id="nl-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={msg ? 'nl-msg' : undefined}
          aria-invalid={msg?.kind === 'err' || undefined}
          className="min-w-0 flex-1 rounded-l-[2px] border border-r-0 border-hair bg-transparent px-3.5 py-3 text-[0.875rem] text-fg placeholder:text-fg-4"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Subscribe"
          className="flex items-center rounded-r-[2px] bg-mustard px-4 text-on-mustard disabled:opacity-60"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>

      {/* `aria-live` so the answer reaches a screen reader: the reply arrives
          after the submit, with no focus change to carry it. */}
      {msg && (
        <p
          id="nl-msg"
          aria-live="polite"
          className={`mt-2 max-w-[34ch] text-[0.75rem] leading-[1.45] ${
            msg.kind === 'err' ? 'text-mustard' : 'text-fg-2'
          }`}
        >
          {msg.text}
        </p>
      )}
    </>
  )
}
