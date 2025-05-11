'use client'
import { TypeAnimation } from 'react-type-animation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ImageCarousel from '@/components/ImageCarousel'
const heroImages = ['/img/1.jpg','/img/2.jpg','/img/3.jpg','/img/4.jpg']

export default function Home() {
    return (
        <main className="max-w-3xl mx-auto px-4">
        {/* HERO */}
        <section className="py-24 text-center">
        <h1>
        <TypeAnimation
        sequence={[
            'Agricultural Machinery Repository',
            1200,
            'Welcome, curious engineer.',
            1200,
            '農業機械　リポジトリ',
            1500,
            'ようこそ',
            1800,
        ]}
        speed={{type: 'keyStrokeDelayInMs', value:200}}
        repeat={Infinity}
        />
        </h1>
        
        <p className="mt-6 text-[#5a5a5a] max-w-xl mx-auto leading-relaxed">
        最新・旧式の農業機械の情報をストックし、開発者・生産者・機械オタクに役立つ情報を共有する
        リポジトリサイトです。
        </p>
        </section>

        <section className="relative isolate"> <ImageCarousel images={heroImages} interval={4000} />
        </section>

        <section className="py-20 border-t border-[#222]">
        <h2 className="mb-8 text-center">日本の特色ある機械たち</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[
            { href: '/docs/ag/kaihatsu/README', label: '北海道開発の機械' },
            // { href: '/docs/ag/kaihatsu/README', label: '八郎潟開発の機械(工事中)' },
            // { href: '/docs/ag/kaihatsu/README', label: '新篠津開発の機械(工事中)' },
        ].map((q) => (
            <motion.li
            whileHover={{ y:-4, scale:1.03 }}
            key={q.href}
            className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
            >
            <Link href={q.href}>{q.label}</Link>
            </motion.li>
        ))}
        </ul>
        </section>

        <section className="py-20 border-t border-[#222]">
        <h2 className="mb-8 text-center">各国の特色ある機械たち</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[
            { href: '/docs/ag/Thailand/README', label: 'タイ'       },
            { href: '/docs/ag/Brazil/README',   label: 'ブラジル'   },
            { href: '/docs/ag/Australia/README',label: 'オーストラリア' },
        ].map((q) => (
            <motion.li
            whileHover={{ y:-4, scale:1.03 }}
            key={q.href}
            className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
            >
            <Link href={q.href}>{q.label}</Link>
            </motion.li>
        ))}
        </ul>
        </section>

        <section className="py-20 border-t border-[#222]">
        <h2 className="mb-8 text-center">農業機械のメーカ−(普通ではない)</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[
            { href: '/docs/ag/deere/README',    label: 'John Deere' },
            { href: '/docs/ag/morooka/README',  label: 'モロオカ'   },
            { href: '/docs/ag/cat/README',      label: 'Caterpillar'},
            { href: '/docs/ag/claas/README',    label: 'Claas'      },
        ].map((q) => (
            <motion.li
            whileHover={{ y:-4, scale:1.03 }}
            key={q.href}
            className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
            >
            <Link href={q.href}>{q.label}</Link>
            </motion.li>
        ))}
        </ul>
        </section>

        <section className="py-20 border-t border-[#222]">
        <h2 className="mb-8 text-center">機械各論</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[
            { href: '/docs/ag/landLevel/README', label: 'レベラー' },
            { href: '/docs/ag/landHarrow/README', label: 'スペードブレードローラー'       },
            { href: '/docs/ag/landClearing/README',   label: '開拓/Ladnd Clearing'   },
        ].map((q) => (
            <motion.li
            whileHover={{ y:-4, scale:1.03 }}
            key={q.href}
            className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
            >
            <Link href={q.href}>{q.label}</Link>
            </motion.li>
        ))}
        </ul>
        </section>

        {/* QUICK GRID */}
        <section className="py-20 border-t border-[#222]">
        <h2 className="mb-8 text-center">ブログ</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[
            { href: '/docs/blog/sekinen',       label: '積年良土とは'   },
            { href: '/docs/blog/230804',        label:'農業機械の進化'},
            { href: '/docs/blog/230913',        label:'乗用田植機'},
            { href: '/docs/blog/230914',        label:'v-solar'},
            { href: '/docs/blog/231018',        label:'なぜ秒速？'},
            { href: '/docs/blog/240723',        label:'Biofumigation'},
            { href: '/docs/blog/241116',        label:'Header 戦争~Draper vs Auger~'},
            { href: '/docs/blog/241118',        label:'US クイックヒッチのなぞ'},
            { href: '/docs/blog/250324',        label:'claas indiaとヤンマー'},
            { href: '/docs/blog/250327',        label:'クレトラック'},
            { href: '/docs/blog/250404',        label:'CFX750から速度信号を取り出せるか1'},
            { href: '/docs/blog/250407',        label:'CFX750から速度信号を取り出せるか2'},
            { href: '/docs/blog/250418',        label:'CFX750から速度信号を取り出せるか3'},
            { href: '/docs/blog/250422',        label:'ロマン・スガノ'},
        ].map((q) => (
            <motion.li
            whileHover={{ y:-4, scale:1.03 }}
            key={q.href}
            className="border border-[#222] rounded p-4 text-center hover:border-[var(--fg)] transition"
            >
            <Link href={q.href}>{q.label}</Link>
            </motion.li>
        ))}
        </ul>
        </section>

        
        </main>
    )
}
