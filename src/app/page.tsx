import { getAllPosts, getGitRecentUpdates } from '@/utils/posts';
import HomeClient from '@/components/HomeClient';
import FeaturedTopics from '@/components/FeaturedTopics';

export default async function Page() {
  // 1. Blog posts for the searchable grid (Archives)
  const posts = await getAllPosts();

  // 2. Recent updates from Git log (for What's New ticker)
  // This includes ALL content (blog + ag + etc)
  const recentUpdates = await getGitRecentUpdates(5);

  // Pick a featured post deterministically or randomly on the SERVER side.
  const featuredPost = posts.length > 0 
    ? posts[Math.floor(Math.random() * posts.length)] 
    : null;

  // Prepare data for the client-side searchable list
  const blogEntries = posts.map(post => ({
    href: post.href,
    label: post.title,
    date: post.date,
    excerpt: post.excerpt
  }));

  return (
    <HomeClient blogEntries={blogEntries} latestPosts={recentUpdates}>
      <div className="w-full">
         <FeaturedTopics post={featuredPost} />
      </div>
    </HomeClient>
  );
}