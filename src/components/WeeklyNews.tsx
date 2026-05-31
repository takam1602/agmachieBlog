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
    <section className="py-8 border-t border-[#333] scroll-mt-24">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white">Weekly News</h2>
        <p className="mt-2 text-sm text-gray-400">
          世界の農業機械関連の最新情報たち(毎週日曜日更新)
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <NewsGroup
          title="Latest"
          subtitle="profiとFarmers Weeklyの注目ニュース"
          items={latest}
        />
        <NewsGroup
          title="Random"
          subtitle="ランダムニュース"
          items={random}
        />
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
    <div className="rounded-2xl border border-[#333] bg-[#171717] p-5">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#2d2d2d] pb-3">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-[#3a3a3a] px-3 py-1 text-[11px] font-mono text-gray-400">
          {items.length} items
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <a
            key={`${item.source}-${item.href}`}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-[#2f2f2f] bg-[#1d1d1d] p-4 transition-colors hover:border-[var(--accent)] hover:bg-[#232323]"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                {item.source}
              </span>
              <span className="text-[11px] font-mono text-gray-500">
                {item.date ?? 'latest'}
              </span>
            </div>
            {item.summary && (
              <p className="line-clamp-4 text-sm leading-relaxed text-gray-200">
                {item.summary}
              </p>
            )}
            {!item.summary && (
              <p className="line-clamp-4 text-sm leading-relaxed text-gray-200">
                {item.title}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
