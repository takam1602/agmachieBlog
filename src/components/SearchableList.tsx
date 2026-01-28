'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

// Updated to accept more data if available, but keeping it compatible
type Entry = { href: string; label: string; date?: string; excerpt?: string }

export default function SearchableList({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState('')

  const filtered = entries.filter((e) =>
    e.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-8 group max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500 group-focus-within:text-[var(--accent)] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 pl-10 text-base rounded-full bg-[#1a1a1a] text-white border border-[#333] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all"
        />
      </div>

      {/* Grid Layout (Compact Tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="group flex flex-col bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden hover:border-[var(--accent)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-[var(--accent)]/5 h-full"
          >
            {/* Card Content - Title Focused */}
            <div className="p-4 flex flex-col h-full justify-between min-h-[100px]">
              <h3 className="text-sm md:text-base font-bold text-gray-200 group-hover:text-[var(--accent)] transition-colors line-clamp-3 mb-2 leading-snug">
                {e.label}
              </h3>
              
              {/* Optional: Minimal Date */}
              {e.date && (
                 <div className="pt-2 border-t border-[#2a2a2a] mt-auto">
                    <span className="text-[10px] text-gray-600 font-mono group-hover:text-gray-500 transition-colors">
                        {e.date}
                    </span>
                 </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-[#333]">
          <p>No articles found matching your search.</p>
        </div>
      )}
    </div>
  )
}
