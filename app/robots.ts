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
    /* NO Disallow FOR THE PATHS THAT CARRY `X-Robots-Tag: noindex`.
       A crawler blocked by robots.txt never fetches the URL, so it never sees
       the noindex header — and if anything links to it, Google indexes the bare
       URL anyway ("Indexed, though blocked by robots.txt", Search Console,
       2026-10-26). `/_pages/`, `/keystatic` and `/api/` are therefore left
       crawlable here and kept out of the index by the header in
       `next.config.ts` instead. Re-adding a Disallow for any of them
       re-creates that report. */
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
