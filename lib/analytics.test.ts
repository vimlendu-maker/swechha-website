import { describe, expect, it } from 'vitest'
import { ANALYTICS, analyticsRewrites, trackerTag } from './analytics'

describe('analytics config', () => {
  it('exposes public paths that keyword blockers do not match', () => {
    /* Spec §2/§4: Umami's defaults `/script.js` and `/api/send` are matched by
       blocker lists, and a systematic undercount is what disqualified GA4.
       Only the PUBLIC paths need to dodge them — the upstream ones are never
       seen by a browser. */
    expect(ANALYTICS.scriptPath).toBe('/record')
    expect(ANALYTICS.collectPath).toBe('/api/ledger')
    expect(ANALYTICS.scriptPath).not.toMatch(/umami|analytics|track|script/i)
    expect(ANALYTICS.collectPath).not.toMatch(/umami|analytics|track|send|collect/i)
  })

  it('targets the collector Umami actually guarantees', () => {
    /* REGRESSION GUARD, 2026-08-26. `/api/record` looked like the obvious
       upstream name and is ALREADY a built-in Umami v3 endpoint (session
       recording, discriminator 'record' | 'heatmap'). Pointing the collector
       at it returned 400 on every pageview while the config looked correct.
       `/api/send` is the native collector. Do not "tidy" this to match
       `collectPath`. */
    expect(ANALYTICS.upstreamCollectPath).toBe('/api/send')
    expect(ANALYTICS.upstreamCollectPath).not.toBe('/api/record')
  })

  it('has a real website id', () => {
    expect(ANALYTICS.websiteId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('points at an https host with no trailing slash', () => {
    expect(ANALYTICS.host).toMatch(/^https:\/\//)
    expect(ANALYTICS.host).not.toMatch(/\/$/)
  })

  it('rewrites the script and the collector to their upstream paths', () => {
    const rules = analyticsRewrites()
    expect(rules).toHaveLength(2)
    expect(rules).toContainEqual({
      source: '/record',
      destination: 'https://analytics.swechha.in/record',
    })
    expect(rules).toContainEqual({
      source: '/api/ledger',
      destination: 'https://analytics.swechha.in/api/send',
    })
  })

  it('does not collide with an existing app/api route on this site', () => {
    /* app/api holds air, ward, newsletter and keystatic. A collision would
       shadow a real endpoint rather than fail loudly — which is precisely the
       failure mode that `/api/record` produced on the Umami side. */
    for (const taken of ['/api/air', '/api/ward', '/api/newsletter', '/api/keystatic']) {
      expect(ANALYTICS.collectPath).not.toBe(taken)
    }
  })

  it('emits a defer-loaded same-origin script tag', () => {
    const tag = trackerTag()
    expect(tag).toBe(
      `<script defer src="/record" data-website-id="${ANALYTICS.websiteId}"></script>`,
    )
    /* Same-origin is the point: an absolute src would need a CSP allow-list
       entry and break the inventory promise in next.config.ts. */
    expect(tag).not.toContain('http')
  })
})
