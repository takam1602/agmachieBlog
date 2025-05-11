'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',      label: 'Home' },
  { href: '/docs',  label: 'Docs' },
  { href: '/blog',  label: 'Blog' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/upload',  label: 'Upload' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* ロゴ */}
        <Link href="/" className="text-xl font-bold text-brand">
          AgMachine
        </Link>

        {/* ハンバーガー (sm 未満で表示) */}
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl text-brand sm:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* メニュー */}
        <ul
          className={`sm:flex gap-6 font-medium ${
            open ? 'block mt-4 sm:mt-0' : 'hidden sm:block'
          }`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block py-2 sm:py-0 ${
                  pathname === l.href ? 'text-brand-dark' : 'hover:text-brand-dark'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
