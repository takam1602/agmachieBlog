'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  /** 検索対象の記事コンテナ。例: "#md-article" */
  articleSelector: string
}

export default function InPageSearch({ articleSelector }: Props) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const totalRef = useRef(0)
  const activeRef = useRef<HTMLElement | null>(null)

  const clearHighlights = () => {
    const root = document.querySelector(articleSelector)
    if (!root) return
    root.querySelectorAll('mark[data-hl]').forEach((m) => {
      const mark = m as HTMLElement
      mark.classList.remove('ring-2', 'ring-cyan-400')
      const parent = mark.parentNode
      if (!parent) return
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
      parent.removeChild(mark)
    })
    totalRef.current = 0
    activeRef.current = null
  }

  useEffect(() => {
    clearHighlights()
    const query = q.trim()
    if (!query) return
    const root = document.querySelector(articleSelector)
    if (!root) return

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const matches: HTMLElement[] = []
    const qLower = query.toLowerCase()

    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = node as Text
      if (!text.data || !text.data.trim()) continue
      let start = 0
      while (true) {
        const raw = text.data
        const i = raw.toLowerCase().indexOf(qLower, start)
        if (i === -1) break
        const r = document.createRange()
        r.setStart(text, i)
        r.setEnd(text, i + query.length)
        const mark = document.createElement('mark')
        mark.setAttribute('data-hl', '')
        mark.className = 'bg-yellow-500/20 outline outline-1 outline-yellow-500 rounded-sm'
        r.surroundContents(mark)
        matches.push(mark)
        const after = mark.nextSibling
        if (after && after.nodeType === Node.TEXT_NODE) {
          // 次は後続テキストを対象に
          // @ts-ignore
          walker.currentNode = after
          start = 0
        } else {
          break
        }
      }
    }

    totalRef.current = matches.length
    setIdx(matches.length ? 1 : 0)

    if (matches.length) {
      const first = matches[0]
      first.classList.add('ring-2', 'ring-cyan-400')
      activeRef.current = first
      first.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return () => clearHighlights()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, articleSelector])

  const go = (dir: 1 | -1) => {
    const root = document.querySelector(articleSelector)
    if (!root || totalRef.current === 0) return
    const all = Array.from(root.querySelectorAll('mark[data-hl]')) as HTMLElement[]
    if (!all.length) return
    activeRef.current?.classList.remove('ring-2', 'ring-cyan-400')

    let next = idx + dir
    if (next < 1) next = all.length
    if (next > all.length) next = 1
    setIdx(next)

    const target = all[next - 1]
    target.classList.add('ring-2', 'ring-cyan-400')
    activeRef.current = target
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const info = useMemo(() => {
    const total = totalRef.current
    return total ? `${idx}/${total}` : '0/0'
  }, [idx])

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ページ内検索…"
        className="rounded border border-[#333] bg-[#0c0c0c] px-3 py-1 text-sm"
      />
      <button
        type="button"
        onClick={() => go(-1)}
        className="px-2 py-1 rounded border border-[#333] hover:bg-[#0b0b0b] text-sm"
      >
        Prev
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="px-2 py-1 rounded border border-[#333] hover:bg-[#0b0b0b] text-sm"
      >
        Next
      </button>
      <span className="opacity-70 text-xs">{info}</span>
    </div>
  )
}
