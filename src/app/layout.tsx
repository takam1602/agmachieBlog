import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: {
    default: 'AgMachine Repository',
    template: '%s | AgMachine Repository',
  },
  description: '新旧の技術、地域ごとの特色、メーカーの記録を蓄積する農業機械のリポジトリ。',
  metadataBase: new URL('https://agmachie-blog.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'AgMachine Repository',
    title: 'AgMachine Repository',
    description: '農業機械の俺俺リポジトリ。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="flex min-h-screen flex-col bg-page text-ink">
        <a
          href="#main-content"
          className="btn-primary fixed left-4 top-3 z-[100] -translate-y-20 text-sm focus:translate-y-0"
        >
          本文へスキップ
        </a>
        <Header />
        <main id="main-content" className="flex-grow" tabIndex={-1}>
          {children}
        </main>
        <footer className="border-t-4 border-brand bg-footer text-footer-ink">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <p className="text-base font-bold text-footer-ink">AgMachine Repository</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-footer-ink-2">
                農業機械の技術と記録。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <Link href="/#search" className="text-footer-ink hover:text-yellow hover:underline">検索</Link>
              <Link href="/#repository" className="text-footer-ink hover:text-yellow hover:underline">記事一覧</Link>
              <a
                href="https://github.com/takam1602/agmachieBlog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-footer-ink hover:text-yellow hover:underline"
              >
                GitHub ↗
              </a>
              <span className="text-footer-ink-2">© {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
