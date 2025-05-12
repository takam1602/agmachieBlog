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
    <div className="max-w-3xl mx-auto px-4 py-10">
      <input
        type="text"
        placeholder="検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-6 p-2 rounded bg-[#1a1a1a] text-white border border-[#444]"
      />
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((e) => (
          <li key={e.href} className="border border-[#333] p-4 rounded hover:border-green-500">
            <Link href={e.href} className="text-green-400 hover:underline">
              {e.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
