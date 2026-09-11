/**
 * route.test.ts — WHAT THIS ENDPOINT SAYS ABOUT THE READER'S OWN ADDRESS.
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

const subscribe = vi.fn<(email: string) => Promise<string | null>>();
const send = vi.fn<(to: string, subject: string, text: string) => Promise<void>>();
const checkRateLimit = vi.fn();

vi.mock('@/lib/newsletter', async () => {
  const real = await vi.importActual<typeof import('@/lib/newsletter')>('@/lib/newsletter');
  return {
    ...real,
    config: { get db() { return true; }, get mail() { return true; }, get ready() { return true; }, missing: () => [] },
    subscribe,
    send,
  };
});
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
  RATE_LIMITED_REASON: 'Too many requests from here just now.',
}));

const { POST } = await import('./route');

const post = (body: unknown) =>
  POST(new Request('https://swechha.in/api/newsletter/subscribe', {
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
    const res = await post({ email: 'reader@example.org' });
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
    const res = await post({ email: 'reader@example.org' });
    expect(subscribe).toHaveBeenCalledWith('reader@example.org');
    expect((await res.json()).reason).not.toMatch(CLAIMS_EMPTY);
  });

  it('still fails, because double opt-in makes an unsent confirmation fatal', async () => {
    /* Answering ok would be the same lie pointing the other way: a subscription
       that can never begin, reported as begun. */
    const res = await post({ email: 'reader@example.org' });
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
  });

  it('tells the reader they are not subscribed and can retry', async () => {
    const { reason } = await (await post({ email: 'reader@example.org' })).json();
    expect(reason).toMatch(/not subscribed/i);
    expect(reason).toMatch(/again/i);
  });

  /* WHY THIS ASSERTION SURVIVED ITS OWN REASON. When it was written, db/002's
     seven-day rule was run by nothing, so a date here would have been a
     guarantee no code kept — the exact defect this file is about, one level up.
     `scripts/lib/retention.mjs` closed that gap and the claim would now be
     true. The assertion stays because the DECISION stands on other ground: an
     error path is where a reader is trying to get past a problem, and the
     retention rule belongs somewhere they can act on it. If that judgement
     changes, change this test with the copy — it is no longer load-bearing for
     honesty. */
  it('promises no deletion date, keeping the error message to what the reader must do', async () => {
    const { reason } = await (await post({ email: 'reader@example.org' })).json();
    expect(reason).not.toMatch(/seven days|7 days|delete/i);
  });
});

describe('the success message', () => {
  /* Reach matters: every subscriber sees this one, not just the unlucky ones. */
  it('does not claim the address is unstored, because it has just been stored', async () => {
    const res = await post({ email: 'reader@example.org' });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(subscribe).toHaveBeenCalledOnce();
    expect(j.message).not.toMatch(CLAIMS_EMPTY);
  });

  it('still gives the reassurance the sentence was reaching for', async () => {
    const { message } = await (await post({ email: 'reader@example.org' })).json();
    /* What is actually true: the row confers nothing until confirmation. */
    expect(message).toMatch(/confirm/i);
    expect(message).toMatch(/not on the list|unconfirmed/i);
  });

  it('is identical whether the address is new or already confirmed', async () => {
    const asNew = await (await post({ email: 'reader@example.org' })).json();
    subscribe.mockResolvedValue(null); // already confirmed
    const asOld = await (await post({ email: 'reader@example.org' })).json();
    expect(asOld).toEqual(asNew);
    /* And an already-confirmed address is not re-sent to — that is what makes
       the reply useless for probing who is on the list. */
    expect(send).toHaveBeenCalledOnce();
  });
});
