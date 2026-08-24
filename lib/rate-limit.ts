/**
 * lib/rate-limit.ts — the guard on the two endpoints that send email.
 *
 * `POST /api/newsletter/subscribe` and `POST /api/ward/subscribe` are
 * unauthenticated, public, and each one causes an email to be sent to an
 * address supplied in the request body. Audited 23 August 2026: neither had any
 * limit at all. See `db/003-rate-limits.sql` for what that allows and why the
 * worst outcome is not spam but a blocklisted sending domain.
 *
 * ── WHAT IS LIMITED, AND WHY BOTH ────────────────────────────────────────
 * TWO checks, because they stop two different attacks and neither stops the
 * other:
 *
 *   BY CALLER (`:ip`)    — caps how much mail one source can cause AT ALL,
 *                          whatever addresses it names. This is the one that
 *                          stops a bomber walking a list of victims.
 *   BY RECIPIENT (`:email`) — caps how much mail ONE PERSON can be sent,
 *                          whatever source asks for it. This is the one that
 *                          stops a distributed or proxied attacker burying a
 *                          single victim, and it closes a hole that is
 *                          specifically open here: `subscribe()`'s
 *                          `ON CONFLICT … SET created_at = now()` re-issues the
 *                          token and re-sends every time, so repeat calls for
 *                          one address were not merely allowed, they were
 *                          indistinguishable from the first.
 *
 * ── IT STORES NO IP AND NO ADDRESS ───────────────────────────────────────
 * `lib/subscriptions.ts` promises "No name, no IP". Both identifiers are salted
 * and hashed before they reach a column, and the salt is mandatory: unsalted
 * SHA-256 over IPv4 is reversible by enumeration.
 *
 * The salt is `RATE_LIMIT_SALT` when set. When it is not, it is derived from
 * `DATABASE_URL` — which is secret, stable, and guaranteed present, because
 * this module cannot run without a database anyway. That fallback is a
 * deliberate trade: it keeps the privacy promise with no new required config,
 * at the cost of rotating every hash if the database URL ever changes (which
 * empties the limiter for one window — an availability non-event). Set the
 * dedicated variable if you would rather the two were independent.
 *
 * ── WHAT IT DOES NOT DO ──────────────────────────────────────────────────
 * ★ IT IS NOT TRANSACTIONAL, and does not need to be. Two simultaneous
 *   requests can both read a count below the limit and both proceed, so the
 *   true ceiling is `limit + concurrency`, not `limit`. Closing that needs
 *   SELECT … FOR UPDATE or an advisory lock on every subscribe, which buys
 *   nothing here: the attack this stops is thousands of requests, not
 *   `limit + 2`.
 * ★ IT IS NOT A CAPTCHA. A determined attacker with many source addresses
 *   still gets `limit` mail per address per window out of the caller check.
 *   The recipient check is what bounds the damage to any one victim.
 * ★ IT FAILS CLOSED. If the counter cannot be read, the request is refused
 *   rather than waved through. An endpoint that sends email is the wrong place
 *   to fail open, and the caller already has an honest 503 for "cannot do this
 *   right now" — the same shape it uses when the database is absent entirely.
 *
 * ── ★★ DEPLOYMENT: THE MIGRATION IS NOT OPTIONAL AND MUST GO FIRST ★★ ─────
 * Because this fails closed, shipping this file WITHOUT `db/003-rate-limits.sql`
 * applied makes both subscribe endpoints answer 503 for every request. Apply it
 * before or with the deploy:
 *
 *     npm run db:migrate
 *
 * The table is additive and `CREATE ... IF NOT EXISTS`, so it is safe to apply
 * ahead of the code and safe to apply twice. The catch block below detects this
 * specific failure and logs the remedy rather than a bare driver error.
 */
import { createHash } from 'node:crypto';
import { sql, DB_URL } from '@/lib/subscriptions';

/** Requests one caller may cause, per window, per endpoint. */
export const CALLER_LIMIT = 5;
/** Emails one address may be sent, per window, per endpoint. */
export const RECIPIENT_LIMIT = 3;
/** The moving window both limits are counted inside. */
export const WINDOW_SECONDS = 15 * 60;
/** Hits older than this are pruned. Comfortably longer than the window. */
const RETAIN_SECONDS = 24 * 60 * 60;

/**
 * The shape of a query function: neon()'s tagged template, narrowed to what
 * this module uses.
 *
 * ★ WHY THIS IS A PARAMETER AND NOT A HARDCODED `sql()`. The counting below is
 * the part of this file that can be wrong in ways review cannot see —
 * off-by-one at the limit, a window boundary that excludes the row it should
 * include, buckets bleeding into each other, a prune that deletes live hits.
 * None of that is provable without executing it against a real Postgres, and
 * `neon()` is an HTTP driver that only talks to Neon, so a test cannot point it
 * at a local server. Passing the factory in lets `lib/rate-limit.test.ts` run
 * THIS code — not a re-implementation of it — against a real database.
 *
 * ★ A FACTORY, NOT A QUERY OBJECT, AND THAT IS LOAD-BEARING. `sql()` throws
 * when DATABASE_URL is unset. A default parameter is evaluated when the
 * function is called, which is BEFORE the body's try block — so a plain
 * `q = sql()` default would throw past the catch and turn the honest 503 into
 * an unhandled 500. Deferring the call keeps every failure inside the catch,
 * which is what makes this fail closed rather than fail loudly.
 */
type Query = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<unknown[]>;

type MakeQuery = () => Query;

const defaultQuery: MakeQuery = () => sql() as unknown as Query;

function salt(): string {
  const s = process.env.RATE_LIMIT_SALT?.trim() || DB_URL;
  if (!s) throw new Error('rate-limit: no salt available (no RATE_LIMIT_SALT, no DATABASE_URL)');
  return s;
}

