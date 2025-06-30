/* ---------- server component ---------- */
import fs from 'node:fs'              // ← ★ ここを promises ではなく fs
import path from 'node:path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { DetailedHTMLProps, AnchorHTMLAttributes } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MarkdownImage from '@/components/MarkdownImage'

/* content/ 以下の .md / index.md を探す */
function getDocPath(slug: string[]) {
    const leaf = slug.at(-1)!
    const tryPath = (...parts: string[]) =>
    path.join(process.cwd(), 'content', ...parts)

    // 1) /index.md
    const idxPath = tryPath(...slug, leaf.endsWith('.md') ? '' : 'index.md')
    if (fs.existsSync(idxPath)) return idxPath

        // 2) /foo.md
        if (!leaf.endsWith('.md') && !leaf.endsWith('.mdx')) {
            const filePath = tryPath(...slug.slice(0, -1), `${leaf}.md`)
            if (fs.existsSync(filePath)) return filePath
        }

    return idxPath        // 存在しない ⇒ notFound() で 404
}

export const dynamic = 'force-dynamic'

// type PageProps<P> = { params: P }

export default async function DocPage(
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params   // ← 1 行だけ await を追加
    /* ベース URL 例: /docs/ag/kaihatsu/ */
    const dirUrl =
        '/docs/' + (slug.at(-1)!.endsWith('.md') ? slug.slice(0, -1) : slug).join('/') + '/'

    const mdPath = getDocPath(slug)
    const source = await fs.promises.readFile(mdPath, 'utf8').catch(() => notFound())

    return (
        <article className="prose mx-auto px-4 py-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            /* 画像 → MarkdownImage */
            img: ({ src = '', alt = '' }) => <MarkdownImage src={src as string} alt={alt} />,
        
            /* ---------- <a> 用レンダラ ---------- */
            a: (
              props: DetailedHTMLProps<
                AnchorHTMLAttributes<HTMLAnchorElement>,
                HTMLAnchorElement
              >,
            ) => {
              const { href = '', children, ...rest } = props
              const hasImgChild = React.Children.toArray(children).some(
                (c): c is React.ReactElement<{ src?: string; alt?: string }> =>
                  React.isValidElement(c) &&
                  (c.type === 'img' || c.type === MarkdownImage),
              )
              if (hasImgChild) {
                return <>{children}</>
              }
        
              /* 外部リンクは新規タブ */
              if (/^https?:\/\//.test(href)) {
                return (
                  <a href={href} {...rest} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                )
              }
        
              /* 相対リンクを補正 */
              const fixed = href.startsWith('./')
                ? dirUrl + href.slice(2)
                : href.startsWith('/')
                ? href
                : dirUrl + href
        
              return (
                <Link href={fixed} {...rest} className="text-blue-600 underline">
                  {children}
                </Link>
              )
            },
          }}
        >
          {source as string}
        </ReactMarkdown>
        </article>
    )
}
