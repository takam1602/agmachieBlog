import nextMdx from '@next/mdx'

const withMdx = nextMdx({
  // .md と .mdx を Next.js で扱えるように
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [import('remark-gfm').then((m) => m.default)],
    rehypePlugins: [import('rehype-raw').then((m) => m.default)],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts', 'mdx', 'md'],
  images: {
    // 開発中のトラブルを避けるため、一時的に最適化を無効化するのも一つの手です
    // unoptimized: true, 

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // すべてのHTTPS画像を許可（開発用として強力）
      },
    ],
  },
}

export default withMdx(nextConfig)
