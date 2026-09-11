#!/usr/bin/env node
/**
 * public/pdf と public/brochure を Cloudflare R2 に移し、
 * content/ と src/ の参照を R2 の公開 URL に書き換える。
 *
 *   node scripts/migrate-docs-to-r2.mjs            # ドライラン（何も変更しない）
 *   node scripts/migrate-docs-to-r2.mjs --apply    # アップロード + 参照書き換え + ローカル削除
 *
 * 必要な環境変数（src/app/api/notes/images/direct-upload/route.ts と同名）:
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_R2_ACCESS_KEY_ID
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY
 *   CLOUDFLARE_R2_BUCKET
 *   CLOUDFLARE_R2_PUBLIC_BASE_URL
 * 任意:
 *   CLOUDFLARE_R2_DOCS_PREFIX   R2 上の配置先プレフィックス（既定 "docs"）
 */

import crypto from 'node:crypto'
import { readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const PUBLIC_DIR = join(ROOT, 'public')
const APPLY = process.argv.includes('--apply')
const SOURCE_DIRS = ['pdf', 'brochure']
const SCAN_DIRS = ['content', 'src']
const PREFIX = (process.env.CLOUDFLARE_R2_DOCS_PREFIX || 'docs').replace(/^\/+|\/+$/g, '')

const CONTENT_TYPES = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  txt: 'text/plain; charset=utf-8',
  zip: 'application/zip',
}

function requireEnv() {
  const missing = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET',
    'CLOUDFLARE_R2_PUBLIC_BASE_URL',
  ].filter((k) => !process.env[k])
  if (missing.length) {
    console.error('環境変数が不足しています: ' + missing.join(', '))
    console.error('.env.local に追記するか、コマンド前に export してください。')
    process.exit(1)
  }
}

/* ---------- R2 (S3 互換) SigV4 ---------- */

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest()
}

function encodePathPart(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function encodeKey(key) {
  return key.split('/').map(encodePathPart).join('/')
}

function publicUrl(key) {
  const base = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL.replace(/\/+$/g, '')
  return base + '/' + encodeKey(key)
}

async function r2Request(method, key, body, contentType) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const region = 'auto'
  const service = 's3'
  const host = accountId + '.r2.cloudflarestorage.com'
  const canonicalUri = '/' + encodePathPart(bucket) + '/' + encodeKey(key)
  const url = 'https://' + host + canonicalUri
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = hash(body ?? Buffer.alloc(0))
  const credentialScope = dateStamp + '/' + region + '/' + service + '/aws4_request'
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  const canonicalHeaders = ['host:' + host, 'x-amz-content-sha256:' + payloadHash, 'x-amz-date:' + amzDate, ''].join('\n')
  const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, hash(canonicalRequest)].join('\n')
  const signingKey = hmac(hmac(hmac(hmac('AWS4' + secretAccessKey, dateStamp), region), service), 'aws4_request')
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization = [
    'AWS4-HMAC-SHA256 Credential=' + accessKeyId + '/' + credentialScope,
    'SignedHeaders=' + signedHeaders,
    'Signature=' + signature,
  ].join(', ')

  const headers = {
    Authorization: authorization,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  }
  if (body) {
    headers['Content-Type'] = contentType || 'application/octet-stream'
    headers['Content-Length'] = String(body.length)
  }
  return fetch(url, { method, headers, body: body ?? undefined })
}

/* ---------- ファイル走査 ---------- */

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function contentTypeFor(name) {
  const ext = (name.split('.').pop() || '').toLowerCase()
  return CONTENT_TYPES[ext] || 'application/octet-stream'
}

/* ---------- 参照の書き換え ---------- */

/**
 * 1ファイルのテキスト中の /pdf/... /brochure/... 参照を R2 URL へ置換する。
 * 生 UTF-8 の参照と、パーセントエンコード済みの参照の両方に対応する。
 */
