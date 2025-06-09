/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { loadMarkdown, listDir } from '@/utils/md'

export const runtime = 'nodejs'
export const revalidate = 60

export default async function Doc({ params }: { params: any }) {
  /** ① params を常に await して単一オブジェクトに統一 */
  const p: any = await Promise.resolve(
    typeof params === 'function' ? params() : params
  )

  /** ② slug 配列から相対パスを組み立て */
  const slugArr: string[] = Array.isArray(p.slug) ? p.slug : []
  const relPath = slugArr.length ? path.join(...slugArr) : 'index'

  /* ---------- ファイルを探す (index.md も含む) ---------- */
  const candidates = [relPath + '.md', path.join(relPath, 'index.md')]

  for (const file of candidates) {
    try {
      const { content } = await loadMarkdown(file.replace(/\.md$/, ''))
      return (
        <article className="prose mx-auto p-6 prose-img:mx-auto prose-img:max-w-[1280px] prose-img:aspect-[16/9]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => {
                if (typeof src !== 'string' || !src) return null

                    const url =
                        src.startsWith('./img/')
                            ? src.replace(/^\.\/img\//, '/img/')
                            : src
                return (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mx-auto my-4"
                  >
                    <img
                      src={url}
                      alt={alt}
                      className="w-full max-w-[1280px] aspect-[16/9] object-cover rounded-md shadow"
                    />
                  </a>
                )
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      )
    } catch {
      /* 次の候補を試す */
    }
  }

  /* ---------- ディレクトリの場合 ---------- */
  try {
    const list = await listDir(relPath)
    return (
      <div className="prose mx-auto p-6">
        <h2>Index of /{relPath}</h2>
        <ul>
          {list.map((e) => (
            <li key={e.name}>
              {e.isDir ? '📁' : '📄'}&nbsp;
              <Link href={`/docs/${path.join(relPath, e.name)}`}> 
                {e.name}{e.isDir ? '/' : ''}
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
