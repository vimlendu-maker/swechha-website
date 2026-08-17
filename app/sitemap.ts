import type { MetadataRoute } from 'next'
import { getAllStories } from '@/lib/content'

const BASE = 'https://swechha.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getAllStories().map((story) => ({
    url: `${BASE}/stories/${story.slug}`,
    lastModified: story.data.date,
  }))

  return [
    { url: BASE },
    { url: `${BASE}/stories` },
    ...stories,
  ]
}
