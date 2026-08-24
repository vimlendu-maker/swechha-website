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

         THE ALLOW-LIST IS THE AUDIT'S OWN INVENTORY, not a guess: every
         external subresource on the live site is a `youtube-nocookie.com`
         embed (8), a `fonts.googleapis.com` stylesheet, or a
         `fonts.gstatic.com` font file. There is no analytics, no tag manager
         and no CDN script. If one is added, it is added here too — which is
         the point of having the header at all. */
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
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              'frame-src https://www.youtube-nocookie.com',
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
      {
        source: '/_pages/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
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
