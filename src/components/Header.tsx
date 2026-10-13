'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const navItems = [
  { label: 'NEW!!', href: '/#latest' },
  { label: 'ニュース', href: '/#news' },
  { label: '記事', href: '/#repository' },
  { label: 'ブログ', href: '/#blog' },
  { label: 'ノート', href: '/notes' },
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
    <header className="sticky top-0 z-50 w-full border-b border-line bg-page">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3 text-ink hover:text-ink" aria-label="AgMachine Repository ホーム">
          {/*
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 text-sm font-black text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/15">
            AG
          </span>
          */}
          
          <Image
          src="/img/logo_main.jpg"
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 object-contain"
          priority
          />

          <span className="leading-none">
            <span className="block text-base font-bold text-ink">AgMachine</span>
            <span className="mt-1 block text-[10px] font-bold tracking-[0.12em] text-brand-text">REPOSITORY</span>
          </span>
        </Link>

        <div className="hidden h-full items-center gap-2 md:flex">
          <nav className="mr-2 flex h-full items-stretch" aria-label="メインナビゲーション">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center border-b-4 border-transparent px-3 pt-1 text-sm font-bold text-ink transition-colors hover:border-yellow hover:text-ink lg:px-4"
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
            className="grid h-10 w-10 place-items-center text-ink-2 transition-colors hover:text-brand-text"
          >
            <Github size={18} />
          </a>
          <Link href="/#search" className="btn-primary min-h-10 px-4 text-sm">
            <Search size={15} aria-hidden="true" />
            検索
            <kbd className="hidden border border-on-yellow/40 px-1.5 py-0.5 font-mono text-[10px] font-normal lg:inline">/</kbd>
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center text-ink transition-colors hover:text-brand-text md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div id="mobile-nav" className="border-t border-line bg-page md:hidden">
          <nav className="mx-auto grid max-w-7xl px-4 py-2" aria-label="モバイルナビゲーション">
            <Link href="/" className="border-b border-line px-1 py-3.5 text-base font-bold text-ink hover:text-brand-text">
              ホーム
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line px-1 py-3.5 text-base font-bold text-ink hover:text-brand-text"
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-[1fr_auto] gap-2 py-4">
              <Link href="/#search" className="btn-primary">
                <Search size={16} /> リポジトリを検索
              </Link>
              <a href="https://github.com/takam1602/agmachieBlog" target="_blank" rel="noopener noreferrer" className="grid h-[2.875rem] w-[2.875rem] place-items-center border-2 border-ink text-ink hover:text-brand-text" aria-label="GitHubでソースを見る">
                <Github size={18} />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
