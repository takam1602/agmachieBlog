/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import MarkdownImage from '@/components/MarkdownImage'
import { replaceRelativePaths } from '@/utils/markdown'

const OWNER = 'takam1602'
const REPO  = 'AgMachine'
const BRANCH = 'main'

export const revalidate = 300

export default async function BlogPage({ params }: { params: any }) {
  const rawURL =
    `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${params.slug}.md`

  const res = await fetch(rawURL, { next: { revalidate: 300 } })
  if (res.status !== 200) return <p className="p-8">Not Found</p>

  let md = await res.text()
  md = replaceRelativePaths(md, OWNER, REPO, BRANCH)

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

// /** すべて ISR で生成 */
// export function generateStaticParams() {
//   return []
// }
