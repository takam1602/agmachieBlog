'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import InPageSearch from './InPageSearch'
import MarkdownImage from './MarkdownImage'

type Heading = { text: string; id: string }

/** 簡易 slugify（日本語はそのまま、英数は小文字＆ハイフン化） */
function slugify(input: string): string {
  const base = input.trim()
  const ascii = base
    .normalize('NFKD')
    .replace(/[A-Z]/g, (m) => m.toLowerCase())
    .replace(/[\s\u3000]+/g, '-') // スペース→-
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

/** React children からテキスト抽出（h1 の id 付与で使用） */
function toText(children: any): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(toText).join('')
  if (children && children.props && children.props.children) return toText(children.props.children)
  return ''
}

export default function DocShell({ content }: { content: string }) {
  const headings = useMemo(() => extractH1(content), [content])

  return (
    <div className="prose">
      {/* 上部：Home / 検索 / TOC(#のみ) */}
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

        {/* TOC（# のみ） */}
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

      {/* 記事本体 */}
      <article id="md-article">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // h1（#）に id を自動付与 → TOC のリンク先に
            h1({ node, children, ...rest }) {
              const text = toText(children)
              const id = slugify(text)
              return (
                <h1 id={id} {...rest}>
                  {children}
                </h1>
              )
            },
            // 画像は共通ラッパーで（クリックで原寸を別タブ）
            img({ src, alt }) {
              if (typeof src !== 'string') return null
              return <MarkdownImage src={src} alt={alt} />
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
