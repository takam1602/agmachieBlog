import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 60 // ISR

async function fetchMarkdown() {
  const res = await fetch(
    'https://raw.githubusercontent.com/takam1602/AgMachine/main/README.md',
    { cache: 'no-store' }
  )
  return res.text()
}

export default async function Blog() {
  const markdown = await fetchMarkdown()

  return (
    <div className="prose mx-auto p-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
