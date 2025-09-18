import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'MicroSite Forge',
    template: '%s | MicroSite Forge',
  },
  description: 'AI-powered microsite factory for local lead generation',
  keywords: ['microsites', 'lead generation', 'AI', 'automation', 'local business'],
  authors: [{ name: 'MicroSite Forge Team' }],
  creator: 'MicroSite Forge',
  publisher: 'MicroSite Forge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'MicroSite Forge',
    description: 'AI-powered microsite factory for local lead generation',
    siteName: 'MicroSite Forge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MicroSite Forge',
    description: 'AI-powered microsite factory for local lead generation',
    creator: '@MicroSiteForge',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div id="root">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
