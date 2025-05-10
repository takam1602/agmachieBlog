import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { replaceRelativePaths } from '@/utils/markdown';
import MarkdownImage from '@/components/MarkdownImage';

const OWNER = 'takam1602';
const REPO = 'AgMachine';
const BRANCH = 'main';
export const revalidate = 300;

export default async function Home() {
  const res = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/README.md`,
    { next: { revalidate: 300 } });
  let md = await res.text();
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


