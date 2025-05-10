import Link from 'next/link'

export default async function BlogList() {
  const res = await fetch(
    'https://api.github.com/repos/takam1602/AgMachine/blog/',
    { next: { revalidate: 60 } }
  )
  const files = await res.json()

  const markdownFiles = files.filter((file: any) => file.name.endsWith('.md'))

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Blog記事一覧</h2>
      <ul className="mt-4">
        {markdownFiles.map((file: any) => (
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
