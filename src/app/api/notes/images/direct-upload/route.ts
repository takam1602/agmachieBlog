import { NextResponse } from 'next/server'

import { getGithubNotesUser } from '@/utils/githubNotesAuth'

interface CloudflareDirectUploadResponse {
  success: boolean
  result?: {
    id?: string
    uploadURL?: string
  }
  errors?: { message?: string }[]
}

function getConfigError() {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) return 'CLOUDFLARE_ACCOUNT_ID is required.'
  if (!process.env.CLOUDFLARE_IMAGES_API_TOKEN) return 'CLOUDFLARE_IMAGES_API_TOKEN is required.'
  if (!process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH) return 'CLOUDFLARE_IMAGES_ACCOUNT_HASH is required.'
  return null
}

function deliveryUrl(imageId: string) {
  const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
  const variant = process.env.CLOUDFLARE_IMAGES_VARIANT || 'public'
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
}

export async function POST(req: Request) {
  const user = await getGithubNotesUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configError = getConfigError()
  if (configError) return NextResponse.json({ error: configError }, { status: 500 })

  const body = await req.json().catch(() => ({})) as { filename?: string; contentType?: string }
  if (body.contentType && !body.contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed.' }, { status: 400 })
  }

  const form = new FormData()
  form.set('requireSignedURLs', 'false')
  form.set('metadata', JSON.stringify({
    source: 'agmachie-notes',
    creator: user.login,
    filename: body.filename ?? '',
  }))

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_API_TOKEN}`,
      },
      body: form,
    },
  )

  const data = await response.json().catch(() => null) as CloudflareDirectUploadResponse | null
  if (!response.ok || !data?.success || !data.result?.id || !data.result.uploadURL) {
    const detail = data?.errors?.map((error) => error.message).filter(Boolean).join(', ')
    return NextResponse.json(
      { error: detail || `Failed to create Cloudflare upload URL: ${response.status}` },
      { status: 400 },
    )
  }

  return NextResponse.json({
    id: data.result.id,
    uploadUrl: data.result.uploadURL,
    imageUrl: deliveryUrl(data.result.id),
  })
}