function rewriteText(text, mapping) {
  let changed = 0
  const pattern = /\/(?:pdf|brochure)\/[^\s"'`)\]<>|]*/g
  const next = text.replace(pattern, (match, offset) => {
    // 外部 URL の途中（例 https://agri-biz.jp/item/content/pdf/8179）を
    // 誤って書き換えないよう、直前が URL パスの続きなら対象外にする。
    const prev = offset > 0 ? text[offset - 1] : ''
    if (prev && /[A-Za-z0-9._~%-]/.test(prev)) return match

    const trailing = match.match(/[.,;:!?]+$/)?.[0] ?? ''
    const core = trailing ? match.slice(0, -trailing.length) : match
    const bare = core.split('#')[0].split('?')[0]
    const suffix = core.slice(bare.length)
    let decoded
    try {
      decoded = decodeURIComponent(bare)
    } catch {
      decoded = bare
    }
    const rel = decoded.replace(/^\//, '')
    const url = mapping.get(rel)
    if (!url) return match
    changed++
    return url + suffix + trailing
  })
  return { text: next, changed }
}

/* ---------- メイン ---------- */

async function main() {
  requireEnv()

  const files = []
  for (const d of SOURCE_DIRS) {
    for (const p of walk(join(PUBLIC_DIR, d))) {
      const rel = relative(PUBLIC_DIR, p).split(sep).join('/')
      files.push({ path: p, rel, key: PREFIX + '/' + rel, size: statSync(p).size })
    }
  }
  files.sort((a, b) => a.rel.localeCompare(b.rel))

  const totalBytes = files.reduce((s, f) => s + f.size, 0)
  console.log(`移行対象: ${files.length} ファイル / ${(totalBytes / 1048576).toFixed(1)} MB`)
  console.log(`R2 バケット: ${process.env.CLOUDFLARE_R2_BUCKET}  プレフィックス: ${PREFIX}/`)
  console.log(`公開ベース URL: ${process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL}`)
  console.log(APPLY ? '\n=== 適用モード ===\n' : '\n=== ドライラン（--apply で実行）===\n')

  // 参照マップ: "pdf/foo.pdf" -> "https://.../docs/pdf/foo.pdf"
  const mapping = new Map(files.map((f) => [f.rel, publicUrl(f.key)]))

  // 1. アップロードと検証
  const uploaded = []
  if (APPLY) {
    let i = 0
    for (const f of files) {
      i++
      const body = readFileSync(f.path)
      const put = await r2Request('PUT', f.key, body, contentTypeFor(f.rel))
      if (!put.ok) {
        const detail = await put.text().catch(() => '')
        console.error(`  [${i}/${files.length}] 失敗 ${f.rel}: ${put.status} ${detail.slice(0, 200)}`)
        console.error('中断します。ローカルファイルは削除していません。')
        process.exit(1)
      }
      // 公開 URL 経由でサイズを検証
      const head = await fetch(mapping.get(f.rel), { method: 'HEAD' })
      const len = Number(head.headers.get('content-length') || 0)
      if (!head.ok || len !== f.size) {
        console.error(`  [${i}/${files.length}] 検証失敗 ${f.rel}: status=${head.status} size=${len} expected=${f.size}`)
        console.error('中断します。ローカルファイルは削除していません。')
        process.exit(1)
      }
      uploaded.push(f)
      console.log(`  [${i}/${files.length}] OK ${f.rel} (${(f.size / 1048576).toFixed(2)} MB)`)
    }
  } else {
    for (const f of files.slice(0, 5)) console.log(`  ${f.rel}\n    -> ${mapping.get(f.rel)}`)
    if (files.length > 5) console.log(`  ... 他 ${files.length - 5} ファイル`)
  }

  // 2. 参照の書き換え
  let refFiles = 0
  let refCount = 0
  for (const d of SCAN_DIRS) {
    for (const p of walk(join(ROOT, d))) {
      if (!/\.(md|mdx|ts|tsx|js|jsx|json|html)$/i.test(p)) continue
      let text
      try {
        text = readFileSync(p, 'utf8')
      } catch {
        continue
      }
      const { text: next, changed } = rewriteText(text, mapping)
      if (changed) {
        refFiles++
        refCount += changed
        if (APPLY) writeFileSync(p, next)
        else console.log(`  書き換え予定 ${relative(ROOT, p)}: ${changed} 箇所`)
      }
    }
  }
  console.log(`\n参照書き換え: ${refFiles} ファイル / ${refCount} 箇所`)

  // 3. ローカルファイルの削除（アップロード検証済みのみ）
  if (APPLY) {
    let freed = 0
    for (const f of uploaded) {
      unlinkSync(f.path)
      freed += f.size
    }
    console.log(`ローカル削除: ${uploaded.length} ファイル / ${(freed / 1048576).toFixed(1)} MB 解放`)
    console.log('\n空ディレクトリの掃除:  find public -type d -empty -delete')
    console.log('未参照の残りを確認:    npm run build')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
