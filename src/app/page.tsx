import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Image from 'next/image'
import { replaceRelativeImagePaths } from '@/utils/markdown'

/** README を取得する GitHub オーナー / リポジトリ / ブランチ */
const OWNER = 'takam1602'
const REPO  = 'AgMachine'
const BRANCH = 'main'

/** README Raw URL */
const README_URL =
  `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/README.md`

/**
 * Markdown 内の <img> を next/image に置換するコンポーネント
 * react-markdown の components プロパティで利用
 */
function MarkdownImage(props: {
  src?: string
  alt?: string
}) {
  if (!props.src) return null
  return (
    <Image
      src={props.src}
      alt={props.alt ?? ''}
      width={800}
      height={600}
      className="my-4 rounded"
    />
  )
}

export const revalidate = 300 // 5 分ごとに ISR

export default async function Home() {
  // README をフェッチ
  const res = await fetch(README_URL, { next: { revalidate: 300 } })
  let markdownText = await res.text()

  // 相対パス画像を Raw URL に変換
  markdownText = replaceRelativeImagePaths(markdownText, OWNER, REPO, BRANCH)

  return (
    <main className="prose prose-img:mx-auto mx-auto px-4 py-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        // 画像を next/image で描画
        components={{
          img: ({node, ...props}) => <MarkdownImage {...props} />,
        }}
      >
        {markdownText}
      </ReactMarkdown>
    </main>
  )
}



