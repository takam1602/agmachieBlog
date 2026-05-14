'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

// Updated to accept more data if available, but keeping it compatible
type Entry = { href: string; label: string; date?: string; excerpt?: string; category?: string }

export default function SearchableList({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = normalizedQuery
    ? entries.filter((e) =>
        [e.label, e.excerpt, e.date, e.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : []

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-8 group max-w-4xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search size={24} className="text-gray-500 group-focus-within:text-[var(--accent)] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="記事タイトル・本文・カテゴリを検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border border-[#333] bg-[#1a1a1a] p-5 pl-14 text-lg text-white outline-none transition-all placeholder:text-gray-600 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      {!normalizedQuery && (
        <p className="text-center text-sm text-gray-500">
          検索語を入力すると、ヒットした記事だけがここに表示されます。
        </p>
      )}

      {normalizedQuery && (
        <p className="mb-4 text-center text-sm text-gray-500">
          {filtered.length}件ヒット
        </p>
      )}

      {/* Grid Layout (Compact Tiles) */}
      {normalizedQuery && (
        <div className="home-tile-grid">
          {filtered.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#333] bg-[#1a1a1a] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md hover:shadow-[var(--accent)]/5"
            >
              {/* Card Content - Title Focused */}
              <div className="flex h-full min-h-[150px] flex-col p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  {e.category && (
                    <span className="rounded-full bg-[#222] px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                      {e.category}
                    </span>
                  )}
                  {e.date && (
                    <span className="ml-auto text-[10px] font-mono text-gray-600 transition-colors group-hover:text-gray-500">
                        {e.date}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 line-clamp-3 text-sm font-bold leading-snug text-gray-200 transition-colors group-hover:text-[var(--accent)] md:text-base">
                  {e.label}
                </h3>
                {e.excerpt && <p className="mt-auto line-clamp-3 text-xs leading-relaxed text-gray-500">{e.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {normalizedQuery && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-[#333]">
          <p>該当する記事はありません。</p>
        </div>
      )}
    </div>
  )
}
