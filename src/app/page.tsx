// src/app/page.tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { loadMarkdown } from '@/utils/md'      // ← 前メッセージで作成済み
import MarkdownImage from '@/components/MarkdownImage'
import { replaceRelativePaths } from '@/utils/markdown'

export const revalidate = 60

export default async function Home() {
  const { content } = await loadMarkdown('README')   // content/README.md
  const md = replaceRelativePaths(content)

  return (
    <article className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) =>
            typeof src === 'string' ? <MarkdownImage src={src} alt={alt} /> : null,
        }}
      >
        {md}
      </ReactMarkdown>
    </article>
  )
}
