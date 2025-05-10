/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { replaceRelativeImagePaths } from '@/utils/markdown'
import MarkdownImage from '@/components/MarkdownImage'

const OWNER = 'takam1602'
const REPO = 'AgMachine'
const BRANCH = 'main'

type GitHubFile = {
  name: string
  path: string
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  download_url: string | null
}

export async function generateStaticParams() {
  return [] // 全ページ ISR で動的生成
}

export const revalidate = 300

export default async function Viewer({
  params,
}: {
  params: any 
}) {
  const path = params.slug?.join('/') ?? ''
  const apiURL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`

  const res = await fetch(apiURL, { next: { revalidate: 300 } })
  if (res.status === 404) return <p className="p-8">Not found</p>

  const data: GitHubFile[] | GitHubFile = await res.json()

  /** Directory */
  if (Array.isArray(data)) {
    const dirs = data.filter((f) => f.type === 'dir')
    const files = data.filter((f) => f.type === 'file')
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold mb-4">{`/${path}` || 'root'}</h1>
        <ul className="space-y-2">
          {dirs.map((d) => (
            <li key={d.path}>
              📁&nbsp;
              <Link
                className="underline text-blue-600"
                href={`/view/${d.path}`}
              >
                {d.name}
              </Link>
            </li>
          ))}
          {files.map((f) => (
            <li key={f.path}>
              📄&nbsp;
              <Link
                className="underline"
                href={`/view/${f.path}`}
              >
                {f.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    )
  }

  /** File */
  const file = data
  if (file.name.endsWith('.md')) {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${file.path}`,
      { next: { revalidate: 300 } }
    )
    let md = await rawRes.text()
    md = replaceRelativeImagePaths(md, OWNER, REPO, BRANCH)
    return (
      <main className="prose mx-auto p-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            img({ src, alt }) {
              if (typeof src !== 'string') return null
              return <MarkdownImage src={src} alt={alt} />
            },
          }}
        >
          {md}
        </ReactMarkdown>
      </main>
    )
  }

  // 非 Markdown → ダウンロードリンク表示
  return (
    <main className="p-8">
      <p>
        <a
          href={file.download_url ?? '#'}
          className="underline text-blue-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          {file.name}
        </a>
      </p>
    </main>
  )
}
