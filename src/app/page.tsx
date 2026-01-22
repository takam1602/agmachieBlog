'use client'

import { useState } from 'react'
import { TypeAnimation } from 'react-type-animation'
import Link from 'next/link'

import ImageCarousel  from '@/components/ImageCarousel'
import ImageLightbox  from '@/components/ImageLightbox'
import SearchableList from '@/components/SearchableList'

/* ---------- トップページ用画像 ---------- */
const heroImages = [
  { src: '/img/front/1.jpg',  alt: 'v',         width: 640, height: 480 },
  { src: '/img/front/2.jpg',  alt: 'カルチ',     width: 640, height: 480 },
  { src: '/img/front/3.jpg',  alt: '芋',         width: 640, height: 480 },
  { src: '/img/front/4.jpg',  alt: '栃木',       width: 640, height: 480 },
  { src: '/img/front/5.JPG',  alt: 'ディスク',   width: 640, height: 480 },
  { src: '/img/front/6.JPG',  alt: 'チゼル',     width: 640, height: 480 },
  { src: '/img/front/7.JPG',  alt: '9750',       width: 640, height: 480 },
  { src: '/img/front/8.JPG',  alt: 'タイ',       width: 640, height: 480 },
  { src: '/img/front/9.JPG',  alt: 'マンモス',   width: 640, height: 480 },
  { src: '/img/front/10.JPG', alt: 'wagga',      width: 640, height: 480 },
  { src: '/img/front/11.JPG', alt: '中国',       width: 640, height: 480 },
  { src: '/img/front/12.JPG', alt: '中国',       width: 640, height: 480 },
]

/* ---------- ブログ記事リスト ---------- */
const blogEntries = [
  { href: '/docs/blog/sekinen/',     label: '積年良土とは' },
  { href: '/docs/blog/230804/',      label: '農業機械の進化' },
  { href: '/docs/blog/230913/',      label: '乗用田植機' },
  { href: '/docs/blog/230914/',      label: 'v-solar' },
  { href: '/docs/blog/231018/',      label: 'なぜ秒速？' },
  { href: '/docs/blog/240723/',      label: 'Biofumigation' },
  { href: '/docs/blog/241116/',      label: 'Header 戦争~Draper vs Auger~' },
  { href: '/docs/blog/241118/',      label: 'US クイックヒッチのなぞ' },
  { href: '/docs/blog/250324/',      label: 'claas india とヤンマー' },
  { href: '/docs/blog/250327/',      label: 'クレトラック' },
  { href: '/docs/blog/250404/',      label: 'CFX750から速度信号を取り出せるか1' },
  { href: '/docs/blog/250407/',      label: 'CFX750から速度信号を取り出せるか2' },
  { href: '/docs/blog/250422/',      label: 'CFX750から速度信号を取り出せるか3' },
  { href: '/docs/blog/250418/',      label: 'ロマン・スガノ' },
  { href: '/docs/blog/250519/',      label: 'イセキ・モトコフ プランター(チェコ)' },
  { href: '/docs/blog/250520/',      label: '代掻きの必要性' },
  { href: '/docs/blog/250520_2/',    label: '作物の要水量' },
  { href: '/docs/blog/250525/',      label: '水稲の移植栽培' },
  { href: '/docs/blog/250525_2/',    label: '水稲の不耕起・部分耕・無代掻き移植栽培' },
  { href: '/docs/blog/250628/',      label: 'スガノのLプラウ' },
  { href: '/docs/blog/250728/',      label: 'ネタ帳' },
  { href: '/docs/blog/250801/',      label: 'ドリルは種まき機？' },
  { href: '/docs/blog/250812/',      label: 'Rotary vs Walker' },
  { href: '/docs/blog/250907/',      label: 'Tire vs Track' },
  { href: '/docs/blog/250910/',      label: 'トラクターのフロントレーキ' },
  { href: '/docs/blog/250922/',      label: 'ドイツ旅行記(2025)' },
  { href: '/docs/blog/250924/',      label: 'Besssr Direkt?' },
  { href: '/docs/blog/251113/',      label: 'ついでにセンシングっていいよね' },
  { href: '/docs/blog/251126/',      label: 'さつまいも栽培の機械(高効率)' },
]

/* ====================================================================== */

