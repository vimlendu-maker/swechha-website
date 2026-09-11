import { describe, expect, it } from 'vitest'
import { ANALYTICS, analyticsRewrites, trackerTag } from './analytics'
import { designRoutes } from '@/design-routes'

describe('analytics config', () => {
  it('exposes public paths that keyword blockers do not match', () => {
    /* Spec §2/§4: Umami's defaults `/script.js` and `/api/send` are matched by
       blocker lists, and a systematic undercount is what disqualified GA4.
       Only the PUBLIC paths need to dodge them — the upstream ones are never
       seen by a browser. */
    /* MOVED OFF `/record` ON 8 SEPTEMBER 2026, and the reason is a collision
       rather than a blocker. `/record` became a CONTENT route — the
       environmental archive — and `analyticsRewrites()` runs first in
       `beforeFiles`, so the tracker silently shadowed the page: /record
       answered 200 with a JavaScript file and the archive index was
       unreachable at its own URL. The UPSTREAM name is unchanged, because
       that is Umami's `TRACKER_SCRIPT_NAME` on the analytics deployment and
       not ours to pick; only the public path moved, and it now matches the
       collector's `/api/ledger`. The gate below is what stops this
       recurring. */
    expect(ANALYTICS.scriptPath).toBe('/ledger')
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
      source: '/ledger',
      destination: 'https://analytics.swechha.in/record',
    })
    expect(rules).toContainEqual({
      source: '/api/ledger',
      destination: 'https://analytics.swechha.in/api/send',
    })
  })

  it('does not shadow any content route on this site', () => {
    /* THE GATE THAT WOULD HAVE CAUGHT IT. `analyticsRewrites()` is spread into
       `beforeFiles` AHEAD of `designRoutes()`, so an analytics path equal to a
       content route wins and the page becomes unreachable while answering 200.
       It is not a 404 and nothing in the build notices — /record shipped that
       way for exactly as long as it took to curl it. Derived from the route
       map rather than a typed list, so a future route named `/ledger` fails
       here instead of quietly turning the tracker into a page. */
    const routes = new Set(designRoutes().map((r) => r.source))
    expect(routes.has(ANALYTICS.scriptPath)).toBe(false)
    expect(routes.has(ANALYTICS.collectPath)).toBe(false)
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
      `<script defer src="/ledger" data-website-id="${ANALYTICS.websiteId}"></script>`,
    )
    /* Same-origin is the point: an absolute src would need a CSP allow-list
       entry and break the inventory promise in next.config.ts. */
    expect(tag).not.toContain('http')
  })
})
