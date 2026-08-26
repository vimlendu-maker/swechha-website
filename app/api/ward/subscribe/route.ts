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

  try {
    const token = await subscribe(email, station);
    // token === null means it was already confirmed. Send nothing, say the same
    // thing either way, so the response cannot be used to probe the list.
    if (token) {
      const m = confirmMail(station, token);
      await send(email, m.subject, m.text);
    }
  } catch (e) {
    console.error('[ward/subscribe]', e instanceof Error ? e.message : e);
    return json({ ok: false, reason: 'Could not complete that just now. Nothing was stored.' }, 500);
  }

  return json({
    ok: true,
    state: 'pending',
    // Identical for new, pending and already-confirmed. See the note above.
    message: 'Check your email and confirm. Until you do, nothing is stored against your address '
      + 'and no alert can be sent to it.',
  });
}
