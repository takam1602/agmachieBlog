'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronDown, Compass, Database, Search } from 'lucide-react'

import SearchableList from '@/components/SearchableList'
import WhatsNew from '@/components/WhatsNew'
import { BlogPost, RepositorySection } from '@/utils/posts'
import WeeklyNews from '@/components/WeeklyNews'
import { WeeklyNewsItem } from '@/utils/weeklyNews'

const heroImages = [
  { src: '/img/front/1.jpg',  alt: '農業機械の作業風景', width: 640, height: 480 },
  { src: '/img/front/2.jpg',  alt: 'カルチベーター', width: 640, height: 480 },
  { src: '/img/front/3.JPG',  alt: 'いも収穫機', width: 640, height: 480 },
  { src: '/img/front/4.jpg',  alt: '栃木の農業機械', width: 640, height: 480 },
  { src: '/img/front/5.JPG',  alt: 'ディスクハロー', width: 640, height: 480 },
  { src: '/img/front/6.JPG',  alt: 'チゼルプラウ', width: 640, height: 480 },
  { src: '/img/front/7.JPG',  alt: '大型コンバイン 9750', width: 640, height: 480 },
  { src: '/img/front/8.JPG',  alt: 'タイの農業機械', width: 640, height: 480 },
  { src: '/img/front/9.JPG',  alt: '大型農業機械', width: 640, height: 480 },
  { src: '/img/front/10.JPG', alt: 'オーストラリア Wagga Wagga の農業', width: 640, height: 480 },
  { src: '/img/front/11.JPG', alt: '中国の農業機械', width: 640, height: 480 },
  { src: '/img/front/12.JPG', alt: '中国の農作業風景', width: 640, height: 480 },
]

interface HomeClientProps {
  searchEntries: {
    href: string
    label: string
    date: string
    excerpt: string
    category?: string
    searchText?: string
  }[]
  blogPosts: BlogPost[]
  latestPosts: BlogPost[]
  repositorySections: RepositorySection[]
  weeklyNewsLatest: WeeklyNewsItem[]
  weeklyNewsRandom: WeeklyNewsItem[]
  children?: React.ReactNode
}

export default function HomeClient({
  searchEntries,
  blogPosts,
  latestPosts,
  repositorySections,
  weeklyNewsLatest,
  weeklyNewsRandom,
  children,
}: HomeClientProps) {
  useEffect(() => {
    const restoreSavedPosition = (clearFlag = false) => {
      const restoreTarget = sessionStorage.getItem('agmachie:restoreSection')
      const hashTarget = window.location.hash === '#blog'
        ? 'blog'
        : window.location.hash === '#topic-picks'
          ? 'topic'
          : ''
      const targetKey = restoreTarget || hashTarget
      if (!targetKey) return

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
    return () => window.removeEventListener('pageshow', scheduleRestore)
  }, [])

  const repositoryCount = repositorySections.reduce((total, section) => total + section.items.length, 0)
  const stats = [
    { value: searchEntries.length, label: '公開記事', icon: BookOpen },
    { value: repositoryCount, label: 'コレクション', icon: Database },
    { value: blogPosts.length, label: 'ブログ', icon: Compass },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
      <section className="relative -mx-4 flex min-h-[620px] items-center overflow-hidden border-b border-[var(--border)] px-4 py-16 sm:-mx-6 sm:min-h-[650px] sm:px-6 sm:py-24 lg:mx-0 lg:rounded-3xl lg:border">
        <HeroBackgroundCarousel images={heroImages} interval={5000} />
        <div className="relative mx-auto w-full max-w-4xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/[0.07] px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-[var(--accent)]">
              AGRICULTURAL MACHINERY ARCHIVE
            </p>
            <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-[-0.04em] text-white sm:text-6xl">
              農業機械の知識を、
              <span className="text-[var(--accent)]">次の現場へ。</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm leading-7 text-gray-400 sm:text-base">
              新旧の技術、地域ごとの特色、メーカーの記録をMarkdownで蓄積する、
              農業機械のためのオープンなリポジトリです。
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="#search" style={{ color: '#07140f' }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-[#07140f] transition-transform hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:text-[#07140f]">
                <Search size={17} aria-hidden="true" />
                記事を探す
              </Link>
              <Link href="#repository" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-white/[0.03] px-6 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 hover:bg-white/[0.06] hover:text-white">
                コレクションを見る
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 divide-x divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-black/10 py-4 backdrop-blur-sm">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center px-2">
                  <dt className="order-2 mt-1 text-[10px] tracking-wide text-gray-500 sm:text-xs">{label}</dt>
                  <dd className="order-1 flex items-center gap-1.5 text-lg font-bold text-gray-100 sm:text-xl">
                    <Icon size={14} className="text-[var(--accent)]" aria-hidden="true" />
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
      </section>

      <section id="search" className="scroll-mt-24 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/90 px-4 py-8 shadow-2xl shadow-black/20 sm:px-8 sm:py-10">
          <SectionIntro
            eyebrow="EXPLORE"
            title="リポジトリを検索"
            description="表記ゆれにも対応。機械名、メーカー、国・地域、本文中の言葉から探せます。"
          />
          <SearchableList entries={searchEntries} />
        </section>

        <section id="latest" className="scroll-mt-24 py-12 sm:py-16">
          <SectionIntro
            eyebrow="RECENTLY UPDATED"
            title="最近更新された記録"
            description="新規追加と更新のあったページをまとめています。"
            align="left"
          />
          <WhatsNew posts={latestPosts} />
        </section>

        <section id="discover" className="border-t border-[var(--border)] py-12 sm:py-16">
          <SectionIntro
            eyebrow="DISCOVER"
            title="偶然の発見から読む"
            description="ランダムな一記事から、普段とは違う入口でアーカイブを巡れます。"
            align="left"
          />
          {children && (
            <div id="topic-picks" className="mx-auto max-w-3xl scroll-mt-24">
              {children}
            </div>
          )}
        </section>

        <div id="news" className="scroll-mt-24">
          <WeeklyNews latest={weeklyNewsLatest} random={weeklyNewsRandom} />
        </div>

        <section id="repository" className="scroll-mt-24 border-t border-[var(--border)] py-12 sm:py-16">
          <SectionIntro
            eyebrow="COLLECTIONS"
            title="テーマから辿る"
            description="地域、メーカー、機械の用途ごとに整理されたコレクションです。"
            align="left"
          />
          <div className="space-y-10">
            {repositorySections.map((section) => (
              <RepositoryGroup key={section.title} title={section.title}>
                {section.items.map((item) => <RepositoryCard key={item.href} {...item} />)}
              </RepositoryGroup>
            ))}
          </div>
        </section>

        <BlogSection posts={blogPosts} />
      </div>
  )
}

function HeroBackgroundCarousel({
  images,
  interval,
}: {
  images: typeof heroImages
  interval: number
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReduceMotion(media.matches)
    updatePreference()
    media.addEventListener('change', updatePreference)
    return () => media.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (images.length < 2 || reduceMotion) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [images.length, interval, reduceMotion])

  return (
    <div className="absolute inset-0 bg-[#08100c]" aria-hidden="true">
      {images.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          fill
          priority={index === 0}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className={
            'object-cover transition-opacity duration-[1400ms] motion-reduce:transition-none ' +
            (index === activeIndex ? 'opacity-55' : 'opacity-0')
          }
        />
      ))}
      <div className="hero-carousel-overlay" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
    </div>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string
  title: string
  description: string
  align?: 'left' | 'center'
}) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center'
  return (
    <div className={'mb-7 flex flex-col ' + alignment}>
      <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
    </div>
  )
}

function RepositoryGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={'collection-' + title}>
      <div className="mb-4 flex items-center gap-3">
        <h3 id={'collection-' + title} className="text-base font-bold text-gray-200 sm:text-lg">{title}</h3>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <div className="home-tile-grid">{children}</div>
    </section>
  )
}

function RepositoryCard({ href, label, desc, count }: { href: string; label: string; desc?: string; count?: number }) {
  return (
    <Link
      href={href}
      className="group flex min-h-[112px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface-strong)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="line-clamp-2 text-base font-bold text-gray-100 transition-colors group-hover:text-[var(--accent)]">{label}</h4>
        {typeof count === 'number' && (
          <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-mono text-gray-500">
            {count} docs
          </span>
        )}
      </div>
      {desc && <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">{desc}</p>}
      <ArrowRight size={15} className="mt-auto self-end text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-[var(--accent)]" aria-hidden="true" />
    </Link>
  )
}

function BlogSection({ posts }: { posts: BlogPost[] }) {
  const [showAll, setShowAll] = useState(false)
  if (!posts.length) return null

  const visiblePosts = showAll ? posts : posts.slice(0, 12)
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
    <section id="blog" className="scroll-mt-24 border-t border-[var(--border)] py-12 sm:py-16">
      <SectionIntro
        eyebrow="FIELD NOTES"
        title="ブログ"
        description="現場で考えたこと、調査の途中経過、農業機械にまつわるメモ。"
        align="left"
      />
      <div className="home-tile-grid">
        {visiblePosts.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            onClick={rememberBlogPosition}
            className="group flex min-h-[170px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface-strong)]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-gray-600">{post.date}</span>
              {post.category && (
                <span className="shrink-0 rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-gray-500">{post.category}</span>
              )}
            </div>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-100 transition-colors group-hover:text-[var(--accent)]">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-500">{post.excerpt}</p>
            <span className="mt-auto pt-3 text-xs font-medium text-[var(--accent)]">読む →</span>
          </Link>
        ))}
      </div>
      {posts.length > 12 && (
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white/[0.03] px-5 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:bg-white/[0.06] hover:text-white"
          >
            {showAll ? '表示を戻す' : 'すべてのブログを見る'}
            <ChevronDown size={16} className={showAll ? 'rotate-180 transition-transform' : 'transition-transform'} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
