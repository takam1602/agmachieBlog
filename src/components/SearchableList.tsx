'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

// Updated to accept more data if available, but keeping it compatible
type Entry = {
  href: string
  label: string
  date?: string
  excerpt?: string
  category?: string
  searchText?: string
}

type SearchResult = Entry & { score: number }

const stopWords = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'has', 'was', 'were',
  'です', 'ます', 'これ', 'それ', 'ため', 'こと', 'もの', 'よう',
])

function normalizeText(text: string) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~、。・「」『』（）【】［］]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function addToken(tokens: Map<string, number>, token: string, weight = 1) {
  if (token.length < 2 || stopWords.has(token)) return
  tokens.set(token, (tokens.get(token) ?? 0) + weight)
}

function tokenize(text: string, baseWeight = 1) {
  const normalized = normalizeText(text)
  const tokens = new Map<string, number>()

  for (const word of normalized.match(/[a-z0-9][a-z0-9-]{1,}/g) ?? []) {
    addToken(tokens, word, baseWeight)
  }

  for (const word of normalized.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]{2,}/gu) ?? []) {
    addToken(tokens, word, baseWeight * 1.3)
    for (let i = 0; i < word.length - 1; i += 1) {
      addToken(tokens, word.slice(i, i + 2), baseWeight)
    }
    for (let i = 0; i < word.length - 2; i += 1) {
      addToken(tokens, word.slice(i, i + 3), baseWeight * 0.8)
    }
  }

  return tokens
}

function mergeTokens(target: Map<string, number>, source: Map<string, number>) {
  source.forEach((value, key) => {
    target.set(key, (target.get(key) ?? 0) + value)
  })
}

function vectorNorm(vector: Map<string, number>) {
  let sum = 0
  vector.forEach((value) => {
    sum += value * value
  })
  return Math.sqrt(sum) || 1
}

function buildSearchIndex(entries: Entry[]) {
  const docs = entries.map((entry) => {
    const tokens = new Map<string, number>()
    mergeTokens(tokens, tokenize(entry.label, 4))
    mergeTokens(tokens, tokenize(entry.category ?? '', 2.5))
    mergeTokens(tokens, tokenize(entry.excerpt ?? '', 2))
    mergeTokens(tokens, tokenize(entry.searchText ?? '', 1))
    return { entry, tokens }
  })

  const docFreq = new Map<string, number>()
  docs.forEach(({ tokens }) => {
    tokens.forEach((_, token) => {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1)
    })
  })

  const totalDocs = Math.max(1, docs.length)
  const indexedDocs = docs.map(({ entry, tokens }) => {
    const vector = new Map<string, number>()
    tokens.forEach((tf, token) => {
      const idf = Math.log(1 + totalDocs / (1 + (docFreq.get(token) ?? 0)))
      vector.set(token, (1 + Math.log(tf)) * idf)
    })
    return { entry, vector, norm: vectorNorm(vector), normalizedText: normalizeText(`${entry.label} ${entry.excerpt ?? ''} ${entry.category ?? ''}`) }
  })

  return { indexedDocs, docFreq, totalDocs }
}

function vectorizeQuery(query: string, docFreq: Map<string, number>, totalDocs: number) {
  const queryTokens = tokenize(query, 1)
  const vector = new Map<string, number>()
  queryTokens.forEach((tf, token) => {
    const idf = Math.log(1 + totalDocs / (1 + (docFreq.get(token) ?? 0)))
    vector.set(token, (1 + Math.log(tf)) * idf)
  })
  return { vector, norm: vectorNorm(vector), normalizedQuery: normalizeText(query) }
}

function searchSimilar(entries: Entry[], query: string, index: ReturnType<typeof buildSearchIndex>): SearchResult[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const { vector, norm, normalizedQuery } = vectorizeQuery(trimmed, index.docFreq, index.totalDocs)
  if (vector.size === 0) return []

  return index.indexedDocs
    .map(({ entry, vector: docVector, norm: docNorm, normalizedText }) => {
      let dot = 0
      vector.forEach((queryValue, token) => {
        dot += queryValue * (docVector.get(token) ?? 0)
      })

      const exactBonus = normalizedText.includes(normalizedQuery) ? 0.18 : 0
      return { ...entry, score: dot / (norm * docNorm) + exactBonus }
    })
    .filter((entry) => entry.score > 0.015)
    .sort((a, b) => b.score - a.score || ((a.date ?? '') < (b.date ?? '') ? 1 : -1))
    .slice(0, 24)
}

export default function SearchableList({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const searchIndex = useMemo(() => buildSearchIndex(entries), [entries])
  const filtered = useMemo(
    () => searchSimilar(entries, query, searchIndex),
    [entries, query, searchIndex],
  )

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-8 group max-w-4xl mx-auto">
        <div className="repository-search-icon absolute inset-y-0 left-0 flex items-center pointer-events-none">
          <Search size={32} className="text-gray-500 group-focus-within:text-[var(--accent)] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="記事タイトル・本文・カテゴリを検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="repository-search-input w-full rounded-2xl border border-[#333] bg-[#1a1a1a] text-white outline-none transition-all placeholder:text-gray-500 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
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
                <span className="mt-3 text-[10px] font-mono text-gray-600">
                  similarity {(Math.min(0.99, e.score) * 100).toFixed(0)}%
                </span>
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
