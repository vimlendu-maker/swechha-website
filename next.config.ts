import type { NextConfig } from 'next'
import { legacyRedirects, movedRedirects } from './redirects'
import { designRoutes } from './design-routes'
import { isIndexable } from './lib/org'

const nextConfig: NextConfig = {
  async redirects() {
    return [...movedRedirects, ...legacyRedirects]
  },
  /**
   * `beforeFiles` is load-bearing, not a default. These routes have real app
   * pages behind them (`app/work/page.tsx`, `app/now/page.tsx`, `app/page.tsx`,
   * `app/about/page.tsx`) carrying the pre-design scaffold. `afterFiles` runs
   * only when nothing else matched, so the scaffold would keep winning and
   * `Work` would keep opening the old page — which is the bug being fixed.
   * `beforeFiles` runs ahead of the filesystem, so the finished page wins.
   *
   * See design-routes.ts for what this maps, what it deliberately leaves
   * alone, and why it is a bridge with a known expiry rather than the port.
   */
  async rewrites() {
    return { beforeFiles: designRoutes(), afterFiles: [], fallback: [] }
  },
  /**
   * A `robots.txt` is a request; `X-Robots-Tag` is the one a crawler that
   * already has the URL obeys. Both are needed, and both read `isIndexable()`
   * so they cannot disagree.
   *
   * `/_pages/*` is noindex ALWAYS, indexable deploy or not. Those files are the
   * built HTML the rewrite layer serves; every one of them also answers at a
   * canonical route, so indexing the raw path would be duplicate content at a
   * URL no reader should ever see. This is the guarantee that replaced deleting
   * `public/design/`.
   */
  /* ── THE OPTIMIZER'S OWN CACHE HEADER. ──────────────────────────────────────
     Measured on production, 24 August 2026, straight after the srcset pass went
     live: `/_next/image?...` came back `cache-control: public, max-age=0,
     must-revalidate`. That is not Next's own choice — it FORWARDS the upstream
     header, and Vercel serves everything in `public/` as
     `max-age=0, must-revalidate`. So every optimized photo was being
     revalidated on every navigation. The CDN answered `x-vercel-cache: HIT`, so
     each one was only a 304 rather than a re-download, but a 304 per image per
     page load is still a round-trip per image, and this page carries 42 of them.

     It does NOT affect any PageSpeed number: Lighthouse loads cold, with an
     empty cache, so it never saw the revalidation. This is purely for the
     second and subsequent visits of a real reader.

     ★ SEVEN DAYS, NOT THIRTY-ONE, AND THE REASON IS THIS REPO'S OWN HISTORY.
     minimumCacheTTL also bounds how long a REPLACED source photo keeps serving
     its old bytes, and photos here have been replaced in place before — the EXIF
     rotation fix rewrote seven files at their existing filenames. A month of
     staleness on a corrected photo is an editorial problem; a week is
     recoverable, and past a few minutes the user-visible benefit is flat
     anyway. The durable answer is the same rule the fonts follow: if you change
     what a file looks like, change its name. */
  images: {
    minimumCacheTTL: 604800,
  },

  async headers() {
    const always = [
      /* ── SECURITY HEADERS. None of these were set in production before
         23 August 2026; only HSTS was, which Vercel adds. Deliberately modest,
         because this site has no login, no session and no authenticated action
         — the realistic risks are a page being framed to dress up somebody
         else's ask for money, and content-type sniffing. Both are one header.

         THE CSP IS DELIBERATELY PERMISSIVE ABOUT INLINE CODE, and that is not
         laziness. The 40 finished pages are STATIC HTML built by `scripts/` and
         served through the `rewrites()` above; each one carries its own inline
         `<script>` (28KB on the homepage) and inline styles. A nonce has to be
         minted per request and written into the markup, which a static file
         served off the CDN cannot do — so `'unsafe-inline'` for scripts is a
         constraint of the architecture, not a choice, until the React port
         lands. What the policy still buys is real: no script may be loaded
         from a host that is not this one, `form-action` cannot be repointed at
         somebody else's collector, `object-src` is closed, and the page cannot
         be framed. `strict-dynamic` is NOT used because it would disable the
         host allow-list in supporting browsers while the inline blocks stay
         unsigned — worse than this, not better.

         THE ALLOW-LIST IS THE AUDIT'S OWN INVENTORY, not a guess. When this
         header was written that inventory was eight `youtube-nocookie.com`
         embeds, a `fonts.googleapis.com` stylesheet and `fonts.gstatic.com`
         font files. AS OF 24 AUGUST 2026 THE FONTS ARE SELF-HOSTED, so the
         inventory is the eight embeds and nothing else: no analytics, no tag
         manager, no CDN script, no webfont host. If one is added, it is added
         here too — which is the point of having the header at all. */
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          /* Send the full URL same-origin, bare origin cross-origin. The
             situation pages carry no query strings worth leaking, but a
             referrer is sent to every source link on them and those go to
             government hosts. */
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          /* Nothing on this site asks for any of these. */
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "form-action 'self'",
              /* ★ `'unsafe-eval'` IN DEVELOPMENT ONLY, AND NOT AS A CONVENIENCE.
                 React's development build calls `eval()` to reconstruct
                 callstacks across the server/client boundary, and says so in the
                 console when a CSP denies it. Measured while adding this header:
                 the dev overlay reported an issue on every page load. React
                 never calls `eval()` in a production build — its own message
                 states that — so allowing it in dev costs production nothing and
                 refusing it in dev costs the next person their stack traces.
                 `NODE_ENV` is set to 'development' by `next dev` and
                 'production' by `next build`, so this cannot leak into a
                 deploy. */
              process.env.NODE_ENV === 'development'
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              /* THE GOOGLE FONTS HOSTS ARE GONE FROM BOTH OF THESE, because the
                 fonts are served from this origin now. `fonts.googleapis.com`
                 was the site's only render-blocking request — Lighthouse put it
                 at 780 ms and estimated 2,580 ms of savings on mobile — and the
                 stylesheet had to arrive before the browser even learned which
                 font files to ask `fonts.gstatic.com` for. Six woff2 subsets
                 under public/fonts and an inline @font-face block on line 8 of
                 design/home.html remove the round-trip, the third party and the
                 IP disclosure to Google in one change. Put a host back here only
                 alongside a subresource that actually needs it. */
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              /* ★ `'self'` IN FRAME-SRC IN DEVELOPMENT ONLY, on the same reasoning
                 and the same guard as `'unsafe-eval'` above. Production frames
                 exactly one thing, a YouTube embed, and nothing else may be
                 framed. But a local before/after viewer — two versions of a page
                 side by side in real viewports, which is the only honest way to
                 review a responsive change — has to frame this origin, and the
                 production policy correctly refuses it. Adding 'self' in dev
                 costs production nothing: `next build` sets NODE_ENV to
                 'production', so the deployed policy is the one-line version
                 below. `frame-ancestors 'self'` already permits the same-origin
                 direction, so this is the matching half, not a loosening of what
                 may frame US. */
              process.env.NODE_ENV === 'development'
                ? "frame-src 'self' https://www.youtube-nocookie.com"
                : 'frame-src https://www.youtube-nocookie.com',
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
      {
        source: '/_pages/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      /* ── THE SELF-HOSTED FONTS MUST NOT REVALIDATE. ─────────────────────────
         Vercel serves files out of `public/` as `max-age=0, must-revalidate`,
         which is right for a photo that might be replaced and wrong for these:
         without this rule every navigation spends a conditional request per
         font before it may reuse bytes it already has, which is a slice of the
         round-trip that self-hosting was meant to remove.

         ★ THE PRICE IS THAT A FONT FILE IS NOW IMMUTABLE BY NAME. A year is a
         year — an edited woff2 at the same path reaches nobody who has already
         loaded it. Replacing a face means a NEW filename (…-v2.woff2) and the
         @font-face src on line 8 of design/home.html updated with it, which is
         also the only way all 35 pages pick it up, since they extract that line
         rather than carrying their own copy. */
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      /* The editor, ALWAYS noindex — indexable deploy or not. Today the blanket
         `/:path*` rule below happens to cover it, but that rule disappears the
         moment SITE_INDEXABLE=true, and an indexed /keystatic is a login screen
         in search results advertising where the CMS lives. */
      {
        source: '/keystatic/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/keystatic',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
    if (isIndexable()) return always
    return [
      ...always,
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
