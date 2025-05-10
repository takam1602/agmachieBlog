/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import MarkdownImage from '@/components/MarkdownImage';
import { replaceRelativePaths } from '@/utils/markdown';

const OWNER = 'takam1602';
const REPO  = 'AgMachine';
const BRANCH = 'main';

type GitHubFile = {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  download_url: string | null;
};

export const revalidate = 300;

export default async function Viewer({ params }: { params: any }) {
  const path = params.slug?.join('/') ?? '';
  const apiURL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

  const res = await fetch(apiURL, { next: { revalidate: 300 } });
  if (res.status === 404) return <p className="p-8">Not found</p>;
  const data: GitHubFile[] | GitHubFile = await res.json();

  /* ---------- Directory ---------- */
  if (Array.isArray(data)) {
    const dirs  = data.filter((f) => f.type === 'dir');
    const files = data.filter((f) => f.type === 'file');
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{`/${path}` || 'root'}</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          {dirs.map((d) => (
            <Link key={d.path} href={`/view/${d.path}`} className="card hover:shadow-lg">
              📁  {d.name}
            </Link>
          ))}
          {files.map((f) => (
            <Link key={f.path} href={`/view/${f.path}`} className="card hover:shadow-lg">
              📄  {f.name}
            </Link>
          ))}
        </div>
      </main>
    );
  }

  /* ---------- File (Markdown / その他) ---------- */
  const file = data;
  if (file.name.endsWith('.md')) {
    const raw = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${file.path}`,
      { next: { revalidate: 300 } });
    let md = await raw.text();
    md = replaceRelativePaths(md, OWNER, REPO, BRANCH);
    return (
      <main className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            img: ({ src, alt }) =>
              typeof src === 'string' ? <MarkdownImage src={src} alt={alt} /> : null,
          }}
        >
          {md}
        </ReactMarkdown>
      </main>
    );
  }

  /* 非 Markdown → ダウンロードリンク */
  return (
    <main className="p-8">
      <a
        href={file.download_url ?? '#'}
        className="btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download {file.name}
      </a>
    </main>
  );
}
