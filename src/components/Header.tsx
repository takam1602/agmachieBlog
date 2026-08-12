'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { label: '最近の更新', href: '/#latest' },
  { label: 'ニュース', href: '/#news' },
  { label: 'コレクション', href: '/#repository' },
  { label: 'ブログ', href: '/#blog' },
]

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3 text-white" aria-label="AgMachine Repository ホーム">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 text-sm font-black text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/15">
            AG
          </span>
          <span className="leading-none">
            <span className="block text-sm font-bold tracking-wide text-gray-100 group-hover:text-white">AgMachine</span>
            <span className="mt-1 block text-[9px] font-medium tracking-[0.2em] text-gray-600">REPOSITORY</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <nav className="mr-2 flex items-center" aria-label="メインナビゲーション">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white lg:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <a
            href="https://github.com/takam1602/agmachieBlog"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHubでソースを見る"
            className="grid h-10 w-10 place-items-center rounded-full text-gray-500 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <Github size={18} />
          </a>
          <Link
            href="/#search"
            className="ml-1 inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white/[0.04] px-4 text-xs font-semibold text-gray-200 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
          >
            <Search size={15} aria-hidden="true" />
            検索
            <kbd className="hidden rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[9px] font-normal text-gray-600 lg:inline">/</kbd>
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-gray-300 transition-colors hover:bg-white/[0.05] hover:text-white md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--bg-primary)] md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-4" aria-label="モバイルナビゲーション">
            <Link href="/" className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/[0.04] hover:text-white">
              ホーム
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/[0.04] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2 border-t border-[var(--border)] pt-4">
              <Link href="/#search" style={{ color: '#07140f' }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] font-bold text-[#07140f] hover:bg-[var(--accent-hover)] hover:text-[#07140f]">
                <Search size={16} /> リポジトリを検索
              </Link>
              <a href="https://github.com/takam1602/agmachieBlog" target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] text-gray-400 hover:text-white" aria-label="GitHubでソースを見る">
                <Github size={18} />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
