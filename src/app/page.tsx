import Link from 'next/link'
import ImageCarousel from '@/components/ImageCarousel'

const images = ['/img/1.jpg', '/img/2.jpg', '/img/3.jpg', '/img/4.jpg']

const quickLinks = [
  { href: '/docs/ag/kaihatsu/README', label: '北海道開発' },
  { href: '/docs/blog/sekinen',       label: '積年良土'   },
  { href: '/docs/ag/Thailand/README', label: 'タイ'       },
  { href: '/docs/ag/Brazil/README',   label: 'ブラジル'   },
  { href: '/docs/ag/Australia/README',label: 'オーストラリア' },
  { href: '/docs/ag/deere/README',    label: 'John Deere' },
  { href: '/docs/ag/morooka/README',  label: 'モロオカ'   },
  { href: '/docs/ag/cat/README',      label: 'Caterpillar'},
  { href: '/docs/ag/claas/README',    label: 'Claas'      },
]

export default function Home() {
  return (
    <section className="space-y-12">
      {/* hero */}
      <div className="space-y-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">
          AgMachine リポジトリへようこそ
        </h1>
        <p className="text-brand-dark">
          最新・旧式の農業機械の情報を格納しているレポジトリです
        </p>
        <ImageCarousel images={images} />
      </div>

      {/* quick links */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Links</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickLinks.map((q) => (
            <li key={q.href}>
              <Link
                href={q.href}
                className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md hover:-translate-y-0.5 transition"
              >
                {q.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
