'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/utils/posts';

export default function FeaturedTopics({ posts }: { posts: BlogPost[] }) {
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (!posts.length) return;
    setPost(posts[Math.floor(Math.random() * posts.length)]);
  }, [posts]);

  const rememberTopic = (href: string) => {
    const topic = document.querySelector<HTMLElement>('#topic-picks');
    if (topic) {
      const top = topic.getBoundingClientRect().top + window.scrollY - 80;
      sessionStorage.setItem('agmachie:topicScrollY', String(Math.max(0, top)));
    }
    sessionStorage.setItem('agmachie:lastTopicHref', href);
    sessionStorage.setItem('agmachie:restoreTopic', '1');
    sessionStorage.setItem('agmachie:restoreSection', 'topic');
  };

  return (
    <section className="h-full">
       <h2 className="mb-4 flex items-center gap-3 border-l-4 border-[var(--accent)] pl-3 text-xl font-bold text-white">
         トピック
         <span className="text-xs font-normal text-gray-400">Topic picks</span>
       </h2>

       {post && (
         <Link
           href={post.href}
           data-topic-href={post.href}
           onClick={() => rememberTopic(post.href)}
           className="group block h-full"
         >
           <div className="relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-lg border border-[#444] bg-[#1f1f1f] p-5 shadow-lg transition-all duration-300 hover:border-[var(--accent)] hover:bg-[#242424] hover:shadow-[var(--accent)]/10">
             <div className="mb-2">
                 <span className="inline-block rounded bg-[var(--accent)]/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                     Topic
                 </span>
             </div>

             <h3 className="z-10 mb-3 line-clamp-2 text-lg font-bold leading-tight text-gray-100 transition-colors group-hover:text-[var(--accent)]">
                 {post.title}
             </h3>
             
             <p className="z-10 line-clamp-3 flex-grow text-sm leading-relaxed text-gray-400">
                 {post.excerpt}
             </p>
             
             <div className="z-10 mt-4 flex items-center justify-between border-t border-[#444] pt-3 text-sm text-gray-500 group-hover:text-gray-300">
                 <span className="font-mono text-xs opacity-70">{post.date}</span>
                 <span className="flex items-center gap-1 font-medium text-[var(--accent)] transition-all group-hover:gap-2">
                     Read
                     <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </span>
             </div>
           </div>
         </Link>
       )}
    </section>
  );
}
