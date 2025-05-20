'use client'

import { TypeAnimation } from 'react-type-animation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ImageCarousel from '@/components/ImageCarousel'
import SearchableList from '@/components/SearchableList'

const heroImages = [
  { src: '/img/1.jpg', alt: '写真1' },
  { src: '/img/2.jpg', alt: '写真2' },
  { src: '/img/3.jpg', alt: '写真3' },
  { src: '/img/4.jpg', alt: '写真4' },
]
// JSX の外で定義する
const blogEntries = [
    { href: '/docs/blog/sekinen', label: '積年良土とは' },
    { href: '/docs/blog/230804', label: '農業機械の進化' },
    { href: '/docs/blog/230913', label: '乗用田植機' },
    { href: '/docs/blog/230914', label: 'v-solar' },
    { href: '/docs/blog/231018', label: 'なぜ秒速？' },
    { href: '/docs/blog/240723', label: 'Biofumigation' },
    { href: '/docs/blog/241116', label: 'Header 戦争~Draper vs Auger~' },
    { href: '/docs/blog/241118', label: 'US クイックヒッチのなぞ' },
    { href: '/docs/blog/250324', label: 'claas india とヤンマー' },
    { href: '/docs/blog/250327', label: 'クレトラック' },
    { href: '/docs/blog/250404', label: 'CFX750から速度信号を取り出せるか1' },
    { href: '/docs/blog/250407', label: 'CFX750から速度信号を取り出せるか2' },
    { href: '/docs/blog/250418', label: 'CFX750から速度信号を取り出せるか3' },
    { href: '/docs/blog/250422', label: 'ロマン・スガノ' },
    { href: '/docs/blog/250519', label: 'イセキ・モトコフ プランター(チェコ)' },
    { href: '/docs/blog/250520', label: '代掻きの必要性' },
    { href: '/docs/blog/250520_2', label: '作物の要水量' },
]

export default function Home() {
    return (
        <div className="flex justify-center">
            <main className="px-4">
                {/* HERO */}
                <section className="py-24 text-center">
                    <h1 className="text-10xl font-bold text-green-400">
                        <TypeAnimation
                            sequence={[
                                'Agricultural Machinery Repository', 1200,
                                'Welcome, curious engineer.',      1200,
                                '農業機械　リポジトリ',              1500,
                                'ようこそ',                        1800,
                            ]}
                            speed={{ type: 'keyStrokeDelayInMs', value: 200 }}
                            repeat={Infinity}
                        />
                    </h1>
                    <p className="mt-6 text-[#5a5a5a] leading-relaxed">
                        最新・旧式の農業機械の情報をストックし、開発者・生産者・機械オタクに役立つ情報を
                        共有するリポジトリサイトです。
                    </p>
                </section>

                {/* Image Carousel */}
                <section className="py-10">
                        <ImageCarousel images={heroImages} interval={4000} />
                </section>

                {/* 日本の特色 */}
                <section className="py-20 border-t border-[#222]">
                    <h2 className="mb-8 text-center">日本の特色ある機械たち</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {[
                            { href: '/docs/ag/kaihatsu/index', label: '北海道開発の機械' },
                        ].map((q) => (
                            <motion.li
                                whileHover={{ y: -4, scale: 1.03 }}
                                key={q.href}
                                className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
                            >
                                <Link href={q.href}>{q.label}</Link>
                            </motion.li>
                        ))}
                    </ul>
                </section>

                {/* 各国の特色 */}
                <section className="py-20 border-t border-[#222]">
                    <h2 className="mb-8 text-center">各国の特色ある機械たち</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {[
                            { href: '/docs/ag/Thailand/index', label: 'タイ' },
                            { href: '/docs/ag/Brazil/index',   label: 'ブラジル' },
                            { href: '/docs/ag/Australia/index',label: 'オーストラリア' },
                        ].map((q) => (
                            <motion.li
                                whileHover={{ y: -4, scale: 1.03 }}
                                key={q.href}
                                className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
                            >
                                <Link href={q.href}>{q.label}</Link>
                            </motion.li>
                        ))}
                    </ul>
                </section>

                {/* メーカー */}
                <section className="py-20 border-t border-[#222]">
                    <h2 className="mb-8 text-center">農業機械のメーカ−(普通ではない)</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {[
                            { href: '/docs/ag/deere/index',   label: 'John Deere' },
                            { href: '/docs/ag/morooka/index', label: 'モロオカ'   },
                            { href: '/docs/ag/cat/index',     label: 'Caterpillar' },
                            { href: '/docs/ag/claas/index',   label: 'Claas'       },
                        ].map((q) => (
                            <motion.li
                                whileHover={{ y: -4, scale: 1.03 }}
                                key={q.href}
                                className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
                            >
                                <Link href={q.href}>{q.label}</Link>
                            </motion.li>
                        ))}
                    </ul>
                </section>

                {/* 機械各論 */}
                <section className="py-20 border-t border-[#222]">
                    <h2 className="mb-8 text-center">機械各論</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {[
                            { href: '/docs/ag/landLevel/index',    label: 'レベラー'                   },
                            { href: '/docs/ag/landHarrow/index',   label: 'スペードブレードローラー'   },
                            { href: '/docs/ag/landClearing/index', label: '開拓/Land Clearing'         },
                        ].map((q) => (
                            <motion.li
                                whileHover={{ y: -4, scale: 1.03 }}
                                key={q.href}
                                className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
                            >
                                <Link href={q.href}>{q.label}</Link>
                            </motion.li>
                        ))}
                    </ul>
                </section>

                {/* ブログ記事 */}
                <section className="py-20 border-t border-[#222]">
                    <h2 className="mb-8 text-center">ブログ記事</h2>

                    {/* 検索付きリスト */}
                    <div className="mb-12 w-full">
                        <SearchableList entries={blogEntries} />
                    </div>
                </section>
            </main>
        </div>
    )
}
