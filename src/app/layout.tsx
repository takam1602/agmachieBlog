import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'AgMachine',
  description: 'Agricultural machinery photo blog',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="mt-16 py-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm">
          © {new Date().getFullYear()} AgMachine
        </footer>
      </body>
    </html>
  )
}
