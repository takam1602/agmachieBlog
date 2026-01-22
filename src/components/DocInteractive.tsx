
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

type Heading = { text: string; id: string; level: number }

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

/** Markdown 文字列から #, ##, ### 見出しを抽出 */
function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const re = /^(#{1,3})\s+(.+?)\s*$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const level = m[1].length
    const text = m[2]
    headings.push({ text, id: slugify(text), level })
  }
  return headings
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
  const headings = useMemo(() => extractHeadings(source), [source])

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
      
      {/* メインコンテンツ */}
      <div className="min-w-0">
         {/* 上部ナビゲーション (Mobile用) */}
         <div className="flex items-center justify-between gap-3 mb-6 lg:hidden">
          <Link
            href="/"
            className="text-sm px-3 py-1 rounded border border-[#333] hover:bg-[#1f1f1f] transition-colors"
          >
            ← Home
          </Link>
          <InPageSearch articleSelector="#md-article" />
        </div>

        <article id="md-article" className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              /* 画像 → MarkdownImage */
              img({ src, alt }) {
                if (typeof src !== 'string') return null
                return <MarkdownImage src={src} alt={alt} />
              },

              /* h1-h3 に id を自動付与 */
              h1: ({ children, ...rest }) => <HeadingRenderer level={1} {...rest}>{children}</HeadingRenderer>,
              h2: ({ children, ...rest }) => <HeadingRenderer level={2} {...rest}>{children}</HeadingRenderer>,
              h3: ({ children, ...rest }) => <HeadingRenderer level={3} {...rest}>{children}</HeadingRenderer>,

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

                // 相対リンク補正
                const fixed = url.startsWith('./')
                  ? dirUrl + url.slice(2)
                  : url.startsWith('/')
                  ? url
                  : dirUrl + url

                return (
                  <Link href={fixed} className={`text-[var(--link)] hover:text-[var(--link-hover)] underline ${className ?? ''}`} title={title}>
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

      {/* サイドバー (Desktop用 TOC & Search) */}
      <aside className="hidden lg:block sticky top-24 h-fit">
        <div className="mb-6">
            <Link
                href="/"
                className="inline-block text-sm text-gray-400 hover:text-white mb-4 transition-colors"
            >
                ← Back to Home
            </Link>
            <InPageSearch articleSelector="#md-article" />
        </div>

        {headings.length > 0 && (
          <nav className="p-4 rounded-lg bg-[#1a1a1a] border border-[#333]">
            <h4 className="font-bold text-gray-200 mb-3 text-sm uppercase tracking-wider">Table of Contents</h4>
            <ul className="space-y-1">
              {headings.map((h, i) => (
                <li key={`${h.id}-${i}`} className={`text-sm leading-relaxed ${h.level === 1 ? 'mt-3 font-semibold' : ''}`} style={{ paddingLeft: `${(h.level - 1) * 0.75}rem` }}>
                  <a
                    href={`#${h.id}`}
                    className="block text-gray-400 hover:text-[var(--accent)] transition-colors py-0.5"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </aside>

    </div>
  )
}

/* Helper to render headings with IDs */
type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & { level: 1 | 2 | 3 | 4 | 5 | 6 }

function HeadingRenderer({ level, children, ...rest }: HeadingProps) {
    const text = toText(children)
    const id = slugify(text)
    const Tag = `h${level}` as const
    return (
        <Tag id={id} {...rest}>
            {children}
        </Tag>
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
    <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded border border-[#333]">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        className="w-24 bg-transparent text-sm text-white placeholder-gray-500 outline-none px-1"
      />
      <button
        type="button"
        onClick={() => go(-1)}
        className="text-gray-400 hover:text-white px-1"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="text-gray-400 hover:text-white px-1"
      >
        ▼
      </button>
      <span className="text-xs text-gray-500 min-w-[30px] text-center">{info}</span>
    </div>
  )
}
