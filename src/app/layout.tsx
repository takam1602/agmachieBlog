import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'Agricultural Machinery Repository',
  description: '気になった農業機械や技術をまとめるブログ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {/* MDXProvider をここで包む */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
