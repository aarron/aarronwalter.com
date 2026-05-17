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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Block MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Only send origin as referrer for cross-origin requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features this site doesn't use
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Force HTTPS for 1 year (only active once served over HTTPS / on Vercel)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              // Only load scripts from self (Next.js inline scripts use nonces via middleware if needed)
              "default-src 'self'",
              // Inline styles needed by Next.js + Adobe Fonts
              "style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
              // Scripts: self + Adobe Fonts loader
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://use.typekit.net",
              // Fonts: self + Adobe Fonts CDN
              "font-src 'self' https://use.typekit.net https://p.typekit.net",
              // Images: self + podcast artwork + Open Library covers (redirect via archive.org) + Discogs + Amazon CDN
              "img-src 'self' data: blob: https://megaphone.imgix.net https://covers.openlibrary.org https://archive.org https://*.archive.org https://*.us.archive.org https://img.discogs.com https://i.discogs.com https://m.media-amazon.com https://images-na.ssl-images-amazon.com",
              // API calls: self + Discogs + OpenLibrary (contact form now hits /api/contact internally)
              "connect-src 'self' https://api.discogs.com https://openlibrary.org",
              // Podcast player embed (if any iframes)
              "frame-src 'self'",
              // Media: self + podcast CDN
              "media-src 'self' https://megaphone.imgix.net",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
