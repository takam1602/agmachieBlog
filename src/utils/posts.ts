import fs from 'fs/promises';
import { Stats } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  excerpt: string;
  href: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');

/**
 * Markdownの本文からプレーンテキストの抜粋を生成する
 */
function createExcerpt(content: string, length: number = 100): string {
  const plain = content
    .replace(/^#+\s+(.*)$/gm, '')
    .replace(/!\s*\[.*?\]\(.*\)/g, '')
    .replace(/.*\]\(.*\)/g, '$1')
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= length) return plain;
  return plain.substring(0, length) + '...';
}

/**
 * ファイル名から日付を推測する
 */
function getDateFromFilename(filename: string, stats: Stats): string {
  const match = filename.match(/^(\d{2})(\d{2})(\d{2})(_\d+)?\.md$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = match[2];
    const day = match[3];
    return `20${year}-${month}-${day}`;
  }
  return stats.mtime.toISOString().split('T')[0];
}

/**
 * Git履歴から最新の変更ファイルを取得する
 */
export async function getGitRecentUpdates(limit: number = 5): Promise<BlogPost[]> {
  try {
    // content/ 以下の変更履歴を取得
    // フォーマット: 日付\nファイルパス... (空行区切り)
    // --name-only: ファイル名のみ表示
    // --pretty=format:"%ad": 日付のみ表示
    const { stdout } = await execAsync(
      'git log --name-only --pretty=format:"GIT_LOG_DATE:%ad" --date=short -n 100 content/'
    );

    const lines = stdout.split('\n');
    const updates = new Map<string, string>(); // filePath -> date (keep only latest) 
    
    let currentDate = '';

    for (const line of lines) {
      if (line.startsWith('GIT_LOG_DATE:')) {
        currentDate = line.replace('GIT_LOG_DATE:', '').trim();
        continue;
      }
      
      const filePath = line.trim();
      if (!filePath || !filePath.endsWith('.md')) continue;

      // 既に登録済み（より新しい日付）があればスキップ
      if (!updates.has(filePath)) {
        updates.set(filePath, currentDate);
      }
      
      if (updates.size >= limit * 2) break; // 少し多めに取って後でフィルタ
    }

    const results: BlogPost[] = [];
    
    for (const [relPath, date] of updates.entries()) {
      if (results.length >= limit) break;

      const fullPath = path.join(process.cwd(), relPath);
      
      try {
        const fileContent = await fs.readFile(fullPath, 'utf8');
        const { content } = matter(fileContent);

        // Title extraction
        const titleMatch = content.match(/^#\s+(.*)$/m);
        const title = titleMatch ? titleMatch[1] : path.basename(relPath, '.md');
        
        // パスからカテゴリ的なものを付与してもいいかも
        // 例: content/ag/usa/xxx.md -> [AG] xxx
        
        // Generate HREF
        // content/blog/xxx.md -> /docs/blog/xxx/
        // content/ag/usa/xxx.md -> /docs/ag/usa/xxx/
        // remove 'content/' prefix and '.md' suffix
        const urlPath = relPath.replace(/^content\//, '').replace(/\.md$/, '');
        const href = `/docs/${urlPath}/`;
        
        // Excerpt
        const excerpt = createExcerpt(content, 120);

        results.push({
          slug: urlPath.replace(/\//g, '-'), // dummy slug
          title,
          date,
          excerpt,
          href,
        });

      } catch {
        // ファイルが削除されている場合などは無視
        continue;
      }
    }

    return results;

  } catch (error) {
    console.warn('Failed to get git log, falling back to fs stats:', error);
    // Fallback: Just return blog posts sorted by filename date as before
    return getAllPosts();
  }
}

/**
 * ブログ記事のみを取得 (既存機能維持)
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const posts: BlogPost[] = [];

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const filePath = path.join(BLOG_DIR, file);
      const stats = await fs.stat(filePath);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { content } = matter(fileContent);

      const titleMatch = content.match(/^#\s+(.*)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
      const date = getDateFromFilename(file, stats);
      const excerpt = createExcerpt(content, 120);

      posts.push({
        slug: file.replace('.md', ''),
        title,
        date,
        excerpt,
        href: `/docs/blog/${file.replace('.md', '')}/`,
      });
    }

    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (e) {
    console.error('Error getting posts:', e);
    return [];
  }
}