import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export async function loadMarkdown(relPath: string) {
  const abs = path.join(process.cwd(), 'content', relPath) + '.md'
  const file = await fs.readFile(abs, 'utf8')
  const { content, data } = matter(file)
  return { content, data }
}

export async function listDir(relDir: string) {
  const abs = path.join(process.cwd(), 'content', relDir)
  const ents = await fs.readdir(abs, { withFileTypes: true })
  return ents.map((e) => ({
    name: e.name.replace(/\.md$/, ''),
    isDir: e.isDirectory(),
  }))
}
