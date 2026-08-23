import { describe, it, expect } from 'vitest'
import { designRoutes } from '@/design-routes'
import { buildLegacyRedirects, readMap, noSlash, type MapRow } from '@/lib/legacy-redirects'

const routes = new Set(designRoutes().map((r) => r.source))
const rows = readMap()
const built = buildLegacyRedirects(rows, routes)

describe('the legacy redirect map', () => {
  it('accounts for every captured URL, as a redirect or a deliberate 404', () => {
    /* 1240 URLs were captured on 2026-08-23. If this number changes, the map
       was regenerated against a different capture and wants re-reviewing. */
    expect(rows).toHaveLength(1240)
    const content = rows.filter((r) => !['attachment', 'soliloquy', 'post_tag', 'pj-categs', 'pl-categs'].includes(r.type))
    expect(content).toHaveLength(226)
    expect(content.filter((r) => r.to)).toHaveLength(167)
    expect(content.filter((r) => !r.to)).toHaveLength(59)
  })

  it('emits one redirect per mapped row and nothing else', () => {
    expect(built).toHaveLength(rows.filter((r) => r.to).length)
    expect(built).toHaveLength(167)
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