/**
 * Salted, one-way, and the only form either identifier is ever stored in.
 * Exported so a test can assert the PLAINTEXT never reaches the table.
 *
 * ★ THE DELIMITER IS `\0`, WRITTEN AS AN ESCAPE, AND BOTH HALVES OF THAT
 * MATTER. A NUL cannot occur in an IP address or an email address, so it makes
 * the concatenation unambiguous: with a printable separator, a salt ending in
 * that character and a value beginning with it would hash identically to the
 * other way round. And it is written `\0` rather than embedded as a raw byte
 * because a literal NUL in the source makes git classify this file as BINARY —
 * no diff, no blame, nothing reviewable. It shipped that way in the first
 * commit of this file and the PR diff for it was unreadable until this was
 * fixed.
 */
export function actorHash(value: string): string {
  return createHash('sha256').update(`${salt()}\0${value}`).digest('hex');
}

/**
 * The caller's address, as far as it can be known behind Vercel's proxy.
 *
 * `x-forwarded-for` is a CLIENT-SUPPLIED header everywhere except behind a
 * proxy that overwrites it, which Vercel does — so on Vercel the LEFTMOST entry
 * is the real peer and is not spoofable. Read `x-real-ip` first anyway, because
 * Vercel sets it to exactly that value and it has no list to parse.
 *
 * Returns null when neither is present. A null caller is NOT treated as one
 * shared bucket: lumping every unidentifiable request together would let one
 * attacker exhaust the limit for everybody behind the same gap, which converts
 * an abuse control into a denial-of-service tool. The recipient check still
 * applies, so a null caller is bounded, not unlimited.
 */
export function callerFrom(req: Request): string | null {
  const real = req.headers.get('x-real-ip')?.trim();
  if (real) return real;
  const fwd = req.headers.get('x-forwarded-for');
  const first = fwd?.split(',')[0]?.trim();
  return first || null;
}

export type Verdict =
  | { ok: true }
  | { ok: false; kind: 'caller' | 'recipient'; retryAfter: number }
  | { ok: false; kind: 'unavailable'; retryAfter: number };

async function countAndRecord(
  bucket: string,
  value: string,
  limit: number,
  makeQuery: MakeQuery,
): Promise<boolean> {
  const q = makeQuery();
  const hash = actorHash(value);
  const rows = (await q`
    SELECT count(*)::int AS n
      FROM rate_limit_hits
     WHERE bucket = ${bucket}
       AND actor_hash = ${hash}
       AND created_at > now() - make_interval(secs => ${WINDOW_SECONDS})
  `) as { n: number }[];
  if ((rows[0]?.n ?? 0) >= limit) return false;
  await q`INSERT INTO rate_limit_hits (bucket, actor_hash) VALUES (${bucket}, ${hash})`;
  return true;
}

/**
 * Check both limits for one endpoint and record the attempt.
 *
 * `endpoint` names the feature ('newsletter' | 'ward'); the two buckets are
 * derived from it so the newsletter and ward limits cannot bleed into one
 * another — subscribing to air alerts should not spend your digest allowance.
 *
 * ORDER MATTERS: the caller check runs FIRST, so a flood from one source is
 * refused before it can spend the victim's recipient allowance. Doing it the
 * other way round would let an attacker lock a specific address out of
 * subscribing legitimately, which is a worse outcome than the flood.
 */
export async function checkRateLimit(
  endpoint: string,
  req: Request,
  email: string,
  makeQuery: MakeQuery = defaultQuery,
): Promise<Verdict> {
  try {
    const caller = callerFrom(req);
    if (caller && !(await countAndRecord(`${endpoint}:ip`, caller, CALLER_LIMIT, makeQuery))) {
      return { ok: false, kind: 'caller', retryAfter: WINDOW_SECONDS };
    }
    if (!(await countAndRecord(`${endpoint}:email`, email, RECIPIENT_LIMIT, makeQuery))) {
      return { ok: false, kind: 'recipient', retryAfter: WINDOW_SECONDS };
    }
    /* Opportunistic, and deliberately not scheduled: this table is only ever
       written by this module, so the cheapest correct place to prune it is the
       write path. Failure to prune is not failure to limit, so it is swallowed
       rather than allowed to refuse a legitimate request. */
    try {
      const q = makeQuery();
      await q`DELETE FROM rate_limit_hits
               WHERE created_at < now() - make_interval(secs => ${RETAIN_SECONDS})`;
    } catch { /* pruning is housekeeping, never the answer to the caller */ }
    return { ok: true };
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    /* ★ THE ONE FAILURE THIS WILL ACTUALLY HAVE, NAMED WITH ITS FIX.
       Failing closed means a deploy that ships this code WITHOUT applying
       `db/003-rate-limits.sql` turns every subscribe into a 503. That is the
       correct direction to fail for a control that stops email abuse, but it is
       a bad thing to have to diagnose from a generic error — so the missing
       table says what to run. See the deployment note in the header. */
    if (/relation .*rate_limit_hits.* does not exist/i.test(m)) {
      console.error(
        '[rate-limit] the rate_limit_hits table is missing, so every subscribe '
        + 'is being refused. Apply db/003-rate-limits.sql — `npm run db:migrate`.',
      );
    } else {
      console.error('[rate-limit]', m);
    }
    return { ok: false, kind: 'unavailable', retryAfter: 60 };
  }
}

/** What the reader is told. Never names the limit that was hit or the count —
    that would confirm to an attacker which of the two checks is biting, and
    confirm to a stranger that an address is worth retrying. */
export const RATE_LIMITED_REASON =
  'Too many requests from here just now. Nothing was stored and no email was sent. '
  + 'Wait a few minutes and try again.';
