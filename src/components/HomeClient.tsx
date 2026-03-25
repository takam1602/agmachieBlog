'use client'

import { useState } from 'react'
import { TypeAnimation } from 'react-type-animation'
import Link from 'next/link'

import ImageCarousel from '@/components/ImageCarousel'
import ImageLightbox from '@/components/ImageLightbox'
import SearchableList from '@/components/SearchableList'
import WhatsNew from '@/components/WhatsNew'
import { BlogPost } from '@/utils/posts'

/* ---------- トップページ用画像 ---------- */
const heroImages = [
  { src: '/img/front/1.jpg',  alt: 'v',         width: 640, height: 480 },
  { src: '/img/front/2.jpg',  alt: 'カルチ',     width: 640, height: 480 },
  { src: '/img/front/3.JPG',  alt: '芋',         width: 640, height: 480 },
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

interface HomeClientProps {
  blogEntries: { href: string; label: string; date: string; excerpt: string }[];
  latestPosts: BlogPost[];
  children?: React.ReactNode;
}

export default function HomeClient({ blogEntries, latestPosts, children }: HomeClientProps) {
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
        <main className="w-full max-w-6xl px-4 pb-12">

          {/* HERO ---------------------------------------------------------- */}
          <section className="pt-10 pb-6 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 min-h-[60px] md:min-h-[70px]">
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
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto text-sm md:text-base mb-8">
              農業機械のリポジトリです．気になった機械・技術をまとめています．
            </p>
          </section>

          {/* What's New (Above Carousel) ----------------------------------- */}
          <section className="mb-2">
            <WhatsNew posts={latestPosts} />
          </section>

          {/* Carousel ------------------------------------------------------ */}
          <section className="py-4">
            <ImageCarousel
              images={heroImages}
              interval={3000}
              onImageClick={(img) =>
                setLightboxImg({ src: img.src, alt: img.alt ?? '' })
              }
            />
          </section>

          {/* Featured Topic (Below Carousel) ------------------------------- */}
          {children && (
            <div className="py-8 w-full">
              {children}
            </div>
          )}

          {/* Repository Section (Grid Layout) ------------------------------ */}
          <div id="repository" className="space-y-10 pt-8">
            
            {/* 日本の特色 */}
            <Section title="日本の特色ある機械たち">
               {[
                { href: '/docs/ag/kaihatsu/', label: '北海道開発の機械', desc: '北海道開拓とか' },
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
                { href: '/docs/ag/France/',    label: 'FR', desc: 'France' },
                { href: '/docs/ag/Hungary/',    label: 'HU', desc: 'Hungary' },
              ].map((item) => <Card key={item.href} {...item} />)}
            </Section>

            {/* メーカー */}
            <Section title="農業機械のメーカー">
               {[
                { href: '/docs/ag/deere/',   label: 'John Deere', desc: 'Nothing runs like a Deere' },
                { href: '/docs/ag/cat/',     label: 'Caterpillar', desc: '猫' },
                { href: '/docs/ag/claas/',   label: 'Claas', desc: 'Knotter' },
                { href: '/docs/ag/morooka/', label: 'モロオカ', desc: '農建トラクター' },
                { href: '/docs/ag/tcm/',     label: '東洋運搬機', desc: '独創' },
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

          {/* ブログ記事 (Tiles) -------------------------------------------- */}
          <section className="py-12 mt-8 border-t border-[#333]">
            <h2 className="text-2xl font-bold text-center mb-8 text-white">ブログ記事 / Notes</h2>
            <SearchableList entries={blogEntries} />
          </section>
        </main>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="border-t border-[#333] pt-6">
            <h2 className="text-xl font-bold mb-4 pl-3 border-l-4 border-[var(--accent)] text-white">
                {title}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {children}
            </div>
        </section>
    )
}

function Card({ href, label, desc }: { href: string, label: string, desc?: string }) {
    return (
        <Link 
            href={href} 
            className="group block p-4 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[var(--accent)] transition-all duration-200 hover:bg-[#222]"
        >
            <h3 className="text-base font-bold text-gray-200 group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                {label}
            </h3>
            {desc && <p className="mt-1 text-xs text-gray-500 line-clamp-1">{desc}</p>}
        </Link>
    )
}
