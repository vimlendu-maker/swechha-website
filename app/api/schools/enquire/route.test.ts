/**
 * route.test.ts — the ORDER of the checks in POST /api/schools/enquire.
 *
 * WHY THIS EXISTS SEPARATELY FROM lib/school-enquiry.test.ts. That file proves
 * `parse()` is right. What it cannot prove is the thing this route can get
 * wrong without any single function being wrong: the SEQUENCE. Four orderings
 * matter and every one of them is a real defect if reversed —
 *
 *   1. the honeypot before the database, or a bot spends our Neon quota;
 *   2. validation before the rate limit, or a malformed body burns a real
 *      coordinator's allowance for the next fifteen minutes;
 *   3. the rate limit before the INSERT, or the limit does not limit anything;
 *   4. ★ ok:true once the row is committed, EVEN IF THE EMAIL FAILS. This is
 *      the one that costs a school: a 500 after a successful INSERT tells the
 *      sender their enquiry was lost, so they send it again, and it is answered
 *      twice from two rows — or worse, they give up on a form that did work.
 *
 * The three collaborators are mocked because none of them is under test here:
 * `store` is Neon over HTTP, `send` is Resend, `checkRateLimit` is a Postgres
 * ledger with its own database test. What is under test is which of them gets
 * called, with what, and in what order.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = vi.fn<(e: unknown) => Promise<number>>();
const send = vi.fn<(m: unknown) => Promise<void>>();
const markNotified = vi.fn<(id: number) => Promise<void>>();
const checkRateLimit = vi.fn();
let dbReady = true;
let mailReady = true;

vi.mock('@/lib/school-enquiry', async () => {
  /* parse(), notification() and PROGRAMME_KEYS are the REAL ones — the point is
     to run the route against the validation it actually ships with. Only the
     three I/O functions and `config` are replaced. */
  const real = await vi.importActual<typeof import('@/lib/school-enquiry')>('@/lib/school-enquiry');
  return {
    ...real,
    config: {
      get db() { return dbReady; },
      get mail() { return mailReady; },
      get ready() { return dbReady; },
      missing: () => (dbReady ? [] : ['DATABASE_URL']),
    },
    store, send, markNotified,
  };
});

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
  RATE_LIMITED_REASON: 'Too many requests from here just now.',
}));

const { POST } = await import('./route');

const post = (body: unknown) =>
  POST(new Request('https://swechha.in/api/schools/enquire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));

const good = {
  school: 'Vasant Valley School',
  contact_name: 'A Coordinator',
  email: 'coordinator@example.org',
  programme: 'journeys/cityscapes',
};

beforeEach(() => {
  vi.clearAllMocks();
  dbReady = true; mailReady = true;
  store.mockResolvedValue(42);
  send.mockResolvedValue(undefined);
  markNotified.mockResolvedValue(undefined);
  checkRateLimit.mockResolvedValue({ ok: true });
});

describe('the happy path', () => {
  it('stores, emails, stamps and answers ok', async () => {
    const res = await post(good);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, state: 'received' });
    expect(store).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledOnce();
    expect(markNotified).toHaveBeenCalledWith(42);
  });

  it('never caches the answer', async () => {
    expect((await post(good)).headers.get('Cache-Control')).toBe('no-store');
  });

  it('sends the notification to us and points its reply at the school', async () => {
    await post(good);
    const m = send.mock.calls[0][0] as { to: string; replyTo: string };
    expect(m.replyTo).toBe('coordinator@example.org');
    expect(m.to).not.toBe('coordinator@example.org');
  });
});

describe('not configured', () => {
  it('names what is missing and stores nothing', async () => {
    dbReady = false;
    const res = await post(good);
    expect(res.status).toBe(503);
    const j = await res.json();
    expect(j.state).toBe('not_configured');
    expect(j.missing).toEqual(['DATABASE_URL']);
    /* THE CLAUSE THAT MATTERS. A school-facing form must not thank anybody for
       an enquiry that reached nothing, and must say where to go instead. */
    expect(j.reason).toContain('Nothing was stored');
    expect(j.reason).toContain('email Ask');
    expect(store).not.toHaveBeenCalled();
  });
});

describe('the honeypot', () => {
  it('answers exactly like a success and stores nothing', async () => {
    const res = await post({ ...good, website: 'http://spam.example' });
    expect(res.status).toBe(200);
    /* Byte-identical to the real success body — see the route header: telling a
       bot it was caught is how the next version stops filling the field. */
    expect(await res.json()).toEqual({ ok: true, state: 'received' });
    expect(store).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('runs before the rate limiter, so a bot spends no database time', async () => {
    await post({ ...good, website: 'x' });
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it('ignores an empty honeypot, which is what a human sends', async () => {
    await post({ ...good, website: '' });
    expect(store).toHaveBeenCalledOnce();
  });
});

describe('validation', () => {
  it('answers 400 with the field and the reason', async () => {
    const res = await post({ ...good, email: 'nope' });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.field).toBe('email');
    expect(j.reason).toBeTruthy();
    expect(store).not.toHaveBeenCalled();
  });

  it('runs before the rate limit, so a bad body cannot burn a real allowance', async () => {
    await post({ ...good, programme: 'journeys/not-a-thing' });
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it('answers 400 on a body that is not JSON at all', async () => {
    expect((await post('not json')).status).toBe(400);
  });
});

describe('the rate limit', () => {
  it('is keyed on the enquirer and bucketed apart from the other endpoints', async () => {
    await post(good);
    expect(checkRateLimit.mock.calls[0][0]).toBe('schools');
    expect(checkRateLimit.mock.calls[0][2]).toBe('coordinator@example.org');
  });

  it('refuses with 429 and Retry-After, before anything is stored', async () => {
    checkRateLimit.mockResolvedValue({ ok: false, kind: 'caller', retryAfter: 900 });
    const res = await post(good);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('900');
    expect(store).not.toHaveBeenCalled();
  });

  it('answers 503 when the limiter itself cannot be read — it fails closed', async () => {
    checkRateLimit.mockResolvedValue({ ok: false, kind: 'unavailable', retryAfter: 60 });
    const res = await post(good);
    expect(res.status).toBe(503);
    expect(store).not.toHaveBeenCalled();
  });
});

describe('when the row is committed but the mail is not', () => {
  /* ★ THE FOUR CASES BELOW ARE THE POINT OF THIS FILE. Once the INSERT
     succeeds, the school HAS asked, and every answer is ok:true. */
  it('still answers ok when Resend throws', async () => {
    send.mockRejectedValue(new Error('Resend HTTP 500'));
    const res = await post(good);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, state: 'received' });
    expect(markNotified).not.toHaveBeenCalled();
  });

  it('still answers ok when there is no mailer configured at all', async () => {
    mailReady = false;
    const res = await post(good);
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
    expect(store).toHaveBeenCalledOnce();
  });

  it('logs the stored-but-not-notified enquiry with its id, since nothing else will', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockRejectedValue(new Error('boom'));
    await post(good);
    expect(err.mock.calls.flat().join(' ')).toContain('#42');
    expect(err.mock.calls.flat().join(' ')).toContain('STORED BUT NOT NOTIFIED');
    err.mockRestore();
  });

  it('does answer 500 when the STORE fails, because then nothing was asked', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    store.mockRejectedValue(new Error('no such table'));
    const res = await post(good);
    expect(res.status).toBe(500);
    const j = await res.json();
    expect(j.ok).toBe(false);
    expect(j.reason).toContain('Nothing was kept');
    expect(send).not.toHaveBeenCalled();
    err.mockRestore();
  });
});
