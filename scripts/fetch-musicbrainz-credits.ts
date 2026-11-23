/**
 * Adds performer and production credits from MusicBrainz to each record's
 * details file (public/data/records/{releaseId}.json, field "mbCredits").
 * Discogs credits are often thin (many pressings list only guest players);
 * MusicBrainz records who played what on each track.
 *
 * Run with:  npm run fetch-mb-credits            (records not looked up yet)
 *            npm run fetch-mb-credits -- --all   (look everything up again)
 *
 * Run after fetch-record-covers, which writes the details files.
 * MusicBrainz allows about one request per second; this stays under that.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-ignore
import { records } from '../src/data/records.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = join(__dirname, '../public/data/records')
const covers = JSON.parse(readFileSync(join(__dirname, '../src/data/record-covers.json'), 'utf8'))
const ALL = process.argv.includes('--all')
const API = 'https://musicbrainz.org/ws/2'
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

let last = 0
async function mb(path: string): Promise<any> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const wait = last + 1100 - Date.now()
    if (wait > 0) await sleep(wait)
    last = Date.now()
    const res = await fetch(`${API}${path}${path.includes('?') ? '&' : '?'}fmt=json`, {
      headers: { 'User-Agent': 'RecordCreditsScript/1.0', Accept: 'application/json' },
    })
    if (res.status === 503 || res.status === 429) { await sleep(5000 * (attempt + 1)); continue }
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}`)
    return res.json()
  }
  throw new Error(`GET ${path} -> gave up`)
}

const title = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase())

// MusicBrainz relationship → a Discogs-style role name
function roleOf(rel: any): string | null {
  const attrs: string[] = (rel.attributes ?? []).filter((a: string) => !['additional', 'guest', 'solo', 'co', 'executive', 'assistant'].includes(a))
  const prefix = (rel.attributes ?? []).includes('additional') ? 'Additional ' : ''
  switch (rel.type) {
    case 'instrument': return attrs.length ? attrs.map(title).join(', ') : 'Instruments'
    case 'vocal': return attrs.length ? attrs.map(title).join(', ') : 'Vocals'
    case 'performer': return attrs.length ? attrs.map(title).join(', ') : 'Performer'
    case 'performing orchestra': return 'Orchestra'
    case 'conductor': return 'Conductor'
    case 'producer': return `${prefix}${(rel.attributes ?? []).includes('executive') ? 'Executive ' : ''}Producer`
    case 'engineer': return `${prefix}Engineer`
    case 'audio': return 'Audio Engineer'
    case 'sound': return 'Sound Engineer'
    case 'recording': return 'Recorded By'
    case 'mix': return 'Mixed By'
    case 'mastering': return 'Mastered By'
    case 'remixer': return 'Remixed By'
    case 'arranger': case 'instrument arranger': case 'vocal arranger': case 'orchestrator': return 'Arranged By'
    case 'programming': return 'Programmed By'
    case 'design/illustration': case 'design': case 'illustration': return 'Design'
    case 'photography': return 'Photography By'
    case 'liner notes': return 'Liner Notes'
    case 'art direction': return 'Art Direction'
    default: return null   // publishing, rights, misc. relationships are skipped
  }
}

interface Credit { name: string; role: string; tracks?: string }

function creditsFrom(release: any, discogsPositions: string[]): Credit[] {
  const tracks: any[] = (release.media ?? []).flatMap((m: any) => m.tracks ?? [])
  // Use Discogs positions (A1, B2…) when both tracklists are the same length.
  const pos = (i: number) => (discogsPositions.length === tracks.length ? discogsPositions[i] : tracks[i].number)
  const byKey = new Map<string, { name: string; role: string; tracks: Set<string> }>()
  const add = (rel: any, where: string | null) => {
    if (!rel.artist) return
    const role = roleOf(rel)
    if (!role) return
    const name = rel['target-credit'] || rel.artist.name
    const key = `${name}|${role}`
    if (!byKey.has(key)) byKey.set(key, { name, role, tracks: new Set() })
    if (where) byKey.get(key)!.tracks.add(where)
  }
  for (const rel of release.relations ?? []) add(rel, null)
  tracks.forEach((t, i) => { for (const rel of t.recording?.relations ?? []) add(rel, pos(i)) })
  return [...byKey.values()]
    .sort((a, b) => b.tracks.size - a.tracks.size)
    .map(c => ({
      name: c.name,
      role: c.role,
      // Credits on every track (or the whole release) need no track list.
      ...(c.tracks.size && c.tracks.size < tracks.length ? { tracks: [...c.tracks].join(', ') } : {}),
    }))
}

async function findReleaseGroup(releaseId: number, masterId?: string) {
  if (masterId) {
    const u = await mb(`/url?resource=${encodeURIComponent(`https://www.discogs.com/master/${masterId}`)}&inc=release-group-rels`)
    const rel = u?.relations?.find((r: any) => r.release_group || r['release-group'])
    const rg = rel?.release_group ?? rel?.['release-group']
    if (rg) return { group: rg.id as string, release: null as string | null }
  }
  const u = await mb(`/url?resource=${encodeURIComponent(`https://www.discogs.com/release/${releaseId}`)}&inc=release-rels`)
  const rel = u?.relations?.find((r: any) => r.release)?.release
  if (rel) return { group: null, release: rel.id as string }
  return null
}

async function main() {
  const list = (records as { artist: string; title: string; releaseId: number | null }[]).filter(r => r.releaseId)
  let done = 0, found = 0
  for (const r of list) {
    done++
    const file = join(DIR, `${r.releaseId}.json`)
    if (!existsSync(file)) continue
    const details = JSON.parse(readFileSync(file, 'utf8'))
    if (!ALL && details.mbChecked) continue
    const label = `[${done}/${list.length}] ${r.artist} — ${r.title}`
    try {
      const masterId = details.masterUrl?.split('/').pop()
      const hit = await findReleaseGroup(r.releaseId!, masterId)
      let credits: Credit[] = []
      let mbid: string | null = null
      if (hit) {
        // Candidate releases: the linked one, or official releases in the group, oldest first.
        let candidates: string[] = []
        if (hit.release) candidates = [hit.release]
        else {
          const g = await mb(`/release?release-group=${hit.group}&limit=100`)
          candidates = (g?.releases ?? [])
            .filter((x: any) => x.status === 'Official')
            .sort((a: any, b: any) => (a.date || '9999').localeCompare(b.date || '9999'))
            .map((x: any) => x.id)
            .slice(0, 3)
        }
        const positions: string[] = (covers[String(r.releaseId)]?.tracklist ?? []).map((t: any) => t.position)
        for (const id of candidates) {
          const rel = await mb(`/release/${id}?inc=artist-rels+recordings+recording-level-rels+artist-credits`)
          if (!rel) continue
          const c = creditsFrom(rel, positions)
          if (c.length > credits.length) { credits = c; mbid = id }
          if (credits.length >= 4) break
        }
      }
      details.mbChecked = true
      details.mbCredits = credits
      if (mbid) details.musicbrainzUrl = `https://musicbrainz.org/release/${mbid}`
      writeFileSync(file, JSON.stringify(details))
      if (credits.length) found++
      console.log(`${label}  ${credits.length ? `✓ ${credits.length} credits` : '– none'}`)
    } catch (err) {
      console.log(`${label}  ✗ ${(err as Error).message}`)
    }
  }
  console.log(`\nDone. MusicBrainz credits for ${found} records this run.`)
}

main()
