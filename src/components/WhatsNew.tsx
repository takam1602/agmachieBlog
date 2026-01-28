import Link from 'next/link';
import { BlogPost } from '@/utils/posts';

export default function WhatsNew({ posts }: { posts: BlogPost[] }) {
  // Take top 5
  const latestPosts = posts.slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-4">
      <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#333] rounded-lg p-3 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
        
        <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-[var(--accent)] text-[#121212] font-bold px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                Updates
            </span>
        </div>

        <div className="flex-grow w-full overflow-hidden">
             {/* Mobile: Stacked list */}
            <ul className="flex flex-col gap-1 md:hidden w-full">
                {latestPosts.map((post) => (
                    <li key={post.slug} className="truncate">
                        <Link href={post.href} className="flex items-center gap-2 text-gray-400 hover:text-[var(--accent)] transition-colors w-full">
                             <span className="font-mono text-xs text-gray-500 flex-shrink-0">[{post.date}]</span>
                             <span className="truncate">{post.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Desktop: Horizontal ticker-like or simple list if preferred. 
                User asked for "5 items lined up", but 5 items horizontally is too wide.
                Let's stick to a clean vertical list inside the bar or a grid.
                Actually, "article name : date" for 5 items fits better as a list.
             */}
             <div className="hidden md:flex flex-wrap gap-x-6 gap-y-1">
                {latestPosts.map((post) => (
                    <Link key={post.slug} href={post.href} className="group flex items-center gap-2 text-gray-400 hover:text-[var(--accent)] transition-colors text-xs lg:text-sm">
                        <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{post.title}</span>
                        <span className="w-px h-3 bg-gray-700"></span>
                        <span className="font-mono text-gray-600">{post.date}</span>
                    </Link>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}