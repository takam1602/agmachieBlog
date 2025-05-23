import './globals.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: "Agmachine",
    description: "ag machine repositry by takam1602。画像の無断転載は禁止します。",
    icons: {
        icon: '/favicon.ico',             
        shortcut: '/favicon-32x32.png',   
        apple: '/favicon-32x32.png',
    },
    verification:{
        google:"3ITIM0eNhLXG7UpZW7hjxVztQhiSe9Ajga0j3aIicIw",
    },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Navbar />
        {children}
        <footer className="text-center py-8 text-xs text-[#5a5a5a] border-t border-[#222]">
          <p>
            {new Date().getFullYear()} @takam1602 | Powered by Next.js & Tailwind CSS
          </p>
          <p className="mt-2">
            <a
              href="https://github.com/takam1602"
              className="hover:text-[var(--link-hover)]"
            >
              contact@takam1602
            </a>
          </p>
        </footer>
      </body>
    </html>
  )
}
