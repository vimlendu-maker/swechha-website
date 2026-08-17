import type { Metadata } from 'next'
import { SearchClient } from '@/components/search-client'
import { getSearchIndex } from '@/lib/search'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Swechha stories, campaigns and more.',
}

export default function SearchPage() {
  const index = getSearchIndex()

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1>Search</h1>
      <div className="mt-8">
        <SearchClient index={index} />
      </div>
    </main>
  )
}
