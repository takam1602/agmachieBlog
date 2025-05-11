/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadMarkdown, listDir } from '@/utils/md'
import path from 'path'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const runtime = 'nodejs'
export const revalidate = 60

export default async function Doc({ params }: { params: any }) {
  /* ✅ ここだけ変更 */
  const { slug = [] } = await Promise.resolve(params)
  const relPath = slug.length ? path.join(...slug) : 'README'

  /* ---------- ファイル ---------- */
  try {
    const { content } = await loadMarkdown(relPath)
    return (
      <article className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    )
  } catch {
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
}
