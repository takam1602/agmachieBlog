import fs from 'fs/promises'
import { Stats } from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  searchText?: string
  href: string
  category?: string
  protected?: boolean
}

export interface RepositorySection {
  title: string
  items: {
    href: string
    label: string
    desc?: string
    count?: number
  }[]
}

const CONTENT_DIR = path.join(process.cwd(), 'content')
const BLOG_DIR = path.join(CONTENT_DIR, 'blog')

const categoryLabels: Record<string, { label: string; group: string; desc?: string }> = {
  kaihatsu: { label: '北海道開発の機械', group: '日本の特色ある機械たち', desc: '北海道開拓とか' },
  hachiro: { label: '八郎潟の機械', group: '日本の特色ある機械たち', desc: '大規模干拓地の機械' },
  usa: { label: 'US', group: '各国の特色ある機械たち', desc: 'United States' },
  Australia: { label: 'AUS', group: '各国の特色ある機械たち', desc: 'Australia' },
  Thailand: { label: 'THAI', group: '各国の特色ある機械たち', desc: 'Thailand' },
  uk: { label: 'UK', group: '各国の特色ある機械たち', desc: 'United Kingdom' },
  Brazil: { label: 'BR', group: '各国の特色ある機械たち', desc: 'Brazil' },
  France: { label: 'FR', group: '各国の特色ある機械たち', desc: 'France' },
  Hungary: { label: 'HU', group: '各国の特色ある機械たち', desc: 'Hungary' },
  deere: { label: 'John Deere', group: '農業機械のメーカー', desc: 'Nothing runs like a Deere' },
  cat: { label: 'Caterpillar', group: '農業機械のメーカー', desc: 'Crawler tractors and more' },
  claas: { label: 'Claas', group: '農業機械のメーカー', desc: 'Harvesting machines' },
  morooka: { label: 'モロオカ', group: '農業機械のメーカー', desc: '農建トラクター' },
  tcm: { label: '東洋運搬機', group: '農業機械のメーカー', desc: '独創' },
  landLevel: { label: 'レベラー', group: '機械各論', desc: 'Leveling' },
  landHarrow: { label: 'スペードブレードローラー', group: '機械各論', desc: 'Harrowing' },
  landClearing: { label: '開拓 / Land Clearing', group: '機械各論', desc: 'Clearing' },
  exhibition: { label: '展示会', group: '展示会・博物館・学会', desc: 'Exhibitions & Museums' },
  jsam: { label: '農業食料工学会', group: '展示会・博物館・学会', desc: 'Academic notes' },
}

/**
 * Markdownの本文からプレーンテキストの抜粋を生成する
 */
