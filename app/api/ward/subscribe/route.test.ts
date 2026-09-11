/**
 * route.test.ts — WHAT THIS ENDPOINT SAYS ABOUT THE READER'S OWN ADDRESS.
 *
 * The ward twin of app/api/newsletter/subscribe/route.test.ts. The defect was
 * identical and the fix is identical, because the two routes were written from
 * the same shape — one try/catch over an INSERT and a send, answering "Nothing
 * was stored." to either.
 *
 * THE TWO TABLES USED TO DIFFER IN ONE WAY AND NO LONGER DO. This table's
 * pending rows were pruned — db/001's seven-day delete, written out inline in
 * scripts/ward-alerts.mjs — while nothing at all pruned the digest table, so a
 * deletion date would have been true here and false there. Both are now swept
 * by scripts/lib/retention.mjs on the same hourly schedule, so the asymmetry is
 * gone. Neither message states a date, for the reason the case below gives.
 *
 * Not a test of subscribing. `lib/subscriptions.ts` and `lib/newsletter.ts`
 * cover the storage; what had no test at all was the WORDING, and the wording
 * is where this endpoint went wrong.
 *
 * `subscribe()` writes a pending row BEFORE the confirmation is sent. So for as
 * long as one try/catch wrapped both, a mail failure answered "Nothing was
 * stored." while the reader's address sat in the table. The success message had
 * the same defect and worse reach: every subscriber was told "nothing is stored
 * against your address" over a row that had just been written with it.
 *
 * Neither was reachable until 9 September 2026 — `rate_limit_hits` did not
 * exist in production, so every request failed closed at the limiter and never
 * got as far as the INSERT. Applying db/003 unblocked that path. These tests
 * are what stop the sentences drifting back.
 *
 * ★ THE ASSERTIONS ARE ABOUT TRUTHFULNESS, and they are written as negative
 * assertions on purpose: a positive check on today's phrasing passes for any
 * rewrite, including one that reintroduces the claim. "Must not say nothing was
 * stored when something was" is the property; the phrasing is free to change.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const subscribe = vi.fn<(email: string, station: string) => Promise<string | null>>();
const send = vi.fn<(to: string, subject: string, text: string) => Promise<void>>();
const checkRateLimit = vi.fn();

vi.mock('@/lib/subscriptions', async () => {
  const real = await vi.importActual<typeof import('@/lib/subscriptions')>('@/lib/subscriptions');
  return {
    ...real,
    config: { get db() { return true; }, get mail() { return true; }, get ready() { return true; }, missing: () => [] },
    subscribe,
    send,
  };
});
/* The ward route verifies the monitor against CPCB's live list before it
   stores anything (its own §"THE STATION MUST BE ONE CPCB ACTUALLY PUBLISHES").
   That network call is not what these tests are about, so it is stubbed to
   return a list containing the station under test. */
const STATION = 'Anand Vihar, Delhi - DPCC';
/* The route refuses to store an unverified monitor without DATA_GOV_IN_KEY and
   answers 503 before it ever reaches the INSERT — correctly, since storing a
   station CPCB does not publish would create a subscription that can never
   fire. These tests are about what the endpoint SAYS after it stores, so the
   key is present for them and the feed above is stubbed. */
process.env.DATA_GOV_IN_KEY = 'test-key-not-a-real-credential';
vi.mock('@/lib/air', () => ({
  fetchDelhiLive: async () => ({ rows: [] }),
  foldStations: () => [{ station: STATION }],
  selfCheck: () => true,
}));
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
  RATE_LIMITED_REASON: 'Too many requests from here just now.',
}));

const { POST } = await import('./route');

const post = (body: unknown) =>
  POST(new Request('https://swechha.in/api/ward/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));

/** The claim that must never appear over a row that exists. */
const CLAIMS_EMPTY = /nothing (was|is) stored/i;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  subscribe.mockResolvedValue('tok_abc');
  send.mockResolvedValue(undefined);
  checkRateLimit.mockResolvedValue({ ok: true });
});

describe('when the INSERT fails', () => {
  it('says nothing was stored, and that is true', async () => {
    subscribe.mockRejectedValue(new Error('no such table'));
    const res = await post({ email: 'reader@example.org', station: STATION });
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.ok).toBe(false);
    expect(j.reason).toMatch(CLAIMS_EMPTY);
    /* The row is the thing that would make it false, and there isn't one. */
    expect(send).not.toHaveBeenCalled();
  });
});

describe('when the row is written but the confirmation cannot be sent', () => {
  beforeEach(() => { send.mockRejectedValue(new Error('Resend HTTP 401: API key is invalid')); });

  /* ★ THE REGRESSION THIS FILE EXISTS FOR. */
  it('does NOT claim nothing was stored, because something was', async () => {
    const res = await post({ email: 'reader@example.org', station: STATION });
    expect(subscribe).toHaveBeenCalledWith('reader@example.org', STATION);
    expect((await res.json()).reason).not.toMatch(CLAIMS_EMPTY);
  });

  it('still fails, because double opt-in makes an unsent confirmation fatal', async () => {
    /* Answering ok would be the same lie pointing the other way: a subscription
       that can never begin, reported as begun. */
    const res = await post({ email: 'reader@example.org', station: STATION });
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
  });

  it('tells the reader they are not subscribed and can retry', async () => {
    const { reason } = await (await post({ email: 'reader@example.org', station: STATION })).json();
    expect(reason).toMatch(/not subscribed/i);
    expect(reason).toMatch(/again/i);
  });

  /* Both tables are pruned now (see the header), so the claim would be true of
     either. It is still not made: an error path is where a reader is trying to
     get past a problem, and the retention rule belongs somewhere they can act
     on it rather than in a failure message. */
  it('promises no deletion date, keeping the error message to what the reader must do', async () => {
    const { reason } = await (await post({ email: 'reader@example.org', station: STATION })).json();
    expect(reason).not.toMatch(/seven days|7 days|delete/i);
  });
});

describe('the success message', () => {
  /* Reach matters: every subscriber sees this one, not just the unlucky ones. */
  it('does not claim the address is unstored, because it has just been stored', async () => {
    const res = await post({ email: 'reader@example.org', station: STATION });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(subscribe).toHaveBeenCalledOnce();
    expect(j.message).not.toMatch(CLAIMS_EMPTY);
  });

  it('still gives the reassurance the sentence was reaching for', async () => {
    const { message } = await (await post({ email: 'reader@example.org', station: STATION })).json();
    /* What is actually true: the row confers nothing until confirmation. */
    expect(message).toMatch(/confirm/i);
    expect(message).toMatch(/watching nothing|unconfirmed/i);
  });

  it('is identical whether the address is new or already confirmed', async () => {
    const asNew = await (await post({ email: 'reader@example.org', station: STATION })).json();
    subscribe.mockResolvedValue(null); // already confirmed
    const asOld = await (await post({ email: 'reader@example.org', station: STATION })).json();
    expect(asOld).toEqual(asNew);
    /* And an already-confirmed address is not re-sent to — that is what makes
       the reply useless for probing who is on the list. */
    expect(send).toHaveBeenCalledOnce();
  });
});
