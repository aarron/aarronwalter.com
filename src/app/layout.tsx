import type { Metadata } from 'next'
import Image from 'next/image'
import './globals.css'
import HamburgerMenu from '@/components/HamburgerMenu'
import { LightboxProvider } from '@/components/Lightbox'

export const metadata: Metadata = {
  metadataBase: new URL('https://aarronwalter.com'),
  title: {
    default: 'Aarron Walter',
    template: '%s — Aarron Walter',
  },
  description:
    'Co-founder of Design Better. Two decades shaping how the tech industry thinks about design — from Mailchimp to the White House.',
  openGraph: {
    title: 'Aarron Walter',
    description:
      'Designer, co-founder of Design Better, and two-decade voice in how the tech industry thinks about design.',
    siteName: 'Aarron Walter',
    url: 'https://aarronwalter.com',
    type: 'website',
    images: [
      {
        url: '/Aarron.jpg',
        width: 1200,
        height: 630,
        alt: 'Aarron Walter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@aarron',
    site: '@aarron',
    title: 'Aarron Walter',
    description:
      'Designer, co-founder of Design Better, and two-decade voice in how the tech industry thinks about design.',
    images: ['/Aarron.jpg'],
  },
  alternates: {
    canonical: 'https://aarronwalter.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Aktiv Grotesk via Adobe Fonts */}
        <link rel="stylesheet" href="https://use.typekit.net/xui7gpv.css" />
      </head>
      <body>
        <a href="/" aria-label="Aarron Walter" className="site-logo">
          <Image src="/alt-aw-logo.png" alt="Aarron Walter" width={891} height={891} priority />
        </a>
        <HamburgerMenu />
        <LightboxProvider>
          <div id="page-content">
            {children}
          </div>
        </LightboxProvider>
      </body>
    </html>
  )
}
