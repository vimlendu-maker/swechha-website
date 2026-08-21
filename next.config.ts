import type { NextConfig } from 'next'
import { legacyRedirects, movedRedirects } from './redirects'

const nextConfig: NextConfig = {
  async redirects() {
    return [...movedRedirects, ...legacyRedirects]
  },
}

export default nextConfig
