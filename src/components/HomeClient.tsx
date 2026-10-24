'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronDown, ChevronRight, Compass, Database, Search } from 'lucide-react'

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
    <div className="w-full">
      <section className="border-b border-line bg-page" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-14 lg:py-16">
          <div className="lg:order-2">
            <HeroBackgroundCarousel images={heroImages} interval={5000} />
          </div>
          <div className="border-t-[6px] border-yellow pt-7 lg:order-1">
            <p className="mb-3 text-xs font-bold tracking-[0.08em] text-brand-text">
              AGRICULTURAL MACHINERY REPOSITORY
            </p>
            <h1 id="hero-title" className="text-balance text-3xl font-bold leading-[1.25] text-ink sm:text-5xl">
              旧きを温めて
              <span className="text-brand-text">新しきを知る</span>
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-8 text-ink-2">
              かなり偏った，「農業機械専門」リポジトリです．
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="#search" className="btn-primary">
                <Search size={17} aria-hidden="true" />
                検索
              </Link>
              <Link href="#repository" className="btn-secondary">
                記事を見る
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-8 grid grid-cols-3 border-t border-line pt-5">
              {stats.map(({ value, label, icon: Icon }, index) => (
                <div key={label} className={'flex flex-col ' + (index > 0 ? 'border-l border-line pl-4 sm:pl-6' : '')}>
                  <dt className="order-2 mt-1 text-xs text-ink-3 sm:text-sm">{label}</dt>
                  <dd className="order-1 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
                    <Icon size={16} className="text-brand-text" aria-hidden="true" />
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Band id="search" tone="band">
        <SectionIntro
          eyebrow="EXPLORE"
          title="検索"
          description="気になる機械やメーカー，作業内容などの単語を入力してください．"
          align="center"
        />
        <SearchableList entries={searchEntries} />
      </Band>

      <Band id="latest">
        <SectionIntro
          eyebrow="RECENTLY UPDATED"
          title="新しい更新"
          description="追加や更新したページ"
        />
        <WhatsNew posts={latestPosts} />
      </Band>

      <Band id="discover" tone="band">
        <SectionIntro
          eyebrow="RAMDON NEWS"
          title="ランダムネス"
          description="記事を無作為に表示させます"
        />
        {children && (
          <div id="topic-picks" className="max-w-3xl scroll-mt-24">
            {children}
          </div>
        )}
      </Band>

      <div id="news" className="scroll-mt-24">
        <WeeklyNews latest={weeklyNewsLatest} random={weeklyNewsRandom} />
      </div>

      <Band id="repository" tone="band">
        <SectionIntro
          eyebrow="ARTICLE"
          title="記事一覧"
          description="地域やメーカー，機械の用途で整理した記事です。"
        />
        <div className="space-y-12">
          {repositorySections.map((section) => (
            <RepositoryGroup key={section.title} title={section.title}>
              {section.items.map((item) => <RepositoryCard key={item.href} {...item} />)}
            </RepositoryGroup>
          ))}
        </div>
      </Band>

      <BlogSection posts={blogPosts} />
    </div>
  )
}

function Band({
  id,
  tone = 'page',
  className = '',
  children,
}: {
  id?: string
  tone?: 'page' | 'band'
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={'scroll-mt-20 py-12 sm:py-16 ' + (tone === 'band' ? 'bg-band ' : 'bg-page ') + className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
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

  const active = images[activeIndex]

  return (
    <figure className="m-0">
      <div className="hero-photo relative aspect-[4/3] w-full overflow-hidden border border-line">
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={index === activeIndex ? image.alt : ''}
            aria-hidden={index !== activeIndex}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 560px, 100vw"
            className={
              'object-cover transition-opacity duration-[1400ms] motion-reduce:transition-none ' +
              (index === activeIndex ? 'opacity-100' : 'opacity-0')
            }
          />
        ))}
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-3 text-sm text-ink-3" aria-live="off">
        <span>{active?.alt}</span>
        <span className="tabular-nums">{activeIndex + 1} / {images.length}</span>
      </figcaption>
    </figure>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string
  title: string
  description: string
  align?: 'left' | 'center'
}) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center'
  return (
    <div className={'mb-8 flex flex-col ' + alignment}>
      <p className="mb-2 text-xs font-bold tracking-[0.08em] text-brand-text">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-ink sm:text-[2rem]">{title}</h2>
      <span className="mt-3 block h-1 w-12 bg-yellow" aria-hidden="true" />
      <p className="mt-4 max-w-2xl text-base leading-7 text-ink-2">{description}</p>
    </div>
  )
}

function RepositoryGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={'collection-' + title}>
      <h3 id={'collection-' + title} className="mb-4 border-b-2 border-line pb-2 text-lg font-bold text-ink sm:text-xl">
        {title}
      </h3>
      <div className="home-tile-grid">{children}</div>
    </section>
  )
}

function RepositoryCard({ href, label, desc, count }: { href: string; label: string; desc?: string; count?: number }) {
  return (
    <Link
      href={href}
      className="group flex min-h-[124px] flex-col border border-line bg-surface p-5 text-ink transition-colors hover:border-brand hover:text-ink"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="line-clamp-2 text-base font-bold text-ink group-hover:text-brand-text group-hover:underline">{label}</h4>
        {typeof count === 'number' && (
          <span className="shrink-0 border border-line px-2 py-0.5 text-[11px] text-ink-3">
            {count} docs
          </span>
        )}
      </div>
      {desc && <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-2">{desc}</p>}
      <span className="link-more mt-auto self-end pt-3 text-sm">
        <ChevronRight size={18} aria-hidden="true" />
      </span>
    </Link>
  )
}

function BlogSection({ posts }: { posts: BlogPost[] }) {
  const [showAll, setShowAll] = useState(false)

  // 記事から戻ったときに「すべて表示」の状態を復元する
  useEffect(() => {
    if (sessionStorage.getItem('agmachie:blogShowAll') === '1') setShowAll(true)
  }, [])

  if (!posts.length) return null

  const visiblePosts = showAll ? posts : posts.slice(0, 12)
  const toggleShowAll = () => {
    const next = !showAll
    setShowAll(next)
    if (next) {
      sessionStorage.setItem('agmachie:blogShowAll', '1')
    } else {
      sessionStorage.removeItem('agmachie:blogShowAll')
    }
  }
  const rememberBlogPosition = () => {
    // クリックした記事の位置に戻れるよう、現在のスクロール位置を保存する
    sessionStorage.setItem('agmachie:blogScrollY', String(window.scrollY))
    sessionStorage.setItem('agmachie:restoreBlog', '1')
    sessionStorage.setItem('agmachie:restoreSection', 'blog')
  }

  return (
    <Band id="blog">
      <SectionIntro
        eyebrow="FIELD NOTES"
        title="ブログ"
        description="記事までは行かない，短編メモです．"
      />
      <div className="home-tile-grid">
        {visiblePosts.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            onClick={rememberBlogPosition}
            className="group flex min-h-[184px] flex-col border border-line bg-surface p-5 text-ink transition-colors hover:border-brand hover:text-ink"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs text-ink-3">{post.date}</span>
              {post.category && (
                <span className="shrink-0 bg-band px-2 py-0.5 text-[11px] text-ink-2">{post.category}</span>
              )}
            </div>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink group-hover:text-brand-text group-hover:underline">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-2">{post.excerpt}</p>
            <span className="link-more mt-auto pt-3 text-sm">
              読む <ChevronRight size={16} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
      {posts.length > 12 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={toggleShowAll}
            aria-expanded={showAll}
            className="btn-secondary"
          >
            {showAll ? '表示を戻す' : 'すべてのブログを見る'}
            <ChevronDown size={16} className={showAll ? 'rotate-180 transition-transform' : 'transition-transform'} aria-hidden="true" />
          </button>
        </div>
      )}
    </Band>
  )
}
