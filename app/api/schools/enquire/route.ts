/**
 * POST /api/schools/enquire — one school enquiry → one row and one email to us.
 *
 * ★ THIS IS THE ONE ENDPOINT ON THIS SITE THAT SENDS MAIL TO US AND NOT TO THE
 * SUBMITTER, and that inverts every assumption the other two were built on.
 * `/api/newsletter/subscribe` and `/api/ward/subscribe` are double opt-in
 * because they send mail to an address named in the body, and an attacker can
 * name a victim's. Here the recipient is fixed — `ENQUIRY_TO` — so there is
 * nobody to bomb but ourselves, and a confirmation round-trip would buy the
 * enquirer nothing and cost a school a step. Consequently:
 *
 *   NO DOUBLE OPT-IN, NO TOKEN, NO CONFIRM LINK, NO UNSUBSCRIBE. There is
 *   nothing to opt in to: nothing is ever sent to the enquirer by machine.
 *
 * ★ THE REPLY IS SPECIFIC, NOT AN ORACLE, and this is the second inversion.
 * The subscribe endpoints answer identically for a new, pending and confirmed
 * address on purpose, because a distinguishing answer would let anybody test
 * whether a given address is on a list. There is no list here and no membership
 * to probe, so a field-level error is safe — and it is what a coordinator
 * filling in eleven boxes actually needs. Vagueness here would be cargo-culted
 * privacy at the direct expense of the person using the form.
 *
 * ★ THE RATE LIMIT STILL APPLIES, for the reason it always did and one more.
 * The caller check bounds how much anybody can write into our table from one
 * source; the recipient check is keyed on the ENQUIRER's address, so one
 * address cannot be used to file a hundred enquiries — the bucket is
 * `schools:*`, distinct from `newsletter:*` and `ward:*`, so filing an enquiry
 * cannot spend somebody's digest allowance.
 *
 * ★ THE HONEYPOT IS NOT SECURITY AND IS NOT TREATED AS SUCH. A bot that fills
 * every input fills `website` too, which no human sees. That request is
 * answered 200 with the ordinary success body and NOTHING IS STORED — because
 * telling a bot it was detected is how the next version of it stops filling the
 * field. It is a cheap filter in front of a real limiter, never instead of one.
 *
 * ★ STORAGE FAILING IS AN ERROR; MAIL FAILING IS NOT. The row is the enquiry.
 * Once it is committed the school has asked, and the coordinator is told so —
 * a Resend outage is not their problem and re-typing eleven boxes is not their
 * remedy. `notified_at` stays NULL and `db/004`'s `school_enquiries_undelivered`
 * index is the sweep. Answering 500 after a successful INSERT would produce the
 * worst outcome available: a stored enquiry the sender believes was lost, sent
 * again, and answered twice.
 */
import { NextResponse } from 'next/server';
import {
  config, parse, store, markNotified, notification, send,
} from '@/lib/school-enquiry';
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
      reason: 'The form cannot be answered yet: the site has no '
        + config.missing().join(' and ')
        + '. Nothing was stored. Use the email Ask below instead — it reaches the same person.',
    }, 503);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return json({ ok: false, reason: 'expected JSON' }, 400); }

  /* The honeypot, read before anything else is validated so a bot spends no
     database time at all. See the header for why this answers 200. */
  const { website } = (body ?? {}) as Record<string, unknown>;
  if (String(website ?? '').trim() !== '') {
    return json({ ok: true, state: 'received' });
  }

  const parsed = parse(body);
  if (!parsed.ok) {
    return json({ ok: false, field: parsed.field, reason: parsed.reason }, 400);
  }
  const enquiry = parsed.value;

  /* AFTER the enquiry is known — so the recipient bucket can be keyed on a real
     address — and BEFORE anything is written or sent. Same placement, and the
     same reasoning, as /api/newsletter/subscribe. */
  const limit = await checkRateLimit('schools', req, enquiry.email);
  if (!limit.ok) {
    return json({
      ok: false,
      state: limit.kind === 'unavailable' ? 'unavailable' : 'rate_limited',
      reason: limit.kind === 'unavailable'
        ? 'Could not complete that just now. Nothing was stored — try the email Ask below.'
        : RATE_LIMITED_REASON,
    }, limit.kind === 'unavailable' ? 503 : 429,
       { 'Retry-After': String(limit.retryAfter) });
  }

  let id: number;
  try {
    id = await store(enquiry);
  } catch (e) {
    console.error('[schools/enquire] store', e instanceof Error ? e.message : e);
    return json({
      ok: false,
      reason: 'Could not store that just now. Nothing was kept — use the email Ask below and it reaches the same person.',
    }, 500);
  }

  /* From here the enquiry EXISTS. Every path below answers ok:true. */
  if (config.mail) {
    try {
      await send(notification(enquiry, id));
      await markNotified(id);
    } catch (e) {
      /* Logged loudly and named, because this is the failure that loses a
         school quietly: the row is in the table and nobody has been told. */
      console.error(
        `[schools/enquire] enquiry #${id} is STORED BUT NOT NOTIFIED —`,
        e instanceof Error ? e.message : e,
      );
    }
  } else {
    console.warn(
      `[schools/enquire] enquiry #${id} stored with no RESEND_API_KEY set, so nobody was emailed. `
      + 'It is in school_enquiries with notified_at NULL.',
    );
  }

  return json({ ok: true, state: 'received' });
}
