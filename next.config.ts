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
      {
        source: '/_pages/:path*',
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
