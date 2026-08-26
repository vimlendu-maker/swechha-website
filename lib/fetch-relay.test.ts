import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http'
import { fetchUpstream, relayQueryFor } from '../scripts/lib/fetch-cpcb.mjs'

/**
 * THE RELAY RUNG OF THE TRANSPORT LADDER (AD-45), proven against a local
 * stand-in for /api/relay — no network, no real upstream, no secrets.
 *
 * Two behaviours here are load-bearing enough to pin:
 *
 * 1. THE DEPLOY-ORDER TRAP. The relay route exists in production only AFTER
 *    the branch adding it deploys, but PR CI runs BEFORE — so a relay 404
 *    (or 401, or an edge error page) MUST be a failed rung, never "the
 *    source answered". The discriminator is the x-relay-upstream-status
 *    header: absent means the relay itself spoke and the rung failed.
 *    Getting this wrong flips the callers from exit 75 (silent source, green
 *    skip) to exit 1 (answered wrongly, red) on every pre-deploy CI run.
 *
 * 2. THE MAPPING IS A WHITELIST ON THIS SIDE TOO. Only the three known
 *    upstreams are ever relayed; everything else skips the rung, so a new
 *    fetch site cannot ride the relay by accident.
 */

const CAAQMS = 'https://airquality.cpcb.gov.in/caaqms/rss_feed'
const MIRROR_DELHI = 'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69'
  + '?api-key=FAKEKEY&format=json&limit=1000&offset=0&filters%5Bcity%5D=Delhi'

let server: Server
let origin: string
/** What the fake relay should do with the next request. */
let behave: (req: IncomingMessage, res: ServerResponse) => void
/** The requests the fake relay saw. */
let seen: { url: string; auth: string | undefined }[] = []

const ENV_KEYS = ['AIR_RELAY_TOKEN', 'AIR_RELAY_ORIGIN', 'AIR_FORCE_RELAY'] as const
const saved: Record<string, string | undefined> = {}

beforeAll(async () => {
  for (const k of ENV_KEYS) saved[k] = process.env[k]
  server = createServer((req, res) => {
    seen.push({ url: req.url ?? '', auth: req.headers.authorization })
    behave(req, res)
  })
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
  const addr = server.address()
  origin = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`
})

afterAll(async () => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
  await new Promise((r) => server.close(r))
})

afterEach(() => {
  seen = []
  for (const k of ENV_KEYS) delete process.env[k]
})

/** Point the ladder at the fake relay and skip the real-network rungs. */
function useRelay(token = 'test-token') {
  process.env.AIR_FORCE_RELAY = '1'
  process.env.AIR_RELAY_ORIGIN = origin
  process.env.AIR_RELAY_TOKEN = token
}

describe('relayQueryFor — the caller-side whitelist', () => {
  it('maps the three known upstreams and nothing else', () => {
    expect(relayQueryFor(CAAQMS)).toBe('src=caaqms')
    expect(relayQueryFor('https://cpcb.nic.in/aqi_report.php')).toBe('src=bulletin')
    expect(relayQueryFor(MIRROR_DELHI))
      .toBe('src=mirror&city=Delhi&limit=1000&offset=0')
    expect(relayQueryFor(
      'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=K&format=json&limit=20000&offset=0',
    )).toBe('src=mirror-all&limit=20000&offset=0')
    expect(relayQueryFor('https://api.waqi.info/feed/delhi/')).toBeNull()
    expect(relayQueryFor('https://api.data.gov.in/resource/some-other-resource?x=1')).toBeNull()
    expect(relayQueryFor('not a url')).toBeNull()
  })

  it('NEVER forwards the api-key — the relay holds its own', () => {
    expect(relayQueryFor(MIRROR_DELHI)).not.toContain('FAKEKEY')
    expect(relayQueryFor(MIRROR_DELHI)).not.toContain('api-key')
  })
})

describe('fetchUpstream via the relay rung', () => {
  it('completes a fetch purely through the relay, bearer attached', async () => {
    useRelay()
    behave = (_req, res) => {
      res.writeHead(200, { 'content-type': 'application/xml', 'x-relay-upstream-status': '200' })
      res.end('<AqIndex>ok</AqIndex>')
    }
    const res = await fetchUpstream(CAAQMS, { timeoutMs: 5000 })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect((res as { via?: string }).via).toBe('relay')
    expect(await res.text()).toBe('<AqIndex>ok</AqIndex>')
    expect(seen).toHaveLength(1)
    expect(seen[0].url).toBe('/api/relay?src=caaqms')
    expect(seen[0].auth).toBe('Bearer test-token')
  })

  it('a relayed upstream HTTP error RESOLVES — the source answered, however unhappily', async () => {
    useRelay()
    behave = (_req, res) => {
      res.writeHead(502, { 'x-relay-upstream-status': '502' })
      res.end('bad gateway from the upstream itself')
    }
    const res = await fetchUpstream(CAAQMS, { timeoutMs: 5000 })
    expect(res.ok).toBe(false)
    expect(res.status).toBe(502)
  })

  it('THE DEPLOY-ORDER TRAP: a relay 404 without the upstream header THROWS — the source was never asked', async () => {
    useRelay()
    behave = (_req, res) => {
      res.writeHead(404, { 'content-type': 'text/html' })
      res.end('<h1>404 — this deployment predates /api/relay</h1>')
    }
    await expect(fetchUpstream(CAAQMS, { timeoutMs: 5000 })).rejects.toThrow(/no upstream status/)
  })

  it('a relay 401 likewise throws as a failed rung, never resolves as an answer', async () => {
    useRelay('wrong-token-on-purpose')
    behave = (_req, res) => {
      res.writeHead(401, { 'content-type': 'application/json' })
      res.end('{"ok":false,"reason":"unauthorized"}')
    }
    await expect(fetchUpstream(CAAQMS, { timeoutMs: 5000 })).rejects.toThrow(/relay/)
  })

  it('skips the rung — and asks the relay NOTHING — when AIR_RELAY_TOKEN is unset', async () => {
    process.env.AIR_FORCE_RELAY = '1'
    process.env.AIR_RELAY_ORIGIN = origin
    behave = (_req, res) => { res.writeHead(200, { 'x-relay-upstream-status': '200' }); res.end('x') }
    await expect(fetchUpstream(CAAQMS, { timeoutMs: 5000 })).rejects.toThrow(/AIR_RELAY_TOKEN is not set/)
    expect(seen).toHaveLength(0)
  })

  it('skips the rung for an upstream outside the whitelist', async () => {
    useRelay()
    behave = (_req, res) => { res.writeHead(200, { 'x-relay-upstream-status': '200' }); res.end('x') }
    await expect(fetchUpstream('https://api.waqi.info/feed/delhi/', { timeoutMs: 5000 }))
      .rejects.toThrow(/no whitelisted relay mapping/)
    expect(seen).toHaveLength(0)
  })

  it('the thrown all-rungs error names every rung and carries transport=fetch+curl+relay', async () => {
    useRelay()
    behave = (_req, res) => { res.writeHead(404); res.end() }
    try {
      await fetchUpstream(CAAQMS, { timeoutMs: 5000 })
      expect.unreachable('should have thrown')
    } catch (e) {
      const err = e as Error & { transport?: string }
      expect(err.transport).toBe('fetch+curl+relay')
      expect(err.message).toMatch(/fetch \(skipped/)
      expect(err.message).toMatch(/curl \(skipped/)
      expect(err.message).toMatch(/relay \(/)
    }
  })
})
