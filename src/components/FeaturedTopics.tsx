import Link from 'next/link';
import { BlogPost } from '@/utils/posts';

export default function FeaturedTopics({ post }: { post: BlogPost | null }) {
  if (!post) return null;

  return (
    <div className="h-full flex flex-col">
       <h2 className="text-xl font-bold text-white pl-3 border-l-4 border-[var(--accent)] flex items-center gap-3 mb-4">
         <span>Featured Topic</span>
         <span className="text-xs font-normal text-gray-400">Discover something new</span>
       </h2>
       
       <Link href={post.href} className="flex-grow group block h-full">
         <div className="h-full bg-gradient-to-br from-[#1e1e1e] to-[#252525] p-6 rounded-lg border border-[#444] hover:border-[var(--accent)] transition-all duration-300 shadow-lg hover:shadow-[var(--accent)]/10 flex flex-col relative overflow-hidden">
            
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.03] rounded-bl-full -mr-10 -mt-10 pointer-events-none group-hover:opacity-[0.07] transition-opacity"></div>
            
            <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold rounded uppercase tracking-wider">
                    Recommended
                </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-[var(--accent)] transition-colors leading-tight z-10">
                {post.title}
            </h3>
            
            <p className="text-gray-400 leading-relaxed flex-grow z-10 text-sm md:text-base">
                {post.excerpt}
            </p>
            
            <div className="mt-6 pt-4 border-t border-[#444] text-sm text-gray-500 flex justify-between items-center z-10 group-hover:text-gray-300">
                <span className="font-mono text-xs opacity-70">{post.date}</span>
                <span className="flex items-center gap-1 text-[var(--accent)] font-medium group-hover:gap-2 transition-all">
                    Read Article 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
            </div>
         </div>
       </Link>
    </div>
  );
}
