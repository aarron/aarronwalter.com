/**
 * Pre-fetches cover + metadata from Discogs for every record in records.ts.
 * Writes results to src/data/record-covers.json.
 *
 * Run with:  npm run fetch-record-covers
 * Re-run whenever you add records to records.ts.
 *
 * Requires DISCOGS_TOKEN in your environment (or .env.local).
 * Authenticated rate limit: 60 req/min → we use a 1100ms delay to stay safe.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
import { records } from '../src/data/records.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/record-covers.json')

// Load .env.local if present
try {
  const envPath = join(__dirname, '../.env.local')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const [k, ...v] = line.split('=')
      if (k && v.length) process.env[k.trim()] = v.join('=').trim()
    }
  }
} catch {}

const TOKEN = process.env.DISCOGS_TOKEN
if (!TOKEN) {
  console.warn('⚠  DISCOGS_TOKEN not set — requests will be unauthenticated (25 req/min limit)')
}

const DELAY_MS  = TOKEN ? 1100 : 2500
const TIMEOUT_MS = 15000

export interface RecordCoverData {
  cover:     string | null
  thumb:     string | null
  genres?:   string[]
  styles?:   string[]
  country?:  string
  tracklist?: { position: string; title: string; duration: string }[]
}

// Load existing cache — only re-fetch missing entries
const existing: Record<string, RecordCoverData> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchRelease(releaseId: number): Promise<RecordCoverData | null> {
  const headers: Record<string, string> = { 'User-Agent': 'AarronWalterSite/1.0' }
  if (TOKEN) headers['Authorization'] = `Discogs token=${TOKEN}`

  try {
    const res = await fetch(`https://api.discogs.com/releases/${releaseId}`, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (res.status === 429) {
      console.warn(`  rate limited — waiting 60s`)
      await sleep(60_000)
      return fetchRelease(releaseId)  // retry
    }
    if (!res.ok) {
      console.warn(`  HTTP ${res.status} for release ${releaseId}`)
      return null
    }
    const data = await res.json() as {
      images?: { uri: string; thumb: string }[]
      thumb?: string
      genres?: string[]
      styles?: string[]
      country?: string
      tracklist?: { position: string; title: string; duration: string }[]
    }
    return {
      cover:     data.images?.[0]?.uri ?? null,
      thumb:     data.images?.[0]?.thumb ?? data.thumb ?? null,
      genres:    data.genres ?? [],
      styles:    data.styles ?? [],
      country:   data.country,
      tracklist: (data.tracklist ?? [])
        .filter(t => t.title)
        .slice(0, 20)
        .map(t => ({ position: t.position ?? '', title: t.title, duration: t.duration ?? '' })),
    }
  } catch (err) {
    console.warn(`  fetch error for ${releaseId}:`, err)
    return null
  }
}

async function main() {
  const out: Record<string, RecordCoverData> = { ...existing }
  const todo = records.filter((r: { releaseId: number | null }) =>
    r.releaseId && !existing[String(r.releaseId)]
  )

  console.log(`${records.length} total records — ${todo.length} to fetch, ${Object.keys(existing).length} cached`)

  for (let i = 0; i < todo.length; i++) {
    const record = todo[i]
    const id = record.releaseId!
    process.stdout.write(`[${i + 1}/${todo.length}] ${record.artist} — ${record.title} ... `)

    const data = await fetchRelease(id)
    if (data) {
      out[String(id)] = data
      console.log(data.cover ? '✓' : '(no cover)')
    } else {
      console.log('✗ skipped')
    }

    writeFileSync(OUT, JSON.stringify(out, null, 2))  // save after each fetch
    if (i < todo.length - 1) await sleep(DELAY_MS)
  }

  const withCovers = Object.values(out).filter(d => d.cover).length
  console.log(`\nDone — ${withCovers}/${Object.keys(out).length} releases have covers`)
  console.log(`Saved to ${OUT}`)
}

main()
