import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CPCB_CAAQMS_CA } from './cpcb-ca'
import { caFetchText, fetchDelhiLive } from './air'

/**
 * THE TRUST ANCHORS FOR CPCB's CAAQMS FEED — the AD-44 addendum.
 *
 * Vercel's undici rejects the host's cross-signed eMudhra intermediate, so
 * /api/air fell back to the ten-hour-stale mirror on its first deployed day —
 * exactly as A-44.7 predicted. The fix pins the chain the server itself
 * serves as explicit `ca` anchors for node:https.
 *
 * These tests defend two facts: the committed PEM and bundled constant do not
 * drift, and a failure of the CA-pinned rung is an ordinary fallback rather
 * than an error response.
 */

/** Syntactically valid, definitely NOT the CA that signed CPCB's chain. */
const WRONG_CA = `-----BEGIN CERTIFICATE-----
MIICwjCCAaoCCQD0BqmNgZn8lzANBgkqhkiG9w0BAQsFADAjMSEwHwYDVQQDDBhu
b3QtdGhlLXJpZ2h0LWNhLmV4YW1wbGUwHhcNMjYwODI2MDcxNzQxWhcNMjYwODI4
MDcxNzQxWjAjMSEwHwYDVQQDDBhub3QtdGhlLXJpZ2h0LWNhLmV4YW1wbGUwggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCuyHeMJFyYtDRTEcJ7jgode27M
mv4zqvKOYgovAbUyn2GD6Ixd1vCYhgMwxfs8iM6vHoqWIdbmulsFVzTjCTxVKbgA
BMJhFw40s3PbK+rnAsogHeKrxKawcnMHdB1wJVC/SHLXFshY2g9SpRUIwLu/bL7J
Hb7Cbk9Uhc7VeDFJmUdQyWb/FV0qNNRkKHkprR+eVbJjnknbLFcsu06Em0z9P0LG
Wc9KmmypkAoAsbJUPMuZxPTpRqKeWKhqyQ6ZKskUC+fcPjEG/pOKxvu0fVYDI5Q5
C5fEYR58oMcgJFAAqRtwREVGofKymbvSKEHjCwJwyaGBCPMvkr8cJpRzq8axAgMB
AAEwDQYJKoZIhvcNAQELBQADggEBAAKKYM1pdzKHxBdcWVeQgIFrZH8hbSvsHulj
1YwGJDc35e91fyhG8oFrKSGQIq+pE1UVMx3M7aNn72DzHNMZsOvvQ7U6gZ8DFU+b
+4PQ84+xuM7O2F7CjSXRVYCOdhkoVRvQgZ/ah2WMtaH5zY2HVaVYaAfbriL6ToSK
+fCvMdJ2/sdmJ3lt0FBXs1KWvtAWOpeRshbx3L2+Z4lVqR+O3RLVZr2fy94xR1Y2
qnEY+ku8sb4pJ3/OoWKQ2XhVotRh3VRvgXKsq4jm3hWwGCORHLEvM6G23PGtc4SN
Ft8AkMKv5HQpSbTelIew26LAbFxgHJnQ4HwSHah2SHnkhaFfq4o=
-----END CERTIFICATE-----
`

afterEach(() => vi.unstubAllGlobals())

describe('lib/cpcb-ca.ts vs certs/cpcb-caaqms-chain.pem — no drift', () => {
  it('the embedded constant is byte-for-byte the committed PEM', () => {
    const pem = readFileSync(join(__dirname, '../certs/cpcb-caaqms-chain.pem'), 'utf8')
    expect(CPCB_CAAQMS_CA).toBe(pem)
  })

  it('the bundle is a chain, not a stranded leaf', () => {
    expect((CPCB_CAAQMS_CA.match(/-----BEGIN CERTIFICATE-----/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })
})

describe('caFetchText failure contract', () => {
  it('rejects promptly when HTTPS cannot connect', async () => {
    // Keep CI deterministic. The old test depended on the public CPCB host
    // rejecting a deliberately wrong CA; on one runner the TLS/DNS path hung
    // long enough to exceed Vitest's timeout. A closed loopback port exercises
    // the same contract — caFetchText rejects and callers can fall back — with
    // no dependency on external network timing.
    await expect(caFetchText('https://127.0.0.1:1/', { ca: WRONG_CA, timeoutMs: 1000 })).rejects.toThrow()
  }, 5000)
})

describe('fetchDelhiLive — every rung of the ladder is an ordinary fallback', () => {
  it('serves the mirror, and SAYS so, when both CAAQMS rungs fail', async () => {
    // Rung 1: CA-pinned, forced to fail with the wrong anchor.
    // Rung 2: plain fetch to CAAQMS, stubbed to fail the way undici does.
    // Rung 3: the mirror, stubbed with one real-shaped row.
    vi.stubGlobal('fetch', vi.fn(async (url: string | URL) => {
      const u = String(url)
      if (u.includes('airquality.cpcb.gov.in')) {
        throw new TypeError('fetch failed: self-signed certificate in certificate chain')
      }
      if (u.includes('api.data.gov.in')) {
        return new Response(JSON.stringify({ records: [{
          station: 'Anand Vihar, Delhi - DPCC', last_update: '26-08-2026 02:00:00',
          latitude: '28.647622', longitude: '77.315809',
          pollutant_id: 'PM2.5', min_value: '26', max_value: '228', avg_value: '93',
        }] }), { status: 200, headers: { 'content-type': 'application/json' } })
      }
      throw new Error(`unexpected fetch in test: ${u}`)
    }))
    const live = await fetchDelhiLive('test-key', { ca: WRONG_CA })
    expect(live.servedBy).toBe('data.gov.in mirror (resource 3b01bcb8)')
    expect(live.rows).toHaveLength(1)
    expect(live.rows[0].station).toBe('Anand Vihar, Delhi - DPCC')
  }, 20000)

  it('propagates only when the LAST rung fails too — the routes fail() path', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('fetch failed')
    }))
    await expect(fetchDelhiLive('test-key', { ca: WRONG_CA })).rejects.toThrow()
  }, 20000)
})
