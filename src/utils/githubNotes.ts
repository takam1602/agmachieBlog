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

export interface GithubNotePromotion {
  noteSlug: string
  blogPath: string
  blogHref: string
  commitSha: string
}

const DEFAULT_NOTES_PATH = 'content/notes'
const BLOG_PATH = 'content/blog'

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

function repoApiUrl(resource: string) {
  const { owner, repo } = getRepoConfig()
  return new URL(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${resource.replace(/^\/+/, '')}`,
  )
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

async function githubError(response: Response) {
  const detail = await response.text().catch(() => '')
  return `${response.status} ${createPlainText(detail).slice(0, 200)}`.trim()
}

async function getRepoBranch() {
  const configured = process.env.GITHUB_REPO_BRANCH?.trim()
  if (configured) return configured

  const response = await fetch(repoApiUrl(''), {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Failed to read repository: ${await githubError(response)}`)

  const data = await response.json() as { default_branch?: string }
  if (!data.default_branch) throw new Error('GitHub default branch is missing.')
  return data.default_branch
}

function getTokyoDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function chooseBlogFilename(existingNames: Set<string>, date: string) {
  const stem = date.replaceAll('-', '').slice(2)
  let index = 1

  while (true) {
    const filename = index === 1 ? `${stem}.md` : `${stem}_${index}.md`
    if (!existingNames.has(filename)) return filename
    index += 1
  }
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

  const savedData = await putResponse.json() as { content?: { sha?: string } }
  return parseNote(filePath, savedData.content?.sha ?? existingData?.sha ?? '', source)
}

