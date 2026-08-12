'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  Home,
  List,
  Search,
} from 'lucide-react'
import MarkdownImage from '@/components/MarkdownImage'

type Props = {
  source: string
  dirUrl: string
}

type Heading = { text: string; id: string; level: number }

function slugify(input: string): string {
  const base = input.trim()
  const ascii = base
    .normalize('NFKD')
    .replace(/[A-Z]/g, (match) => match.toLowerCase())
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^a-z0-9\-_.\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu, '')
  return encodeURIComponent(ascii || base)
}

function createSlugger() {
  const counts = new Map<string, number>()
  return (text: string) => {
    const base = slugify(text)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    return count === 0 ? base : base + '-' + (count + 1)
  }
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const getId = createSlugger()
  const pattern = /^(#{1,3})\s+(.+?)\s*$/gm
  let match: RegExpExecArray | null
  while ((match = pattern.exec(content)) !== null) {
    const text = match[2].replace(/\s+#+$/, '').trim()
    headings.push({ level: match[1].length, text, id: getId(text) })
  }
  return headings
}

function toText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(toText).join('')
  if (
    React.isValidElement<{ children?: React.ReactNode }>(children) &&
    children.props &&
    'children' in children.props
  ) {
    return toText(children.props.children)
  }
  return ''
}

function estimateReadingMinutes(source: string) {
  const plain = source
    .replace(/\x60{3}[\s\S]*?\x60{3}/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_|~-]/g, ' ')
  const japaneseCharacters = (plain.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu) ?? []).length
  const latinWords = (plain.match(/[a-z0-9]+/gi) ?? []).length
  return Math.max(1, Math.ceil(japaneseCharacters / 500 + latinWords / 220))
}

export default function DocInteractive({ source, dirUrl }: Props) {
  const headings = useMemo(() => extractHeadings(source), [source])
  const readingMinutes = useMemo(() => estimateReadingMinutes(source), [source])
  const headingSlugger = createSlugger()
  const homeHref = useReturnHomeHref()
  const [copied, setCopied] = useState(false)
  const sectionLabel = dirUrl.includes('/blog/') ? 'ブログ' : 'リポジトリ'
  const sectionHref = dirUrl.includes('/blog/') ? '/#blog' : '/#repository'

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <ReadingProgress articleSelector="#md-article" />
      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-10 px-4 py-6 sm:px-6 sm:py-10 xl:grid-cols-[minmax(0,1fr)_292px] xl:px-8">
        <div className="min-w-0 w-full">
          <div className="mx-auto mb-7 max-w-[88ch]">
            <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500" aria-label="パンくずリスト">
              <Link href="/" className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-gray-500 hover:bg-white/[0.04] hover:text-gray-200">
                <Home size={12} aria-hidden="true" />
                ホーム
              </Link>
              <span aria-hidden="true">/</span>
              <Link href={sectionHref} className="rounded-md px-1.5 py-1 text-gray-500 hover:bg-white/[0.04] hover:text-gray-200">
                {sectionLabel}
              </Link>
              {headings[0]?.text && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="max-w-[20rem] truncate px-1.5 py-1 text-gray-400" aria-current="page">
                    {headings[0].text}
                  </span>
                </>
              )}
            </nav>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--border)] py-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} className="text-[var(--accent)]" aria-hidden="true" />
                  約 {readingMinutes} 分
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <List size={14} className="text-[var(--accent)]" aria-hidden="true" />
                  {headings.length} セクション
                </span>
              </div>
              <button
                type="button"
                onClick={copyPageLink}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-white/[0.02] px-3 text-xs text-gray-400 transition-colors hover:border-gray-500 hover:text-white"
                aria-live="polite"
              >
                {copied ? <Check size={14} className="text-[var(--accent)]" /> : <Copy size={14} />}
                {copied ? 'コピーしました' : 'ページを共有'}
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 xl:hidden">
              <Link href={homeHref} className="inline-flex min-h-10 items-center rounded-full border border-[var(--border)] px-4 text-xs text-gray-400 hover:border-gray-500 hover:text-white">
                ← 一覧へ戻る
              </Link>
              <InPageSearch articleSelector="#md-article" />
            </div>

            {headings.length > 0 && (
              <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] xl:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-gray-200">
                  <span className="inline-flex items-center gap-2"><List size={15} className="text-[var(--accent)]" /> 目次</span>
                  <ChevronDown size={16} className="details-chevron text-gray-500 transition-transform" />
                </summary>
                <TableOfContents headings={headings} compact />
              </details>
            )}
          </div>

          <article id="md-article" className="md-article prose prose-invert w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img({ src, alt }) {
                  if (typeof src !== 'string') return null
                  return <MarkdownImage src={src} alt={alt} />
                },
                h1: ({ children, ...rest }) => <HeadingRenderer level={1} getId={headingSlugger} {...rest}>{children}</HeadingRenderer>,
                h2: ({ children, ...rest }) => <HeadingRenderer level={2} getId={headingSlugger} {...rest}>{children}</HeadingRenderer>,
                h3: ({ children, ...rest }) => <HeadingRenderer level={3} getId={headingSlugger} {...rest}>{children}</HeadingRenderer>,
                a(props) {
                  const { href, children, className, title } =
                    props as React.DetailedHTMLProps<
                      React.AnchorHTMLAttributes<HTMLAnchorElement>,
                      HTMLAnchorElement
                    >
                  const url = typeof href === 'string' ? href : ''
                  const hasImageChild = React.Children.toArray(children).some(
                    (child) =>
                      React.isValidElement(child) &&
                      (child.type === 'img' || child.type === (MarkdownImage as unknown))
                  )
                  if (hasImageChild) return <>{children}</>

                  if (/^https?:\/\//.test(url)) {
                    return (
                      <a href={url} target="_blank" rel="noopener noreferrer" className={className} title={title}>
                        {children}<span className="ml-1 inline-block text-[0.7em]" aria-hidden="true">↗</span>
                      </a>
                    )
                  }

                  const fixed = url.startsWith('./')
                    ? dirUrl + url.slice(2)
                    : url.startsWith('/')
                      ? url
                      : dirUrl + url

                  return (
                    <Link href={fixed} className={'text-[var(--link)] underline ' + (className ?? '')} title={title}>
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

        <aside className="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 xl:block">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-5 flex flex-col items-stretch gap-3 border-b border-[var(--border)] pb-4">
              <Link href={homeHref} className="w-fit whitespace-nowrap text-xs font-medium text-gray-400 transition-colors hover:text-white">
                ← 一覧へ戻る
              </Link>
              <InPageSearch articleSelector="#md-article" />
            </div>
            {headings.length > 0 ? (
              <>
                <p className="mb-3 text-[10px] font-bold tracking-[0.18em] text-gray-600">ON THIS PAGE</p>
                <ActiveTableOfContents headings={headings} />
              </>
            ) : (
              <p className="text-sm text-gray-500">この記事には目次がありません。</p>
            )}
          </div>
        </aside>
      </div>
      <BackToTop />
    </>
  )
}

