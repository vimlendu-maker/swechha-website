import type { Metadata } from 'next'
/* THE SAME MEASUREMENT THE GENERATORS USE, imported rather than reimplemented.
   `allowJs` is on in tsconfig.json, so the .mjs types infer. It reads the
   intrinsic size out of the file header and is EXIF-orientation aware — which
   matters here: seven photographs in this repo were once shipped rotated 90°
   because a pass read raw pixel dimensions and ignored the orientation flag. */
import { imageSize } from '@/scripts/lib/image-size.mjs'

/* ═══ THE SHARE CARD FOR ROUTES THE APP ROUTER ACTUALLY RENDERS ══════════
 *
 * The 39 finished pages are static HTML built by `scripts/` and served through
 * `next.config.ts`'s rewrites, so `app/layout.tsx` never runs for them; their
 * cards come from `scripts/lib/social-image.mjs`, derived from the markup.
 * THIS is the same rule for the handful of routes that do execute the layout —
 * `/explore`, `/stories/[slug]`, `/work/campaigns/[slug]` — so the site has one
 * answer to "what image represents this page", not two.
 *
 * ── WHY A HELPER AND NOT AN INLINE `openGraph` OBJECT ────────────────────
 * NEXT.JS MERGES `metadata` SHALLOWLY, PER TOP-LEVEL KEY. A page that writes
 *
 *     openGraph: { title, description, images: [src] }
 *
 * does not add to the layout's `openGraph` — it REPLACES it, and silently
 * drops `siteName`, `locale` and `type` on that route alone. Both dynamic
 * routes in this app were doing exactly that. The failure is invisible in
 * review (the page has an og:image, so it looks handled) and only shows up as
 * a card missing its publisher line in somebody's timeline. Returning the
 * WHOLE object from one place is what makes that unrepeatable.
 *
 * ── AND WHY THE DIMENSIONS ARE MEASURED ──────────────────────────────────
 * `images: [src]` — a bare string, which is what both routes passed — emits
 * `og:image` with no width or height, so a crawler must download and measure
 * the file before it can lay the card out. That is the reason a freshly-pasted
 * link so often previews blank on the first attempt and correctly on the
 * second. `imageSize()` reads the intrinsic size out of the file header at
 * build time, the same measurement the generators use, so the tags ship with
 * the answer already in them.
 */

/** Big enough for a large card; below this X falls back to the small one. */
const MIN_W = 600
const MIN_H = 315

/* CHROME IS NOT CONTENT, and the size rule alone does not say so — the
   wordmark is 2048x512 and clears both floors comfortably, so without this a
   caller handed the logo would get the logo back and the whole change would
   have bought nothing on that route. `scripts/lib/social-image.mjs` refuses
   the same two directories for the same reason; the rule is stated in both
   halves because they are two runtimes, and `lib/social.test.ts` asserts they
   still agree. */
const NOT_CONTENT = /^\/(?:brand|icons)\//i

/* The neutral publisher card, and the only image path written down here.
   Kept in step with `scripts/lib/social-image.mjs`'s FALLBACK by
   `lib/social.test.ts`, so the two halves of the site cannot drift apart. */
export const FALLBACK_CARD = {
  src: '/images/og/og-default.png',
  alt: 'Swechha',
  width: 1200,
  height: 630,
} as const

/**
 * The `openGraph`/`twitter` half of a page's metadata, built around the image
 * that represents that page. Pass the page's hero; pass nothing and the
 * neutral publisher card stands in, which is the honest answer for a route
 * with no photograph of its own (`/explore` today).
 *
 * `type` defaults to `'website'` and is `'article'` for a story — the same
 * split `data/seo/pages.json`'s `ogType` makes for the built pages.
 */
export function shareCard(
  image?: { src: string; alt: string } | null,
  { type = 'website' as 'website' | 'article' } = {},
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const measured = image ? imageSize(image.src) : null
  /* A hero too small for a large card is NOT used: a 400px-wide frame stretched
     across a 1.91:1 card is worse than the brand card, and X would drop to the
     small layout anyway. Unmeasurable (a missing or unreadable file) is treated
     the same way — a card pointing at nothing previews as no card at all. */
  const usable =
    image
    && !NOT_CONTENT.test(image.src)
    && measured
    && measured.width >= MIN_W
    && measured.height >= MIN_H
      ? { src: image.src, alt: image.alt, ...measured }
      : FALLBACK_CARD

  const card = {
    url: usable.src,
    width: usable.width,
    height: usable.height,
    alt: usable.alt,
  }

  return {
    /* THE WHOLE OBJECT, EVERY TIME — see the merge note above. */
    openGraph: {
      type,
      siteName: 'Swechha',
      locale: 'en_IN',
      images: [card],
    },
    /* Stated rather than left to inherit. Next does fall `twitter:image` back
       to `openGraph.images` when `twitter.images` is unset — measured against
       the running dev server on /explore — but that is a resolver behaviour,
       not a contract, and this pair is the one thing on the page that must not
       quietly diverge. */
    twitter: {
      card: 'summary_large_image',
      images: [card],
    },
  }
}
