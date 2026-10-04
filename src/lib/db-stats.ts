/**
 * Design Better audience stats, pulled live from the Corpus API.
 *
 * GET https://db-corpus.vercel.app/api/stats returns content counts plus the
 * current Substack subscriber count (scraped hourly from the publication's
 * "Over X subscribers" splash). Public endpoint, no auth.
 *
 * Revalidated hourly by the Next.js data cache. On any failure we return null
 * so callers can fall back to a hardcoded value.
 */

const STATS_API = 'https://db-corpus.vercel.app/api/stats'

export interface DbStats {
  subscribers: number | null
}

export async function getDesignBetterStats(): Promise<DbStats> {
  try {
    const res = await fetch(STATS_API, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'aarronwalter.com/1.0 (stats)' },
    })
    if (!res.ok) return { subscribers: null }
    const data: { subscribers?: number | null } = await res.json()
    return {
      subscribers: typeof data.subscribers === 'number' ? data.subscribers : null,
    }
  } catch {
    return { subscribers: null }
  }
}
