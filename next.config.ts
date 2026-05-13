import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'megaphone.imgix.net',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
