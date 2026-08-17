'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SearchDoc } from '@/lib/search'

export function SearchClient({ index }: { index: SearchDoc[] }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const results = q === ''
    ? []
    : index.filter((doc) => doc.title.toLowerCase().includes(q) || doc.summary.toLowerCase().includes(q))

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stories, campaigns and more"
        aria-label="Search"
        className="w-full border border-rule bg-surface px-4 py-3 text-lg"
      />
      {q !== '' && (
        <p className="mt-4 text-sm text-ink-muted">
          {results.length} result{results.length === 1 ? '' : 's'}
        </p>
      )}
      <ul className="mt-4 flex flex-col gap-4">
        {results.map((doc) => (
          <li key={`${doc.type}/${doc.slug}`} className="border-b border-rule pb-4">
            <Link href={doc.href} className="font-display text-xl hover:text-teal-ink">
              {doc.title}
            </Link>
            <p className="mt-1 text-sm text-ink-muted">{doc.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
