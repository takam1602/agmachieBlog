import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BlogPost } from '@/utils/posts'

export default function WhatsNew({ posts }: { posts: BlogPost[] }) {
  const latestPosts = posts.slice(0, 5)

  if (!latestPosts.length) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center text-sm text-gray-500">
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
            className="group flex min-h-[118px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface-strong)]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={index === 0
                ? 'rounded-full bg-[var(--accent)]/10 px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[var(--accent)]'
                : 'rounded-full bg-white/[0.03] px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-gray-600'
              }>
                {index === 0 ? 'LATEST' : 'UPDATED'}
              </span>
              <span className="font-mono text-[10px] text-gray-600">{post.updatedAt ?? post.date}</span>
            </div>
            <span className="line-clamp-2 text-sm font-semibold leading-6 text-gray-300 transition-colors group-hover:text-white">
              {post.title}
            </span>
            <ArrowUpRight size={14} className="mt-auto self-end text-gray-600 transition-colors group-hover:text-[var(--accent)]" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
