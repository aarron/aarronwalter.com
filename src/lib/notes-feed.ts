/**
 * Fetches Design Better content from two sources:
 *   1. Substack JSON API — posts authored by Aarron Walter (paginated, full archive)
 *   2. Corpus API (db-corpus.vercel.app) — YouTube videos indexed from @designbetterpod
 *
 * Results are merged and sorted newest-first.
 * Revalidated hourly by the Next.js data cache.
 */

export type NoteType = 'roundup' | 'podcast' | 'post' | 'video' | 'brief'

function decodeEntities(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

export interface Note {
  type:      NoteType
  title:     string
  link:      string
  pubDate:   string      // ISO 8601 string
  excerpt:   string      // plain-text, max ~200 chars
  thumb:     string | null
  audioUrl:  string | null
}

// ── Substack ──────────────────────────────────────────────────────────────────

const SUBSTACK_API  = 'https://designbetterpodcast.com/api/v1/posts'
const AUTHOR        = 'Aarron Walter'
const PAGE_SIZE     = 50

const SKIP_EXACT = new Set(['Upwork'])

function shouldSkip(title: string): boolean {
  if (SKIP_EXACT.has(title)) return true
  const lower = title.toLowerCase()
  return lower.startsWith('ama ') || lower.startsWith('ama:')
}

function classifyType(apiType: string, title: string): NoteType {
  if (apiType === 'podcast') return 'podcast'
  if (title.startsWith('The Roundup:') || title.startsWith('Roundup:')) return 'roundup'
  if (title.startsWith('The Brief:') || title.startsWith('The Brief —')) return 'brief'
  return 'post'
}

interface SubstackByline { name: string }

interface SubstackPost {
  type:                        string
  title:                       string
  subtitle?:                   string
  description?:                string
  truncated_body_text?:        string
  cover_image?:                string | null
  podcast_episode_image_url?:  string | null
  canonical_url:               string
  post_date:                   string
  podcast_url?:                string | null
  publishedBylines?:           SubstackByline[]
}

async function fetchSubstackNotes(): Promise<Note[]> {
  const notes: Note[] = []
  let offset = 0

  while (true) {
    const res = await fetch(`${SUBSTACK_API}?limit=${PAGE_SIZE}&offset=${offset}`, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'aarronwalter.com/1.0 (feed reader)' },
    })
    if (!res.ok) throw new Error(`Substack API failed: ${res.status}`)

    const posts: SubstackPost[] = await res.json()
    if (!posts.length) break

    for (const post of posts) {
      const bylines = post.publishedBylines ?? []
      if (!bylines.some(b => b.name === AUTHOR)) continue

      const title = decodeEntities(post.title ?? '')
      if (shouldSkip(title)) continue

      const type    = classifyType(post.type, title)
      const link    = post.canonical_url ?? ''
      const pubDate = post.post_date ? new Date(post.post_date).toISOString() : post.post_date
      const excerpt = decodeEntities((post.subtitle || post.truncated_body_text || post.description || '').slice(0, 200))
      // Podcast posts: cover_image is the per-episode guest thumbnail (substack-video S3).
      // podcast_episode_image_url is the generic DB square artwork — not useful.
      const thumb   = post.cover_image ?? null
      const audioUrl = post.podcast_url ?? null

      notes.push({ type, title, link, pubDate, excerpt, thumb, audioUrl })
    }

    if (posts.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return notes
}

// ── Corpus / YouTube ──────────────────────────────────────────────────────────

const CORPUS_API = 'https://db-corpus.vercel.app/api/search/recent'

interface CorpusResult {
  contentItemId: string
  title:         string
  url:           string
  type:          string
  publishedAt:   string | null
  imageUrl:      string | null
  excerpt:       string
}

async function fetchCorpus(types: string): Promise<CorpusResult[]> {
  const apiKey = process.env.CORPUS_API_KEY
  if (!apiKey) return []

  const res = await fetch(`${CORPUS_API}?types=${types}&limit=50`, {
    next: { revalidate: 3600 },
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'aarronwalter.com/1.0 (feed reader)',
    },
  })
  if (!res.ok) return []

  const data: { results?: CorpusResult[] } = await res.json()
  return data.results ?? []
}

async function fetchYouTubeVideos(): Promise<Note[]> {
  const results = await fetchCorpus('VIDEO')
  return results.map(item => ({
    type:     'video' as NoteType,
    title:    decodeEntities(item.title),
    link:     item.url,
    pubDate:  item.publishedAt ?? new Date(0).toISOString(),
    excerpt:  decodeEntities(item.excerpt.slice(0, 200)),
    thumb:    item.imageUrl,
    audioUrl: null,
  }))
}

async function fetchBriefPosts(): Promise<Note[]> {
  const results = await fetchCorpus('NEWSLETTER')
  return results
    .filter(item => item.title.startsWith('The Brief:') || item.title.startsWith('The Brief —'))
    .map(item => ({
      type:     'brief' as NoteType,
      title:    decodeEntities(item.title),
      link:     item.url,
      pubDate:  item.publishedAt ?? new Date(0).toISOString(),
      excerpt:  decodeEntities(item.excerpt.slice(0, 200)),
      thumb:    item.imageUrl,
      audioUrl: null,
    }))
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function fetchNotes(): Promise<Note[]> {
  const [substack, videos, brief] = await Promise.all([
    fetchSubstackNotes(),
    fetchYouTubeVideos(),
    fetchBriefPosts(),
  ])

  // Substack is authoritative — deduplicate Corpus entries by URL
  const seenUrls = new Set(substack.map(n => n.link))
  const uniqueBrief = brief.filter(n => !seenUrls.has(n.link))

  // Deduplicate videos by title (Corpus can return the same video under different IDs)
  const seenTitles = new Set<string>()
  const uniqueVideos = videos.filter(n => {
    if (seenTitles.has(n.title)) return false
    seenTitles.add(n.title)
    return true
  })

  return [...substack, ...uniqueVideos, ...uniqueBrief].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )
}
