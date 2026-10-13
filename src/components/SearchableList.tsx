'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, X } from 'lucide-react'

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

const categoryLabels: Record<string, string> = {
  ag: '農業機械',
  blog: 'ブログ',
  autoDownloadMachineFinder: '機械データ',
}

const getCategoryLabel = (category: string) => categoryLabels[category] ?? category

const stopWords = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'has', 'was', 'were',
  'です', 'ます', 'これ', 'それ', 'ため', 'こと', 'もの', 'よう',
])

const synonymGroups = [
  ['スガノ', 'すがの', '菅野', '菅の', 'sugano', 'sugano農機', 'スガノ農機', '菅野農機'],
  ['小西', 'こにし', 'コニシ', 'konishi', '小西農機'],
  ['開発工建', 'かいはつこうけん', 'カイハツコウケン', '開発', 'kaihatsu'],
  ['北海道開発局', '開発局', '北海道開発', 'ほっかいどうかいはつきょく'],
  ['モロオカ', '諸岡', 'もろおか', 'morooka'],
  ['東洋運搬機', 'tcm', 'TCM', 'とうよううんぱんき'],
  ['ジョンディア', 'ジョン Deere', 'john deere', 'deere', 'jd', 'ディア'],
  ['キャタピラー', 'カタピラー', 'caterpillar', 'cat', 'challenger', 'チャレンジャー'],
  ['クラース', 'クラス', 'claas'],
  ['プラウ', 'プラオ', 'plow', 'plough'],
  ['サブソイラ', 'サブソイラー', 'subsoiler'],
  ['レベラー', 'レベラ', 'leveler', 'leveller', 'land leveler'],
  ['ランドハロー', 'land harrow', 'ハロー', 'harrow'],
  ['コンバイン', 'combine', 'harvester', 'ハーベスタ', 'ハーベスター'],
  ['トラクタ', 'トラクター', 'tractor'],
]

const synonymLookup = new Map<string, string[]>()

