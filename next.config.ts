import type { NextConfig } from 'next'
import { legacyRedirects, movedRedirects } from './redirects'
import { designRoutes } from './design-routes'

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
}

export default nextConfig
