import { statSync } from 'node:fs'
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

   WHAT IS DELIBERATELY ABSENT, and it is one route: `/explore`. It is the last
   pre-design scaffold route and it is reachable in production. A sitemap is a
   claim that a URL is worth indexing, and that one is not. `/search` and
   `/stories` ARE here — both are built and both are routed; the comment that
   used to stand here said they were held back, which stopped being true when
   they shipped, and a comment describing a policy the code no longer follows
   is how the next session makes a wrong change confidently (AD-27.52).

   `lastModified` IS READ FROM THE BUILT FILE'S MTIME, never typed. A date a
   human maintains is a date that is wrong, and a sitemap that claims every
   page changed today is a sitemap a crawler learns to discount. The route
   layer already knows which file answers which URL, so this is a stat, not a
   second register. A file that cannot be stat'd is emitted WITHOUT a date
   rather than with today's: an invented freshness claim is worse than none,
   and `designRoutes()` has already failed the build if the file is missing. */
export default function sitemap(): MetadataRoute.Sitemap {
  return designRoutes().map(({ source, destination }) => {
    let lastModified: Date | undefined
    try {
      lastModified = statSync(join(process.cwd(), 'public', destination)).mtime
    } catch {
      lastModified = undefined
    }
    return {
      url: source === '/' ? BASE : `${BASE}${source}`,
      ...(lastModified ? { lastModified } : {}),
    }
  })
}
