import { NextResponse } from 'next/server'

import { clearGithubNotesSession } from '@/utils/githubNotesAuth'

export async function POST(req: Request) {
  await clearGithubNotesSession()
  return NextResponse.redirect(new URL('/notes', req.url))
}
