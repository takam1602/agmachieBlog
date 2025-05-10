import Link from 'next/link'

type GitHubFile = {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
}

const OWNER = 'takam1602'
const REPO  = 'AgMachine'

export const revalidate = 60

export default async function BlogList() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/blog`,
    { next: { revalidate: 60 } }
  )
  const files: GitHubFile[] = await res.json()

  const mdFiles = files
    .filter((f) => f.type === 'file' && f.name.endsWith('.md'))
    .sort((a, b) => (a.name < b.name ? 1 : -1))

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Blog 記事一覧</h1>
      <ul className="space-y-2">
        {mdFiles.map((file) => (
          <li key={file.name}>
            <Link
              href={`/view/blog/${file.name.replace('.md', '')}`}
              className="underline text-brand"
            >
              {file.name.replace('.md', '')}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
