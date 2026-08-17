import type { MetadataRoute } from 'next'
import { getAllStories, getAllCampaigns } from '@/lib/content'

const BASE = 'https://swechha.in'
const STATIC_PAGES = ['now', 'explore', 'work', 'campaigns', 'impact', 'act', 'about', 'search']

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getAllStories().map((story) => ({
    url: `${BASE}/stories/${story.slug}`,
    lastModified: story.data.date,
  }))
  const campaigns = getAllCampaigns().map((c) => ({
    url: `${BASE}/campaigns/${c.slug}`,
  }))

  return [
    { url: BASE },
    { url: `${BASE}/stories` },
    ...STATIC_PAGES.map((p) => ({ url: `${BASE}/${p}` })),
    ...stories,
    ...campaigns,
  ]
}
