import type { Metadata } from 'next'
import './globals.css'
import HamburgerMenu from '@/components/HamburgerMenu'

export const metadata: Metadata = {
  title: 'Aarron Walter',
  description:
    'Co-founder of Design Better. Two decades shaping how the tech industry thinks about design — from Mailchimp to the White House.',
  openGraph: {
    title: 'Aarron Walter',
    description:
      'Designer, co-founder of Design Better, and two-decade voice in how the tech industry thinks about design.',
    siteName: 'Aarron Walter',
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
        <HamburgerMenu />
        <div id="page-content">
          {children}
        </div>
      </body>
    </html>
  )
}
