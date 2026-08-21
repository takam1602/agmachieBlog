import { NextResponse } from 'next/server'

import { createGithubNotesState, getGithubNotesConfigError } from '@/utils/githubNotesAuth'

export async function GET(req: Request) {
  const error = getGithubNotesConfigError()
  if (error) {
    return NextResponse.redirect(new URL(`/notes?error=${encodeURIComponent(error)}`, req.url))
  }

  const state = await createGithubNotesState()
  const callbackUrl = new URL('/api/auth/github/callback', req.url)
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID as string)
  url.searchParams.set('redirect_uri', callbackUrl.toString())
  url.searchParams.set('scope', 'read:user')
  url.searchParams.set('state', state)

  return NextResponse.redirect(url)
}
