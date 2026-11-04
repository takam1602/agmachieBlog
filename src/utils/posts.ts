import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { execFile } from 'child_process'
import { promisify } from 'util'

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  searchText?: string
  href: string
  category?: string
  protected?: boolean
  updatedAt?: string
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
const execFileAsync = promisify(execFile)

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

function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().split('T')[0]
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  return undefined
}

/**
 * ファイル名・frontmatter から日付を推測する。分からなければ undefined。
 */
function getDateFromFilename(filename: string, frontmatterDate?: unknown): string | undefined {
  const normalized = normalizeDate(frontmatterDate)
  if (normalized) return normalized

  const match = filename.match(/^(\d{2})(\d{2})(\d{2})(?:_\d+)?\.mdx?$/)
  if (match) {
    return `20${match[1]}-${match[2]}-${match[3]}`
  }
  return undefined
}

let gitHistoryAvailable: Promise<boolean> | null = null

/**
 * 完全な git 履歴が使えるかを判定する。
 * Vercel 等のデプロイ環境は `--depth 1` の浅い clone になるため、
 * どのファイルに `git log -1` しても最新コミット（例: Weekly News の自動更新）の日付が返り、
 * 過去記事まで「今日更新された」扱いになってしまう。その場合は git の日付を使わない。
 */
function hasFullGitHistory() {
  if (!gitHistoryAvailable) {
    gitHistoryAvailable = execFileAsync('git', ['rev-parse', '--is-shallow-repository'])
      .then(({ stdout }) => stdout.trim() === 'false')
      .catch(() => false)
  }
  return gitHistoryAvailable
}

async function gitLogDates(filePath: string): Promise<string[]> {
  if (!(await hasFullGitHistory())) return []

  const relativePath = path.relative(process.cwd(), filePath)
  try {
    // メッセージが [skip-updated] で始まるコミット（frontmatter の一括整備など）は更新扱いにしない
    const { stdout } = await execFileAsync('git', [
      'log',
      '--invert-grep',
      '--grep=^\\[skip-updated\\]',
      '--format=%cI',
      '--',
      relativePath,
    ])
    return stdout.split('\n').map((line) => line.trim().slice(0, 10)).filter(Boolean)
  } catch {
    // Git metadata is not always available in every runtime.
    return []
  }
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
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { content, data } = matter(fileContent)
    const slugParts = slugFromContentPath(filePath)
    const basename = path.basename(filePath).replace(/\.mdx?$/, '')
    const gitDates = await gitLogDates(filePath) // 新しい順
    // ファイルの mtime は checkout 時刻になる（デプロイ環境では毎回「今日」）ため使わない。
    const date = getDateFromFilename(path.basename(filePath), data.date ?? data.updated)
      ?? gitDates.at(-1)
      ?? ''
    const updatedAt = normalizeDate(data.updated) ?? gitDates[0] ?? date

    return {
      slug: slugParts.join('-') || 'index',
      title: getTitle(content, basename, data.title),
      date,
      updatedAt: updatedAt || undefined,
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

export async function getRecentlyUpdatedPosts(limit: number = 5): Promise<BlogPost[]> {
  const files = await walkMarkdown(CONTENT_DIR)
  const posts = await Promise.all(files.map(readPost))

  return posts
    .filter((post): post is BlogPost => Boolean(post))
    .filter((post) => post.href !== '/docs/')
    .filter((post) => !post.protected)
    // notes のメモは blog に追加してから更新一覧に掲載する。
    .filter((post) => post.category !== 'notes')
    // 日付が特定できない記事は「新着」に出さない
    .filter((post) => Boolean(post.updatedAt ?? post.date))
    .sort((a, b) => ((a.updatedAt ?? a.date) < (b.updatedAt ?? b.date) ? 1 : -1))
    .slice(0, limit)
}

export async function getGitRecentUpdates(limit: number = 5): Promise<BlogPost[]> {
  try {
    const { stdout } = await execFileAsync('git', [
      'diff-tree',
      '--no-commit-id',
      '--name-only',
      '--diff-filter=AM',
      '-r',
      'HEAD',
    ])

    const changed = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((file) => file.startsWith('content/'))
      .filter((file) => /\.mdx?$/.test(file))

    const posts = await Promise.all(changed.map((file) => readPost(path.join(process.cwd(), file))))

    return posts
      .filter((post): post is BlogPost => Boolean(post))
      .filter((post) => post.href !== '/docs/')
      .filter((post) => !post.protected)
      .filter((post) => post.category !== 'notes')
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit)
  } catch (e) {
    console.error('Error getting git recent updates:', e)
    return []
  }
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
