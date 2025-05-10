const nextConfig = {
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
    ],
  },
};
module.exports = nextConfig;
