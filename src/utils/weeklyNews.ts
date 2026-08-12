import fs from 'node:fs/promises'
import path from 'node:path'

export interface WeeklyNewsItem {
  title: string
  originalTitle?: string
  href: string
  source: string
  date?: string
  summary?: string
  originalSummary?: string
  topic?: string
  score: number
}

type NewsCandidate = {
  title: string
  href: string
  source: string
  date?: string
  summary?: string
  categories?: string[]
  score: number
}

type RssSource = {
  type: 'rss'
  source: string
  url: string
  baseUrl: string
}

type FarmersWeeklySource = {
  type: 'farmers-weekly'
  source: string
  url: string
  baseUrl: string
}

type NewsSource = RssSource | FarmersWeeklySource

type WeeklyNewsPayload = {
  version: number
  weekKey: string
  generatedAt: string
  latest: WeeklyNewsItem[]
  random: WeeklyNewsItem[]
  all: WeeklyNewsItem[]
}

const WEEKLY_NEWS_SCHEMA_VERSION = 2
const WEEKLY_NEWS_CACHE_PATH = path.join(process.cwd(), 'content', '.cache', 'weekly-news.json')
const FETCH_TIMEOUT_MS = 15_000
const TRANSLATION_SEPARATOR = '000999000'

const NEWS_SOURCES: NewsSource[] = [
  {
    type: 'rss',
    source: 'profi',
    url: 'https://www.profi.co.uk/feed/',
    baseUrl: 'https://www.profi.co.uk',
  },
  {
    type: 'rss',
    source: 'Future Farming',
    url: 'https://www.futurefarming.com/feed/',
    baseUrl: 'https://www.futurefarming.com',
  },
  {
    type: 'rss',
    source: 'Farmers Guide',
    url: 'https://www.farmersguide.co.uk/machinery/feed/',
    baseUrl: 'https://www.farmersguide.co.uk',
  },
  {
    type: 'farmers-weekly',
    source: 'Farmers Weekly',
    url: 'https://www.fwi.co.uk/machinery',
    baseUrl: 'https://www.fwi.co.uk',
  },
]

const MACHINE_PATTERNS = [
  /\btractor(s)?\b/i,
  /\bcombine(s)?\b/i,
  /\bharvester(s)?\b/i,
  /\bfarm machinery\b/i,
  /\bagricultural machinery\b/i,
  /\bimplement(s)?\b/i,
  /\bspray(ing|er|ers|ed)?\b/i,
  /\bbaler(s)?\b/i,
  /\bmower(s)?\b/i,
  /\btelehandler(s)?\b/i,
  /\bloader(s)?\b/i,
  /\bseed(er|ing| drill)s?\b/i,
  /\bdrill(s)?\b/i,
  /\bcultivator(s)?\b/i,
  /\bplou?gh(s)?\b/i,
  /\btillage\b/i,
  /\bforage\b/i,
  /\bharvest(ing)?\b/i,
  /\bpowertrain(s)?\b/i,
  /\btransmission(s)?\b/i,
  /\bengine(s)?\b/i,
  /\btyres?\b|\btires?\b/i,
  /\bpto\b/i,
  /\bisobus\b/i,
  /\bprecision (agriculture|farming)\b/i,
  /\bautonomous (machine|vehicle|tractor|robot)/i,
  /\bfarm robot(s)?\b/i,
  /\bgrain analys(is|er|ers)\b/i,
]

const AGRICULTURAL_BRAND_PATTERNS = [
  /\bjohn deere\b/i,
  /\bclaas\b/i,
  /\bfendt\b/i,
  /\bmassey ferguson\b/i,
  /\bnew holland\b/i,
  /\bcase ih\b/i,
  /\bvaltra\b/i,
  /\bkubota\b/i,
  /\bdeutz[- ]fahr\b/i,
  /\bjcb\b/i,
  /\bmanitou\b/i,
  /\bkrone\b/i,
  /\bkuhn\b/i,
  /\bkverneland\b/i,
  /\bamazo(ne|n)\b/i,
  /\blemken\b/i,
  /\bv[aä]derstad\b/i,
  /\bp[oö]ttinger\b/i,
  /\bhorsch\b/i,
  /\bmerlo\b/i,
  /\bgrimme\b/i,
  /\bagco\b/i,
  /\bcnh\b/i,
]

