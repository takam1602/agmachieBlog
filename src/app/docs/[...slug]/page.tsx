/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadMarkdown, listDir } from '@/utils/md'
import path from 'path'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const runtime = 'nodejs'      // FS を使うので node ランタイム
export const revalidate = 60         // ISR

function slugToPath(slug: string[]) {
  return slug.length ? path.join(...slug) : 'README'
}

// export default async function Doc({ params }: { params: { slug?: string[] } }) {
export default async function Doc({ params }: any) {
  const relPath = slugToPath(params.slug ?? [])
  try {
    const { content } = await loadMarkdown(relPath)
    return (
      <article className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    )
  } catch {
    /* ディレクトリなら一覧表示 */
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
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
