import { describe, it, expect } from 'vitest'
import { designRoutes } from '@/design-routes'
import { legacyRedirects, movedRedirects, retiredRedirects } from '@/redirects'
import { ancestors, buildRetiredRedirects, readBuiltRoutes } from '@/lib/retired-redirects'

const routes = new Set(designRoutes().map((r) => r.source))
const built = readBuiltRoutes()

describe('ancestors()', () => {
  it('walks a path up, nearest first, and never reaches the root', () => {
    expect(ancestors('/now/climate-event/assam-flood')).toEqual(['/now/climate-event', '/now'])
    expect(ancestors('/journal/one-city-two-verdicts')).toEqual(['/journal'])
    /* A single-segment path has no ancestor but `/`, and `/` is not a repair —
       a top-level route that vanished is a decision, not a retirement. */
    expect(ancestors('/impact')).toEqual([])
  })
})

describe('the retired-route redirects', () => {
  it('redirects every route the register holds that the site no longer serves', () => {
    const retired = built.filter((r) => !routes.has(r))
    expect(retiredRedirects).toHaveLength(retired.length)
    expect(retiredRedirects.map((r) => r.source).sort()).toEqual(retired.sort())
  })

  it('sends every one of them to a route that exists', () => {
    const bad = retiredRedirects.filter((r) => !routes.has(String(r.destination)))
    expect(bad).toEqual([])
  })

  it('sends each to its NEAREST live ancestor, not merely to some live page', () => {
    for (const r of retiredRedirects) {
      const nearest = ancestors(r.source).find((a) => routes.has(a))
      expect(r.destination).toBe(nearest)
    }
  })

  it('leaves /search alone, because it is served and only absent from the sitemap', () => {
    /* ★ THE TRAP THIS TEST EXISTS FOR. `/search` carries `robots: noindex,
       follow` on purpose, so it is in the route map and NOT in sitemap.xml.
       Deriving "retired" from the sitemap rather than from designRoutes() puts
       it in this list, and the site's own search then 308s to the homepage.
       Measured 2026-09-21: the sitemap holds 149 URLs, the register 172, and
       the difference is 23 — of which 22 are genuinely retired and this is the
       one that is not. */
    expect(routes.has('/search')).toBe(true)
    expect(retiredRedirects.map((r) => r.source)).not.toContain('/search')
  })

  it('never redirects a route that is still served', () => {
    const shadowing = retiredRedirects.filter((r) => routes.has(r.source))
    expect(shadowing).toEqual([])
  })

  it('uses 308, not 301, throughout', () => {
    expect(retiredRedirects.every((r) => r.permanent === true)).toBe(true)
  })

  it('emits no chains — no destination is itself a source', () => {
    const sources = new Set(retiredRedirects.map((r) => r.source))
    const chained = retiredRedirects.filter((r) => sources.has(String(r.destination)))
    expect(chained).toEqual([])
  })

  it('shares no source with the moved or legacy lists', () => {
    /* next.config.ts returns [...moved, ...retired, ...legacy] and Next matches
       in order, so a shared source would mean one of the three is dead weight
       and nobody would see which. */
    const others = new Set([...movedRedirects, ...legacyRedirects].map((r) => r.source))
    const collisions = retiredRedirects.filter((r) => others.has(r.source))
    expect(collisions).toEqual([])
  })
})

describe('buildRetiredRedirects gates', () => {
  it('reports rather than emits when no ancestor is live', () => {
    const { redirects, problems } = buildRetiredRedirects(['/gone/deep/page'], new Set(['/']))
    expect(redirects).toEqual([])
    expect(problems).toEqual([{ route: '/gone/deep/page', why: 'no ancestor of this retired route is a live route' }])
  })

  it('reports a missing home route rather than redirecting the homepage', () => {
    const { redirects, problems } = buildRetiredRedirects(['/'], new Set(['/about']))
    expect(redirects).toEqual([])
    expect(problems).toEqual([{ route: '/', why: 'the home route is missing from the route map' }])
  })

  it('emits nothing at all when every built route is still served', () => {
    const { redirects, problems } = buildRetiredRedirects(['/', '/about'], new Set(['/', '/about']))
    expect(redirects).toEqual([])
    expect(problems).toEqual([])
  })
})
