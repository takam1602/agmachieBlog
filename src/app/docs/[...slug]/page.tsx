/* ---------- server component ---------- */
import fs from 'node:fs'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import matter from 'gray-matter'
import DocInteractive from '@/components/DocInteractive'
import LoginForm from '@/components/LoginForm'
import { getStaticDocParams } from '@/utils/posts'
import { verifyAuthToken } from '@/utils/auth'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

function insideContent(filePath: string) {
  const resolved = path.resolve(filePath)
  return resolved === CONTENT_ROOT || resolved.startsWith(`${CONTENT_ROOT}${path.sep}`)
}

/* content/ 以下の .md / .mdx / index.md を安全に探す */
function getDocPath(slug: string[]) {
  const cleanSlug = slug
    .map((part) => decodeURIComponent(part))
    .filter((part) => part && part !== '.' && part !== '..' && !part.includes(path.sep))

  if (cleanSlug.length !== slug.length) notFound()

  const leaf = cleanSlug.at(-1)
  if (!leaf) notFound()

  const candidates = [
    path.join(CONTENT_ROOT, ...cleanSlug, 'index.md'),
    path.join(CONTENT_ROOT, ...cleanSlug, 'index.mdx'),
  ]

  if (!leaf.endsWith('.md') && !leaf.endsWith('.mdx')) {
    candidates.push(
      path.join(CONTENT_ROOT, ...cleanSlug.slice(0, -1), `${leaf}.md`),
      path.join(CONTENT_ROOT, ...cleanSlug.slice(0, -1), `${leaf}.mdx`),
    )
  } else {
    candidates.push(path.join(CONTENT_ROOT, ...cleanSlug))
  }

  const found = candidates.map((candidate) => path.resolve(candidate)).find((candidate) => (
    insideContent(candidate) && fs.existsSync(candidate)
  ))

  if (!found) notFound()
  return found
}

export const dynamic = 'auto'
export const dynamicParams = true

export async function generateStaticParams() {
  return getStaticDocParams()
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params

  /* ベース URL 例: /docs/ag/kaihatsu/ （相対リンク補正用・元の仕様を踏襲）*/
  const dirUrl =
    '/docs/' +
    (slug.at(-1)!.endsWith('.md') || slug.at(-1)!.endsWith('.mdx') ? slug.slice(0, -1) : slug).join('/') +
    '/'

  const mdPath = getDocPath(slug)
  const rawSource = await fs.promises.readFile(mdPath, 'utf8').catch(() => notFound())

  // Frontmatter 解析
  const { content, data } = matter(rawSource)

  // 保護コンテンツのチェック
  if (data.protected) {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')

    // 認証されていない場合はログインフォームを表示
    if (!verifyAuthToken(token?.value)) {
      return <LoginForm />
    }
  }

  // ここから先はクライアントで UI（Home/TOC/検索）を追加しつつ表示
  // content には frontmatter を除いた本文が入る
  return <DocInteractive source={content} dirUrl={dirUrl} />
}
