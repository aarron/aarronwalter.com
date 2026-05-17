import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF first, WebP fallback — significant file-size savings
    formats: ['image/avif', 'image/webp'],
    // Breakpoints that match the site's responsive layout
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [32, 64, 128, 256, 384, 512],
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
