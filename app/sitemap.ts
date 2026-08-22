import type { MetadataRoute } from 'next'
import { SITE_URL as BASE } from '@/lib/org'
import { designRoutePaths } from '@/design-routes'

/* DERIVED, NOT RESTATED. The previous hand-kept list advertised `/explore` and
   `/search` — both still the pre-design scaffold with nothing published — and
   three demo stories, while omitting `/farm`, all six `/now/<slug>` situations
   and every WORK item page. So the map pointed crawlers at the placeholders and
   hid the finished site. `designRoutePaths()` is the router's own list, gated by
   the same build check that fails when a route has no built file, so a page
   cannot be served and left unmapped.
   Unfinished routes (`/explore`, `/search`, `/stories`) are deliberately absent
   until they are built: a sitemap is a claim that a URL is worth indexing. */
export default function sitemap(): MetadataRoute.Sitemap {
  return designRoutePaths().map((path) => ({
    url: path === '/' ? BASE : `${BASE}${path}`,
  }))
}
