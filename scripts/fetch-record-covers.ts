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
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
import { records } from '../src/data/records.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/record-covers.json')
// Per-record pressing details and credits, loaded by the Listening modal on demand.
const DETAILS_DIR = join(__dirname, '../public/data/records')
mkdirSync(DETAILS_DIR, { recursive: true })
const detailsPath = (id: number) => join(DETAILS_DIR, `${id}.json`)

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
  // Year the album was first released (from its Discogs master). null when the
  // release has no master; undefined in entries cached before this field existed.
  originalYear?: number | null
  // Where genres and styles came from: the album's Discogs master (preferred,
  // because it describes the album rather than one pressing) or the release.
  genreSource?: 'master' | 'release'
}

interface Credit { name: string; role: string; tracks?: string }

export interface RecordDetails {
  released?: string                     // this pressing's release date, as Discogs formats it
  country?: string
  labels: { name: string; catno: string }[]
  formats: { name: string; qty: string; descriptions: string[]; text?: string }[]
  companies: { name: string; role: string }[]   // pressed by, recorded at, mastered at…
  identifiers: { type: string; value: string; description?: string }[]
  credits: Credit[]                     // album and per-track credits, merged
  notes?: string
  images: { uri: string; width: number; height: number; type: string }[]
  masterUrl?: string
}

// Discogs names carry a numeric suffix to tell apart artists with the same name.
const clean = (name: string) => name.replace(/ \(\d+\)$/, '')

// Discogs notes use link markup such as [r12345], [m678] or [a=Name].
const cleanNotes = (notes?: string) => notes
  ?.replace(/\[(?:a|l|r|m)=([^\]]+)\]/g, '$1')
  .replace(/\[(?:r|m|a|l)\d+\]/g, '(another Discogs entry)')
  .replace(/\[url=[^\]]+\]([^\[]*)\[\/url\]/g, '$1')
  .replace(/\[\/?[bi]\]/g, '')
  .trim() || undefined

function buildDetails(data: any, masterId?: number): RecordDetails {
  const credits: Credit[] = (data.extraartists ?? []).map((c: any) => ({
    name: clean(c.anv || c.name), role: c.role, ...(c.tracks ? { tracks: c.tracks } : {}),
  }))
  for (const t of data.tracklist ?? []) {
    for (const c of t.extraartists ?? []) {
      credits.push({ name: clean(c.anv || c.name), role: c.role, tracks: t.position })
    }
  }
  return {
    released:    data.released_formatted ?? data.released,
    country:     data.country,
    labels:      (data.labels ?? []).map((l: any) => ({ name: clean(l.name), catno: l.catno })),
    formats:     (data.formats ?? []).map((f: any) => ({
      name: f.name, qty: f.qty, descriptions: f.descriptions ?? [], ...(f.text ? { text: f.text } : {}),
    })),
    companies:   (data.companies ?? []).map((c: any) => ({ name: clean(c.name), role: c.entity_type_name })),
    identifiers: (data.identifiers ?? []).map((i: any) => ({
      type: i.type, value: i.value, ...(i.description ? { description: i.description } : {}),
    })),
    credits,
    notes:       cleanNotes(data.notes),
    images:      (data.images ?? []).slice(0, 10).map((i: any) => ({
      uri: i.uri, width: i.width, height: i.height, type: i.type,
    })),
    ...(masterId ? { masterUrl: `https://www.discogs.com/master/${masterId}` } : {}),
  }
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
    const raw = await res.json()
    writeFileSync(detailsPath(releaseId), JSON.stringify(buildDetails(raw, raw.master_id)))
    const data = raw as {
      images?: { uri: string; thumb: string }[]
      thumb?: string
      genres?: string[]
      styles?: string[]
      country?: string
      tracklist?: { position: string; title: string; duration: string }[]
      master_id?: number
      year?: number
    }
    let originalYear: number | null = data.year || null
    let genres = data.genres ?? []
    let styles = data.styles ?? []
    let genreSource: 'master' | 'release' = 'release'
    if (data.master_id) {
      await sleep(DELAY_MS)
      const m = await fetch(`https://api.discogs.com/masters/${data.master_id}`, {
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (m.status === 429) {
        console.warn(`  rate limited — waiting 60s`)
        await sleep(60_000)
        return fetchRelease(releaseId)  // retry
      }
      if (m.ok) {
        const master = await m.json() as { year?: number; genres?: string[]; styles?: string[] }
        if (master.year) originalYear = master.year
        if (master.genres?.length) {
          genres = master.genres
          styles = master.styles ?? []
          genreSource = 'master'
        }
      }
    }
    return {
      cover:     data.images?.[0]?.uri ?? null,
      thumb:     data.images?.[0]?.thumb ?? data.thumb ?? null,
      genres,
      styles,
      country:   data.country,
      tracklist: (data.tracklist ?? [])
        .filter(t => t.title)
        .slice(0, 20)
        .map(t => ({ position: t.position ?? '', title: t.title, duration: t.duration ?? '' })),
      originalYear,
      genreSource,
    }
  } catch (err) {
    console.warn(`  fetch error for ${releaseId}:`, err)
    return null
  }
}

async function main() {
  const out: Record<string, RecordCoverData> = { ...existing }
  const todo = records.filter((r: { releaseId: number | null }) =>
    r.releaseId && (!existing[String(r.releaseId)] || existing[String(r.releaseId)].genreSource === undefined || !existsSync(detailsPath(r.releaseId)))
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
