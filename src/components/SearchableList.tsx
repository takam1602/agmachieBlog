'use client'
import { useState } from 'react'
import Link from 'next/link'

type Entry = { href: string; label: string }

export default function SearchableList({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState('')

  const filtered = entries.filter((e) =>
    e.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="記事を検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 pl-12 rounded-lg bg-[#1a1a1a] text-white border border-[#333] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all shadow-lg"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className="block h-full p-5 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#222] hover:border-[var(--accent)] hover:translate-y-[-2px] transition-all duration-200 group shadow-md"
            >
              <h3 className="text-lg font-medium text-gray-200 group-hover:text-[var(--accent)] transition-colors">
                {e.label}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Read article →
              </p>
            </Link>
          </li>
        ))}
      </ul>
      
      {filtered.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          記事が見つかりませんでした。
        </div>
      )}
    </div>
  )
}