function kanaToHiragana(text: string) {
  return text.replace(/[ァ-ン]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
}

function compactText(text: string) {
  return kanaToHiragana(normalizeText(text)).replace(/[\s\-_/ーｰ・.]/g, '')
}

function getSynonymLookup() {
  if (synonymLookup.size) return synonymLookup

  for (const group of synonymGroups) {
    const variants = Array.from(new Set(group.flatMap((term) => [normalizeText(term), kanaToHiragana(normalizeText(term)), compactText(term)])))
      .filter(Boolean)

    for (const variant of variants) {
      synonymLookup.set(variant, variants)
    }
  }

  return synonymLookup
}

function expandSynonyms(text: string) {
  const normalized = normalizeText(text)
  const haystacks = new Set([normalized, kanaToHiragana(normalized), compactText(normalized)])
  const expanded = new Set<string>()

  for (const haystack of haystacks) {
    for (const [variant, group] of getSynonymLookup()) {
      if (haystack.includes(variant)) {
        group.forEach((term) => expanded.add(term))
      }
    }
  }

  return Array.from(expanded).join(' ')
}

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
  const normalizedWithSynonyms = `${normalized} ${expandSynonyms(normalized)}`
  const tokens = new Map<string, number>()

  for (const phrase of [normalizedWithSynonyms, kanaToHiragana(normalizedWithSynonyms), compactText(normalizedWithSynonyms)]) {
    for (const word of phrase.match(/[a-z0-9][a-z0-9-]{1,}/g) ?? []) {
      addToken(tokens, word, baseWeight)
    }

    for (const word of phrase.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]{2,}/gu) ?? []) {
      addToken(tokens, word, baseWeight * 1.3)
      for (let i = 0; i < word.length - 1; i += 1) {
        addToken(tokens, word.slice(i, i + 2), baseWeight)
      }
      for (let i = 0; i < word.length - 2; i += 1) {
        addToken(tokens, word.slice(i, i + 3), baseWeight * 0.8)
      }
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
    const normalizedText = normalizeText(`${entry.label} ${entry.excerpt ?? ''} ${entry.category ?? ''} ${entry.searchText ?? ''}`)
    return {
      entry,
      vector,
      norm: vectorNorm(vector),
      normalizedText: `${normalizedText} ${kanaToHiragana(normalizedText)} ${compactText(normalizedText)} ${expandSynonyms(normalizedText)}`,
    }
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
  const normalizedQuery = normalizeText(query)
  return {
    vector,
    norm: vectorNorm(vector),
    normalizedQuery: `${normalizedQuery} ${kanaToHiragana(normalizedQuery)} ${compactText(normalizedQuery)} ${expandSynonyms(normalizedQuery)}`,
  }
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
  const [category, setCategory] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const normalizedQuery = query.trim().toLowerCase()
  const searchIndex = useMemo(() => buildSearchIndex(entries), [entries])
  const categories = useMemo(() => (
    Array.from(new Set(entries.map((entry) => entry.category).filter(Boolean) as string[]))
      .sort((a, b) => a.localeCompare(b, 'ja'))
  ), [entries])
  const filtered = useMemo(() => {
    const candidates = normalizedQuery
      ? searchSimilar(entries, query, searchIndex)
      : entries.map((entry) => ({ ...entry, score: 0 }))

    return candidates
      .filter((entry) => !category || entry.category === category)
      .slice(0, 24)
  }, [category, entries, normalizedQuery, query, searchIndex])
  const isSearching = Boolean(normalizedQuery || category)

  useEffect(() => {
    const focusFromShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]')
      if (event.key === '/' && !isTyping) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    if (window.location.hash === '#search') {
      window.setTimeout(() => inputRef.current?.focus(), 350)
    }
    window.addEventListener('keydown', focusFromShortcut)
    return () => window.removeEventListener('keydown', focusFromShortcut)
  }, [])

  const reset = () => {
    setQuery('')
    setCategory('')
    inputRef.current?.focus()
  }

  return (
    <div className="w-full">
      <div className="relative group max-w-4xl mx-auto">
        <div className="repository-search-icon absolute inset-y-0 left-0 flex items-center pointer-events-none">
          <Search size={22} className="text-ink-3 group-focus-within:text-brand-text" />
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          aria-label="リポジトリ内を検索"
          placeholder="機械名・メーカー・国などで検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="repository-search-input w-full border-2 border-line-strong bg-surface text-ink outline-none transition-colors focus:border-brand"
        />
        {(query || category) && (
          <button
            type="button"
            onClick={reset}
            aria-label="検索条件をクリア"
            className="absolute inset-y-0 right-3 my-auto flex h-9 w-9 items-center justify-center text-ink-3 transition-colors hover:bg-band hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-2" aria-label="カテゴリで絞り込み">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory((current) => current === item ? '' : item)}
            className={category === item
              ? 'border border-brand bg-brand px-3 py-1.5 text-sm font-bold text-on-brand transition-colors'
              : 'border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-brand hover:text-brand-text'
            }
          >
            {getCategoryLabel(item)}
          </button>
        ))}
      </div>

      {!isSearching && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-ink-3">
          <span>検索例:</span>
          {['トラクター', 'コンバイン', '北海道開発'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion)
                inputRef.current?.focus()
              }}
              className="px-1.5 py-1 font-bold text-brand-text underline underline-offset-4 hover:text-brand-hover"
            >
              {suggestion}
            </button>
          ))}
          <span className="hidden sm:inline">・ / キーで入力欄へ</span>
        </div>
      )}

      {isSearching && (
        <p className="mb-4 mt-7 text-center text-sm text-ink-2" aria-live="polite">
          <span className="font-bold text-ink">{filtered.length}</span> 件を表示
          {category && <span> ・ {getCategoryLabel(category)}</span>}
        </p>
      )}

      {isSearching && (
        <div className="home-tile-grid">
          {filtered.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group flex h-full flex-col overflow-hidden border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-ink"
            >
              <div className="flex h-full min-h-[160px] flex-col p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  {entry.category && (
                    <span className="bg-band px-2 py-0.5 text-[11px] text-ink-2">
                      {getCategoryLabel(entry.category)}
                    </span>
                  )}
                  {entry.date && (
                    <span className="ml-auto text-xs text-ink-3">
                      {entry.date}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 line-clamp-3 text-base font-bold leading-snug text-ink group-hover:text-brand-text group-hover:underline">
                  {entry.label}
                </h3>
                {entry.excerpt && <p className="mt-auto line-clamp-3 text-sm leading-6 text-ink-2">{entry.excerpt}</p>}
                <span className="link-more mt-3 text-sm">
                  記事を読む <ChevronRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isSearching && filtered.length === 0 && (
        <div className="border border-dashed border-line-strong bg-surface py-14 text-center text-ink-3">
          <p className="font-bold text-ink">該当する記事は見つかりませんでした。</p>
          <p className="mt-2 text-sm">表記を短くするか、カテゴリを外してお試しください。</p>
          <button type="button" onClick={reset} className="mt-5 text-sm font-bold text-brand-text underline underline-offset-4">
            検索条件をクリア
          </button>
        </div>
      )}
    </div>
  )
}