const NEWS_ACTION_PATTERNS = [
  /\blaunch(es|ed|ing)?\b/i,
  /\bunveil(s|ed|ing)?\b/i,
  /\bintroduc(es|ed|ing|tion)?\b/i,
  /\bnew\b/i,
  /\bupdate(s|d)?\b/i,
  /\bupgrade(s|d)?\b/i,
  /\btest(ed|ing)?\b/i,
  /\breview(ed)?\b/i,
  /\btechnology\b/i,
  /\belectric\b/i,
]

const NOISE_PATTERNS = [
  /\barchive(s)?\b/i,
  /\bcontent library\b/i,
  /\badvert(isement|ising)?\b/i,
  /\bjavascript (is )?required\b/i,
  /\benable javascript\b/i,
  /\bcookie policy\b/i,
  /\bprivacy policy\b/i,
  /\bsubscribe\b/i,
  /\bsign in\b/i,
  /^news$/i,
  /^machinery$/i,
  /^read more$/i,
]

const JAPANESE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/ジョン・ディア|ジョンディア/g, 'John Deere'],
  [/クラース/g, 'CLAAS'],
  [/ケース\s*IH/gi, 'Case IH'],
  [/ニューホランド/g, 'New Holland'],
  [/マッセイ・?ファーガソン/g, 'Massey Ferguson'],
  [/フェント/g, 'Fendt'],
  [/バルトラ/g, 'Valtra'],
  [/ポッティンガー/g, 'PÖTTINGER'],
  [/アマゾーネ|アマゾン(?=の|が|は|、)/g, 'AMAZONE'],
  [/クバンランド/g, 'Kverneland'],
  [/ブッシェル・?プラス/g, 'Bushel Plus'],
  [/ブランヴァルト|ブランバルト/g, 'BranValt'],
  [/丸形ベーラー/g, 'ラウンドベーラー'],
  [/鳥類生産会社/g, '養鶏会社'],
  [/飾り気のない/g, 'シンプルな仕様の'],
  [/自動的に植え付けを行い/g, '自動で播種作業を行い'],
  [/まったく処理できない/g, '対応できない'],
  [/コンバインハーベスター/g, 'コンバイン'],
  [/固定および可変チャンバーラウンドベーラー/g, '固定室・可変室ラウンドベーラー'],
  [/セネター/g, 'Senator'],
  [/飼料収穫機/g, 'フォレージハーベスター'],
  [/ローディングショベル/g, 'ホイールローダー'],
  [/空気圧ドリル/g, 'エアシーダー'],
  [/シードドリル/g, '播種機'],
  [/噴霧器/g, 'スプレーヤー'],
  [/耕運機/g, 'カルチベーター'],
  [/精密農業/g, 'スマート農業'],
]

function decodeHtmlEntities(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
    rsquo: '’',
    lsquo: '‘',
    rdquo: '”',
    ldquo: '“',
    ndash: '–',
    mdash: '—',
    hellip: '…',
  }

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, key: string) => {
    if (key.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(key.slice(2), 16))
    }
    if (key.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(key.slice(1), 10))
    }
    return named[key.toLowerCase()] ?? entity
  })
}

function unwrapCdata(value: string) {
  return value.trim().replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/i, '$1')
}

