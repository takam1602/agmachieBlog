'use client'

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookUp, Edit3, Eye, Github, ImagePlus, LogOut, Plus, Save, Trash2 } from 'lucide-react'

import type { GithubNote, GithubNotePromotion } from '@/utils/githubNotes'
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)
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

    const form = new FormData()
    form.set('file', file)
    const uploadResponse = await fetch('/api/notes/images/direct-upload', {
      method: 'POST',
      body: form,
    })
    const uploadData = await uploadResponse.json() as {
      error?: string
      imageUrl?: string
    }

    if (!uploadResponse.ok || !uploadData.imageUrl) {
      setStatus(uploadData.error ?? '画像アップロードに失敗しました。')
      setIsUploadingImage(false)
      return
    }

    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image'
    insertMarkdown(`![${alt}](${uploadData.imageUrl})`)
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
    const data = await response.json() as { error?: string; note?: GithubNote }

    if (!response.ok) {
      setStatus(data.error ?? '保存に失敗しました。')
      setIsSaving(false)
      return
    }

    if (data.note) {
      const nextNotes = [data.note, ...notes.filter((note) => note.slug !== data.note?.slug)]
        .sort((a, b) => (a.updatedAt ?? '') < (b.updatedAt ?? '') ? 1 : -1)
      setNotes(nextNotes)
      setActiveSlug(data.note.slug)
      setSlug(data.note.slug)
    }
    setStatus('GitHub に保存しました。')
    setIsSaving(false)
  }

  const deleteActiveNote = async () => {
    if (!activeNote || isDeleting) return
    const ok = window.confirm('メモ「' + activeNote.title + '」を削除しますか？')
    if (!ok) return

    setIsDeleting(true)
    setStatus('')
    const response = await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: activeNote.slug }),
    })
    const data = await response.json() as { error?: string; note?: { slug: string } }

    if (!response.ok) {
      setStatus(data.error ?? '削除に失敗しました。')
      setIsDeleting(false)
      return
    }

    const deletedSlug = data.note?.slug ?? activeNote.slug
    const nextNotes = notes.filter((note) => note.slug !== deletedSlug)
    setNotes(nextNotes)
    setActiveSlug(nextNotes[0]?.slug ?? '')
    if (slug === deletedSlug) startEdit()
    setStatus('メモを削除しました。')
    setIsDeleting(false)
  }

  const promoteActiveNote = async () => {
    if (!activeNote || isPromoting) return
    const ok = window.confirm(
      `メモ「${activeNote.title}」をblogへ追加し、メモ一覧から削除しますか？`,
    )
    if (!ok) return

    setIsPromoting(true)
    setStatus('')
    try {
      const response = await fetch('/api/notes/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: activeNote.slug }),
      })
      const data = await response.json() as {
        error?: string
        promotion?: GithubNotePromotion
      }

      if (!response.ok || !data.promotion) {
        setStatus(data.error ?? 'blogへの追加に失敗しました。')
        return
      }

      const nextNotes = notes.filter((note) => note.slug !== data.promotion?.noteSlug)
      setNotes(nextNotes)
      setActiveSlug(nextNotes[0]?.slug ?? '')
      if (slug === data.promotion.noteSlug) startEdit()
      setStatus(`${data.promotion.blogPath} に追加しました。公開ページへの反映をお待ちください。`)
    } catch {
      setStatus('通信エラーのため、blogへの追加に失敗しました。')
    } finally {
      setIsPromoting(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:py-10">
      <aside className="h-fit border border-line border-t-4 border-t-brand bg-surface">
        <div className="border-b border-line p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.08em] text-brand-text">NOTES</p>
              <h1 className="mt-2 text-xl font-bold text-ink">公開メモ帳</h1>
            </div>
            {user ? (
              <form action="/api/auth/github/logout" method="post">
                <button type="submit" className="grid h-9 w-9 place-items-center border-2 border-ink text-ink hover:border-brand hover:bg-brand hover:text-on-brand" aria-label="ログアウト">
                  <LogOut size={16} />
                </button>
              </form>
            ) : (
              <a href="/api/auth/github/login" className="grid h-9 w-9 place-items-center border-2 border-ink text-ink hover:border-brand hover:bg-brand hover:text-on-brand" aria-label="GitHubでログイン">
                <Github size={17} />
              </a>
            )}
          </div>
          {user && <p className="mt-3 text-sm text-ink-3">@{user.login} で編集できます。</p>}
          {!user && (
            <a href="/api/auth/github/login" className="btn-primary mt-4 w-full text-sm">
              <Github size={16} />
              GitHubでログイン
            </a>
          )}
          {(configError || writeConfigError || pageError) && (
            <p className="mt-3 border-l-4 border-yellow bg-warn-bg p-3 text-sm leading-6 text-warn-ink">
              {pageError || configError || writeConfigError}
            </p>
          )}
          {user && (
            <button
              type="button"
              onClick={() => startEdit()}
              className="btn-secondary mt-3 w-full text-sm"
            >
              <Plus size={16} />
              新規メモ
            </button>
          )}
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-2 lg:max-h-[calc(100vh-220px)]">
          {notes.length === 0 ? (
            <p className="p-3 text-sm leading-6 text-ink-3">まだメモがありません。</p>
          ) : (
            notes.map((note) => (
              <button
                key={note.path}
                type="button"
                onClick={() => setActiveSlug(note.slug)}
                className={`w-full border-l-4 p-3 text-left transition-colors ${
                  activeNote?.slug === note.slug ? 'border-brand bg-brand-tint' : 'border-transparent hover:bg-band'
                }`}
              >
                <span className="block text-sm font-bold text-ink">{note.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-2">{note.excerpt}</span>
                {note.updatedAt && <span className="mt-2 block text-[11px] text-ink-3">{note.updatedAt}</span>}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="min-w-0">
        {user && (
          <form onSubmit={submit} className="mb-6 border border-line bg-band p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
              <label className="grid gap-1.5 text-sm font-bold text-ink">
                タイトル
                <input value={title} onChange={(event) => setTitle(event.target.value)} required className="min-h-11 border-2 border-line-strong bg-surface px-3 text-sm text-ink outline-none focus:border-brand" />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-ink">
                slug
                <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="空なら自動生成" className="min-h-11 border-2 border-line-strong bg-surface px-3 text-sm text-ink outline-none focus:border-brand" />
              </label>
            </div>
            <label className="mt-3 grid gap-1.5 text-sm font-bold text-ink">
              Markdown
              <textarea ref={textareaRef} value={body} onChange={(event) => setBody(event.target.value)} required rows={12} className="min-h-64 resize-y border-2 border-line-strong bg-surface px-3 py-3 font-mono text-sm font-normal leading-6 text-ink outline-none focus:border-brand" />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary min-h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImagePlus size={16} />
                {isUploadingImage ? '画像アップロード中' : '画像を追加'}
              </button>
              <button type="submit" disabled={isSaving} className="btn-primary min-h-10 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={16} />
                {isSaving ? '保存中' : 'GitHubに保存'}
              </button>
              {activeNote && (
                <button type="button" onClick={() => startEdit(activeNote)} className="btn-secondary min-h-10 px-4 text-sm">
                  <Edit3 size={16} />
                  表示中のメモを編集
                </button>
              )}
              {activeNote && (
                <button
                  type="button"
                  disabled={isPromoting || isDeleting}
                  onClick={promoteActiveNote}
                  className="inline-flex min-h-10 items-center justify-center gap-2 border-2 border-brand bg-brand px-4 text-sm font-bold text-on-brand hover:border-brand-hover hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <BookUp size={16} />
                  {isPromoting ? 'blogへ追加中' : 'blogへ追加'}
                </button>
              )}
              {activeNote && (
                <button
                  type="button"
                  disabled={isDeleting || isPromoting}
                  onClick={deleteActiveNote}
                  className="inline-flex min-h-10 items-center justify-center gap-2 border-2 border-danger px-4 text-sm font-bold text-danger hover:bg-danger hover:text-page disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  {isDeleting ? '削除中' : '表示中のメモを削除'}
                </button>
              )}
              {status && <p className="text-sm text-ink-2">{status}</p>}
            </div>
            {body.trim() && (
              <div className="mt-4 border border-line bg-surface p-4">
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                </div>
              </div>
            )}
          </form>
        )}

        <article className="border border-line bg-surface p-5 sm:p-7">
          {activeNote ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-line pb-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.08em] text-brand-text">PUBLIC NOTE</p>
                  <h2 className="mt-2 text-2xl font-bold text-ink">{activeNote.title}</h2>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-ink-3">
                  <Eye size={15} />
                  {activeNote.updatedAt ?? 'no date'}
                </div>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.body}</ReactMarkdown>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-ink-3">左の一覧からメモを選択してください。</p>
          )}
        </article>
      </section>
    </div>
  )
}
