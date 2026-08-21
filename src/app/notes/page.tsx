import NotesClient from '@/components/NotesClient'
import { getGithubNotesConfigError, getGithubNotesUser, getGithubWriteConfigError } from '@/utils/githubNotesAuth'
import { getGithubNotes, type GithubNote } from '@/utils/githubNotes'

export const dynamic = 'force-dynamic'

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const [{ error: urlError }, user] = await Promise.all([searchParams, getGithubNotesUser()])
  const configError = getGithubNotesConfigError()
  const writeConfigError = getGithubWriteConfigError()

  let notes: GithubNote[] = []
  let pageError = urlError

  if (!writeConfigError) {
    try {
      notes = await getGithubNotes()
    } catch (error) {
      pageError = error instanceof Error ? error.message : 'メモを読み込めませんでした。'
    }
  }

  return (
    <NotesClient
      initialNotes={notes}
      user={user}
      configError={configError}
      writeConfigError={writeConfigError}
      pageError={pageError}
    />
  )
}
