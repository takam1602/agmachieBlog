import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import Providers from './providers'
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
    description: '農業機械の情報をまとめる、Markdownベースのオープンなリポジトリ。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#07140f] transition-transform focus:translate-y-0"
        >
          本文へスキップ
        </a>
        <Providers>
          <Header />
          <main id="main-content" className="flex-grow" tabIndex={-1}>
            {children}
          </main>
          <footer className="border-t border-[var(--border)] bg-[#0b0d0c]">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <div>
                <p className="text-sm font-bold text-gray-300">AgMachine Repository</p>
                <p className="mt-2 max-w-md text-xs leading-5 text-gray-600">
                  農業機械の技術と記録を、Markdownから継続的に公開するアーカイブ。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                <Link href="/#search" className="text-gray-500 hover:text-gray-200">検索</Link>
                <Link href="/#repository" className="text-gray-500 hover:text-gray-200">コレクション</Link>
                <a
                  href="https://github.com/takam1602/agmachieBlog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-200"
                >
                  GitHub ↗
                </a>
                <span>© {new Date().getFullYear()}</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
