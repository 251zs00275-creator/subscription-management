import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/components/Layout/Providers'
import { Sidebar } from '@/components/Layout/Sidebar'
import { Header } from '@/components/Layout/Header'
import { PageTransition } from '@/components/Layout/PageTransition'
import { AnimatedBackground } from '@/components/Layout/AnimatedBackground'

export const metadata: Metadata = {
  title: 'サブスク管理アプリ',
  description: 'サブスクリプションと定額支出をまとめて管理する個人向けWebアプリ',
  manifest: '/manifest.webmanifest',
  applicationName: 'サブスク管理',
  appleWebApp: {
    capable: true,
    title: 'サブスク管理',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/app-icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5FAFF' },
    { media: '(prefers-color-scheme: dark)', color: '#07111F' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <AnimatedBackground />
          <div className="academy-shell relative z-10 flex h-dvh overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-28 pt-5 sm:p-6 sm:pb-24 md:p-9 md:pb-28 xl:p-12 xl:pb-32">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
