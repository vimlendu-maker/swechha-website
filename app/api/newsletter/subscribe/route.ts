/**
 * POST /api/newsletter/subscribe — { email } → one confirmation email.
 *
 * ★ DOUBLE OPT-IN, AND THE REPLY IS DELIBERATELY UNINFORMATIVE.
 * A successful call always answers the same way, whether the address was new,
 * already pending, or already confirmed. That is not vagueness for its own
 * sake: a subscribe endpoint that says "already subscribed" is an oracle for
 * testing whether a given address is on a list. The ward endpoint refuses to be
 * that oracle and so does this one.
 *
 * ★ NOT CONFIGURED IS ANSWERED HONESTLY, NOT SWALLOWED.
 * Without DATABASE_URL and RESEND_API_KEY this returns 503 and names what is
 * missing, and the form prints it. A subscribe box that accepts an address it
 * cannot store and cannot email is the single most dishonest thing this site
 * could ship — it is a promise to a reader with nothing behind it, on a site
 * whose whole argument is that its claims are checkable.
 *
 * ★ NO STATION, NO UPSTREAM CHECK. The ward route verifies the monitor against
 * CPCB's live list before storing, because a subscription to a monitor that
 * does not exist would silently never fire. A digest has nothing to verify: it
 * goes to everyone confirmed, so the address is the whole of the input.
 */
import { NextResponse } from 'next/server';
import { config, normaliseEmail, subscribe, send, confirmMail } from '@/lib/newsletter';
import { checkRateLimit, RATE_LIMITED_REASON } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });

export async function POST(req: Request) {
  if (!config.ready) {
    return json({
      ok: false,
      state: 'not_configured',
      missing: config.missing(),
      reason: 'The digest cannot be promised yet: the site has no '
        + config.missing().join(' and ')
        + '. Nothing was stored and no address was kept.',
    }, 503);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return json({ ok: false, reason: 'expected JSON' }, 400); }
  const { email: rawEmail } = (body ?? {}) as Record<string, unknown>;

  const email = normaliseEmail(rawEmail);
  if (!email) {
    return json({ ok: false, field: 'email',
      reason: 'That does not look like an address an email could reach.' }, 400);
  }

  /* ★ THE LIMIT GOES HERE — after the address is known, before an email can be
     sent. See lib/rate-limit.ts for what was open before it: this endpoint
     would send unlimited confirmation mail to any address named in the body. */
  const limit = await checkRateLimit('newsletter', req, email);
  if (!limit.ok) {
    return json({
      ok: false,
      state: limit.kind === 'unavailable' ? 'unavailable' : 'rate_limited',
      reason: limit.kind === 'unavailable'
        ? 'Could not complete that just now. Nothing was stored.'
        : RATE_LIMITED_REASON,
    }, limit.kind === 'unavailable' ? 503 : 429,
       { 'Retry-After': String(limit.retryAfter) });
  }

  /* ★ TWO FAILURE MODES, NOT ONE, BECAUSE THEY ARE NOT THE SAME CLAIM.
     This used to be a single try/catch around both the INSERT and the send,
     answering "Nothing was stored." to either. `subscribe()` writes a pending
     row FIRST and the send happens after it, so a mail failure returned that
     sentence while the reader's address sat in the table — a false statement to
     somebody about their own address, which is the one kind of inaccuracy this
     endpoint cannot afford.

     It was unreachable until 9 September 2026 and is not any more: before then
     `rate_limit_hits` did not exist in production, so every request failed
     closed at the limiter above and never got as far as the INSERT. Applying
     db/003 unblocked that path and made this branch live, which is how it was
     found. Split, so each answer is true of what actually happened. */
  let token: string | null;
  try {
    token = await subscribe(email);
  } catch (e) {
    console.error('[newsletter/subscribe] store', e instanceof Error ? e.message : e);
    /* Nothing reached the table, so this sentence is true. */
    return json({ ok: false, reason: 'Could not complete that just now. Nothing was stored.' }, 500);
  }

  // token === null means it was already confirmed. Send nothing, say the same
  // thing either way, so the response cannot be used to probe the list.
  if (token) {
    try {
      const m = confirmMail(token);
      await send(email, m.subject, m.text);
    } catch (e) {
      console.error('[newsletter/subscribe] send', e instanceof Error ? e.message : e);
      /* ★ THE ROW EXISTS AND THE CONFIRMATION DID NOT GO, so this says so
         rather than claiming an empty table. It names NO DELETION DATE, and
         the reason changed on 9 September 2026: when this was written, db/002's
         seven-day rule was documented and run by nothing — it told the operator
         to run it "alongside the send job" and there was no send job — so a date
         here would have been a guarantee no code kept. `scripts/lib/retention.mjs`
         now sweeps BOTH tables hourly, so the claim would be true. It is still
         not made: this is an error path a reader is trying to get past, and the
         retention rule belongs where they can act on it, not in a failure
         message. Add it here if that judgement changes — it would now be
         honest.

         It is still a 500. Double opt-in means an unsent confirmation is a
         subscription that can never begin, so answering ok would be the same
         lie in the other direction. */
      return json({
        ok: false,
        reason: 'Could not send the confirmation just now, so you are not subscribed — '
          + 'a subscription only starts when you confirm. '
          + 'Nothing can be sent to your address. Try again in a few minutes.',
      }, 500);
    }
  }

  return json({
    ok: true,
    state: 'pending',
    // Identical for new, pending and already-confirmed. See the note above.
    /* ★ "NOTHING IS STORED AGAINST YOUR ADDRESS" WAS NOT TRUE, and unlike the
       500 above, every single subscriber saw it. `subscribe()` writes a row
       carrying the address the moment this endpoint accepts it; what is true is
       that the row confers NOTHING — it is not on any list and nothing can be
       delivered to it until the address is confirmed. That is the reassurance
       the sentence was reaching for, and it is available without the falsehood.

       NO DELETION DATE IS PROMISED HERE. db/002 sets one — pending rows dropped
       after seven days — and tells the operator to run it "alongside the send
       job"; for the digest that job does not exist and nothing prunes those
       rows. Stating a guarantee no code keeps would put this line straight back
       where it started. */
    message: 'Check your email and confirm. Until you do you are not on the list, and nothing '
      + 'can be sent to your address — it is held only as an unconfirmed request.',
  });
}
