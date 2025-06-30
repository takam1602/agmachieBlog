import nextMdx from '@next/mdx'

const withMdx = nextMdx({
  // .md と .mdx を Next.js で扱えるように
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [import('remark-gfm').then((m) => m.default)],
    rehypePlugins: [import('rehype-raw').then((m) => m.default)],
  },
})

export default withMdx({
  pageExtensions: ['tsx', 'ts', 'mdx', 'md'],
  images: { unoptimized: true }, // 開発中は楽なので off
})
