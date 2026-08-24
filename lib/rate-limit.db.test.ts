import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { Client } from 'pg'
import {
  actorHash,
  checkRateLimit,
  CALLER_LIMIT,
  RECIPIENT_LIMIT,
  WINDOW_SECONDS,
} from './rate-limit'

/**
 * THE COUNTING, EXECUTED — not re-implemented, not mocked.
 *
 * `lib/rate-limit.test.ts` covers the identification logic, which needs no
 * database. This file covers the part that does, and that is the part worth
 * covering: a limiter can be wrong at the limit, wrong at the window boundary,
 * wrong about which bucket a hit belongs to, or wrong in a prune that deletes
 * hits it still needs — and none of those are visible in review. They are only
 * visible when the SQL runs.
 *
 * ★ IT DRIVES `checkRateLimit()` ITSELF. The point of the `makeQuery` parameter
 * on that function is that this test exercises the shipped code path rather than
 * a copy of its queries. `neon()` is an HTTP driver bound to Neon, so the
 * adapter below presents `pg` through the same tagged-template shape neon uses.
 *
 * ★ SKIPPED, NOT FAILED, WHEN THERE IS NO DATABASE. CI has no Postgres and must
 * stay green; a developer with one gets the coverage. Run it with:
 *
 *     TEST_DATABASE_URL=postgresql://…/ratelimit_test npx vitest run lib/rate-limit.db.test.ts
 *
 * The database must have `db/003-rate-limits.sql` applied. It is TRUNCATEd
 * between cases, so point this at a scratch database and never at production —
 * the guard below refuses anything whose name does not look like a test.
 */
const URL_ = process.env.TEST_DATABASE_URL

