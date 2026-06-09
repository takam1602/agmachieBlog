import fs from 'node:fs/promises'
import path from 'node:path'

export interface WeeklyNewsItem {
  title: string
  href: string
  source: string
  date?: string
  summary?: string
  score: number
}

type SourceConfig = {
  source: string
  pageUrl: string
  baseUrl: string
  includePatterns: RegExp[]
  excludePatterns?: RegExp[]
  fallbackItems?: Array<Pick<WeeklyNewsItem, 'title' | 'href' | 'date'>>
}

type AnchorCandidate = {
  href: string
  title: string
  context: string
  index: number
}

type WeeklyNewsPayload = {
  weekKey: string
  generatedAt: string
  latest: WeeklyNewsItem[]
  random: WeeklyNewsItem[]
  all: WeeklyNewsItem[]
}

const WEEKLY_NEWS_CACHE_PATH = path.join(process.cwd(), 'content', '.cache', 'weekly-news.json')

const SOURCE_CONFIGS: SourceConfig[] = [
  {
    source: 'John Deere',
    pageUrl: 'https://www.deere.com/en/news/all-news/',
    baseUrl: 'https://www.deere.com',
    includePatterns: [/\/en\/news\/all-news\//i, /\btractor\b/i, /\bharvester\b/i, /\bsprayer\b/i],
    excludePatterns: [/\/en\/news\/$/i, /pdf$/i],
    fallbackItems: [
      {
        title: 'John Deere Introduces New 8R and 8RX Tractors With up to 540 Horsepower for Greater Productivity and Performance',
        href: 'https://www.deere.com/en/news/all-news/new-8r-8rx-tractors/',
        date: '2026-02-24',
      },
      {
        title: 'John Deere Launches New F8 and F9 Series Self-Propelled Forage Harvesters, Revolutionizing Forage Quality and Operational Efficiency',
        href: 'https://www.deere.com/en/news/all-news/new-self-propelled-forage-harvesters/',
        date: '2025-06-03',
      },
    ],
  },
  {
    source: 'Farmers Weekly',
    pageUrl: 'https://www.fwi.co.uk/machinery',
    baseUrl: 'https://www.fwi.co.uk',
    includePatterns: [/\/machinery\//i, /\/news\//i],
  },
  {
    source: 'profi',
    pageUrl: 'https://www.profi.co.uk/category/news/',
    baseUrl: 'https://www.profi.co.uk',
    includePatterns: [/\/category\/news\//i, /\/news\//i, /\/test-centre\//i],
  },
  {
    source: 'AMAZONE',
    pageUrl: 'https://amazone.net/en/news/news-from-amazone/news-and-product-innovations',
    baseUrl: 'https://amazone.net',
    includePatterns: [/\/news\//i, /innovations/i, /products/i],
  },
  {
    source: 'CNH',
    pageUrl: 'https://media.cnh.com/NORTH-AMERICA/cnh',
    baseUrl: 'https://media.cnh.com',
    includePatterns: [/\/view-story\//i, /\/North-America\//i, /\btractor\b/i, /\bagriculture\b/i, /\bautomation\b/i],
    excludePatterns: [/subscribe/i, /cart/i, /\/rss/i],
    fallbackItems: [
      {
        title: 'Powering Tomorrow: How CNH is innovating sustainable farming with biogas',
        href: 'https://media.cnh.com/North-America/cnh-industrial',
        date: '2025-09-29',
      },
      {
        title: 'How AI is accelerating innovation in agriculture',
        href: 'https://media.cnh.com/NORTH-AMERICA/cnh',
        date: '2025-10-09',
      },
    ],
  },
]

const LATEST_SOURCES = new Set(['Farmers Weekly', 'profi'])

const NOISE_PATTERNS = [
  /^home$/i,
  /^more$/i,
  /^read more$/i,
  /^see all$/i,
  /^latest news$/i,
  /^news$/i,
  /^view story$/i,
  /^learn more$/i,
  /^contact/i,
  /^download/i,
  /^add all files/i,
]

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripTags(text: string) {
  return decodeHtmlEntities(text.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function absolutizeUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString()
  } catch {
    return ''
  }
}

function extractMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"]+)["'][^>]*>`,
    'i',
  )
  return regex.exec(html)?.[1]
}

function extractDate(text: string) {
  const iso = text.match(/\b20\d{2}-\d{2}-\d{2}\b/)
  if (iso) return iso[0]

  const compact = text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-\s.]+\d{1,2},?[-\s.]+\d{4}\b/i)
  if (compact) {
    const parsed = new Date(compact[0].replace(/\s+/g, ' ').trim())
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    return compact[0]
  }

  const alt = text.match(/\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i)
  if (alt) {
    const parsed = new Date(alt[0].replace(/\s+/g, ' ').trim())
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    return alt[0]
  }

  return undefined
}

function cleanForTranslation(text: string) {
  return stripTags(text)
    .replace(/\s+/g, ' ')
    .replace(/^[^A-Za-z0-9]+/, '')
    .trim()
}

function scoreCandidate(candidate: AnchorCandidate, config: SourceConfig) {
  const haystack = `${candidate.href} ${candidate.title} ${candidate.context}`.toLowerCase()
  let score = 0

  for (const pattern of config.includePatterns) {
    if (pattern.test(haystack)) score += 4
  }

  if (/\btractor\b|\bharvest\b|\bdrill\b|\bseeder\b|\bsprayer\b|\btillage\b|\bcombine\b|\bautonom|\bprecision\b/i.test(haystack)) {
    score += 3
  }

  if (/\bnews\b|\bupdate\b|\blaunch\b|\bintroduc|\binnovation\b|\btechnology\b|\baward\b/i.test(haystack)) {
    score += 2
  }

  if (extractDate(candidate.context)) score += 2
  score += Math.max(0, 8 - Math.min(candidate.index, 8))
  return score
}

function extractAnchorCandidates(html: string, baseUrl: string) {
  const results: AnchorCandidate[] = []
  const anchorRegex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null
  let index = 0

  while ((match = anchorRegex.exec(html)) !== null) {
    const title = stripTags(match[2])
    if (!title || title.length < 8) continue

    const href = absolutizeUrl(match[1], baseUrl)
    if (!href) continue

    const start = Math.max(0, match.index - 320)
    const end = Math.min(html.length, match.index + match[0].length + 320)
    const context = html.slice(start, end)

    results.push({ href, title, context, index })
    index += 1
  }

  return results
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; AgMachineBot/1.0; +https://agmachine-blog.vercel.app)',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    next: { revalidate: 60 * 60 * 6 },
  })

  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

