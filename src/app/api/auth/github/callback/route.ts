import { NextResponse } from 'next/server'

import {
  consumeGithubNotesState,
  isAllowedGithubLogin,
  setGithubNotesSession,
} from '@/utils/githubNotesAuth'

interface GithubOAuthTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface GithubUserResponse {
  login: string
  name?: string | null
  avatar_url?: string | null
}

export async function GET(req: Request) {
  const currentUrl = new URL(req.url)
  const code = currentUrl.searchParams.get('code')
  const state = currentUrl.searchParams.get('state')

  if (!code || !state || !(await consumeGithubNotesState(state))) {
    return NextResponse.redirect(new URL('/notes?error=GitHub login state is invalid.', req.url))
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokenData = await tokenResponse.json() as GithubOAuthTokenResponse
  if (!tokenResponse.ok || !tokenData.access_token) {
    return NextResponse.redirect(
      new URL(`/notes?error=${encodeURIComponent(tokenData.error_description || 'GitHub login failed.')}`, req.url),
    )
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenData.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!userResponse.ok) {
    return NextResponse.redirect(new URL('/notes?error=Failed to read GitHub user.', req.url))
  }

  const githubUser = await userResponse.json() as GithubUserResponse
  if (!isAllowedGithubLogin(githubUser.login)) {
    return NextResponse.redirect(new URL('/notes?error=This GitHub account is not allowed.', req.url))
  }

  await setGithubNotesSession({
    login: githubUser.login,
    name: githubUser.name,
    avatarUrl: githubUser.avatar_url,
  })

  return NextResponse.redirect(new URL('/notes', req.url))
}