describe.skipIf(!URL_)('rate limiter counting, against a real Postgres', () => {
  let client: Client

  /* neon()'s call shape, backed by pg. Interpolations become $1..$n so the
     values are parameterised exactly as neon parameterises them — a test that
     inlined them would be testing different SQL. */
  const makeQuery = () => (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = ''
    strings.forEach((s, i) => {
      text += s
      if (i < values.length) text += `$${i + 1}`
    })
    return client.query(text, values).then((r) => r.rows as unknown[])
  }

  const req = (ip?: string) =>
    new Request('https://swechha.in/api/ward/subscribe', {
      method: 'POST',
      headers: ip ? { 'x-real-ip': ip } : {},
    })

  const check = (endpoint: string, ip: string | undefined, email: string) =>
    checkRateLimit(endpoint, req(ip), email, makeQuery)

  const rows = async () =>
    (await client.query('SELECT bucket, actor_hash, created_at FROM rate_limit_hits ORDER BY id'))
      .rows as { bucket: string; actor_hash: string; created_at: Date }[]

  beforeAll(async () => {
    /* A truncating test pointed at the wrong database is a bad afternoon. */
    if (!/test|scratch|localhost|127\.0\.0\.1/.test(URL_!)) {
      throw new Error('TEST_DATABASE_URL does not look like a scratch database; refusing to run')
    }
    process.env.RATE_LIMIT_SALT = 'test-salt-not-a-real-one'
    client = new Client({ connectionString: URL_ })
    await client.connect()
  })

  afterEach(async () => {
    await client.query('TRUNCATE rate_limit_hits')
  })

  afterAll(async () => {
    await client?.end()
  })

  it('allows exactly CALLER_LIMIT requests and refuses the next', async () => {
    for (let i = 1; i <= CALLER_LIMIT; i++) {
      const v = await check('ward', '203.0.113.7', `person${i}@example.com`)
      expect(v, `request ${i} of ${CALLER_LIMIT} should pass`).toEqual({ ok: true })
    }
    const over = await check('ward', '203.0.113.7', 'person-last@example.com')
    expect(over).toEqual({ ok: false, kind: 'caller', retryAfter: WINDOW_SECONDS })
  })

  it('refuses on the caller limit BEFORE spending the recipient allowance', async () => {
    /* Order matters: if the recipient check ran first, a flood from one source
       could lock a specific address out of ever subscribing. */
    for (let i = 1; i <= CALLER_LIMIT; i++) {
      await check('ward', '203.0.113.9', `p${i}@example.com`)
    }
    await check('ward', '203.0.113.9', 'victim@example.com')
    const victimHits = (await rows()).filter(
      (r) => r.bucket === 'ward:email' && r.actor_hash === actorHash('victim@example.com'),
    )
    expect(victimHits).toHaveLength(0)
  })

  it('allows exactly RECIPIENT_LIMIT emails to one address across different callers', async () => {
    for (let i = 1; i <= RECIPIENT_LIMIT; i++) {
      const v = await check('ward', `198.51.100.${i}`, 'one-victim@example.com')
      expect(v, `recipient send ${i} should pass`).toEqual({ ok: true })
    }
    const over = await check('ward', '198.51.100.99', 'one-victim@example.com')
    expect(over).toEqual({ ok: false, kind: 'recipient', retryAfter: WINDOW_SECONDS })
  })

  it('keeps the two endpoints in separate buckets', async () => {
    /* Subscribing to air alerts must not spend the digest's allowance. */
    for (let i = 1; i <= CALLER_LIMIT; i++) {
      await check('ward', '203.0.113.20', `w${i}@example.com`)
    }
    expect(await check('ward', '203.0.113.20', 'w-over@example.com')).toMatchObject({ ok: false })
    expect(await check('newsletter', '203.0.113.20', 'n1@example.com')).toEqual({ ok: true })
  })

  it('keeps different callers independent', async () => {
    for (let i = 1; i <= CALLER_LIMIT; i++) {
      await check('ward', '203.0.113.30', `a${i}@example.com`)
    }
    expect(await check('ward', '203.0.113.30', 'a-over@example.com')).toMatchObject({ ok: false })
    expect(await check('ward', '203.0.113.31', 'b1@example.com')).toEqual({ ok: true })
  })

  it('forgets hits older than the window', async () => {
    const hash = actorHash('203.0.113.40')
    /* Fill the caller's allowance with hits placed just OUTSIDE the window. */
    for (let i = 0; i < CALLER_LIMIT; i++) {
      await client.query(
        `INSERT INTO rate_limit_hits (bucket, actor_hash, created_at)
         VALUES ('ward:ip', $1, now() - make_interval(secs => $2))`,
        [hash, WINDOW_SECONDS + 60],
      )
    }
    expect(await check('ward', '203.0.113.40', 'fresh@example.com')).toEqual({ ok: true })
  })

  it('still counts a hit one second inside the window', async () => {
    const hash = actorHash('203.0.113.41')
    for (let i = 0; i < CALLER_LIMIT; i++) {
      await client.query(
        `INSERT INTO rate_limit_hits (bucket, actor_hash, created_at)
         VALUES ('ward:ip', $1, now() - make_interval(secs => $2))`,
        [hash, WINDOW_SECONDS - 1],
      )
    }
    expect(await check('ward', '203.0.113.41', 'blocked@example.com')).toMatchObject({
      ok: false,
      kind: 'caller',
    })
  })

  it('records one hit per bucket for an accepted request, and nothing else', async () => {
    await check('ward', '203.0.113.50', 'someone@example.com')
    const all = await rows()
    expect(all.map((r) => r.bucket).sort()).toEqual(['ward:email', 'ward:ip'])
  })

  it('never writes the IP or the address in plaintext', async () => {
    const ip = '203.0.113.60'
    const email = 'private-person@example.com'
    await check('ward', ip, email)
    const all = await rows()
    const hashes = all.map((r) => r.actor_hash)
    /* The promise in lib/subscriptions.ts is "No name, no IP". */
    expect(hashes).not.toContain(ip)
    expect(hashes).not.toContain(email)
    expect(hashes).toContain(actorHash(ip))
    expect(hashes).toContain(actorHash(email))
    expect(hashes.every((h) => /^[0-9a-f]{64}$/.test(h))).toBe(true)
    const dump = JSON.stringify(all)
    expect(dump).not.toContain(ip)
    expect(dump).not.toContain(email)
  })

  it('prunes hits past the retention horizon but not live ones', async () => {
    const old = actorHash('ancient')
    await client.query(
      `INSERT INTO rate_limit_hits (bucket, actor_hash, created_at)
       VALUES ('ward:ip', $1, now() - make_interval(secs => $2))`,
      [old, 25 * 60 * 60],
    )
    /* An accepted request is what triggers the opportunistic prune. */
    await check('ward', '203.0.113.70', 'live@example.com')
    const all = await rows()
    expect(all.some((r) => r.actor_hash === old)).toBe(false)
    expect(all.some((r) => r.actor_hash === actorHash('203.0.113.70'))).toBe(true)
  })

  it('still limits by recipient when the caller cannot be identified', async () => {
    /* No x-real-ip and no x-forwarded-for: a null caller is bounded, not free. */
    for (let i = 1; i <= RECIPIENT_LIMIT; i++) {
      expect(await check('ward', undefined, 'anon-target@example.com')).toEqual({ ok: true })
    }
    expect(await check('ward', undefined, 'anon-target@example.com')).toMatchObject({
      ok: false,
      kind: 'recipient',
    })
    /* And it recorded no caller bucket at all, rather than one shared one. */
    expect((await rows()).every((r) => r.bucket === 'ward:email')).toBe(true)
  })

  it('fails CLOSED when the table is missing, rather than waving the request through', async () => {
    await client.query('ALTER TABLE rate_limit_hits RENAME TO rate_limit_hits_hidden')
    try {
      const v = await check('ward', '203.0.113.80', 'x@example.com')
      expect(v).toEqual({ ok: false, kind: 'unavailable', retryAfter: 60 })
    } finally {
      await client.query('ALTER TABLE rate_limit_hits_hidden RENAME TO rate_limit_hits')
    }
  })
})
