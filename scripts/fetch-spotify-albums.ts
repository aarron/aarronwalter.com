/**
 * Finds each record in src/data/records.ts on Spotify and saves the album ID,
 * so the Listening modal can embed a Spotify player.
 * Writes src/data/record-spotify.json, keyed by Discogs release ID.
 *
 * Run with:  npm run fetch-spotify             (only records not matched yet)
 *            npm run fetch-spotify -- --all    (re-match everything)
 *
 * Needs a Spotify app (https://developer.spotify.com/dashboard). Put
 * SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment or .env.local.
 *
 * Matches are scored. Anything below the threshold is saved as null and listed
 * at the end for a manual look; set an ID by hand in the JSON to override, and
 * use "manual": true so later runs keep it.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
import { records } from '../src/data/records.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/record-spotify.json')

try {
  const envPath = join(__dirname, '../.env.local')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const [k, ...v] = line.split('=')
      if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join('=').trim()
    }
  }
} catch {}

const ID = process.env.SPOTIFY_CLIENT_ID
const SECRET = process.env.SPOTIFY_CLIENT_SECRET
// A proxy that injects credentials replaces the Authorization header, so
// placeholders are fine there; anywhere else, real values are required.
if ((!ID || !SECRET) && !process.env.SPOTIFY_CREDENTIALS_VIA_PROXY) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment or .env.local.')
  process.exit(1)
}

export interface SpotifyMatch {
  albumId: string
  name: string
  artist: string
  year: string
  score: number
  manual?: boolean
  /** [Spotify track ID, track name] in album order, for per-track play buttons. */
  tracks?: [string, string][]
}

const ALL = process.argv.includes('--all')
const THRESHOLD = 0.72
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const existing: Record<string, SpotifyMatch | null> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}

let token = ''
async function getToken() {
  const basic = Buffer.from(`${ID ?? 'proxy'}:${SECRET ?? 'proxy'}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`Spotify token request failed: HTTP ${res.status} ${await res.text()}`)
  token = (await res.json()).access_token
}

async function api(path: string): Promise<any> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.status === 401) { await getToken(); continue }
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') ?? 5)
      if (wait > 300) throw new Error(`Spotify rate limit: try again in about ${Math.ceil(wait / 3600)} hours (progress is saved)`)
      console.warn(`  rate limited, waiting ${wait}s`)
      await sleep(wait * 1000 + 500)
      continue
    }
    if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}`)
    return res.json()
  }
  throw new Error(`GET ${path} -> gave up`)
}

// ── Matching ──

const norm = (s: string) => s
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\(.*?\)|\[.*?\]/g, ' ')                       // (Remastered), [Deluxe]…
  .replace(/\b(remaster(ed)?|deluxe|edition|expanded|mono|stereo|version|anniversary|\d{4})\b/g, ' ')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\b(the|a|an)\b/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const tokens = (s: string) => new Set(norm(s).split(' ').filter(Boolean))

