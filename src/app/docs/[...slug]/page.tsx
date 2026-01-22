/* ---------- server component ---------- */
import fs from 'node:fs'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import matter from 'gray-matter'
import DocInteractive from '@/components/DocInteractive'
import LoginForm from '@/components/LoginForm'

/* content/ 以下の .md / index.md を探す（元のロジックを踏襲）*/
function getDocPath(slug: string[]) {
  const leaf = slug.at(-1)!
  const tryPath = (...parts: string[]) =>
    path.join(process.cwd(), 'content', ...parts)

  // 1) /index.md
  const idxPath = tryPath(...slug, leaf.endsWith('.md') ? '' : 'index.md')
  if (fs.existsSync(idxPath)) return idxPath

  // 2) /foo.md
  if (!leaf.endsWith('.md') && !leaf.endsWith('.mdx')) {
    const filePath = tryPath(...slug.slice(0, -1), `${leaf}.md`)
    if (fs.existsSync(filePath)) return filePath
  }

  return idxPath // 存在しない ⇒ notFound() で 404
}

export const dynamic = 'force-dynamic'

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params

  /* ベース URL 例: /docs/ag/kaihatsu/ （相対リンク補正用・元の仕様を踏襲）*/
  const dirUrl =
    '/docs/' +
    (slug.at(-1)!.endsWith('.md') ? slug.slice(0, -1) : slug).join('/') +
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
    if (!token || token.value !== 'secret_token') {
      return <LoginForm />
    }
  }

  // ここから先はクライアントで UI（Home/TOC/検索）を追加しつつ表示
  // content には frontmatter を除いた本文が入る
  return <DocInteractive source={content} dirUrl={dirUrl} />
}