export function createPlainText(content: string): string {
  return content
    .replace(/^#+\s+(.*)$/gm, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createExcerpt(content: string, length: number = 120): string {
  const plain = createPlainText(content)

  if (plain.length <= length) return plain
  return `${plain.substring(0, length)}...`
}

function createSearchText(content: string, length: number = 5000): string {
  return createPlainText(content).slice(0, length)
}

/**
 * ファイル名から日付を推測する
 */
function getDateFromFilename(filename: string, stats: Stats, frontmatterDate?: unknown): string {
  if (frontmatterDate instanceof Date) return frontmatterDate.toISOString().split('T')[0]
  if (typeof frontmatterDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(frontmatterDate)) {
    return frontmatterDate.slice(0, 10)
  }

  const match = filename.match(/^(\d{2})(\d{2})(\d{2})(?:_\d+)?\.mdx?$/)
  if (match) {
    return `20${match[1]}-${match[2]}-${match[3]}`
  }
  return stats.mtime.toISOString().split('T')[0]
}

/**
 * ブログ記事のみを取得 (既存機能維持)
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const files = await fs.readdir(BLOG_DIR)
    const posts = await Promise.all(
      files
        .filter((file) => /\.mdx?$/.test(file))
        .map((file) => readPost(path.join(BLOG_DIR, file))),
    )

    return posts
      .filter((post): post is BlogPost => Boolean(post))
      .filter((post) => !post.protected)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  } catch (e) {
    console.error('Error getting posts:', e)
    return []
  }
}

function getTitle(content: string, fallback: string, frontmatterTitle?: unknown) {
  if (typeof frontmatterTitle === 'string' && frontmatterTitle.trim()) {
    return frontmatterTitle.trim()
  }

  const titleMatch = content.match(/^#\s+(.*)$/m)
  return titleMatch ? titleMatch[1].trim() : fallback
}

async function walkMarkdown(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return walkMarkdown(fullPath)
      if (entry.isFile() && /\.mdx?$/.test(entry.name)) return [fullPath]
      return []
    }),
  )

  return files.flat()
}

function hrefFromContentPath(filePath: string) {
  const rel = path.relative(CONTENT_DIR, filePath).replaceAll(path.sep, '/')
  const withoutExtension = rel.replace(/\.mdx?$/, '')
  const docPath = withoutExtension === 'index' ? '' : withoutExtension.replace(/\/index$/, '')
  return docPath ? `/docs/${docPath}/` : '/docs/'
}

export function slugFromContentPath(filePath: string) {
  return path
    .relative(CONTENT_DIR, filePath)
    .replaceAll(path.sep, '/')
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '')
    .split('/')
    .filter(Boolean)
}

async function readPost(filePath: string): Promise<BlogPost | null> {
  try {
    const stats = await fs.stat(filePath)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { content, data } = matter(fileContent)
    const slugParts = slugFromContentPath(filePath)
    const basename = path.basename(filePath).replace(/\.mdx?$/, '')

    return {
      slug: slugParts.join('-') || 'index',
      title: getTitle(content, basename, data.title),
      date: getDateFromFilename(path.basename(filePath), stats, data.date ?? data.updated),
      excerpt: createExcerpt(content),
      searchText: createSearchText(content),
      href: hrefFromContentPath(filePath),
      category: slugParts[0],
      protected: Boolean(data.protected),
    }
  } catch {
    return null
  }
}

export async function getAllContentPosts() {
  const files = await walkMarkdown(CONTENT_DIR)
  const posts = await Promise.all(files.map(readPost))
  return posts
    .filter((post): post is BlogPost => Boolean(post))
    .filter((post) => post.href !== '/docs/')
    .filter((post) => !post.protected)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getGitRecentUpdates(limit: number = 5): Promise<BlogPost[]> {
  const posts = await getAllContentPosts()
  return posts.slice(0, limit)
}

export async function getStaticDocParams() {
  const files = await walkMarkdown(CONTENT_DIR)
  const posts = await Promise.all(files.map(readPost))
  return posts
    .filter((post): post is BlogPost => Boolean(post))
    .filter((post) => post.href !== '/docs/')
    .filter((post) => !post.protected)
    .map((post) => post.href.replace(/^\/docs\/|\/$/g, '').split('/').filter(Boolean))
    .filter((slug) => slug.length > 0)
    .map((slug) => ({ slug }))
}

export async function getRepositorySections(): Promise<RepositorySection[]> {
  const agDir = path.join(CONTENT_DIR, 'ag')
  const entries = await fs.readdir(agDir, { withFileTypes: true }).catch(() => [])
  const groups = new Map<string, RepositorySection['items']>()

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const key = entry.name
    const meta = categoryLabels[key] ?? {
      label: key,
      group: 'その他',
      desc: 'Repository',
    }
    const files = await walkMarkdown(path.join(agDir, key)).catch(() => [])
    const items = groups.get(meta.group) ?? []

    items.push({
      href: `/docs/ag/${key}/`,
      label: meta.label,
      desc: meta.desc,
      count: files.length,
    })
    groups.set(meta.group, items)
  }

  const order = [
    '日本の特色ある機械たち',
    '各国の特色ある機械たち',
    '農業機械のメーカー',
    '機械各論',
    '展示会・博物館・学会',
    'その他',
  ]

  return order
    .map((title) => ({
      title,
      items: (groups.get(title) ?? []).sort((a, b) => a.label.localeCompare(b.label, 'ja')),
    }))
    .filter((section) => section.items.length > 0)
}
