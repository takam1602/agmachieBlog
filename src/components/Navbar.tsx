"use client";

import Link from 'next/link'
// import { usePathname } from 'next/navigation'
import { Github, Twitter } from 'lucide-react'   // X=Twitter

{/*
const nav = [
  { href:'/',       label:'Home' },
]
*/}

export default function Navbar() {
  // const path = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-[#222] bg-neutral-900/90 backdrop-blur">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-[var(--fg)]">
          Home 
        </Link>

        {/* Links */}
        {/*
        <ul className="flex gap-6 text-sm sm:text-base font-medium">
          {nav.map((l)=>(
            <li key={l.href}>
              <Link
                href={l.href}
                className={
                  path===l.href
                    ? 'text-[var(--fg)]'
                    : 'text-[#5a5a5a] hover:text-[var(--fg)] transition-colors'
                }
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        */}

        {/* SNS */}
        <div className="flex gap-4 text-[#5a5a5a]">
          <a href="https://github.com/takam1602" target="_blank" aria-label="GitHub"
             className="hover:text-[var(--fg)] transition">
            <Github size={40}/>
          </a>
          <a href="https://x.com/huagdkmt" target="_blank" aria-label="X"
             className="hover:text-[var(--fg)] transition">
            <Twitter size={40}/>
          </a>
        </div>
      </nav>
    </header>
  )
}
