import { getAllContentPosts, getAllPosts, getGitRecentUpdates, getRepositorySections } from '@/utils/posts';
import HomeClient from '@/components/HomeClient';
import FeaturedTopics from '@/components/FeaturedTopics';

export default async function Page() {
  const [posts, allContentPosts, recentUpdates, repositorySections] = await Promise.all([
    getAllPosts(),
    getAllContentPosts(),
    getGitRecentUpdates(5),
    getRepositorySections(),
  ]);

  // Prepare data for the client-side searchable list
  const searchEntries = allContentPosts.map(post => ({
    href: post.href,
    label: post.title,
    date: post.date,
    excerpt: post.excerpt,
    category: post.category,
    searchText: post.searchText,
  }));

  return (
    <HomeClient
      searchEntries={searchEntries}
      blogPosts={posts}
      latestPosts={recentUpdates}
      repositorySections={repositorySections}
    >
      <div className="w-full">
         <FeaturedTopics posts={posts} />
      </div>
    </HomeClient>
  );
}
