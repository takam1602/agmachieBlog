#!/usr/bin/env node
/**
 * content/blog の記事 frontmatter に、はじめて作成した日付 `date` を追加する。
 * すでに `date` がある記事は変更しない。
 *
 * 作成日の決め方（上から優先）:
 *   1. ファイル名の YYMMDD（例: 250519.md → 2025-05-19）
 *   2. git でそのファイルが最初に追加されたコミットの日付
 *   3. 今日の日付（JST）… まだコミットされていない新規記事
 *
 * 使い方:
 *   node scripts/add-created-date.mjs           # content/blog 全体
 *   node scripts/add-created-date.mjs --staged  # ステージ済みの記事だけ（pre-commit 用）。変更後に git add し直す
 *   node scripts/add-created-date.mjs --dry-run # 変更内容の表示だけ
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const BLOG_DIR = 'content/blog'
const args = new Set(process.argv.slice(2))
const stagedOnly = args.has('--staged')
const dryRun = args.has('--dry-run')

const root = git(['rev-parse', '--show-toplevel']).trim()
process.chdir(root)

function git(gitArgs) {
  return execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
}

function isBlogMarkdown(file) {
  return file.startsWith(`${BLOG_DIR}/`) && /\.mdx?$/.test(file)
}

function listTargets() {
  if (stagedOnly) {
    return git(['diff', '--cached', '--name-only', '--diff-filter=AMR', '-z'])
      .split('\0')
      .filter(Boolean)
      .filter(isBlogMarkdown)
  }
  return fs
    .readdirSync(BLOG_DIR)
    .map((name) => `${BLOG_DIR}/${name}`)
    .filter(isBlogMarkdown)
}

function todayInTokyo() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())
}

function createdDate(file) {
  const match = path.basename(file).match(/^(\d{2})(\d{2})(\d{2})(?:_\d+)?\.mdx?$/)
  if (match) return `20${match[1]}-${match[2]}-${match[3]}`

  try {
    const dates = git(['log', '--follow', '--diff-filter=A', '--format=%cI', '--', file])
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    // %cI はコミット時のタイムゾーン付き（このリポジトリでは JST）なので先頭10文字で日付になる
    if (dates.length) return dates.at(-1).slice(0, 10)
  } catch {
    // git が使えない場合は今日の日付にする
  }

  return todayInTokyo()
}

/** frontmatter に date を追加した文字列を返す。すでに date があれば null。 */
function withDate(source, date) {
  const bom = source.startsWith('﻿') ? '﻿' : ''
  const text = source.slice(bom.length)
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const line = `date: '${date}'`
  const fm = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n?---[ \t]*(?:\r?\n|$)/)

  if (!fm) {
    return `${bom}---${eol}${line}${eol}---${eol}${eol}${text}`
  }

  const body = fm[1]
  if (/^date\s*:/m.test(body)) return null

  const lines = body === '' ? [] : body.split(/\r?\n/)
  const titleIndex = lines.findIndex((l) => /^title\s*:/.test(l))
  lines.splice(titleIndex >= 0 ? titleIndex + 1 : 0, 0, line)

  return `${bom}---${eol}${lines.join(eol)}${eol}---${eol}${text.slice(fm[0].length)}`
}

const changed = []
for (const file of listTargets()) {
  if (!fs.existsSync(file)) continue
  const source = fs.readFileSync(file, 'utf8')
  const date = createdDate(file)
  const next = withDate(source, date)
  if (next === null) continue

  changed.push(file)
  console.log(`${dryRun ? '[dry-run] ' : ''}${file}: date '${date}' を追加`)
  if (!dryRun) fs.writeFileSync(file, next)
}

if (stagedOnly && !dryRun && changed.length) {
  execFileSync('git', ['add', '--', ...changed])
}
