import { NextResponse } from 'next/server'

import { getGithubNotesConfigError, getGithubNotesUser, getGithubWriteConfigError } from '@/utils/githubNotesAuth'
import { deleteGithubNote, getGithubNotes, saveGithubNote } from '@/utils/githubNotes'

export async function GET() {
  const configError = getGithubWriteConfigError()
  if (configError) return NextResponse.json({ notes: [], error: configError }, { status: 500 })

  try {
    const notes = await getGithubNotes()
    return NextResponse.json({ notes })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load notes.' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const user = await getGithubNotesUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configError = getGithubNotesConfigError() || getGithubWriteConfigError()
  if (configError) return NextResponse.json({ error: configError }, { status: 500 })

  try {
    const body = await req.json() as { title?: string; body?: string; slug?: string }
    const note = await saveGithubNote({
      title: body.title ?? '',
      body: body.body ?? '',
      slug: body.slug,
      author: user.login,
    })
    return NextResponse.json({ note })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save note.' },
      { status: 400 },
    )
  }
}

export async function DELETE(req: Request) {
  const user = await getGithubNotesUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configError = getGithubNotesConfigError() || getGithubWriteConfigError()
  if (configError) return NextResponse.json({ error: configError }, { status: 500 })

  try {
    const body = await req.json() as { slug?: string }
    const note = await deleteGithubNote({ slug: body.slug ?? '' })
    return NextResponse.json({ note })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete note.' },
      { status: 400 },
    )
  }
}
