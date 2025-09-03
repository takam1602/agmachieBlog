
'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MarkdownImage from '@/components/MarkdownImage'

type Props = {
  /** Markdown 本文 */
  source: string
  /** 相対リンク補正用のディレクトリ URL（末尾スラッシュあり） */
  dirUrl: string
}

type Heading = { text: string; id: string }

/** 簡易 slugify（日本語はそのまま、半角英数は小文字＆ハイフン） */
function slugify(input: string): string {
  const base = input.trim()
  const ascii = base
    .normalize('NFKD')
    .replace(/[A-Z]/g, (m) => m.toLowerCase())
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^a-z0-9\-_.\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu, '')
  return encodeURIComponent(ascii || base)
}

/** Markdown 文字列から `# 見出し` だけ抽出（`##` 以下は無視） */
function extractH1(content: string): Heading[] {
  const h1s: Heading[] = []
  const re = /^#\s+(.+?)\s*$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const text = m[1]
    h1s.push({ text, id: slugify(text) })
  }
  return h1s
}

/** React children → テキスト（h1 の id 付与用） */
function toText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(toText).join('')
  }
  if (
    React.isValidElement<{ children?: React.ReactNode }>(children) &&
    children.props &&
    'children' in children.props
  ) {
    return toText(children.props.children)
  }
  return ''
}

export default function DocInteractive({ source, dirUrl }: Props) {
  const headings = useMemo(() => extractH1(source), [source])

  return (
    <div className="prose mx-auto px-4 py-8">
      {/* 上部コントロール（Home / 検索 / TOC） */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between gap-3">
          {/* ← Home */}
          <Link
            href="/"
            className="px-3 py-1 rounded border border-[#333] hover:bg-[#0b0b0b]"
          >
            ← Home
          </Link>

          {/* ページ内検索 */}
          <InPageSearch articleSelector="#md-article" />
        </div>

        {/* TOC（# 見出しのみ） */}
        {headings.length > 0 && (
          <nav
            aria-label="Table of contents"
            className="flex flex-wrap items-center gap-3 p-3 rounded border border-[#222] bg-[#0a0a0a]"
          >
            <span className="text-sm opacity-80">TOC:</span>
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className="text-[var(--link)] hover:text-[var(--link-hover)] text-sm underline-offset-2"
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* 本文（元の挙動を踏襲：画像→MarkdownImage／リンク補正／画像リンク素通し） */}
      <article id="md-article">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            /* 画像 → MarkdownImage */
            img({ src, alt }) {
              if (typeof src !== 'string') return null
              return <MarkdownImage src={src} alt={alt} />
            },

            /* h1 のみ id を自動付与（TOC のリンク先） */
            h1({ children, ...rest }) {
              const text = toText(children)
              const id = slugify(text)
              return (
                <h1 id={id} {...rest}>
                  {children}
                </h1>
              )
            },

            /* <a> の描画（元の仕様を完全踏襲） */
            a(props) {
              const { href, children, className, title } =
                props as React.DetailedHTMLProps<
                  React.AnchorHTMLAttributes<HTMLAnchorElement>,
                  HTMLAnchorElement
                >
              const url = typeof href === 'string' ? href : ''

              // 子に画像（<img> or <MarkdownImage>）が含まれるときは素通し
              const hasImgChild = React.Children.toArray(children).some(
                (c) =>
                  React.isValidElement(c) &&
                  (c.type === 'img' || c.type === (MarkdownImage as unknown))
              )
              if (hasImgChild) return <>{children}</>

              // 外部リンクは新規タブ
              if (/^https?:\/\//.test(url)) {
                return (
                  <a href={url} target="_blank" rel="noopener noreferrer" className={className} title={title}>
                    {children}
                  </a>
                )
              }

              // 相対リンク補正（./ → 現在ディレクトリ、その他は dirUrl 起点）
              const fixed = url.startsWith('./')
                ? dirUrl + url.slice(2)
                : url.startsWith('/')
                ? url
                : dirUrl + url

              return (
                <Link href={fixed} className={`text-blue-600 underline ${className ?? ''}`} title={title}>
                  {children}
                </Link>
              )
            },
          }}
        >
          {source}
        </ReactMarkdown>
      </article>
    </div>
  )
}

/* ページ内検索（型安全版） */
function InPageSearch({ articleSelector }: { articleSelector: string }) {
  const [q, setQ] = React.useState('')
  const [idx, setIdx] = React.useState(0)
  const totalRef = React.useRef(0)
  const activeRef = React.useRef<HTMLElement | null>(null)

  const clearHighlights = React.useCallback(() => {
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
  }, [articleSelector])

  React.useEffect(() => {
    clearHighlights()
    const query = q.trim()
    if (!query) return
    const root = document.querySelector(articleSelector)
    if (!root) return

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const matches: HTMLElement[] = []
    const qLower = query.toLowerCase()

    let n: Node | null
    while ((n = walker.nextNode())) {
      const text = n as Text
      if (!text.data || !text.data.trim()) continue
      let start = 0
      // 同一テキストノード内の複数ヒットを順にマーキング
      // surroundContents によりノードが分割されるため、nextSibling をたどって進む
      // eslint-disable-next-line no-constant-condition
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
          // TreeWalker の現在位置を次のテキストノードへ
          walker.currentNode = after as Node
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
  }, [q, articleSelector, clearHighlights])

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