async function fetchSourceCandidates(config: SourceConfig): Promise<WeeklyNewsItem[]> {
  try {
    const html = await fetchHtml(config.pageUrl)
    const anchors = extractAnchorCandidates(html, config.baseUrl)
    const seen = new Set<string>()

    return anchors
      .filter((candidate) => config.includePatterns.some((pattern) => pattern.test(`${candidate.href} ${candidate.title} ${candidate.context}`)))
      .filter((candidate) => !config.excludePatterns?.some((pattern) => pattern.test(`${candidate.href} ${candidate.title}`)))
      .filter((candidate) => !NOISE_PATTERNS.some((pattern) => pattern.test(candidate.title)))
      .filter((candidate) => {
        if (seen.has(candidate.href)) return false
        seen.add(candidate.href)
        return true
      })
      .map((candidate) => ({
        title: candidate.title,
        href: candidate.href,
        source: config.source,
        date: extractDate(candidate.context),
        score: scoreCandidate(candidate, config),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  } catch {
    return []
  }
}

function getFallbackItems(config: SourceConfig): WeeklyNewsItem[] {
  return (config.fallbackItems ?? []).map((item, index) => ({
    ...item,
    source: config.source,
    score: 100 - index,
  }))
}

async function translateToJapanese(text: string) {
  const input = cleanForTranslation(text)
  if (!input) return ''

  try {
    const url = new URL('https://translate.googleapis.com/translate_a/single')
    url.searchParams.set('client', 'gtx')
    url.searchParams.set('sl', 'auto')
    url.searchParams.set('tl', 'ja')
    url.searchParams.set('dt', 't')
    url.searchParams.set('q', input)

    const response = await fetch(url.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; AgMachineBot/1.0; +https://agmachine-blog.vercel.app)',
      },
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!response.ok) return ''

    const data = await response.json() as unknown
    if (!Array.isArray(data) || !Array.isArray(data[0])) return ''

    const translated = (data[0] as unknown[])
      .map((part) => Array.isArray(part) ? part[0] : '')
      .join('')
      .trim()

    return translated
  } catch {
    return ''
  }
}

function composeFallbackSummary(title: string, detail?: string) {
  const parts = [cleanForTranslation(title), cleanForTranslation(detail ?? '')].filter(Boolean)
  const body = parts.join(' ').slice(0, 120).trim()
  return body ? `${body}。` : '農業機械に関する外部記事です。'
}

async function enrichNewsItem(item: WeeklyNewsItem): Promise<WeeklyNewsItem> {
  try {
    const html = await fetchHtml(item.href)
    const metaDescription =
      extractMeta(html, 'description') ??
      extractMeta(html, 'og:description') ??
      extractMeta(html, 'twitter:description') ??
      ''
    const articleTitle =
      extractMeta(html, 'og:title') ??
      extractMeta(html, 'twitter:title') ??
      item.title
    const articleDate =
      extractMeta(html, 'article:published_time') ??
      extractMeta(html, 'date') ??
      item.date

    const paragraphMatch = html.match(/<p\b[^>]*>([\s\S]{50,500}?)<\/p>/i)
    const detail = cleanForTranslation(metaDescription || (paragraphMatch ? paragraphMatch[1] : ''))

    const summarySource = detail || articleTitle
    const translated = await translateToJapanese(summarySource)
    const translatedTitle = await translateToJapanese(articleTitle)

    return {
      ...item,
      title: translatedTitle || articleTitle,
      date: extractDate(articleDate ?? '') ?? item.date,
      summary: translated || composeFallbackSummary(articleTitle, detail),
    }
  } catch {
    const translated = await translateToJapanese(item.title)
    return {
      ...item,
      title: translated || item.title,
      summary: translated || composeFallbackSummary(item.title),
    }
  }
}

function sampleOne<T>(items: T[]) {
  if (!items.length) return null
  return items[Math.floor(Math.random() * items.length)]
}

function getCurrentTokyoWeekKey() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })

  const parts = formatter.formatToParts(now)
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  const year = Number(partMap.year)
  const month = Number(partMap.month)
  const day = Number(partMap.day)
  const weekday = weekdayMap[partMap.weekday] ?? 0

  const tokyoMidnightUtc = Date.UTC(year, month - 1, day)
  const sundayUtc = new Date(tokyoMidnightUtc - weekday * 24 * 60 * 60 * 1000)

  return sundayUtc.toISOString().slice(0, 10)
}

