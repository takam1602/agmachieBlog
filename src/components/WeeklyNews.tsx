import { ArrowUpRight } from 'lucide-react'
import type { WeeklyNewsItem } from '@/utils/weeklyNews'

export default function WeeklyNews({
  latest,
  random,
}: {
  latest: WeeklyNewsItem[]
  random: WeeklyNewsItem[]
}) {
  if (!latest.length && !random.length) return null

  return (
    <section className="scroll-mt-20 bg-page py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold tracking-[0.08em] text-brand-text">AROUND THE WORLD</p>
        <h2 className="text-2xl font-bold text-ink sm:text-[2rem]">Weekly News</h2>
        <span className="mt-3 block h-1 w-12 bg-yellow" aria-hidden="true" />
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-2">
          海外4媒体の農業機械ニュースを記事単位で収集し、農機用語を補正した日本語要約で紹介。毎週月曜日に更新します。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <NewsGroup title="今週の新着" subtitle="公開日順・媒体ごとに最大2件" items={latest} />
        <NewsGroup title="注目トピック" subtitle="技術・製品・現場の話題を厳選" items={random} />
      </div>
      </div>
    </section>
  )
}

function NewsGroup({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: WeeklyNewsItem[]
}) {
  return (
    <div className="border border-line bg-surface">
      <div className="flex items-end justify-between gap-4 border-b-2 border-brand bg-band px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-3">{subtitle}</p>
        </div>
        <span className="border border-line-strong bg-surface px-2 py-0.5 text-xs text-ink-2">
          {items.length} 件
        </span>
      </div>

      <div className="divide-y divide-line">
        {items.map((item) => (
          <a
            key={item.source + '-' + item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 text-ink transition-colors hover:bg-band hover:text-ink sm:px-5"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate bg-brand-tint px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em] text-brand-text">
                  {item.source}
                </span>
                {item.topic && (
                  <span className="shrink-0 border border-line px-2 py-0.5 text-[11px] text-ink-2">
                    {item.topic}
                  </span>
                )}
              </div>
              <span className="text-xs text-ink-3">{item.date ?? 'latest'}</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-base font-bold leading-7 text-ink group-hover:text-brand-text group-hover:underline">
                  {item.title}
                </h4>
                {item.originalTitle && item.originalTitle !== item.title && (
                  <p lang="en" className="mt-1 line-clamp-1 text-xs leading-5 text-ink-3">
                    {item.originalTitle}
                  </p>
                )}
                {item.summary && item.summary !== item.title && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-ink-2">{item.summary}</p>
                )}
              </div>
              <ArrowUpRight size={15} className="mt-1.5 shrink-0 text-ink-3 group-hover:text-brand-text" aria-hidden="true" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
