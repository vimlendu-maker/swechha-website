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
    /* `/keystatic` joins `/_pages/` as disallowed unconditionally: it is the
       CMS login, it has no reader-facing content, and it should not be a search
       result telling the world where the editor is. `next.config.ts` sets the
       matching `X-Robots-Tag` for a crawler that already has the URL.
       `/api/` joins them (AD-27.52): the endpoints are not content, and
       `/api/air` returning a JSON blob into an index is noise. It is a
       crawl-budget instruction, not a security boundary — the routes stay
       reachable, and `/api/ward*` keeps its own no-store for its own reason. */
    rules: { userAgent: '*', allow: '/', disallow: ['/_pages/', '/keystatic', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
