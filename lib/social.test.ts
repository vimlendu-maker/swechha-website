import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { shareCard, FALLBACK_CARD } from './social'
import { FALLBACK } from '@/scripts/lib/social-image.mjs'
import { imageSize } from '@/scripts/lib/image-size.mjs'

/**
 * THE SHARE CARD SHOWS THE STORY, NOT THE PUBLISHER.
 *
 * Every one of the 39 built pages used to ship the same `og:image` — a black
 * card with the wordmark on it — so a link to the Nepal glacial-flood page and
 * a link to /farm previewed identically in WhatsApp, on X and on LinkedIn.
 * `scripts/lib/social-image.mjs` derives each page's card from its own hero
 * photograph now, and `lib/social.ts` does the same for the handful of routes
 * the App Router actually renders.
 *
 * `scripts/verify-seo.mjs` gates the 39 built pages, page by page, by
 * re-deriving the answer and demanding the head agree. What THAT cannot see is
 * the app-side half and the seam between the two — which is what this covers.
 */

const PUBLIC = join(process.cwd(), 'public')

describe('the two halves agree on the fallback', () => {
  /* Two files name the neutral publisher card: `lib/social.ts` (App Router
     routes) and `scripts/lib/social-image.mjs` (the built pages). They cannot
     be one constant — one is TypeScript in the app graph, the other is an .mjs
     the generators run under plain node — so this is the thing that keeps them
     from drifting into two different fallbacks. */
  it('names the same file', () => {
    expect(FALLBACK_CARD.src).toBe(FALLBACK.src)
  })

  it('states the dimensions the file actually has', () => {
    /* Both halves WRITE DOWN 1200x630 rather than measuring, so that a card
       replaced with a differently-sized file fails here instead of shipping
       `og:image:width` tags that lie about it. */
    expect(imageSize(FALLBACK_CARD.src)).toEqual({
      width: FALLBACK_CARD.width,
      height: FALLBACK_CARD.height,
    })
    expect(FALLBACK.width).toBe(FALLBACK_CARD.width)
    expect(FALLBACK.height).toBe(FALLBACK_CARD.height)
  })
})

describe('shareCard', () => {
  it('uses the page image when there is one, with its measured size', () => {
    const hero = { src: '/images/photos/india-gate-hero.jpg', alt: 'India Gate through Delhi haze' }
    const { openGraph, twitter } = shareCard(hero)
    const [og] = openGraph!.images as Array<{ url: string; width: number; height: number; alt: string }>
    expect(og.url).toBe(hero.src)
    expect(og.alt).toBe(hero.alt)
    expect(og).toMatchObject(imageSize(hero.src)!)
    /* THE PAIR MUST NOT DIVERGE. A page advertising one image to Facebook and
       another to X is the defect this whole change exists to remove. */
    expect(twitter!.images).toEqual(openGraph!.images)
    /* Next's `Twitter` type is a union whose `card` is the discriminant, so it
       is not readable off the union without narrowing. The value is what
       matters here, not the shape. */
    expect((twitter as { card?: string }).card).toBe('summary_large_image')
  })

  it('carries the publisher fields that a bare openGraph object would drop', () => {
    /* THE SHALLOW-MERGE TRAP, asserted. A route writing its own `openGraph`
       REPLACES the layout's rather than adding to it, so these three have to
       come back from the helper or they are simply gone on that route. */
    const { openGraph } = shareCard(null)
    expect(openGraph).toMatchObject({ siteName: 'Swechha', locale: 'en_IN', type: 'website' })
    expect(shareCard(null, { type: 'article' }).openGraph).toMatchObject({ type: 'article' })
  })

  it('falls back to the brand card for a page with no image', () => {
    const [og] = shareCard(null).openGraph!.images as Array<{ url: string }>
    expect(og.url).toBe(FALLBACK_CARD.src)
  })

  it('refuses an image too small for a large card', () => {
    /* The wordmark in the header is 2048x512 — wide enough, far too short —
       and is exactly the kind of asset that must never become a card. */
    const [og] = shareCard({ src: '/brand/swechha-horizontal-white-approved.png', alt: 'Swechha' })
      .openGraph!.images as Array<{ url: string }>
    expect(og.url).toBe(FALLBACK_CARD.src)
  })

  it('refuses an image that is not on disk', () => {
    const [og] = shareCard({ src: '/images/photos/no-such-photograph.jpg', alt: 'nothing' })
      .openGraph!.images as Array<{ url: string }>
    expect(og.url).toBe(FALLBACK_CARD.src)
  })
})

describe('every built page ships a usable card', () => {
  /* verify-seo.mjs checks that each page's og:image is the RIGHT one. This
     checks the property that makes a card work at all and that no per-page
     rule can restore once it is lost: the file is really there, and it is big
     enough for the large layout. A card pointing at a 404 previews as no card,
     and the failure is invisible until somebody shares the link. */
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => {
    const p = join(d, f)
    return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.html') ? [p] : [])
  })
  const pages = walk(join(PUBLIC, '_pages/v3'))

  it('finds the built pages', () => {
    expect(pages.length).toBeGreaterThan(30)
  })

  it.each(pages.map((p) => [p.slice(PUBLIC.length), p] as const))('%s', (_name, file) => {
    const html = readFileSync(file, 'utf8')
    const og = /<meta property="og:image" content="([^"]*)">/.exec(html)?.[1]
    const tw = /<meta name="twitter:image" content="([^"]*)">/.exec(html)?.[1]
    expect(og).toBeTruthy()
    expect(tw).toBe(og)
    /* ABSOLUTE AND https. The Open Graph protocol specifies a URL, and support
       for a relative one differs between consumers — the same argument the
       generators' own `abs()` comment records. */
    expect(og!.startsWith('https://')).toBe(true)

    const path = new URL(og!).pathname
    const size = imageSize(path)
    expect(size, `${path} is not a readable image under public/`).not.toBeNull()
    expect(size!.width).toBeGreaterThanOrEqual(600)
    expect(size!.height).toBeGreaterThanOrEqual(315)

    expect(/<meta name="twitter:card" content="summary_large_image">/.test(html)).toBe(true)
  })
})
