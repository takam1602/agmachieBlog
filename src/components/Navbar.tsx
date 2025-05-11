'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',      label: 'Home' },
  { href: '/docs',  label: 'Docs' },
  { href: '/blog',  label: 'Blog' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/upload',  label: 'Upload' },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-7xl mx-auto flex items-center gap-8 px-4 sm:px-6 py-3">
        <Link href="/" className="text-xl font-bold text-brand">
          AgMachine
        </Link>
        <ul className="flex gap-6 text-sm sm:text-base font-medium">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`hover:text-brand-dark ${
                  path === l.href ? 'text-brand-dark' : ''
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