function similarity(a: string, b: string) {
  const na = norm(a), nb = norm(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.85
  const ta = tokens(a), tb = tokens(b)
  const shared = [...ta].filter(t => tb.has(t)).length
  return (2 * shared) / (ta.size + tb.size)
}

// "Miles Davis And Milt Jackson" → "Miles Davis"; "Various" → ''
function leadArtist(artist: string) {
  if (/^various$/i.test(artist)) return ''
  return artist
    .split(/\s+(?:&|and|with|featuring|feat\.?|•|\/|,)\s+|,\s*|\s+•\s+|\s+\/\s+/i)[0]
    .replace(/\s+(trio|quartet|quintet|sextet|orchestra|and his orchestra|big band)$/i, '')
    .replace(/^the\s+/i, '')
    .trim()
}

function score(record: { artist: string; title: string }, album: any) {
  const t = similarity(record.title, album.name)
  const lead = leadArtist(record.artist)
  const artistNames: string[] = album.artists.map((a: any) => a.name)
  const a = lead
    ? Math.max(...artistNames.map(n => similarity(lead, n)), similarity(record.artist, artistNames.join(' ')))
    : (artistNames.some(n => /various/i.test(n)) ? 1 : 0.5)
  const typeBonus = album.album_type === 'album' || album.album_type === 'compilation' ? 0 : -0.1
  // Prefer the plain album over deluxe, live or anniversary editions unless the record is one.
  const extras = /deluxe|super|expanded|anniversary|live|bonus|collector|edition|sessions/i
  const editionPenalty = extras.test(album.name) && !extras.test(record.title) ? -0.04 : 0
  return 0.6 * t + 0.4 * a + typeBonus + editionPenalty
}

async function find(record: { artist: string; title: string }) {
  const lead = leadArtist(record.artist)
  const title = record.title.replace(/\(.*?\)/g, '').trim()
  const queries = [
    lead ? `album:${title} artist:${lead}` : `album:${title}`,
    `${title} ${lead}`.trim(),
  ]
  let best: { album: any; score: number } | null = null
  for (const q of queries) {
    const data = await api(`/search?type=album&limit=10&market=US&q=${encodeURIComponent(q)}`)
    for (const album of data.albums?.items ?? []) {
      if (!album) continue
      const s = score(record, album)
      if (!best || s > best.score) best = { album, score: s }
    }
    if (best && best.score >= 0.95) break
    await sleep(150)
  }
  return best
}

// One small file per record with its Spotify track IDs, loaded by the modal on demand.
function writeTrackFiles(out: Record<string, SpotifyMatch | null>) {
  const dir = join(__dirname, '../public/data/spotify')
  mkdirSync(dir, { recursive: true })
  for (const f of readdirSync(dir)) rmSync(join(dir, f))
  for (const [id, m] of Object.entries(out)) {
    if (m?.tracks?.length) writeFileSync(join(dir, `${id}.json`), JSON.stringify(m.tracks))
  }
}

async function main() {
  await getToken()
  const out: Record<string, SpotifyMatch | null> = { ...existing }
  const todo = (records as { artist: string; title: string; releaseId: number | null }[]).filter(r =>
    r.releaseId && (ALL ? !existing[r.releaseId]?.manual : !(String(r.releaseId) in existing))
  )
  console.log(`${todo.length} records to match`)
  const weak: string[] = []

  for (let i = 0; i < todo.length; i++) {
    const r = todo[i]
    const best = await find(r)
    const id = String(r.releaseId)
    if (best && best.score >= THRESHOLD) {
      out[id] = {
        albumId: best.album.id,
        name: best.album.name,
        artist: best.album.artists.map((a: any) => a.name).join(', '),
        year: (best.album.release_date ?? '').slice(0, 4),
        score: Math.round(best.score * 100) / 100,
      }
      console.log(`[${i + 1}/${todo.length}] ✓ ${r.artist} — ${r.title}  →  ${out[id]!.artist} — ${out[id]!.name} (${out[id]!.score})`)
    } else {
      out[id] = null
      const guess = best ? `${best.album.artists.map((a: any) => a.name).join(', ')} — ${best.album.name} (${best.score.toFixed(2)}) ${best.album.id}` : 'nothing'
      weak.push(`${r.releaseId}  ${r.artist} — ${r.title}   best guess: ${guess}`)
      console.log(`[${i + 1}/${todo.length}] ✗ ${r.artist} — ${r.title}  (best: ${guess})`)
    }
    writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n')
    await sleep(250)
  }

  // Track IDs for every matched album, so the modal can play individual tracks.
  const needTracks = Object.entries(out).filter(([, m]) => m && !m.tracks)
  console.log(`\nFetching tracks for ${needTracks.length} albums`)
  for (const [id, m] of needTracks) {
    const tracks: [string, string][] = []
    let path: string | null = `/albums/${m!.albumId}/tracks?limit=50&market=US`
    while (path) {
      const data = await api(path)
      for (const t of data.items ?? []) if (t) tracks.push([t.id, t.name])
      path = data.next ? data.next.replace('https://api.spotify.com/v1', '') : null
    }
    out[id] = { ...m!, tracks }
    writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n')
    await sleep(150)
  }

  writeTrackFiles(out)
  const matched = Object.values(out).filter(Boolean).length
  console.log(`\n${matched}/${Object.keys(out).length} matched. Saved to ${OUT}`)
  if (weak.length) console.log(`\nNo confident match (check by hand):\n${weak.join('\n')}`)
}

main().catch(err => {
  console.error(err.message)
  if (existsSync(OUT)) writeTrackFiles(JSON.parse(readFileSync(OUT, 'utf8')))
  process.exit(1)
})
