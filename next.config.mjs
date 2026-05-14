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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

export default withMdx(nextConfig)
