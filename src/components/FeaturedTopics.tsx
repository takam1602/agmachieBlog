'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Shuffle } from 'lucide-react'
import { BlogPost } from '@/utils/posts'

export default function FeaturedTopics({ posts }: { posts: BlogPost[] }) {
  const [postIndex, setPostIndex] = useState(0)

  useEffect(() => {
    if (!posts.length) return
    setPostIndex(Math.floor(Math.random() * posts.length))
  }, [posts])

  const post = posts[postIndex] ?? null
  const showAnother = () => {
    if (posts.length < 2) return
    setPostIndex((current) => {
      let next = current
      while (next === current) next = Math.floor(Math.random() * posts.length)
      return next
    })
  }

  const rememberTopic = (href: string) => {
    const topic = document.querySelector<HTMLElement>('#topic-picks')
    if (topic) {
      const top = topic.getBoundingClientRect().top + window.scrollY - 80
      sessionStorage.setItem('agmachie:topicScrollY', String(Math.max(0, top)))
    }
    sessionStorage.setItem('agmachie:lastTopicHref', href)
    sessionStorage.setItem('agmachie:restoreTopic', '1')
    sessionStorage.setItem('agmachie:restoreSection', 'topic')
  }

  if (!post) return null

  return (
    <section className="flex h-full min-h-[260px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6" aria-labelledby="topic-pick-title">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--accent)]">TOPIC PICK</p>
          <h3 id="topic-pick-title" className="mt-1 text-sm font-semibold text-gray-300">今日の一記事</h3>
        </div>
        {posts.length > 1 && (
          <button
            type="button"
            onClick={showAnother}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs text-gray-500 transition-colors hover:border-gray-500 hover:text-white"
          >
            <Shuffle size={13} aria-hidden="true" />
            別の記事
          </button>
        )}
      </div>

      <Link href={post.href} data-topic-href={post.href} onClick={() => rememberTopic(post.href)} className="group flex flex-1 flex-col">
        <span className="mb-3 w-fit rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-gray-500">{post.category ?? 'blog'}</span>
        <h4 className="line-clamp-3 text-xl font-bold leading-snug text-gray-100 transition-colors group-hover:text-[var(--accent)]">
          {post.title}
        </h4>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-500">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="font-mono text-xs text-gray-600">{post.date}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
            記事を読む <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </section>
  )
}
