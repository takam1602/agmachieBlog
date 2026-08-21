'use client'

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Edit3, Eye, Github, ImagePlus, LogOut, Plus, Save } from 'lucide-react'

import type { GithubNote } from '@/utils/githubNotes'
import type { GithubNotesUser } from '@/utils/githubNotesAuth'

interface NotesClientProps {
  initialNotes: GithubNote[]
  user: GithubNotesUser | null
  configError?: string | null
  writeConfigError?: string | null
  pageError?: string | null
}

export default function NotesClient({
  initialNotes,
  user,
  configError,
  writeConfigError,
  pageError,
}: NotesClientProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [activeSlug, setActiveSlug] = useState(initialNotes[0]?.slug ?? '')
  const activeNote = useMemo(
    () => notes.find((note) => note.slug === activeSlug) ?? notes[0],
    [activeSlug, notes],
  )
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startEdit = (note?: GithubNote) => {
    setTitle(note?.title ?? '')
    setBody(note?.body ?? '')
    setSlug(note?.slug ?? '')
    setStatus('')
  }

  const insertMarkdown = (markdown: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setBody((current) => `${current}${current.endsWith('\n') || !current ? '' : '\n\n'}${markdown}`)
      return
    }

    const { selectionStart, selectionEnd } = textarea
    const before = body.slice(0, selectionStart)
    const after = body.slice(selectionEnd)
    const prefix = before && !before.endsWith('\n') ? '\n\n' : ''
    const suffix = after && !after.startsWith('\n') ? '\n\n' : ''
    const nextBody = `${before}${prefix}${markdown}${suffix}${after}`
    const nextCursor = before.length + prefix.length + markdown.length
    setBody(nextBody)
    window.setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    }, 0)
  }

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStatus('画像ファイルを選択してください。')
      return
    }

    setIsUploadingImage(true)
    setStatus('')

    const directResponse = await fetch('/api/notes/images/direct-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    })
    const directData = await directResponse.json() as {
      error?: string
      uploadUrl?: string
      imageUrl?: string
    }

    if (!directResponse.ok || !directData.uploadUrl || !directData.imageUrl) {
      setStatus(directData.error ?? '画像アップロード URL の作成に失敗しました。')
      setIsUploadingImage(false)
      return
    }

    const form = new FormData()
    form.set('file', file)
    const uploadResponse = await fetch(directData.uploadUrl, {
      method: 'POST',
      body: form,
    })

    if (!uploadResponse.ok) {
      setStatus(`画像アップロードに失敗しました: ${uploadResponse.status}`)
      setIsUploadingImage(false)
      return
    }

    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image'
    insertMarkdown(`![${alt}](${directData.imageUrl})`)
    setStatus('画像をアップロードして Markdown に挿入しました。')
    setIsUploadingImage(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setStatus('')

    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, slug: slug || undefined }),
    })
    const data = await response.json() as { error?: string; note?: { slug: string } }

    if (!response.ok) {
      setStatus(data.error ?? '保存に失敗しました。')
      setIsSaving(false)
      return
    }

    const refresh = await fetch('/api/notes')
    const refreshed = await refresh.json() as { notes?: GithubNote[] }
    const nextNotes = refreshed.notes ?? notes
    setNotes(nextNotes)
    setActiveSlug(data.note?.slug ?? nextNotes[0]?.slug ?? '')
    setSlug(data.note?.slug ?? slug)
    setStatus('GitHub に保存しました。')
    setIsSaving(false)
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:py-10">
      <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/80">
        <div className="border-b border-[var(--border)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--accent)]">NOTES</p>
              <h1 className="mt-2 text-xl font-bold text-white">公開メモ帳</h1>
            </div>
            {user ? (
              <form action="/api/auth/github/logout" method="post">
                <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-gray-400 hover:text-white" aria-label="ログアウト">
                  <LogOut size={16} />
                </button>
              </form>
            ) : (
              <a href="/api/auth/github/login" className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-gray-400 hover:text-white" aria-label="GitHubでログイン">
                <Github size={17} />
              </a>
            )}
          </div>
          {user && <p className="mt-3 text-xs text-gray-500">@{user.login} で編集できます。</p>}
          {!user && (
            <a href="/api/auth/github/login" className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-bold text-[#07140f] hover:bg-[var(--accent-hover)] hover:text-[#07140f]">
              <Github size={16} />
              GitHubでログイン
            </a>
          )}
          {(configError || writeConfigError || pageError) && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
              {pageError || configError || writeConfigError}
            </p>
          )}
          {user && (
            <button
              type="button"
              onClick={() => startEdit()}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 text-sm font-semibold text-gray-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Plus size={16} />
              新規メモ
            </button>
          )}
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-2 lg:max-h-[calc(100vh-220px)]">
          {notes.length === 0 ? (
            <p className="p-3 text-sm leading-6 text-gray-500">まだメモがありません。</p>
          ) : (
            notes.map((note) => (
              <button
                key={note.path}
                type="button"
                onClick={() => setActiveSlug(note.slug)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  activeNote?.slug === note.slug ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <span className="block text-sm font-semibold text-gray-100">{note.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-gray-500">{note.excerpt}</span>
                {note.updatedAt && <span className="mt-2 block text-[11px] text-gray-600">{note.updatedAt}</span>}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="min-w-0">
        {user && (
          <form onSubmit={submit} className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
              <label className="grid gap-1.5 text-xs font-semibold text-gray-400">
                タイトル
                <input value={title} onChange={(event) => setTitle(event.target.value)} required className="min-h-11 rounded-lg border border-[var(--border)] bg-[#0a0d0b] px-3 text-sm text-white outline-none focus:border-[var(--accent)]" />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-gray-400">
                slug
                <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="空なら自動生成" className="min-h-11 rounded-lg border border-[var(--border)] bg-[#0a0d0b] px-3 text-sm text-white outline-none focus:border-[var(--accent)]" />
              </label>
            </div>
            <label className="mt-3 grid gap-1.5 text-xs font-semibold text-gray-400">
              Markdown
              <textarea ref={textareaRef} value={body} onChange={(event) => setBody(event.target.value)} required rows={12} className="min-h-64 resize-y rounded-lg border border-[var(--border)] bg-[#0a0d0b] px-3 py-3 font-mono text-sm leading-6 text-white outline-none focus:border-[var(--accent)]" />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 text-sm font-semibold text-gray-200 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImagePlus size={16} />
                {isUploadingImage ? '画像アップロード中' : '画像を追加'}
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-bold text-[#07140f] disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={16} />
                {isSaving ? '保存中' : 'GitHubに保存'}
              </button>
              {activeNote && (
                <button type="button" onClick={() => startEdit(activeNote)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 text-sm font-semibold text-gray-200 hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  <Edit3 size={16} />
                  表示中のメモを編集
                </button>
              )}
              {status && <p className="text-sm text-gray-400">{status}</p>}
            </div>
            {body.trim() && (
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[#0a0d0b]/80 p-4">
                <div className="prose prose-invert max-w-none prose-img:rounded-lg prose-img:border prose-img:border-[var(--border)]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                </div>
              </div>
            )}
          </form>
        )}

        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/65 p-5 sm:p-7">
          {activeNote ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-gray-500">PUBLIC NOTE</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{activeNote.title}</h2>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <Eye size={15} />
                  {activeNote.updatedAt ?? 'no date'}
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.body}</ReactMarkdown>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-gray-500">左の一覧からメモを選択してください。</p>
          )}
        </article>
      </section>
    </div>
  )
}
