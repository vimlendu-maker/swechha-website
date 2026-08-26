import { describe, it, expect } from 'vitest'
import { bearerAuthorized, planUpstream, scrub, MIRROR_RESOURCE } from './relay'

/**
 * THE RELAY IS NOT AN OPEN PROXY, AND THESE TESTS ARE THE FENCE POSTS.
 * /api/relay exists because runner egress to the CPCB-side hosts died
 * mid-afternoon on 26 August 2026 while Vercel-Mumbai kept answering (AD-45).
 * The moment such an endpoint accepts a caller-supplied URL, or answers
 * without a token, it is a free proxy with our name on it — so the two
 * policies below (who may ask; what may be asked for) are pinned here,
 * independent of any server.
 */

const P = (q: string) => new URLSearchParams(q)

describe('bearerAuthorized — no token, no service, fail CLOSED', () => {
  it('accepts exactly the configured token', () => {
    expect(bearerAuthorized('Bearer s3cret', 's3cret')).toBe(true)
  })

  it('rejects a wrong token, a malformed header, and no header at all', () => {
    expect(bearerAuthorized('Bearer wrong', 's3cret')).toBe(false)
    expect(bearerAuthorized('s3cret', 's3cret')).toBe(false)
    expect(bearerAuthorized(null, 's3cret')).toBe(false)
  })

  it('rejects EVERYTHING when the expected token is unset — a misdeployed relay is a 401, not an open proxy', () => {
    expect(bearerAuthorized('Bearer anything', undefined)).toBe(false)
    expect(bearerAuthorized('Bearer ', undefined)).toBe(false)
    expect(bearerAuthorized(null, undefined)).toBe(false)
    // The empty-string edge: an empty env var is as unset as an absent one.
    expect(bearerAuthorized('Bearer x', '')).toBe(false)
  })
})

describe('planUpstream — a whitelist of four names, never a URL', () => {
  it('refuses an unknown or missing src with a 400', () => {
    expect(planUpstream(P('src=https://evil.example/'), 'k')).toMatchObject({ ok: false, status: 400 })
    expect(planUpstream(P(''), 'k')).toMatchObject({ ok: false, status: 400 })
  })

  it('builds the mirror URL server-side, key and all, from the caller\'s city/limit/offset', () => {
    const plan = planUpstream(P('src=mirror&city=Delhi&limit=1000&offset=0'), 'THEKEY')
    expect(plan).toMatchObject({ ok: true, src: 'mirror' })
    if (plan.ok && plan.src === 'mirror') {
      const u = new URL(plan.url)
      expect(u.hostname).toBe('api.data.gov.in')
      expect(u.pathname).toBe(`/resource/${MIRROR_RESOURCE}`)
      expect(u.searchParams.get('api-key')).toBe('THEKEY')
      expect(u.searchParams.get('filters[city]')).toBe('Delhi')
    }
  })

  it('mirror-all carries no city filter — the national set fetch-india asks for', () => {
    const plan = planUpstream(P('src=mirror-all&limit=20000'), 'k')
    expect(plan.ok).toBe(true)
    if (plan.ok && plan.src === 'mirror-all') {
      expect(plan.url).not.toContain('filters')
      expect(plan.url).toContain('limit=20000')
    }
  })

  it('refuses a malformed city — nothing URL-structural can ride the filter', () => {
    for (const city of ['Delhi&x=1', '../..', 'a?b', 'Delhi#f', '<script>', '']) {
      expect(planUpstream(P(`src=mirror&city=${encodeURIComponent(city)}`), 'k'))
        .toMatchObject({ ok: false, status: 400 })
    }
    // Real CPCB city spellings must pass.
    for (const city of ['Sri Ganganagar', 'Kalyan-Dombivali', 'Delhi']) {
      expect(planUpstream(P(`src=mirror&city=${encodeURIComponent(city)}`), 'k').ok).toBe(true)
    }
  })

  it('refuses out-of-range limit/offset rather than clamping them silently', () => {
    expect(planUpstream(P('src=mirror&limit=0'), 'k')).toMatchObject({ ok: false, status: 400 })
    expect(planUpstream(P('src=mirror-all&limit=99999999'), 'k')).toMatchObject({ ok: false, status: 400 })
    expect(planUpstream(P('src=mirror&offset=-1'), 'k')).toMatchObject({ ok: false, status: 400 })
  })

  it('the mirror without a server-side key is OUR misconfiguration: 503, not 400', () => {
    expect(planUpstream(P('src=mirror'), undefined)).toMatchObject({ ok: false, status: 503 })
  })

  it('caaqms and bulletin need no key and point only at the constant hosts', () => {
    expect(planUpstream(P('src=caaqms'), undefined)).toMatchObject({ ok: true, src: 'caaqms' })
    const b = planUpstream(P('src=bulletin'), undefined)
    expect(b).toMatchObject({ ok: true, src: 'bulletin' })
    if (b.ok && b.src === 'bulletin') expect(new URL(b.url).hostname).toBe('cpcb.nic.in')
  })
})

describe('scrub — the key never leaves in an error message', () => {
  it('redacts api-key params and whole query strings', () => {
    expect(scrub('failed: https://api.data.gov.in/resource/x?api-key=SECRET&format=json'))
      .not.toContain('SECRET')
  })
})
