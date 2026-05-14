'use client'

import { useEffect, useState } from 'react'
import { TypeAnimation } from 'react-type-animation'
import Link from 'next/link'

import ImageCarousel from '@/components/ImageCarousel'
import ImageLightbox from '@/components/ImageLightbox'
import SearchableList from '@/components/SearchableList'
import WhatsNew from '@/components/WhatsNew'
import { BlogPost, RepositorySection } from '@/utils/posts'

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
  searchEntries: { href: string; label: string; date: string; excerpt: string; category?: string }[]
  blogPosts: BlogPost[]
  latestPosts: BlogPost[]
  repositorySections: RepositorySection[]
  children?: React.ReactNode
}

export default function HomeClient({
  searchEntries,
  blogPosts,
  latestPosts,
  repositorySections,
  children,
}: HomeClientProps) {
  const [lightboxImg, setLightboxImg] =
    useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    const restoreSavedPosition = (clearFlag = false) => {
      const restoreTarget = sessionStorage.getItem('agmachie:restoreSection')
      const hashTarget = window.location.hash === '#blog'
        ? 'blog'
        : window.location.hash === '#topic-picks'
          ? 'topic'
          : ''
      const targetKey = restoreTarget || hashTarget
      const shouldRestore = Boolean(targetKey)
      if (!shouldRestore) return

      const selector = targetKey === 'blog' ? '#blog' : '#topic-picks'
      const positionKey = targetKey === 'blog' ? 'agmachie:blogScrollY' : 'agmachie:topicScrollY'
      const target = document.querySelector<HTMLElement>(selector)
      const savedY = Number(sessionStorage.getItem(positionKey))

      if (Number.isFinite(savedY) && savedY > 0) {
        window.scrollTo({ top: savedY, behavior: 'auto' })
      } else if (target) {
        target.scrollIntoView({ block: 'start' })
      } else {
        return
      }

      if (clearFlag) {
        sessionStorage.removeItem('agmachie:restoreTopic')
        sessionStorage.removeItem('agmachie:restoreBlog')
        sessionStorage.removeItem('agmachie:restoreSection')
        sessionStorage.removeItem('agmachie:topicScrollY')
        sessionStorage.removeItem('agmachie:blogScrollY')
      }
    }

    const scheduleRestore = () => {
      window.requestAnimationFrame(() => restoreSavedPosition())
      window.setTimeout(() => restoreSavedPosition(), 80)
      window.setTimeout(() => restoreSavedPosition(), 300)
      window.setTimeout(() => restoreSavedPosition(true), 800)
    }

    scheduleRestore()
    window.addEventListener('pageshow', scheduleRestore)

    return () => {
      window.removeEventListener('pageshow', scheduleRestore)
    }
  }, [])

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
        <main className="w-full max-w-7xl px-4 sm:px-6 pb-12">

          {/* HERO ---------------------------------------------------------- */}
          <section className="pt-10 pb-8 text-center">
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
            <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto text-sm md:text-base mb-8">
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
            <div id="topic-picks" className="py-8 w-full scroll-mt-24">
              {children}
            </div>
          )}

          {/* Search -------------------------------------------------------- */}
          <section id="search" className="py-8 border-t border-[#333] scroll-mt-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">記事検索 / Repository Search</h2>
              <p className="mt-2 text-sm text-gray-400">キーワードを入れると、該当する記事だけを下に表示します。</p>
            </div>
            <SearchableList entries={searchEntries} />
          </section>

          {/* Repository Section (Grid Layout) ------------------------------ */}
          <div id="repository" className="space-y-9 pt-8 scroll-mt-24">
            {repositorySections.map((section) => (
              <Section key={section.title} title={section.title}>
                {section.items.map((item) => <Card key={item.href} {...item} />)}
              </Section>
            ))}
          </div>

          {/* Blog ---------------------------------------------------------- */}
          <BlogSection posts={blogPosts} />
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
            <div className="home-tile-grid">
                {children}
            </div>
        </section>
    )
}

function Card({ href, label, desc, count }: { href: string, label: string, desc?: string, count?: number }) {
    return (
        <Link 
            href={href} 
            className="group block p-4 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[var(--accent)] transition-all duration-200 hover:bg-[#222] min-h-[104px]"
        >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-gray-100 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                  {label}
              </h3>
              {typeof count === 'number' && (
                <span className="shrink-0 rounded-full border border-[#3a3a3a] px-2 py-0.5 text-[10px] font-mono text-gray-400">
                  {count}
                </span>
              )}
            </div>
            {desc && <p className="mt-2 text-xs text-gray-500 line-clamp-2">{desc}</p>}
        </Link>
    )
}

function BlogSection({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null

  const rememberBlogPosition = () => {
    const blog = document.querySelector<HTMLElement>('#blog')
    if (blog) {
      const top = blog.getBoundingClientRect().top + window.scrollY - 80
      sessionStorage.setItem('agmachie:blogScrollY', String(Math.max(0, top)))
    }
    sessionStorage.setItem('agmachie:restoreBlog', '1')
    sessionStorage.setItem('agmachie:restoreSection', 'blog')
  }

  return (
    <section id="blog" className="py-12 mt-8 border-t border-[#333] scroll-mt-24">
      <h2 className="text-xl font-bold mb-4 pl-3 border-l-4 border-[var(--accent)] text-white">
        ブログ
      </h2>
      <div className="home-tile-grid">
        {posts.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            onClick={rememberBlogPosition}
            className="group block rounded-lg border border-[#333] bg-[#1a1a1a] p-4 transition-colors hover:border-[var(--accent)] hover:bg-[#202020]"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-gray-500">{post.date}</span>
              {post.category && (
                <span className="shrink-0 rounded-full border border-[#3a3a3a] px-2 py-0.5 text-[10px] text-gray-500">
                  {post.category}
                </span>
              )}
            </div>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-100 transition-colors group-hover:text-[var(--accent)]">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
