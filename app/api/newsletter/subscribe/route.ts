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

  try {
    const token = await subscribe(email);
    // token === null means it was already confirmed. Send nothing, say the same
    // thing either way, so the response cannot be used to probe the list.
    if (token) {
      const m = confirmMail(token);
      await send(email, m.subject, m.text);
    }
  } catch (e) {
    console.error('[newsletter/subscribe]', e instanceof Error ? e.message : e);
    return json({ ok: false, reason: 'Could not complete that just now. Nothing was stored.' }, 500);
  }

  return json({
    ok: true,
    state: 'pending',
    // Identical for new, pending and already-confirmed. See the note above.
    message: 'Check your email and confirm. Until you do, nothing is stored against your address '
      + 'and nothing can be sent to it.',
  });
}
