/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { loadMarkdown, listDir } from '@/utils/md'

export const runtime = 'nodejs'
export const revalidate = 60

export default async function Doc({ params }: { params: any }) {
  /** ① params を常に await して単一オブジェクトに統一 */
  const p: any = await Promise.resolve(
    typeof params === 'function' ? params() : params
  )

  /** ② ここから先で slug を参照（静的警告は出ません） */
  const slugArr: string[] = Array.isArray(p.slug) ? p.slug : []
  const relPath = slugArr.length ? path.join(...slugArr) : 'index'

  /* ---------- index.md を含めてファイルを探す ---------- */
  const candidates = [relPath + '.md', path.join(relPath, 'index.md')]

  for (const file of candidates) {
    try {
      const { content } = await loadMarkdown(file.replace(/\.md$/, ''))
      return (
        <article className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )
    } catch {/* 次を試す */}
  }

  /* ---------- ディレクトリ ---------- */
  try {
    const list = await listDir(relPath)
    return (
      <div className="prose">
        <h2>Index of /{relPath}</h2>
        <ul>
          {list.map((e) => (
            <li key={e.name}>
              {e.isDir ? '📁' : '📄'}&nbsp;
              <Link href={`/docs/${path.join(relPath, e.name)}`}>
                {e.name}
                {e.isDir ? '/' : ''}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  } catch {
    return <p className="p-8">Not found</p>
  }
}


