import { getAllContentPosts, getAllPosts, getGitRecentUpdates, getRepositorySections } from '@/utils/posts';
import { getWeeklyNews } from '@/utils/weeklyNews';
import HomeClient from '@/components/HomeClient';
import FeaturedTopics from '@/components/FeaturedTopics';

export default async function Page() {
  const [posts, allContentPosts, recentUpdates, repositorySections, weeklyNews] = await Promise.all([
    getAllPosts(),
    getAllContentPosts(),
    getGitRecentUpdates(5),
    getRepositorySections(),
    getWeeklyNews(),
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
      weeklyNewsLatest={weeklyNews.latest}
      weeklyNewsRandom={weeklyNews.random}
    >
      <div className="w-full">
         <FeaturedTopics posts={posts} />
      </div>
    </HomeClient>
  );
}
