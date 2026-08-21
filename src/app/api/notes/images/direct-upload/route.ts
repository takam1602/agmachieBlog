import crypto from 'node:crypto'

import { NextResponse } from 'next/server'

import { getGithubNotesUser } from '@/utils/githubNotesAuth'

export const runtime = 'nodejs'

function getConfigError() {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) return 'CLOUDFLARE_ACCOUNT_ID is required.'
  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) return 'CLOUDFLARE_R2_ACCESS_KEY_ID is required.'
  if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) return 'CLOUDFLARE_R2_SECRET_ACCESS_KEY is required.'
  if (!process.env.CLOUDFLARE_R2_BUCKET) return 'CLOUDFLARE_R2_BUCKET is required.'
  if (!process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL) return 'CLOUDFLARE_R2_PUBLIC_BASE_URL is required.'
  return null
}

function hash(value: crypto.BinaryLike) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function hmac(key: crypto.BinaryLike | crypto.KeyObject, value: string) {
  return crypto.createHmac('sha256', key).update(value).digest()
}

function encodePathPart(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => '%' + char.charCodeAt(0).toString(16).toUpperCase())
}

function sanitizeFilename(filename: string) {
  const cleaned = filename
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 120)
  return cleaned || 'image'
}

function createObjectKey(filename: string) {
  const now = new Date()
  const year = String(now.getUTCFullYear())
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const prefix = (process.env.CLOUDFLARE_R2_PREFIX || 'notes').replace(/^\/+|\/+$/g, '')
  return prefix + '/' + year + '/' + month + '/' + crypto.randomUUID() + '-' + sanitizeFilename(filename)
}

function publicUrl(key: string) {
  const baseUrl = (process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL as string).replace(/\/+$/g, '')
  return baseUrl + '/' + key.split('/').map(encodePathPart).join('/')
}

async function putR2Object(input: {
  key: string
  body: Buffer
  contentType: string
}) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID as string
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID as string
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string
  const bucket = process.env.CLOUDFLARE_R2_BUCKET as string
  const region = 'auto'
  const service = 's3'
  const host = accountId + '.r2.cloudflarestorage.com'
  const canonicalUri = '/' + encodePathPart(bucket) + '/' + input.key.split('/').map(encodePathPart).join('/')
  const url = 'https://' + host + canonicalUri
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = hash(input.body)
  const credentialScope = dateStamp + '/' + region + '/' + service + '/aws4_request'
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  const canonicalHeaders = [
    'host:' + host,
    'x-amz-content-sha256:' + payloadHash,
    'x-amz-date:' + amzDate,
    '',
  ].join('\n')
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join('\n')
  const signingKey = hmac(
    hmac(hmac(hmac('AWS4' + secretAccessKey, dateStamp), region), service),
    'aws4_request',
  )
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization = [
    'AWS4-HMAC-SHA256 Credential=' + accessKeyId + '/' + credentialScope,
    'SignedHeaders=' + signedHeaders,
    'Signature=' + signature,
  ].join(', ')

  return fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': input.contentType,
      'Content-Length': String(input.body.length),
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: input.body,
  })
}

export async function POST(req: Request) {
  const user = await getGithubNotesUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configError = getConfigError()
  if (configError) return NextResponse.json({ error: configError }, { status: 500 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required.' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed.' }, { status: 400 })
  }

  const maxBytes = Number(process.env.CLOUDFLARE_R2_MAX_BYTES || 10 * 1024 * 1024)
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'Image is too large. Max ' + Math.floor(maxBytes / 1024 / 1024) + ' MB.' }, { status: 400 })
  }

  const key = createObjectKey(file.name)
  const buffer = Buffer.from(await file.arrayBuffer())
  const response = await putR2Object({
    key,
    body: buffer,
    contentType: file.type || 'application/octet-stream',
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    return NextResponse.json(
      { error: 'Failed to upload image to R2: ' + response.status + ' ' + detail.slice(0, 200) },
      { status: 400 },
    )
  }

  return NextResponse.json({
    key,
    imageUrl: publicUrl(key),
  })
}