function stripTags(value: string) {
  return decodeHtmlEntities(unwrapCdata(value).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(value: string) {
  return stripTags(value)
    .replace(/The post .*? appeared first on .*?\.?$/i, '')
    .replace(/\bRead more\.?$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function absolutizeUrl(value: string, baseUrl: string) {
  try {
    const url = new URL(decodeHtmlEntities(value), baseUrl)
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&')
}

function extractXmlTag(block: string, tagName: string) {
  const escaped = escapeRegExp(tagName)
  const match = new RegExp('<' + escaped + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + escaped + '>', 'i').exec(block)
  return match ? unwrapCdata(match[1]) : ''
}

function extractMeta(html: string, requestedName: string) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? []

  for (const tag of metaTags) {
    const attributes: Record<string, string> = {}
    const attributePattern = /([:\w-]+)\s*=\s*["']([^"']*)["']/g
    let match: RegExpExecArray | null

    while ((match = attributePattern.exec(tag)) !== null) {
      attributes[match[1].toLowerCase()] = decodeHtmlEntities(match[2])
    }

    if (
      attributes.name?.toLowerCase() === requestedName.toLowerCase() ||
      attributes.property?.toLowerCase() === requestedName.toLowerCase()
    ) {
      return attributes.content
    }
  }

  return undefined
}

function normalizeDate(value?: string) {
  if (!value) return undefined

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  const iso = value.match(/\b20\d{2}-\d{2}-\d{2}\b/)
  return iso?.[0]
}

function isNoise(value: string) {
  return NOISE_PATTERNS.some((pattern) => pattern.test(value))
}

function countMatches(value: string, patterns: RegExp[]) {
  return patterns.reduce((total, pattern) => total + (pattern.test(value) ? 1 : 0), 0)
}

function calculateRelevance(candidate: Omit<NewsCandidate, 'score'>) {
  const title = candidate.title
  const details = [
    candidate.summary ?? '',
    candidate.categories?.join(' ') ?? '',
    candidate.href,
  ].join(' ')
  const titleMachineMatches = countMatches(title, MACHINE_PATTERNS)
  const detailMachineMatches = countMatches(details, MACHINE_PATTERNS)
  const brandMatches = countMatches(title + ' ' + details, AGRICULTURAL_BRAND_PATTERNS)
  const actionMatches = countMatches(title, NEWS_ACTION_PATTERNS)

  return (
    titleMachineMatches * 8 +
    Math.min(detailMachineMatches, 4) * 3 +
    Math.min(brandMatches, 2) * 4 +
    Math.min(actionMatches, 2) * 2 +
    (candidate.date ? 2 : 0)
  )
}

function isRelevantCandidate(candidate: NewsCandidate) {
  const combined = [
    candidate.title,
    candidate.summary ?? '',
    candidate.categories?.join(' ') ?? '',
    candidate.href,
  ].join(' ')

  if (!candidate.href || candidate.title.length < 12 || isNoise(combined)) return false

  const machineMatches = countMatches(combined, MACHINE_PATTERNS)
  return machineMatches > 0
}

function parseRssFeed(xml: string, config: RssSource) {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? []

  return itemBlocks
    .map((block): NewsCandidate | null => {
      const title = cleanText(extractXmlTag(block, 'title'))
      const linkValue = extractXmlTag(block, 'link') || extractXmlTag(block, 'guid')
      const href = absolutizeUrl(stripTags(linkValue), config.baseUrl)
      const description =
        extractXmlTag(block, 'description') ||
        extractXmlTag(block, 'content:encoded')
      const summary = cleanText(description)
      const date = normalizeDate(extractXmlTag(block, 'pubDate') || extractXmlTag(block, 'dc:date'))
      const categories = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)]
        .map((match) => cleanText(match[1]))
        .filter(Boolean)

      if (!title || !href) return null

      const baseCandidate = {
        title,
        href,
        source: config.source,
        date,
        summary,
        categories,
      }

      return {
        ...baseCandidate,
        score: calculateRelevance(baseCandidate),
      }
    })
    .filter((candidate): candidate is NewsCandidate => Boolean(candidate))
    .filter(isRelevantCandidate)
    .slice(0, 24)
}

function parseFarmersWeeklyPage(html: string, config: FarmersWeeklySource) {
  const articlePattern = /<a\b[^>]*href=["']([^"']*\/machinery\/[^"']+)["'][^>]*>\s*<h2\b[^>]*>([\s\S]*?)<\/h2>\s*<\/a>(?:\s*<p\b[^>]*>([\s\S]*?)<\/p>)?/gi
  const candidates: NewsCandidate[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = articlePattern.exec(html)) !== null) {
    const href = absolutizeUrl(match[1], config.baseUrl)
    const title = cleanText(match[2])
    const summary = cleanText(match[3] ?? '')
    if (!href || !title || seen.has(href)) continue
    seen.add(href)

    const baseCandidate = {
      title,
      href,
      source: config.source,
      summary,
    }

    candidates.push({
      ...baseCandidate,
      score: calculateRelevance(baseCandidate),
    })
  }

  return candidates.filter(isRelevantCandidate).slice(0, 16)
}

async function fetchText(url: string, accept: string) {
  const response = await fetch(url, {
    headers: {
      accept,
      'user-agent': 'Mozilla/5.0 (compatible; AgMachineNews/2.0; +https://agmachine-blog.vercel.app)',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: 60 * 60 * 6 },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch ' + url + ': ' + response.status)
  }

  return response.text()
}

function removeRepeatedTitle(summary: string, title: string) {
  const cleanSummary = cleanText(summary)
  const cleanTitle = cleanText(title)
  if (cleanSummary.toLowerCase().startsWith(cleanTitle.toLowerCase())) {
    return cleanSummary.slice(cleanTitle.length).replace(/^[\s:–—-]+/, '').trim()
  }
  return cleanSummary
}

async function hydrateArticleMetadata(candidate: NewsCandidate) {
  try {
    const html = await fetchText(candidate.href, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8')
    const title = cleanText(
      extractMeta(html, 'og:title') ??
      extractMeta(html, 'twitter:title') ??
      candidate.title,
    )
    const metaSummary = cleanText(
      extractMeta(html, 'og:description') ??
      extractMeta(html, 'description') ??
      extractMeta(html, 'twitter:description') ??
      '',
    )
    const feedSummary = removeRepeatedTitle(candidate.summary ?? '', candidate.title)
    const summary = [metaSummary, feedSummary]
      .filter(Boolean)
      .sort((first, second) => second.length - first.length)[0] ?? ''
    const date = normalizeDate(
      extractMeta(html, 'article:published_time') ??
      extractMeta(html, 'datePublished') ??
      candidate.date,
    )
    const baseCandidate = {
      ...candidate,
      title,
      summary,
      date,
    }

    return {
      ...baseCandidate,
      score: calculateRelevance(baseCandidate),
    }
  } catch {
    return candidate
  }
}

async function fetchSource(config: NewsSource) {
  try {
    if (config.type === 'rss') {
      const xml = await fetchText(config.url, 'application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.8')
      return parseRssFeed(xml, config)
    }

    const html = await fetchText(config.url, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8')
    const candidates = parseFarmersWeeklyPage(html, config)
    return Promise.all(candidates.map(hydrateArticleMetadata))
  } catch (error) {
    console.warn('[weekly-news] Could not fetch ' + config.source + ':', error)
    return []
  }
}

function normalizeEnglishSummary(value: string) {
  let result = value
    .replace(
      /58 years after being ceremonially handed over by company founder August Claas, the 200,000th Claas combine ever built, a 1968 Senator, has returned to active harvesting\./i,
      'Founder August CLAAS presented the 200,000th CLAAS combine, a 1968 Senator model, 58 years ago. The restored machine has now returned to harvest work.',
    )
    .trim()

  if (/(?:,|…|\.\.\.)$/.test(result)) {
    const withoutTrailingFragment = result.replace(/\s*(?:,|…|\.\.\.)\s*$/, '').trim()
    const previousSentenceEnd = withoutTrailingFragment.lastIndexOf('.')
    result = previousSentenceEnd >= 30
      ? withoutTrailingFragment.slice(0, previousSentenceEnd + 1)
      : withoutTrailingFragment + '.'
  }

  return result
}

function normalizeEnglishTitle(value: string) {
  return value
    .replace(/\s+-\s+(Farmers Weekly|Future Farming)$/i, '')
    .replace(/^Combine specialist's top tips for (.+)$/i, 'A combine harvester specialist shares top tips for $1')
    .replace(/\bgets battery-electric powertrain\b/i, 'adopts a battery-electric powertrain')
    .replace(/\bgets (?:a |an )?(.+?) option\b/i, 'adds a $1 option')
    .replace(/\s+/g, ' ')
    .trim()
}

function polishJapanese(value: string) {
  let result = value

  for (const [pattern, replacement] of JAPANESE_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }

  result = result
    .replace(/\bClaas\b/gi, 'CLAAS')
    .replace(/\bAmazone\b/gi, 'AMAZONE')
  if (result.includes('CLAAS')) {
    result = result.replace(/上院議員/g, 'Senator')
  }
  result = result.replace(
    /コンバインのスペシャリストがメンテナンス、修理、保管に関する重要なヒントを共有します/g,
    'コンバインの専門家が解説するメンテナンス・修理・保管のポイント',
  )
  result = result
    .replace(/(企業|会社)(Agtecnic|Bushel Plus)/g, '$1 $2')
    .replace(/(Agtecnic|Bushel Plus|BranValt)は/g, '$1 は')
    .replace(/(Agtecnic|Bushel Plus|BranValt)に/g, '$1 に')

  return result
    .replace(/\s+([、。！？])/g, '$1')
    .replace(/([、。！？]){2,}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/社名を(BranValt)/g, '社名を $1')
    .replace(/自社の(SenseSpray)/g, '自社の $1')
    .replace(
      /砂質土壌やローム質土壌で運営されている農場では、AMAZONE の搭載型カルチベーターに新しいリング ローラー オプションが追加されることを歓迎するかもしれません。/g,
      '砂質・ローム質土壌向けに、AMAZONEのマウント型カルチベーターへ新しいリングローラーが追加されました。',
    )
    .trim()
}

async function translateText(value: string) {
  if (!value.trim()) return ''

  try {
    const url = new URL('https://translate.googleapis.com/translate_a/single')
    url.searchParams.set('client', 'gtx')
    url.searchParams.set('sl', 'en')
    url.searchParams.set('tl', 'ja')
    url.searchParams.set('dt', 't')
    url.searchParams.set('q', value)

    const response = await fetch(url.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; AgMachineNews/2.0; +https://agmachine-blog.vercel.app)',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!response.ok) return ''
    const data = await response.json() as unknown
    if (!Array.isArray(data) || !Array.isArray(data[0])) return ''

    return (data[0] as unknown[])
      .map((part) => Array.isArray(part) ? part[0] : '')
      .join('')
      .trim()
  } catch {
    return ''
  }
}

function trimSummary(value: string, maxLength = 180) {
  let clean = value.trim().replace(/[、,;:]\s*$/, '')
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength).trimEnd()
  }

  const sentenceEnd = Math.max(
    clean.lastIndexOf('。'),
    clean.lastIndexOf('！'),
    clean.lastIndexOf('？'),
  )
  const hasTrailingFragment =
    sentenceEnd >= 20 &&
    sentenceEnd < clean.length - 1 &&
    !/[。！？.!?」』]$/.test(clean)

  if (hasTrailingFragment) {
    clean = clean.slice(0, sentenceEnd + 1)
  }

  if (clean.length >= maxLength && !/[。！？.!?」』]$/.test(clean)) {
    return clean + '…'
  }
  return /[。！？.!?」』]$/.test(clean) ? clean : clean + '。'
}

function classifyTopic(candidate: NewsCandidate) {
  const value = [candidate.title, candidate.summary ?? '', candidate.categories?.join(' ') ?? ''].join(' ')
  if (/\bautonom|\brobot|\bai\b|\bprecision|\bisobus|\bgps\b/i.test(value)) return 'スマート農業'
  if (/\belectric|\bbattery|\bhydrogen|\bbiogas|\bemission/i.test(value)) return '動力・環境'
  if (/\bcombine\b|\bcombine harvester|\bharvest|\bforage|\bbaler|\bmower/i.test(value)) return '収穫・飼料'
  if (/\bspray|\bdrill|\bseed|\btillage|\bcultivator|\bplou?gh|\bslurry|\bcompressor/i.test(value)) return '作業機'
  if (/\btractor/i.test(value)) return 'トラクター'
  return '農業機械'
}

async function translateCandidate(candidate: NewsCandidate): Promise<WeeklyNewsItem> {
  const originalTitle = normalizeEnglishTitle(candidate.title)
  const originalSummary = normalizeEnglishSummary(cleanText(candidate.summary ?? ''))
  const translationInput = [
    originalTitle,
    TRANSLATION_SEPARATOR,
    originalSummary || 'This article reports the latest development in agricultural machinery.',
  ].join('\n')
  const translated = await translateText(translationInput)
  const parts = translated.split(TRANSLATION_SEPARATOR)
  const translatedTitle = polishJapanese(parts[0] ?? '')
  const translatedSummary = polishJapanese(parts.slice(1).join(TRANSLATION_SEPARATOR))

  return {
    title: translatedTitle || originalTitle,
    originalTitle,
    href: candidate.href,
    source: candidate.source,
    date: candidate.date,
    summary: trimSummary(
      translatedSummary ||
      '農業機械の新製品・技術・現場動向を紹介する海外記事です。',
    ),
    originalSummary,
    topic: classifyTopic(candidate),
    score: candidate.score,
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  callback: (item: T) => Promise<R>,
) {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await callback(items[currentIndex])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

function getStoryTokens(item: NewsCandidate) {
  const stopWords = new Set([
    'about', 'after', 'again', 'been', 'from', 'into', 'more', 'new',
    'over', 'that', 'their', 'this', 'with', 'years',
  ])
  return new Set(
    (item.title + ' ' + (item.summary ?? ''))
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 2 && !stopWords.has(token)) ?? [],
  )
}

function looksLikeSameStory(first: NewsCandidate, second: NewsCandidate) {
  const firstTokens = getStoryTokens(first)
  const secondTokens = getStoryTokens(second)
  let overlap = 0
  for (const token of firstTokens) {
    if (secondTokens.has(token)) overlap += 1
  }
  const smallerTokenSet = Math.min(firstTokens.size, secondTokens.size)
  if (overlap >= 7 && smallerTokenSet > 0 && overlap / smallerTokenSet >= 0.55) {
    return true
  }

  const firstText = first.title + ' ' + (first.summary ?? '')
  const secondText = second.title + ' ' + (second.summary ?? '')
  const firstNumbers = new Set(
    firstText.match(/\b\d[\d,]{3,}\b/g)?.map((value) => value.replaceAll(',', '')) ?? [],
  )
  const secondNumbers = new Set(
    secondText.match(/\b\d[\d,]{3,}\b/g)?.map((value) => value.replaceAll(',', '')) ?? [],
  )
  const hasSharedNumber = [...firstNumbers].some((value) => secondNumbers.has(value))
  const hasSharedBrand = AGRICULTURAL_BRAND_PATTERNS.some(
    (pattern) => pattern.test(firstText) && pattern.test(secondText),
  )
  const hasSharedMachine = MACHINE_PATTERNS.some(
    (pattern) => pattern.test(firstText) && pattern.test(secondText),
  )
  return hasSharedNumber && hasSharedBrand && hasSharedMachine
}

function deduplicateCandidates(items: NewsCandidate[]) {
  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()
  const accepted: NewsCandidate[] = []

  for (const item of items) {
    const normalizedUrl = item.href.replace(/\/$/, '').toLowerCase()
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    if (
      seenUrls.has(normalizedUrl) ||
      seenTitles.has(normalizedTitle) ||
      accepted.some((candidate) => looksLikeSameStory(candidate, item))
    ) {
      continue
    }
    seenUrls.add(normalizedUrl)
    seenTitles.add(normalizedTitle)
    accepted.push(item)
  }

  return accepted
}

function dateValue(value?: string) {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function selectWithSourceLimit(
  items: NewsCandidate[],
  count: number,
  maximumPerSource: number,
  excludedUrls = new Set<string>(),
) {
  const selected: NewsCandidate[] = []
  const sourceCounts = new Map<string, number>()

  for (const item of items) {
    if (selected.length >= count) break
    if (excludedUrls.has(item.href)) continue
    const sourceCount = sourceCounts.get(item.source) ?? 0
    if (sourceCount >= maximumPerSource) continue
    selected.push(item)
    sourceCounts.set(item.source, sourceCount + 1)
  }

  return selected
}

function getCurrentTokyoWeekKey() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value]),
  )
  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  const utcDate = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
  const sunday = new Date(utcDate - (weekdays[parts.weekday] ?? 0) * 86_400_000)
  return sunday.toISOString().slice(0, 10)
}

function isUsablePayload(payload: WeeklyNewsPayload | null) {
  return Boolean(
    payload &&
    payload.version === WEEKLY_NEWS_SCHEMA_VERSION &&
    payload.weekKey &&
    payload.latest.length >= 3 &&
    payload.random.length >= 3,
  )
}

async function readWeeklyNewsCache() {
  try {
    const raw = await fs.readFile(WEEKLY_NEWS_CACHE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as WeeklyNewsPayload
    if (!Array.isArray(parsed?.latest) || !Array.isArray(parsed?.random)) return null
    return parsed
  } catch {
    return null
  }
}

async function writeWeeklyNewsCache(payload: WeeklyNewsPayload) {
  try {
    await fs.mkdir(path.dirname(WEEKLY_NEWS_CACHE_PATH), { recursive: true })
    await fs.writeFile(WEEKLY_NEWS_CACHE_PATH, JSON.stringify(payload, null, 2), 'utf8')
  } catch (error) {
    console.warn('[weekly-news] Could not write cache:', error)
  }
}

async function buildWeeklyNewsPayload(): Promise<WeeklyNewsPayload> {
  const sourceResults = await Promise.all(NEWS_SOURCES.map(fetchSource))
  const candidates = deduplicateCandidates(sourceResults.flat())
    .filter(isRelevantCandidate)

  const byDate = [...candidates].sort((a, b) => {
    const dateDifference = dateValue(b.date) - dateValue(a.date)
    return dateDifference || b.score - a.score
  })
  const latestSeeds = selectWithSourceLimit(byDate, 6, 2)
  const latestUrls = new Set(latestSeeds.map((item) => item.href))
  const byRelevance = [...candidates].sort((a, b) => {
    return b.score - a.score || dateValue(b.date) - dateValue(a.date)
  })
  const featuredSeeds = selectWithSourceLimit(byRelevance, 5, 2, latestUrls)
  const hydratedSeeds = await mapWithConcurrency(
    [...latestSeeds, ...featuredSeeds],
    4,
    hydrateArticleMetadata,
  )
  const translated = await mapWithConcurrency(
    hydratedSeeds,
    3,
    translateCandidate,
  )
  const latest = translated.slice(0, latestSeeds.length)
  const random = translated.slice(latestSeeds.length)

  return {
    version: WEEKLY_NEWS_SCHEMA_VERSION,
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

  if (isUsablePayload(cached) && cached?.weekKey === currentWeekKey) {
    return cached
  }

  const payload = await buildWeeklyNewsPayload()
  if (isUsablePayload(payload)) {
    await writeWeeklyNewsCache(payload)
  }
  return payload
}

export async function refreshWeeklyNews() {
  const payload = await buildWeeklyNewsPayload()
  if (isUsablePayload(payload)) {
    await writeWeeklyNewsCache(payload)
  }
  return payload
}