export default function Home() {
  const [lightboxImg, setLightboxImg] =
    useState<{ src: string; alt: string } | null>(null)

  return (
    <>
      {/* ライトボックス */}
      {lightboxImg && (
        <ImageLightbox
          src={lightboxImg.src}
          alt={lightboxImg.alt}
          onClose={() => setLightboxImg(null)}
        />
      )}

      <div className="flex justify-center">
        <main className="w-full max-w-5xl px-4 pb-20">

          {/* HERO ---------------------------------------------------------- */}
          <section className="py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8 min-h-[120px] md:min-h-[80px]">
              <TypeAnimation
                sequence={[
                  'AgMachine Repository', 1500,
                  'Welcome, curious engineer.', 1500,
                  '農業機械　リポジトリ', 1500,
                ]}
                speed={{ type: 'keyStrokeDelayInMs', value: 150 }}
                repeat={Infinity}
                wrapper="span"
                cursor={true}
                className="text-[var(--accent)]"
              />
            </h1>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-2xl mx-auto text-lg">
              農業機械のリポジトリです．私が気になった機械・技術をまとめています．<br className="hidden md:inline"/>かなり偏った内容ですが、ご了承ください．
            </p>
          </section>

          {/* Carousel ------------------------------------------------------ */}
          <section className="py-10">
            <ImageCarousel
              images={heroImages}
              interval={3000}
              onImageClick={(img) =>
                setLightboxImg({ src: img.src, alt: img.alt ?? '' })
              }
            />
          </section>

          {/* Repository Section (Grid Layout) ------------------------------ */}
          <div id="repository" className="space-y-20 pt-10">
            
            {/* 日本の特色 */}
            <Section title="日本の特色ある機械たち">
               {[
                { href: '/docs/ag/kaihatsu/', label: '北海道開発の機械', desc: '独自の進化を遂げた機械たち' },
                { href: '/docs/ag/hachiro/', label: '八郎潟の機械', desc: '大規模干拓地の機械' },
              ].map((item) => <Card key={item.href} {...item} />)}
            </Section>

            {/* 各国の特色 */}
            <Section title="各国の特色ある機械たち">
              {[
                { href: '/docs/ag/usa/',       label: 'US', desc: 'United States' },
                { href: '/docs/ag/Australia/', label: 'AUS', desc: 'Australia' },
                { href: '/docs/ag/Thailand/',  label: 'THAI', desc: 'Thailand' },
                { href: '/docs/ag/Brazil/',    label: 'BR', desc: 'Brazil' },
              ].map((item) => <Card key={item.href} {...item} />)}
            </Section>

            {/* メーカー */}
            <Section title="農業機械のメーカー (Niche)">
               {[
                { href: '/docs/ag/deere/',   label: 'John Deere', desc: 'The Deer' },
                { href: '/docs/ag/cat/',     label: 'Caterpillar', desc: 'Yellow Iron' },
                { href: '/docs/ag/claas/',   label: 'Claas', desc: 'Seed Green' },
                { href: '/docs/ag/morooka/', label: 'モロオカ', desc: 'Rubber Crawler' },
                { href: '/docs/ag/tcm/',     label: '東洋運搬機', desc: 'Wheel Loader' },
              ].map((item) => <Card key={item.href} {...item} />)}
            </Section>

            {/* 機械各論 */}
             <Section title="機械各論">
               {[
                { href: '/docs/ag/landLevel/',    label: 'レベラー', desc: 'Leveling' },
                { href: '/docs/ag/landHarrow/',   label: 'スペードブレードローラー', desc: 'Harrowing' },
                { href: '/docs/ag/landClearing/', label: '開拓/Land Clearing', desc: 'Clearing' },
              ].map((item) => <Card key={item.href} {...item} />)}
            </Section>
            
            {/* 展示会 */}
             <Section title="展示会・博物館・学会">
               {[
                { href: '/docs/ag/exhibition/',    label: '展示会', desc: 'Exhibitions & Museums' },
              ].map((item) => <Card key={item.href} {...item} />)}
            </Section>

          </div>

          {/* ブログ記事 ---------------------------------------------------- */}
          <section className="py-20 mt-10 border-t border-[#333]">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">ブログ記事 / Notes</h2>
            <SearchableList entries={blogEntries} />
          </section>
        </main>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="border-t border-[#333] pt-10">
            <h2 className="text-2xl font-bold mb-6 pl-4 border-l-4 border-[var(--accent)] text-white">
                {title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </section>
    )
}

function Card({ href, label, desc }: { href: string, label: string, desc?: string }) {
    return (
        <Link 
            href={href} 
            className="group block p-6 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--accent)] transition-all duration-300 hover:shadow-lg hover:shadow-[rgba(66,184,131,0.1)] hover:-translate-y-1"
        >
            <h3 className="text-xl font-bold text-gray-200 group-hover:text-[var(--accent)] transition-colors">
                {label}
            </h3>
            {desc && <p className="mt-2 text-sm text-gray-500">{desc}</p>}
        </Link>
    )
}
