import './globals.css'
import Providers from './providers'
import Header from '@/components/Header'

export const metadata = {
  title: 'Agricultural Machinery Repository',
  description: '農業機械の情報をまとめるリポジトリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-8 text-center text-sm text-gray-500 border-t border-[#333] bg-[#121212]">
            © {new Date().getFullYear()} AgMachine Repository
          </footer>
        </Providers>
      </body>
    </html>
  )
}