async function readWeeklyNewsCache() {
  try {
    const raw = await fs.readFile(WEEKLY_NEWS_CACHE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as WeeklyNewsPayload
    if (!parsed?.weekKey || !Array.isArray(parsed.latest) || !Array.isArray(parsed.random)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

async function writeWeeklyNewsCache(payload: WeeklyNewsPayload) {
  try {
    await fs.mkdir(path.dirname(WEEKLY_NEWS_CACHE_PATH), { recursive: true })
    await fs.writeFile(WEEKLY_NEWS_CACHE_PATH, JSON.stringify(payload, null, 2), 'utf8')
  } catch {
    return
  }
}

async function buildWeeklyNewsPayload(): Promise<WeeklyNewsPayload> {
  const perSource = await Promise.all(
    SOURCE_CONFIGS.map(async (config) => ({
      source: config.source,
      items: await fetchSourceCandidates(config),
      config,
    })),
  )

  const resolvedSources = perSource.map((group) => ({
    source: group.source,
    items: group.items.length ? group.items : getFallbackItems(group.config),
  }))

  const latestSeeds = resolvedSources
    .filter((group) => LATEST_SOURCES.has(group.source))
    .flatMap((group) => group.items.slice(0, 2))
    .slice(0, 4)

  const randomSeeds = resolvedSources
    .map((group) => sampleOne(group.items))
    .filter((item): item is WeeklyNewsItem => Boolean(item))
    .slice(0, 5)

  const [latest, random] = await Promise.all([
    Promise.all(latestSeeds.map(enrichNewsItem)),
    Promise.all(randomSeeds.map(enrichNewsItem)),
  ])

  return {
    weekKey: getCurrentTokyoWeekKey(),
    generatedAt: new Date().toISOString(),
    latest,
    random,
    all: [...latest, ...random],
  }
}

export async function getWeeklyNews() {
  const currentWeekKey = getCurrentTokyoWeekKey()
  const cached = await readWeeklyNewsCache()

  if (cached?.weekKey === currentWeekKey) {
    return cached
  }

  const payload = await buildWeeklyNewsPayload()
  await writeWeeklyNewsCache(payload)
  return payload
}

export async function refreshWeeklyNews() {
  const payload = await buildWeeklyNewsPayload()
  await writeWeeklyNewsCache(payload)
  return payload
}
