'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/docs/blog' }, // 暫定的にトップのブログセクションへ誘導する意図、あるいは専用ページがあればそちら
  { label: 'Repository', href: '/#repository' }, // IDリンクなどで対応予定
]

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo / Title */}
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-green-400 transition">
          AgMachine
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-green-400 ${
                pathname === item.href ? 'text-green-400' : 'text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Open menu</span>
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-[#333] bg-[#1a1a1a]">
          <nav className="flex flex-col p-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-green-400 ${
                  pathname === item.href ? 'text-green-400' : 'text-gray-300'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
