'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold text-brand">AgMachine</Link>
        <button
          className="sm:hidden text-brand"
          onClick={() => setOpen(!open)}
        >☰</button>
        <ul className={`sm:flex gap-6 ${open ? 'block' : 'hidden'} sm:block`}>
          <li><Link href="/view"  className="hover:underline">Repo</Link></li>
          <li><Link href="/gallery" className="hover:underline">Gallery</Link></li>
          <li><Link href="/upload"  className="hover:underline">Upload</Link></li>
        </ul>
      </nav>
    </header>
  );
}
