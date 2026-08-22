import type { MetadataRoute } from 'next'
import { SITE_URL, isIndexable } from '@/lib/org'

/* CLOSED BY DEFAULT. Until `SITE_INDEXABLE=true` is set, every deploy asks not
   to be indexed — because the first deploys are review builds on a host URL,
   and an indexed preview competes with the real domain and takes months to
   clear. The domain cutover sets the variable; nothing else has to change.
   `/_pages/` is disallowed unconditionally: it is where the built HTML lives
   for the rewrite layer to serve, and it must never be a second indexable URL
   for a page that already has a canonical route. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/_pages/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
