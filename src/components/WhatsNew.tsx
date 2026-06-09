import Link from 'next/link';
import { BlogPost } from '@/utils/posts';

export default function WhatsNew({ posts }: { posts: BlogPost[] }) {
  // Take top 5
  const latestPosts = posts.slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-4">
      <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#333] rounded-lg p-3 flex flex-col gap-4 text-sm">
        
        <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-[var(--accent)] text-[#121212] font-bold px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                What&apos;s new !!
            </span>
        </div>

        <div className="w-full overflow-hidden">
            <ul className="whats-new-grid">
                {latestPosts.map((post) => (
                    <li key={post.slug} className="min-w-0">
                        <Link href={post.href} className="block rounded-md border border-[#333] bg-[#161616] p-3 text-gray-400 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                             <span className="block truncate text-sm font-medium text-gray-300">{post.title}</span>
                             <span className="mt-1 block font-mono text-xs text-gray-600">{post.updatedAt ?? post.date}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