export async function deleteGithubNote(input: { slug: string }) {
  const slug = safeSlug(input.slug)
  const filePath = `${getNotesPath()}/${slug}.md`
  const existing = await fetch(apiUrl(filePath), {
    headers: githubHeaders(),
    cache: 'no-store',
  })

  if (existing.status === 404) throw new Error('Note not found.')
  if (!existing.ok) throw new Error(`Failed to inspect note: ${existing.status}`)

  const existingData = await existing.json() as { sha?: string }
  if (!existingData.sha) throw new Error('Note sha is missing.')

  const deleteResponse = await fetch(apiUrl(filePath), {
    method: 'DELETE',
    headers: {
      ...githubHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Delete note: ${slug}`,
      sha: existingData.sha,
      branch: process.env.GITHUB_REPO_BRANCH,
    }),
  })

  if (!deleteResponse.ok) {
    const detail = await deleteResponse.text()
    throw new Error(`Failed to delete note: ${deleteResponse.status} ${createPlainText(detail).slice(0, 200)}`)
  }

  return { slug, path: filePath }
}

export async function promoteGithubNote(input: {
  slug: string
  author: string
}): Promise<GithubNotePromotion> {
  const slug = safeSlug(input.slug)
  const notePath = `${getNotesPath()}/${slug}.md`
  const branch = await getRepoBranch()

  const encodedBranch = branch.split('/').map(encodeURIComponent).join('/')
  const refResponse = await fetch(repoApiUrl(`git/ref/heads/${encodedBranch}`), {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (!refResponse.ok) throw new Error(`Failed to read branch: ${await githubError(refResponse)}`)
  const refData = await refResponse.json() as { object?: { sha?: string } }
  const parentSha = refData.object?.sha
  if (!parentSha) throw new Error('GitHub branch commit is missing.')

  const noteUrl = apiUrl(notePath)
  noteUrl.searchParams.set('ref', parentSha)
  const blogDirectoryUrl = apiUrl(BLOG_PATH)
  blogDirectoryUrl.searchParams.set('ref', parentSha)
  const [noteResponse, blogDirectoryResponse] = await Promise.all([
    fetch(noteUrl, { headers: githubHeaders(), cache: 'no-store' }),
    fetch(blogDirectoryUrl, { headers: githubHeaders(), cache: 'no-store' }),
  ])

  if (noteResponse.status === 404) throw new Error('Note not found.')
  if (!noteResponse.ok) {
    throw new Error(`Failed to load note: ${await githubError(noteResponse)}`)
  }
  if (!blogDirectoryResponse.ok && blogDirectoryResponse.status !== 404) {
    throw new Error(`Failed to inspect blog directory: ${await githubError(blogDirectoryResponse)}`)
  }

  const noteData = await noteResponse.json() as {
    content?: string
    encoding?: string
    sha?: string
  }
  if (!noteData.content || noteData.encoding !== 'base64' || !noteData.sha) {
    throw new Error('Note content is invalid.')
  }

  const rawNote = Buffer.from(noteData.content.replace(/\s/g, ''), 'base64').toString('utf8')
  const note = parseNote(notePath, noteData.sha, rawNote)
  const blogEntries = blogDirectoryResponse.ok
    ? await blogDirectoryResponse.json() as { name?: string; type?: string }[]
    : []
  const existingNames = new Set(
    blogEntries
      .filter((entry) => entry.type === 'file' && entry.name)
      .map((entry) => entry.name as string),
  )
  const date = getTokyoDate()
  const filename = chooseBlogFilename(existingNames, date)
  const blogPath = `${BLOG_PATH}/${filename}`
  const articleBody = /^#\s+.+$/m.test(note.body)
    ? note.body
    : `# ${note.title}\n\n${note.body}`
  const blogSource = matter.stringify(articleBody, {
    title: note.title,
    date,
    author: input.author,
  })

  const commitResponse = await fetch(repoApiUrl(`git/commits/${parentSha}`), {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  if (!commitResponse.ok) {
    throw new Error(`Failed to read branch commit: ${await githubError(commitResponse)}`)
  }
  const commitData = await commitResponse.json() as { tree?: { sha?: string } }
  const baseTreeSha = commitData.tree?.sha
  if (!baseTreeSha) throw new Error('GitHub base tree is missing.')

  const blobResponse = await fetch(repoApiUrl('git/blobs'), {
    method: 'POST',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: blogSource, encoding: 'utf-8' }),
  })
  if (!blobResponse.ok) throw new Error(`Failed to create blog content: ${await githubError(blobResponse)}`)
  const blobData = await blobResponse.json() as { sha?: string }
  if (!blobData.sha) throw new Error('GitHub blog blob is missing.')

  const treeResponse = await fetch(repoApiUrl('git/trees'), {
    method: 'POST',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [
        { path: blogPath, mode: '100644', type: 'blob', sha: blobData.sha },
        { path: notePath, mode: '100644', type: 'blob', sha: null },
      ],
    }),
  })
  if (!treeResponse.ok) throw new Error(`Failed to prepare note promotion: ${await githubError(treeResponse)}`)
  const treeData = await treeResponse.json() as { sha?: string }
  if (!treeData.sha) throw new Error('GitHub promotion tree is missing.')

  const promotionCommitResponse = await fetch(repoApiUrl('git/commits'), {
    method: 'POST',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Promote note to blog: ${note.title}`,
      tree: treeData.sha,
      parents: [parentSha],
    }),
  })
  if (!promotionCommitResponse.ok) {
    throw new Error(`Failed to commit note promotion: ${await githubError(promotionCommitResponse)}`)
  }
  const promotionCommit = await promotionCommitResponse.json() as { sha?: string }
  if (!promotionCommit.sha) throw new Error('GitHub promotion commit is missing.')

  const updateRefResponse = await fetch(repoApiUrl(`git/refs/heads/${encodedBranch}`), {
    method: 'PATCH',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: promotionCommit.sha, force: false }),
  })
  if (!updateRefResponse.ok) {
    throw new Error(`Failed to publish note promotion: ${await githubError(updateRefResponse)}`)
  }

  const blogSlug = filename.replace(/\.md$/, '')
  return {
    noteSlug: slug,
    blogPath,
    blogHref: `/docs/blog/${blogSlug}/`,
    commitSha: promotionCommit.sha,
  }
}
