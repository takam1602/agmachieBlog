import './globals.css'
import Navbar from '@/components/Navbar'

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="ja">
      <body>
        <Navbar/>
        {children}
        <footer className="text-center py-8 text-xs text-[#5a5a5a] border-t border-[#222]">
          <p>{new Date().getFullYear()} @takam1602 | Powered by Next.js & Tailwind CSS</p>
          <p className="mt-2">
            <a href="https://github.com/takam1602" className="hover:text-[var(--link-hover)]">contact@takam1602</a>
          </p>
        </footer>
      </body>
    </html>
  )
}
