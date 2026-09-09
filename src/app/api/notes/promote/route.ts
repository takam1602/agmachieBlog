import { NextResponse } from 'next/server'

import { promoteGithubNote } from '@/utils/githubNotes'
import {
  getGithubNotesConfigError,
  getGithubNotesUser,
  getGithubWriteConfigError,
} from '@/utils/githubNotesAuth'

export async function POST(req: Request) {
  const user = await getGithubNotesUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configError = getGithubNotesConfigError() || getGithubWriteConfigError()
  if (configError) return NextResponse.json({ error: configError }, { status: 500 })

  try {
    const body = await req.json() as { slug?: string }
    const promotion = await promoteGithubNote({
      slug: body.slug ?? '',
      author: user.login,
    })
    return NextResponse.json({ promotion })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to promote note.' },
      { status: 400 },
    )
  }
}
