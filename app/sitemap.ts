import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { MetadataRoute } from 'next'
import { SITE_URL as BASE } from '@/lib/org'
import { designRoutes } from '@/design-routes'

/* DERIVED, NOT RESTATED. A hand-kept list here once advertised `/explore` and
   `/search` — the pre-design scaffold, with nothing published — and three demo
   stories, while omitting `/farm`, all six `/now/<slug>` situations and every
   WORK item page. So the map pointed crawlers at the placeholders and hid the
   finished site. `designRoutes()` is the router's own list, gated by the build
   check that fails when a route has no built file, so a page cannot be served
   and left unmapped. Do not replace it with a list.

   TWO ROUTES ARE DELIBERATELY ABSENT: `/explore` and, as of Task 9, `/search`.
   `/explore` never appears in `designRoutes()`'s own map, so there is nothing
   to filter — it is excluded at the source. `/search` is not: it is built and
   routed, so it reaches this file by default and has to be filtered out here.
   The note that used to stand in this spot argued FOR including `/search`,
   on the grounds that it was finished and shipped rather than held back —
   true when it was written, and beside the point now: `/search` carries its
   own `<meta name="robots" content="noindex, follow">` (Task 9,
   `scripts/build-search-page.mjs` — a site-search UI is a duplicate-content
   surface over pages already indexed at their own canonical URLs), and a
   sitemap that lists a URL its own `<head>` tells crawlers not to index is a
   contradictory instruction, not a completeness gap. `follow` on that meta is
   what keeps `/search` a live crawl path into every URL below even though it
   is not one of them itself.

   `lastModified` IS READ FROM `data/seo/lastmod.json`, keyed by `source`,
   never typed and never stat'd. File mtime was this file's previous answer
   and it shipped every one of the 35 URLs claiming the same modification
   instant — a 19-second window, measured — because the generators rewrite
   every file on every run and CI checks out fresh; a sitemap where every page
   changed at the same instant is a sitemap a crawler learns to discount.
   `scripts/lib/lastmod.mjs`'s `stampLastmod()` maintains that register: it
   hashes each page's content as it is written, right before the write, and
   only moves the stored date when the hash actually changed — so the date
   here is a fact about the page, not a build artefact. A route absent from
   the register is emitted WITHOUT a date rather than with today's, same as
   before: an invented freshness claim is worse than none, and
   `designRoutes()` has already failed the build if the underlying file is
   missing. */
const EXCLUDED_FROM_SITEMAP = new Set(['/search'])

export default function sitemap(): MetadataRoute.Sitemap {
  const lastmod: Record<string, { hash: string; date: string }> = JSON.parse(
    readFileSync(join(process.cwd(), 'data/seo/lastmod.json'), 'utf8'),
  )
  return designRoutes()
    .filter(({ source }) => !EXCLUDED_FROM_SITEMAP.has(source))
    .map(({ source }) => {
      const date = lastmod[source]?.date
      return {
        url: source === '/' ? BASE : `${BASE}${source}`,
        ...(date ? { lastModified: new Date(date) } : {}),
      }
    })
}
