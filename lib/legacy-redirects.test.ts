import { describe, it, expect } from 'vitest'
import { designRoutes } from '@/design-routes'
import { buildLegacyRedirects, readMap, noSlash, type MapRow } from '@/lib/legacy-redirects'

const routes = new Set(designRoutes().map((r) => r.source))
const rows = readMap()
const built = buildLegacyRedirects(rows, routes)

describe('the legacy redirect map', () => {
  it('accounts for every captured URL, as a redirect or a deliberate 404', () => {
    /* 1240 URLs were captured on 2026-08-23, plus 6 RECOVERED on 2026-08-26 —
       live pages the old sitemap had already dropped, so the capture never saw
       them. If either number changes, the map was regenerated against a
       different capture and wants re-reviewing. */
    expect(rows).toHaveLength(1246)
    const content = rows.filter((r) => !['attachment', 'soliloquy', 'post_tag', 'pj-categs', 'pl-categs'].includes(r.type))
    expect(content).toHaveLength(232)
    expect(content.filter((r) => r.to)).toHaveLength(175)
    expect(content.filter((r) => !r.to)).toHaveLength(57)
  })

  it('emits one redirect per mapped row and nothing else', () => {
    expect(built).toHaveLength(rows.filter((r) => r.to).length)
    expect(built).toHaveLength(175)
  })

  it('never emits a source with the trailing slash WordPress gave it', () => {
    /* `trailingSlash` is unset, so Next normalises `/programs/` to `/programs`
       before user redirects run. A source keeping the slash never matches. */
    const withSlash = built.filter((r) => r.source.length > 1 && r.source.endsWith('/'))
    expect(withSlash).toEqual([])
  })

  it('sends every redirect to a route that exists', () => {
    const bad = built.filter((r) => !routes.has(String(r.destination)))
    expect(bad).toEqual([])
  })

  it('uses 308, not 301, throughout', () => {
    expect(built.every((r) => r.permanent === true)).toBe(true)
  })

  it('states a reason for every deliberate 404', () => {
    const silent = rows.filter((r) => !r.to && !r.why)
    expect(silent).toEqual([])
  })

  it('keeps the ranking /contact-us/ URL alive, pointed at /act', () => {
    /* This URL still RANKS: it was a live Google result on 2026-08-25, with a
       snippet promising "Partnerships, Volunteering and Internships" — which is
       precisely what /act's three ways in (give, volunteer, partner) now offer.
       It was first ruled a deliberate 404 on content grounds ("a title and a
       breadcrumb"), a judgement about the OLD PAGE'S worth made before anyone
       had checked what the URL was earning. A 404 throws that ranking away
       during the one migration window where it is still transferable.
       `/get-involved/` -> `/act` is the standing precedent. */
    const contact = built.find((r) => r.source === '/contact-us')
    expect(contact?.destination).toBe('/act')
  })

  it('redirects the six URLs the capture missed', () => {
    /* The 2026-08-23 capture came from the old site's sitemaps, which list what
       WordPress still considered current — so six live pages that had already
       fallen out of it were never captured and never ruled on. They 404'd by
       accident rather than by decision. Each was confirmed on 2026-08-26 as a
       real archived page returning 200.

       Pinned by destination so the rescue cannot be silently undone, and so a
       regenerated map that drops them fails loudly. */
    const recovered: Record<string, string> = {
      '/project/yamuna-yatra-2': '/work/journeys/yamuna-yatra',
      '/project/brake-even': '/work/campaigns',
      '/project/influence': '/work/projects/influence',
      '/project/me-to-we': '/work/projects/me-to-we',
      '/about-us': '/about',
      '/what-we-do': '/work',
    }
    for (const [source, destination] of Object.entries(recovered)) {
      expect(built.find((r) => r.source === source)?.destination).toBe(destination)
    }
  })

  it('keeps the ranking /we-for-yamuna-and-you/ URL alive despite its empty body', () => {
    /* A zero-body post, so the 2014-17 press-shell rule sent it to a 404 with
       the other 51. But those are clippings ABOUT Swechha; this is We for
       Yamuna, the campaign it has run since 2000, and the URL was still a live
       Google result on 2026-08-26. Same correction as /contact-us/: the ruling
       weighed the body and never asked what the URL was earning.

       It points at the campaigns index because /work/campaigns/we-for-yamuna is
       not a built route yet — when it is, this expectation should move with it
       rather than be deleted. */
    expect(built.find((r) => r.source === '/we-for-yamuna-and-you')?.destination).toBe('/work/campaigns')
  })

  it('keeps the five essays pointed at their republished selves', () => {
    /* These five are read out of content/essay/_index.json, not guessed, so a
       change here means an essay slug moved without its redirect. */
    const essays = built.filter((r) => String(r.destination).startsWith('/stories/'))
    expect(essays).toHaveLength(5)
  })
})

describe('the gates refuse rather than emit something subtly wrong', () => {
  const row = (over: Partial<MapRow>): MapRow =>
    ({ type: 'page', from: '/old/', to: '/about', why: 'x', confidence: 'exact', ...over })
  const live = new Set(['/about', '/work'])

  it('refuses a destination that is not a route', () => {
    expect(() => buildLegacyRedirects([row({ to: '/nope' })], live)).toThrow(/not a route/)
  })

  it('refuses to shadow a live page', () => {
    expect(() => buildLegacyRedirects([row({ from: '/work/' })], live)).toThrow(/shadow/)
  })

  it('refuses a self-redirect', () => {
    expect(() => buildLegacyRedirects([row({ from: '/about/', to: '/about' })], live)).toThrow(
      /shadow|itself/,
    )
  })

  it('refuses a duplicate source', () => {
    expect(() => buildLegacyRedirects([row({}), row({})], live)).toThrow(/twice/)
  })

  it('refuses a chain', () => {
    expect(() =>
      buildLegacyRedirects(
        [row({ from: '/a/', to: '/work' }), row({ from: '/work/', to: '/about' })],
        new Set(['/about', '/work', '/a']),
      ),
    ).toThrow()
  })

  it('drops rows with no destination without complaint', () => {
    expect(buildLegacyRedirects([row({ to: null, confidence: 'none' })], live)).toEqual([])
  })
})

describe('noSlash', () => {
  it('strips a trailing slash but leaves the root alone', () => {
    expect(noSlash('/programs/')).toBe('/programs')
    expect(noSlash('/programs')).toBe('/programs')
    expect(noSlash('/')).toBe('/')
  })
})