function TableOfContents({ headings, compact = false }: { headings: Heading[]; compact?: boolean }) {
  return (
    <ul className={compact ? 'max-h-72 space-y-1 overflow-y-auto border-t border-[var(--border)] px-4 py-3' : 'space-y-1'}>
      {headings.map((heading, index) => (
        <li
          key={heading.id + '-' + index}
          className={heading.level === 1 ? 'mt-2 font-semibold' : ''}
          style={{ paddingLeft: (heading.level - 1) * 0.75 + 'rem' }}
        >
          <a href={'#' + heading.id} className="block rounded-md px-2 py-1.5 text-xs leading-relaxed text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-[var(--accent)]">
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

function ActiveTableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')

  React.useEffect(() => {
    const updateActive = () => {
      let next = headings[0]?.id ?? ''
      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element && element.getBoundingClientRect().top <= 150) next = heading.id
      }
      setActiveId((current) => current === next ? current : next)
    }
    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [headings])

  return (
    <ul className="space-y-0.5">
      {headings.map((heading, index) => (
        <li key={heading.id + '-' + index} style={{ paddingLeft: (heading.level - 1) * 0.65 + 'rem' }}>
          <a
            href={'#' + heading.id}
            aria-current={activeId === heading.id ? 'location' : undefined}
            className={activeId === heading.id
              ? 'block rounded-md border-l-2 border-[var(--accent)] bg-[var(--accent)]/[0.07] px-2 py-1.5 text-xs font-medium leading-relaxed text-[var(--accent)]'
              : 'block rounded-md border-l-2 border-transparent px-2 py-1.5 text-xs leading-relaxed text-gray-500 transition-colors hover:bg-white/[0.03] hover:text-gray-200'
            }
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  )
}

function ReadingProgress({ articleSelector }: { articleSelector: string }) {
  const [progress, setProgress] = useState(0)

  React.useEffect(() => {
    const update = () => {
      const article = document.querySelector<HTMLElement>(articleSelector)
      if (!article) return
      const start = article.offsetTop - 120
      const distance = Math.max(1, article.offsetHeight - window.innerHeight + 160)
      const next = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
      setProgress(next)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [articleSelector])

  return (
    <div className="fixed inset-x-0 top-[67px] z-50 h-0.5 bg-transparent" aria-hidden="true">
      <div className="h-full origin-left bg-[var(--accent)] transition-transform duration-150" style={{ transform: 'scaleX(' + progress + ')' }} />
    </div>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  React.useEffect(() => {
    const update = () => setVisible(window.scrollY > 700)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  if (!visible) return null
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-strong)] text-gray-300 shadow-xl transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:bottom-7 sm:right-7"
      aria-label="ページ上部へ戻る"
    >
      <ArrowUp size={18} />
    </button>
  )
}

function useReturnHomeHref() {
  const [href, setHref] = useState('/')

  React.useEffect(() => {
    const restoreSection = sessionStorage.getItem('agmachie:restoreSection')
    if (restoreSection === 'blog' || sessionStorage.getItem('agmachie:restoreBlog')) {
      setHref('/#blog')
    } else if (restoreSection === 'topic' || sessionStorage.getItem('agmachie:restoreTopic')) {
      setHref('/#topic-picks')
    }
  }, [])

  return href
}

type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & { level: 1 | 2 | 3 | 4 | 5 | 6 }

function HeadingRenderer({
  level,
  children,
  getId,
  ...rest
}: HeadingProps & { getId: (text: string) => string }) {
  const text = toText(children)
  const id = getId(text)
  const Tag = ('h' + level) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  return (
    <Tag id={id} className="group scroll-mt-24" {...rest}>
      {children}
      <a href={'#' + id} className="heading-anchor ml-2 no-underline opacity-0 transition-opacity group-hover:opacity-60 focus:opacity-100" aria-label={text + 'へのリンク'}>
        #
      </a>
    </Tag>
  )
}

function InPageSearch({ articleSelector }: { articleSelector: string }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [total, setTotal] = useState(0)
  const activeRef = React.useRef<HTMLElement | null>(null)

  const clearHighlights = React.useCallback(() => {
    const root = document.querySelector(articleSelector)
    if (!root) return
    root.querySelectorAll('mark[data-hl]').forEach((item) => {
      const mark = item as HTMLElement
      const parent = mark.parentNode
      if (!parent) return
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
      parent.removeChild(mark)
      parent.normalize()
    })
    activeRef.current = null
  }, [articleSelector])

  React.useEffect(() => {
    clearHighlights()
    const value = query.trim()
    if (!value) {
      setIndex(0)
      setTotal(0)
      return
    }
    const root = document.querySelector(articleSelector)
    if (!root) return

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const matches: HTMLElement[] = []
    const lowerQuery = value.toLocaleLowerCase()
    let node: Node | null

    while ((node = walker.nextNode())) {
      const text = node as Text
      if (!text.data || !text.data.trim()) continue
      let start = 0
      while (true) {
        const position = text.data.toLocaleLowerCase().indexOf(lowerQuery, start)
        if (position === -1) break
        const range = document.createRange()
        range.setStart(text, position)
        range.setEnd(text, position + value.length)
        const mark = document.createElement('mark')
        mark.setAttribute('data-hl', '')
        mark.className = 'rounded-sm bg-yellow-400/25 text-inherit outline outline-1 outline-yellow-400/60'
        range.surroundContents(mark)
        matches.push(mark)
        const after = mark.nextSibling
        if (after?.nodeType === Node.TEXT_NODE) {
          walker.currentNode = after
          start = 0
        } else {
          break
        }
      }
    }

    setTotal(matches.length)
    setIndex(matches.length ? 1 : 0)
    if (matches[0]) {
      matches[0].classList.add('ring-2', 'ring-[var(--accent)]')
      activeRef.current = matches[0]
      matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return () => clearHighlights()
  }, [articleSelector, clearHighlights, query])

  const move = (direction: 1 | -1) => {
    const root = document.querySelector(articleSelector)
    const matches = Array.from(root?.querySelectorAll<HTMLElement>('mark[data-hl]') ?? [])
    if (!matches.length) return
    activeRef.current?.classList.remove('ring-2', 'ring-[var(--accent)]')
    let next = index + direction
    if (next < 1) next = matches.length
    if (next > matches.length) next = 1
    setIndex(next)
    const target = matches[next - 1]
    target.classList.add('ring-2', 'ring-[var(--accent)]')
    activeRef.current = target
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-black/15 p-1.5">
      <Search size={13} className="ml-1 shrink-0 text-gray-600" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="本文検索"
        aria-label="本文内を検索"
        className="w-20 bg-transparent px-1 text-xs text-white outline-none placeholder:text-gray-600"
      />
      <span className="min-w-7 text-center font-mono text-[9px] text-gray-600" aria-live="polite">{index}/{total}</span>
      <div className="flex border-l border-[var(--border)] pl-1">
        <button type="button" onClick={() => move(-1)} disabled={!total} className="grid h-6 w-6 place-items-center rounded text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="前の一致">
          <ChevronUp size={13} />
        </button>
        <button type="button" onClick={() => move(1)} disabled={!total} className="grid h-6 w-6 place-items-center rounded text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-30" aria-label="次の一致">
          <ChevronDown size={13} />
        </button>
      </div>
    </div>
  )
}
