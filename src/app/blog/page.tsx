import Link from 'next/link'

type GitHubFile = {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
}

export default async function BlogList() {
  const res = await fetch(
    'https://api.github.com/repos/takam1602/AgMachine/contents/',
    { next: { revalidate: 60 } }
  )
  const files: GitHubFile[] = await res.json()

  const markdownFiles = files.filter((file: GitHubFile) =>
    file.name.endsWith('.md')
  )

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Blog記事一覧</h2>
      <ul className="mt-4">
        {markdownFiles.map((file: GitHubFile) => (
          <li key={file.name}>
            <Link href={`/blog/${file.name.replace('.md', '')}`}>
              {file.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
