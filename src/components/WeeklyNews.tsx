import { ArrowUpRight } from 'lucide-react'
import { WeeklyNewsItem } from '@/utils/weeklyNews'

export default function WeeklyNews({
  latest,
  random,
}: {
  latest: WeeklyNewsItem[]
  random: WeeklyNewsItem[]
}) {
  if (!latest.length && !random.length) return null

  return (
    <section className="scroll-mt-24 border-t border-[var(--border)] py-12 sm:py-16">
      <div className="mb-7">
        <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)]">AROUND THE WORLD</p>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Weekly News</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          世界の農業機械メディアから集めたニュース。毎週日曜日に更新しています。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <NewsGroup title="最新ニュース" subtitle="profi / Farmers Weekly から" items={latest} />
        <NewsGroup title="アーカイブから発見" subtitle="幅広いソースからランダムに" items={random} />
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs text-gray-600">{subtitle}</p>
        </div>
        <span className="rounded-full bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono text-gray-500">
          {items.length} 件
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <a
            key={item.source + '-' + item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-transparent bg-black/10 p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-white/[0.025]"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="rounded-full bg-[var(--accent)]/[0.08] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                {item.source}
              </span>
              <span className="font-mono text-[10px] text-gray-600">{item.date ?? 'latest'}</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-gray-200 transition-colors group-hover:text-white">
                  {item.title}
                </h4>
                {item.summary && item.summary !== item.title && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500">{item.summary}</p>
                )}
              </div>
              <ArrowUpRight size={15} className="mt-1 shrink-0 text-gray-600 transition-colors group-hover:text-[var(--accent)]" aria-hidden="true" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
