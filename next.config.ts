import type { NextConfig } from 'next'
import { legacyRedirects } from './redirects'

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects
  },
}

export default nextConfig
