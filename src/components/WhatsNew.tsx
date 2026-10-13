import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BlogPost } from '@/utils/posts'

export default function WhatsNew({ posts }: { posts: BlogPost[] }) {
  const latestPosts = posts.slice(0, 5)

  if (!latestPosts.length) {
    return (
      <p className="border border-dashed border-line-strong bg-surface py-10 text-center text-sm text-ink-3">
        更新された記事はまだありません。
      </p>
    )
  }

  return (
    <ul className="whats-new-grid">
      {latestPosts.map((post, index) => (
        <li key={post.slug} className="min-w-0">
          <Link
            href={post.href}
            className="group flex min-h-[128px] flex-col border border-line bg-surface p-5 text-ink transition-colors hover:border-brand hover:text-ink"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={index === 0
                ? 'bg-brand px-2 py-0.5 text-[11px] font-bold tracking-[0.06em] text-on-brand'
                : 'border border-line px-2 py-0.5 text-[11px] font-bold tracking-[0.06em] text-ink-3'
              }>
                {index === 0 ? 'LATEST' : 'UPDATED'}
              </span>
              <span className="text-xs text-ink-3">{post.updatedAt ?? post.date}</span>
            </div>
            <span className="line-clamp-2 text-base font-bold leading-7 text-ink group-hover:text-brand-text group-hover:underline">
              {post.title}
            </span>
            <ChevronRight size={18} className="mt-auto self-end text-brand-text" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
