import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'blog-minio',
        port: '9000',
        pathname: '/blog-images/**',
      },
    ],
  },
};

export default nextConfig;
