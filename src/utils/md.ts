import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

/** Markdown を読み込む。拡張子有無どちらでも OK */
export async function loadMarkdown(relPath: string) {
  const base = path.join(process.cwd(), 'content', relPath)
  const filePath = base.endsWith('.md') ? base : base + '.md'
  const file = await fs.readFile(filePath, 'utf8')
  const { content, data } = matter(file)
  return { content, data }
}

/** ディレクトリ配下を列挙（README.md も区別） */
export async function listDir(relDir: string) {
  const dir = path.join(process.cwd(), 'content', relDir)
  const ents = await fs.readdir(dir, { withFileTypes: true })
  return ents.map((e) => ({
    name: e.name.replace(/\.md$/, ''),
    isDir: e.isDirectory(),
    isMd : e.isFile() && e.name.endsWith('.md'),
  }))
}
