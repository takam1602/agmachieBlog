import './globals.css'
import Navbar from '@/components/Navbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center py-6 text-sm border-t border-gray-200 dark:border-gray-700">
          © {new Date().getFullYear()} AgMachine
        </footer>
      </body>
    </html>
  )
}
