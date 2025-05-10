'use client'
import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '/',       label: 'Home'   },
  { href: '/view',   label: 'Repo'   },
  { href: '/blog',   label: 'Blog'   },
  { href: '/gallery',label: 'Gallery'},
  { href: '/upload', label: 'Upload' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-20">
      <nav className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="text-lg font-semibold text-brand">
          AgMachine
        </Link>

        {/* ハンバーガー */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden text-2xl text-brand focus:outline-none"
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* リンク */}
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
                className="block py-2 sm:py-0 hover:text-brand-dark transition"
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
