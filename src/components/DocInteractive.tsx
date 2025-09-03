'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MarkdownImage from '@/components/MarkdownImage'
import InPageSearch from '@/components/InPageSearch'

type Props = {
  source: string
  /** 例: "/docs/ag/kaihatsu/" （末尾スラッシュあり） */
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

/** React children → テキスト（h1 の id 付け用） */
function toText(children: any): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(toText).join('')
  if (children && (children as any).props && (children as any).props.children) {
    return toText((children as any).props.children)
  }
  return ''
}

export default function DocInteractive({ source, dirUrl }: Props) {
  const headings = useMemo(() => extractH1(source), [source])

  return (
    <div className="prose mx-auto px-4 py-8">
      {/* 上部コントロール */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between gap-3">
          {/* Home へ戻る */}
          <Link
            href="/"
            className="px-3 py-1 rounded border border-[#333] hover:bg-[#0b0b0b]"
          >
            ← Home
          </Link>

          {/* ページ内検索 */}
          <InPageSearch articleSelector="#md-article" />
        </div>

        {/* TOC（#のみ） */}
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

      {/* 本文 */}
      <article id="md-article">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // 画像 → 既存の MarkdownImage（クリックで原寸）
            img({ src, alt }) {
              if (typeof src !== 'string') return null
              return <MarkdownImage src={src} alt={alt} />
            },

            // h1 に id を自動付与（TOC のリンク先）
            h1({ children, ...rest }) {
              const text = toText(children)
              const id = slugify(text)
              return (
                <h1 id={id} {...rest}>
                  {children}
                </h1>
              )
            },

            // リンク補正（画像を子に含むリンクは素通し）
            a({ href, children, ...rest }) {
              const url = typeof href === 'string' ? href : ''
              const hasImgChild = React.Children.toArray(children).some(
                (c: any) =>
                  React.isValidElement(c) &&
                  (c.type === 'img' || c.type === (MarkdownImage as any))
              )
              if (hasImgChild) return <>{children}</>

              // 外部は新規タブ
              if (/^https?:\/\//.test(url)) {
                return (
                  <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>
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
                <Link href={fixed} {...(rest as any)} className="text-blue-600 underline">
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
