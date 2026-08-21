import path from 'node:path'

import matter from 'gray-matter'

import { createExcerpt, createPlainText } from '@/utils/posts'

export interface GithubNote {
  slug: string
  title: string
  body: string
  excerpt: string
  updatedAt?: string
  author?: string
  path: string
  sha: string
}

const DEFAULT_NOTES_PATH = 'content/notes'

function githubHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export function getNotesPath() {
  return (process.env.GITHUB_NOTES_PATH || DEFAULT_NOTES_PATH).replace(/^\/+|\/+$/g, '')
}

function getRepoConfig() {
  const owner = process.env.GITHUB_REPO_OWNER
  const repo = process.env.GITHUB_REPO_NAME
  if (!owner || !repo) throw new Error('GitHub repository is not configured.')
  return { owner, repo }
}

function apiUrl(filePath = getNotesPath()) {
  const { owner, repo } = getRepoConfig()
  const branch = process.env.GITHUB_REPO_BRANCH
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`)
  if (branch) url.searchParams.set('ref', branch)
  return url
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function createNoteSlug(title: string) {
  const slug = slugify(title)
  if (slug) return slug

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return `note-${formatter.format(new Date()).replace(/[: ]/g, '-')}`
}

function safeSlug(slug: string) {
  const cleaned = slug.replace(/\.md$/i, '').trim()
  if (!/^[\p{Letter}\p{Number}][\p{Letter}\p{Number}._-]{0,119}$/u.test(cleaned)) {
    throw new Error('Invalid note slug.')
  }
  return cleaned
}

function parseNote(filePath: string, sha: string, raw: string): GithubNote {
  const { content, data } = matter(raw)
  const slug = path.basename(filePath).replace(/\.md$/i, '')
  const title = typeof data.title === 'string' && data.title.trim()
    ? data.title.trim()
    : content.match(/^#\s+(.+)$/m)?.[1]?.trim() || slug

  return {
    slug,
    title,
    body: content.trim(),
    excerpt: createExcerpt(content, 160),
    updatedAt: typeof data.updated === 'string' ? data.updated.slice(0, 10) : undefined,
    author: typeof data.author === 'string' ? data.author : undefined,
    path: filePath,
    sha,
  }
}

export async function getGithubNotes(): Promise<GithubNote[]> {
  const response = await fetch(apiUrl(), {
    headers: githubHeaders(),
    cache: 'no-store',
  })

  if (response.status === 404) return []
  if (!response.ok) throw new Error(`Failed to load notes: ${response.status}`)

  const entries = await response.json() as {
    name: string
    path: string
    type: string
    download_url?: string
    sha: string
  }[]

  const notes = await Promise.all(
    entries
      .filter((entry) => entry.type === 'file' && entry.name.endsWith('.md') && entry.download_url)
      .map(async (entry) => {
        const rawResponse = await fetch(entry.download_url as string, { cache: 'no-store' })
        if (!rawResponse.ok) return null
        return parseNote(entry.path, entry.sha, await rawResponse.text())
      }),
  )

  return notes
    .filter((note): note is GithubNote => Boolean(note))
    .sort((a, b) => (a.updatedAt ?? '') < (b.updatedAt ?? '') ? 1 : -1)
}

export async function saveGithubNote(input: {
  title: string
  body: string
  slug?: string
  author: string
}) {
  const title = input.title.trim()
  const body = input.body.trim()
  if (!title) throw new Error('Title is required.')
  if (!body) throw new Error('Body is required.')

  const slug = safeSlug(input.slug || createNoteSlug(title))
  const filePath = `${getNotesPath()}/${slug}.md`
  const existing = await fetch(apiUrl(filePath), {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  const existingData = existing.ok ? await existing.json() as { sha?: string } : null
  if (!existing.ok && existing.status !== 404) {
    throw new Error(`Failed to inspect note: ${existing.status}`)
  }

  const updated = new Date().toISOString()
  const source = matter.stringify(body, {
    title,
    updated,
    author: input.author,
  })

  const putResponse = await fetch(apiUrl(filePath), {
    method: 'PUT',
    headers: {
      ...githubHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `${existingData?.sha ? 'Update' : 'Create'} note: ${title}`,
      content: Buffer.from(source).toString('base64'),
      sha: existingData?.sha,
      branch: process.env.GITHUB_REPO_BRANCH,
    }),
  })

  if (!putResponse.ok) {
    const detail = await putResponse.text()
    throw new Error(`Failed to save note: ${putResponse.status} ${createPlainText(detail).slice(0, 200)}`)
  }

  return { slug, path: filePath }
}
