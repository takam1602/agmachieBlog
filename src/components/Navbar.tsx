'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white py-4 px-6 flex gap-4">
      <Link href="/">Home</Link>
      <Link href="/gallery">Gallery</Link>
      <Link href="/upload">Upload</Link>
      <Link href="/blog">Blog</Link>
      <Link href="/view">Repo</Link>
      <Link href="/login">Login</Link>
    </nav>
  )
}
