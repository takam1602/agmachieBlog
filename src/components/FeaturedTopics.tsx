'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Shuffle } from 'lucide-react'
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
    <section className="flex h-full min-h-[260px] flex-col border border-line border-t-4 border-t-brand bg-surface p-5 sm:p-7" aria-labelledby="topic-pick-title">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.08em] text-brand-text">TOPIC PICK</p>
          <h3 id="topic-pick-title" className="mt-1 text-base font-bold text-ink">今日の一記事</h3>
        </div>
        {posts.length > 1 && (
          <button
            type="button"
            onClick={showAnother}
            className="inline-flex min-h-9 items-center gap-1.5 border-2 border-ink px-3 text-sm font-bold text-ink transition-colors hover:border-brand hover:bg-brand hover:text-on-brand"
          >
            <Shuffle size={13} aria-hidden="true" />
            別の記事
          </button>
        )}
      </div>

      <Link href={post.href} data-topic-href={post.href} onClick={() => rememberTopic(post.href)} className="group flex flex-1 flex-col text-ink hover:text-ink">
        <span className="mb-3 w-fit bg-band px-2 py-0.5 text-xs text-ink-2">{post.category ?? 'blog'}</span>
        <h4 className="line-clamp-3 text-2xl font-bold leading-snug text-ink group-hover:text-brand-text group-hover:underline">
          {post.title}
        </h4>
        <p className="mt-3 line-clamp-4 text-base leading-7 text-ink-2">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-ink-3">{post.date}</span>
          <span className="link-more text-sm">
            記事を読む <ChevronRight size={16} />
          </span>
        </div>
      </Link>
    </section>
  )
}
