export interface Episode {
  title: string
  link: string
  audioUrl: string
  imageUrl: string
  duration: string
  pubDate: string
  subtitle: string
}

function extractCDATA(str: string): string {
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

function firstMatch(text: string, pattern: RegExp): string {
  return extractCDATA(text.match(pattern)?.[1] ?? '')
}

function parseEpisode(xml: string): Episode | null {
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/)
  if (!itemMatch) return null
  const item = itemMatch[1]

  const title = firstMatch(item, /<title>([\s\S]*?)<\/title>/)
  const link = firstMatch(item, /<link>([\s\S]*?)<\/link>/)
  const audioUrl = item.match(/enclosure url="([^"]+)"/)?.[1] ?? ''
  const imageUrl = item.match(/<itunes:image href="([^"]+)"/)?.[1] ?? ''
  const duration = firstMatch(item, /<itunes:duration>([\s\S]*?)<\/itunes:duration>/)
  const pubDate = firstMatch(item, /<pubDate>([\s\S]*?)<\/pubDate>/)
  const subtitle = firstMatch(item, /<itunes:subtitle>([\s\S]*?)<\/itunes:subtitle>/)

  if (!title || !audioUrl) return null
  return { title, link, audioUrl, imageUrl, duration, pubDate, subtitle }
}

export async function getLatestEpisode(): Promise<Episode | null> {
  // Abort the fetch after 8 seconds no matter what
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch('https://feeds.megaphone.fm/designbetter', {
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!res.ok || !res.body) {
      clearTimeout(timeoutId)
      return null
    }

    // Read the stream chunk by chunk — stop as soon as we have the first </item>
    // releaseLock() is synchronous and never hangs (unlike reader.cancel())
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let xml = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      xml += decoder.decode(value, { stream: true })
      if (xml.includes('</item>') || xml.length > 100_000) {
        reader.releaseLock() // synchronous — no hang risk
        break
      }
    }

    clearTimeout(timeoutId)
    return parseEpisode(xml)
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

export function formatDuration(seconds: string | number): string {
  const s = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds
  if (isNaN(s)) return seconds.toString()
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}
