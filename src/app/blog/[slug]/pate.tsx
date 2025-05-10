import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function BlogPage({
  params,
}: {
  params: { slug: string }
}) {
  const res = await fetch(
    `https://raw.githubusercontent.com/takam1602/AgMachine/blog/${params.slug}.md`,
    { next: { revalidate: 60 } }
  )
  const markdown = await res.text()

  return (
    <article className="prose mx-auto p-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
