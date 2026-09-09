/**
 * POST /api/ward/subscribe — { email, station } → one confirmation email.
 *
 * ★ DOUBLE OPT-IN, AND THE REPLY IS DELIBERATELY UNINFORMATIVE.
 * A successful call always answers the same way, whether the address was new,
 * already pending, or already confirmed. That is not vagueness for its own
 * sake: a subscribe endpoint that says "already subscribed" is an oracle for
 * testing whether a given address is on a list, and this list is a list of
 * people who worry about their air. There is nothing here worth leaking.
 *
 * ★ NOT CONFIGURED IS ANSWERED HONESTLY, NOT SWALLOWED.
 * Without DATABASE_URL and RESEND_API_KEY this returns 503 and names what is
 * missing. The form then tells the reader the truth — that the alert cannot be
 * promised yet — instead of accepting an address into a void. Accepting an
 * address it cannot store or email would be the one genuinely dishonest thing
 * this page could do, and it is exactly what a "coming soon" form does.
 */
import { NextResponse } from 'next/server';
import { fetchDelhiLive, foldStations, selfCheck } from '@/lib/air';
import { config, normaliseEmail, subscribe, send, confirmMail } from '@/lib/subscriptions';
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
      reason: 'This alert cannot be promised yet: the site has no '
        + config.missing().join(' and ')
        + '. Nothing was stored and no address was kept.',
    }, 503);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return json({ ok: false, reason: 'expected JSON' }, 400); }
  const { email: rawEmail, station: rawStation } = (body ?? {}) as Record<string, unknown>;

  const email = normaliseEmail(rawEmail);
  if (!email) return json({ ok: false, field: 'email', reason: 'That does not look like an address an email could reach.' }, 400);

  /* ★ THE LIMIT GOES HERE — after the address is known, before anything is
     spent on the request. Below this line the route calls CPCB and then Resend,
     so a flood placed any later would still cost an upstream fetch and an email
     each. See lib/rate-limit.ts. */
  const limit = await checkRateLimit('ward', req, email);
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

  const station = String(rawStation ?? '').trim();
  if (!station || station.length > 120) {
    return json({ ok: false, field: 'station', reason: 'Pick a monitor.' }, 400);
  }

  /* ★ THE STATION MUST BE ONE CPCB ACTUALLY PUBLISHES.
     Without this check the endpoint would happily store 'Buckingham Palace',
     and the alert job would then look for a monitor that does not exist and
     silently never fire — a subscription that appears to work and cannot. The
     allowed set is not a hardcoded list; it is whatever the feed says today. */
  if (!selfCheck()) return json({ ok: false, reason: 'index self-check failed' }, 500);
  const key = process.env.DATA_GOV_IN_KEY;
  if (!key) return json({ ok: false, state: 'not_configured', missing: ['DATA_GOV_IN_KEY'], reason: 'Cannot verify the monitor exists.' }, 503);

  let known: Set<string>;
  try {
    /* CAAQMS first, mirror fallback (AD-44 addendum) — the station-name
       universe should come from the freshest copy of the same feed the
       alert job reads, so a monitor CPCB added this morning is
       subscribable this morning. Same rows shape; nothing else changed. */
    known = new Set(foldStations((await fetchDelhiLive(key)).rows).map((s) => s.station));
  } catch (e) {
    // Upstream down. Do NOT store an unverified station; ask them to retry.
    return json({ ok: false, state: 'upstream_down',
      reason: 'The monitor list could not be checked just now, so nothing was stored. Try again shortly.',
      detail: e instanceof Error ? e.message : 'fetch failed' }, 502);
  }
  if (!known.has(station)) {
    return json({ ok: false, field: 'station', reason: 'CPCB is not publishing a monitor by that name.' }, 400);
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
    token = await subscribe(email, station);
  } catch (e) {
    console.error('[ward/subscribe] store', e instanceof Error ? e.message : e);
    /* Nothing reached the table, so this sentence is true. */
    return json({ ok: false, reason: 'Could not complete that just now. Nothing was stored.' }, 500);
  }

  // token === null means it was already confirmed. Send nothing, say the same
  // thing either way, so the response cannot be used to probe the list.
  if (token) {
    try {
      const m = confirmMail(station, token);
      await send(email, m.subject, m.text);
    } catch (e) {
      console.error('[ward/subscribe] send', e instanceof Error ? e.message : e);
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
          + 'No alert can be sent to your address. Try again in a few minutes.',
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
    message: 'Check your email and confirm. Until you do you are watching nothing, and no alert '
      + 'can be sent to your address — it is held only as an unconfirmed request.',
  });
}
