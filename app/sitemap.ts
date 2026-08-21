import type { MetadataRoute } from 'next'
import { getAllStories, getAllCampaigns } from '@/lib/content'
import { SITE_URL as BASE } from '@/lib/org'
/* Listed paths must be pages that return 200. `campaigns` used to be here; it
   now 308-redirects to `work/campaigns` (see redirects.ts), and a sitemap that
   advertises a redirect wastes crawl budget and looks like a stale map. */
const STATIC_PAGES = [
  'now',
  'explore',
  'work',
  'work/campaigns',
  'impact',
  'act',
  'about',
  'search',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getAllStories().map((story) => ({
    url: `${BASE}/stories/${story.slug}`,
    lastModified: story.data.date,
  }))
  const campaigns = getAllCampaigns().map((c) => ({
    url: `${BASE}/work/campaigns/${c.slug}`,
  }))

  return [
    { url: BASE },
    { url: `${BASE}/stories` },
    ...STATIC_PAGES.map((p) => ({ url: `${BASE}/${p}` })),
    ...stories,
    ...campaigns,
  ]
}
